import { LinearGradient } from "expo-linear-gradient";
import {
    Activity,
    Apple,
    Book,
    Circle,
    Droplet,
    Flame,
    Moon,
    Smile,
    Star,
    Target,
    Trophy,
    Zap,
} from "lucide-react-native";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "../../src/components/GlassCard";
import { HeatmapCalendar } from "../../src/components/HeatmapCalendar";
import { ProgressRing } from "../../src/components/ProgressRing";
import { WeeklyGraph } from "../../src/components/WeeklyGraph";
import { Colors, Typography } from "../../src/constants/theme";
import {
    computeProductivityScore,
    formatDuration,
    getMonthlyHeatmap,
    getWeeklyCompletionData,
} from "../../src/features/stats/statsEngine";
import { useFocusStore } from "../../src/store/useFocusStore";
import { useHabitStore } from "../../src/store/useHabitStore";
import { useTaskStore } from "../../src/store/useTaskStore";
import { statsStyles as styles } from "../../src/styles/stats.styles";

const renderHabitIcon = (iconStr: string, size = 16, color = "#fff") => {
  switch (iconStr) {
    case "💧":
      return <Droplet size={size} color={color} />;
    case "🏃":
      return <Activity size={size} color={color} />;
    case "📚":
      return <Book size={size} color={color} />;
    case "🧘":
      return <Smile size={size} color={color} />;
    case "😴":
      return <Moon size={size} color={color} />;
    case "🥗":
      return <Apple size={size} color={color} />;
    default:
      return <Circle size={size} color={color} />;
  }
};

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

  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, 20) + 60;

  return (
    <View style={styles.safe}>
      {/* Background to match the app theme */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={["#260D0B", "#100403", "#000000"]}
          style={{ flex: 1 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight, paddingBottom: 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's score */}
        <GlassCard style={styles.scoreCard} striped={true}>
          <View style={styles.scoreSplit}>
            <ProgressRing
              percentage={score}
              size={100}
              label="Today"
              color="#4FE179"
            />
            <View style={styles.scoreDetails}>
              <Text style={styles.scoreTitle}>Productivity Score</Text>
              <View style={styles.scoreRow}>
                <Target size={14} color="#5BA4E5" />
                <Text style={styles.scoreDetail}>
                  {completedToday} tasks done
                </Text>
              </View>
              <View style={styles.scoreRow}>
                <Zap size={14} color="#FFD700" />
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
          <GlassCard style={styles.allTimeCard} striped={true}>
            <Trophy size={18} color="#5BA4E5" />
            <Text style={styles.allTimeNum}>{allTimeCompleted}</Text>
            <Text style={styles.allTimeLabel}>Tasks done</Text>
          </GlassCard>
          <GlassCard style={styles.allTimeCard} striped={true}>
            <Zap size={18} color="#4FE179" />
            <Text style={styles.allTimeNum}>
              {formatDuration(allTimeFocus)}
            </Text>
            <Text style={styles.allTimeLabel}>Focus time</Text>
          </GlassCard>
          <GlassCard
            style={styles.allTimeCard}
            gradientColors={["#33240D", "#1A1005"]}
            striped={true}
          >
            <Star size={18} color="#FFD700" />
            <Text style={styles.allTimeNum}>{totalXP}</Text>
            <Text style={styles.allTimeLabel}>Habit XP</Text>
          </GlassCard>
        </View>

        {/* Weekly chart */}
        <GlassCard
          style={styles.chartCard}
          gradientColors={["#1A1025", "#0C0712"]}
          striped={true}
        >
          <Text style={styles.chartTitle}>This Week</Text>
          <Text style={styles.chartSub}>Tasks completed per day</Text>
          <WeeklyGraph data={weeklyData} />
        </GlassCard>

        {/* Monthly heatmap */}
        <GlassCard
          style={styles.chartCard}
          gradientColors={["#161D3A", "#0A1020"]}
          striped={true}
        >
          <Text style={styles.chartTitle}>30-Day Heatmap</Text>
          <Text style={styles.chartSub}>Task completion intensity</Text>
          <HeatmapCalendar data={heatmapData} />
        </GlassCard>

        {/* Habit breakdown */}
        {habits.length > 0 && (
          <GlassCard
            style={styles.habitCard}
            gradientColors={["#3A120D", "#1A0604"]}
            striped={true}
          >
            <Text style={styles.chartTitle}>Habit Performance</Text>
            {habits.map((h) => {
              const rate =
                h.logs.length > 0
                  ? h.logs.filter((l) => l.completed).length / h.logs.length
                  : 0;
              return (
                <View key={h.id} style={styles.habitRow}>
                  <View style={{ width: 24, alignItems: "center" }}>
                    {renderHabitIcon(h.icon, 16, h.color)}
                  </View>
                  <Text style={styles.habitName} numberOfLines={1}>
                    {h.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Flame size={12} color="#FF6B35" />
                    <Text
                      style={{
                        color: Colors.textMuted,
                        fontSize: Typography.fontSizeXS,
                      }}
                    >
                      {h.streak}
                    </Text>
                  </View>
                  <View style={styles.habitTrack}>
                    <View
                      style={[
                        styles.habitFill,
                        {
                          width: `${rate * 100}%` as any,
                          backgroundColor: h.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.habitPct}>{Math.round(rate * 100)}%</Text>
                </View>
              );
            })}
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}
