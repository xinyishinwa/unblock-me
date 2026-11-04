"use client";

import Link from "next/link";
import { Check, Droplets, Flame, Hourglass, KeyRound, Lock, Sparkles } from "lucide-react";
import type { Difficulty, LevelConfig } from "@/data/levels";
import type { MechanicId } from "@/lib/game/special-types";
import StarRating from "./StarRating";
import { THEMES } from "./themes";

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  Easy: "bg-green-500 text-white",
  Medium: "bg-orange-400 text-orange-950",
  Hard: "bg-red-500 text-white",
  Expert: "bg-purple-700 text-white",
};

const DIFFICULTY_PIPS: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 3, Expert: 4 };

const MECHANIC_ICON: Record<MechanicId, typeof Flame> = {
  bridge: Droplets,
  key: KeyRound,
  "limited-moves": Hourglass,
  frozen: Flame,
  combo: Sparkles,
};

interface Props {
  level: LevelConfig;
  locked: boolean;
  bestMoves?: number;
  stars?: number;
}

export default function LevelCard({ level, locked, bestMoves, stars = 0 }: Props) {
  const completed = bestMoves !== undefined;
  const MechIcon = level.mechanic ? MECHANIC_ICON[level.mechanic] : null;
  const theme = level.theme ? THEMES[level.theme] : null;

  const body = (
    <>
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 font-display text-3xl font-extrabold ${
          locked
            ? "border-stone-500 bg-stone-300 text-stone-500"
            : "border-amber-700 bg-amber-300 text-amber-950"
        }`}
        style={!locked && theme ? { backgroundImage: theme.swatch } : undefined}
      >
        {locked ? <Lock size={24} aria-hidden="true" /> : level.id}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-xs font-bold uppercase tracking-wider text-[#7a5430]">
          Level {level.id}
          {theme ? ` · ${theme.label}` : ""}
        </p>
        <h3 className="truncate font-display text-xl font-extrabold leading-tight">{level.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${DIFFICULTY_STYLE[level.difficulty]}`}
            title={`Difficulty: ${level.difficulty}`}
          >
            {level.difficulty}
            {level.chapter && (
              <span className="flex gap-0.5" aria-hidden="true">
                {Array.from({ length: DIFFICULTY_PIPS[level.difficulty] }, (_, i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                ))}
              </span>
            )}
          </span>
          {level.mechanicLabel && MechIcon && (
            <span
              className="flex items-center gap-1 rounded-full bg-[#6b4220] px-2.5 py-0.5 text-xs font-extrabold text-amber-50"
              data-testid={`mechanic-${level.id}`}
            >
              <MechIcon size={12} aria-hidden="true" /> {level.mechanicLabel}
            </span>
          )}
          {locked && <span className="text-xs font-semibold text-stone-600">Complete level {level.id - 1} to unlock</span>}
          {completed && (
            <span className="flex items-center gap-1 text-xs font-bold text-green-800">
              <Check size={14} aria-hidden="true" /> Best: {bestMoves} moves
            </span>
          )}
        </div>
      </div>
      {level.chapter ? (
        <div className="shrink-0" data-testid={`stars-${level.id}`}>
          <StarRating value={completed ? stars : 0} size={20} />
        </div>
      ) : (
        completed && <StarRating value={1} size={28} showEmpty={false} className="shrink-0" />
      )}
    </>
  );

  const base = "panel flex w-full items-center gap-3 p-4 transition sm:gap-4";
  const label = `Level ${level.id}: ${level.name}. ${level.difficulty}.${
    level.mechanicLabel ? ` ${level.mechanicLabel}.` : ""
  } ${locked ? "Locked." : completed ? `Completed, best ${bestMoves} moves.` : "Unlocked."}`;

  if (locked) {
    return (
      <div aria-disabled="true" aria-label={label} className={`${base} cursor-not-allowed opacity-60 grayscale`}>
        {body}
      </div>
    );
  }
  return (
    <Link
      href={`/game?level=${level.id}`}
      aria-label={label}
      className={`${base} hover:-translate-y-0.5 hover:bg-[#fff0c8] focus:outline-none focus-visible:ring-4 focus-visible:ring-white`}
    >
      {body}
    </Link>
  );
}
