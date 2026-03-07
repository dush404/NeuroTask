// NeuroTask — TimelineBlock (Pixel-Perfect Exoplan Style)
// Full curved SVG lines, striped cards, horizontal buffer lines, custom icons

import { Check } from "lucide-react-native";
import React, { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { Colors, Radius } from "../constants/theme";
import { springConfig } from "../utils/motionConfig";
import { StripedBackground } from "./StripedBackground";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CardVariant =
  | "default"
  | "teal"
  | "green"
  | "compact"
  | "outlined"
  | "purple"
  | "orange"
  | "pink"
  | "red";

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
  durationMinutes?: number;
  isEmptyHour?: boolean;
  isCurrentHour?: boolean;
  currentMinute?: number;
  currentMinuteOffset?: number;
  priority?: number;
  endTimeStr?: string;
  subtasks?: { id: string; title: string; completed?: boolean }[];
}

interface TimelineBlockProps {
  task: TimelineTask;
  onPress?: () => void;
  onSwipeComplete?: (id: string) => void;
  zoomScale?: SharedValue<number>;
}

// ── Card Themes ───────────────────────────────────────────────────────────────

const CARD_THEMES: Record<
  CardVariant,
  {
    bg: string;
    border: string;
    textColor: string;
    stripeOpacity: number;
    shadowColor?: string;
  }
