// NeuroTask — Kanban Board Component
// Horizontal scrollable 3-column board: Todo / In Progress / Done.

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors, Radius, Spacing, Typography } from "../constants/theme";
import { Task } from "../types/task";
import { priorityColor } from "../utils/taskUtils";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
}

const COLUMNS: { key: Task["status"]; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: Colors.textSecondary },
  { key: "in_progress", label: "In Progress", color: Colors.accent },
  { key: "done", label: "Done", color: Colors.success },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskPress,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.board}
    >
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <View key={col.key} style={styles.column}>
            {/* Column header */}
            <View style={styles.colHeader}>
              <View style={[styles.colDot, { backgroundColor: col.color }]} />
              <Text style={styles.colTitle}>{col.label}</Text>
              <View style={styles.colBadge}>
                <Text style={[styles.colCount, { color: col.color }]}>
                  {colTasks.length}
                </Text>
              </View>
            </View>

            {/* Task cards */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.colScroll}
            >
              {colTasks.length === 0 ? (
                <View style={styles.emptyCol}>
                  <Text style={styles.emptyColText}>Drop here</Text>
                </View>
              ) : (
                colTasks.map((task) => (
                  <View
                    key={task.id}
                    style={[
                      styles.card,
                      {
                        borderTopColor: priorityColor(
                          task.priority === "p1"
                            ? "high"
                            : task.priority === "p2"
                              ? "medium"
                              : "low",
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {task.title}
                    </Text>
                    {task.tags.length > 0 && (
                      <View style={styles.tagRow}>
                        {task.tags.slice(0, 2).map((tag) => (
                          <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>#{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {task.dueDate && (
                      <Text style={styles.cardMeta}>
                        📅{" "}
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  board: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  column: {
    width: 220,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.sm,
    maxHeight: 500,
  },
  colHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    marginBottom: 6,
  },
  colDot: { width: 8, height: 8, borderRadius: 4 },
  colTitle: {
    flex: 1,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  colBadge: {
    backgroundColor: Colors.glass,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  colCount: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
  },
  colScroll: { flexGrow: 0 },
  emptyCol: {
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderStyle: "dashed",
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  emptyColText: { color: Colors.textMuted, fontSize: Typography.fontSizeXS },
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: 6,
    borderTopWidth: 3,
    gap: 6,
  },
  cardTitle: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeightMedium,
  },
  tagRow: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
  tag: {
    backgroundColor: Colors.accentDim,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tagText: { fontSize: 10, color: Colors.accent },
  cardMeta: { fontSize: 10, color: Colors.textMuted },
});
