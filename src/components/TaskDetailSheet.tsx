// NeuroTask — Task Detail Bottom Sheet (matches sketch layout)
// Layout: Title → [TYPE | PRIORITY side-by-side] → Date → Start/End Time → Subtask → Notes → From/To (toGo only)

import { BlurView } from "expo-blur";
import {
  AlertCircle,
  Bike,
  Briefcase,
  Bus,
  Calendar,
  Car,
  Check,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  Clock,
  GripVertical,
  MapPin,
  Minus,
  Navigation,
  Plane,
  Plus,
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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout as ReanimatedLayout,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "../constants/theme";
import { useTaskStore } from "../store/useTaskStore";
import { Priority, Subtask, Task, TaskType } from "../types/task";
import { InlineDatePicker, InlineTimePicker } from "./InlineWheelPickers";
import { StripedBackground } from "./StripedBackground";
import { SwipeSelector } from "./SwipeSelector";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const SELECTOR_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

/* ── Type options ─────────────────────────────────────────────────── */
const TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: "normal", label: "Task" },
  { value: "project", label: "Project" },
  { value: "toGo", label: "To Go" },
];

/* ── Priority options ─────────────────────────────────────────────── */
const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 1, label: "Urgent", color: "#FF4D6D" },
  { value: 2, label: "High", color: "#F59E0B" },
  { value: 3, label: "Medium", color: "#4CAF50" },
  { value: 4, label: "Low", color: Colors.textMuted },
];

/* ── Helpers ──────────────────────────────────────────────────────── */
function getIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(iso: string) {
  if (!iso) return "DD . MM . YYYY";
  const parts = iso.split("-");
  if (parts.length !== 3) return "DD . MM . YYYY";
  const [y, m, d] = parts;
  return `${d} . ${m} . ${y}`;
}

