import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing as s, radii } from "../theme/spacing";
import { useLayout } from "../theme/responsive";
import { Header } from "../components/Header";
import { Icon } from "../components/Icon";
import { AuraButton } from "../components/AuraButton";
import { SerifText, MonoLabel } from "../components/Typography";
import { useStudyStore } from "../stores/studyStore";
import { DocumentSummary } from "../types/study";
import { ApiClient } from "../services/api/ApiClient";

export const PdfSummarizerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth, gutter } = useLayout();
  const { documents, addDocument } = useStudyStore();
  const [selectedDoc, setSelectedDoc] = useState<DocumentSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    if (!selectedDoc && documents.length) {
      setSelectedDoc(documents[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents]);

  const pickAndUpload = async () => {
    if (Platform.OS !== "web") {
      setError("PDF upload is supported on web in this build.");
      return;
    }
    setError(null);
    setAnswer(null);
    setIsProcessing(true);

    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/pdf";
      input.style.display = "none";
      document.body.appendChild(input);

      const file: File | null = await new Promise((resolve) => {
        input.onchange = () => resolve(input.files?.[0] ?? null);
        input.click();
      });
      input.remove();

      if (!file) {
        setIsProcessing(false);
        return;
      }

      await ApiClient.ensureSession();
      const form = new FormData();
      form.append("pdf", file, file.name);

      const res = await ApiClient.post<{
        id: string;
        fileName: string;
        fileSizeMb: number;
        totalPages: number;
        summary: string;
        keySections: { title: string; pages: string; snippet: string }[];
      }>("/api/pdf/documents", form, 120000);

      const saved = await addDocument({
        fileName: res.fileName ?? file.name,
        fileSizeMb: res.fileSizeMb ?? Number((file.size / 1048576).toFixed(2)),
        totalPages: res.totalPages ?? 0,
        status: "ready",
        summary: res.summary ?? "",
        keySections: res.keySections ?? [],
      });
      setSelectedDoc(saved);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed. Is the backend running?");
    } finally {
      setIsProcessing(false);
    }
  };

  const askDocument = async () => {
    if (!question.trim() || !selectedDoc) return;
    setIsAsking(true);
    setAnswer(null);
    try {
      await ApiClient.ensureSession();
      const res = await ApiClient.post<{ answer: string }>("/api/pdf/ask", {
        documentId: selectedDoc.id,
        question: question.trim(),
      });
      setAnswer(res.answer);
    } catch (err: any) {
      setAnswer(
        `Could not answer from this document (${
          selectedDoc.id.startsWith("doc-") ? "demo document without source text" : err?.message
        }). Try uploading a PDF first.`
      );
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, width: "100%", alignSelf: "center" }}>
        <Header
          title="Documents"
          subtitle="Import, summarize, ask"
          showBack={true}
          onBack={() => navigation.goBack()}
          showDeviceBadge={false}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: gutter,
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            paddingBottom: 110 + insets.bottom,
          },
        ]}
      >
        {/* Import zone — editorial plus */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => void pickAndUpload()}
          disabled={isProcessing}
          style={styles.importZone}
        >
          {isProcessing ? (
            <View style={{ alignItems: "center" }}>
              <ActivityIndicator color={colors.ink} />
              <MonoLabel color={colors.textMuted} style={{ marginTop: 12 }}>
                EXTRACTING TEXT…
              </MonoLabel>
            </View>
          ) : (
            <>
              <View style={styles.plusCircle}>
                <Icon name="plus" size={20} color={colors.ink} />
              </View>
              <Text style={styles.importTitle}>Import a document</Text>
              <MonoLabel color={colors.textDim}>SELECT PDF · UP TO 15 MB</MonoLabel>
            </>
          )}
        </TouchableOpacity>

        {error && (
          <View style={styles.errorBox}>
            <Icon name="alert-circle" size={13} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Selected document */}
        {selectedDoc && (
          <View style={styles.docSection}>
            <MonoLabel color={colors.textDim}>
              {selectedDoc.totalPages || "?"} PAGES
              {selectedDoc.fileSizeMb ? ` · ${selectedDoc.fileSizeMb} MB` : ""}
            </MonoLabel>
            <SerifText size={24} style={styles.docTitle}>
              {selectedDoc.fileName.replace(/\.pdf$/i, "")}
            </SerifText>

            {selectedDoc.summary ? (
              <>
                <MonoLabel color={colors.textDim} style={{ marginTop: s.xl }}>
                  SUMMARY
                </MonoLabel>
                <Text style={styles.summaryBody}>{selectedDoc.summary}</Text>
              </>
            ) : null}

            {selectedDoc.keySections.length > 0 && (
              <>
                <MonoLabel color={colors.textDim} style={{ marginTop: s.xl }}>
                  KEY POINTS
                </MonoLabel>
                {selectedDoc.keySections.map((sec, idx) => (
                  <View key={idx} style={styles.keyRow}>
                    <Text style={styles.keyNumeral}>{String(idx + 1).padStart(2, "0")}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.keyTitle} numberOfLines={1}>
                        {sec.title}
                      </Text>
                      {sec.snippet ? (
                        <Text style={styles.keySnippet} numberOfLines={2}>
                          {sec.snippet}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Grounded Q&A */}
            <MonoLabel color={colors.textDim} style={{ marginTop: s.xl }}>
              ASK ABOUT THIS DOCUMENT
            </MonoLabel>
            <View style={styles.qaRow}>
              <TextInput
                style={styles.qaInput}
                value={question}
                onChangeText={setQuestion}
                placeholder="Type a question…"
                placeholderTextColor={colors.textDim}
                onSubmitEditing={() => void askDocument()}
                returnKeyType="send"
              />
              <AuraButton
                title="Ask"
                variant="secondary"
                size="sm"
                loading={isAsking}
                onPress={() => void askDocument()}
              />
            </View>
            {answer && (
              <View style={styles.answerBox}>
                <Text style={styles.answerText}>{answer}</Text>
              </View>
            )}
          </View>
        )}

        {/* Recent */}
        {documents.length > 0 && (
          <>
            <MonoLabel color={colors.textDim} style={{ marginTop: s.xxl }}>
              RECENT ({String(documents.length).padStart(2, "0")})
            </MonoLabel>
            {documents.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedDoc(doc);
                  setAnswer(null);
                  setQuestion("");
                }}
                style={styles.libraryRow}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.libraryTitle} numberOfLines={1}>
                    {doc.fileName}
                  </Text>
                  <Text style={styles.libraryMeta}>
                    {new Date(doc.uploadedAt).toLocaleDateString([], {
                      day: "2-digit",
                      month: "short",
                    })}
                  </Text>
                </View>
                <Icon name="chevron-right" size={15} color={colors.textDim} />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: s.xl,
  },
  importZone: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radii.sm,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: s.xl,
  },
  plusCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  importTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radii.sm,
    padding: 12,
    marginBottom: s.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: 12.5,
    flex: 1,
  },
  docSection: {
    marginBottom: s.sm,
  },
  docTitle: {
    marginTop: s.sm,
    lineHeight: 30,
  },
  summaryBody: {
    color: colors.textMuted,
    fontSize: 14.5,
    lineHeight: 22,
    marginTop: s.sm,
  },
  keyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  keyNumeral: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
    marginTop: 1,
  },
  keyTitle: {
    color: colors.ink,
    fontSize: 14.5,
    fontWeight: "500",
  },
  keySnippet: {
    color: colors.textDim,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
  },
  qaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: s.md,
  },
  qaInput: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 14.5,
  },
  answerBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 12,
    marginTop: 10,
  },
  answerText: {
    color: colors.textMuted,
    fontSize: 13.5,
    lineHeight: 20,
  },
  libraryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  libraryTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "500",
  },
  libraryMeta: {
    color: colors.textDim,
    fontSize: 12.5,
    marginTop: 2,
  },
});
