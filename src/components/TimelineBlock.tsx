// NeuroTask — TimelineBlock (Pixel-Perfect Exoplan Style)
// Full curved SVG lines, striped cards, horizontal buffer lines, custom icons

import * as Haptics from "expo-haptics";
import {
  Bike,
  Bus,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  Plane,
  Sparkles,
  Train,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { Colors } from "../constants/theme";
import {
  HOUR_HEIGHT,
  MIN_CARD_HEIGHT,
  styles,
  SVGBody,
  themes,
} from "../styles/timeline.styles";
import { springConfig } from "../utils/motionConfig";
import { StripedBackground } from "./StripedBackground";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

import { TimelineBlockProps } from "../types/timeline";

// ── Component ─────────────────────────────────────────────────────────────────

// ── Constants for drag-and-drop ────────────────────────────────────────────
const SNAP_INTERVAL = 15; // minutes
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;

export const TimelineBlock: React.FC<TimelineBlockProps> = ({
  task,
  onPress,
  onSwipeComplete,
  onAIFillGap,
  onReschedule,
  onDurationChange,
  zoomScale,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cardWidth, setCardWidth] = useState<number>(SCREEN_WIDTH - 80);
  const [cardHeight, setCardHeight] = useState<number>(0);
  const isDone = task.status === "done";
  const variant = task.variant ?? "default";
  const theme = themes[variant];
  const isCompact = variant === "compact";
  const isOutlined = variant === "outlined";

  // Prevent default "straight-active" (sky blue) and use custom priority-colored line
  const effectiveLineStyle =
    (isDone || task.lineStyle === "straight-active") &&
    task.lineStyle !== "fade-out"
      ? "straight-muted"
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
            : themes[variant].border;

  const bgHex = priorityColor.length === 7 ? priorityColor : "#ffffff";
  const bgOpacity = "20"; // 12% opacity roughly
  const priorityBg = bgHex + bgOpacity;

  const cardHeightStyle = {
    minHeight: MIN_CARD_HEIGHT,
  };

  const emptyHourStyle = {
    height: HOUR_HEIGHT,
  };

  const currentTimeLineStyle = useAnimatedStyle(() => {
    const scale = zoomScale?.value ?? 1;
    const ONE_HOUR_VISUAL_HEIGHT = HOUR_HEIGHT * scale;
    const ONE_MINUTE_HEIGHT = ONE_HOUR_VISUAL_HEIGHT / 60;

    const minuteOffset =
      Math.floor(task.currentMinuteOffset ?? task.currentMinute ?? 0) *
      ONE_MINUTE_HEIGHT;

    return {
      top: 17 + minuteOffset,
    };
  });

  // ── Swipe-to-complete logic ──
  const translateX = useSharedValue(0);
  const isSwiping = useSharedValue(false);
  const hasCrossedSwipe = useSharedValue(false);

  const swipeGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onStart(() => {
          isSwiping.value = true;
        })
        .onUpdate((e) => {
          if (!onSwipeComplete) return;

          if (isDone) {
            const tx = Math.max(
              -SCREEN_WIDTH * 0.4,
              Math.min(e.translationX * 0.8, 0),
            );
            translateX.value = tx;

            if (tx < -SWIPE_THRESHOLD && !hasCrossedSwipe.value) {
              hasCrossedSwipe.value = true;
              runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
            } else if (tx >= -SWIPE_THRESHOLD && hasCrossedSwipe.value) {
              hasCrossedSwipe.value = false;
            }
          } else {
            const tx = Math.max(
              0,
              Math.min(e.translationX * 0.8, SCREEN_WIDTH * 0.4),
            );
            translateX.value = tx;

            if (tx > SWIPE_THRESHOLD && !hasCrossedSwipe.value) {
              hasCrossedSwipe.value = true;
              runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
            } else if (tx <= SWIPE_THRESHOLD && hasCrossedSwipe.value) {
              hasCrossedSwipe.value = false;
            }
          }
        })
        .onEnd(() => {
          if (!onSwipeComplete) return;
          if (isDone) {
            if (translateX.value < -SWIPE_THRESHOLD) {
              runOnJS(Haptics.notificationAsync)(
                Haptics.NotificationFeedbackType.Success,
              );
              translateX.value = withSpring(-SCREEN_WIDTH, springConfig, () => {
                if (onSwipeComplete) {
                  runOnJS(onSwipeComplete)(task.id);
                }
              });
            } else {
              translateX.value = withSpring(0, springConfig);
            }
          } else {
            if (translateX.value > SWIPE_THRESHOLD) {
              runOnJS(Haptics.notificationAsync)(
                Haptics.NotificationFeedbackType.Success,
              );
              translateX.value = withSpring(SCREEN_WIDTH, springConfig, () => {
                if (onSwipeComplete) {
                  runOnJS(onSwipeComplete)(task.id);
                }
              });
            } else {
              translateX.value = withSpring(0, springConfig);
            }
          }
          isSwiping.value = false;
        }),
    [isDone, onSwipeComplete, task.id],
  );

  useEffect(() => {
    translateX.value = 0;
  }, [isDone, translateX]);

  // ── Drag-to-reschedule logic (long-press + vertical pan) ──
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const dragScale = useSharedValue(1);
  const dragOpacity = useSharedValue(1);
  const draggedMinuteDelta = useSharedValue(0);

  // Live time preview state (updated on JS thread while dragging)
  const [dragTimePreview, setDragTimePreview] = useState<string | null>(null);

  const DRAG_SNAP = 5; // 5-minute snap intervals for commit

  const updatePreviewTime = useCallback(
    (deltaMinutes: number) => {
      if (task.startMinuteOfDay === undefined) return;
      const raw = task.startMinuteOfDay + deltaMinutes;
      const snapped = Math.round(raw / DRAG_SNAP) * DRAG_SNAP;
      const clamped = Math.max(
        0,
        Math.min(snapped, 1440 - (task.durationMinutes || 30)),
      );
      const h = Math.floor(clamped / 60);
      const m = clamped % 60;
      const ampm = h < 12 ? "AM" : "PM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      setDragTimePreview(`\u2192 ${h12}:${String(m).padStart(2, "0")} ${ampm}`);
    },
    [task.startMinuteOfDay, task.durationMinutes],
  );

  const commitReschedule = useCallback(
    (deltaMinutes: number) => {
      if (!onReschedule || task.startMinuteOfDay === undefined) {
        setDragTimePreview(null);
        return;
      }
      const raw = task.startMinuteOfDay + deltaMinutes;
      const snapped = Math.round(raw / DRAG_SNAP) * DRAG_SNAP;
      const clamped = Math.max(
        0,
        Math.min(snapped, 1440 - (task.durationMinutes || 30)),
      );
      const h = Math.floor(clamped / 60);
      const m = clamped % 60;
      const newTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      onReschedule(task.id, newTime);
      setDragTimePreview(null);
    },
    [onReschedule, task.id, task.startMinuteOfDay, task.durationMinutes],
  );

  const clearPreview = useCallback(() => setDragTimePreview(null), []);

  const dragGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(350)
        .activeOffsetY([-4, 4])
        .onStart(() => {
          isDragging.value = true;
          dragScale.value = withSpring(1.04, { damping: 12, stiffness: 180 });
          dragOpacity.value = withTiming(0.85, { duration: 150 });
        })
        .onUpdate((e) => {
          translateY.value = e.translationY;
          // Calculate per-minute delta for live preview
          const delta = Math.round(e.translationY / PIXELS_PER_MINUTE);
          if (delta !== draggedMinuteDelta.value) {
            draggedMinuteDelta.value = delta;
            runOnJS(updatePreviewTime)(delta);
          }
        })
        .onEnd(() => {
          const deltaMinutes = Math.round(translateY.value / PIXELS_PER_MINUTE);
          // Commit if there's any meaningful movement (≥ 1 minute)
          if (Math.abs(deltaMinutes) >= 1) {
            runOnJS(commitReschedule)(deltaMinutes);
          } else {
            runOnJS(clearPreview)();
          }
          // Smooth spring back
          translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
          dragScale.value = withSpring(1, { damping: 15, stiffness: 150 });
          dragOpacity.value = withTiming(1, { duration: 200 });
          isDragging.value = false;
          draggedMinuteDelta.value = 0;
        }),
    [updatePreviewTime, commitReschedule, clearPreview],
  );

  // ── Duration handle logic (bottom drag) ──
  const durationDeltaY = useSharedValue(0);
  const isDurationDragging = useSharedValue(false);

  const commitDuration = useCallback(
    (deltaMinutes: number) => {
      if (!onDurationChange) return;
      const current = task.durationMinutes || 30;
      const raw = current + deltaMinutes;
      const snapped = Math.round(raw / DRAG_SNAP) * DRAG_SNAP;
      const clamped = Math.max(DRAG_SNAP, Math.min(snapped, 480));
      onDurationChange(task.id, clamped);
    },
    [onDurationChange, task.id, task.durationMinutes],
  );

  const durationHandleGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-3, 3])
        .onStart(() => {
          isDurationDragging.value = true;
        })
        .onUpdate((e) => {
          durationDeltaY.value = e.translationY;
        })
        .onEnd(() => {
          const deltaMinutes = Math.round(
            durationDeltaY.value / PIXELS_PER_MINUTE,
          );
          if (Math.abs(deltaMinutes) >= 1) {
            runOnJS(commitDuration)(deltaMinutes);
          }
          durationDeltaY.value = withSpring(0, springConfig);
          isDurationDragging.value = false;
        }),
    [commitDuration],
  );

  // Compose gestures: horizontal swipe races with vertical drag
  const composedGesture = React.useMemo(
    () => Gesture.Race(swipeGesture, dragGesture),
    [swipeGesture, dragGesture],
  );

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: dragScale.value },
    ],
    opacity: isDone ? 0.3 : dragOpacity.value,
    zIndex: isDragging.value ? 999 : 0,
  }));

  // Duration handle expands/contracts the card visually during drag
  const durationHandleAnimStyle = useAnimatedStyle(() => ({
    height: Math.max(0, durationDeltaY.value),
  }));

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

  const completeRevealStyle = useAnimatedStyle(() => ({
    width: Math.max(0, translateX.value),
  }));

  const undoRevealStyle = useAnimatedStyle(() => ({
    width: Math.max(0, -translateX.value),
  }));

  const TravelIcon =
    task.travelMode === "car"
      ? Car
      : task.travelMode === "bus"
        ? Bus
        : task.travelMode === "bike"
          ? Bike
          : task.travelMode === "train"
            ? Train
            : Plane;

  const cardContent = (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: priorityBg,
          borderColor: priorityColor,
          borderWidth: 1.5,
        },
        isCompact && styles.cardCompact,
        isOutlined && styles.cardOutlined,
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

      <View
        style={[
          styles.cardBody,
          isCompact && styles.cardBodyCompact,
          { alignItems: "flex-start" },
        ]}
      >
        {task.taskType === "toGo" ? (
          <View style={{ flex: 1, width: "100%" }}>
            {/* Header: Title and Duration */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  flex: 1,
                }}
              >
                <View
                  style={{
                    backgroundColor: `${priorityColor}20`,
                    padding: 6,
                    borderRadius: 8,
                  }}
                >
                  <TravelIcon size={14} color={priorityColor} />
                </View>
                <Text
                  style={[
                    styles.cardTitleLarge,
                    { color: theme.textColor, flexShrink: 1 },
                  ]}
                  numberOfLines={1}
                >
                  {task.title || "Travel"}
                </Text>
              </View>
              {!!task.durationMinutes && (
                <Text
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 11,
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  {Math.floor(task.durationMinutes / 60)}h{" "}
                  {task.durationMinutes % 60}m
                </Text>
              )}
            </View>

            {/* Route Visualization */}
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.25)",
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.05)",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 4,
                    }}
                  >
                    Departure
                  </Text>
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                    numberOfLines={1}
                  >
                    {task.fromLocation || "Origin"}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    {task.startDateStr || "Today"}
                  </Text>
                </View>

                <View
                  style={{
                    width: 60,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      height: 1,
                      backgroundColor: "rgba(255,255,255,0.15)",
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      backgroundColor: priorityBg,
                      padding: 6,
                      borderRadius: 12,
                    }}
                  >
                    <TravelIcon size={12} color={priorityColor} />
                  </View>
                </View>

                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 4,
                    }}
                  >
                    Arrival
                  </Text>
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                    numberOfLines={1}
                  >
                    {task.toLocation || "Destination"}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    {task.endTimeStr || "TBD"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : task.taskType === "project" ? (
          <View style={{ flex: 1, width: "100%", gap: 12 }}>
            {/* Header: Title and Progress Ring */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: theme.textColor,
                    marginBottom: 2,
                  }}
                >
                  {task.title || "Project"}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {task.startDateStr || "22 Feb 2026"}
                </Text>
              </View>
              {(() => {
                const percentage = task.subtasks?.length
                  ? (task.subtasks.filter((s) => s.completed).length /
                      task.subtasks.length) *
                    100
                  : 0;
                const litSegments = Math.ceil((percentage / 100) * 5);
                return (
                  <View
                    style={{
                      width: 24,
                      height: 44,
                      flexDirection: "column-reverse",
                      justifyContent: "flex-start",
                      gap: 3,
                    }}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <View
                        key={i}
                        style={{
                          flex: 1,
                          backgroundColor:
                            i < litSegments
                              ? priorityColor
                              : "rgba(255,255,255,0.1)",
                          borderRadius: 2,
                        }}
                      />
                    ))}
                  </View>
                );
              })()}
            </View>

            {/* Subtasks (if expanded) */}
            {isExpanded && task.subtasks && task.subtasks.length > 0 && (
              <View style={styles.subtasksContainer}>
                {task.subtasks.map((st) => (
                  <View key={st.id} style={styles.subtaskRow}>
                    <View
                      style={[
                        styles.checkboxBase,
                        { borderColor: priorityColor },
                        st.completed && {
                          backgroundColor: priorityColor,
                        },
                      ]}
                    >
                      {st.completed && <Check size={10} color="#000" />}
                    </View>
                    <Text
                      style={[
                        styles.subtaskTextBase,
                        st.completed && styles.subtaskCompleted,
                      ]}
                      numberOfLines={1}
                    >
                      {st.title}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Footer Stats */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: "auto",
                paddingTop: 8,
                borderTopWidth: 1,
                borderColor: "rgba(255,255,255,0.05)",
              }}
            >
              <Text style={styles.projectDateText}>
                {task.subtasks?.length || 0} Tasks
              </Text>
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.3)",
                }}
              />
              <Text style={styles.projectDateText}>
                {task.subtasks?.filter((s) => s.completed).length} Done
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.cardMain}>
            <View style={styles.normalTaskHeader}>
              <View
                style={[
                  styles.dotGlowContainerBase,
                  {
                    backgroundColor: `${priorityColor}30`,
                    shadowColor: priorityColor,
                  },
                ]}
              >
                <View
                  style={[styles.dot, { backgroundColor: priorityColor }]}
                />
              </View>
              <View style={styles.normalTaskTitleBox}>
                <Text
                  style={[
                    styles.cardTitleLarge,
                    {
                      color:
                        isExpanded && (task.subtasks?.length ?? 0) > 0
                          ? priorityColor
                          : theme.textColor,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {task.title || "Task"}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text style={styles.normalTaskDate}>
                    {task.startDateStr || "22 Feb 2026"}
                  </Text>
                </View>
              </View>
            </View>

            {isExpanded && task.subtasks && task.subtasks.length > 0 && (
              <View style={styles.subtasksContainer}>
                {task.subtasks.map((st) => (
                  <View key={st.id} style={styles.subtaskRow}>
                    <View
                      style={[
                        styles.checkboxBase,
                        { borderColor: priorityColor },
                      ]}
                    >
                      {st.completed && (
                        <Check size={10} color={priorityColor} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.subtaskTextBase,
                        st.completed && styles.subtaskCompleted,
                      ]}
                      numberOfLines={1}
                    >
                      {st.title}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* End Time - Bottom Right */}
        {task.taskType !== "toGo" && !!task.endTimeStr && (
          <Text
            style={{
              position: "absolute",
              bottom: 10,
              right: 12,
              fontSize: 11,
              fontWeight: "600",
              color: priorityColor,
            }}
          >
            {task.endTimeStr}
          </Text>
        )}

        {/* Fixed Position Expand Button */}
        {task.taskType !== "toGo" && (task.subtasks?.length ?? 0) > 0 && (
          <Pressable
            onPress={() => setIsExpanded(!isExpanded)}
            style={[
              styles.expandButton,
              { alignSelf: "flex-start", marginTop: -6 },
            ]}
          >
            {isExpanded ? (
              <ChevronUp size={20} color="rgba(255,255,255,0.4)" />
            ) : (
              <ChevronDown size={20} color="rgba(255,255,255,0.4)" />
            )}
          </Pressable>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.block}>
      {!!task.bufferText && (
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

      <View style={[styles.row, isCompact && styles.rowCompact]}>
        <View style={styles.leftCol}>
          <View style={styles.leftIconContainer}>
            {!isDone && task.leftCategoryIcon}
          </View>
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

        <View
          style={[styles.lineWrapper, isCompact && styles.lineWrapperCompact]}
        >
          {effectiveLineStyle !== "none" && (
            <SVGBody
              lineStyle={effectiveLineStyle}
              hasNode={
                !task.isEmptyHour &&
                !isDone &&
                task.lineStyle !== "straight-active"
              }
            />
          )}

          {(isDone || task.lineStyle === "straight-active") &&
            !task.isEmptyHour &&
            cardHeight > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  height: cardHeight,
                  width: 2,
                  backgroundColor: priorityColor,
                  left: "50%",
                  marginLeft: -1,
                  borderRadius: 1,
                }}
              />
            )}

          {task.nodeState === "active" && (
            <View
              style={[
                styles.nodeActiveGlow,
                !task.isEmptyHour && { left: 12 },
                isDone && {
                  backgroundColor: priorityBg,
                  shadowColor: priorityColor,
                },
              ]}
            >
              <View
                style={[
                  styles.nodeActive,
                  isDone && { backgroundColor: priorityColor },
                ]}
              />
            </View>
          )}
          {task.nodeState === "muted" && (
            <View
              style={[
                styles.nodeMuted,
                isDone && {
                  backgroundColor: priorityColor,
                  borderColor: priorityColor,
                },
              ]}
            />
          )}

          {task.isCurrentHour && task.currentMinute !== undefined && (
            <Animated.View
              style={[styles.currentLineWrapper, currentTimeLineStyle]}
              pointerEvents="none"
            >
              <View style={styles.redDotOuter}>
                <Animated.View style={[styles.pulseRed, pulseStyle]} />
                <View style={styles.mainRedDot} />
              </View>
              <View style={styles.redLine} />
              {/* ── "Next Task" floating badge ── */}
              {!!task.nextTaskLabel && (
                <View
                  style={{
                    position: "absolute",
                    right: 0,
                    top: -18,
                    backgroundColor: "rgba(239,68,68,0.15)",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "rgba(239,68,68,0.3)",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{
                      color: "#EF4444",
                      fontSize: 9,
                      fontWeight: "700",
                      letterSpacing: 0.3,
                    }}
                  >
                    {task.nextTaskLabel}
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        </View>

        <View style={styles.cardContainer}>
          {/* ── GAP SLOT: AI Auto-Fill ── */}
          {task.isGapSlot ? (
            <Pressable
              onPress={() =>
                onAIFillGap?.(task.gapStartMinute ?? 0, task.gapEndMinute ?? 0)
              }
              style={{
                minHeight: MIN_CARD_HEIGHT,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(168,85,247,0.25)",
                borderStyle: "dashed",
                backgroundColor: "rgba(168,85,247,0.06)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingHorizontal: 16,
                marginBottom: 8,
              }}
            >
              <Sparkles size={16} color="#A855F7" />
              <Text
                style={{
                  color: "rgba(168,85,247,0.8)",
                  fontSize: 12,
                  fontWeight: "600",
                  letterSpacing: 0.3,
                }}
              >
                {task.title}
              </Text>
              <Text
                style={{
                  color: "rgba(168,85,247,0.4)",
                  fontSize: 10,
                }}
              >
                — Fill with Shyra
              </Text>
            </Pressable>
          ) : task.isEndOfDay ? null : task.isEmptyHour ? (
            <Animated.View style={[styles.emptySlotContainer, emptyHourStyle]}>
              <View style={styles.emptySlotLine} />
            </Animated.View>
          ) : (
            <View style={{ width: "100%", justifyContent: "center" }}>
              {isDone ? (
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      overflow: "hidden",
                      zIndex: -1,
                    },
                    undoRevealStyle,
                  ]}
                  pointerEvents="none"
                >
                  <View
                    style={[
                      styles.cardWrapper,
                      { width: cardWidth, position: "absolute", right: 0 },
                      cardHeightStyle,
                      task.isPast && { opacity: 0.4 },
                    ]}
                  >
                    {cardContent}
                  </View>
                </Animated.View>
              ) : (
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      overflow: "hidden",
                      zIndex: -1,
                    },
                    completeRevealStyle,
                  ]}
                  pointerEvents="none"
                >
                  <View
                    style={[
                      styles.cardWrapper,
                      { width: cardWidth, opacity: 0.3 },
                      cardHeightStyle,
                      task.isPast && { opacity: 0.4 },
                    ]}
                  >
                    {cardContent}
                  </View>
                </Animated.View>
              )}
              <GestureDetector gesture={composedGesture}>
                <Animated.View
                  style={[
                    styles.cardWrapper,
                    cardAnimStyle,
                    cardHeightStyle,
                    // ── isPast: dim past tasks ──
                    task.isPast && { opacity: 0.4 },
                    { zIndex: 1 },
                  ]}
                  onLayout={(e) => {
                    setCardWidth(e.nativeEvent.layout.width);
                    setCardHeight(e.nativeEvent.layout.height);
                  }}
                >
                  {cardContent}

                  {/* ── Live Time Preview Badge (visible while dragging) ── */}
                  {!!dragTimePreview && (
                    <View
                      style={{
                        position: "absolute",
                        top: -28,
                        alignSelf: "center",
                        backgroundColor: "rgba(79,225,121,0.15)",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "rgba(79,225,121,0.4)",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        zIndex: 1000,
                      }}
                    >
                      <Text
                        style={{
                          color: "#4FE179",
                          fontSize: 11,
                          fontWeight: "700",
                          letterSpacing: 0.3,
                        }}
                      >
                        {dragTimePreview}
                      </Text>
                    </View>
                  )}
                </Animated.View>
              </GestureDetector>
            </View>
          )}
        </View>
      </View>

      {/* ── End of Day Quote ── */}
      {task.isEndOfDay && (
        <View style={{ alignItems: "center", marginTop: 8, marginBottom: 8 }}>
          <Text
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
              fontStyle: "italic",
              letterSpacing: 0.5,
            }}
          >
            {task.endOfDayQuote}
          </Text>
        </View>
      )}
    </View>
  );
};
