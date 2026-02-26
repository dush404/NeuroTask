// NeuroTask - AI Chat Modal Screen
// Full-screen chat interface for AI assistant interactions.
// Communicates via OpenRouter API through the ai.ts service.

import { router } from "expo-router";
import { Send, Sparkles, X } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Colors, Radius, Spacing, Typography } from "../src/constants/theme";
import { sendChatMessage } from "../src/services/ai";
import { useTaskStore } from "../src/store/useTaskStore";
import { AIChatMessage } from "../src/types/task";
import { generateId } from "../src/utils/taskUtils";

// Quick-action prompt chips for common AI queries
const QUICK_PROMPTS = [
  "📅 Plan my week",
  "⚡ Boost focus",
  "🔥 Break a big task",
  "😌 Suggest rest",
];

export default function AIChatScreen() {
  const { aiMessages, addMessage, isAILoading, setAILoading } = useTaskStore();
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isAILoading) return;
      setInput("");

      const userMsg: AIChatMessage = {
        id: generateId(),
        role: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };
      addMessage(userMsg);
      setAILoading(true);

      try {
        const response = await sendChatMessage([...aiMessages, userMsg]);
        addMessage({
          id: generateId(),
          role: "assistant",
          content: response,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        addMessage({
          id: generateId(),
          role: "assistant",
          content: "⚠️ I could not connect. Please check your API key in .env.",
          timestamp: new Date().toISOString(),
        });
      } finally {
        setAILoading(false);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    [aiMessages, isAILoading, addMessage, setAILoading],
  );

  const renderMessage = ({ item }: { item: AIChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}
      >
        {!isUser && (
          <Sparkles size={12} color={Colors.accent} style={styles.aiIcon} />
        )}
        <Text
          style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerDot} />
          <Text style={styles.headerTitle}>NeuroTask AI</Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={aiMessages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Sparkles size={40} color={Colors.accent} />
            <Text style={styles.emptyTitle}>How can I help?</Text>
            <Text style={styles.emptySubtitle}>
              Ask me to plan your week, break down a task, or suggest ways to
              recover from burnout.
            </Text>
          </View>
        }
      />

      {/* Quick prompts */}
      {aiMessages.length === 0 && (
        <View style={styles.quickPrompts}>
          {QUICK_PROMPTS.map((p) => (
            <Pressable
              key={p}
              style={styles.chip}
              onPress={() => sendMessage(p)}
            >
              <Text style={styles.chipText}>{p}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask your AI assistant..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
          />
          {isAILoading ? (
            <ActivityIndicator color={Colors.accent} style={styles.sendBtn} />
          ) : (
            <Pressable
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
              onPress={() => sendMessage(input)}
            >
              <Send
                size={18}
                color={input.trim() ? Colors.accent : Colors.textMuted}
              />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightSemiBold,
  },
  closeBtn: {
    padding: 8,
  },
  messageList: {
    padding: Spacing.md,
    paddingBottom: 8,
    flexGrow: 1,
  },
  bubble: {
    maxWidth: "82%",
    marginVertical: 4,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderBottomLeftRadius: 4,
  },
  aiIcon: {
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: Typography.fontSizeMD,
    lineHeight: 22,
  },
  userText: {
    color: "#FFFFFF",
  },
  aiText: {
    color: Colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  quickPrompts: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.md,
    gap: 8,
    paddingBottom: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipText: {
    color: Colors.accent,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightMedium,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeMD,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  sendBtn: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
