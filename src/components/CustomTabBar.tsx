// NeuroTask — "NeuroBar" Custom Tab Bar
// Design: One unified frosted-glass row → [+FAB] [sliding-pill tabs] [AI FAB]
// Animations: smooth spring pill slide · icon scale+color · press bounce only.
// No spinning rings. No scan lines. Clean, premium, intentional.

import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  Flame,
  Plus,
  Sparkles,
  Timer,
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Layout constants ─────────────────────────────────────────────────────────

const { width: SW } = Dimensions.get("window");
const OUTER_M = 6; // bar margin from screen edges
const OUTER_W = SW - OUTER_M * 2;
const BAR_H = 64;
const FAB_W = 50; // left/right action button size
const PH = 6; // horizontal padding inside bar
const IP = 6; // gap between fab and tab section
const TAB_W = OUTER_W - PH * 2 - FAB_W * 2 - IP * 2; // tab section width
const N_TABS = 5;
const SLOT_W = TAB_W / N_TABS;
const PILL_W = 42;
const PILL_H = 42;

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS = [
  { name: "index", Icon: CalendarDays, accent: "#5BA4E5" }, // Blue to match schedule/main page theme
  { name: "tasks", Icon: CheckSquare, accent: "#9D72FF" }, // Purple from old nav for distinction
  { name: "habits", Icon: Flame, accent: "#FFB443" }, // Gold for habits/streaks
  { name: "focus", Icon: Timer, accent: "#4FE179" }, // Green to match focus page theme
  { name: "stats", Icon: BarChart3, accent: "#FF6B35" }, // Orange/Red to match stats page theme
] as const;

type TabCfg = (typeof TABS)[number];

// Pill X offset within the tab section
const pillX = (i: number) => SLOT_W * i + (SLOT_W - PILL_W) / 2;

// ── Sliding Pill ──────────────────────────────────────────────────────────────

const SlidingPill: React.FC<{ idx: number; accent: string }> = ({
  idx,
  accent,
}) => {
  const x = useSharedValue(pillX(idx));

  useEffect(() => {
    x.value = withSpring(pillX(idx), {
      damping: 22,
      stiffness: 200,
      mass: 0.8,
    });
  }, [idx]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <Animated.View style={[s.pillWrap, anim]}>
      {/* Soft gradient fill */}
      <LinearGradient
        colors={[accent + "30", accent + "10"]}
        style={[StyleSheet.absoluteFill, { borderRadius: PILL_H / 2 }]}
        start={[0.5, 0]}
        end={[0.5, 1]}
      />
      {/* Crisp accent border */}
      <View style={[s.pillBorder, { borderColor: accent + "55" }]} />
    </Animated.View>
  );
};

// ── Tab Icon ──────────────────────────────────────────────────────────────────

const TabIcon: React.FC<{
  cfg: TabCfg;
  isActive: boolean;
  onPress: () => void;
}> = ({ cfg, isActive, onPress }) => {
  const { Icon, accent } = cfg;
  const sc = useSharedValue(isActive ? 1.1 : 0.88);
  const ps = useSharedValue(1);

  useEffect(() => {
    sc.value = withSpring(isActive ? 1.1 : 0.88, {
      damping: 20,
      stiffness: 300,
    });
  }, [isActive]);

  const handlePress = () => {
    ps.value = withSequence(
      withTiming(0.8, { duration: 70 }),
      withSpring(1.0, { damping: 14, stiffness: 300 }),
    );
    onPress();
  };

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: sc.value * ps.value }],
  }));

  return (
    <Pressable style={s.tabSlot} onPress={handlePress}>
      <Animated.View style={anim}>
        <Icon
          size={22}
          color={isActive ? accent : "rgba(255,255,255,0.32)"}
          strokeWidth={isActive ? 2.2 : 1.6}
        />
      </Animated.View>
    </Pressable>
  );
};

// ── Side FAB ─────────────────────────────────────────────────────────────────

