/**
 * ConversationCard — flat conversation row: title, snippet, meta.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { Icon } from "./Icon";
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
      style={[styles.row, style]}
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {conversation.title}
        </Text>
        <Text style={styles.snippet} numberOfLines={1}>
          {snippet}
        </Text>
      </View>

      <View style={styles.metaCol}>
        <Text style={styles.meta}>
          {new Date(conversation.updatedAt).toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>

      <Icon name="chevron-right" size={16} color={colors.textDim} />

      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteBtn}
        >
          <Icon name="x" size={14} color={colors.textDim} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  snippet: {
    color: colors.textDim,
    fontSize: 12.5,
    marginTop: 2,
  },
  metaCol: {
    alignItems: "flex-end",
    marginRight: 6,
  },
  meta: {
    color: colors.textDim,
    fontSize: 11,
  },
  deleteBtn: {
    padding: 6,
  },
});
