/**
 * MessageBubble — editorial message block.
 * Mono sender labels, generous spacing, hairline rules between turns. The
 * user's line sits in a flat paper block; AURA's is open text on the canvas.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { radii } from "../theme/spacing";
import { Icon } from "./Icon";
import { Message } from "../types/chat";
import { MarkdownText } from "../utils/markdown";
import { useLayout } from "../theme/responsive";

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
  const { isDesktop, isTablet } = useLayout();
  const isUser = message.sender === "user";
  const maxWidth = isDesktop ? "74%" : isTablet ? "80%" : "90%";

  return (
    <View style={[styles.wrapper, isUser && styles.userWrapper, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.senderLabel}>{isUser ? "YOU" : "AURA"}</Text>
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      <View style={[styles.body, { maxWidth }]}>
        {isUser ? (
          <View style={styles.userBody}>
            <Text style={styles.userText}>{message.text}</Text>
          </View>
        ) : (
          <MarkdownText content={message.text} baseFontSize={14.5} />
        )}

        {!isUser && onSpeak && (
          <TouchableOpacity
            onPress={() => onSpeak(message.text)}
            style={styles.speakBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="volume-2" size={13} color={colors.textDim} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 14,
  },
  userWrapper: {
    alignItems: "flex-end",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  senderLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.4,
    fontFamily: "Menlo",
  },
  timestamp: {
    color: colors.textDim,
    fontSize: 10,
    opacity: 0.7,
  },
  body: {
    flexGrow: 0,
  },
  userBody: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  userText: {
    color: colors.ink,
    fontSize: 14.5,
    lineHeight: 21,
  },
  speakBtn: {
    paddingVertical: 4,
  },
});
