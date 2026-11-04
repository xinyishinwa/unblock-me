"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { TutorialInfo } from "@/lib/game/special-types";

interface Props {
  tutorial: TutorialInfo;
  badge: string;
  onClose: () => void;
}

/** Short step-by-step popup shown when a mechanic level is entered. */
export default function TutorialModal({ tutorial, badge, onClose }: Props) {
  const [step, setStep] = useState(0);
  const last = step === tutorial.steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="panel relative w-full max-w-sm animate-pop p-6 text-center">
        <button
          type="button"
          onClick={onClose}
          aria-label="Skip tutorial"
          className="absolute right-3 top-3 rounded-full p-1 text-[#6b4220] hover:bg-black/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
        >
          <X size={24} />
        </button>
        <p className="mx-auto inline-block rounded-full bg-[#6b4220] px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-amber-50">
          New: {badge}
        </p>
        <h2 id="tutorial-title" className="mt-2 font-display text-2xl font-extrabold text-amber-900">
          {tutorial.title}
        </h2>
        <p key={step} className="mt-3 min-h-[4.5rem] animate-rise text-base font-semibold leading-snug" aria-live="polite">
          {tutorial.steps[step]}
        </p>
        <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
          {tutorial.steps.map((_, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-full ${i === step ? "bg-amber-600" : "bg-amber-300"}`} />
          ))}
        </div>
        <button
          type="button"
          className="btn-green mt-5 w-full"
          onClick={() => (last ? onClose() : setStep(step + 1))}
          autoFocus
        >
          {last ? "Let's play!" : "Next"}
        </button>
      </div>
    </div>
  );
}
