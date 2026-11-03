import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          '"Baloo 2"',
          '"Trebuchet MS"',
          "ui-rounded",
          '"Segoe UI"',
          "system-ui",
          "sans-serif",
        ],
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateX(-120px)" },
          "100%": { transform: "translateX(160px)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.6)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.7) translateY(20px)" },
          "70%": { opacity: "1", transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        confetti: {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(110vh) rotate(720deg)", opacity: "0.9" },
        },
        hint: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(253,224,71,0.9)" },
          "50%": { boxShadow: "0 0 0 8px rgba(253,224,71,0)" },
        },
        nudge: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        drift: "drift 50s ease-in-out infinite alternate",
        "drift-slow": "drift 80s ease-in-out infinite alternate-reverse",
        floaty: "floaty 3s ease-in-out infinite",
        sparkle: "sparkle 1.8s ease-in-out infinite",
        pop: "pop 0.5s ease-out both",
        confetti: "confetti 3.5s linear infinite",
        hint: "hint 1.2s ease-out infinite",
        nudge: "nudge 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