interface Props {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════ */
export const TaskDetailSheet: React.FC<Props> = ({
  task,
  visible,
  onClose,
}) => {
  const { updateTask, deleteTask } = useTaskStore();

  /* ── Local state ────────────────────────────────────────────────── */
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>(3);
  const [taskType, setTaskType] = useState<TaskType>("normal");
  const [dueDate, setDueDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [travelMode, setTravelMode] = useState("plane");
  const [dirty, setDirty] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const titleRef = useRef<TextInput>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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

  /* ── Sync from task ─────────────────────────────────────────────── */
  useEffect(() => {
    if (task && visible) {
      setTitle(task.title);
      setNotes(task.notes ?? "");
      setPriority(task.priority);
      setTaskType(task.taskType ?? "normal");
      setDueDate(task.dueDate ?? "");
      setStartTime(task.dueTime ?? "");
      setFromLocation(task.fromLocation ?? "");
      setToLocation(task.toLocation ?? "");
      setTravelMode((task as any).travelMode || "plane");
      setNewSubtaskTitle("");
      setDirty(false);
      setShowDatePicker(false);
      setShowStartPicker(false);
      setShowEndPicker(false);
      setSubtasks(task.subtasks || []);

      // calculate end time from start + duration
      if (task.dueTime && task.estimatedMinutes) {
        const [h, m] = task.dueTime.split(":").map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          const endDate = new Date(0, 0, 0, h, m + task.estimatedMinutes);
          setEndTime(
            `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`,
          );
        } else setEndTime("");
      } else setEndTime("");
    }
  }, [task?.id, visible]);

  /* ── Save ───────────────────────────────────────────────────────── */
  const handleSave = () => {
    if (!task) return;
    let estimatedMinutes: number | undefined;
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
        let dur = eh * 60 + em - (sh * 60 + sm);
        if (dur < 0) dur += 24 * 60;
        estimatedMinutes = dur || undefined;
      }
    }
    updateTask(task.id, {
      title: title.trim() || task.title,
      notes,
      priority,
      taskType,
      dueDate: dueDate || undefined,
      dueTime: startTime || undefined,
      estimatedMinutes,
      fromLocation: fromLocation || undefined,
      toLocation: toLocation || undefined,
      travelMode: travelMode as any,
      subtasks,
    });
    setDirty(false);
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTask(task.id);
    onClose();
  };

  const canSave = title.trim().length > 0 && dirty;
  const selectedPriorityColor =
    priority === 1
      ? "#FF4D6D"
      : priority === 2
        ? "#F59E0B"
        : priority === 3
          ? "#4CAF50"
          : "#5BA4E5";
  const isScheduleActive = showDatePicker || showStartPicker || showEndPicker;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const sub: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks((prev) => [...prev, sub]);
    setNewSubtaskTitle("");
    setDirty(true);
  };

  const handleToggleSubtask = (subId: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s)),
    );
    setDirty(true);
  };

  const handleDeleteSubtask = (subId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subId));
    setDirty(true);
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

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <Modal
      visible={internalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (dirty) handleSave();
              else onClose();
            }}
          />
        </BlurView>
      </Animated.View>

      <View style={styles.sheetWrapper} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <BlurView
            intensity={28}
            tint="dark"
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod="dimezisBlurView"
          />
          {/* Handle */}
          <GestureDetector gesture={handlePan}>
            <View style={styles.handleArea}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>

          {/* ── Top Actions ─────────────────────────────────── */}
          <View style={styles.topActions}>
            <Pressable
              onPress={handleDelete}
              style={[styles.topActionBtn, { marginRight: "auto" }]}
            >
              <Trash2 size={20} color={Colors.priorityHigh} />
            </Pressable>

            <TouchableOpacity onPress={onClose} style={styles.topActionBtn}>
              <X size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.topActionBtn}
              onPress={handleSave}
              disabled={!canSave}
            >
              <Check
                size={22}
                color={
                  canSave ? selectedPriorityColor : "rgba(255,255,255,0.3)"
                }
                strokeWidth={3}
              />
            </TouchableOpacity>
          </View>

          {/* ── Header: Title ───────────────────────────────── */}
          <View style={styles.headerRow}>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                setDirty(true);
              }}
              placeholder="Task Title"
              placeholderTextColor="rgba(255,255,255,0.25)"
              returnKeyType="done"
              selectionColor="#5BA4E5"
            />
          </View>

          {/* ══════ SCROLLABLE BODY ══════ */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            {/* ══ TYPE | PRIORITY — swipe selectors ═══ */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.exoLabel}>TYPE</Text>
                <SwipeSelector
                  width={SELECTOR_WIDTH}
                  value={taskType}
                  activeColor={selectedPriorityColor}
                  onChange={(v) => {
                    setTaskType(v);
                    setDirty(true);
                  }}
                  options={[
                    {
                      value: "normal",
                      label: "Task",
                      color: selectedPriorityColor,
                      icon: (
                        <Check
                          size={14}
                          color={selectedPriorityColor}
                          strokeWidth={3}
                        />
                      ),
                    },
                    {
                      value: "project",
                      label: "Project",
                      color: selectedPriorityColor,
                      icon: (
                        <Briefcase size={14} color={selectedPriorityColor} />
                      ),
                    },
                    {
                      value: "toGo",
                      label: "To Go",
                      color: selectedPriorityColor,
                      icon: (
                        <Navigation size={14} color={selectedPriorityColor} />
                      ),
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.exoLabel}>PRIORITY</Text>
                <SwipeSelector
                  width={SELECTOR_WIDTH}
                  value={priority}
                  activeColor={selectedPriorityColor}
                  onChange={(v) => {
                    setPriority(v);
                    setDirty(true);
                  }}
                  options={[
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
                      color: Colors.textMuted,
                      icon: <ChevronsDown size={14} color={Colors.textMuted} />,
                    },
                  ]}
                />
              </View>
            </View>

            {/* ── Date Selector ─────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.exoLabel}>SCHEDULE</Text>
              <View
                style={[
                  styles.exoCard,
                  {
                    borderColor: isScheduleActive
                      ? selectedPriorityColor
                      : `${selectedPriorityColor}40`,
                  },
                ]}
              >
                <StripedBackground
                  color={selectedPriorityColor}
                  opacity={isScheduleActive ? 0.08 : 0.03}
                />

                {/* Date Row */}
                <Pressable
                  style={styles.exoRow}
                  onPress={() => {
                    setShowDatePicker(!showDatePicker);
                    setShowStartPicker(false);
                    setShowEndPicker(false);
                  }}
                >
                  <View
                    style={[
                      styles.exoIconBg,
                      { backgroundColor: `${selectedPriorityColor}15` },
                    ]}
                  >
                    <Calendar size={14} color={selectedPriorityColor} />
                  </View>
                  <Text style={styles.exoRowVal}>
                    {formatDisplayDate(dueDate)}
                  </Text>
                  {showDatePicker ? (
                    <ChevronUp size={18} color={selectedPriorityColor} />
                  ) : (
                    <ChevronDown size={18} color={Colors.textMuted} />
                  )}
                </Pressable>

                {showDatePicker && (
                  <View style={styles.pickerWrapper}>
                    <InlineDatePicker
                      dateIso={dueDate}
                      onChange={(iso) => {
                        setDueDate(iso);
                        setDirty(true);
                      }}
                    />
                  </View>
                )}

                <View style={styles.exoDivider} />

                {/* Time Row */}
                <View style={styles.exoRow}>
                  <Pressable
                    style={styles.exoTimeHalf}
                    onPress={() => {
                      setShowStartPicker(!showStartPicker);
                      setShowDatePicker(false);
                      setShowEndPicker(false);
                    }}
                  >
                    <Clock
                      size={16}
                      color={
                        showStartPicker
                          ? selectedPriorityColor
                          : Colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.exoRowVal,
                        showStartPicker && { color: selectedPriorityColor },
                      ]}
                    >
                      {startTime || "--:--"}
                    </Text>
                  </Pressable>
                  <View style={styles.exoDividerVertical} />
                  <Pressable
                    style={styles.exoTimeHalf}
                    onPress={() => {
                      setShowEndPicker(!showEndPicker);
                      setShowDatePicker(false);
                      setShowStartPicker(false);
                    }}
                  >
                    <Clock
                      size={16}
                      color={
                        showEndPicker ? selectedPriorityColor : Colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.exoRowVal,
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
                      onChange={(val) => {
                        if (showStartPicker) setStartTime(val);
                        if (showEndPicker) setEndTime(val);
                        setDirty(true);
                      }}
                    />
                  </View>
                )}
              </View>
            </View>

            {/* ── Subtask ────────────────────────────────────── */}
            <View style={styles.section}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={[styles.exoLabel, { marginBottom: 0, marginLeft: 0 }]}
                >
                  SUBTASKS
                </Text>
                {subtasks.length > 0 && (
                  <Text
                    style={{
                      color: selectedPriorityColor,
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    {subtasks.length}
                  </Text>
                )}
              </View>
              <View
                style={[
                  styles.exoCard,
                  { borderColor: `${selectedPriorityColor}40` },
                ]}
              >
                <StripedBackground
                  color={selectedPriorityColor}
                  opacity={0.03}
                />
                {/* Add Input */}
                <View style={styles.exoRow}>
                  <Plus size={18} color={Colors.textMuted} />
                  <TextInput
                    style={styles.exoInput}
                    placeholder="Add subtask..."
                    placeholderTextColor={Colors.textMuted}
                    value={newSubtaskTitle}
                    onChangeText={setNewSubtaskTitle}
                    onSubmitEditing={handleAddSubtask}
                  />
                  {newSubtaskTitle.trim().length > 0 && (
                    <Pressable
                      style={[
                        styles.exoCheckBtn,
                        { backgroundColor: selectedPriorityColor },
                      ]}
                      onPress={handleAddSubtask}
                    >
                      <Check size={14} color="#000" strokeWidth={3} />
                    </Pressable>
                  )}
                </View>

                {/* Subtask Items */}
                {subtasks.map((sub: Subtask, idx: number) => (
                  <Animated.View
                    key={sub.id}
                    entering={FadeInDown.delay(idx * 40)}
                    exiting={FadeOutUp}
                    layout={ReanimatedLayout.springify()}
                  >
                    <View style={styles.exoDivider} />
                    <View style={styles.exoRow}>
                      <GripVertical size={16} color="rgba(255,255,255,0.2)" />
                      <Pressable
                        style={[
                          styles.exoCheckbox,
                          sub.completed && {
                            backgroundColor: selectedPriorityColor,
                            borderColor: selectedPriorityColor,
                          },
                        ]}
                        onPress={() => handleToggleSubtask(sub.id)}
                      >
                        {sub.completed && (
                          <Check size={12} color="#000" strokeWidth={3} />
                        )}
                      </Pressable>
                      <Text
                        style={[
                          styles.exoRowVal,
                          sub.completed && {
                            color: Colors.textMuted,
                            textDecorationLine: "line-through",
                          },
                        ]}
                      >
                        {sub.title}
                      </Text>
                      <Pressable
                        onPress={() => handleDeleteSubtask(sub.id)}
                        hitSlop={8}
                      >
                        <Trash2 size={16} color="#FF4D6D" />
                      </Pressable>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* ── Notes ─────────────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.exoLabel}>NOTES</Text>
              <View
                style={[
                  styles.exoCard,
                  { borderColor: `${selectedPriorityColor}40` },
                ]}
              >
                <StripedBackground
                  color={selectedPriorityColor}
                  opacity={0.03}
                />
                <TextInput
                  style={[styles.exoInput, { padding: 16, minHeight: 90 }]}
                  value={notes}
                  onChangeText={(t) => {
                    setNotes(t);
                    setDirty(true);
                  }}
                  placeholder="Note of task..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* ── From / To (toGo type) ───────────────────── */}
            {taskType === "toGo" && (
              <Animated.View
                entering={FadeInDown.duration(250)}
                style={[
                  styles.locationBlock,
                  {
                    borderColor: `${selectedPriorityColor}40`,
                    overflow: "hidden",
                  },
                ]}
              >
                <StripedBackground
                  color={selectedPriorityColor}
                  opacity={0.03}
                />
                {/* Transport mode */}
                <View style={styles.transportRow}>
                  {[
                    { id: "plane", Icon: Plane },
                    { id: "train", Icon: Train },
                    { id: "bus", Icon: Bus },
                    { id: "car", Icon: Car },
                    { id: "bike", Icon: Bike },
                  ].map((mode) => (
                    <Pressable
                      key={mode.id}
                      style={[
                        styles.transportChip,
                        travelMode === mode.id && {
                          borderColor: selectedPriorityColor,
                          backgroundColor: `${selectedPriorityColor}15`,
                        },
                      ]}
                      onPress={() => {
                        setTravelMode(mode.id);
                        setDirty(true);
                      }}
                    >
                      <mode.Icon
                        size={16}
                        color={
                          travelMode === mode.id
                            ? selectedPriorityColor
                            : Colors.textSecondary
                        }
                      />
                    </Pressable>
                  ))}
                </View>
                <View style={styles.locationRow}>
                  <Navigation size={14} color={selectedPriorityColor} />
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
          </ScrollView>
          <Animated.View style={kbSpacerStyle} pointerEvents="none" />
        </Animated.View>
      </View>
    </Modal>
  );
};

/* ══════════════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  sheetWrapper: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.85,
    flexShrink: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(91,164,229,0.2)",
    backgroundColor: "rgba(10,15,22,0.65)",
    shadowColor: "#5BA4E5",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    overflow: "hidden",
  },
  handleArea: {
    width: "100%",
    paddingTop: 14,
    paddingBottom: 16,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  /* Top Actions */
  topActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  topActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  /* Header */
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  titleInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    padding: 0,
    letterSpacing: -0.5,
  },

  /* Body */
  body: { flex: 1 },
  bodyContent: { paddingBottom: 40 },

  /* Section */
  section: { marginBottom: 16 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(91,164,229,0.9)",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 10,
  },

  /* Row buttons (date / time) */
  rowBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  rowBtnActive: {
    borderColor: "#5BA4E5",
    backgroundColor: "rgba(91,164,229,0.06)",
  },
  rowBtnActiveGreen: {
    borderColor: "#4FE179",
    backgroundColor: "rgba(79,225,121,0.06)",
  },
  rowBtnText: { flex: 1 },
  rowBtnLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  rowBtnValue: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },

  pickerBox: {
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  timeRow: { flexDirection: "row", gap: 10 },

  /* Location (toGo) */
  locationBlock: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 12,
  },
  transportRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  transportChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  locationInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    padding: 0,
  },

  /* Subtask */
  exoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  exoCard: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  exoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  exoIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  exoRowVal: { flex: 1, fontSize: 15, color: "#fff", fontWeight: "600" },
  exoDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
  },
  exoDividerVertical: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 6,
  },
  exoTimeHalf: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  exoInput: { flex: 1, fontSize: 15, color: "#fff", padding: 0 },
  exoCheckBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  exoCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerWrapper: {
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingVertical: 8,
  },
});
