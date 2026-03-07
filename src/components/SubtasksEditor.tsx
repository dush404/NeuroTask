import { Check, GripVertical, Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
    FadeInDown,
    FadeOutUp,
    Layout,
} from "react-native-reanimated";
import { Colors, Radius, Spacing } from "../constants/theme";
import { Subtask } from "../types/task";

interface SubtasksEditorProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
}

export const SubtasksEditor: React.FC<SubtasksEditorProps> = ({
  subtasks,
  onChange,
}) => {
  const [newTitle, setNewTitle] = useState("");

  const addSubtask = () => {
    if (!newTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title: newTitle.trim(),
      completed: false,
    };
    onChange([...subtasks, newSub]);
    setNewTitle("");
  };

  const toggleSubtask = (id: string) => {
    onChange(
      subtasks.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s,
      ),
    );
  };

  const removeSubtask = (id: string) => {
    onChange(subtasks.filter((s) => s.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Subtasks</Text>
        <Text style={styles.count}>{subtasks.length}</Text>
      </View>

      <View style={styles.list}>
        {subtasks.map((sub, index) => (
          <Animated.View
            key={sub.id}
            entering={FadeInDown.delay(index * 50)}
            exiting={FadeOutUp}
            layout={Layout.springify()}
            style={styles.subtaskRow}
          >
            <GripVertical size={16} color={Colors.textMuted} />
            <Pressable
              style={[
                styles.check,
                sub.completed && {
                  backgroundColor: Colors.accent,
                  borderColor: Colors.accent,
                },
              ]}
              onPress={() => toggleSubtask(sub.id)}
            >
              {sub.completed && (
                <Check size={12} color="#000" strokeWidth={3} />
              )}
            </Pressable>
            <Text
              style={[styles.subtaskTitle, sub.completed && styles.subtaskDone]}
            >
              {sub.title}
            </Text>
            <Pressable onPress={() => removeSubtask(sub.id)}>
              <Trash2 size={16} color={Colors.error} />
            </Pressable>
          </Animated.View>
        ))}
      </View>

      <View style={styles.inputRow}>
        <Plus size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="Add subtask..."
          placeholderTextColor={Colors.textMuted}
          onSubmitEditing={addSubtask}
        />
        {newTitle.trim().length > 0 && (
          <Pressable onPress={addSubtask} style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  count: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: "600",
  },
  list: {
    gap: 8,
    marginBottom: 12,
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  check: {
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  addBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
  },
});
