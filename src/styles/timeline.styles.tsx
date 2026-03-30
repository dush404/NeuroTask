import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { Radius } from "../constants/theme";
import { CardVariant, LineStyle } from "../types/timeline";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const HOUR_HEIGHT = 56;
export const MIN_CARD_HEIGHT = 56;

/**
 * SVGBody Component for rendering timeline lines
 */
export const SVGBody: React.FC<{
  lineStyle: LineStyle;
  hasNode?: boolean;
}> = ({ lineStyle, hasNode = true }) => {
  const cx = 12;
  if (lineStyle === "none") return null;

  const straightPath = `M${cx},0 V2000`;
  const bendPath = `M${cx},0 Q24,20 ${cx},40 V2000`;
  const pathD =
    hasNode && lineStyle !== "straight-active" ? bendPath : straightPath;

  if (lineStyle === "straight-muted") {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        <Path
          d={pathD}
          stroke="rgba(31, 53, 38, 0.4)"
          strokeWidth={4}
          fill="none"
        />
        <Path
          d={pathD}
          stroke="#1F3526"
          strokeWidth={2}
          strokeDasharray="6 6"
          fill="none"
        />
      </Svg>
    );
  }
  if (lineStyle === "straight-active") {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0EA5E9" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#4FE179" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path
          d={pathD}
          stroke="url(#glowGrad)"
          strokeWidth={6}
          opacity={0.25}
          fill="none"
        />
        <Path d={pathD} stroke="url(#glowGrad)" strokeWidth={2} fill="none" />
      </Svg>
    );
  }
  if (lineStyle === "fade-out") {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0EA5E9" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#4FE179" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path
          d={hasNode ? `M${cx},0 Q24,20 ${cx},40 V60` : `M${cx},0 V60`}
          stroke="url(#glowGrad)"
          strokeWidth={2}
          opacity={0.3}
          fill="none"
        />
      </Svg>
    );
  }
  if (lineStyle === "curve-right") {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0EA5E9" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#4FE179" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path
          d={`M${cx},0 Q${cx},40 22,50 T22,2000`}
          stroke="url(#glowGrad)"
          strokeWidth={2}
          fill="none"
        />
      </Svg>
    );
  }
  if (lineStyle === "curve-left") {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0EA5E9" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#4FE179" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path
          d={`M22,0 Q22,40 ${cx},60 T${cx},2000`}
          stroke="url(#glowGrad)"
          strokeWidth={2}
          fill="none"
        />
      </Svg>
    );
  }
  return null;
};

// Themes configuration
export const themes: Record<CardVariant, any> = {
  default: {
    bg: "rgba(29, 32, 36, 0.6)",
    border: "rgba(255,255,255,0.08)",
    textColor: "#E2E4E9",
    stripeOpacity: 0.05,
    shadowColor: "rgba(255,255,255,0.05)",
  },
  teal: {
    bg: "rgba(24, 50, 62, 0.6)",
    border: "rgba(14,165,233,0.3)",
    textColor: "#A9D9EB",
    stripeOpacity: 0.06,
    shadowColor: "rgba(14,165,233,0.2)",
  },
  green: {
    bg: "rgba(42, 61, 30, 0.6)",
    border: "rgba(76,175,80,0.3)",
    textColor: "#CCF4D0",
    stripeOpacity: 0.06,
    shadowColor: "rgba(76,175,80,0.2)",
  },
  compact: {
    bg: "rgba(27, 35, 33, 0.6)",
    border: "rgba(255,255,255,0.08)",
    textColor: "#A7B3AF",
    stripeOpacity: 0.05,
  },
  outlined: {
    bg: "rgba(255,255,255,0.02)",
    border: "rgba(255,255,255,0.2)",
    textColor: "#E2E4E9",
    stripeOpacity: 0,
  },
  purple: {
    bg: "rgba(45, 27, 62, 0.6)",
    border: "rgba(168,85,247,0.3)",
    textColor: "#E9D5FF",
    stripeOpacity: 0.05,
    shadowColor: "rgba(168,85,247,0.2)",
  },
  orange: {
    bg: "rgba(63, 34, 18, 0.6)",
    border: "rgba(249,115,22,0.3)",
    textColor: "#FFEDD5",
    stripeOpacity: 0.05,
    shadowColor: "rgba(249,115,22,0.2)",
  },
  pink: {
    bg: "rgba(62, 27, 45, 0.6)",
    border: "rgba(236,72,153,0.3)",
    textColor: "#FCE7F3",
    stripeOpacity: 0.05,
    shadowColor: "rgba(236,72,153,0.2)",
  },
  red: {
    bg: "rgba(62, 24, 24, 0.6)",
    border: "rgba(239,68,68,0.3)",
    textColor: "#FEE2E2",
    stripeOpacity: 0.05,
    shadowColor: "rgba(239,68,68,0.2)",
  },
};

