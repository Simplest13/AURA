import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing as s, radii } from "../theme/spacing";
import { useLayout } from "../theme/responsive";
import { Header } from "../components/Header";
import { VoiceWaveform } from "../components/VoiceWaveform";
import { AuraButton } from "../components/AuraButton";
import { Icon } from "../components/Icon";
import { SerifText, MonoLabel } from "../components/Typography";
import { useStudyStore } from "../stores/studyStore";
import { LectureNote } from "../types/study";
import {
  transcribeAudioBlob,
  generateLectureNotes,
  getTranscriptionStatus,
} from "../services/ai/TranscriptionService";
import { MarkdownText } from "../utils/markdown";
import { USE_MOCK_AI } from "../config/env";

type Phase = "idle" | "recording" | "uploading" | "transcribing" | "generating" | "saving";

interface WebRecorder {
  stop: () => Promise<Blob>;
}

function useMicLevel(active: boolean) {
  const [level, setLevel] = useState(0);
  const rafRef = useRef<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!active || Platform.OS !== "web") {
      setLevel(0);
      return;
    }
    let stream: MediaStream | null = null;
    let cancelled = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) return;
        const ctx = new AudioContext();
        ctxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          setLevel(Math.min(1, rms * 3));
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // permission issues handled by the recorder itself
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
      ctxRef.current?.close().catch(() => {});
      setLevel(0);
    };
  }, [active]);

  return level;
}

