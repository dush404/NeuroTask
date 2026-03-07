import { Hash, Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Colors, Radius, Spacing } from "../constants/theme";

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onChange,
}) => {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      onChange([...selectedTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    onChange(selectedTags.filter((t) => t !== tag));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagList}
      >
        {selectedTags.map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Hash size={12} color={Colors.accent} />
            <Text style={styles.tagText}>{tag}</Text>
            <Pressable onPress={() => removeTag(tag)}>
              <X size={14} color={Colors.textMuted} />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <Plus size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          value={newTag}
          onChangeText={setNewTag}
          placeholder="Add tag..."
          placeholderTextColor={Colors.textMuted}
          onSubmitEditing={addTag}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  tagList: {
    flexDirection: "row",
    marginBottom: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tagText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: "500",
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
});
