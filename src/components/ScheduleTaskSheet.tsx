import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  Trash2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors, Radius, Spacing } from "../constants/theme";
import { useTaskStore } from "../store/useTaskStore";
import { Priority, Subtask, Task, TaskType } from "../types/task";
import { PrioritySelector } from "./PrioritySelector";
import { ProjectSelector } from "./ProjectSelector";

function getIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMinuteOfDay(time?: string) {
  if (!time) return null;

  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
}

interface ScheduleTaskSheetProps {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onAddSubtask: (taskId: string, subtask: Omit<Subtask, "id">) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onLaunchAI?: (task: Task) => void;
}

export function ScheduleTaskSheet({
  task,
  visible,
  onClose,
  onUpdate,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onLaunchAI,
}: ScheduleTaskSheetProps) {
  const { lists } = useTaskStore();
  const [title, setTitle] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [priority, setPriority] = useState<Priority>(3);
  const [taskType, setTaskType] = useState<TaskType>("normal");
  const [customType, setCustomType] = useState("");
  const [emoji, setEmoji] = useState("");
  const [listId, setListId] = useState("inbox");
  const [dueDate, setDueDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (task && visible) {
      setTitle(task.title);
      setPriority((task.priority as Priority) || 4);
      setTaskType(task.taskType || "normal");
      setListId(task.listId || "inbox");
      const st = task.dueTime || "";
      setStartTime(st);
      setDueDate(task.dueDate || getIsoDate(new Date()));
      setEmoji(task.emoji || "");
      setNotes(task.notes || "");

      if (st && task.estimatedMinutes) {
        const [h, m] = st.split(":").map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          const date = new Date(0, 0, 0, h, m + task.estimatedMinutes);
          const eh = date.getHours().toString().padStart(2, "0");
          const em = date.getMinutes().toString().padStart(2, "0");
          setEndTime(`${eh}:${em}`);
        } else {
          setEndTime("");
        }
      } else {
        setEndTime("");
      }
    }
  }, [task, visible]);

  if (!task) return null;

  const handleSaveAndClose = () => {
    let estimatedMinutes = undefined;
    let finalStartTime = startTime.trim();
    const startMinuteOfDay = getMinuteOfDay(finalStartTime);
    const now = new Date();
    const todayIso = getIsoDate(now);
    const nowMinuteOfDay = now.getHours() * 60 + now.getMinutes();
    const finalDueDate = dueDate || todayIso;

    if (finalDueDate < todayIso) {
      Alert.alert(
        "Invalid schedule",
        "You cannot schedule a task in the past.",
      );
      return;
    }

    if (
      finalDueDate === todayIso &&
      startMinuteOfDay !== null &&
      startMinuteOfDay < nowMinuteOfDay
    ) {
      Alert.alert(
        "Invalid time",
        "Start time must be now or later for today's schedule.",
      );
      return;
    }

    if (startTime.trim() && endTime.trim()) {
      const [sh, sm] = startTime.trim().split(":").map(Number);
      const [eh, em] = endTime.trim().split(":").map(Number);
      if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
        let duration = eh * 60 + em - (sh * 60 + sm);
        if (duration < 0) duration += 24 * 60; // crossed midnight
        estimatedMinutes = duration;
        finalStartTime = `${sh.toString().padStart(2, "0")}:${sm.toString().padStart(2, "0")}`;
      }
    }

    // Only update if there's an actual change
    if (
      title !== task.title ||
      finalStartTime !== task.dueTime ||
      taskType !== task.taskType ||
      dueDate !== task.dueDate ||
      priority !== task.priority ||
      listId !== task.listId ||
      notes !== task.notes ||
      emoji !== task.emoji ||
      (taskType === "manual" && customType !== "")
    ) {
      onUpdate(task.id, {
        title,
        dueDate: finalDueDate,
        dueTime: finalStartTime || undefined,
        estimatedMinutes,
        taskType:
          taskType === "manual" && customType ? (customType as any) : taskType,
        priority,
        listId,
        notes,
        emoji,
      });
    }
    onClose();
  };

  const getCombinedDate = () => {
    const d = dueDate ? new Date(dueDate) : new Date();
    if (startTime) {
      const [h, m] = startTime.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        d.setHours(h, m, 0, 0);
      }
    }
    return d;
  };

  const updateCombinedDate = (date: Date) => {
    setDueDate(getIsoDate(date));
    setStartTime(
      `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`,
    );
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    onAddSubtask(task.id, {
      title: newSubtask.trim(),
      completed: false,
    });
    setNewSubtask("");
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </BlurView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.sheetContainer}
        pointerEvents="box-none"
      >
        <LinearGradient
          colors={[Colors.surfaceElevated, Colors.background]}
          style={styles.sheetContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TextInput
              style={styles.emojiInput}
              value={emoji}
              onChangeText={setEmoji}
              placeholder="📌"
              placeholderTextColor={Colors.textMuted}
              maxLength={2}
            />
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Task Title..."
              placeholderTextColor={Colors.textMuted}
            />
            <Pressable onPress={handleSaveAndClose} style={styles.closeBtn}>
              <Check size={20} color={Colors.accent} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollArea}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ marginBottom: 24 }}>
              {/* Priority */}
              <Text style={styles.sectionLabel}>PRIORITY</Text>
              <View style={{ marginBottom: 16 }}>
                <PrioritySelector selected={priority} onSelect={setPriority} />
              </View>

              {/* Type */}
              <Text style={styles.sectionLabel}>Type</Text>
              <View style={styles.typeRow}>
                {(["normal", "toGo", "project", "manual"] as TaskType[]).map(
                  (t) => (
                    <Pressable
                      key={t}
                      style={[
                        styles.typeChip,
                        taskType === t && styles.typeChipActive,
                      ]}
                      onPress={() => setTaskType(t)}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          taskType === t && styles.typeChipTextActive,
                        ]}
                      >
                        {t === "normal"
                          ? "Task"
                          : t === "toGo"
                            ? "To go"
                            : t === "project"
                              ? "Project"
                              : "Manual"}
                      </Text>
                    </Pressable>
                  ),
                )}
              </View>

              {taskType === "manual" && (
                <TextInput
                  style={[styles.notesInput, { height: 48, marginBottom: 16 }]}
                  value={customType}
                  onChangeText={setCustomType}
                  placeholder="Enter custom task type..."
                  placeholderTextColor={Colors.textMuted}
                />
              )}

              {/* Project */}
              <Text style={styles.sectionLabel}>Projects</Text>
              <View style={{ marginBottom: 16 }}>
                <ProjectSelector
                  lists={lists}
                  selectedListId={listId}
                  onSelect={setListId}
                />
              </View>

              {/* Sketched DateTime Selectors */}
              <View style={{ marginBottom: 24, marginTop: 8 }}>
                <Pressable
                  style={[
                    styles.sketchedDateBtn,
                    showDatePicker && styles.sketchedDateBtnActive,
                  ]}
                  onPress={() => {
                    setShowDatePicker(!showDatePicker);
                    setShowStartPicker(false);
                    setShowEndPicker(false);
                  }}
                >
                  <Calendar
                    size={18}
                    color={
                      showDatePicker ? Colors.accent : Colors.textSecondary
                    }
                  />
                  <View style={styles.sketchedDateTextCol}>
                    <Text style={styles.sketchedDateLabel}>Select a day</Text>
                    <Text style={styles.sketchedDateValue}>
                      {dueDate
                        ? dueDate.split("-").reverse().join(".")
                        : "DD.MM.YYYY"}
                    </Text>
                  </View>
                  {showDatePicker ? (
                    <ChevronUp size={20} color={Colors.accent} />
                  ) : (
                    <ChevronDown size={20} color={Colors.textSecondary} />
                  )}
                </Pressable>

                {showDatePicker && (
                  <View style={styles.sketchedPickerWrapper}>
                    <DateTimePicker
                      value={getCombinedDate()}
                      mode="date"
                      display={Platform.OS === "ios" ? "inline" : "spinner"}
                      textColor={Colors.textPrimary}
                      themeVariant="dark"
                      onChange={(event, selectedDate) => {
                        if (Platform.OS === "android") setShowDatePicker(false);
                        if (selectedDate) {
                          setDueDate(getIsoDate(selectedDate));
                        }
                      }}
                    />
                  </View>
                )}

                <View style={styles.sketchedTimeRow}>
                  <View style={{ flex: 1 }}>
                    <Pressable
                      style={[
                        styles.sketchedDateBtn,
                        showStartPicker && styles.sketchedDateBtnActive,
                      ]}
                      onPress={() => {
                        setShowStartPicker(!showStartPicker);
                        setShowDatePicker(false);
                        setShowEndPicker(false);
                      }}
                    >
                      <Clock
                        size={16}
                        color={
                          showStartPicker ? Colors.accent : Colors.textSecondary
                        }
                      />
                      <View style={styles.sketchedDateTextCol}>
                        <Text style={styles.sketchedDateLabel}>Start with</Text>
                        <Text style={styles.sketchedDateValue}>
                          {startTime || "--:--"}
                        </Text>
                      </View>
                      {showStartPicker ? (
                        <ChevronUp size={18} color={Colors.accent} />
                      ) : (
                        <ChevronDown size={18} color={Colors.textSecondary} />
                      )}
                    </Pressable>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Pressable
                      style={[
                        styles.sketchedDateBtn,
                        showEndPicker && styles.sketchedDateBtnActive,
                      ]}
                      onPress={() => {
                        setShowEndPicker(!showEndPicker);
                        setShowDatePicker(false);
                        setShowStartPicker(false);
                      }}
                    >
                      <Clock
                        size={16}
                        color={
                          showEndPicker ? Colors.accent : Colors.textSecondary
                        }
                      />
                      <View style={styles.sketchedDateTextCol}>
                        <Text style={styles.sketchedDateLabel}>End with</Text>
                        <Text style={styles.sketchedDateValue}>
                          {endTime || "--:--"}
                        </Text>
                      </View>
                      {showEndPicker ? (
                        <ChevronUp size={18} color={Colors.accent} />
                      ) : (
                        <ChevronDown size={18} color={Colors.textSecondary} />
                      )}
                    </Pressable>
                  </View>
                </View>

                {(showStartPicker || showEndPicker) && (
                  <View
                    style={[styles.sketchedPickerWrapper, { marginTop: -8 }]}
                  >
                    <DateTimePicker
                      value={getCombinedDate()}
                      mode="time"
                      display="spinner"
                      textColor={Colors.textPrimary}
                      themeVariant="dark"
                      onChange={(event, selectedDate) => {
                        if (Platform.OS === "android") {
                          showStartPicker
                            ? setShowStartPicker(false)
                            : setShowEndPicker(false);
                        }
                        if (selectedDate) {
                          const timeStr = `${selectedDate.getHours().toString().padStart(2, "0")}:${selectedDate.getMinutes().toString().padStart(2, "0")}`;
                          if (showStartPicker) setStartTime(timeStr);
                          if (showEndPicker) setEndTime(timeStr);
                        }
                      }}
                    />
                  </View>
                )}
              </View>
            </View>

            {/* Subtasks */}
            {(taskType === "withSubtask" || taskType === "normal") && (
              <View style={{ marginBottom: 24 }}>
                <Text style={styles.sectionLabel}>Subtask</Text>
                {task.subtasks?.map((st) => (
                  <View key={st.id} style={styles.subtaskRow}>
                    <Pressable
                      style={[
                        styles.subtaskCheck,
                        st.completed && styles.subtaskCheckDone,
                      ]}
                      onPress={() => onToggleSubtask(task.id, st.id)}
                    >
                      {st.completed && <Check size={14} color="#000" />}
                    </Pressable>
                    <Text
                      style={[
                        styles.subtaskTitle,
                        st.completed && styles.subtaskTitleDone,
                      ]}
                    >
                      {st.title}
                    </Text>
                    <Pressable
                      style={styles.deleteSubBtn}
                      onPress={() => onDeleteSubtask(task.id, st.id)}
                    >
                      <Trash2 size={16} color={Colors.error} />
                    </Pressable>
                  </View>
                ))}

                <View style={styles.addSubtaskRow}>
                  <Plus size={18} color={Colors.textMuted} />
                  <TextInput
                    style={styles.addSubtaskInput}
                    value={newSubtask}
                    onChangeText={setNewSubtask}
                    placeholder="Add subtask..."
                    placeholderTextColor={Colors.textMuted}
                    onSubmitEditing={handleAddSubtask}
                    returnKeyType="done"
                  />
                  {newSubtask.trim().length > 0 && (
                    <Pressable
                      style={styles.addSubtaskBtn}
                      onPress={handleAddSubtask}
                    >
                      <Text style={styles.addSubtaskBtnText}>Add</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}

            {/* Notes */}
            <Text style={styles.sectionLabel}>Notes -</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Text area for Note of task"
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <Pressable
              style={styles.aiBtn}
              onPress={() => onLaunchAI && onLaunchAI(task)}
            >
              <Text style={styles.aiBtnText}>✦ Ask AI</Text>
            </Pressable>

            <Pressable
              style={[
                styles.completeBtn,
                task.status === "done" && styles.completeBtnDone,
              ]}
              onPress={() => {
                onUpdate(task.id, {
                  status: task.status === "done" ? "todo" : "done",
                });
                onClose();
              }}
            >
              <Text style={styles.completeBtnText}>
                {task.status === "done" ? "Mark Pending" : "Complete Task"}
              </Text>
            </Pressable>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetContent: {
    maxHeight: "85%",
    minHeight: 300,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.surfaceBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  titleInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginRight: 16,
    padding: 0,
  },
  emojiInput: {
    fontSize: 22,
    marginRight: 10,
    width: 32,
    textAlign: "center",
  },
  closeBtn: {
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  timeText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: "500",
  },
  timeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)", // Subtle exoplan flat button depth
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full, // pill
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginRight: 6,
  },
  timeInput: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "bold",
    minWidth: 42,
    textAlign: "center",
  },
  scrollArea: {
    maxHeight: "100%", // Let it flex naturally within the sheet
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 12,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  typeChipActive: {
    backgroundColor: "rgba(168,85,247,0.15)",
    borderColor: Colors.accent,
  },
  typeChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  typeChipTextActive: {
    color: Colors.accent,
  },
  sketchedDateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.sm,
  },
  sketchedDateBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(168,85,247,0.05)",
  },
  sketchedDateTextCol: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  sketchedDateLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  sketchedDateValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "bold",
    marginTop: 2,
  },
  sketchedPickerWrapper: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 16,
    overflow: "hidden",
  },
  sketchedTimeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  notesInput: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: Radius.md,
    color: Colors.textPrimary,
    padding: 16,
    height: 100,
    fontSize: 14,
    marginBottom: 20,
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 8,
  },
  subtaskCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  subtaskCheckDone: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  subtaskTitleDone: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },
  deleteSubBtn: {
    padding: 4,
  },
  addSubtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 12,
    borderRadius: Radius.md,
    marginTop: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  addSubtaskInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 12,
    padding: 0,
  },
  addSubtaskBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  addSubtaskBtnText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  aiBtn: {
    flex: 1,
    backgroundColor: "rgba(168,85,247,0.15)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.3)",
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  aiBtnText: {
    color: "#E9D5FF",
    fontSize: 14,
    fontWeight: "600",
  },
  completeBtn: {
    flex: 2,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  completeBtnDone: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  completeBtnText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "bold",
  },
});
