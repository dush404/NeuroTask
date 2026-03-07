// NeuroTask — Task Detail Bottom Sheet
// Full edit UI: title, priority, due date, task type, notes, subtasks (add/tick/delete)

import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
    Calendar,
    Check,
    MapPin,
    Navigation,
    Plus,
    Trash2,
    X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Colors, Radius } from "../constants/theme";
import { useTaskStore } from "../store/useTaskStore";
import { Priority, Subtask, Task, TaskType } from "../types/task";

interface Props {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 1, label: "High", color: Colors.priorityHigh },
  { value: 2, label: "Med", color: Colors.priorityMedium },
  { value: 3, label: "Low", color: Colors.priorityLow },
  { value: 4, label: "None", color: Colors.textMuted },
];

const TASK_TYPE_OPTIONS: { value: TaskType; label: string; emoji: string }[] = [
  { value: "normal", label: "Normal", emoji: "✅" },
  { value: "withSubtask", label: "Subtasks", emoji: "📋" },
  { value: "toGo", label: "To Go", emoji: "🚗" },
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export const TaskDetailSheet: React.FC<Props> = ({
  task,
  visible,
  onClose,
}) => {
  const { updateTask, deleteTask, addSubtask, removeSubtask, toggleSubtask } =
    useTaskStore();

  // Local edit state — synced from task prop
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>(3);
  const [taskType, setTaskType] = useState<TaskType>("normal");
  const [dueDate, setDueDate] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes ?? "");
      setPriority(task.priority);
      setTaskType(task.taskType ?? "normal");
      setDueDate(task.dueDate ?? "");
      setFromLocation(task.fromLocation ?? "");
      setToLocation(task.toLocation ?? "");
      setDirty(false);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    updateTask(task.id, {
      title: title.trim() || task.title,
      notes,
      priority,
      taskType,
      dueDate: dueDate || undefined,
      fromLocation: fromLocation || undefined,
      toLocation: toLocation || undefined,
    });
    setDirty(false);
    onClose();
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const subtask: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    addSubtask(task.id, subtask);
    setNewSubtaskTitle("");
  };

  const priorityColor =
    PRIORITY_OPTIONS.find((p) => p.value === priority)?.color ??
    Colors.textMuted;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            if (dirty) handleSave();
            else onClose();
          }}
        />
      </BlurView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.sheetWrapper}
        pointerEvents="box-none"
      >
        <Animated.View
          entering={FadeInDown.duration(300).springify().damping(20)}
          style={{ width: "100%", height: "45%", minHeight: 400 }}
        >
          <LinearGradient
            colors={["rgba(30,41,59,0.95)", "rgba(15,23,42,0.95)"]}
            style={styles.sheet}
          >
            {/* Handle bar */}
            <View style={styles.handle} />

            {/* Header row */}
            <View style={styles.headerRow}>
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: priorityColor },
                ]}
              />
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  setDirty(true);
                }}
                multiline
                placeholder="Task title"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
              />
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <X size={18} color={Colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.body}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* ── Priority ────────────────────────────────────────────────── */}
              <Text style={styles.sectionLabel}>Priority</Text>
              <View style={styles.chipRow}>
                {PRIORITY_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.chip,
                      priority === opt.value && {
                        backgroundColor: `${opt.color}20`,
                        borderColor: opt.color,
                      },
                    ]}
                    onPress={() => {
                      setPriority(opt.value);
                      setDirty(true);
                    }}
                  >
                    <View
                      style={[styles.chipDot, { backgroundColor: opt.color }]}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        priority === opt.value && { color: opt.color },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* ── Task Type ────────────────────────────────────────────────── */}
              <Text style={styles.sectionLabel}>Type</Text>
              <View style={styles.chipRow}>
                {TASK_TYPE_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.chip,
                      taskType === opt.value && {
                        backgroundColor: "rgba(91,164,229,0.15)",
                        borderColor: "#5BA4E5",
                      },
                    ]}
                    onPress={() => {
                      setTaskType(opt.value);
                      setDirty(true);
                    }}
                  >
                    <Text style={styles.chipEmoji}>{opt.emoji}</Text>
                    <Text
                      style={[
                        styles.chipText,
                        taskType === opt.value && { color: "#5BA4E5" },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* ── Due Date ─────────────────────────────────────────────────── */}
              <Text style={styles.sectionLabel}>Due Date</Text>
              <View style={styles.chipRow}>
                {[
                  { label: "Today", val: todayStr() },
                  { label: "Tomorrow", val: tomorrowStr() },
                  { label: "None", val: "" },
                ].map(({ label, val }) => (
                  <Pressable
                    key={label}
                    style={[
                      styles.chip,
                      dueDate === val && {
                        backgroundColor: "rgba(245,158,11,0.15)",
                        borderColor: "#F59E0B",
                      },
                    ]}
                    onPress={() => {
                      setDueDate(val);
                      setDirty(true);
                    }}
                  >
                    {val !== "" && (
                      <Calendar
                        size={12}
                        color={dueDate === val ? "#F59E0B" : Colors.textMuted}
                      />
                    )}
                    <Text
                      style={[
                        styles.chipText,
                        dueDate === val && { color: "#F59E0B" },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
                {dueDate &&
                  !["", todayStr(), tomorrowStr()].includes(dueDate) && (
                    <View
                      style={[
                        styles.chip,
                        {
                          borderColor: "#F59E0B",
                          backgroundColor: "rgba(245,158,11,0.15)",
                        },
                      ]}
                    >
                      <Calendar size={12} color="#F59E0B" />
                      <Text style={[styles.chipText, { color: "#F59E0B" }]}>
                        {new Date(dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </View>
                  )}
              </View>

              {/* ── To-Go Locations (only when taskType = toGo) ─────────────── */}
              {taskType === "toGo" && (
                <Animated.View entering={FadeInUp.duration(200)}>
                  <Text style={styles.sectionLabel}>Route</Text>
                  <View style={styles.locationRow}>
                    <Navigation size={14} color="#4ECDC4" />
                    <TextInput
                      style={styles.locationInput}
                      value={fromLocation}
                      onChangeText={(t) => {
                        setFromLocation(t);
                        setDirty(true);
                      }}
                      placeholder="From..."
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                  <View style={[styles.locationRow, { marginTop: 8 }]}>
                    <MapPin size={14} color="#FF6B9D" />
                    <TextInput
                      style={styles.locationInput}
                      value={toLocation}
                      onChangeText={(t) => {
                        setToLocation(t);
                        setDirty(true);
                      }}
                      placeholder="To..."
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </Animated.View>
              )}

              {/* ── Subtasks (always visible, even for normal tasks) ─────────── */}
              <Text style={styles.sectionLabel}>
                Subtasks{" "}
                <Text style={styles.sectionCount}>{task.subtasks.length}</Text>
              </Text>

              {task.subtasks.map((sub) => (
                <Animated.View
                  key={sub.id}
                  entering={FadeInUp.duration(200)}
                  style={styles.subtaskRow}
                >
                  <Pressable
                    style={[
                      styles.subtaskCheck,
                      sub.completed && {
                        backgroundColor: Colors.accent,
                        borderColor: Colors.accent,
                      },
                    ]}
                    onPress={() => toggleSubtask(task.id, sub.id)}
                  >
                    {sub.completed && (
                      <Check size={11} color="#000" strokeWidth={3} />
                    )}
                  </Pressable>
                  <Text
                    style={[
                      styles.subtaskTitle,
                      sub.completed && styles.subtaskDone,
                    ]}
                  >
                    {sub.title}
                  </Text>
                  <Pressable onPress={() => removeSubtask(task.id, sub.id)}>
                    <X size={14} color="rgba(255,255,255,0.25)" />
                  </Pressable>
                </Animated.View>
              ))}

              {/* Add subtask input */}
              <View style={styles.addSubtaskRow}>
                <Plus size={14} color={Colors.textMuted} />
                <TextInput
                  style={styles.addSubtaskInput}
                  value={newSubtaskTitle}
                  onChangeText={setNewSubtaskTitle}
                  placeholder="Add subtask..."
                  placeholderTextColor={Colors.textMuted}
                  returnKeyType="done"
                  onSubmitEditing={handleAddSubtask}
                />
                {newSubtaskTitle.trim().length > 0 && (
                  <Pressable onPress={handleAddSubtask}>
                    <View style={styles.addSubtaskBtn}>
                      <Check size={12} color="#fff" strokeWidth={3} />
                    </View>
                  </Pressable>
                )}
              </View>

              {/* ── Notes ────────────────────────────────────────────────────── */}
              <Text style={styles.sectionLabel}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={(t) => {
                  setNotes(t);
                  setDirty(true);
                }}
                placeholder="Add notes..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
              />

              {/* Bottom padding */}
              <View style={{ height: 24 }} />
            </ScrollView>

            {/* ── Action buttons ──────────────────────────────────────────── */}
            <View style={styles.footer}>
              <Pressable style={styles.deleteBtn} onPress={handleDelete}>
                <Trash2 size={16} color={Colors.priorityHigh} />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </Pressable>

              <TouchableOpacity
                style={[styles.saveBtn, !dirty && { opacity: 0.45 }]}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#5BA4E5", "#3D8BD4"]}
                  style={styles.saveBtnGradient}
                  start={[0, 0]}
                  end={[1, 1]}
                >
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    height: "100%",
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 20,
  },
  priorityIndicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    minHeight: 28,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 24,
    maxHeight: 80,
  },
  closeBtn: {
    padding: 4,
    marginTop: 2,
  },
  body: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 16,
  },
  sectionCount: {
    color: "#5BA4E5",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  chipEmoji: {
    fontSize: 13,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  subtaskCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  subtaskDone: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },
  addSubtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  addSubtaskInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  addSubtaskBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  notesInput: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: Radius.md,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlignVertical: "top",
    minHeight: 80,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,77,109,0.3)",
    backgroundColor: "rgba(255,77,109,0.08)",
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.priorityHigh,
  },
  saveBtn: {
    flex: 1,
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  saveBtnGradient: {
    paddingVertical: 13,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
