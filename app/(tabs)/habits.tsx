// NeuroTask — Habits Screen
// Daily habit tracker with streaks, XP, check-in, and 30-day heatmap.

import { Flame, Plus, Star, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassCard } from "../../src/components/GlassCard";
import { HabitCard } from "../../src/components/HabitCard";
import { HeatmapCalendar } from "../../src/components/HeatmapCalendar";
import { Colors, Radius, Spacing, Typography } from "../../src/constants/theme";
import { useHabitStore } from "../../src/store/useHabitStore";
import { Habit } from "../../src/types/task";

const PRESET_HABITS = [
  { icon: "💧", name: "Drink Water", color: "#3A8DFF" },
  { icon: "🏃", name: "Exercise", color: "#FF6B9D" },
  { icon: "📚", name: "Read", color: "#4ECDC4" },
  { icon: "🧘", name: "Meditate", color: "#A78BFA" },
  { icon: "😴", name: "Sleep 8h", color: "#FFB443" },
];

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function HabitsScreen() {
  const {
    habits,
    addHabit,
    getCompletedTodayCount,
    getTotalXP,
    getHeatmapData,
  } = useHabitStore();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("⭐");
  const [newColor, setNewColor] = useState(Colors.accent);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const completedToday = useMemo(() => getCompletedTodayCount(), [habits]);
  const totalXP = useMemo(() => getTotalXP(), [habits]);
  const level = Math.floor(totalXP / 100) + 1;

  const selectedHabit = habits.find((h) => h.id === selectedHabitId);
  const heatmapData = useMemo(
    () =>
      selectedHabitId
        ? getHeatmapData(selectedHabitId).map((log) => ({
            date: log.date,
            count: log.completed ? 10 : 0,
          }))
        : [],
    [selectedHabitId, habits, getHeatmapData],
  );

  const handleAddHabit = () => {
    if (!newName.trim()) return;
    const h: Habit = {
      id: generateId(),
      name: newName.trim(),
      icon: newIcon,
      color: newColor,
      frequency: "daily",
      streak: 0,
      longestStreak: 0,
      totalXP: 0,
      logs: [],
      createdAt: new Date().toISOString(),
    };
    addHabit(h);
    setNewName("");
    setShowModal(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Habits</Text>
          <Pressable style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Plus size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Flame size={20} color="#FF6B35" />
            <Text style={styles.statNum}>{completedToday}</Text>
            <Text style={styles.statLabel}>Done today</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Star size={20} color={Colors.accent} />
            <Text style={styles.statNum}>{totalXP}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={{ fontSize: 20 }}>🏆</Text>
            <Text style={styles.statNum}>Lv {level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </GlassCard>
        </View>

        {/* Habit list */}
        <Text style={styles.sectionTitle}>Daily Habits</Text>
        {habits.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyBody}>
              Build streaks and earn XP by adding your first habit.
            </Text>
          </GlassCard>
        ) : (
          habits.map((habit) => (
            <Pressable
              key={habit.id}
              onPress={() =>
                setSelectedHabitId(
                  selectedHabitId === habit.id ? null : habit.id,
                )
              }
            >
              <HabitCard habit={habit} />
              {selectedHabitId === habit.id && (
                <GlassCard style={styles.heatmapCard}>
                  <Text style={styles.sectionTitle}>30-Day History</Text>
                  <HeatmapCalendar data={heatmapData} color={habit.color} />
                </GlassCard>
              )}
            </Pressable>
          ))
        )}

        {/* Preset suggestions */}
        {habits.length === 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>
              Quick Add
            </Text>
            {PRESET_HABITS.map((p) => (
              <Pressable
                key={p.name}
                style={styles.presetRow}
                onPress={() => {
                  addHabit({
                    id: generateId(),
                    name: p.name,
                    icon: p.icon,
                    color: p.color,
                    frequency: "daily",
                    streak: 0,
                    longestStreak: 0,
                    totalXP: 0,
                    logs: [],
                    createdAt: new Date().toISOString(),
                  });
                }}
              >
                <Text style={styles.presetIcon}>{p.icon}</Text>
                <Text style={styles.presetName}>{p.name}</Text>
                <View style={styles.presetDot} />
              </Pressable>
            ))}
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.overlay}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>New Habit</Text>
              <Pressable onPress={() => setShowModal(false)}>
                <X size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.field}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Read 30 min"
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
            <Text style={styles.fieldLabel}>Emoji Icon</Text>
            <TextInput
              style={styles.field}
              value={newIcon}
              onChangeText={setNewIcon}
              placeholder="⭐"
              placeholderTextColor={Colors.textMuted}
              maxLength={2}
            />
            <Pressable
              style={[styles.submitBtn, !newName.trim() && { opacity: 0.5 }]}
              onPress={handleAddHabit}
              disabled={!newName.trim()}
            >
              <Text style={styles.submitText}>Add Habit</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  scroll: { flex: 1 },
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
  addBtn: {
    backgroundColor: Colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: { flex: 1, alignItems: "center", gap: 4 },
  statNum: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  statLabel: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary },
  sectionTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  heatmapCard: { marginTop: 6, marginBottom: 6 },
  emptyCard: { alignItems: "center", gap: 8, paddingVertical: Spacing.xl },
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
  },
  presetRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 10,
  },
  presetIcon: { fontSize: 20 },
  presetName: {
    flex: 1,
    fontSize: Typography.fontSizeMD,
    color: Colors.textPrimary,
  },
  presetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  fieldLabel: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  field: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: 12,
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeMD,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#fff",
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
  },
});
