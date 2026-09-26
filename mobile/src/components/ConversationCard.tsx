import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors, radii } from "../theme/tokens";
import { Conversation } from "../types/chat";

interface ConversationCardProps {
  conversation: Conversation;
  onPress: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  onPress,
  onDelete,
  style,
}) => {
  const lastMsg = conversation.messages[conversation.messages.length - 1];
  const snippet = lastMsg ? lastMsg.text : "No messages yet";

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <View style={styles.content}>
        <View style={styles.titleRow}>
          {conversation.isPinned && <Text style={styles.pinnedIcon}>📌 </Text>}
          <Text style={styles.title} numberOfLines={1}>
            {conversation.title}
          </Text>
        </View>
        <Text style={styles.snippet} numberOfLines={1}>
          {snippet}
        </Text>
        <Text style={styles.meta}>
          {conversation.messages.length} messages ·{" "}
          {new Date(conversation.updatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteBtn}
        >
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  pinnedIcon: {
    fontSize: 12,
  },
  title: {
    color: colors.text1,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  snippet: {
    color: colors.text2,
    fontSize: 12,
    marginBottom: 6,
  },
  meta: {
    color: colors.text3,
    fontSize: 11,
  },
  deleteBtn: {
    padding: 6,
  },
  deleteText: {
    color: colors.text3,
    fontSize: 14,
  },
});
