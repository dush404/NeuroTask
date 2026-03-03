import { StyleSheet } from "react-native";
import { Colors, Radius, Spacing, Typography } from "../constants/theme";

export const habitsStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  bgGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  content: {
    paddingHorizontal: Spacing.md,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  statIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statNum: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  // Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: "600",
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  sectionCount: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
    fontWeight: "500",
  },

  // Habit Card
  habitCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    backgroundColor: "#1D2024",
    marginBottom: 8,
    overflow: "hidden",
    flexDirection: "row",
  },
  habitAccentBar: {
    width: 3.5,
  },
  habitBody: {
    flex: 1,
    padding: 12,
  },
  habitTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  habitIcon: {
    fontSize: 22,
  },
  habitInfo: {
    flex: 1,
    gap: 4,
  },
  habitName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E2E4E9",
    letterSpacing: 0.2,
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  xpTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 2,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    borderRadius: 2,
  },
  xpText: {
    fontSize: 9,
    color: "rgba(255,255,255,0.35)",
    fontWeight: "500",
    width: 38,
    textAlign: "right",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,107,53,0.1)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  streakNum: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF6B35",
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  timerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  timerBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Heatmap expanded
  heatmapContainer: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    padding: 12,
    marginBottom: 8,
    marginTop: -4,
  },
  heatmapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  heatmapTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  heatmapStreak: {
    fontSize: 10,
    color: Colors.textMuted,
  },

  // Empty State
  emptyCard: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 40,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: {
    fontSize: Typography.fontSizeLG,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // Preset Grid
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetCard: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: "#1D2024",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    overflow: "hidden",
  },
  presetIcon: { fontSize: 28 },
  presetName: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  presetAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    shadowColor: "#5BA4E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalSheet: {
    backgroundColor: "#111820",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: Typography.fontSizeLG,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  modalLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: Radius.lg,
    padding: 14,
    fontSize: Typography.fontSizeMD,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  colorRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: "#fff",
  },
  saveBtn: {
    backgroundColor: "#5BA4E5",
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnText: {
    fontSize: Typography.fontSizeMD,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
