import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors, radii } from "../theme/tokens";
import { Header } from "../components/Header";
import { AuraOrb } from "../components/AuraOrb";
import { VoiceWaveform } from "../components/VoiceWaveform";
import { AuraButton } from "../components/AuraButton";
import { GlassCard } from "../components/GlassCard";
import { useStudyStore } from "../stores/studyStore";
import { LectureNote } from "../types/study";

export const LectureRecorderScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { lectures, addLecture } = useStudyStore();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedLecture, setSelectedLecture] = useState<LectureNote | null>(
    lectures[0] || null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartRecording = () => {
    setDuration(0);
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);

    // Simulate STT + Summarization pipeline
    setTimeout(() => {
      const newLec: Omit<LectureNote, "id" | "createdAt"> = {
        title: `Lecture Session ${new Date().toLocaleDateString()}`,
        subject: "Computer Science",
        durationSeconds: duration || 45,
        transcript:
          "Today we reviewed time complexity analysis and binary search versus linear search. Binary search achieves O(log n) efficiency by halving the search space in each step, which requires an ordered collection.",
        summary:
          "Summary: Covered algorithm complexity, binary search logarithmic scaling, prerequisite of sorted arrays, and comparisons against linear search.",
        keyTakeaways: [
          "Binary search requires sorted arrays.",
          "Time complexity is O(log n) vs O(n) for linear search.",
          "Space complexity is O(1) iteratively, O(log n) recursively.",
        ],
      };

      addLecture(newLec);
      setIsProcessing(false);
      setSelectedLecture({
        ...newLec,
        id: `lec-${Date.now()}`,
        createdAt: Date.now(),
      });
    }, 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Lecture Recorder"
        subtitle="Capture, Transcribe & Summarize Audio"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Live Recording Cockpit */}
        <GlassCard style={styles.recordingCard} variant="surface2">
          <AuraOrb state={isRecording ? "listening" : "idle"} size={110} />

          <Text style={styles.timerText}>{formatTime(duration)}</Text>
          <Text style={styles.recordingStatus}>
            {isRecording
              ? "● RECORDING LIVE LECTURE"
              : isProcessing
              ? "PROCESSING WITH AI..."
              : "MICROPHONE READY"}
          </Text>

          {isRecording && <VoiceWaveform isActive={true} style={{ marginVertical: 10 }} />}

          <View style={styles.recordControls}>
            {!isRecording ? (
              <AuraButton
                title="🎙 Start Recording"
                onPress={handleStartRecording}
                variant="primary"
                size="lg"
                disabled={isProcessing}
                style={styles.actionBtn}
              />
            ) : (
              <AuraButton
                title="⏹ Stop & Transcribe"
                onPress={handleStopRecording}
                variant="danger"
                size="lg"
                style={styles.actionBtn}
              />
            )}
          </View>
        </GlassCard>

        {/* Selected Lecture Details / Transcription View */}
        {selectedLecture && (
          <GlassCard style={styles.lectureDetailCard}>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.lectureTitle}>{selectedLecture.title}</Text>
                <Text style={styles.lectureMeta}>
                  {selectedLecture.subject} · {formatTime(selectedLecture.durationSeconds)} · Recorded
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsPlaying(!isPlaying)}
                style={[styles.playBtn, isPlaying && styles.playBtnActive]}
              >
                <Text style={styles.playBtnText}>{isPlaying ? "⏸" : "▶ Play"}</Text>
              </TouchableOpacity>
            </View>

            {/* AI Summary Box */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryTitleRow}>
                <View style={styles.aiDot} />
                <Text style={styles.summaryHeading}>AURA AI SUMMARY</Text>
              </View>
              <Text style={styles.summaryBody}>{selectedLecture.summary}</Text>

              <Text style={styles.takeawayHeading}>Key Takeaways:</Text>
              {selectedLecture.keyTakeaways.map((item, idx) => (
                <Text key={idx} style={styles.takeawayItem}>
                  • {item}
                </Text>
              ))}
            </View>

            {/* Full Transcript */}
            <Text style={styles.transcriptHeading}>TRANSCRIPT</Text>
            <Text style={styles.transcriptBody}>{selectedLecture.transcript}</Text>
          </GlassCard>
        )}

        {/* Past Lectures List */}
        <Text style={styles.sectionHeading}>SAVED LECTURES ({lectures.length})</Text>
        {lectures.map((lec) => (
          <TouchableOpacity
            key={lec.id}
            activeOpacity={0.8}
            onPress={() => setSelectedLecture(lec)}
            style={[
              styles.historyItem,
              selectedLecture?.id === lec.id && styles.historyItemActive,
            ]}
          >
            <View style={styles.historyIcon}>
              <Text>🎙</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyTitle}>{lec.title}</Text>
              <Text style={styles.historyMeta}>
                {lec.subject} · {formatTime(lec.durationSeconds)}
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
  recordingCard: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 20,
  },
  timerText: {
    color: colors.text1,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 12,
  },
  recordingStatus: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 6,
    marginBottom: 12,
  },
  recordControls: {
    width: "100%",
    maxWidth: 240,
    marginTop: 8,
  },
  actionBtn: {
    width: "100%",
  },
  lectureDetailCard: {
    padding: 16,
    marginBottom: 24,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  lectureTitle: {
    color: colors.text1,
    fontSize: 16,
    fontWeight: "600",
  },
  lectureMeta: {
    color: colors.text3,
    fontSize: 12,
    marginTop: 2,
  },
  playBtn: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  playBtnActive: {
    backgroundColor: colors.cyanSoft,
    borderColor: colors.cyan,
  },
  playBtnText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  summaryBox: {
    backgroundColor: colors.surface2,
    borderRadius: radii.sm,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  summaryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  aiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  summaryHeading: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  summaryBody: {
    color: colors.text2,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  takeawayHeading: {
    color: colors.text1,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 4,
  },
  takeawayItem: {
    color: colors.text2,
    fontSize: 12,
    lineHeight: 17,
  },
  transcriptHeading: {
    color: colors.text3,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },
  transcriptBody: {
    color: colors.text2,
    fontSize: 12.5,
    lineHeight: 18,
  },
  sectionHeading: {
    color: colors.text3,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  historyItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  historyItemActive: {
    borderColor: colors.accent,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.xs,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  historyTitle: {
    color: colors.text1,
    fontSize: 13,
    fontWeight: "600",
  },
  historyMeta: {
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
