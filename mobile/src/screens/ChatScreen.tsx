import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, radii } from "../theme/tokens";
import { MessageBubble } from "../components/MessageBubble";
import { Header } from "../components/Header";
import { useChatStore } from "../stores/chatStore";
import { USE_MOCK_AI } from "../config/env";

export const ChatScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    deleteConversation,
    sendMessage,
    isSending,
  } = useChatStore();

  const [inputText, setInputText] = useState("");
  const [showThreadDrawer, setShowThreadDrawer] = useState(false);
  const scrollRef = useRef<any>(null);

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText("");
    await sendMessage(textToSend);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleNewChat = () => {
    const newId = createConversation();
    setActiveConversation(newId);
    setShowThreadDrawer(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Header
        title={activeConv?.title || "AURA Chat"}
        subtitle={`${activeConv?.messages?.length || 0} messages`}
        onDeviceBadgePress={() => navigation.navigate("Device")}
        rightAction={
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => setShowThreadDrawer(!showThreadDrawer)}
              style={styles.headerBtn}
            >
              <Text style={styles.headerBtnText}>☰ Threads</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNewChat}
              style={[styles.headerBtn, styles.newChatBtn]}
            >
              <Text style={styles.newChatText}>+ New</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Threads Drawer / Dropdown */}
      {showThreadDrawer && (
        <View style={styles.drawer}>
          <Text style={styles.drawerHeader}>ALL CONVERSATIONS</Text>
          <ScrollView style={styles.drawerScroll}>
            {conversations.map((c) => {
              const isActive = c.id === activeConversationId;
              return (
                <View
                  key={c.id}
                  style={[styles.drawerItem, isActive && styles.drawerItemActive]}
                >
                  <TouchableOpacity
                    style={styles.drawerItemTouch}
                    onPress={() => {
                      setActiveConversation(c.id);
                      setShowThreadDrawer(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.drawerItemText,
                        isActive && styles.drawerItemTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {c.isPinned ? "📌 " : ""}{c.title}
                    </Text>
                  </TouchableOpacity>

                  {conversations.length > 1 && (
                    <TouchableOpacity
                      onPress={() => deleteConversation(c.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.drawerDeleteBtn}
                    >
                      <Text style={styles.drawerDeleteText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.modeBanner}>
        <View style={[styles.liveDot, !USE_MOCK_AI && styles.liveDotActive]} />
        <Text style={styles.modeText}>{USE_MOCK_AI ? "Mock mode" : "Live AI mode"}</Text>
      </View>

      {/* Messages List */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {activeConv?.messages?.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onSpeak={() => navigation.navigate("Voice")}
          />
        ))}

        {isSending && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, { opacity: 0.7 }]} />
            <View style={[styles.typingDot, { opacity: 0.4 }]} />
            <Text style={styles.typingText}>AURA is reasoning...</Text>
          </View>
        )}
      </ScrollView>

      {/* Suggested Quick Prompts */}
      <View style={styles.promptSuggestions}>
        <TouchableOpacity
          style={styles.suggestionPill}
          onPress={() => setInputText("Explain binary search in simple terms.")}
        >
          <Text style={styles.suggestionText}>Explain binary search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.suggestionPill}
          onPress={() => setInputText("What is the difference between TCP and UDP?")}
        >
          <Text style={styles.suggestionText}>TCP vs UDP</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.suggestionPill}
          onPress={() => setInputText("What should I study today?")}
        >
          <Text style={styles.suggestionText}>What to study?</Text>
        </TouchableOpacity>
      </View>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.micButton}
          onPress={() => navigation.navigate("Voice")}
        >
          <Text style={styles.micIcon}>◉</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message AURA or ask about study..."
          placeholderTextColor={colors.text3}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />

        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 75 }} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 6,
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.surface2,
    borderRadius: radii.sm,
  },
  headerBtnText: {
    color: colors.text2,
    fontSize: 12,
  },
  newChatBtn: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: 1,
  },
  newChatText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  drawer: {
    backgroundColor: colors.surface2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 12,
    maxHeight: 220,
  },
  drawerHeader: {
    color: colors.text3,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  drawerScroll: {
    maxHeight: 180,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  drawerItemActive: {
    backgroundColor: colors.surfaceHover,
  },
  drawerItemTouch: {
    flex: 1,
  },
  drawerItemText: {
    color: colors.text2,
    fontSize: 13,
  },
  drawerItemTextActive: {
    color: colors.accent,
    fontWeight: "600",
  },
  drawerDeleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  drawerDeleteText: {
    color: colors.text3,
    fontSize: 12,
  },
  modeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text3,
  },
  liveDotActive: {
    backgroundColor: colors.accent,
  },
  modeText: {
    color: colors.text2,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 10,
    paddingHorizontal: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  typingText: {
    color: colors.text3,
    fontSize: 12,
    marginLeft: 4,
  },
  promptSuggestions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
    flexWrap: "nowrap",
  },
  suggestionPill: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  suggestionText: {
    color: colors.text2,
    fontSize: 11,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  micButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  micIcon: {
    color: colors.accent,
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text1,
    fontSize: 14,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    color: colors.accentContrast,
    fontSize: 18,
    fontWeight: "700",
  },
});
