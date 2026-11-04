"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, ListOrdered, Play, X } from "lucide-react";
import { LEVELS } from "@/data/levels";
import { useProgress } from "@/lib/game/use-progress";
import Logo from "./Logo";

export default function MainMenu() {
  const { progress, hydrated } = useProgress();
  const [showHelp, setShowHelp] = useState(false);

  const completed = Object.keys(progress.best).length;
  const playLevel = Math.min(progress.highestUnlocked, LEVELS.length);
  const pct = (completed / LEVELS.length) * 100;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-8 px-4 py-10">
      <Logo />

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link href={`/game?level=${playLevel}`} className="btn-primary !py-4 !text-2xl">
          <Play size={26} className="fill-current" />
          {completed > 0 ? "Continue" : "Play"}
        </Link>
        <Link href="/levels" className="btn-green">
          <ListOrdered size={22} /> Level Selection
        </Link>
        <button type="button" className="btn-wood" onClick={() => setShowHelp(true)}>
          <HelpCircle size={22} /> How to Play
        </button>
      </div>

      <div className="panel w-full max-w-xs px-5 py-3" aria-live="polite">
        <div className="flex items-baseline justify-between font-display font-bold">
          <span>Progress</span>
          <span>
            {hydrated ? completed : 0} / {LEVELS.length} levels
          </span>
        </div>
        <div
          className="mt-2 h-4 overflow-hidden rounded-full border-2 border-[#6b4220] bg-white/70"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={LEVELS.length}
          aria-valuenow={hydrated ? completed : 0}
          aria-label="Levels completed"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-400 to-yellow-400 transition-all"
            style={{ width: `${hydrated ? pct : 0}%` }}
          />
        </div>
      </div>

      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} />}
    </main>
  );
}

function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      onClick={onClose}
    >
      <div
        className="panel relative max-h-[90vh] w-full max-w-md animate-pop overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1 text-[#6b4220] hover:bg-black/10"
        >
          <X size={26} />
        </button>
        <h2 id="help-title" className="font-display text-3xl font-extrabold text-amber-900">
          How to Play
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 font-semibold leading-snug">
          <li>Slide the wooden logs to open a path for the golden Pot of Gold.</li>
          <li>Logs only slide along their length – horizontal logs go left/right, vertical logs go up/down.</li>
          <li>Drag a log with your mouse or finger. Or select it and use the arrow keys.</li>
          <li>Push the Pot of Gold out of the exit on the right to win.</li>
          <li>Fewer moves is better! Use Undo, Reset, or Hint if you get stuck.</li>
          <li>Golden Trails (levels 6–10) add switches, keys, frozen logs and move limits. A short tutorial introduces each one.</li>
        </ul>
        <button type="button" className="btn-green mt-5 w-full" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
}
