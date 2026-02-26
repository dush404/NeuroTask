// NeuroTask — Stats Screen
// Full productivity statistics: score ring, weekly chart, heatmap, habit performance, focus time.

import { Flame, Target, Trophy, Zap } from "lucide-react-native";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassCard } from "../../src/components/GlassCard";
import { HeatmapCalendar } from "../../src/components/HeatmapCalendar";
import { ProgressRing } from "../../src/components/ProgressRing";
import { WeeklyGraph } from "../../src/components/WeeklyGraph";
import { Colors, Spacing, Typography } from "../../src/constants/theme";
import {
    computeProductivityScore,
    formatDuration,
    getMonthlyHeatmap,
    getWeeklyCompletionData,
} from "../../src/features/stats/statsEngine";
import { useFocusStore } from "../../src/store/useFocusStore";
import { useHabitStore } from "../../src/store/useHabitStore";
import { useTaskStore } from "../../src/store/useTaskStore";

export default function StatsScreen() {
  const { tasks, totalFocusMinutesToday } = useTaskStore();
  const { sessions, getTodayFocusMinutes } = useFocusStore();
  const { habits, getCompletedTodayCount, getTotalXP } = useHabitStore();

  const completedToday = useMemo(
    () =>
      tasks.filter((t) =>
        t.completedAt?.startsWith(new Date().toISOString().split("T")[0]),
      ).length,
    [tasks],
  );

  const focusToday = useMemo(() => getTodayFocusMinutes(), [sessions]);
  const score = useMemo(
    () => computeProductivityScore(completedToday, focusToday),
    [completedToday, focusToday],
  );
  const weeklyData = useMemo(() => getWeeklyCompletionData(tasks), [tasks]);
  const heatmapData = useMemo(() => getMonthlyHeatmap(tasks), [tasks]);
  const totalXP = useMemo(() => getTotalXP(), [habits]);
  const habitsToday = useMemo(() => getCompletedTodayCount(), [habits]);

  const allTimeCompleted = useMemo(
    () => tasks.filter((t) => t.status === "done").length,
    [tasks],
  );
  const allTimeFocus = useMemo(
    () =>
      sessions
        .filter((s) => s.type === "focus")
        .reduce((sum, s) => sum + s.durationMinutes, 0),
    [sessions],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Stats</Text>

        {/* Today's score */}
        <GlassCard style={styles.scoreCard} accentBorder>
          <View style={styles.scoreSplit}>
            <ProgressRing percentage={score} size={100} label="Today" />
            <View style={styles.scoreDetails}>
              <Text style={styles.scoreTitle}>Productivity Score</Text>
              <View style={styles.scoreRow}>
                <Target size={14} color={Colors.accent} />
                <Text style={styles.scoreDetail}>
                  {completedToday} tasks done
                </Text>
              </View>
              <View style={styles.scoreRow}>
                <Zap size={14} color={Colors.accent} />
                <Text style={styles.scoreDetail}>
                  {formatDuration(focusToday)} focused
                </Text>
              </View>
              <View style={styles.scoreRow}>
                <Flame size={14} color="#FF6B35" />
                <Text style={styles.scoreDetail}>
                  {habitsToday} habits done
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* All-time stats */}
        <View style={styles.allTimeRow}>
          <GlassCard style={styles.allTimeCard}>
            <Trophy size={18} color={Colors.accent} />
            <Text style={styles.allTimeNum}>{allTimeCompleted}</Text>
            <Text style={styles.allTimeLabel}>Tasks done</Text>
          </GlassCard>
          <GlassCard style={styles.allTimeCard}>
            <Zap size={18} color={Colors.success} />
            <Text style={styles.allTimeNum}>
              {formatDuration(allTimeFocus)}
            </Text>
            <Text style={styles.allTimeLabel}>Focus time</Text>
          </GlassCard>
          <GlassCard style={styles.allTimeCard}>
            <Text style={{ fontSize: 18 }}>⭐</Text>
            <Text style={styles.allTimeNum}>{totalXP}</Text>
            <Text style={styles.allTimeLabel}>Habit XP</Text>
          </GlassCard>
        </View>

        {/* Weekly chart */}
        <GlassCard style={styles.chartCard}>
          <Text style={styles.chartTitle}>This Week</Text>
          <Text style={styles.chartSub}>Tasks completed per day</Text>
          <WeeklyGraph data={weeklyData} />
        </GlassCard>

        {/* Monthly heatmap */}
        <GlassCard style={styles.chartCard}>
          <Text style={styles.chartTitle}>30-Day Heatmap</Text>
          <Text style={styles.chartSub}>Task completion intensity</Text>
          <HeatmapCalendar data={heatmapData} />
        </GlassCard>

        {/* Habit breakdown */}
        {habits.length > 0 && (
          <GlassCard style={styles.habitCard}>
            <Text style={styles.chartTitle}>Habit Performance</Text>
            {habits.map((h) => {
              const rate =
                h.logs.length > 0
                  ? h.logs.filter((l) => l.completed).length / h.logs.length
                  : 0;
              return (
                <View key={h.id} style={styles.habitRow}>
                  <Text style={styles.habitIcon}>{h.icon}</Text>
                  <Text style={styles.habitName} numberOfLines={1}>
                    {h.name}
                  </Text>
                  <Text
                    style={{
                      color: Colors.textMuted,
                      fontSize: Typography.fontSizeXS,
                    }}
                  >
                    🔥 {h.streak}
                  </Text>
                  <View style={styles.habitTrack}>
                    <View
                      style={[
                        styles.habitFill,
                        { width: `${rate * 100}%`, backgroundColor: h.color },
                      ]}
                    />
                  </View>
                  <Text style={styles.habitPct}>{Math.round(rate * 100)}%</Text>
                </View>
              );
            })}
          </GlassCard>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  content: { padding: Spacing.md, paddingBottom: 100 },
  title: {
    fontSize: Typography.fontSizeXXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  scoreCard: { marginBottom: Spacing.md },
  scoreSplit: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  scoreDetails: { flex: 1, gap: 8 },
  scoreTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  scoreDetail: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary },
  allTimeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  allTimeCard: { flex: 1, alignItems: "center", gap: 4 },
  allTimeNum: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  allTimeLabel: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary,
  },
  chartCard: { marginBottom: Spacing.md, gap: 8 },
  chartTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  chartSub: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  habitCard: { gap: 12 },
  habitRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  habitIcon: { fontSize: 16 },
  habitName: {
    flex: 1,
    fontSize: Typography.fontSizeSM,
    color: Colors.textPrimary,
  },
  habitTrack: {
    width: 80,
    height: 6,
    backgroundColor: Colors.glass,
    borderRadius: 3,
    overflow: "hidden",
  },
  habitFill: { height: "100%", borderRadius: 3 },
  habitPct: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    width: 32,
    textAlign: "right",
  },
});
