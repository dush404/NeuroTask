import React, { memo, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { Colors, Radius, Spacing, Typography } from "../constants/theme";
import { springConfig, timingConfigMedium } from "../utils/motionConfig";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  index?: number; // Used for staggered animation
}

export const DashboardCard = memo(
  ({
    title,
    subtitle,
    icon,
    children,
    onPress,
    style,
    index = 0,
  }: DashboardCardProps) => {
    // Shared values for entrance animation
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    const scale = useSharedValue(1);

    // Staggered entrance animation on mount
    useEffect(() => {
      const delay = index * 100; // 100ms stagger between cards
      opacity.value = withDelay(delay, withTiming(1, timingConfigMedium));
      translateY.value = withDelay(delay, withSpring(0, springConfig));
    }, [index, opacity, translateY]);

    // Press animations
    const handlePressIn = () => {
      "worklet";
      if (onPress) {
        scale.value = withTiming(0.97, { duration: 150 });
      }
    };

    const handlePressOut = () => {
      "worklet";
      if (onPress) {
        scale.value = withSpring(1, springConfig);
      }
    };

    const animStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    const CardContent = (
      <Animated.View style={[styles.card, style, animStyle]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <View>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
        </View>
        {children && <View style={styles.body}>{children}</View>}
      </Animated.View>
    );

    if (onPress) {
      return (
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!onPress}
        >
          {CardContent}
        </Pressable>
      );
    }

    return CardContent;
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginVertical: Spacing.sm,
    padding: Spacing.md,
    overflow: "hidden",
    // Soft ambient shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: Colors.glass,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  body: {
    marginTop: Spacing.xs,
  },
});