const SideFab: React.FC<{
  icon: React.ReactNode;
  accent: string;
  onPress: () => void;
}> = ({ icon, accent, onPress }) => {
  const sc = useSharedValue(1);

  const press = () => {
    sc.value = withSequence(
      withTiming(0.84, { duration: 70 }),
      withSpring(1.0, { damping: 14, stiffness: 300 }),
    );
    onPress();
  };

  const anim = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));

  return (
    <TouchableOpacity style={s.fabTouch} onPress={press} activeOpacity={1}>
      <Animated.View style={[s.fabInner, anim]}>
        <LinearGradient
          colors={[accent + "28", accent + "0A"]}
          style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
          start={[0, 0]}
          end={[1, 1]}
        />
        <View style={[s.fabBorder, { borderColor: accent + "44" }]} />
        {icon}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ── Export ────────────────────────────────────────────────────────────────────

export interface CustomTabBarProps extends BottomTabBarProps {
  onAddTask: () => void;
  onAIPress: () => void;
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  navigation,
  onAddTask,
  onAIPress,
}) => {
  const insets = useSafeAreaInsets();
  const visible = state.routes.filter((r) => r.name !== "explore");
  const activeIdx = Math.max(
    0,
    visible.findIndex((r) => r.key === state.routes[state.index].key),
  );
  const activeCfg = TABS[activeIdx] ?? TABS[0];

  // Animates 0→4 as active tab changes — drives border color
  const accentProgress = useSharedValue(activeIdx);
  useEffect(() => {
    accentProgress.value = withTiming(activeIdx, { duration: 380 });
  }, [activeIdx]);

  const INPUT = [0, 1, 2, 3, 4] as const;
  const BORDER_COLORS = TABS.map((t) => t.accent + "88");

  const borderAnim = useAnimatedStyle(() => ({
    borderColor: interpolateColor(accentProgress.value, INPUT, BORDER_COLORS),
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[s.shadow, { bottom: Math.max(insets.bottom, 4) + 10 }]}
    >
      {/* ── Background: Transparent Frosted Glass (Gaussian Blur) ── */}
      <Animated.View style={[StyleSheet.absoluteFill, s.glassBg, borderAnim]}>
        <BlurView
          intensity={75}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* ── Left FAB: Add Task ── */}
      <SideFab
        accent="#4CAF50"
        icon={<Plus size={21} color="#4CAF50" strokeWidth={2.2} />}
        onPress={onAddTask}
      />

      {/* ── Center: Tab Icons + Sliding Pill ── */}
      <View style={s.tabSection}>
        <SlidingPill idx={activeIdx} accent={activeCfg.accent} />
        {visible.map((route, idx) => {
          const cfg = TABS[idx] ?? TABS[0];
          const isActive = idx === activeIdx;
          return (
            <TabIcon
              key={route.key}
              cfg={cfg}
              isActive={isActive}
              onPress={() => {
                const ev = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isActive && !ev.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>

      {/* ── Right FAB: AI Chat ── */}
      <SideFab
        accent="#A78BFA"
        icon={<Sparkles size={19} color="#A78BFA" strokeWidth={2} />}
        onPress={onAIPress}
      />
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Outer view carries the shadow (no overflow:hidden so shadow isn't clipped)
  shadow: {
    position: "absolute",
    left: OUTER_M,
    right: OUTER_M,
    height: BAR_H,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingHorizontal: PH,
    gap: IP,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.48,
    shadowRadius: 24,
    elevation: 24,
  },

  // Background matching the "Add Task" popup exactly
  glassBg: {
    borderRadius: 22,
    borderWidth: 1.2,
    backgroundColor: "rgba(8,12,20,0.1)",
    overflow: "hidden",
  },

  // Side FABs
  fabTouch: {
    width: FAB_W,
    height: FAB_W,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  fabInner: {
    width: FAB_W,
    height: FAB_W,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fabBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
  },

  // Tab section
  tabSection: {
    flex: 1,
    height: BAR_H,
    flexDirection: "row",
    alignItems: "center",
  },

  // Each tab icon slot
  tabSlot: {
    flex: 1,
    height: BAR_H,
    alignItems: "center",
    justifyContent: "center",
  },

  // Sliding pill
  pillWrap: {
    position: "absolute",
    width: PILL_W,
    height: PILL_H,
    borderRadius: PILL_H / 2,
    top: (BAR_H - PILL_H) / 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  pillBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: PILL_H / 2,
    borderWidth: 1,
  },
});
