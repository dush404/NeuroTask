import { ChevronDown } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Radius, Spacing } from "../constants/theme";
import { TaskList } from "../types/task";

interface ProjectSelectorProps {
  selectedListId: string;
  lists: TaskList[];
  onSelect: (listId: string) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedListId,
  lists,
  onSelect,
}) => {
  const selectedList = lists.find((l) => l.id === selectedListId) || lists[0];

  return (
    <View style={styles.container}>
      <Pressable style={styles.trigger}>
        <View style={[styles.dot, { backgroundColor: selectedList.color }]} />
        <Text style={styles.label}>{selectedList.name}</Text>
        <ChevronDown size={16} color={Colors.textMuted} />
      </Pressable>
      {/* TODO: Implement bottom sheet or dropdown for selection */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
});