> = {
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

// ── SVG Line Renderer ──────────────────────────────────────────────────────────

const SVGBody = ({
  lineStyle,
  hasNode = true,
}: {
  lineStyle: LineStyle;
  hasNode?: boolean;
}) => {
  const WIDTH = 24;
  const cx = 12;

  if (lineStyle === "none") return null;

  const straightPath = `M${cx},0 V2000`;
  const bendPath = `M${cx},0 Q24,20 ${cx},40 V2000`;
  const pathD =
    hasNode && lineStyle !== "straight-active" ? bendPath : straightPath;

  if (lineStyle === "straight-muted") {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        {/* Subtle background glow */}
        <Path
          d={pathD}
          stroke="rgba(31, 53, 38, 0.4)"
          strokeWidth={4}
          fill="none"
        />
        {/* Dashed primary line to signify future/pending task */}
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
        {/* Outer neon ambient glow */}
        <Path
          d={pathD}
          stroke="url(#glowGrad)"
          strokeWidth={6}
          opacity={0.25}
          fill="none"
        />
        {/* Crisp burning core */}
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

// ── Component ─────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

// 🟢 TWEAK THESE VALUES HERE to test the perfect height
const HOUR_HEIGHT = 50; // How tall 1 hour is at 1.0x scale
const MIN_CARD_HEIGHT = 50; // The absolute minimum height a card will shrink to

export const TimelineBlock: React.FC<TimelineBlockProps> = ({
  task,
  onPress,
  onSwipeComplete,
  zoomScale,
}) => {
  const isDone = task.status === "done";
  const variant = task.variant ?? "default";
  const theme = CARD_THEMES[variant];
  const isCompact = variant === "compact";
  const isOutlined = variant === "outlined";

  // Auto-convert dotted line to solid active line when done
  // If done, force a solid line, unless it's the special 'fade-out' style for the last item.
  const effectiveLineStyle =
    isDone && task.lineStyle !== "fade-out"
      ? "straight-active"
      : task.lineStyle || "straight-muted";

  const priorityColor =
    task.priority === 1
      ? Colors.priorityHigh
      : task.priority === 2
        ? Colors.priorityMedium
        : task.priority === 3
          ? Colors.priorityLow
          : task.priority === 4
            ? "#8E8E93"
            : CARD_THEMES[variant].border;

  const bgHex = priorityColor.length === 7 ? priorityColor : "#ffffff";
  const bgOpacity = "20"; // 12% opacity roughly
  const priorityBg = bgHex + bgOpacity;

  // Height scaling via duration
  const baseMinHeight = Math.max(
    HOUR_HEIGHT,
    (task.durationMinutes || 0) * (HOUR_HEIGHT / 120),
  );

  const cardHeightStyle = useAnimatedStyle(() => {
    const scale = zoomScale ? zoomScale.value : 1;
    const computedHeight = baseMinHeight * scale;
    const maxHeightLimit = SCREEN_HEIGHT * 0.4; // Slightly more room

    // Clamp the final visible height to ensure it never goes below MIN_CARD_HEIGHT
    const finalHeight = Math.max(
      MIN_CARD_HEIGHT,
      Math.min(computedHeight, maxHeightLimit),
    );
    return { minHeight: finalHeight, maxHeight: finalHeight };
  });

  const emptyHourStyle = useAnimatedStyle(() => {
    const scale = zoomScale ? zoomScale.value : 1;
    return { height: HOUR_HEIGHT * scale };
  });

  const currentTimeLineStyle = useAnimatedStyle(() => {
    const scale = zoomScale ? zoomScale.value : 1;

    // The visual height that corresponds to exactly 1 hour of time for this zooming state.
    const ONE_HOUR_VISUAL_HEIGHT = Math.max(
      MIN_CARD_HEIGHT,
      HOUR_HEIGHT * scale,
    );

    // Divide the hour into 60 equal minute divisions
    const ONE_MINUTE_HEIGHT = ONE_HOUR_VISUAL_HEIGHT / 60;

    // 17px = node center offset (node top:10 + half-height:14/2 = 17)
    // Snap the red line to the exact minute division
    const minuteOffset =
      Math.floor(task.currentMinuteOffset ?? task.currentMinute ?? 0) *
      ONE_MINUTE_HEIGHT;

    return {
      top: 17 + minuteOffset,
    };
  });

  // Swipe logic
  const translateX = useSharedValue(0);
  const isSwiping = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart(() => {
      isSwiping.value = true;
    })
    .onUpdate((e) => {
      if (isDone || !onSwipeComplete) return;
      translateX.value = Math.max(
        0,
        Math.min(e.translationX, SCREEN_WIDTH * 0.4),
      );
    })
    .onEnd(() => {
      if (isDone || !onSwipeComplete) return;
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH, springConfig, () => {
          if (onSwipeComplete) {
            runOnJS(onSwipeComplete)(task.id);
          }
        });
      } else {
        translateX.value = withSpring(0, springConfig);
      }
      isSwiping.value = false;
    });

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: isDone ? 0.6 : 1,
  }));

  const bgIconAnimStyle = useAnimatedStyle(() => {
    const opacity = translateX.value / SWIPE_THRESHOLD;
    const scale = Math.min(1.2, Math.max(0.5, opacity));
    return {
      opacity: Math.min(1, opacity),
      transform: [{ scale }],
    };
  });

  const pulseAnim = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (task.isCurrentHour) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.6, { duration: 1500 }),
          withTiming(1, { duration: 1500 }),
        ),
        -1,
        true,
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500 }),
          withTiming(0.2, { duration: 1500 }),
        ),
        -1,
        true,
      );
    }
  }, [task.isCurrentHour]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: pulseOpacity.value,
  }));

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
          <Text
            style={[
              styles.timeText,
              task.isCurrentHour && styles.timeTextActive,
            ]}
          >
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
          <SVGBody lineStyle={effectiveLineStyle} hasNode={!task.isEmptyHour} />

          {/* Node */}
          {task.nodeState === "active" && (
            <View
              style={[styles.nodeActiveGlow, !task.isEmptyHour && { left: 12 }]}
            >
              <View style={styles.nodeActive} />
            </View>
          )}
          {task.nodeState === "muted" && <View style={styles.nodeMuted} />}

          {/* Current Time Indicator Red Line */}
          {task.isCurrentHour && task.currentMinute !== undefined && (
            <Animated.View
              style={[
                {
                  position: "absolute",
                  left: 12,
                  width: SCREEN_WIDTH - 60,
                  flexDirection: "row",
                  alignItems: "center",
                  zIndex: 999,
                },
                currentTimeLineStyle,
              ]}
              pointerEvents="none"
            >
              <View
                style={{
                  position: "relative",
                  width: 8,
                  height: 8,
                  marginLeft: -4,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      width: 10,
                      height: 10,
                      borderRadius: 8,
                      backgroundColor: "#EF4444",
                    },
                    pulseStyle,
                  ]}
                />
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#EF4444",
                    shadowColor: "#EF4444",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 6,
                    elevation: 5,
                  }}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  height: 1.5,
                  marginLeft: 2,
                  backgroundColor: "#EF4444",
                  shadowColor: "#EF4444",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 3,
                  elevation: 4,
                }}
              />
            </Animated.View>
          )}
        </View>

        {/* Card */}
        <View style={styles.cardContainer}>
          {task.isEmptyHour ? (
            <Animated.View
              style={[{ flex: 1, justifyContent: "center" }, emptyHourStyle]}
            >
              <View
                style={{
                  height: 1,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  width: "100%",
                }}
              />
            </Animated.View>
          ) : (
            <>
              {!isDone && onSwipeComplete && (
                <Animated.View
                  style={[styles.swipeBackground, bgIconAnimStyle]}
                >
                  <Check size={28} color={Colors.accent} strokeWidth={3} />
                </Animated.View>
              )}

              <GestureDetector gesture={panGesture}>
                <Animated.View
                  style={[styles.cardWrapper, cardAnimStyle, cardHeightStyle]}
                >
                  <Pressable
                    style={[
                      styles.card,
                      {
                        backgroundColor: priorityBg,
                        borderColor: priorityColor,
                      },
                      theme.shadowColor && {
                        shadowColor: priorityColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 10,
                        elevation: 5,
                      },
                      isCompact && styles.cardCompact,
                      isOutlined && styles.cardOutlined,
                      variant === "green" && styles.cardGreen,
                    ]}
                    onPress={onPress}
                    android_ripple={{ color: "rgba(255,255,255,0.06)" }}
                  >
                    {theme.stripeOpacity > 0 && (
                      <StripedBackground
                        color={priorityColor}
                        opacity={theme.stripeOpacity}
                      />
                    )}

                    {/* Optional Accent bars for compact cards */}
                    {isCompact && !isDone && (
                      <View
                        style={[
                          styles.compactAccentTeal,
                          { backgroundColor: priorityColor },
                        ]}
                      />
                    )}

                    <View
                      style={[
                        styles.cardBody,
                        isCompact && styles.cardBodyCompact,
                      ]}
                    >
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
                            <Text style={styles.subtitleText} numberOfLines={1}>
                              {task.subtitle}
                            </Text>
                          </View>
                        )}

                        <View style={{ marginTop: 8 }}>
                          {task.endTimeStr && (
                            <Text
                              style={{
                                color: "rgba(255,255,255,0.7)",
                                fontSize: 13,
                                marginBottom: 4,
                              }}
                              numberOfLines={1}
                            >
                              Ends exactly at: {task.endTimeStr}
                            </Text>
                          )}
                          {task.subtasks?.map((st) => (
                            <View
                              key={st.id}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 6,
                              }}
                            >
                              <View
                                style={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: 4,
                                  borderWidth: 1,
                                  borderColor: priorityColor,
                                  marginRight: 8,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {st.completed && (
                                  <Check size={10} color={priorityColor} />
                                )}
                              </View>
                              <Text
                                style={{
                                  color: "rgba(255,255,255,0.8)",
                                  fontSize: 12,
                                  textDecorationLine: st.completed
                                    ? "line-through"
                                    : "none",
                                }}
                                numberOfLines={1}
                              >
                                {st.title}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Right container */}
                      <View style={styles.cardRight}>{task.rightEmoji}</View>
                    </View>
                  </Pressable>
                </Animated.View>
              </GestureDetector>
            </>
          )}
        </View>
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
    minHeight: MIN_CARD_HEIGHT,
  },
  rowCompact: {
    minHeight: MIN_CARD_HEIGHT,
  },

  // Left col
  leftCol: {
    width: 46,
    paddingTop: 10, // Aligns time text with node center (node top:10, height:14 → center Y:17px)
    alignItems: "flex-end",
    paddingRight: 6,
  },
  leftIconContainer: {
    height: 0, // Hidden — icon display is optional, keep 0 to not push time label
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

  // Vertical line wrapper
  lineWrapper: {
    width: 24,
    alignItems: "center",
    overflow: "visible",
  },
  lineWrapperCompact: {
    // Keeps it centered correctly for smaller cards
  },
  // Active node: diamond-shaped glowing outer ring
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
  nodeActiveGlow2: {
    position: "absolute",
    // left: 12,
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

  // Card container and swipe animation
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
    // legacy green class, dynamic height handles this now
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
