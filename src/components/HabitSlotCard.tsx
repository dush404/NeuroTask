// NeuroTask — HabitSlotCard
// Displays a time-blocked habit session (slot) with start timer button.

import { useRouter } from "expo-router";
import { Play, Trash2 } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Radius } from "../constants/theme";
import { useFocusStore } from "../store/useFocusStore";
import { useHabitStore } from "../store/useHabitStore";
import { HabitSlot } from "../types/task";

interface Props {
  slot: HabitSlot;
}

function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function endTime(startHHMM: string, durationMins: number) {
  const [h, m] = startHHMM.split(":").map(Number);
  const totalMins = h * 60 + m + durationMins;
  const eh = Math.floor(totalMins / 60) % 24;
  const em = totalMins % 60;
  return formatTime(
    `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`,
  );
}

export const HabitSlotCard: React.FC<Props> = ({ slot }) => {
  const { removeSlot } = useHabitStore();
  const { startCustomTimer } = useFocusStore();
  const router = useRouter();

  return (
    <View style={[styles.card, { borderColor: `${slot.color}25` }]}>
      {/* Left color stripe */}
      <View style={[styles.stripe, { backgroundColor: slot.color }]} />

      {/* Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: `${slot.color}18` }]}>
        <Text style={styles.icon}>{slot.icon}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name}>{slot.name}</Text>
        <Text style={styles.time}>
          {formatTime(slot.startTime)} →{" "}
          {endTime(slot.startTime, slot.durationMinutes)}
          {"  ·  "}
          {slot.durationMinutes} min
        </Text>
      </View>

      {/* Start timer */}
      <Pressable
        style={[
          styles.playBtn,
          {
            backgroundColor: `${slot.color}20`,
            borderColor: `${slot.color}50`,
          },
        ]}
        onPress={() => {
          startCustomTimer(slot.durationMinutes);
          router.navigate("/(tabs)/focus");
        }}
      >
        <Play size={13} color={slot.color} fill={slot.color} />
      </Pressable>

      {/* Delete */}
      <Pressable style={styles.deleteBtn} onPress={() => removeSlot(slot.id)}>
        <Trash2 size={13} color="rgba(255,255,255,0.2)" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1A1F24",
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 8,
    overflow: "hidden",
    paddingRight: 8,
    paddingVertical: 10,
  },
  stripe: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
    marginLeft: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  time: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    padding: 6,
  },
});
