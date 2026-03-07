import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Radius, Spacing } from "../constants/theme";
import { Priority } from "../types/task";

interface PrioritySelectorProps {
  selected: Priority;
  onSelect: (priority: Priority) => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 1, label: "High", color: Colors.priorityHigh },
  { value: 2, label: "Medium", color: Colors.priorityMedium },
  { value: 3, label: "Low", color: Colors.priorityLow },
  { value: 4, label: "None", color: Colors.textMuted },
];

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {PRIORITY_OPTIONS.map((opt) => {
        const isSelected = selected === opt.value;

        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={[
              styles.option,
              isSelected && {
                borderColor: opt.color,
                backgroundColor: `${opt.color}15`,
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: opt.color }]} />
            <Text style={[styles.label, isSelected && { color: opt.color }]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
});
