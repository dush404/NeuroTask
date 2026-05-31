import { Platform, StyleSheet } from "react-native";

export const indexStyles = StyleSheet.create({
  // Root container defining background application theme color
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },

  // Overlapping container holding user interactions (menus, indicators)
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    zIndex: 10,
    position: "relative", // Ensures dropdowns and toggles remain clickable
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Menu Btn
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2B322F",
    alignItems: "center",
    justifyContent: "center",
  },

  // Week Strip
  weekStrip: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-evenly",
    marginHorizontal: 12,
  },
  dayBox: {
    alignItems: "center",
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: -4,
    right: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F03A47",
  },
  dayLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
    marginBottom: 4,
  },
  dayLabelActive: {
    color: "#fff",
  },
  dayNum: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
  },
  dayNumActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  activeUnderline: {
    marginTop: 4,
    width: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  // Score Ring
  scoreRingWrapper: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },

  // Timeline
  timelineScroll: {
    flex: 1,
  },
  timelineContent: {
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 100 : 80,
    right: 28,
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  fabContainer: {
    position: "absolute",
    bottom: 96,
    right: 30,
    alignItems: "center",
  },
  fabAI: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  fabAIGlow: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(168,85,247,0.25)",
    top: -3,
    left: -3,
  },
  fabAIInner: {
    width: "100%",
    height: "100%",
    borderRadius: 23,
    backgroundColor: "#2D1B3E",
    borderWidth: 1.5,
    borderColor: "#A855F7",
    alignItems: "center",
    justifyContent: "center",
  },
  fabMain: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  fabMainGlow: {
    position: "absolute",
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(85,182,106,0.3)",
    top: -4,
    left: -4,
  },
  fabMainInner: {
    width: "100%",
    height: "100%",
    borderRadius: 27,
    backgroundColor: "#1A221F",
    borderWidth: 1.5,
    borderColor: "#4FE179",
    alignItems: "center",
    justifyContent: "center",
  },
});
