import { Check, ChevronRight } from "lucide-react-native";
import React, { memo, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
import { Colors, Radius, Spacing, Typography } from "../constants/theme";
import { Task } from "../types/task";
import { springConfig, timingConfigFast } from "../utils/motionConfig";
import { formatDuration, priorityColor } from "../utils/taskUtils";
import { ProgressRing } from "./ProgressRing";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (task: Task) => void;
}

const SWIPE_THRESHOLD = 80;

// Wrap in React.memo to prevent unnecessary re-renders in FlashList
export const TaskCard = memo(
  ({ task, onComplete, onDelete, onPress }: TaskCardProps) => {
    // Shared values for animations
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const checkScale = useSharedValue(task.status === "done" ? 1 : 0);

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
      // Run on UI thread for fluid 60fps gestures
      .onUpdate((e) => {
        // Elastic resistance when swiping
        translateX.value = e.translationX * 0.8;
      })
      .onEnd((e) => {
        if (e.translationX > SWIPE_THRESHOLD) {
          // Swipe right -> Complete
          translateX.value = withTiming(400, timingConfigFast);
          opacity.value = withTiming(0, timingConfigFast, () => {
            runOnJS(handleComplete)();
          });
        } else if (e.translationX < -SWIPE_THRESHOLD) {
          // Swipe left -> Delete
          translateX.value = withTiming(-400, timingConfigFast);
          opacity.value = withTiming(0, timingConfigFast, () => {
            runOnJS(handleDelete)();
          });
        } else {
          // Snap back using global spring config
          translateX.value = withSpring(0, springConfig);
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

    const subtaskDone = task.subtasks.filter((s) => s.completed).length;
    const subtaskTotal = task.subtasks.length;
    const progressPct = subtaskTotal > 0 ? subtaskDone / subtaskTotal : 0;
    const isDone = task.status === "done";

    return (
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.container, animStyle]}>
          {/* Priority bar */}
          <View
            style={[
              styles.priorityBar,
              { backgroundColor: priorityColor(task.priority) },
            ]}
          />

          <View style={styles.content}>
            {/* Header row */}
            <View style={styles.row}>
              {/* Custom Animated Checkbox */}
              <Pressable
                style={[styles.checkbox, isDone && styles.checkboxDone]}
                onPress={() => {
                  if (!isDone) triggerCompleteAnimation();
                }}
              >
                <Animated.View style={checkAnimStyle}>
                  <Check size={14} color={Colors.background} strokeWidth={3} />
                </Animated.View>
              </Pressable>

              <Text
                style={[styles.title, isDone && styles.titleDone]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
              <ChevronRight size={16} color={Colors.textMuted} />
            </View>

            {/* Tags */}
            {task.tags.length > 0 && (
              <View style={styles.tagRow}>
                {task.tags.slice(0, 3).map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Footer row */}
            <View style={styles.row}>
              {task.dueDate && (
                <Text style={styles.meta}>
                  📅{" "}
                  {new Date(task.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              )}
              {task.estimatedMinutes && (
                <Text style={styles.meta}>
                  ⏱️ {formatDuration(task.estimatedMinutes)}
                </Text>
              )}

              {/* Subtask progress ring */}
              {subtaskTotal > 0 && (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <ProgressRing
                    percentage={Math.round(progressPct * 100)}
                    size={28}
                    strokeWidth={3}
                    color={Colors.accent}
                  />
                  <Text style={styles.meta}>
                    {subtaskDone}/{subtaskTotal}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    );
  },
  (prevProps, nextProps) => {
    // Custom equality check for React.memo to prevent re-renders when tasks update unless essential
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
  container: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginVertical: 4,
    // Soft shadow for depth as requested
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  priorityBar: {
    width: 4,
    borderTopLeftRadius: Radius.lg,
    borderBottomLeftRadius: Radius.lg,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxDone: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  title: {
    flex: 1,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },
  tagRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    paddingLeft: 34, // Align with title past the checkbox
  },
  tag: {
    backgroundColor: Colors.accentDim,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: Typography.fontSizeXS,
    color: Colors.accent,
    fontWeight: Typography.fontWeightMedium,
  },
  meta: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary,
    paddingLeft: 34, // Align with title
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
  },
});
