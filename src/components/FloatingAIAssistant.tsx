// NeuroTask - Floating AI Assistant Button
// Pulsating FAB that opens the AI chat modal.
// Uses Reanimated pulse loop animation for 'alive' feel.

import { Sparkles } from "lucide-react-native";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { Colors, Shadow } from "../constants/theme";

interface FloatingAIAssistantProps {
  onPress: () => void;
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  onPress,
}) => {
  const pulse = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  // Continuous pulsing animation to draw attention
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 900 }),
        withTiming(0.3, { duration: 900 }),
      ),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* Glow ring behind button */}
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.View style={animStyle}>
        <Pressable style={styles.button} onPress={onPress}>
          <Sparkles size={24} color="#fff" strokeWidth={2} />
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 100,
    right: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentGlow,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.accent,
  },
});
