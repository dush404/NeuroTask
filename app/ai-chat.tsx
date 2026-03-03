// NeuroTask - AI Chat Modal Screen
// Full-screen chat interface for AI assistant interactions.
// Updated to match the Exoplan sleek dark aesthetic with a custom chat bar and blue top gradient.

import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowUp, Bot, ClockArrowUp, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../src/constants/theme";
import { sendChatMessage } from "../src/services/ai";
import { useTaskStore } from "../src/store/useTaskStore";
import { aiChatStyles as styles } from "../src/styles/aiChat.styles";
import { AIChatMessage } from "../src/types/task";
import { generateId } from "../src/utils/taskUtils";

const QUICK_PROMPTS = [
  "📅 Plan my week",
  "⚡ Boost focus",
  "🔪 Break a big task",
  "🛌 Suggest rest",
];

export default function AIChatScreen() {
  const { aiMessages, addMessage, clearMessages, isAILoading, setAILoading } =
    useTaskStore();
  const [input, setInput] = useState("");
  const listRef = useRef<FlashList<AIChatMessage>>(null);
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardOffset = useSharedValue(0);

  // Spring config for natural, bouncy keyboard animation
  const springConfig = { damping: 20, stiffness: 200, mass: 0.8 };

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        const h = e.endCoordinates.height;
        setKeyboardHeight(h);
        keyboardOffset.value = withSpring(
          h - (insets.bottom || 0) + 30,
          springConfig,
        );
        // Auto-scroll messages after keyboard animation settles
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 250);
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        keyboardOffset.value = withSpring(0, springConfig);
      },
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const inputBarAnimatedStyle = useAnimatedStyle(() => ({
    marginBottom: keyboardOffset.value,
  }));

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

      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

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
          content: "I could not connect. Please check your API key in .env.",
          timestamp: new Date().toISOString(),
        });
      } finally {
        setAILoading(false);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    [aiMessages, isAILoading, addMessage, setAILoading],
  );

  const renderMessage = ({
    item,
    index,
  }: {
    item: AIChatMessage;
    index: number;
  }) => {
    const isUser = item.role === "user";
    const enterAnim = isUser
      ? FadeInUp.delay(index * 30)
          .duration(300)
          .springify()
          .damping(18)
      : FadeInDown.delay(index * 30)
          .duration(300)
          .springify()
          .damping(18);

    return (
      <Animated.View
        entering={enterAnim}
        style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}
      >
        {!isUser && (
          <View style={styles.aiIconContainer}>
            <Bot size={14} color="#5BA4E5" />
          </View>
        )}
        <Text
          style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}
        >
          {item.content}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.safe}>
      {/* Background matching home page but with blue top gradient */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={["#051A18", "#020D0C", "#000000"]}
          style={{ height: 100 }}
          start={[0.5, 0]}
          end={[0.5, 1]}
        />
      </View>

      {/* Integrated Header Gradient */}
      <LinearGradient
        colors={["#051A18", "#051A18", "#051A1800"]}
        locations={[0, 0.3, 1]}
        style={[styles.headerGradientWrapper, { paddingBottom: 100 }]}
        pointerEvents="box-none"
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconContainer}>
              <Bot size={16} color="#5BA4E5" />
            </View>
            <Text style={styles.headerTitle}>Shyra</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable
              onPress={() => clearMessages()}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <ClockArrowUp size={20} color={Colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <X size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {/* Messages + Input wrapped together so both move with keyboard */}
      <Animated.View style={[{ flex: 1 }, inputBarAnimatedStyle]}>
        {/* Messages */}
        <View style={{ flex: 1 }}>
          <FlashList
            ref={listRef}
            data={aiMessages}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messageList,
              { paddingTop: 100, paddingBottom: 30 },
            ]}
            estimatedItemSize={100}
            ListEmptyComponent={
              <View style={[styles.emptyState, { marginTop: -20 }]}>
                <View style={styles.sparkleContainer}>
                  <Bot size={48} color="#5BA4E5" />
                </View>
                <Text style={styles.emptyTitle}>
                  Plan yourself for your future
                </Text>
              </View>
            }
          />
        </View>

        {/* Quick prompts */}
        {aiMessages.length === 0 && (
          <View style={styles.quickPrompts}>
            {QUICK_PROMPTS.map((p) => (
              <Pressable
                key={p}
                style={({ pressed }) => [
                  styles.chip,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => sendMessage(p)}
              >
                <Text style={styles.chipText}>{p}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Custom Sleek Input Area */}
        <View style={{ width: "100%", marginTop: -50 }}>
          <LinearGradient
            colors={[
              "rgba(17, 32, 51, 0)",
              "rgba(0, 0, 0, 1)",
              "rgba(0, 0, 0, 1)",
            ]}
            locations={[0, 0.4, 1]}
            pointerEvents="box-none"
            style={{ paddingTop: 30 }}
          >
            <View
              style={[
                styles.inputArea,
                {
                  paddingBottom: keyboardHeight > 0 ? 12 : insets.bottom || 16,
                },
              ]}
            >
              <View style={styles.inputWrapper}>
                <View style={styles.glowLineContainer}>
                  <View style={styles.glowLineBlur} />
                  <View style={styles.glowLine} />
                </View>

                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Message Shyra..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  onSubmitEditing={() => sendMessage(input)}
                  returnKeyType="send"
                />
              </View>

              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => sendMessage(input)}
                activeOpacity={0.8}
              >
                {isAILoading ? (
                  <ActivityIndicator color="#5BA4E5" size="small" />
                ) : (
                  <ArrowUp size={20} color="#5BA4E5" strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </View>
  );
}

// Styles have been moved to ../src/styles/aiChat.styles.ts
