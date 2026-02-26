// NeuroTask — TimelineBlock (Pixel-Perfect Exoplan Style)
// Full curved SVG lines, striped cards, horizontal buffer lines, custom icons

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Radius } from "../constants/theme";
import { StripedBackground } from "./StripedBackground";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CardVariant = "default" | "teal" | "green" | "compact" | "outlined";

export type LineStyle =
  | "straight-muted"
  | "straight-active"
  | "curve-right"
  | "curve-left"
  | "fade-out"
  | "none";

export interface TimelineTask {
  id: string;
  title: string;
  subtitle?: string;
  timeStr: string;
  status: "todo" | "in_progress" | "done";
  variant?: CardVariant;
  rightEmoji?: React.ReactNode;
  leftCategoryIcon?: React.ReactNode;
  bufferText?: string; // If present, renders buffer zone *above* this block
  lineStyle?: LineStyle;
  nodeState?: "active" | "muted" | "none";
}

interface TimelineBlockProps {
  task: TimelineTask;
  onPress?: () => void;
}

// ── Card Themes ───────────────────────────────────────────────────────────────

const CARD_THEMES: Record<
  CardVariant,
  { bg: string; border: string; textColor: string; stripeOpacity: number }
> = {
  default: {
    bg: "#1D2024",
    border: "rgba(255,255,255,0.04)",
    textColor: "#E2E4E9",
    stripeOpacity: 0.05,
  },
  teal: {
    bg: "#18323E",
    border: "rgba(14,165,233,0.15)",
    textColor: "#A9D9EB",
    stripeOpacity: 0.06,
  },
  green: {
    bg: "#2A3D1E",
    border: "rgba(76,175,80,0.2)",
    textColor: "#CCF4D0",
    stripeOpacity: 0.06,
  },
  compact: {
    bg: "#1B2321",
    border: "rgba(255,255,255,0.04)",
    textColor: "#A7B3AF",
    stripeOpacity: 0.05,
  },
  outlined: {
    bg: "rgba(255,255,255,0)",
    border: "rgba(255,255,255,0.15)",
    textColor: "#E2E4E9",
    stripeOpacity: 0,
  },
};

// ── SVG Line Renderer ──────────────────────────────────────────────────────────

