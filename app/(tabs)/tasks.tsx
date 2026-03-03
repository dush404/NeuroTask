// NeuroTask — Tasks Screen (v3 — Swipe-capable TaskCard + TaskDetailSheet)

import { LinearGradient } from "expo-linear-gradient";
import { Inbox, Plus, Search, X } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TaskCard } from "../../src/components/TaskCard";
import { TaskDetailSheet } from "../../src/components/TaskDetailSheet";
import { TimelineBlock } from "../../src/components/TimelineBlock";
import { Colors } from "../../src/constants/theme";
import { useTaskStore } from "../../src/store/useTaskStore";
import { tasksStyles as styles } from "../../src/styles/tasks.styles";
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
function nextWeekStr() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

// ── Category data ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "All", color: "#5BA4E5" },
  { id: "inbox", label: "Inbox", color: "#3A8DFF" },
  { id: "work", label: "Work", color: "#FF6B9D" },
  { id: "personal", label: "Personal", color: "#4ECDC4" },
];

const SUB_CATEGORIES = [
  { id: "all", label: "All", color: "#ffffff" },
  { id: "today", label: "Today", color: "#5BA4E5" },
  { id: "upcoming", label: "Upcoming", color: "#F59E0B" },
  { id: "overdue", label: "Overdue", color: "#FF4D6D" },
  { id: "completed", label: "Done", color: "#4CAF50" },
];

