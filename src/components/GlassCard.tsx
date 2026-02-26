// NeuroTask — GlassCard (Exoplan Light Dark Surface Style)
// Now just a dark surface card. No blur needed — Exoplan uses flat dark panels.

import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors, Radius } from "../constants/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accentBorder?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  accentBorder = false,
}) => {
  return (
    <View style={[styles.card, accentBorder && styles.accentBorder, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  accentBorder: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
});
