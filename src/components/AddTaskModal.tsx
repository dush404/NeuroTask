import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import {
    Calendar,
    Clock,
    FileText,
    Flame,
    Layout as LayoutIcon,
    Sparkles,
    Tag,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
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
import Animated, {
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
} from "react-native-reanimated";
import { Colors, Radius } from "../constants/theme";
import { useTaskStore } from "../store/useTaskStore";
import { EnergyType, Priority, Subtask, Task } from "../types/task";
import { PrioritySelector } from "./PrioritySelector";
import { ProjectSelector } from "./ProjectSelector";
import { SubtasksEditor } from "./SubtasksEditor";
import { TagSelector } from "./TagSelector";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: string;
  initialTime?: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  initialDate,
  initialTime,
}) => {
  const { addTask, lists } = useTaskStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(3);
  const [dueDate, setDueDate] = useState(
    initialDate || new Date().toISOString().split("T")[0],
  );
  const [dueTime, setDueTime] = useState(initialTime || "12:00");
  const [listId, setListId] = useState("inbox");
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [energyType, setEnergyType] = useState<EnergyType>("light");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      // Reset or init state
      setTitle("");
      setDescription("");
      setPriority(3);
      setDueDate(initialDate || new Date().toISOString().split("T")[0]);
      setDueTime(initialTime || "12:00");
      setListId("inbox");
      setTags([]);
      setSubtasks([]);
      setEnergyType("light");
      setEstimatedMinutes(30);
    }
  }, [visible, initialDate, initialTime]);

  const analyzeTaskWithAI = async (taskInput: string) => {
    if (!taskInput.trim()) return;

    // Placeholder for AI logic
    // In a real implementation, you would call your AI service here
    console.log("Analyzing task with AI:", taskInput);

    // Example of what it might return:
    // const results = await aiService.breakdown(taskInput);
    // setSubtasks(results.subtasks);
    // setEstimatedMinutes(results.duration);
    // setPriority(results.priority);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: "todo",
      listId,
      tags,
      dueDate,
      dueTime,
      subtasks,
      energyType,
      estimatedMinutes,
      createdAt: new Date().toISOString(),
      comments: [],
      sortOrder: 0,
    };

    addTask(newTask);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.backdrop}
        >
          <Pressable style={styles.flex1} onPress={onClose}>
            <BlurView
              intensity={30}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          </Pressable>
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Animated.View
            entering={SlideInDown.springify().damping(20).stiffness(90)}
            exiting={SlideOutDown.springify().damping(20).stiffness(90)}
            style={styles.sheet}
          >
            <LinearGradient
              colors={["rgba(30,41,59,0.98)", "rgba(15,23,42,1)"]}
              style={styles.gradient}
            >
              <View style={styles.handle} />

              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* 1️⃣ Task Title */}
                <View style={styles.section}>
                  <TextInput
                    autoFocus
                    style={styles.titleInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="What needs to be done?"
                    placeholderTextColor={Colors.textMuted}
                    returnKeyType="next"
                  />
                  <View style={styles.charCounterRow}>
                    <Text style={styles.charCounter}>{title.length} / 100</Text>
                  </View>
                </View>

                {/* 2️⃣ Description */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <FileText size={14} color={Colors.textMuted} />
                    <Text style={styles.sectionLabel}>Description</Text>
                  </View>
                  <TextInput
                    style={styles.descInput}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add notes or description..."
                    placeholderTextColor={Colors.textMuted}
                    multiline
                  />
                </View>

                {/* 3️⃣ Priority */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Flame size={14} color={Colors.textMuted} />
                    <Text style={styles.sectionLabel}>Priority</Text>
                  </View>
                  <PrioritySelector
                    selected={priority}
                    onSelect={setPriority}
                  />
                </View>

                <View style={styles.row}>
                  {/* 4️⃣ Date & Time */}
                  <View style={[styles.section, styles.flex1]}>
                    <View style={styles.sectionHeader}>
                      <Calendar size={14} color={Colors.textMuted} />
                      <Text style={styles.sectionLabel}>Due Date</Text>
                    </View>
                    <TouchableOpacity style={styles.selectorTrig}>
                      <Text style={styles.selectorText}>{dueDate}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.section, styles.flex1]}>
                    <View style={styles.sectionHeader}>
                      <Clock size={14} color={Colors.textMuted} />
                      <Text style={styles.sectionLabel}>Time</Text>
                    </View>
                    <TouchableOpacity style={styles.selectorTrig}>
                      <Text style={styles.selectorText}>{dueTime}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 5️⃣ Project/List */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LayoutIcon size={14} color={Colors.textMuted} />
                    <Text style={styles.sectionLabel}>Project</Text>
                  </View>
                  <ProjectSelector
                    lists={lists}
                    selectedListId={listId}
                    onSelect={setListId}
                  />
                </View>

                {/* 6️⃣ Tags */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Tag size={14} color={Colors.textMuted} />
                    <Text style={styles.sectionLabel}>Tags</Text>
                  </View>
                  <TagSelector selectedTags={tags} onChange={setTags} />
                </View>

                {/* 7️⃣ Subtasks */}
                <View style={styles.section}>
                  <SubtasksEditor subtasks={subtasks} onChange={setSubtasks} />
                </View>

                {/* 8️⃣ Energy Type */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>Energy Level</Text>
                  </View>
                  <View style={styles.chipRow}>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        energyType === "deep" && styles.chipActive,
                      ]}
                      onPress={() => setEnergyType("deep")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          energyType === "deep" && styles.chipTextActive,
                        ]}
                      >
                        🧠 Deep Work
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        energyType === "light" && styles.chipActive,
                      ]}
                      onPress={() => setEnergyType("light")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          energyType === "light" && styles.chipTextActive,
                        ]}
                      >
                        ⚡ Light Task
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 9️⃣ Duration */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>Estimate Duration</Text>
                  </View>
                  <View style={styles.chipRow}>
                    {[30, 60, 90].map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          styles.chip,
                          estimatedMinutes === m && styles.chipActive,
                        ]}
                        onPress={() => setEstimatedMinutes(m)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            estimatedMinutes === m && styles.chipTextActive,
                          ]}
                        >
                          {m}m
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* AI ready placeholder */}
                <TouchableOpacity
                  style={styles.aiBtn}
                  onPress={() => analyzeTaskWithAI(title)}
                >
                  <Sparkles size={16} color="#E9D5FF" />
                  <Text style={styles.aiBtnText}>✨ Smart Breakdown (AI)</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
              </ScrollView>

              {/* SAVE BUTTON */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    !title.trim() && styles.saveBtnDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={!title.trim()}
                >
                  <LinearGradient
                    colors={
                      title.trim() ? ["#A855F7", "#6366F1"] : ["#333", "#222"]
                    }
                    start={[0, 0]}
                    end={[1, 1]}
                    style={styles.saveBtnGradient}
                  >
                    <Text style={styles.saveBtnText}>Add Task</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  flex1: {
    flex: 1,
  },
  keyboardView: {
    width: "100%",
  },
  sheet: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  gradient: {
    flex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  titleInput: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
    padding: 0,
    marginBottom: 4,
  },
  charCounterRow: {
    alignItems: "flex-end",
  },
  charCounter: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  descInput: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: Radius.md,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlignVertical: "top",
    minHeight: 60,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  selectorTrig: {
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  selectorText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipActive: {
    backgroundColor: "rgba(168,85,247,0.15)",
    borderColor: Colors.accent,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  chipTextActive: {
    color: Colors.accent,
  },
  aiBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(168,85,247,0.1)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.2)",
    paddingVertical: 14,
    borderRadius: Radius.md,
    marginTop: 12,
  },
  aiBtnText: {
    color: "#E9D5FF",
    fontWeight: "700",
    fontSize: 14,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    backgroundColor: "rgba(15,23,42,0.8)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  saveBtn: {
    borderRadius: Radius.xl,
    overflow: "hidden",
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
