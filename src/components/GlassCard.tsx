// NeuroTask — GlassCard (Exoplan Light Dark Surface Style)
// Now just a dark surface card. No blur needed — Exoplan uses flat dark panels.

import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors, Radius } from "../constants/theme";
import { StripedBackground } from "./StripedBackground";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accentBorder?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
  striped?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  accentBorder = false,
  gradientColors,
  striped = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        accentBorder && styles.accentBorder,
        style,
        gradientColors && { backgroundColor: "transparent" },
      ]}
    >
      {/* Optional Gradient Background */}
      {gradientColors && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <LinearGradient
            colors={gradientColors}
            style={{ flex: 1 }}
            start={[0, 0]}
            end={[1, 1]}
          />
        </View>
      )}

      {/* Optional Striped Texture */}
      {striped && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <StripedBackground opacity={0.03} />
        </View>
      )}

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
    overflow: "hidden",
  },
  accentBorder: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
});
