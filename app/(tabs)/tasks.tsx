// NeuroTask — Tasks Screen (Exoplan smart-list style)
// Grouped tasks: Today / Tomorrow / This Week / Someday + search bar + swipe to complete

import {
    Check,
    ChevronDown,
    ChevronRight,
    Menu,
    Plus,
    Search,
    X,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Radius, Spacing, Typography } from "../../src/constants/theme";
import { useTaskStore } from "../../src/store/useTaskStore";
import { Task } from "../../src/types/task";

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
function endOfWeekStr() {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() + (7 - day));
  return d.toISOString().split("T")[0];
}

function groupTasks(tasks: Task[], query: string) {
  const q = query.toLowerCase().trim();
  const active = tasks.filter(
    (t) =>
      t.status !== "done" && (q === "" || t.title.toLowerCase().includes(q)),
  );
  const today = todayStr();
  const tomorrow = tomorrowStr();
  const eow = endOfWeekStr();

  const groups: { title: string; data: Task[] }[] = [
    {
      title: "Today",
      data: active.filter((t) => t.dueDate === today),
    },
    {
      title: "Tomorrow",
      data: active.filter((t) => t.dueDate === tomorrow),
    },
    {
      title: "This Week",
      data: active.filter(
        (t) => t.dueDate && t.dueDate > tomorrow && t.dueDate <= eow,
      ),
    },
    {
      title: "Someday",
      data: active.filter((t) => !t.dueDate || t.dueDate > eow),
    },
    {
      title: "Completed",
      data: tasks.filter(
        (t) =>
          t.status === "done" &&
          (q === "" || t.title.toLowerCase().includes(q)),
      ),
    },
  ];

  return groups.filter((g) => g.data.length > 0);
}

const PRIORITY_COLORS: Record<string, string> = {
  p1: Colors.priorityHigh,
  p2: Colors.priorityMedium,
  p3: Colors.priorityLow,
  p4: Colors.textMuted,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TasksScreen() {
  const { tasks, addTask, updateTask, deleteTask } = useTaskStore();
  const [query, setQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(["Completed"]),
  );

  // Add Task Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState(todayStr());
  const [newPriority, setNewPriority] = useState<"p1" | "p2" | "p3">("p3");

  const groups = useMemo(() => groupTasks(tasks, query), [tasks, query]);

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  const handleComplete = useCallback(
    (task: Task) => {
      updateTask(task.id, {
        status: task.status === "done" ? "todo" : "done",
        completedAt:
          task.status === "done" ? undefined : new Date().toISOString(),
      });
    },
    [updateTask],
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert("Delete task", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTask(id),
        },
      ]);
    },
    [deleteTask],
  );

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    addTask({
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      priority: newPriority,
      status: "todo",
      listId: "inbox",
      tags: [],
      dueDate: newDueDate || undefined,
      createdAt: new Date().toISOString(),
      subtasks: [],
      comments: [],
      sortOrder: Date.now(),
    });
    setNewTitle("");
    setNewDueDate(todayStr());
    setNewPriority("p3");
    setShowAdd(false);
  };

  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Menu size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tasks</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAdd(true)}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Search size={15} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")}>
            <X size={15} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Grouped list */}
      <SectionList
        sections={groups}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Pressable
            style={styles.sectionHeader}
            onPress={() => toggleGroup(section.title)}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionRight}>
              <Text style={styles.sectionCount}>{section.data.length}</Text>
              {collapsedGroups.has(section.title) ? (
                <ChevronRight size={15} color={Colors.textMuted} />
              ) : (
                <ChevronDown size={15} color={Colors.textMuted} />
              )}
            </View>
          </Pressable>
        )}
        renderItem={({ item, section }) => {
          if (collapsedGroups.has(section.title)) return null;
          const isDone = item.status === "done";
          return (
            <Pressable
              style={styles.taskRow}
              onLongPress={() => handleDelete(item.id)}
              android_ripple={{ color: "rgba(255,255,255,0.05)" }}
            >
              {/* Priority bar */}
              <View
                style={[
                  styles.priorityBar,
                  {
                    backgroundColor:
                      PRIORITY_COLORS[item.priority] ?? Colors.textMuted,
                  },
                ]}
              />

              {/* Complete checkbox */}
              <Pressable
                style={styles.checkbox}
                onPress={() => handleComplete(item)}
                hitSlop={8}
              >
                {isDone ? (
                  <View style={styles.checkboxDone}>
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </View>
                ) : (
                  <View style={styles.checkboxEmpty} />
                )}
              </Pressable>

              {/* Title + meta */}
              <View style={styles.taskBody}>
                <Text
                  style={[styles.taskTitle, isDone && styles.taskTitleDone]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <View style={styles.taskMeta}>
                  {item.dueDate && (
                    <Text style={styles.taskMetaText}>📅 {item.dueDate}</Text>
                  )}
                  {item.dueTime && (
                    <Text style={styles.taskMetaText}>🕐 {item.dueTime}</Text>
                  )}
                  {item.estimatedMinutes && (
                    <Text style={styles.taskMetaText}>
                      ⏱ {item.estimatedMinutes}m
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyText}>All clear!</Text>
            <Text style={styles.emptySubtext}>
              Tap + to add your first task
            </Text>
          </View>
        }
      />

      {/* Add Task Modal */}
      <Modal
        visible={showAdd}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAdd(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAdd(false)}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalSheet}
        >
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>New Task</Text>

          <TextInput
            style={styles.modalInput}
            placeholder="Task title..."
            placeholderTextColor={Colors.textMuted}
            value={newTitle}
            onChangeText={setNewTitle}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleAddTask}
          />

          {/* Due date */}
          <Text style={styles.modalLabel}>Due Date</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textMuted}
            value={newDueDate}
            onChangeText={setNewDueDate}
            keyboardType="numbers-and-punctuation"
          />

          {/* Priority row */}
          <Text style={styles.modalLabel}>Priority</Text>
          <View style={styles.priorityRow}>
            {(["p1", "p2", "p3"] as const).map((p) => (
              <Pressable
                key={p}
                style={[
                  styles.priorityBtn,
                  newPriority === p && {
                    backgroundColor: PRIORITY_COLORS[p],
                    borderColor: PRIORITY_COLORS[p],
                  },
                ]}
                onPress={() => setNewPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityBtnText,
                    newPriority === p && { color: "#fff" },
                  ]}
                >
                  {p === "p1" ? "🔴 High" : p === "p2" ? "🟡 Med" : "🟢 Low"}
                </Text>
              </Pressable>
            ))}
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleAddTask}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Add Task</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  headerTitle: {
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginVertical: 10,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSizeMD,
    color: Colors.textPrimary,
    padding: 0,
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  sectionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionCount: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginBottom: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  priorityBar: {
    width: 3,
    alignSelf: "stretch",
  },
  checkbox: {
    padding: 12,
  },
  checkboxEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  checkboxDone: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  taskBody: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    gap: 3,
  },
  taskTitle: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  taskTitleDone: {
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },
  taskMeta: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  taskMetaText: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    gap: 6,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalSheet: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
    marginBottom: 6,
    marginTop: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: 12,
    fontSize: Typography.fontSizeMD,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: "center",
  },
  priorityBtnText: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    color: "#fff",
  },
});
