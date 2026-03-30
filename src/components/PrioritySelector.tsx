import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors, Radius, Spacing } from "../constants/theme";
import { Priority } from "../types/task";

interface PrioritySelectorProps {
  selected: Priority;
  onSelect: (priority: Priority) => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 1, label: "Urgent", color: Colors.priorityHigh },
  { value: 2, label: "High", color: Colors.priorityMedium },
  { value: 3, label: "Medium", color: Colors.priorityLow },
  { value: 4, label: "Low", color: Colors.textMuted },
];

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {PRIORITY_OPTIONS.map((item) => {
        const isSelected = selected === item.value;
        return (
          <Pressable
            key={item.value}
            onPress={() => onSelect(item.value)}
            style={[
              styles.pill,
              isSelected && {
                borderColor: item.color,
                backgroundColor: `${item.color}15`,
                transform: [{ scale: 1.05 }],
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text
              style={[
                styles.label,
                { color: isSelected ? item.color : Colors.textSecondary },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