const SVGBody = ({ lineStyle }: { lineStyle: LineStyle }) => {
  const WIDTH = 24;
  const cx = 12;

  if (lineStyle === "none") return null;

  if (lineStyle === "straight-muted") {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        <Path d={`M${cx},0 V200`} stroke="#1F3526" strokeWidth={2} />
      </Svg>
    );
  }
  if (lineStyle === "straight-active") {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        <Path d={`M${cx},0 V200`} stroke="#55B66A" strokeWidth={2} />
      </Svg>
    );
  }
  if (lineStyle === "fade-out") {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        <Path
          d={`M${cx},0 V60`}
          stroke="#55B66A"
          strokeWidth={2}
          opacity={0.3}
        />
      </Svg>
    );
  }
  if (lineStyle === "curve-right") {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        {/* Enters center, curves right to x=22, then down */}
        <Path
          d={`M${cx},0 Q${cx},40 22,50 T22,200`}
          stroke="#55B66A"
          strokeWidth={2}
          fill="none"
        />
      </Svg>
    );
  }
  if (lineStyle === "curve-left") {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        {/* Enters right x=22, curves left back to center */}
        <Path
          d={`M22,0 Q22,40 ${cx},60 T${cx},200`}
          stroke="#55B66A"
          strokeWidth={2}
          fill="none"
        />
      </Svg>
    );
  }
  return null;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const TimelineBlock: React.FC<TimelineBlockProps> = ({
  task,
  onPress,
}) => {
  const isDone = task.status === "done";
  const variant = task.variant ?? "default";
  const theme = CARD_THEMES[variant];
  const isCompact = variant === "compact";
  const isOutlined = variant === "outlined";

  return (
    <View style={styles.block}>
      {/* ── Buffer & rest zone ─────────────────────────────────────────── */}
      {task.bufferText && (
        <View style={styles.bufferSpace}>
          <View style={styles.bufferLineLeft} />
          <View style={styles.bufferIconBox}>
            <Svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={3}
            >
              <Path d="M12 2L2 12l10 10 10-10L12 2z" />
            </Svg>
          </View>
          <Text style={styles.bufferText}>{task.bufferText}</Text>
          <View style={styles.bufferLineRight} />
        </View>
      )}

      {/* ── Main row ──────────────────────────────────────────────────── */}
      <View style={[styles.row, isCompact && styles.rowCompact]}>
        {/* Left column (Time + top icon) */}
        <View style={styles.leftCol}>
          <View style={styles.leftIconContainer}>{task.leftCategoryIcon}</View>
          <Text style={styles.timeText}>
            {task.timeStr.replace(" PM", "").replace(" AM", "")}
            <Text style={styles.timeAmpm}>
              {task.timeStr.includes("PM")
                ? " PM"
                : task.timeStr.includes("AM")
                  ? " AM"
                  : ""}
            </Text>
          </Text>
        </View>

        {/* Vertical line area */}
        <View
          style={[styles.lineWrapper, isCompact && styles.lineWrapperCompact]}
        >
          <SVGBody lineStyle={task.lineStyle || "straight-muted"} />

          {/* Node */}
          {task.nodeState === "active" && (
            <View style={styles.nodeActiveGlow}>
              <View style={styles.nodeActive} />
            </View>
          )}
          {task.nodeState === "muted" && <View style={styles.nodeMuted} />}
        </View>

        {/* Card */}
        <Pressable
          style={[
            styles.card,
            { backgroundColor: theme.bg, borderColor: theme.border },
            isCompact && styles.cardCompact,
            isOutlined && styles.cardOutlined,
            variant === "green" && styles.cardGreen,
          ]}
          onPress={onPress}
          android_ripple={{ color: "rgba(255,255,255,0.06)" }}
        >
          {theme.stripeOpacity > 0 && (
            <StripedBackground opacity={theme.stripeOpacity} />
          )}

          {/* Optional Accent bars for compact cards */}
          {isCompact && !isDone && <View style={styles.compactAccentTeal} />}

          <View style={[styles.cardBody, isCompact && styles.cardBodyCompact]}>
            <View style={styles.cardMain}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.textColor },
                  isCompact && styles.cardTitleCompact,
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>

              {task.subtitle && (
                <View style={styles.subtitleRow}>
                  <Text style={styles.subtitleText}>{task.subtitle}</Text>
                </View>
              )}
            </View>

            {/* Right container */}
            <View style={styles.cardRight}>{task.rightEmoji}</View>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  block: {
    position: "relative",
  },

  // Buffer Zone
  bufferSpace: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
    marginLeft: 14,
    marginRight: 16,
  },
  bufferLineLeft: {
    width: 28,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  bufferIconBox: {
    width: 14,
    alignItems: "center",
  },
  bufferText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    fontStyle: "italic",
    marginLeft: 8,
    marginRight: 8,
    letterSpacing: 0.2,
  },
  bufferLineRight: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 54,
  },
  rowCompact: {
    minHeight: 38,
  },

  // Left col
  leftCol: {
    width: 46,
    paddingTop: 8,
    alignItems: "flex-end",
    paddingRight: 6,
  },
  leftIconContainer: {
    height: 12,
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 2,
    marginRight: -2,
  },
  timeText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "500",
  },
  timeAmpm: {
    fontSize: 8,
    color: "rgba(255,255,255,0.35)",
  },

  // Vertical line wrapper
  lineWrapper: {
    width: 24,
    alignItems: "center",
    overflow: "visible",
  },
  lineWrapperCompact: {
    // Keeps it centered correctly for smaller cards
  },
  nodeActiveGlow: {
    position: "absolute",
    top: 13,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(85,182,106,0.35)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  nodeActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7BEA92",
  },
  nodeMuted: {
    position: "absolute",
    top: 15,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.3)",
    zIndex: 10,
  },

  // Card
  card: {
    flex: 1,
    marginLeft: 6,
    marginRight: 16,
    marginBottom: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardCompact: {
    borderRadius: Radius.sm,
    marginBottom: 4,
  },
  cardOutlined: {
    borderRadius: 20,
    borderWidth: 1.5,
  },
  cardGreen: {
    minHeight: 88, // Tall block for resistance training
  },
  compactAccentTeal: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#166580",
    opacity: 0.7,
  },

  cardBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  cardBodyCompact: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  cardMain: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  cardTitleCompact: {
    fontSize: 12,
    fontWeight: "500",
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  subtitleText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
  cardRight: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 20,
  },
});
