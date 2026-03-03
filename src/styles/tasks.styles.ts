import { StyleSheet } from "react-native";
import { Colors, Radius, Spacing, Typography } from "../constants/theme";

export const tasksStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  bgGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 250,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: 12,
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
  completionContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Search
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  searchBarFocused: {
    borderColor: "rgba(91,164,229,0.3)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSizeMD,
    color: Colors.textPrimary,
    padding: 0,
  },

  // Category/Sub-category chips
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    gap: 10,
  },
  chipContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 6,
    paddingVertical: 6,
    overflow: "hidden",
  },
  chipScrollInner: {
    gap: 6,
    paddingHorizontal: 4,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  chipAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  subChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  subChipActive: {
    backgroundColor: "rgba(91,164,229,0.15)",
  },
  subChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textMuted,
  },
  subChipTextActive: {
    color: "#5BA4E5",
    fontWeight: "600",
  },

  // Task List
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 8,
    paddingBottom: 100,
  },

  // Task Card (TimelineBlock style)
  taskCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 8,
    overflow: "hidden",
    flexDirection: "row",
  },
  taskCardDone: {
    opacity: 0.5,
  },
  priorityBar: {
    width: 3.5,
  },
  taskCardBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  taskCardContent: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 13.5,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  taskTitleDone: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
  },
  priorityChip: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(91,164,229,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(91,164,229,0.1)",
  },
  emptyTitle: {
    fontSize: Typography.fontSizeLG,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  emptySubtext: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textSecondary,
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
  modalTitle: {
    fontSize: Typography.fontSizeLG,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 16,
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
  quickDateRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickDateChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
  },
  quickDateChipActive: {
    backgroundColor: "rgba(91,164,229,0.12)",
    borderColor: "rgba(91,164,229,0.35)",
  },
  quickDateText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  quickDateTextActive: {
    color: "#5BA4E5",
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  priorityBtnText: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textSecondary,
    fontWeight: "600",
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
