// NeuroTask - Task Card Component
// Displays a single task with priority indicator, tags, due date, and swipe actions.
// Swipe left to delete, swipe right to complete.

import { ChevronRight } from "lucide-react-native";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { Colors, Radius, Spacing, Typography } from "../constants/theme";
import { Task } from "../types/task";
import { formatDuration, priorityColor } from "../utils/taskUtils";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (task: Task) => void;
}

const SWIPE_THRESHOLD = 80;

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onDelete,
  onPress,
}) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const handleComplete = useCallback(
    () => onComplete(task.id),
    [task.id, onComplete],
  );
  const handleDelete = useCallback(
    () => onDelete(task.id),
    [task.id, onDelete],
  );

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        // Swipe right → complete
        translateX.value = withTiming(400, { duration: 250 });
        opacity.value = withTiming(0, { duration: 250 }, () => {
          runOnJS(handleComplete)();
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        // Swipe left → delete
        translateX.value = withTiming(-400, { duration: 250 });
        opacity.value = withTiming(0, { duration: 250 }, () => {
          runOnJS(handleDelete)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(onPress)(task);
  });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const subtaskDone = task.subtasks.filter((s) => s.completed).length;
  const subtaskTotal = task.subtasks.length;
  const progressPct = subtaskTotal > 0 ? subtaskDone / subtaskTotal : 0;

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
            <Text
              style={[styles.title, task.status === "done" && styles.titleDone]}
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
                ⏱ {formatDuration(task.estimatedMinutes)}
              </Text>
            )}

            {/* Subtask progress */}
            {subtaskTotal > 0 && (
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressPct * 100}%` },
                    ]}
                  />
                </View>
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
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginVertical: 5,
    overflow: "hidden",
  },
  priorityBar: {
    width: 4,
    borderTopLeftRadius: Radius.lg,
    borderBottomLeftRadius: Radius.lg,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
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
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.glass,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
  },
});
