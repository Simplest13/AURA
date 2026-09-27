/**
 * ChatScreen — editorial conversation.
 * Mono masthead, hairline rules, typography-first messages, a flat input bar
 * with a small circular send control.
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing as s, radii } from "../theme/spacing";
import { useLayout } from "../theme/responsive";
import { MessageBubble } from "../components/MessageBubble";
import { Icon } from "../components/Icon";
import { MonoLabel } from "../components/Typography";
import { useChatStore } from "../stores/chatStore";
import { USE_MOCK_AI } from "../config/env";

export const ChatScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDesktop, isSmallPhone, contentMaxWidth } = useLayout();
  const insets = useSafeAreaInsets();
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    deleteConversation,
    sendMessage,
    isSending,
    backendOffline,
  } = useChatStore();

  const [inputText, setInputText] = useState("");
  const [showThreadModal, setShowThreadModal] = useState(false);
  const scrollRef = useRef<any>(null);

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, [activeConv?.messages.length, isSending]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    const textToSend = inputText.trim();
    setInputText("");
    await sendMessage(textToSend);
  };

  const handleNewChat = () => {
    const newId = createConversation();
    setActiveConversation(newId);
    setShowThreadModal(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Masthead */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {activeConv?.title || "Chat"}
          </Text>
          <MonoLabel>
            {!USE_MOCK_AI && !backendOffline
              ? "CONNECTED"
              : USE_MOCK_AI
              ? "DEMO MODE"
              : "OFFLINE"}
          </MonoLabel>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowThreadModal(true)}
            style={styles.headerBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="list" size={19} color={colors.ink} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNewChat}
            style={styles.headerBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="plus" size={19} color={colors.ink} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesScroll}
        contentContainerStyle={[
          styles.messagesList,
          {
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            paddingHorizontal: isSmallPhone ? 20 : 24,
          },
        ]}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {activeConv?.messages?.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onSpeak={(text) => {
              import("../services/speech/WebSpeechService").then(({ speakText }) =>
                speakText(text)
              );
            }}
          />
        ))}

        {isSending && (
          <View style={styles.typingRow}>
            <Text style={styles.typingLabel}>AURA</Text>
            <Text style={styles.typingText}>thinking…</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick prompts on a fresh thread */}
      {(activeConv?.messages?.length ?? 0) <= 1 && !isSending && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.promptSuggestions,
            { maxWidth: contentMaxWidth, alignSelf: "center" },
          ]}
        >
          {[
            "Explain binary search",
            "TCP vs UDP",
            "What should I study today?",
            "Summarize the OSI model",
          ].map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.suggestionPill}
              onPress={() => setInputText(prompt)}
            >
              <Text style={styles.suggestionText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          {
            maxWidth: contentMaxWidth,
            paddingHorizontal: isSmallPhone ? 16 : 20,
            paddingBottom: Math.max(insets.bottom, isDesktop ? 16 : 12) + 62,
          },
        ]}
      >
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask AURA"
          placeholderTextColor={colors.textDim}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
        />

        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
        >
          <Icon name="arrow-up" size={16} color={colors.paper} />
        </TouchableOpacity>
      </View>

      {/* Threads modal */}
      <Modal
        visible={showThreadModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThreadModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThreadModal(false)}
        >
          <View style={[styles.modalCard, { maxWidth: isDesktop ? 460 : 340 }]}>
            <View style={styles.modalHeaderRow}>
              <MonoLabel color={colors.ink}>CONVERSATIONS</MonoLabel>
              <TouchableOpacity onPress={handleNewChat}>
                <Text style={styles.modalNewBtn}>New</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {conversations.map((c) => {
                const isActive = c.id === activeConversationId;
                return (
                  <View key={c.id} style={styles.drawerItem}>
                    <TouchableOpacity
                      style={styles.drawerItemTouch}
                      onPress={() => {
                        setActiveConversation(c.id);
                        setShowThreadModal(false);
                      }}
                    >
                      <Text
                        style={[styles.drawerItemText, isActive && styles.drawerItemTextActive]}
                        numberOfLines={1}
                      >
                        {c.title}
                      </Text>
                      <Text style={styles.drawerItemMeta}>
                        {c.messages.length} {c.messages.length === 1 ? "message" : "messages"}
                      </Text>
                    </TouchableOpacity>

                    {conversations.length > 1 && (
                      <TouchableOpacity
                        onPress={() => deleteConversation(c.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.drawerDeleteBtn}
                      >
                        <Icon name="x" size={13} color={colors.textDim} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },
  headerBtn: {
    padding: 8,
    borderRadius: radii.sm,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: s.lg,
    width: "100%",
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 10,
  },
  typingLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.4,
    fontFamily: "Menlo",
  },
  typingText: {
    color: colors.textDim,
    fontSize: 12.5,
  },
  promptSuggestions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 8,
  },
  suggestionPill: {
    backgroundColor: "transparent",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionText: {
    color: colors.textMuted,
    fontSize: 12.5,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: "100%",
    alignSelf: "center",
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 13,
    paddingTop: 10,
    paddingBottom: 10,
    color: colors.ink,
    fontSize: 15,
    maxHeight: 110,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.25,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sheet,
    padding: 16,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalNewBtn: {
    color: colors.blue,
    fontSize: 13.5,
    fontWeight: "600",
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  drawerItemTouch: {
    flex: 1,
  },
  drawerItemText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  drawerItemTextActive: {
    color: colors.ink,
    fontWeight: "600",
  },
  drawerItemMeta: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 1,
  },
  drawerDeleteBtn: {
    padding: 6,
    marginLeft: 8,
  },
});
