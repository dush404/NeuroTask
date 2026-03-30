import * as Haptics from "expo-haptics";
import { Check } from "lucide-react-native";
import React, { memo, useCallback, useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { Colors, Radius } from "../constants/theme";
import { Task } from "../types/task";
import { springConfig, timingConfigFast } from "../utils/motionConfig";
import { formatDuration, priorityColor } from "../utils/taskUtils";
import { StripedBackground } from "./StripedBackground";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (task: Task) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;

// Wrap in React.memo to prevent unnecessary re-renders in FlashList
export const TaskCard = memo(
  ({ task, onComplete, onDelete, onPress }: TaskCardProps) => {
    // Shared values for animations
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const checkScale = useSharedValue(task.status === "done" ? 1 : 0);
    const hasCrossedComplete = useSharedValue(false);
    const hasCrossedDelete = useSharedValue(false);

    const [cardWidth, setCardWidth] = useState<number>(SCREEN_WIDTH - 32);

    useEffect(() => {
      if (task.status === "done") {
        translateX.value = 0;
        opacity.value = 1;
        checkScale.value = 1;
      } else {
        translateX.value = 0;
        opacity.value = 1;
        checkScale.value = 0;
      }
    }, [task.status, translateX, opacity, checkScale]);

    // Memoize stable callbacks
    const handleComplete = useCallback(
      () => onComplete(task.id),
      [task.id, onComplete],
    );
    const handleDelete = useCallback(
      () => onDelete(task.id),
      [task.id, onDelete],
    );

    const triggerCompleteAnimation = useCallback(() => {
      "worklet";
      runOnJS(Haptics.notificationAsync)(
        Haptics.NotificationFeedbackType.Success,
      );
      // 1. Scale checkmark up
      checkScale.value = withSpring(1, springConfig);

      // 2. Pulse the card
      scale.value = withSequence(
        withTiming(0.97, timingConfigFast),
        withTiming(1, timingConfigFast),
      );

      // 3. Fade out and remove (simulate completion swipe)
      translateX.value = withDelay(300, withTiming(400, timingConfigFast));
      opacity.value = withDelay(
        300,
        withTiming(0, timingConfigFast, () => {
          runOnJS(handleComplete)();
        }),
      );
    }, [handleComplete, checkScale, scale, translateX, opacity]);

    const panGesture = Gesture.Pan()
      .activeOffsetX([-10, 10]) // Require minimum horizontal movement to activate
      // Run on UI thread for fluid 60fps gestures
      .onUpdate((e) => {
        if (isDone) {
          // Allow left swipe to undo
          translateX.value = Math.max(
            -SCREEN_WIDTH * 0.4,
            Math.min(0, e.translationX * 0.8),
          );

          if (
            translateX.value < -SWIPE_THRESHOLD &&
            !hasCrossedComplete.value
          ) {
            hasCrossedComplete.value = true;
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
          } else if (
            translateX.value >= -SWIPE_THRESHOLD &&
            hasCrossedComplete.value
          ) {
            hasCrossedComplete.value = false;
          }
        } else {
          // Elastic resistance when swiping
          translateX.value = e.translationX * 0.8;

          // Haptic feedback thresholds
          if (translateX.value > SWIPE_THRESHOLD && !hasCrossedComplete.value) {
            hasCrossedComplete.value = true;
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
          } else if (
            translateX.value <= SWIPE_THRESHOLD &&
            hasCrossedComplete.value
          ) {
            hasCrossedComplete.value = false;
          }

          if (translateX.value < -SWIPE_THRESHOLD && !hasCrossedDelete.value) {
            hasCrossedDelete.value = true;
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
          } else if (
            translateX.value >= -SWIPE_THRESHOLD &&
            hasCrossedDelete.value
          ) {
            hasCrossedDelete.value = false;
          }
        }
      })
      .onEnd((e) => {
        if (isDone) {
          if (translateX.value < -SWIPE_THRESHOLD) {
            // Swipe left -> Undo
            runOnJS(Haptics.notificationAsync)(
              Haptics.NotificationFeedbackType.Success,
            );
            translateX.value = withTiming(-SCREEN_WIDTH, timingConfigFast);
            opacity.value = withTiming(0, timingConfigFast, () => {
              runOnJS(handleComplete)();
            });
          } else {
            translateX.value = withSpring(0, springConfig);
          }
        } else {
          if (translateX.value > SWIPE_THRESHOLD) {
            // Swipe right -> Complete
            runOnJS(Haptics.notificationAsync)(
              Haptics.NotificationFeedbackType.Success,
            );
            translateX.value = withTiming(SCREEN_WIDTH, timingConfigFast);
            opacity.value = withTiming(0, timingConfigFast, () => {
              runOnJS(handleComplete)();
            });
          } else if (translateX.value < -SWIPE_THRESHOLD) {
            // Swipe left -> Delete
            runOnJS(Haptics.notificationAsync)(
              Haptics.NotificationFeedbackType.Warning,
            );
            translateX.value = withTiming(-SCREEN_WIDTH, timingConfigFast);
            opacity.value = withTiming(0, timingConfigFast, () => {
              runOnJS(handleDelete)();
            });
          } else {
            translateX.value = withSpring(0, springConfig);
          }
        }
      });

    const tapGesture = Gesture.Tap().onEnd(() => {
      runOnJS(onPress)(task);
    });

    const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

    // Memoize animated styles
    const animStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }, { scale: scale.value }],
      opacity: opacity.value,
    }));

    const checkAnimStyle = useAnimatedStyle(() => ({
      transform: [{ scale: checkScale.value }],
      opacity: checkScale.value,
    }));

    const completeRevealStyle = useAnimatedStyle(() => ({
      width: Math.max(0, translateX.value),
    }));

    const undoRevealStyle = useAnimatedStyle(() => ({
      width: Math.max(0, -translateX.value),
    }));

    const subtaskDone = task.subtasks.filter((s) => s.completed).length;
    const subtaskTotal = task.subtasks.length;
    const progressPct = subtaskTotal > 0 ? subtaskDone / subtaskTotal : 0;
    const isDone = task.status === "done";
    const accentColor = priorityColor(task.priority);

    const renderCard = (doneState: boolean) => {
      return (
        <View
          style={[
            styles.container,
            {
              borderColor: doneState
                ? `${accentColor}40`
                : "rgba(255,255,255,0.1)",
              borderWidth: 1.5,
            },
          ]}
        >
          <StripedBackground opacity={0.12} />
          <View
            style={[styles.priorityBar, { backgroundColor: accentColor }]}
          />
          <View style={styles.content}>
            <View style={styles.mainRow}>
              <View style={styles.infoColumn}>
                <Text
                  style={[styles.title, doneState && styles.titleDone]}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>

                <View style={styles.metaRow}>
                  {!!task.dueDate && (
                    <Text style={styles.metaText}>
                      📅{" "}
                      {new Date(task.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  )}
                  {!!task.estimatedMinutes && (
                    <Text style={styles.metaText}>
                      ⏱️ {formatDuration(task.estimatedMinutes)}
                    </Text>
                  )}

                  {task.tags.length > 0 && (
                    <View style={styles.tagRow}>
                      {task.tags.slice(0, 2).map((tag) => (
                        <Text key={tag} style={styles.tagText}>
                          #{tag}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>

                {subtaskTotal > 0 && (
                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${progressPct * 100}%`,
                            backgroundColor: accentColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressPercentage}>
                      {Math.round(progressPct * 100)}%
                    </Text>
                  </View>
                )}
              </View>

              <Pressable
                style={[
                  styles.checkBtn,
                  doneState && {
                    backgroundColor: accentColor,
                    borderColor: accentColor,
                  },
                ]}
                onPress={() => {
                  if (!doneState && !isDone) triggerCompleteAnimation();
                }}
              >
                <Animated.View
                  style={
                    doneState && !isDone
                      ? { transform: [{ scale: 1 }], opacity: 1 }
                      : checkAnimStyle
                  }
                >
                  <Check size={14} color="#fff" strokeWidth={3} />
                </Animated.View>
                {!doneState && (
                  <Check
                    size={14}
                    color="rgba(255,255,255,0.15)"
                    strokeWidth={3}
                    style={{ position: "absolute" }}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      );
    };

    return (
      <View style={styles.wrapper}>
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
            <View style={{ width: cardWidth, position: "absolute", right: 0 }}>
              {renderCard(false)}
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
            <View style={{ width: cardWidth }}>{renderCard(true)}</View>
          </Animated.View>
        )}
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            style={[animStyle, { zIndex: 1 }]}
            onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
          >
            {renderCard(isDone)}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.task.id === nextProps.task.id &&
      prevProps.task.status === nextProps.task.status &&
      prevProps.task.title === nextProps.task.title &&
      prevProps.task.subtasks.filter((s) => s.completed).length ===
        nextProps.task.subtasks.filter((s) => s.completed).length
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
    borderRadius: Radius.md,
    justifyContent: "center",
  },
  container: {
    flexDirection: "row",
    backgroundColor: "#1d202418",
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  priorityBar: {
    width: 3.5,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoColumn: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E2E4E9",
    letterSpacing: 0.2,
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  metaText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  tagRow: {
    flexDirection: "row",
    gap: 6,
  },
  tagText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressPercentage: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: "600",
    width: 28,
    textAlign: "right",
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
