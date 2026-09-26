import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { colors, radii } from "../theme/tokens";
import { Header } from "../components/Header";
import { GlassCard } from "../components/GlassCard";
import { AuraButton } from "../components/AuraButton";
import { useStudyStore } from "../stores/studyStore";
import { DocumentSummary } from "../types/study";

export const PdfSummarizerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { documents, addDocument } = useStudyStore();
  const [selectedDoc, setSelectedDoc] = useState<DocumentSummary | null>(
    documents[0] || null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUploadSimulate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newDoc: Omit<DocumentSummary, "id" | "uploadedAt"> = {
        fileName: "Cryptography_EllipticCurves.pdf",
        fileSizeMb: 3.5,
        totalPages: 28,
        status: "ready",
        summary:
          "This document covers Public Key Cryptography fundamentals, Diffie-Hellman Key Exchange over prime fields, and Elliptic Curve Discrete Logarithm Problem (ECDLP) providing 256-bit security comparable to RSA 3072-bit.",
        keySections: [
          {
            title: "Diffie-Hellman Key Exchange",
            pages: "p.4–8",
            snippet: "Shared secret key derivation via g^(ab) mod p without transmitting private keys.",
          },
          {
            title: "Elliptic Curve Group Law",
            pages: "p.12–19",
            snippet: "Point addition on y^2 = x^3 + ax + b over finite field F_p forming abelian group.",
          },
        ],
      };
      addDocument(newDoc);
      setIsProcessing(false);
      setSelectedDoc({
        ...newDoc,
        id: `doc-${Date.now()}`,
        uploadedAt: Date.now(),
      });
    }, 1800);
  };

  return (
    <View style={styles.container}>
      <Header
        title="PDF Knowledge Summarizer"
        subtitle="Safe Chunked Ingestion & Fast Q&A"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Upload Dropzone / Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleUploadSimulate}
          disabled={isProcessing}
          style={styles.uploadZone}
        >
          {isProcessing ? (
            <View style={styles.uploadingBox}>
              <ActivityIndicator color={colors.accent} size="large" />
              <Text style={styles.uploadingTitle}>Extracting PDF Text & Chunking...</Text>
              <Text style={styles.uploadingSubtitle}>
                Safely parsing document headers and summarizing with AI
              </Text>
            </View>
          ) : (
            <View style={styles.uploadBox}>
              <Text style={styles.uploadIcon}>📄</Text>
              <Text style={styles.uploadTitle}>Tap to Ingest New PDF</Text>
              <Text style={styles.uploadSubtitle}>
                Supports textbooks, research papers, and lecture slides
              </Text>
              <View style={styles.safeBadge}>
                <Text style={styles.safeBadgeText}>🛡 Safe Chunking Enabled</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Selected Document Summary Card */}
        {selectedDoc && (
          <GlassCard style={styles.docCard}>
            <View style={styles.docHeader}>
              <View style={styles.pdfBadge}>
                <Text style={styles.pdfBadgeText}>PDF</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.docTitle}>{selectedDoc.fileName}</Text>
                <Text style={styles.docMeta}>
                  {selectedDoc.totalPages} Pages · {selectedDoc.fileSizeMb} MB · Indexed
                </Text>
              </View>
              <View style={styles.readyPill}>
                <Text style={styles.readyText}>● Ready</Text>
              </View>
            </View>

            {/* AI Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryHeading}>EXECUTIVE SUMMARY</Text>
              <Text style={styles.summaryText}>{selectedDoc.summary}</Text>
            </View>

            {/* Key Sections & Page References */}
            <Text style={styles.sectionsHeading}>KEY SECTIONS & CITATIONS</Text>
            {selectedDoc.keySections.map((sec, idx) => (
              <View key={idx} style={styles.sectionItem}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>{sec.title}</Text>
                  <Text style={styles.sectionPages}>{sec.pages}</Text>
                </View>
                <Text style={styles.sectionSnippet}>"{sec.snippet}"</Text>
              </View>
            ))}

            <AuraButton
              title="💬 Ask AURA Questions About This PDF"
              variant="primary"
              onPress={() => navigation.navigate("Chat")}
              style={{ marginTop: 14 }}
            />
          </GlassCard>
        )}

        {/* Document Library */}
        <Text style={styles.listHeading}>KNOWLEDGE LIBRARY ({documents.length})</Text>
        {documents.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            activeOpacity={0.8}
            onPress={() => setSelectedDoc(doc)}
            style={[
              styles.libItem,
              selectedDoc?.id === doc.id && styles.libItemActive,
            ]}
          >
            <View style={styles.libIcon}>
              <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 11 }}>
                PDF
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.libTitle}>{doc.fileName}</Text>
              <Text style={styles.libMeta}>
                {doc.totalPages} pages · {doc.fileSizeMb}MB
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  uploadZone: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: radii.md,
    padding: 22,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadBox: {
    alignItems: "center",
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadTitle: {
    color: colors.text1,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  uploadSubtitle: {
    color: colors.text3,
    fontSize: 12,
    textAlign: "center",
    maxWidth: 260,
    marginBottom: 10,
  },
  safeBadge: {
    backgroundColor: colors.surface2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  safeBadgeText: {
    color: colors.success,
    fontSize: 10.5,
    fontWeight: "600",
  },
  uploadingBox: {
    alignItems: "center",
    paddingVertical: 12,
  },
  uploadingTitle: {
    color: colors.text1,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
  uploadingSubtitle: {
    color: colors.text3,
    fontSize: 12,
    marginTop: 4,
  },
  docCard: {
    padding: 16,
    marginBottom: 24,
  },
  docHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  pdfBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.xs,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  pdfBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  docTitle: {
    color: colors.text1,
    fontSize: 15,
    fontWeight: "600",
  },
  docMeta: {
    color: colors.text3,
    fontSize: 11.5,
    marginTop: 2,
  },
  readyPill: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  readyText: {
    color: colors.success,
    fontSize: 10.5,
    fontWeight: "600",
  },
  summaryContainer: {
    backgroundColor: colors.surface2,
    borderRadius: radii.sm,
    padding: 12,
    marginBottom: 14,
  },
  summaryHeading: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },
  summaryText: {
    color: colors.text2,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionsHeading: {
    color: colors.text3,
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionItem: {
    backgroundColor: colors.surface2,
    borderRadius: radii.sm,
    padding: 10,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.text1,
    fontSize: 12.5,
    fontWeight: "600",
  },
  sectionPages: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "600",
  },
  sectionSnippet: {
    color: colors.text3,
    fontSize: 11.5,
    fontStyle: "italic",
  },
  listHeading: {
    color: colors.text3,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  libItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  libItemActive: {
    borderColor: colors.accent,
  },
  libIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.xs,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  libTitle: {
    color: colors.text1,
    fontSize: 13,
    fontWeight: "600",
  },
  libMeta: {
    color: colors.text3,
    fontSize: 11,
    marginTop: 2,
  },
  chevron: {
    color: colors.text3,
    fontSize: 20,
    marginLeft: 6,
  },
});
