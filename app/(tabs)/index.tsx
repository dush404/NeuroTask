// NeuroTask — Dashboard UI Exact Match (Exoplan Style)
// Static UI recreation matching reference image down to the pixel

import { LinearGradient } from "expo-linear-gradient";
import {
    Activity,
    Dumbbell as DumbbellIcon,
    Plus,
    Utensils,
} from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
// PageHeader is now rendered in (tabs)/_layout.tsx for persistence
import {
    TimelineBlock,
    TimelineTask,
} from "../../src/components/TimelineBlock";
import { indexStyles as styles } from "../../src/styles/index.styles";

// ── Icons ──────────────────────────────────────────────────────────────────────

// Subcomponents representing custom aesthetic icons for specific timeline tasks

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

const RunIcon = () => <Activity size={14} color="#E2E4E9" />;

const ForkKnife = () => <Utensils size={14} color="#77A6B6" />;

const Dumbbell = () => <DumbbellIcon size={14} color="#8EAC8E" />;

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

/**
 * DashboardExact - The primary schedule view mimicking the reference Exoplan UI.
 * Orchestrates the header toggle state, score rendering, and mapping the
 * TimelineBlocks for daily scheduled content.
 */
export default function DashboardExact() {
  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, 20) + 60;

  return (
    <View style={styles.root}>
      {/* ── Day Header Band (Green Gradient) like the screenshot ── */}
      {/* Set to pointerEvents="none" so clicks pass through to components underneath */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={["#0D1B2A", "#050A11", "#000000"]}
          style={{ height: 280 }}
          start={[0.5, 0]}
          end={[0.5, 1]}
        />
      </View>

      <View style={[styles.headerArea, { paddingTop: headerHeight }]}>
        {/* Week Strip — PageHeader (menu + ring) is now in _layout.tsx */}
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
                <Text style={[styles.dayNum, isActive && styles.dayNumActive]}>
                  {num}
                </Text>

                {/* Underline for active */}
                {isActive && <View style={styles.activeUnderline} />}
              </View>
            );
          })}
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
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

/**
 * Centralized styling configuration defining the pixel-perfect layout,
 * colors, typography spacing, sizing, and positioning rules.
 */
// Styles moved to ../../src/styles/index.styles.ts