export const styles = StyleSheet.create({
  block: {
    position: "relative",
  },
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
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: MIN_CARD_HEIGHT,
  },
  rowCompact: {
    minHeight: MIN_CARD_HEIGHT,
  },
  leftCol: {
    width: 46,
    paddingTop: 10,
    alignItems: "flex-end",
    paddingRight: 6,
  },
  leftIconContainer: {
    height: 0,
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 0,
    marginRight: -2,
    top: 8,
    left: 14,
  },
  timeText: {
    fontSize: 11.5,
    color: "rgba(255, 255, 255, 0.71)",
    fontWeight: "500",
    lineHeight: 14,
  },
  timeTextActive: {
    color: "#4FE179",
    fontWeight: "bold",
    textShadowColor: "rgba(79, 225, 121, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  timeAmpm: {
    fontSize: 8,
    color: "rgba(255,255,255,0.35)",
  },
  lineWrapper: {
    width: 24,
    alignItems: "center",
    overflow: "visible",
  },
  lineWrapperCompact: {},
  nodeActiveGlow: {
    position: "absolute",
    top: 10,
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    transform: [{ rotate: "45deg" }],
    backgroundColor: "rgba(79, 225, 121, 0.25)",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  nodeActive: {
    width: 6,
    height: 6,
    backgroundColor: "#4FE179",
    shadowColor: "#4FE179",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  nodeMuted: {
    position: "absolute",
    top: 10,
    width: 6,
    height: 6,
    borderRadius: 1,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    zIndex: 10,
    transform: [{ translateX: 0 }, { rotate: "45deg" }],
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.79)",
  },
  cardContainer: {
    flex: 1,
    marginLeft: 6,
    marginRight: 16,
    marginBottom: 8,
    position: "relative",
  },
  swipeBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(85,182,106,0.15)",
    borderRadius: Radius.md,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 20,
    borderWidth: 1,
    borderColor: "rgba(85,182,106,0.3)",
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  cardCompact: {
    borderRadius: Radius.sm,
    marginBottom: 4,
  },
  cardOutlined: {
    borderRadius: 20,
    borderWidth: 0,
  },
  cardBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  subtitleText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
  toGoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  toGoLocationBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  toGoLocationInfo: {
    alignItems: "flex-start",
  },
  toGoArrowWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  toGoDestInfo: {
    alignItems: "flex-end",
  },
  toGoLocationName: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  toGoDateText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
  },
  dotGlowContainerBase: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  checkboxBase: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  subtaskTextBase: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  subtaskCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  subtasksContainer: {
    marginTop: 12,
    marginLeft: 26,
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  currentLineWrapper: {
    position: "absolute",
    left: 12,
    width: SCREEN_WIDTH - 60,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 999,
  },
  redDotOuter: {
    position: "relative",
    width: 8,
    height: 8,
    marginLeft: -4,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRed: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 8,
    backgroundColor: "#EF4444",
  },
  mainRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
  },
  redLine: {
    flex: 1,
    height: 1.5,
    marginLeft: 2,
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 4,
  },
  emptySlotContainer: {
    flex: 1,
    justifyContent: "center",
  },
  emptySlotLine: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    width: "100%",
  },
  subtitleWithMargin: {
    marginLeft: 26,
    marginTop: 4,
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
  projectDatesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 26,
    marginTop: 12,
  },
  projectDateText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
  },
  projectDateArrow: {
    color: "rgba(255,255,255,0.5)",
    marginHorizontal: 8,
  },
  progressBarContainer: {
    width: 14,
    height: "100%",
    alignItems: "center",
    paddingVertical: 4,
  },
  progressBarTrack: {
    width: 10,
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  progressBarFill: {
    width: "100%",
    borderRadius: 10,
  },
  normalTaskHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  normalTaskTitleBox: {
    marginLeft: 10,
  },
  cardTitleLarge: {
    fontSize: 15,
    fontWeight: "700",
  },
  normalTaskDate: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    marginTop: 2,
  },
  normalTaskEndBox: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  endAtText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "600",
  },
  expandButton: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -4,
  },
});
