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
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-5px)" },
          "40%": { transform: "translateX(5px)" },
          "60%": { transform: "translateX(-3px)" },
          "80%": { transform: "translateX(3px)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        snow: {
          "0%": { transform: "translateY(-6vh) translateX(0)", opacity: "0" },
          "10%": { opacity: "0.9" },
          "100%": { transform: "translateY(106vh) translateX(40px)", opacity: "0.7" },
        },
        rays: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        melt: {
          "0%": { opacity: "1", transform: "scale(1)", filter: "blur(0)" },
          "100%": { opacity: "0", transform: "scale(1.06) translateY(6px)", filter: "blur(3px)" },
        },
        coin: {
          "0%": { transform: "translateY(-12vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(112vh) rotate(900deg)", opacity: "1" },
        },
        ripple: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(6px)" },
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
        shake: "shake 0.4s ease-in-out",
        rise: "rise 0.35s ease-out both",
        snow: "snow 9s linear infinite",
        rays: "rays 24s linear infinite",
        glow: "glow 2.2s ease-in-out infinite",
        melt: "melt 1.1s ease-out forwards",
        coin: "coin 4s linear infinite",
        ripple: "ripple 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
