import { Sparkles } from "lucide-react-native";
import React, { memo, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { Colors, Shadow } from "../constants/theme";
import { springConfig } from "../utils/motionConfig";

interface FloatingAIAssistantProps {
  onPress: () => void;
}

// Memoized to prevent re-renders, essential for continuous loop animations
export const FloatingAIAssistant = memo(
  ({ onPress }: FloatingAIAssistantProps) => {
    const pulse = useSharedValue(1);
    const glowOpacity = useSharedValue(0.4);
    const pressScale = useSharedValue(1);

    // Continuous pulsing animation to draw attention
    useEffect(() => {
      // Start pulse loop on UI Thread
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 900,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, // Infinite
        true, // Reverse
      );

      // Start glow loop
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, // Infinite
        true, // Reverse
      );
    }, [pulse, glowOpacity]);

    const handlePressIn = () => {
      "worklet";
      pressScale.value = withSpring(0.9, springConfig);
    };

    const handlePressOut = () => {
      "worklet";
      pressScale.value = withSpring(1, springConfig);
    };

    const animStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulse.value * pressScale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glowOpacity.value,
      transform: [{ scale: pulse.value * pressScale.value }],
    }));

    return (
      <View style={styles.wrapper} pointerEvents="box-none">
        {/* Glow ring behind button */}
        <Animated.View style={[styles.glow, glowStyle]} />
        <Animated.View style={animStyle}>
          <Pressable
            style={styles.button}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Sparkles size={24} color="#fff" strokeWidth={2} />
          </Pressable>
        </Animated.View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 100,
    right: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  glow: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentGlow,
    // Soft shadow logic for floating glow
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
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
