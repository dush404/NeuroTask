// NeuroTask — Habit Detail Tabs
// Expanded section when a habit card is tapped: "Stroke" | "Level" | "Complete"

import { Flame, Trophy, Zap } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Circle as SvgCircle } from "react-native-svg";
import { Colors, Radius } from "../constants/theme";
import { Habit, HabitLog } from "../types/task";
import { HeatmapCalendar } from "./HeatmapCalendar";

type Tab = "stroke" | "level" | "complete";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "stroke", label: "Stroke", emoji: "🔥" },
  { id: "level", label: "Level", emoji: "⚡" },
  { id: "complete", label: "Complete", emoji: "✅" },
];

const MAX_XP = 100;

interface Props {
  habit: Habit;
  heatmapData: { date: string; count: number }[];
}

// ── XP Level Ring ─────────────────────────────────────────────────────────────
const LevelRing = ({
  xp,
  level,
  color,
}: {
  xp: number;
  level: number;
  color: string;
}) => {
  const size = 80;
  const sw = 6;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const progress = (xp % MAX_XP) / MAX_XP;
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={sw}
          fill="transparent"
        />
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={sw}
          fill="transparent"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={circ * (1 - progress)}
          strokeLinecap="round"
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color, fontSize: 20, fontWeight: "800" }}>
            {level}
          </Text>
          <Text
            style={{ color: Colors.textMuted, fontSize: 10, fontWeight: "600" }}
          >
            LV
          </Text>
        </View>
      </View>
    </View>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const HabitDetailTabs: React.FC<Props> = ({ habit, heatmapData }) => {
  const [activeTab, setActiveTab] = useState<Tab>("stroke");

  const xpInLevel = habit.totalXP % MAX_XP;
  const level = Math.floor(habit.totalXP / MAX_XP) + 1;
  const xpToNext = MAX_XP - xpInLevel;

  // Sort logs newest first for the Complete tab
  const sortedLogs = [...habit.logs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

  return (
    <Animated.View entering={FadeInDown.duration(220)} style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.tabBtn,
                isActive && {
                  borderBottomColor: habit.color,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              <Text
                style={[styles.tabLabel, isActive && { color: habit.color }]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Stroke Tab */}
      {activeTab === "stroke" && (
        <View style={styles.tabContent}>
          <View style={styles.streakRow}>
            <View style={styles.streakStat}>
              <Flame size={20} color="#FF6B35" />
              <Text style={styles.streakNum}>{habit.streak}</Text>
              <Text style={styles.streakLabel}>Current</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakStat}>
              <Trophy size={20} color="#FFB443" />
              <Text style={styles.streakNum}>{habit.longestStreak}</Text>
              <Text style={styles.streakLabel}>Best</Text>
            </View>
          </View>
          <Text style={styles.heatmapTitle}>30-Day History</Text>
          <HeatmapCalendar data={heatmapData} color={habit.color} />
        </View>
      )}

      {/* Level Tab */}
      {activeTab === "level" && (
        <View style={styles.tabContent}>
          <View style={styles.levelRow}>
            <LevelRing xp={habit.totalXP} level={level} color={habit.color} />
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Level {level}</Text>
              <View style={styles.xpTrack}>
                <View
                  style={[
                    styles.xpFill,
                    {
                      width: `${(xpInLevel / MAX_XP) * 100}%`,
                      backgroundColor: habit.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.xpText}>
                {xpInLevel} / {MAX_XP} XP
              </Text>
              <Text style={styles.xpToNext}>{xpToNext} XP to next level</Text>
            </View>
          </View>

          <View style={styles.xpStatsRow}>
            <View style={styles.xpStatCard}>
              <Zap size={16} color="#5BA4E5" />
              <Text style={styles.xpStatNum}>{habit.totalXP}</Text>
              <Text style={styles.xpStatLabel}>Total XP</Text>
            </View>
            <View style={styles.xpStatCard}>
              <Trophy size={16} color="#FFB443" />
              <Text style={styles.xpStatNum}>
                {Math.floor(habit.totalXP / MAX_XP) + 1}
              </Text>
              <Text style={styles.xpStatLabel}>Level</Text>
            </View>
            <View style={styles.xpStatCard}>
              <Flame size={16} color="#FF6B35" />
              <Text style={styles.xpStatNum}>{habit.streak}</Text>
              <Text style={styles.xpStatLabel}>Streak</Text>
            </View>
          </View>
        </View>
      )}

      {/* Complete Tab */}
      {activeTab === "complete" && (
        <View style={styles.tabContent}>
          <ScrollView
            style={{ maxHeight: 200 }}
            showsVerticalScrollIndicator={false}
          >
            {sortedLogs.length === 0 ? (
              <Text style={styles.emptyText}>
                No logs yet — start checking in daily!
              </Text>
            ) : (
              sortedLogs.map((log: HabitLog) => (
                <View key={log.date} style={styles.logRow}>
                  <View
                    style={[
                      styles.logDot,
                      {
                        backgroundColor: log.completed
                          ? habit.color
                          : "rgba(255,255,255,0.1)",
                      },
                    ]}
                  />
                  <Text style={styles.logDate}>
                    {new Date(log.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <Text
                    style={[
                      styles.logStatus,
                      { color: log.completed ? habit.color : Colors.textMuted },
                    ]}
                  >
                    {log.completed ? `+${log.xpEarned} XP` : "Missed"}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabEmoji: {
    fontSize: 13,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tabContent: {
    padding: 16,
  },
  // Stroke tab
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 16,
  },
  streakStat: {
    alignItems: "center",
    gap: 4,
  },
  streakNum: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  streakLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heatmapTitle: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  // Level tab
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 16,
  },
  levelInfo: {
    flex: 1,
    gap: 6,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  xpTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 3,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    borderRadius: 3,
  },
  xpText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  xpToNext: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  xpStatsRow: {
    flexDirection: "row",
    gap: 8,
  },
  xpStatCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: Radius.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  xpStatNum: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  xpStatLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  // Complete tab
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logDate: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  logStatus: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 13,
    paddingVertical: 16,
  },
});
