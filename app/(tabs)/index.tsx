// NeuroTask — Dashboard UI Exact Match (Exoplan Style)
// Static UI recreation matching reference image down to the pixel

import { LinearGradient } from "expo-linear-gradient";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { NavigationMenu } from "../../src/components/NavigationMenu";
import {
    TimelineBlock,
    TimelineTask,
} from "../../src/components/TimelineBlock";

// ── Icons ──────────────────────────────────────────────────────────────────────

const MenuIcon = () => (
  <Svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth={2.5}
  >
    <Path d="M4 8h16 M4 16h10" />
  </Svg>
);

const ArrowDL = ({ color }: { color: string }) => (
  <Text
    style={{
      color,
      fontSize: 13,
      fontWeight: "bold",
      marginLeft: -4,
      marginTop: -2,
    }}
  >
    ↙
  </Text>
);

const ArrowDR = ({ color }: { color: string }) => (
  <Text
    style={{
      color,
      fontSize: 13,
      fontWeight: "bold",
      marginLeft: -4,
      marginTop: -2,
    }}
  >
    ↘
  </Text>
);

const RunIcon = () => <Text style={{ fontSize: 12, marginRight: -2 }}>🏃</Text>;

const ForkKnife = () => (
  <Text style={{ color: "#77A6B6", fontSize: 16 }}>🍴</Text>
);

const Dumbbell = () => (
  <Text style={{ color: "#8EAC8E", fontSize: 16 }}>🏋️‍♂️</Text>
);

const CheckCircleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill="#fff" />
    <Path
      d="M8 12.5l3 3 5-6"
      stroke="#1D2024"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Exact Reference Data ───────────────────────────────────────────────────────

