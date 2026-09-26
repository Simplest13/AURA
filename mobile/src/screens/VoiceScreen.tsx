import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors, radii } from "../theme/tokens";
import { AuraOrb } from "../components/AuraOrb";
import { VoiceWaveform } from "../components/VoiceWaveform";
import { AuraButton } from "../components/AuraButton";
import { GlassCard } from "../components/GlassCard";
import { StatusIndicator } from "../components/StatusIndicator";
import { Header } from "../components/Header";
import { useVoiceStore } from "../stores/voiceStore";
import { useDeviceStore } from "../stores/deviceStore";
import { ConnectionState } from "../types/device";
import { VoiceServiceImplementation } from "../services/ai/VoiceService";

export const VoiceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    state: voiceState,
    liveTranscript,
    aiResponse,
    errorMessage,
    reset,
  } = useVoiceStore();

  const {
    connectionState,
    batteryLevel,
    simulateButtonPress,
    onWearableButtonPress,
  } = useDeviceStore();

  const [voiceService] = useState(() => new VoiceServiceImplementation());

  // Subscribe to wearable button press events
  useEffect(() => {
    const unsubscribe = onWearableButtonPress(() => {
      handleStartListening("Wearable button pressed");
    });
    return () => unsubscribe();
  }, [voiceService]);

  const handleStartListening = async (triggerSource = "User tap") => {
    if (voiceState !== "idle") {
      voiceService.stopListening();
      return;
    }
    await voiceService.startListening();
  };

  const handleStop = () => {
    voiceService.stopListening();
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
        return "ERROR";
      default:
        return "READY (IDLE)";
    }
  };

  return (
    <View style={styles.screenContainer}>
      <Header
        title="Voice Cockpit"
        subtitle="Real-time Wearable AI Pipeline"
        onDeviceBadgePress={() => navigation.navigate("Device")}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate("Device")}
            style={styles.headerAction}
          >
            <Text style={styles.headerActionText}>Wearable ⚙</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Connection & Microphone Status Bar */}
        <View style={styles.statusRow}>
          <StatusIndicator
            label={`Wearable: ${connectionState === ConnectionState.CONNECTED ? `${batteryLevel}%` : "Offline"}`}
            status={connectionState === ConnectionState.CONNECTED ? "success" : "warning"}
          />
          <StatusIndicator
            label={`Mic: ${voiceState === "listening" ? "Active" : "Standby"}`}
            status={voiceState === "listening" ? "accent" : "success"}
          />
        </View>

        {/* State Label */}
        <View style={styles.stateTag}>
          <Text style={styles.stateTagText}>{getStateLabel()}</Text>
        </View>

        {/* Central Glowing Aura Orb */}
        <View style={styles.orbContainer}>
          <AuraOrb state={voiceState} size={180} />
          {voiceState === "listening" || voiceState === "speaking" ? (
            <VoiceWaveform
              isActive={true}
              barColor={voiceState === "listening" ? colors.glow : colors.cyan}
              style={styles.waveform}
            />
          ) : (
            <View style={{ height: 48 }} />
          )}
        </View>

        {/* Dynamic Transcript & AI Response Card */}
        <GlassCard style={styles.transcriptCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.speakerLabel}>YOU</Text>
            {voiceState === "listening" && (
              <Text style={styles.liveIndicator}>● LIVE</Text>
            )}
          </View>
          <Text style={styles.transcriptText}>
            {liveTranscript || '"What is the difference between TCP and UDP?"'}
          </Text>

          <View style={styles.divider} />

          <View style={styles.cardHeader}>
            <Text style={styles.speakerLabel}>AURA</Text>
            {voiceState === "speaking" && (
              <Text style={[styles.liveIndicator, { color: colors.cyan }]}>
                ● SPEAKING
              </Text>
            )}
          </View>
          <Text style={styles.aiResponseText}>
            {aiResponse ||
              'Press "Start Listening" or simulate a Wearable Button Press to begin.'}
          </Text>
        </GlassCard>

        {/* Error message card if present */}
        {errorMessage && (
          <GlassCard style={styles.errorCard} variant="bordered">
            <Text style={styles.errorText}>⚠ {errorMessage}</Text>
          </GlassCard>
        )}

        {/* Voice Control Buttons */}
        <View style={styles.controlsRow}>
          {voiceState === "idle" ? (
            <AuraButton
              title="◉ Start Listening"
              variant="primary"
              size="lg"
              onPress={() => handleStartListening()}
              style={styles.primaryVoiceBtn}
            />
          ) : (
            <AuraButton
              title="✕ Stop / Reset"
              variant="danger"
              size="lg"
              onPress={handleStop}
              style={styles.primaryVoiceBtn}
            />
          )}

          <AuraButton
            title="⚡ Wearable Press"
            variant="secondary"
            size="lg"
            onPress={simulateButtonPress}
            style={styles.simulateBtn}
          />
        </View>

        {/* Simulated Prompt Presets for Testing */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsLabel}>TEST DEMO QUERIES:</Text>
          <View style={styles.presetButtons}>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => voiceService.simulateQuery("What is the difference between TCP and UDP?")}
            >
              <Text style={styles.presetText}>TCP vs UDP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => voiceService.simulateQuery("Explain entropy and the second law of thermodynamics.")}
            >
              <Text style={styles.presetText}>Entropy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => voiceService.simulateQuery("How does binary search work?")}
            >
              <Text style={styles.presetText}>Binary Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => voiceService.simulateQuery("What is machine learning?")}
            >
              <Text style={styles.presetText}>Machine Learning</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: "center",
  },
  headerAction: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.surface2,
    borderRadius: radii.sm,
  },
  headerActionText: {
    color: colors.text2,
    fontSize: 12,
  },
  statusRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  stateTag: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radii.full,
    marginBottom: 20,
  },
  stateTagText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  orbContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  waveform: {
    marginTop: 10,
  },
  transcriptCard: {
    width: "100%",
    padding: 18,
    marginVertical: 16,
    backgroundColor: colors.surface2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  speakerLabel: {
    color: colors.text3,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  liveIndicator: {
    color: colors.glow,
    fontSize: 11,
    fontWeight: "700",
  },
  transcriptText: {
    color: colors.text1,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginVertical: 10,
  },
  aiResponseText: {
    color: colors.text2,
    fontSize: 14.5,
    lineHeight: 22,
  },
  errorCard: {
    width: "100%",
    borderColor: colors.error,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 20,
  },
  primaryVoiceBtn: {
    flex: 3,
  },
  simulateBtn: {
    flex: 2,
    borderColor: colors.accent,
  },
  presetsSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  presetsLabel: {
    color: colors.text3,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  presetButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  presetChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  presetText: {
    color: colors.text2,
    fontSize: 12,
    fontWeight: "500",
  },
});
