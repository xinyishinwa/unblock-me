import type { ThemeId } from "@/lib/game/special-types";

export interface ThemeStyle {
  label: string;
  /** Board tile colours: [even, odd, exit-row even, exit-row odd]. */
  tiles: [string, string, string, string];
  /** CSS gradient used as the level-card thumbnail. */
  swatch: string;
  /** Confetti colours for the victory screen. */
  confetti: string[];
  /** Page tint behind the HUD text (kept readable on every backdrop). */
  accent: string;
}

export const CLASSIC_TILES: ThemeStyle["tiles"] = ["#8fd05a", "#83c750", "#e0b676", "#d9ad6b"];

export const THEMES: Record<ThemeId, ThemeStyle> = {
  river: {
    label: "Peaceful River",
    tiles: ["#93d65f", "#86cc54", "#e2bb7c", "#dab070"],
    swatch: "linear-gradient(135deg,#7fd0f2 0%,#4aa8e0 55%,#93d65f 100%)",
    confetti: ["#4dabf7", "#74c0fc", "#ffd21f", "#4ecb71", "#fff"],
    accent: "#2f7fb8",
  },
  "treasure-gate": {
    label: "Old Treasure Gate",
    tiles: ["#9fc86a", "#92bd5e", "#d9c08a", "#cfb47a"],
    swatch: "linear-gradient(135deg,#f6d27a 0%,#c99a52 55%,#7b8f5a 100%)",
    confetti: ["#ffd21f", "#ffb703", "#e9c46a", "#fff3b0", "#4ecb71"],
    accent: "#8a5a1a",
  },
  enchanted: {
    label: "Enchanted Forest",
    tiles: ["#5f4a99", "#6b55a8", "#b08ad8", "#a57fd0"],
    swatch: "linear-gradient(135deg,#2a1b5e 0%,#6a3fb0 55%,#e0b64a 100%)",
    confetti: ["#c77dff", "#ffd21f", "#9d4edd", "#e0aaff", "#fff3b0"],
    accent: "#4b2a8a",
  },
  frozen: {
    label: "Frozen Forest",
    tiles: ["#d9f0fb", "#cbe8f7", "#a9dcf3", "#9ad3ee"],
    swatch: "linear-gradient(135deg,#eaf8ff 0%,#9ad3ee 55%,#5aa6d6 100%)",
    confetti: ["#ffffff", "#a5d8ff", "#74c0fc", "#ffd21f", "#d0ebff"],
    accent: "#2a6e9c",
  },
  cagayan: {
    label: "Hidden Cagayan Treasure",
    tiles: ["#7fd06a", "#72c45e", "#f0cf7a", "#e8c46c"],
    swatch: "linear-gradient(135deg,#ffe97a 0%,#f2a93b 50%,#2f8f5a 100%)",
    confetti: ["#ffd21f", "#ffb703", "#ff6b6b", "#4ecb71", "#4dabf7", "#cc5de8"],
    accent: "#b7791f",
  },
};
