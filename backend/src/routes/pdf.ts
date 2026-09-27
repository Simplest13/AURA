// src/routes/pdf.ts
import { Router } from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import { authenticate, AuthenticatedRequest } from "../middleware/authenticate";
import { db } from "../database/repository";
import { getAIResponse } from "../services/ai";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Accept PDFs up to 15MB, kept in memory for text extraction
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are supported"));
    }
  },
});

/** Trim extracted text down to a token budget the LLM can handle */
function chunkForSummary(content: string, maxChars = 24000): string {
  if (content.length <= maxChars) return content;
  const head = content.slice(0, Math.floor(maxChars * 0.7));
  const tail = content.slice(-Math.floor(maxChars * 0.3));
  return `${head}\n\n[...middle of document truncated...]\n\n${tail}`;
}

// Upload a real PDF: extract text, ask the AI for a structured summary
router.post("/documents", authenticate, upload.single("pdf"), async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded (field name must be 'pdf')" });
    }

    const parser = new PDFParse({ data: new Uint8Array(req.file.buffer) });
    const parsed = await parser.getText();
    const content: string = parsed.text || "";
    const totalPages = parsed.total || parsed.pages?.length || 0;
    await parser.destroy();

    if (!content.trim()) {
      return res.status(400).json({ error: "Could not extract any text from this PDF (it may be scanned images only)" });
    }

    const fileName = req.file.originalname || "document.pdf";
    const fileSizeMb = Number((req.file.size / (1024 * 1024)).toFixed(2));

    // AI-generated executive summary
    let summary = "";
    try {
      summary = await getAIResponse(
        userId,
        `Summarize the following document content in 4-6 sentences, highlighting the main topics covered:\n\n${chunkForSummary(content)}`
      );
    } catch {
      summary = content.slice(0, 300) + (content.length > 300 ? "..." : "");
    }

    // Auto-derive key sections from chapter/section headings found in the text
    const keySections: { title: string; pages: string; snippet: string }[] = [];
    const headingRegex = /^(?:Chapter|Section|CHAPTER|SECTION)\s+([\dIVX]+)[:.]*\s*(.{0,80})$/gm;
    let match: RegExpExecArray | null;
    while ((match = headingRegex.exec(content)) !== null && keySections.length < 5) {
      const title = `${match[1] ? `Chapter ${match[1]}: ` : ""}${match[2]}`.trim() || `Chapter ${match[1]}`;
      keySections.push({ title, pages: "", snippet: content.slice(match.index + match[0].length, match.index + match[0].length + 140).replace(/\s+/g, " ").trim() });
    }

    const doc = await db.createDocument({
      id: uuidv4(),
      userId,
      name: fileName,
      content,
      summary,
      keySections,
      totalPages,
      fileSizeMb,
    });

    res.status(201).json({
      id: doc.id,
      fileName,
      fileSizeMb,
      totalPages,
      status: "ready",
      summary,
      keySections,
    });
  } catch (err: any) {
    console.error("PDF upload error:", err);
    res.status(err.status || 500).json({ error: err.message || "Failed to process PDF" });
  }
});

// List uploaded documents (metadata only, no full content)
router.get("/documents", authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  try {
    const docs = await db.getDocuments(userId);
    res.json(
      (docs as any[]).map((d) => ({
        id: d.id,
        fileName: d.name,
        totalPages: d.totalPages ?? null,
        fileSizeMb: d.fileSizeMb ?? null,
        summary: d.summary ?? "",
        keySections: d.keySections ?? [],
        uploadedAt: d.created_at ?? Date.now(),
      }))
    );
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

// Ask AI questions grounded in a specific uploaded document
router.post("/ask", authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  const { documentId, question } = req.body;
  if (!documentId || !question) {
    return res.status(400).json({ error: "documentId and question are required" });
  }
  try {
    const docs = (await db.getDocuments(userId)) as any[];
    const doc = docs.find((d) => d.id === documentId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const prompt = `You are answering questions about a document the student uploaded. Use ONLY the document content below. If the answer is not in the document, say so.\n\nDOCUMENT: ${doc.name}\n\nCONTENT:\n${chunkForSummary(doc.content, 20000)}\n\nQUESTION: ${question}`;
    const answer = await getAIResponse(userId, prompt);
    res.json({ answer });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "AI request failed" });
  }
});

export default router;
