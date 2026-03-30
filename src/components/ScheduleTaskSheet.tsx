import { BlurView } from "expo-blur";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  Clock,
  Minus,
  Navigation,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTaskStore } from "../store/useTaskStore";
import { Priority, Subtask, Task, TaskType } from "../types/task";
import { InlineDatePicker, InlineTimePicker } from "./InlineWheelPickers";
import { StripedBackground } from "./StripedBackground";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const PRIORITY_OPTIONS: {
  value: Priority;
  label: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 1,
    label: "Urgent",
    color: "#FF4D6D",
    icon: <AlertCircle size={14} color="#FF4D6D" />,
  },
  {
    value: 2,
    label: "High",
    color: "#F59E0B",
    icon: <ChevronsUp size={14} color="#F59E0B" />,
  },
  {
    value: 3,
    label: "Medium",
    color: "#4CAF50",
    icon: <Minus size={14} color="#4CAF50" />,
  },
  {
    value: 4,
    label: "Low",
    color: "#5BA4E5",
    icon: <ChevronsDown size={14} color="#5BA4E5" />,
  },
];
const TASK_TYPE_OPTIONS: {
  value: TaskType;
  label: string;
}[] = [
  {
    value: "normal",
    label: "Task",
  },
  {
    value: "project",
    label: "Project",
  },
  {
    value: "toGo",
    label: "To Go",
  },
];

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

function formatDisplayDate(iso: string) {
  if (!iso) return "DD . MM . YYYY";
  const [y, m, d] = iso.split("-");
  return `${d} . ${m} . ${y}`;
}

