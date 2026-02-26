// NeuroTask — Habit Card Component
// Displays a habit with streak badge, daily checkbox, XP bar, and color accent.

import { Check, Flame } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { Colors, Radius, Spacing, Typography } from "../constants/theme";
import { useHabitStore } from "../store/useHabitStore";
import { Habit } from "../types/task";

interface HabitCardProps {
  habit: Habit;
}

const MAX_XP_PER_LEVEL = 100;

export const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const { checkIn, getTodayStatus } = useHabitStore();
  const isCompleted = getTodayStatus(habit.id);

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleCheckIn = () => {
    scale.value = withSpring(1.15, {}, () => {
      scale.value = withSpring(1);
    });
    checkIn(habit.id, !isCompleted);
  };

  const xpProgress = (habit.totalXP % MAX_XP_PER_LEVEL) / MAX_XP_PER_LEVEL;
  const level = Math.floor(habit.totalXP / MAX_XP_PER_LEVEL) + 1;

  return (
    <Animated.View style={[styles.container, animStyle]}>
      {/* Color accent left bar */}
      <View style={[styles.accentBar, { backgroundColor: habit.color }]} />

      <View style={styles.body}>
        {/* Top row */}
        <View style={styles.row}>
          <Text style={styles.icon}>{habit.icon}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {habit.name}
          </Text>
          <View style={styles.streakBadge}>
            <Flame
              size={12}
              color={habit.streak > 0 ? "#FF6B35" : Colors.textMuted}
            />
            <Text
              style={[
                styles.streakText,
                { color: habit.streak > 0 ? "#FF6B35" : Colors.textMuted },
              ]}
            >
              {habit.streak}
            </Text>
          </View>
        </View>

        {/* XP progress bar */}
        <View style={styles.xpRow}>
          <Text style={styles.levelLabel}>Lv {level}</Text>
          <View style={styles.xpTrack}>
            <View
              style={[
                styles.xpFill,
                {
                  width: `${xpProgress * 100}%`,
                  backgroundColor: habit.color,
                },
              ]}
            />
          </View>
          <Text style={styles.xpLabel}>{habit.totalXP} XP</Text>
        </View>
      </View>

      {/* Check button */}
      <Pressable
        style={[
          styles.checkBtn,
          isCompleted && { backgroundColor: habit.color },
        ]}
        onPress={handleCheckIn}
      >
        <Check
          size={16}
          color={isCompleted ? "#fff" : Colors.textMuted}
          strokeWidth={3}
        />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginVertical: 5,
    overflow: "hidden",
  },
  accentBar: { width: 4, alignSelf: "stretch" },
  body: { flex: 1, padding: Spacing.md, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  icon: { fontSize: 18 },
  name: {
    flex: 1,
    fontSize: Typography.fontSizeMD,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeightSemiBold,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  streakText: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
  },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  levelLabel: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    width: 30,
  },
  xpTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.glass,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  xpFill: { height: "100%", borderRadius: Radius.full },
  xpLabel: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    width: 45,
    textAlign: "right",
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
});
