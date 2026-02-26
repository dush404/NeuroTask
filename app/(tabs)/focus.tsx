// NeuroTask — Focus Mode Screen (Pomodoro)
// Main Pomodoro timer with session history and settings panel.

import { Clock, Settings, Zap } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassCard } from "../../src/components/GlassCard";
import { PomodoroTimer } from "../../src/components/PomodoroTimer";
import { Colors, Radius, Spacing, Typography } from "../../src/constants/theme";
import { formatDuration } from "../../src/features/stats/statsEngine";
import { useFocusStore } from "../../src/store/useFocusStore";

export default function FocusScreen() {
  const {
    settings,
    sessions,
    getTodaySessions,
    getTodayFocusMinutes,
    updateSettings,
  } = useFocusStore();
  const [showSettings, setShowSettings] = useState(false);

  const todaySessions = useMemo(() => getTodaySessions(), [sessions]);
  const todayMinutes = useMemo(() => getTodayFocusMinutes(), [sessions]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Focus</Text>
          <Pressable
            style={styles.settingsBtn}
            onPress={() => setShowSettings(!showSettings)}
          >
            <Settings size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Zap size={18} color={Colors.accent} />
            <Text style={styles.statNum}>{formatDuration(todayMinutes)}</Text>
            <Text style={styles.statLabel}>Focus today</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Clock size={18} color={Colors.success} />
            <Text style={styles.statNum}>{todaySessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </GlassCard>
        </View>

        {/* Settings panel */}
        {showSettings && (
          <GlassCard style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>Timer Settings</Text>
            <View style={styles.settingsRow}>
              {[
                {
                  label: "Focus",
                  key: "focusMinutes",
                  value: settings.focusMinutes,
                },
                {
                  label: "Short Break",
                  key: "shortBreak",
                  value: settings.shortBreak,
                },
                {
                  label: "Long Break",
                  key: "longBreak",
                  value: settings.longBreak,
                },
              ].map(({ label, key, value }) => (
                <View key={key} style={styles.settingItem}>
                  <Text style={styles.settingLabel}>{label}</Text>
                  <TextInput
                    style={styles.settingInput}
                    value={String(value)}
                    keyboardType="number-pad"
                    onChangeText={(v) => {
                      const num = parseInt(v) || value;
                      updateSettings({ [key]: num });
                    }}
                  />
                  <Text style={styles.settingUnit}>min</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Main Timer */}
        <GlassCard style={styles.timerCard} accentBorder>
          <PomodoroTimer />
        </GlassCard>

        {/* Session History */}
        {todaySessions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today's Sessions</Text>
            {todaySessions.slice(0, 5).map((s) => (
              <View key={s.id} style={styles.sessionRow}>
                <View
                  style={[
                    styles.sessionDot,
                    {
                      backgroundColor:
                        s.type === "focus" ? Colors.accent : Colors.success,
                    },
                  ]}
                />
                <Text style={styles.sessionLabel}>
                  {s.type === "focus"
                    ? `🧠 Focus — ${s.durationMinutes}min`
                    : "🌿 Break"}
                </Text>
                <Text style={styles.sessionTime}>
                  {new Date(s.startedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            ))}
          </>
        )}

        {todaySessions.length === 0 && (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🧠</Text>
            <Text style={styles.emptyTitle}>Start your first session</Text>
            <Text style={styles.emptyBody}>
              Press Play to begin a 25-minute focus session. Regular deep work
              builds momentum.
            </Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSizeXXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  settingsBtn: {
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  statsRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: { flex: 1, alignItems: "center", gap: 4 },
  statNum: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  statLabel: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary },
  settingsCard: { marginBottom: Spacing.md, gap: 12 },
  settingsTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  settingsRow: { flexDirection: "row", gap: 12 },
  settingItem: { flex: 1, alignItems: "center", gap: 4 },
  settingLabel: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary,
  },
  settingInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: 8,
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeMD,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    textAlign: "center",
    width: "100%",
  },
  settingUnit: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
  timerCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  sessionDot: { width: 8, height: 8, borderRadius: 4 },
  sessionLabel: {
    flex: 1,
    fontSize: Typography.fontSizeSM,
    color: Colors.textPrimary,
  },
  sessionTime: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
  emptyCard: {
    alignItems: "center",
    gap: 8,
    paddingVertical: Spacing.xl,
    marginTop: Spacing.md,
  },
  emptyEmoji: { fontSize: 32 },
  emptyTitle: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