function addMinutesToTime(time: string, minutesToAdd: number) {
  const minuteOfDay = getMinuteOfDay(time);
  if (minuteOfDay === null) return "";
  const total = (minuteOfDay + minutesToAdd) % (24 * 60);
  const normalized = total < 0 ? total + 24 * 60 : total;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) return "No duration";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function getDurationBetween(start?: string, end?: string) {
  if (!start || !end) return null;
  const startMins = getMinuteOfDay(start);
  const endMins = getMinuteOfDay(end);
  if (startMins === null || endMins === null) return null;

  let diff = endMins - startMins;
  if (diff < 0) diff += 24 * 60;
  return diff;
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
  const { lists, deleteTask } = useTaskStore();
  const [title, setTitle] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [priority, setPriority] = useState<Priority>(3);
  const [taskType, setTaskType] = useState<TaskType>("normal");
  const [listId, setListId] = useState("inbox");
  const [dueDate, setDueDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [travelMode, setTravelMode] = useState("plane");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const titleRef = useRef<TextInput>(null);

  // ── Animation state ─────────────────────────────────────────────
  const [internalVisible, setInternalVisible] = useState(false);
  const sheetTranslateY = useSharedValue(SCREEN_HEIGHT);
  const bgOpacity = useSharedValue(0);
  const kbHeight = useSharedValue(0);

  // Sync internal visibility and trigger animations
  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      requestAnimationFrame(() => {
        sheetTranslateY.value = withSpring(0, {
          damping: 24,
          stiffness: 200,
          mass: 0.8,
        });
        bgOpacity.value = withTiming(1, { duration: 250 });
      });
    } else if (internalVisible) {
      Keyboard.dismiss();
      sheetTranslateY.value = withSpring(SCREEN_HEIGHT, {
        damping: 24,
        stiffness: 200,
        mass: 0.8,
      });
      bgOpacity.value = withTiming(0, { duration: 250 }, (isFinished) => {
        if (isFinished) {
          runOnJS(setInternalVisible)(false);
        }
      });
    }
  }, [visible, internalVisible]);

  // Keyboard listeners
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    const showSub = Keyboard.addListener("keyboardWillShow", (e) => {
      kbHeight.value = withTiming(e.endCoordinates.height, { duration: 250 });
    });
    const hideSub = Keyboard.addListener("keyboardWillHide", () => {
      kbHeight.value = withTiming(0, { duration: 250 });
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!task || !visible) return;

    const todayIso = getIsoDate(new Date());
    const initialStartTime = task.dueTime ?? "";
    const initialDuration = task.estimatedMinutes ?? 0;

    setTitle(task.title ?? "");
    setNewSubtask("");
    setStartTime(initialStartTime);
    setEndTime(
      initialStartTime && initialDuration > 0
        ? addMinutesToTime(initialStartTime, initialDuration)
        : "",
    );
    setShowStartPicker(false);
    setShowEndPicker(false);
    setPriority(task.priority ?? 3);
    setTaskType(task.taskType ?? "normal");
    setListId(task.listId ?? "inbox");
    setDueDate(task.dueDate ?? todayIso);
    setShowDatePicker(false);
    setNotes(task.notes ?? "");
    setFromLocation(task.fromLocation ?? "");
    setToLocation(task.toLocation ?? "");
    setTravelMode(task.travelMode ?? "plane");
    setSubtasks(task.subtasks ?? []);
  }, [task, visible]);

  const handleSaveAndClose = () => {
    if (!task) return;
    const canSave = title.trim().length > 0;
    if (!canSave) return;

    let estimatedMinutes = undefined;
    let finalStartTime = startTime.trim();
    const now = new Date();
    const todayIso = getIsoDate(now);
    const finalDueDate = dueDate || todayIso;

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
      fromLocation !== task.fromLocation ||
      toLocation !== task.toLocation ||
      travelMode !== (task as any).travelMode ||
      JSON.stringify(subtasks) !== JSON.stringify(task.subtasks)
    ) {
      onUpdate(task.id, {
        title,
        dueDate: finalDueDate,
        dueTime: finalStartTime || undefined,
        estimatedMinutes,
        taskType,
        priority,
        listId,
        notes,
        fromLocation,
        toLocation,
        travelMode: travelMode as any,
        subtasks,
      });
    }
    onClose();
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `sub-${Date.now()}`, title: newSubtask.trim(), completed: false },
    ]);
    setNewSubtask("");
  };

  const handleToggleSubtask = (subId: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s)),
    );
  };

  const handleDeleteSubtask = (subId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subId));
  };

  const canSave = title.trim().length > 0;
  const selectedPriorityColor =
    priority === 1
      ? "#FF4D6D"
      : priority === 2
        ? "#F59E0B"
        : priority === 3
          ? "#4CAF50"
          : "#5BA4E5";
  const isScheduleActive = showDatePicker || showStartPicker || showEndPicker;

  const isExistingTask = Boolean(task?.title.trim());
  const selectedPriorityMeta =
    PRIORITY_OPTIONS.find((option) => option.value === priority) ??
    PRIORITY_OPTIONS[2];
  const selectedTaskTypeMeta =
    TASK_TYPE_OPTIONS.find((option) => option.value === taskType) ??
    TASK_TYPE_OPTIONS[0];
  const estimatedDurationLabel = formatDuration(
    getDurationBetween(startTime, endTime) ?? task?.estimatedMinutes,
  );
  const activeList = lists.find((list) => list.id === listId) ?? lists[0];

  const handleDelete = () => {
    if (!task) return;
    deleteTask(task.id);
    onClose();
  };

  const focusTitle = () => {
    titleRef.current?.focus();
  };

  const handlePan = React.useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          if (e.translationY > 0) {
            sheetTranslateY.value = e.translationY;
          }
        })
        .onEnd((e) => {
          if (e.translationY > 100 || e.velocityY > 500) {
            runOnJS(onClose)();
          } else {
            sheetTranslateY.value = withSpring(0, {
              damping: 24,
              stiffness: 200,
              mass: 0.8,
            });
            if (e.translationY < -40) {
              runOnJS(focusTitle)();
            }
          }
        }),
    [onClose],
  );

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const kbSpacerStyle = useAnimatedStyle(() => ({
    height: kbHeight.value,
  }));

  if (!task) return null;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <Modal
      visible={internalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Blurred backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </BlurView>
      </Animated.View>

      {/* Centred card */}
      <View style={styles.centreContainer} pointerEvents="box-none">
        <Animated.View style={[styles.compactCard, sheetStyle]}>
          <BlurView
            intensity={32}
            tint="dark"
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod="dimezisBlurView"
          />
          {/* Priority-tinted stripes */}
          <StripedBackground color={selectedPriorityColor} opacity={0.06} />

          {/* ── Drag handle ─────────────────────────────── */}
          <GestureDetector gesture={handlePan}>
            <View style={styles.handleArea}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>

          {/* ══ ROW 1 — Task name │ type chip │ priority chip ══ */}
          <View style={styles.row1}>
            {/* Task name input */}
            <TextInput
              ref={titleRef}
              style={styles.compactTitleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Task name…"
              placeholderTextColor="rgba(255,255,255,0.28)"
              returnKeyType="done"
              onSubmitEditing={handleSaveAndClose}
            />

            {/* Type chip — tap to cycle */}
            <Pressable
              style={[
                styles.metaChip,
                {
                  backgroundColor: `${selectedPriorityColor}18`,
                  borderColor: `${selectedPriorityColor}45`,
                },
              ]}
              onPress={() => {
                const idx = TASK_TYPE_OPTIONS.findIndex(
                  (o) => o.value === taskType,
                );
                setTaskType(
                  TASK_TYPE_OPTIONS[(idx + 1) % TASK_TYPE_OPTIONS.length].value,
                );
              }}
            >
              {taskType === "normal" && (
                <Check
                  size={14}
                  color={selectedPriorityColor}
                  strokeWidth={3}
                />
              )}
              {taskType === "project" && (
                <Briefcase size={14} color={selectedPriorityColor} />
              )}
              {taskType === "toGo" && (
                <Navigation size={14} color={selectedPriorityColor} />
              )}
              <Text
                style={[styles.metaChipText, { color: selectedPriorityColor }]}
              >
                {selectedTaskTypeMeta.label}
              </Text>
            </Pressable>

            {/* Priority chip — tap to cycle */}
            <Pressable
              style={[
                styles.metaChip,
                {
                  backgroundColor: `${selectedPriorityColor}18`,
                  borderColor: `${selectedPriorityColor}45`,
                },
              ]}
              onPress={() => {
                const idx = PRIORITY_OPTIONS.findIndex(
                  (o) => o.value === priority,
                );
                setPriority(
                  PRIORITY_OPTIONS[(idx + 1) % PRIORITY_OPTIONS.length].value,
                );
              }}
            >
              {selectedPriorityMeta.icon}
              <Text
                style={[styles.metaChipText, { color: selectedPriorityColor }]}
              >
                {selectedPriorityMeta.label}
              </Text>
            </Pressable>
          </View>

          {/* Thin separator */}
          <View
            style={[
              styles.chipDivider,
              { backgroundColor: `${selectedPriorityColor}22` },
            ]}
          />

          {/* ══ ROW 2 — Date ══════════════════════════════════════ */}
          <Pressable
            style={styles.row2}
            onPress={() => {
              setShowDatePicker(!showDatePicker);
              setShowStartPicker(false);
              setShowEndPicker(false);
            }}
          >
            <View
              style={[
                styles.rowIconBg,
                { backgroundColor: `${selectedPriorityColor}15` },
              ]}
            >
              <Calendar size={14} color={selectedPriorityColor} />
            </View>
            <Text
              style={[
                styles.rowText,
                showDatePicker && { color: selectedPriorityColor },
              ]}
            >
              {formatDisplayDate(dueDate)}
            </Text>
            {showDatePicker ? (
              <ChevronUp size={16} color={selectedPriorityColor} />
            ) : (
              <ChevronDown size={16} color="rgba(255,255,255,0.3)" />
            )}
          </Pressable>

          {showDatePicker && (
            <View style={styles.pickerWrapper}>
              <InlineDatePicker
                dateIso={dueDate}
                onChange={setDueDate}
                accentColor={selectedPriorityColor}
              />
            </View>
          )}

          {/* ══ ROW 3 — Start / End time ══════════════════════════ */}
          <View
            style={[
              styles.chipDivider,
              { backgroundColor: "rgba(255,255,255,0.06)" },
            ]}
          />
          <View style={styles.row3}>
            {/* Start time */}
            <Pressable
              style={styles.timeHalf}
              onPress={() => {
                setShowStartPicker(!showStartPicker);
                setShowDatePicker(false);
                setShowEndPicker(false);
              }}
            >
              <Clock
                size={14}
                color={
                  showStartPicker
                    ? selectedPriorityColor
                    : "rgba(255,255,255,0.35)"
                }
              />
              <Text
                style={[
                  styles.rowText,
                  showStartPicker && { color: selectedPriorityColor },
                ]}
              >
                {startTime || "--:--"}
              </Text>
            </Pressable>

            <View style={styles.timeSeparator} />

            {/* End time */}
            <Pressable
              style={styles.timeHalf}
              onPress={() => {
                setShowEndPicker(!showEndPicker);
                setShowDatePicker(false);
                setShowStartPicker(false);
              }}
            >
              <Clock
                size={14}
                color={
                  showEndPicker
                    ? selectedPriorityColor
                    : "rgba(255,255,255,0.35)"
                }
              />
              <Text
                style={[
                  styles.rowText,
                  showEndPicker && { color: selectedPriorityColor },
                ]}
              >
                {endTime || "--:--"}
              </Text>
            </Pressable>
          </View>

          {(showStartPicker || showEndPicker) && (
            <View style={styles.pickerWrapper}>
              <InlineTimePicker
                key={showEndPicker ? "end" : "start"}
                time={showEndPicker ? endTime : startTime}
                accentColor={selectedPriorityColor}
                onChange={(val) => {
                  if (showStartPicker) setStartTime(val);
                  if (showEndPicker) setEndTime(val);
                }}
              />
            </View>
          )}

          {/* ══ Bottom action row ═══════════════════════════════ */}
          <View style={styles.bottomRow}>
            {/* Duration badge */}
            <View style={styles.durationBadge}>
              <Clock size={11} color="rgba(255,255,255,0.35)" />
              <Text style={styles.durationText}>{estimatedDurationLabel}</Text>
            </View>

            <View style={{ flex: 1 }} />

            {/* Delete (existing tasks only) */}
            {isExistingTask && (
              <Pressable onPress={handleDelete} style={styles.actionBtn}>
                <Trash2 size={20} color="#FF4D6D" />
              </Pressable>
            )}

            {/* Close */}
            <Pressable onPress={onClose} style={styles.actionBtn}>
              <X size={22} color="rgba(255,255,255,0.55)" />
            </Pressable>

            {/* Save / confirm */}
            <Pressable
              onPress={handleSaveAndClose}
              disabled={!canSave}
              style={styles.actionBtn}
            >
              <Check
                size={22}
                color={
                  canSave ? selectedPriorityColor : "rgba(255,255,255,0.25)"
                }
                strokeWidth={3}
              />
            </Pressable>
          </View>

          <Animated.View style={kbSpacerStyle} pointerEvents="none" />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  /* ── Centred overlay container ─────────────────────────────────── */
  centreContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 20,
  },

  /* ── The single compact card ──────────────────────────────────── */
  compactCard: {
    width: "100%",
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.09)",
    backgroundColor: "rgba(8,12,20,0.88)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 22,
  },

  /* ── Drag handle ───────────────────────────────────────────────── */
  handleArea: {
    width: "100%",
    paddingTop: 8,
    paddingBottom: 6,
    alignItems: "center",
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  /* ── Row 1: name input + chips ─────────────────────────────────── */
  row1: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 8,
  },
  compactTitleInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    padding: 0,
    letterSpacing: -0.2,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },

  /* ── Divider/Separator ─────────────────────────────────────────── */
  chipDivider: {
    height: 1,
    marginHorizontal: 14,
  },

  /* ── Row 2: date ───────────────────────────────────────────────── */
  row2: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  rowIconBg: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },

  /* ── Row 3: time ───────────────────────────────────────────────── */
  row3: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  timeHalf: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeSeparator: {
    width: 1,
    height: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 6,
  },

  /* ── Inline picker ─────────────────────────────────────────────── */
  pickerWrapper: {
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingVertical: 8,
  },

  /* ── Bottom action row ─────────────────────────────────────────── */
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 8,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.35)",
  },
  actionBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
});