const EXACT_DEMO_SLOTS: TimelineTask[] = [
  {
    id: "t0",
    title: "", // Empty block just for the 3 PM label in the screenshot
    timeStr: "3 PM",
    status: "todo",
    lineStyle: "straight-muted",
    nodeState: "muted",
    bufferText: "Buffer & rest zone",
    leftCategoryIcon: <ArrowDL color="#688463" />, // Greenish arrow
    variant: "outlined",
  },
  {
    id: "t1",
    title: "UI Demo",
    timeStr: "3:30",
    status: "todo",
    variant: "default",
    lineStyle: "straight-muted",
    nodeState: "muted",
    bufferText: "Buffer & rest zone",
    leftCategoryIcon: <ArrowDL color="#D4A73D" />, // Orange arrow
  },
  {
    id: "t2",
    title: "Pre workout lunch",
    timeStr: "4 PM",
    status: "todo",
    variant: "teal",
    rightEmoji: <ForkKnife />,
    lineStyle: "straight-muted",
    nodeState: "none",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t3",
    title: "Daily Standup",
    timeStr: "5 PM",
    status: "todo",
    variant: "default",
    lineStyle: "straight-muted",
    nodeState: "none",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t4",
    title: "Resistance Training",
    subtitle: "↪ Commute included",
    timeStr: "6 PM",
    status: "todo",
    variant: "green",
    rightEmoji: <Dumbbell />,
    leftCategoryIcon: <RunIcon />,
    lineStyle: "curve-right",
    nodeState: "active",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t5",
    title: "Book flight tickets",
    timeStr: "8 PM",
    status: "done",
    variant: "teal",
    rightEmoji: <CheckCircleIcon />,
    leftCategoryIcon: <ArrowDR color="#55B66A" />,
    lineStyle: "curve-left",
    nodeState: "active",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t6",
    title: "Order protein",
    timeStr: "",
    status: "todo",
    variant: "compact",
    rightEmoji: (
      <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>
        Tap to complete
      </Text>
    ),
    lineStyle: "straight-active",
    nodeState: "none",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t7",
    title: "Order vitamin D",
    timeStr: "9 PM",
    status: "done",
    variant: "compact",
    rightEmoji: (
      <Text style={{ color: "#E2E4E9", fontSize: 10 }}>✓ Completed</Text>
    ),
    lineStyle: "straight-active",
    nodeState: "none",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t8",
    title: "Exoplan Discussion",
    timeStr: "10 PM",
    status: "todo",
    variant: "outlined",
    lineStyle: "straight-active",
    nodeState: "none",
    bufferText: "Buffer & rest zone",
  },
  {
    id: "t9",
    title: "Update table",
    timeStr: "10:15",
    status: "todo",
    variant: "default",
    leftCategoryIcon: <ArrowDL color="#D4A73D" />,
    lineStyle: "fade-out",
    nodeState: "none",
    bufferText: "Buffer & rest zone",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardExact() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {/* ── Day Header Band (Green Gradient) like the screenshot ── */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["#1B3122", "#0F1A13", "#000000"]}
          style={{ height: 280 }}
          start={[0.5, 0]}
          end={[0.5, 1]}
        />
      </View>

      <View style={styles.headerArea}>
        {/* Status bar mock spacing removed by SafeAreaView */}

        {/* Top Header Row */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.menuBtn}
            activeOpacity={0.8}
            onPress={() => setMenuVisible(true)}
          >
            <MenuIcon />
          </TouchableOpacity>

          {/* Week Strip */}
          <View style={styles.weekStrip}>
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
              const num = 20 + i;
              const isActive = day === "W" && num === 22;

              return (
                <View key={i} style={styles.dayBox}>
                  {/* Red dot indicator */}
                  {isActive && <View style={styles.redDot} />}

                  <Text
                    style={[styles.dayLabel, isActive && styles.dayLabelActive]}
                  >
                    {day}
                  </Text>
                  <Text
                    style={[styles.dayNum, isActive && styles.dayNumActive]}
                  >
                    {num}
                  </Text>

                  {/* Underline for active */}
                  {isActive && <View style={styles.activeUnderline} />}
                </View>
              );
            })}
          </View>

          {/* Score Ring */}
          <View style={styles.scoreRingWrapper}>
            {/* SVG Ring background overlapping circular trace */}
            <Svg width="36" height="36" style={{ position: "absolute" }}>
              <Circle
                cx="18"
                cy="18"
                r="15"
                stroke="#1A3324"
                strokeWidth="4"
                fill="none"
              />
              {/* Active portion showing 68% */}
              <Circle
                cx="18"
                cy="18"
                r="15"
                stroke="#4FE179"
                strokeWidth="4"
                fill="none"
                strokeDasharray="94"
                strokeDashoffset="30"
                strokeLinecap="round"
              />
            </Svg>
            <Text style={styles.scoreText}>68</Text>
          </View>
        </View>
      </View>

      {/* ── Timeline ─────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.timelineScroll}
        contentContainerStyle={styles.timelineContent}
        showsVerticalScrollIndicator={false}
      >
        {EXACT_DEMO_SLOTS.map((slot, index) => {
          // Skip drawing actual card for the first block since it's just the '3 PM' line label
          if (slot.id === "t0") {
            return (
              <View key={slot.id} style={{ height: 60, marginTop: 10 }}>
                <TimelineBlock task={slot} />
                {/* Obscure the card visually because the reference just has a label and line fading in from above */}
                <View
                  style={{
                    position: "absolute",
                    right: 0,
                    left: 60,
                    top: 0,
                    bottom: 0,
                    backgroundColor: "#000",
                  }}
                />
              </View>
            );
          }
          return <TimelineBlock key={slot.id} task={slot} />;
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Floating Action Button (FAB) ─────────────────────────────── */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        {/* Glow behind FAB */}
        <View style={styles.fabGlow} />
        <View style={styles.fabInner}>
          <Plus size={22} color="#fff" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>

      {/* Slide-out Navigation Menu */}
      <NavigationMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },

  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    zIndex: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Menu Btn
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2B322F",
    alignItems: "center",
    justifyContent: "center",
  },

  // Week Strip
  weekStrip: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-evenly",
    marginHorizontal: 12,
  },
  dayBox: {
    alignItems: "center",
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: -4,
    right: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F03A47",
  },
  dayLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
    marginBottom: 4,
  },
  dayLabelActive: {
    color: "#fff",
  },
  dayNum: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
  },
  dayNumActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  activeUnderline: {
    marginTop: 4,
    width: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  // Score Ring
  scoreRingWrapper: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },

  // Timeline
  timelineScroll: {
    flex: 1,
  },
  timelineContent: {
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 100 : 80,
    right: 28,
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  fabGlow: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(85,182,106,0.3)",
    top: -4,
    left: -4,
  },
  fabInner: {
    width: "100%",
    height: "100%",
    borderRadius: 23,
    backgroundColor: "#1A221F",
    borderWidth: 1.5,
    borderColor: "#4FE179",
    alignItems: "center",
    justifyContent: "center",
  },
});
