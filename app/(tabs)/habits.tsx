// NeuroTask — Habits Screen (Exoplan Premium Dark Theme)
// Daily habit tracker with streaks, XP, check-in, heatmap, and preset quick-add.
// Matches the dark gradient aesthetic of the home/schedule page.

import { LinearGradient } from "expo-linear-gradient";
import {
    Activity,
    Apple,
    Book,
    Check,
    Circle,
    Droplet,
    Flame,
    Moon,
    Play,
    Plus,
    Smile,
    Sprout,
    Trophy,
    X,
    Zap,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle as SvgCircle } from "react-native-svg";
import { HabitDetailTabs } from "../../src/components/HabitDetailTabs";
import { HabitSlotCard } from "../../src/components/HabitSlotCard";
// PageHeader is now rendered in (tabs)/_layout.tsx for persistence
import { useRouter } from "expo-router";
import { StripedBackground } from "../../src/components/StripedBackground";
import { Colors } from "../../src/constants/theme";
import { useFocusStore } from "../../src/store/useFocusStore";
import { useHabitStore } from "../../src/store/useHabitStore";
import { habitsStyles as styles } from "../../src/styles/habits.styles";
import { Habit } from "../../src/types/task";

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

// ── Preset habits ─────────────────────────────────────────────────────────────

const PRESET_HABITS = [
  { icon: "💧", name: "Drink Water", color: "#3A8DFF" },
  { icon: "🏃", name: "Exercise", color: "#FF6B9D" },
  { icon: "📚", name: "Read", color: "#4ECDC4" },
  { icon: "🧘", name: "Meditate", color: "#A78BFA" },
  { icon: "😴", name: "Sleep 8h", color: "#FFB443" },
  { icon: "🥗", name: "Eat Healthy", color: "#4CAF50" },
];

const COLOR_OPTIONS = [
  "#3A8DFF",
  "#FF6B9D",
  "#4ECDC4",
  "#5BA4E5",
  "#FFB443",
  "#4CAF50",
  "#FF4D6D",
];

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const MAX_XP_PER_LEVEL = 100;

// ── XP Ring Component ─────────────────────────────────────────────────────────

