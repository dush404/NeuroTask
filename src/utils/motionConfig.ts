import { withSpring, withTiming } from "react-native-reanimated";

// Centralized motion tokens
export const MotionTokens = {
  duration: {
    fast: 200,
    medium: 300,
    slow: 500,
  },
  spring: {
    stiffness: 120,
    damping: 15,
    mass: 0.8,
  },
};

// Ready-to-use configs for reanimated
export const springConfig = {
  damping: MotionTokens.spring.damping,
  stiffness: MotionTokens.spring.stiffness,
  mass: MotionTokens.spring.mass,
};

export const timingConfigFast = { duration: MotionTokens.duration.fast };
export const timingConfigMedium = { duration: MotionTokens.duration.medium };
export const timingConfigSlow = { duration: MotionTokens.duration.slow };

// Helper functions that immediately trigger animations
export const animateSpring = (value: number) => withSpring(value, springConfig);
export const animateTiming = (
  value: number,
  duration: number = MotionTokens.duration.medium,
) => withTiming(value, { duration });