export const LectureRecorderScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth, gutter } = useLayout();
  const { lectures, addLecture } = useStudyStore();

  const [phase, setPhase] = useState<Phase>("idle");
  const [duration, setDuration] = useState(0);
  const [selectedLecture, setSelectedLecture] = useState<LectureNote | null>(null);
  const [stageDetail, setStageDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sttProvider, setSttProvider] = useState<string>("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recorderRef = useRef<WebRecorder | null>(null);
  const durationRef = useRef(0);

  const micLevel = useMicLevel(phase === "recording");
  const isProcessing =
    phase === "uploading" || phase === "transcribing" || phase === "generating" || phase === "saving";

  useEffect(() => {
    if (USE_MOCK_AI) return;
    void getTranscriptionStatus().then((s) => {
      if (s) setSttProvider(s.provider);
    });
  }, []);

  useEffect(() => {
    if (lectures.length && !selectedLecture) setSelectedLecture(lectures[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "recording") {
      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const startWebRecording = async (): Promise<void> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    let bytesReceived = 0;
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
        bytesReceived += e.data.size;
      }
    };

    const stopped = new Promise<Blob>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (bytesReceived === 0) {
          reject(new Error("No audio data was captured by the microphone."));
        } else {
          resolve(new Blob(chunks, { type: mediaRecorder.mimeType || "audio/webm" }));
        }
      };
      mediaRecorder.onerror = () => {
        stream.getTracks().forEach((t) => t.stop());
        reject(new Error("The browser recorder failed mid-recording. Try again."));
      };
    });

    mediaRecorder.start(1000);
    recorderRef.current = {
      stop: async () => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
        return stopped;
      },
    };
  };

  const handleStartRecording = async () => {
    setError(null);
    setDuration(0);
    durationRef.current = 0;
    try {
      if (!USE_MOCK_AI && Platform.OS === "web") {
        await startWebRecording();
      }
      setPhase("recording");
    } catch (err: any) {
      setError(
        err?.name === "NotAllowedError"
          ? "Microphone permission denied. Allow mic access and try again."
          : `Could not start recording: ${err?.message ?? err}`
      );
    }
  };

  const handleStopRecording = async () => {
    const recordedSeconds = durationRef.current;
    setPhase("uploading");
    setError(null);
    setStageDetail("Collecting audio…");

    try {
      let transcript: string;
      let summary: string;
      let keyTakeaways: string[];
      let notes: string;
      let title: string;

      if (USE_MOCK_AI) {
        setPhase("transcribing");
        await new Promise((r) => setTimeout(r, 1200));
        transcript =
          "Today we reviewed time complexity analysis and binary search versus linear search. Binary search achieves O(log n) efficiency by halving the search space in each step, which requires an ordered collection.";
        setPhase("generating");
        setStageDetail("Writing notes…");
        await new Promise((r) => setTimeout(r, 1200));
        summary =
          "Covered algorithm complexity, binary search logarithmic scaling, prerequisite of sorted arrays, and comparisons against linear search.";
        keyTakeaways = [
          "Binary search requires sorted arrays.",
          "Time complexity is O(log n) vs O(n) for linear search.",
          "Space complexity is O(1) iteratively.",
        ];
        notes = "## Key Concepts\n- **Binary search**: repeatedly halve a sorted range to find a target in O(log n).\n- **Linear search**: scan every element — O(n), but works on unsorted data.\n## Definitions\n- **Time complexity**: how runtime grows with input size.\n## Examples\n- Searching a 1,000,000-element array takes ~20 comparisons with binary search vs 1,000,000 worst-case with linear search.";
        title = "Binary Search & Complexity";
      } else {
        const blob = await recorderRef.current?.stop();
        recorderRef.current = null;

        if (!blob || blob.size === 0) {
          throw new Error(
            "No audio was captured. Check mic permissions and try recording for a few seconds."
          );
        }

        setPhase("transcribing");
        setStageDetail(
          `Uploading ${(blob.size / 1024).toFixed(0)} KB to ${sttProvider || "speech-to-text"}…`
        );
        const result = await transcribeAudioBlob(blob);
        transcript = result.transcript;

        setPhase("generating");
        setStageDetail("Writing notes & summary…");
        const ai = await generateLectureNotes(transcript);
        summary = ai.summary;
        keyTakeaways = ai.keyTakeaways;
        notes = ai.notes;
        title = ai.title;
      }

      setPhase("saving");
      setStageDetail("Saving…");
      const saved = await addLecture({
        title,
        subject: USE_MOCK_AI ? "Demo lecture" : sttProvider || "Recorded lecture",
        durationSeconds: recordedSeconds,
        transcript,
        summary,
        keyTakeaways,
        notes,
      });
      setSelectedLecture(saved);
      setPhase("idle");
    } catch (err: any) {
      setError(err?.message ?? "Processing failed. Check the backend and try again.");
      setPhase("idle");
    } finally {
      setStageDetail("");
    }
  };

  const handleCancel = () => {
    recorderRef.current?.stop().catch(() => {});
    recorderRef.current = null;
    setPhase("idle");
    setDuration(0);
    durationRef.current = 0;
  };

  const handlePlay = () => {
    if (!selectedLecture || Platform.OS !== "web") return;
    if (isPlaying) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(selectedLecture.transcript.slice(0, 800));
    utter.onend = () => setIsPlaying(false);
    window.speechSynthesis?.speak(utter);
    setIsPlaying(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const phaseLabel =
    phase === "recording"
      ? "RECORDING"
      : phase === "uploading"
      ? "PREPARING"
      : phase === "transcribing"
      ? "TRANSCRIBING"
      : phase === "generating"
      ? "WRITING NOTES"
      : phase === "saving"
      ? "SAVING"
      : "READY";

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, width: "100%", alignSelf: "center" }}>
        <Header
          title="Lectures"
          subtitle={sttProvider ? `Transcription: ${sttProvider}` : "Recordings & notes"}
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
        {/* Recorder — flat editorial block */}
        <View style={styles.recorderBlock}>
          <View style={styles.recorderStatusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: phase === "recording" ? colors.coral : colors.borderLight },
                phase === "recording" && { opacity: micLevel * 0.6 + 0.4 },
              ]}
            />
            <MonoLabel color={phase === "recording" ? colors.coral : colors.textMuted}>
              {phaseLabel}
            </MonoLabel>
            <Text style={styles.timer}>{formatTime(duration)}</Text>
          </View>

          {phase === "recording" && (
            <>
              <VoiceWaveform
                isActive={true}
                barColor={colors.coral}
                style={{ marginVertical: 12 }}
              />
              <View style={styles.levelTrack}>
                <View style={[styles.levelFill, { width: `${Math.round(micLevel * 100)}%` }]} />
              </View>
            </>
          )}

          {isProcessing && (
            <Text style={styles.processingText}>{stageDetail || "Working…"}</Text>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Icon name="alert-circle" size={13} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => void handleStartRecording()}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.recordControls}>
            {phase === "idle" && (
              <AuraButton
                title="Start recording"
                onPress={() => void handleStartRecording()}
                variant="primary"
                size="lg"
                style={styles.actionBtn}
              />
            )}
            {phase === "recording" && (
              <>
                <AuraButton
                  title="Stop and save notes"
                  onPress={() => void handleStopRecording()}
                  variant="danger"
                  size="lg"
                  style={styles.actionBtn}
                />
                <AuraButton
                  title="Cancel"
                  onPress={handleCancel}
                  variant="ghost"
                  size="sm"
                  style={{ marginTop: 6 }}
                />
              </>
            )}
          </View>
        </View>

        {/* Selected lecture */}
        {selectedLecture && (
          <View style={styles.detailSection}>
            <MonoLabel color={colors.textDim}>
              {selectedLecture.subject.toUpperCase()} ·{" "}
              {new Date(selectedLecture.createdAt).toLocaleDateString([], {
                day: "2-digit",
                month: "short",
              })}{" "}
              · {formatTime(selectedLecture.durationSeconds)}
            </MonoLabel>

            <View style={styles.detailTitleRow}>
              <SerifText size={24} style={{ flex: 1 }}>
                {selectedLecture.title}
              </SerifText>
              <TouchableOpacity
                onPress={handlePlay}
                style={[styles.playBtn, isPlaying && styles.playBtnActive]}
              >
                <Icon name={isPlaying ? "pause" : "play"} size={12} color={colors.ink} />
                <Text style={styles.playBtnText}>{isPlaying ? "Stop" : "Play"}</Text>
              </TouchableOpacity>
            </View>

            {selectedLecture.summary ? (
              <>
                <MonoLabel color={colors.textDim} style={{ marginTop: s.xl }}>
                  SUMMARY
                </MonoLabel>
                <Text style={styles.summaryBody}>{selectedLecture.summary}</Text>
              </>
            ) : null}

            {selectedLecture.keyTakeaways.length > 0 && (
              <>
                <MonoLabel color={colors.textDim} style={{ marginTop: s.xl }}>
                  KEY POINTS
                </MonoLabel>
                {selectedLecture.keyTakeaways.map((item, idx) => (
                  <View key={idx} style={styles.takeawayRow}>
                    <Text style={styles.takeawayNumeral}>
                      {String(idx + 1).padStart(2, "0")}
                    </Text>
                    <Text style={styles.takeawayText}>{item}</Text>
                  </View>
                ))}
              </>
            )}

            {selectedLecture.notes ? (
              <>
                <MonoLabel color={colors.textDim} style={{ marginTop: s.xl }}>
                  NOTES
                </MonoLabel>
                <View style={styles.notesBox}>
                  <MarkdownText content={selectedLecture.notes} baseFontSize={13.5} />
                </View>
              </>
            ) : null}

            <MonoLabel color={colors.textDim} style={{ marginTop: s.xl }}>
              TRANSCRIPT
            </MonoLabel>
            <Text style={styles.transcriptBody}>{selectedLecture.transcript}</Text>
          </View>
        )}

        {/* Library */}
        {lectures.length > 0 && (
          <>
            <MonoLabel color={colors.textDim} style={{ marginTop: s.xxl }}>
              LIBRARY ({String(lectures.length).padStart(2, "0")})
            </MonoLabel>
            {lectures.map((lec) => (
              <TouchableOpacity
                key={lec.id}
                activeOpacity={0.8}
                onPress={() => setSelectedLecture(lec)}
                style={styles.libraryRow}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.libraryTitle} numberOfLines={1}>
                    {lec.title}
                  </Text>
                  <Text style={styles.libraryMeta}>
                    {lec.subject} · {formatTime(lec.durationSeconds)}
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
  recorderBlock: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: s.lg,
    backgroundColor: colors.surfaceElevated,
  },
  recorderStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timer: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: "auto",
    fontVariant: ["tabular-nums"],
  },
  levelTrack: {
    height: 3,
    backgroundColor: colors.surface,
    borderRadius: 1.5,
    overflow: "hidden",
    marginTop: 4,
  },
  levelFill: {
    height: "100%",
    backgroundColor: colors.coral,
  },
  processingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 12,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radii.sm,
    padding: 12,
    marginTop: s.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 12.5,
    flex: 1,
  },
  retryText: {
    color: colors.ink,
    fontSize: 12.5,
    fontWeight: "600",
  },
  recordControls: {
    marginTop: s.lg,
  },
  actionBtn: {
    width: "100%",
  },
  detailSection: {
    marginTop: s.xxl,
  },
  detailTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: s.sm,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.sm,
  },
  playBtnActive: {
    backgroundColor: colors.accentSoft,
  },
  playBtnText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "600",
  },
  summaryBody: {
    color: colors.textMuted,
    fontSize: 14.5,
    lineHeight: 22,
    marginTop: s.sm,
  },
  takeawayRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  takeawayNumeral: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
    marginTop: 1,
  },
  takeawayText: {
    color: colors.ink,
    fontSize: 14.5,
    lineHeight: 20,
    flex: 1,
  },
  notesBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: s.md,
    marginTop: s.sm,
  },
  transcriptBody: {
    color: colors.textDim,
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: s.sm,
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
