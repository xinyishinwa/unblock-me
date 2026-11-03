"use client";

import Link from "next/link";
import { Check, Lock, Star } from "lucide-react";
import type { Difficulty, LevelConfig } from "@/data/levels";

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  Easy: "bg-green-500 text-white",
  Medium: "bg-orange-400 text-orange-950",
  Hard: "bg-red-500 text-white",
};

interface Props {
  level: LevelConfig;
  locked: boolean;
  bestMoves?: number;
}

export default function LevelCard({ level, locked, bestMoves }: Props) {
  const completed = bestMoves !== undefined;
  const body = (
    <>
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 font-display text-3xl font-extrabold ${
          locked
            ? "border-stone-500 bg-stone-300 text-stone-500"
            : "border-amber-700 bg-amber-300 text-amber-950"
        }`}
      >
        {locked ? <Lock size={24} /> : level.id}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-xs font-bold uppercase tracking-wider text-[#7a5430]">Level {level.id}</p>
        <h3 className="truncate font-display text-xl font-extrabold leading-tight">{level.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${DIFFICULTY_STYLE[level.difficulty]}`}>
            {level.difficulty}
          </span>
          {locked && <span className="text-xs font-semibold text-stone-600">Complete level {level.id - 1} to unlock</span>}
          {completed && (
            <span className="flex items-center gap-1 text-xs font-bold text-green-800">
              <Check size={14} /> Best: {bestMoves} moves
            </span>
          )}
        </div>
      </div>
      {completed && <Star className="shrink-0 fill-yellow-400 text-yellow-600" size={28} />}
    </>
  );

  const base = "panel flex w-full items-center gap-4 p-4 transition";

  if (locked) {
    return (
      <div aria-disabled="true" className={`${base} cursor-not-allowed opacity-60 grayscale`}>
        {body}
      </div>
    );
  }
  return (
    <Link
      href={`/game?level=${level.id}`}
      className={`${base} hover:-translate-y-0.5 hover:bg-[#fff0c8] focus:outline-none focus-visible:ring-4 focus-visible:ring-white`}
    >
      {body}
    </Link>
  );
}
