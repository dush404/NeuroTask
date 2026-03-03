import { StyleSheet } from "react-native";
import { Colors, Spacing, Typography } from "../constants/theme";

export const statsStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000000" },
  content: { padding: Spacing.md, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: 12,
  },
  title: {
    fontSize: Typography.fontSizeXXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  scoreCard: { marginBottom: Spacing.md, backgroundColor: "transparent" },
  scoreSplit: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  scoreDetails: { flex: 1, gap: 8 },
  scoreTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  scoreDetail: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary },
  allTimeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  allTimeCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    backgroundColor: "transparent",
  },
  allTimeNum: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  allTimeLabel: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary,
  },
  chartCard: {
    marginBottom: Spacing.md,
    gap: 8,
    backgroundColor: "transparent",
  },
  chartTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  chartSub: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  habitCard: { gap: 12, backgroundColor: "transparent" },
  habitRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  habitIcon: { fontSize: 16 },
  habitName: {
    flex: 1,
    fontSize: Typography.fontSizeSM,
    color: Colors.textPrimary,
  },
  habitTrack: {
    width: 80,
    height: 6,
    backgroundColor: Colors.glass,
    borderRadius: 3,
    overflow: "hidden",
  },
  habitFill: { height: "100%", borderRadius: 3 },
  habitPct: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    width: 32,
    textAlign: "right",
  },
});
