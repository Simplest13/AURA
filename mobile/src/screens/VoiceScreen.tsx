/**
 * VoiceScreen — the most editorial surface.
 * Vast whitespace, one small orb, serif for the spoken query, mono labels,
 * a single control. Motion only where it communicates voice state.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing as s } from "../theme/spacing";
import { useLayout } from "../theme/responsive";
import { AuraOrb } from "../components/AuraOrb";
import { AuraButton } from "../components/AuraButton";
import { Icon } from "../components/Icon";
import { SerifText, MonoLabel } from "../components/Typography";
import { MarkdownText } from "../utils/markdown";
import { useVoiceStore } from "../stores/voiceStore";
import { useDeviceStore } from "../stores/deviceStore";
import { VoiceServiceImplementation } from "../services/ai/VoiceService";
import { isWebSpeechSupported } from "../services/speech/WebSpeechService";

export const VoiceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth, gutter } = useLayout();
  const {
    state: voiceState,
    liveTranscript,
    aiResponse,
    errorMessage,
    reset,
  } = useVoiceStore();

  const { simulateButtonPress } = useDeviceStore();
  const [voiceService] = useState(() => new VoiceServiceImplementation());
  const [isBusy, setIsBusy] = useState(false);

  React.useEffect(() => {
    const unsubscribe = useDeviceStore
      .getState()
      .onWearableButtonPress(() => {
        void handleStartListening();
      });
    return () => unsubscribe();
  }, [voiceService]);

  const handleStartListening = async () => {
    if (voiceState !== "idle" && voiceState !== "error") {
      await voiceService.stopSpeaking();
      return;
    }
    setIsBusy(true);
    try {
      await voiceService.startListening();
    } finally {
      setIsBusy(false);
    }
  };

  const handleStop = () => {
    voiceService.stopSpeaking();
    reset();
  };

  const getStateLabel = () => {
    switch (voiceState) {
      case "listening":
        return "LISTENING";
      case "thinking":
        return "THINKING";
      case "speaking":
        return "SPEAKING";
      case "error":
        return "SOMETHING WENT WRONG";
      default:
        return "READY";
    }
  };

  const sttSupported = isWebSpeechSupported();

  return (
    <View style={styles.screen}>
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
        {/* Head */}
        <View style={styles.headRow}>
          <MonoLabel color={colors.ink}>VOICE</MonoLabel>
          <TouchableOpacity
            onPress={() => {
              simulateButtonPress();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MonoLabel color={colors.textDim}>DEVICE PRESS →</MonoLabel>
          </TouchableOpacity>
        </View>

        {/* Orb */}
        <View style={styles.orbSection}>
          <AuraOrb state={voiceState === "idle" ? "idle" : voiceState} size={96} />
          <MonoLabel color={colors.textMuted} style={{ marginTop: 20 }}>
            {getStateLabel()}
          </MonoLabel>
        </View>

        {/* Transcript — serif for the human, markdown for AURA */}
        <View style={styles.transcriptSection}>
          {liveTranscript ? (
            <>
              <MonoLabel color={colors.textDim}>YOU</MonoLabel>
              <SerifText size={22} italic style={styles.queryText}>
                "{liveTranscript}"
              </SerifText>
            </>
          ) : null}

          {aiResponse ? (
            <>
              <View style={styles.divider} />
              <MonoLabel color={colors.textDim}>AURA</MonoLabel>
              <MarkdownText content={aiResponse} baseFontSize={14} />
            </>
          ) : null}

          {!liveTranscript && !aiResponse && (
            <SerifText size={19} italic color={colors.textDim} style={styles.placeholder}>
              {sttSupported
                ? "Ask, and AURA listens."
                : "Voice input needs Chrome or Edge — try a query below."}
            </SerifText>
          )}
        </View>

        {errorMessage && (
          <View style={styles.errorBox}>
            <Icon name="alert-circle" size={13} color={colors.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Control */}
        <View style={styles.controls}>
          {voiceState === "idle" || voiceState === "error" ? (
            <AuraButton
              title={isBusy ? "Starting…" : "Start listening"}
              variant="primary"
              size="lg"
              onPress={() => void handleStartListening()}
              disabled={isBusy}
              style={styles.primaryBtn}
            />
          ) : (
            <AuraButton
              title="Stop"
              variant="secondary"
              size="lg"
              onPress={handleStop}
              style={styles.primaryBtn}
            />
          )}
        </View>

        {/* Test queries */}
        <View style={styles.presetsSection}>
          <MonoLabel color={colors.textDim}>TRY ASKING</MonoLabel>
          <View style={styles.presetRow}>
            {[
              { label: "TCP vs UDP", q: "What is the difference between TCP and UDP?" },
              { label: "Entropy", q: "Explain entropy and the second law of thermodynamics." },
              { label: "Binary search", q: "How does binary search work?" },
              { label: "Machine learning", q: "What is machine learning?" },
            ].map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={styles.presetChip}
                disabled={voiceState === "thinking" || voiceState === "speaking"}
                onPress={() => void voiceService.simulateQuery(preset.q)}
              >
                <Text style={styles.presetText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: s.xl,
  },
  headRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orbSection: {
    alignItems: "center",
    paddingVertical: s.vast,
  },
  transcriptSection: {
    minHeight: 140,
  },
  queryText: {
    marginTop: 8,
    lineHeight: 30,
  },
  placeholder: {
    lineHeight: 30,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: s.xl,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
    padding: 12,
    marginTop: s.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: 12.5,
    flex: 1,
  },
  controls: {
    marginTop: s.xxl,
  },
  primaryBtn: {
    width: "100%",
  },
  presetsSection: {
    marginTop: s.huge,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: s.md,
  },
  presetChip: {
    backgroundColor: "transparent",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  presetText: {
    color: colors.textMuted,
    fontSize: 12.5,
  },
});
