import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors, radii } from "../theme/tokens";
import { Message } from "../types/chat";

interface MessageBubbleProps {
  message: Message;
  onSpeak?: (text: string) => void;
  style?: ViewStyle;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSpeak,
  style,
}) => {
  const isUser = message.sender === "user";

  return (
    <View
      style={[
        styles.wrapper,
        isUser ? styles.userWrapper : styles.auraWrapper,
        style,
      ]}
    >
      {!isUser && (
        <View style={styles.auraAvatar}>
          <View style={styles.avatarCore} />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.auraBubble,
        ]}
      >
        {/* Memory citation tag if present */}
        {!isUser && message.memoryReferences && message.memoryReferences.length > 0 && (
          <View style={styles.citationBadge}>
            <Text style={styles.citationText}>
              ✺ {message.memoryReferences.join(" · ")}
            </Text>
          </View>
        )}

        <Text style={[styles.messageText, isUser ? styles.userText : styles.auraText]}>
          {message.text}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          {!isUser && onSpeak && (
            <TouchableOpacity
              onPress={() => onSpeak(message.text)}
              style={styles.speakBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.speakText}>🔊</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userWrapper: {
    justifyContent: "flex-end",
  },
  auraWrapper: {
    justifyContent: "flex-start",
  },
  auraAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 4,
  },
  avatarCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  userBubble: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  auraBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  citationBadge: {
    backgroundColor: colors.surface2,
    borderRadius: radii.xs,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  citationText: {
    color: colors.accent2,
    fontSize: 10.5,
    fontWeight: "600",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: colors.accentContrast,
    fontWeight: "500",
  },
  auraText: {
    color: colors.text1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 8,
  },
  timestamp: {
    color: colors.text3,
    fontSize: 10,
  },
  speakBtn: {
    paddingHorizontal: 2,
  },
  speakText: {
    fontSize: 12,
  },
});