const XPRing = ({ xp, level }: { xp: number; level: number }) => {
  const size = 56;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (xp % MAX_XP_PER_LEVEL) / MAX_XP_PER_LEVEL;
  const strokeDashoffset = circumference * (1 - progress);

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
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#5BA4E5"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#5BA4E5", fontSize: 13, fontWeight: "800" }}>
            {level}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ── Habit Card (inline, matches TimelineBlock style) ──────────────────────────

const HabitCardItem = ({
  habit,
  isExpanded,
  onToggleExpand,
  heatmapData,
}: {
  habit: Habit;
  isExpanded: boolean;
  onToggleExpand: () => void;
  heatmapData: { date: string; count: number }[];
}) => {
  const { checkIn, getTodayStatus } = useHabitStore();
  const { startCustomTimer } = useFocusStore();
  const router = useRouter();
  const isCompleted = getTodayStatus(habit.id);

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleCheckIn = () => {
    scale.value = withSpring(1.08, {}, () => {
      scale.value = withSpring(1);
    });
    checkIn(habit.id, !isCompleted);
  };

  const xpProgress = (habit.totalXP % MAX_XP_PER_LEVEL) / MAX_XP_PER_LEVEL;
  const level = Math.floor(habit.totalXP / MAX_XP_PER_LEVEL) + 1;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        style={[
          styles.habitCard,
          {
            borderColor: isCompleted
              ? `${habit.color}30`
              : "rgba(255,255,255,0.04)",
          },
        ]}
        onPress={onToggleExpand}
      >
        <StripedBackground opacity={0.04} />

        {/* Color accent bar */}
        <View
          style={[styles.habitAccentBar, { backgroundColor: habit.color }]}
        />

        <View style={styles.habitBody}>
          {/* Top row: Icon + Name + Streak */}
          <View style={styles.habitTopRow}>
            <View style={{ width: 32, alignItems: "center" }}>
              {renderHabitIcon(habit.icon, 20, habit.color)}
            </View>
            <View style={styles.habitInfo}>
              <Text style={styles.habitName} numberOfLines={1}>
                {habit.name}
              </Text>
              {/* XP bar */}
              <View style={styles.xpRow}>
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
                <Text style={styles.xpText}>{habit.totalXP} XP</Text>
              </View>
            </View>

            {/* Streak badge */}
            {habit.streak > 0 && (
              <View style={styles.streakBadge}>
                <Flame size={11} color="#FF6B35" />
                <Text style={styles.streakNum}>{habit.streak}</Text>
              </View>
            )}

            {/* Timer button — shown when habit has a time target */}
            {habit.targetMinutes && habit.targetMinutes > 0 && (
              <Pressable
                style={[
                  styles.timerBtn,
                  {
                    borderColor: habit.color,
                    backgroundColor: `${habit.color}15`,
                  },
                ]}
                onPress={() => {
                  startCustomTimer(habit.targetMinutes!);
                  router.navigate("/(tabs)/focus");
                }}
              >
                <Play size={11} color={habit.color} fill={habit.color} />
                <Text style={[styles.timerBtnText, { color: habit.color }]}>
                  {habit.targetMinutes}m
                </Text>
              </Pressable>
            )}

            {/* Check button */}
            <Pressable
              style={[
                styles.checkBtn,
                isCompleted && {
                  backgroundColor: habit.color,
                  borderColor: habit.color,
                },
              ]}
              onPress={handleCheckIn}
            >
              <Check
                size={14}
                color={isCompleted ? "#fff" : "rgba(255,255,255,0.25)"}
                strokeWidth={3}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>

      {/* Expanded — 3-tab detail view */}
      {isExpanded && (
        <HabitDetailTabs habit={habit} heatmapData={heatmapData} />
      )}
    </Animated.View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function HabitsScreen() {
  const {
    habits,
    addHabit,
    slots,
    addSlot,
    getCompletedTodayCount,
    getTotalXP,
    getHeatmapData,
  } = useHabitStore();
  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, 20) + 60;
  const [showModal, setShowModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("⭐");
  const [newColor, setNewColor] = useState("#5BA4E5");
  const [newTargetMinutes, setNewTargetMinutes] = useState("");
  // Slot fields
  const [slotName, setSlotName] = useState("");
  const [slotIcon, setSlotIcon] = useState("⚡");
  const [slotColor, setSlotColor] = useState("#5BA4E5");
  const [slotHour, setSlotHour] = useState("07");
  const [slotMin, setSlotMin] = useState("00");
  const [slotDuration, setSlotDuration] = useState("30");
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const completedToday = useMemo(() => getCompletedTodayCount(), [habits]);
  const totalXP = useMemo(() => getTotalXP(), [habits]);
  const level = Math.floor(totalXP / 100) + 1;

  const handleAddHabit = () => {
    if (!newName.trim()) return;
    const mins = parseInt(newTargetMinutes, 10);
    const h: Habit = {
      id: generateId(),
      name: newName.trim(),
      icon: newIcon,
      color: newColor,
      frequency: "daily",
      targetMinutes: isNaN(mins) || mins <= 0 ? undefined : mins,
      streak: 0,
      longestStreak: 0,
      totalXP: 0,
      logs: [],
      createdAt: new Date().toISOString(),
    };
    addHabit(h);
    setNewName("");
    setNewIcon("⭐");
    setNewTargetMinutes("");
    setShowModal(false);
  };

  const addPresetHabit = (preset: (typeof PRESET_HABITS)[0]) => {
    addHabit({
      id: generateId(),
      name: preset.name,
      icon: preset.icon,
      color: preset.color,
      frequency: "daily",
      streak: 0,
      longestStreak: 0,
      totalXP: 0,
      logs: [],
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#291807", "#130A02", "#000000"]}
        style={styles.bgGradient}
        start={[0.5, 0]}
        end={[0.5, 1]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight, paddingBottom: 100 },
        ]}
      >
        {/* ── Stats Row ────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconBg,
                { backgroundColor: "rgba(255,107,53,0.12)" },
              ]}
            >
              <Flame size={18} color="#FF6B35" />
            </View>
            <View>
              <Text style={styles.statNum}>
                {completedToday}/{habits.length}
              </Text>
              <Text style={styles.statLabel}>Done today</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconBg,
                { backgroundColor: "rgba(91,164,229,0.12)" },
              ]}
            >
              <Zap size={18} color="#5BA4E5" />
            </View>
            <View>
              <Text style={styles.statNum}>{totalXP}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconBg,
                { backgroundColor: "rgba(255,180,67,0.12)" },
              ]}
            >
              <Trophy size={18} color="#FFB443" />
            </View>
            <View>
              <Text style={styles.statNum}>Lv {level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
        </View>

        {/* ── Habit List ───────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Habits</Text>
          <Text style={styles.sectionCount}>{habits.length}</Text>
        </View>

        {habits.length === 0 ? (
          <View style={styles.emptyCard}>
            <Sprout
              size={32}
              color={Colors.textSecondary}
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.emptyTitle}>Start building habits</Text>
            <Text style={styles.emptyBody}>
              Check in daily, build streaks, and earn XP
            </Text>
          </View>
        ) : (
          habits.map((habit, index) => {
            const heatmapData =
              selectedHabitId === habit.id
                ? getHeatmapData(habit.id).map((log) => ({
                    date: log.date,
                    count: log.completed ? 10 : 0,
                  }))
                : [];
            return (
              <Animated.View
                key={habit.id}
                entering={FadeInUp.delay(index * 50)
                  .duration(300)
                  .springify()
                  .damping(18)}
              >
                <HabitCardItem
                  habit={habit}
                  isExpanded={selectedHabitId === habit.id}
                  onToggleExpand={() =>
                    setSelectedHabitId(
                      selectedHabitId === habit.id ? null : habit.id,
                    )
                  }
                  heatmapData={heatmapData}
                />
              </Animated.View>
            );
          })
        )}

        {/* ── Quick Add Presets (when no habits) ───────────────────────── */}
        {habits.length === 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Quick Add</Text>
            </View>
            <View style={styles.presetGrid}>
              {PRESET_HABITS.map((p) => (
                <Pressable
                  key={p.name}
                  style={styles.presetCard}
                  onPress={() => addPresetHabit(p)}
                >
                  <StripedBackground opacity={0.04} />
                  <View style={{ marginBottom: 6 }}>
                    {renderHabitIcon(p.icon, 24, p.color)}
                  </View>
                  <Text style={styles.presetName}>{p.name}</Text>
                  <View
                    style={[styles.presetAccent, { backgroundColor: p.color }]}
                  />
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* ── Slots Section ─────────────────────────────────────────────── */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Slots</Text>
          <Pressable
            onPress={() => setShowSlotModal(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "rgba(91,164,229,0.1)",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "rgba(91,164,229,0.25)",
            }}
          >
            <Plus size={12} color="#5BA4E5" />
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#5BA4E5" }}>
              Add Slot
            </Text>
          </Pressable>
        </View>

        {slots.length === 0 ? (
          <View style={[styles.emptyCard, { paddingVertical: 24 }]}>
            <Text style={{ fontSize: 24, marginBottom: 6 }}>⏰</Text>
            <Text style={styles.emptyTitle}>No slots yet</Text>
            <Text style={styles.emptyBody}>
              Add time-blocked focus sessions
            </Text>
          </View>
        ) : (
          slots
            .slice()
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((slot) => <HabitSlotCard key={slot.id} slot={slot} />)
        )}
      </ScrollView>

      {/* ── FABs ─────────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 12 }]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={["#5BA4E5", "#3D8BD4"]}
          style={styles.fabGradient}
          start={[0, 0]}
          end={[1, 1]}
        >
          <Plus size={26} color="#fff" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>

      {/* ── Add Habit Modal ────────────────────────────────────────────── */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            Keyboard.dismiss();
            setShowModal(false);
          }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalSheet}
        >
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Habit</Text>
            <Pressable onPress={() => setShowModal(false)}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {/* Name */}
          <TextInput
            style={styles.modalInput}
            value={newName}
            onChangeText={setNewName}
            placeholder="Habit name..."
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />

          {/* Timer target */}
          <Text style={styles.modalLabel}>Daily Focus Target (min)</Text>
          <TextInput
            style={styles.modalInput}
            value={newTargetMinutes}
            onChangeText={setNewTargetMinutes}
            placeholder="e.g. 30  (leave blank to skip)"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            returnKeyType="done"
          />

          {/* Color picker */}
          <Text style={styles.modalLabel}>Color</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  newColor === c && styles.colorDotActive,
                ]}
                onPress={() => setNewColor(c)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, !newName.trim() && { opacity: 0.4 }]}
            onPress={handleAddHabit}
            activeOpacity={0.85}
            disabled={!newName.trim()}
          >
            <Text style={styles.saveBtnText}>Add Habit</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Add Slot Modal ──────────────────────────────────────────────── */}
      <Modal
        visible={showSlotModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSlotModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            Keyboard.dismiss();
            setShowSlotModal(false);
          }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalSheet}
        >
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Slot</Text>
            <Pressable onPress={() => setShowSlotModal(false)}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {/* Name */}
          <TextInput
            style={styles.modalInput}
            value={slotName}
            onChangeText={setSlotName}
            placeholder="Slot name (e.g. Morning Routine)..."
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />

          {/* Icon & Color row */}
          <Text style={styles.modalLabel}>Icon · Color</Text>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <TextInput
              style={[
                styles.modalInput,
                { width: 60, textAlign: "center", fontSize: 22 },
              ]}
              value={slotIcon}
              onChangeText={setSlotIcon}
              maxLength={2}
            />
            <View style={[styles.colorRow, { flex: 1 }]}>
              {COLOR_OPTIONS.map((c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    slotColor === c && styles.colorDotActive,
                  ]}
                  onPress={() => setSlotColor(c)}
                />
              ))}
            </View>
          </View>

          {/* Start time */}
          <Text style={styles.modalLabel}>Start Time</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              style={[styles.modalInput, { flex: 1, textAlign: "center" }]}
              value={slotHour}
              onChangeText={setSlotHour}
              placeholder="HH"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              maxLength={2}
            />
            <Text
              style={{
                color: Colors.textMuted,
                fontSize: 24,
                alignSelf: "center",
              }}
            >
              :
            </Text>
            <TextInput
              style={[styles.modalInput, { flex: 1, textAlign: "center" }]}
              value={slotMin}
              onChangeText={setSlotMin}
              placeholder="MM"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          {/* Duration */}
          <Text style={styles.modalLabel}>Duration (minutes)</Text>
          <TextInput
            style={styles.modalInput}
            value={slotDuration}
            onChangeText={setSlotDuration}
            placeholder="e.g. 30"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.saveBtn, !slotName.trim() && { opacity: 0.4 }]}
            onPress={() => {
              if (!slotName.trim()) return;
              const h = slotHour.padStart(2, "0");
              const m = slotMin.padStart(2, "0");
              const dur = parseInt(slotDuration, 10);
              addSlot({
                id: `slot-${Date.now()}`,
                name: slotName.trim(),
                icon: slotIcon || "⚡",
                color: slotColor,
                startTime: `${h}:${m}`,
                durationMinutes: isNaN(dur) || dur <= 0 ? 30 : dur,
                createdAt: new Date().toISOString(),
              });
              setSlotName("");
              setSlotIcon("⚡");
              setSlotColor("#5BA4E5");
              setSlotHour("07");
              setSlotMin("00");
              setSlotDuration("30");
              setShowSlotModal(false);
            }}
            activeOpacity={0.85}
            disabled={!slotName.trim()}
          >
            <Text style={styles.saveBtnText}>Add Slot</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
// Styles have been moved to ../../src/styles/habits.styles.ts
