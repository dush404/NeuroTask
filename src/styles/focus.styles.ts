import { StyleSheet } from "react-native";
import { Typography } from "../constants/theme";

export const focusStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000000" },
  content: { paddingHorizontal: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: Typography.fontSizeXXL,
    fontWeight: Typography.fontWeightBold,
    color: "#fff",
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#1A221F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2B3530",
  },

  // Apple-like Widget Wrapper
  widgetWrapper: {
    marginBottom: 24,
  },

  // Sleek Settings Panel matched to Exoplan Style
  settingsCard: {
    marginBottom: 20,
    backgroundColor: "#111614",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#2B3530",
  },
  settingsTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  settingItem: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    fontWeight: "700",
  },
  settingInputWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 8,
    height: 44,
  },
  settingInput: {
    color: "#4FE179",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  settingUnit: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    marginLeft: 4,
    fontWeight: "600",
  },

  // Sessions History Title Row
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
  },

  // History Item Line Cards Mimicking Homepage TimelineBlock
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A221F",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#2B3530",
    overflow: "hidden", // for the glow effect
  },
  sessionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  sessionLabel: {
    flex: 1,
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  sessionRight: {
    alignItems: "flex-end",
  },
  sessionDuration: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
  },

  // Empty State - Exoplan matched
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#111614",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#2B3530",
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 12,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
    fontWeight: "500",
  },
});