const PRIORITY_META: Record<string, { color: string; bg: string }> = {
  p1: { color: Colors.priorityHigh, bg: "rgba(255,77,109,0.12)" },
  p2: { color: Colors.priorityMedium, bg: "rgba(245,158,11,0.12)" },
  p3: { color: Colors.priorityLow, bg: "rgba(76,175,80,0.12)" },
  p4: { color: Colors.textMuted, bg: "rgba(255,255,255,0.04)" },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TasksScreen() {
  const { tasks, addTask, updateTask, deleteTask } = useTaskStore();
  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, 20) + 60;
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubCategory, setActiveSubCategory] = useState("all");

  // Add Task Modal
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState(todayStr());
  const [newPriority, setNewPriority] = useState<"p1" | "p2" | "p3">("p3");

  // Detail sheet
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;
    const q = query.toLowerCase().trim();
    const today = todayStr();

    if (q) {
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (activeCategory !== "all") {
      result = result.filter((t) => t.listId === activeCategory);
    }
    switch (activeSubCategory) {
      case "today":
        result = result.filter(
          (t) => t.dueDate === today && t.status !== "done",
        );
        break;
      case "upcoming":
        result = result.filter(
          (t) => t.dueDate && t.dueDate > today && t.status !== "done",
        );
        break;
      case "overdue":
        result = result.filter(
          (t) => t.dueDate && t.dueDate < today && t.status !== "done",
        );
        break;
      case "completed":
        result = result.filter((t) => t.status === "done");
        break;
      default:
        result = result.filter((t) => t.status !== "done");
        break;
    }
    return result;
  }, [tasks, query, activeCategory, activeSubCategory]);

  const handleComplete = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      updateTask(id, {
        status: task.status === "done" ? "todo" : "done",
        completedAt:
          task.status === "done" ? undefined : new Date().toISOString(),
      });
    },
    [updateTask, tasks],
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
      listId: activeCategory === "all" ? "inbox" : activeCategory,
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
    Keyboard.dismiss();
  };

  const renderTaskCard = ({ item, index }: { item: Task; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 40)
        .duration(300)
        .springify()
        .damping(18)}
      layout={Layout.springify().damping(15).stiffness(120)}
    >
      <TaskCard
        task={item}
        onComplete={handleComplete}
        onDelete={handleDelete}
        onPress={(task) => setSelectedTask(task)}
      />
    </Animated.View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.root}>
        {/* Background gradient */}
        <LinearGradient
          colors={["#1A1025", "#0C0712", "#000000"]}
          style={styles.bgGradient}
          start={[0.5, 0]}
          end={[0.5, 1]}
        />

        {/* ── Search Bar ────────────────────────────────────────────────── */}
        <View style={[styles.searchContainer, { paddingTop: headerHeight }]}>
          <View
            style={[styles.searchBar, searchFocused && styles.searchBarFocused]}
          >
            <Search
              size={16}
              color={searchFocused ? "#5BA4E5" : Colors.textMuted}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks..."
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <X size={16} color={Colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Category Chips ────────────────────────────────────────────── */}
        <View style={styles.chipRow}>
          <View style={styles.chipContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              fadingEdgeLength={40}
              contentContainerStyle={styles.chipScrollInner}
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      isActive && { backgroundColor: `${cat.color}20` },
                    ]}
                    onPress={() => setActiveCategory(cat.id)}
                  >
                    <View
                      style={[
                        styles.chipDot,
                        {
                          backgroundColor: isActive
                            ? cat.color
                            : Colors.textMuted,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.chipLabel,
                        isActive && { color: cat.color },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <Pressable style={styles.chipAddBtn} onPress={() => {}}>
            <Plus size={14} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* ── Sub-category Chips ────────────────────────────────────────── */}
        <View style={styles.chipRow}>
          <View style={styles.chipContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              fadingEdgeLength={40}
              contentContainerStyle={styles.chipScrollInner}
            >
              {SUB_CATEGORIES.map((sub) => {
                const isActive = activeSubCategory === sub.id;
                return (
                  <Pressable
                    key={sub.id}
                    style={[
                      styles.subChip,
                      isActive && { backgroundColor: `${sub.color}18` },
                    ]}
                    onPress={() => setActiveSubCategory(sub.id)}
                  >
                    <Text
                      style={[
                        styles.subChipText,
                        isActive && { color: sub.color, fontWeight: "700" },
                      ]}
                    >
                      {sub.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <Pressable style={styles.chipAddBtn} onPress={() => {}}>
            <Plus size={14} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* ── Today Timeline (shown only in Today filter, for tasks with dueTime) ── */}
        {activeSubCategory === "today" &&
          (() => {
            const timedTasks = filteredTasks
              .filter((t) => !!t.dueTime)
              .sort((a, b) => (a.dueTime ?? "").localeCompare(b.dueTime ?? ""));
            if (timedTasks.length === 0) return null;
            return (
              <View style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: Colors.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 4,
                    marginLeft: 4,
                  }}
                >
                  Today's Schedule
                </Text>
                {timedTasks.map((t, idx) => (
                  <TimelineBlock
                    key={t.id}
                    task={{
                      id: t.id,
                      title: t.title,
                      timeStr: t.dueTime!,
                      status: t.status === "done" ? "done" : "todo",
                      variant:
                        t.taskType === "withSubtask" ? "default" : "compact",
                      lineStyle:
                        idx === timedTasks.length - 1
                          ? "fade-out"
                          : "straight-muted",
                      nodeState: t.status === "done" ? "muted" : "active",
                    }}
                  />
                ))}
              </View>
            );
          })()}

        {/* ── Task List ─────────────────────────────────────────────────── */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: 16 },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Inbox size={36} color="rgba(91,164,229,0.4)" />
              </View>
              <Text style={styles.emptyTitle}>No tasks here</Text>
              <Text style={styles.emptySubtext}>
                Tap + to create a new task
              </Text>
            </View>
          }
        />

        {/* ── FAB ───────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 12 }]}
          onPress={() => setShowAdd(true)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#5BA4E5", "#3D8BD4"]}
            style={styles.fabGradient}
            start={[0, 0]}
            end={[1, 1]}
          >
            <Plus size={26} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Add Task Modal ────────────────────────────────────────────── */}
        <Modal
          visible={showAdd}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAdd(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => {
              Keyboard.dismiss();
              setShowAdd(false);
            }}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalSheet}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Task</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="What do you need to do?"
              placeholderTextColor={Colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAddTask}
            />

            <Text style={styles.modalLabel}>When</Text>
            <View style={styles.quickDateRow}>
              {[
                { label: "Today", val: todayStr() },
                { label: "Tomorrow", val: tomorrowStr() },
                { label: "Next Week", val: nextWeekStr() },
                { label: "No Date", val: "" },
              ].map(({ label, val }) => (
                <Pressable
                  key={label}
                  style={[
                    styles.quickDateChip,
                    newDueDate === val && styles.quickDateChipActive,
                  ]}
                  onPress={() => setNewDueDate(val)}
                >
                  <Text
                    style={[
                      styles.quickDateText,
                      newDueDate === val && styles.quickDateTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {(["p1", "p2", "p3"] as const).map((p) => {
                const active = newPriority === p;
                const { color, bg } = PRIORITY_META[p];
                return (
                  <Pressable
                    key={p}
                    style={[
                      styles.priorityBtn,
                      active && { backgroundColor: bg, borderColor: color },
                    ]}
                    onPress={() => setNewPriority(p)}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: active ? color : Colors.textMuted },
                      ]}
                    />
                    <Text style={[styles.priorityBtnText, active && { color }]}>
                      {p === "p1" ? "High" : p === "p2" ? "Med" : "Low"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, !newTitle.trim() && { opacity: 0.4 }]}
              onPress={handleAddTask}
              activeOpacity={0.85}
              disabled={!newTitle.trim()}
            >
              <Text style={styles.saveBtnText}>Add Task</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>

        {/* ── Task Detail Sheet ──────────────────────────────────────────── */}
        <TaskDetailSheet
          task={selectedTask}
          visible={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      </View>
    </GestureHandlerRootView>
  );
}
