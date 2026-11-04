"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Crown, ListOrdered, RotateCcw, Home } from "lucide-react";
import StarRating from "./StarRating";

interface Props {
  totalCompleted: number;
  totalLevels: number;
  levelMoves: number;
  minMoves: number;
  levelStars: number;
  starsCollected: number;
  maxStars: number;
  bonus: number;
  onReplay: () => void;
}

const COINS = ["#ffd21f", "#ffb703", "#ffe680", "#f5b800"];

/** Special completion screen shown after beating the final level. */
export default function FinalScreen({
  totalCompleted,
  totalLevels,
  levelMoves,
  minMoves,
  levelStars,
  starsCollected,
  maxStars,
  bonus,
  onReplay,
}: Props) {
  const replayRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const t = setTimeout(() => replayRef.current?.focus(), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="final-title"
      data-testid="final-screen"
    >
      {/* rotating sunburst */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
        <svg viewBox="-200 -200 400 400" className="h-[160vmax] w-[160vmax] animate-rays opacity-40">
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d="M0 0 L-22 -200 L22 -200Z" fill="#fff6b0" transform={`rotate(${(i * 360) / 14})`} />
          ))}
        </svg>
      </div>
      {/* raining gold coins */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 34 }, (_, i) => (
          <span
            key={i}
            className="absolute top-0 block animate-coin rounded-full border-2 border-amber-700"
            style={{
              left: `${(i * 89) % 100}%`,
              width: 14 + (i % 4) * 4,
              height: 14 + (i % 4) * 4,
              background: COINS[i % COINS.length],
              animationDelay: `${((i * 41) % 40) / 10}s`,
              animationDuration: `${3 + ((i * 17) % 25) / 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-full items-center justify-center py-10">
        <div className="panel relative w-full max-w-md animate-pop !border-amber-700 !bg-[#fff1c2] p-6 text-center sm:p-8">
          <div className="mx-auto -mt-16 mb-2 flex h-24 w-24 animate-floaty items-center justify-center rounded-full border-4 border-amber-700 bg-gradient-to-b from-yellow-200 to-amber-400 shadow-xl">
            <Crown size={54} className="text-amber-900" aria-hidden="true" />
          </div>
          <p className="font-display text-sm font-extrabold uppercase tracking-[0.25em] text-[#7a5430]">
            Golden Trails complete
          </p>
          <h2 id="final-title" className="mt-1 font-display text-3xl font-extrabold text-amber-900 sm:text-4xl">
            You Found the Legendary Pot of Gold!
          </h2>

          <div className="mt-3 flex justify-center">
            <StarRating value={levelStars} size={40} />
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-2xl bg-white/70 p-3">
              <dt className="text-xs font-bold uppercase text-[#7a5430]">Levels completed</dt>
              <dd className="font-display text-3xl font-extrabold text-amber-900" data-testid="final-levels">
                {totalCompleted}
                <span className="text-lg text-stone-500"> / {totalLevels}</span>
              </dd>
            </div>
            <div className="rounded-2xl bg-white/70 p-3">
              <dt className="text-xs font-bold uppercase text-[#7a5430]">Level 10 moves</dt>
              <dd className="font-display text-3xl font-extrabold text-amber-900" data-testid="final-moves">
                {levelMoves}
                <span className="text-lg text-stone-500"> / {minMoves}</span>
              </dd>
            </div>
            <div className="rounded-2xl bg-white/70 p-3">
              <dt className="text-xs font-bold uppercase text-[#7a5430]">Stars collected</dt>
              <dd className="font-display text-3xl font-extrabold text-amber-900" data-testid="final-stars">
                {starsCollected}
                <span className="text-lg text-stone-500"> / {maxStars}</span>
              </dd>
            </div>
            <div className="rounded-2xl bg-white/70 p-3">
              <dt className="text-xs font-bold uppercase text-[#7a5430]">Chapter</dt>
              <dd className="font-display text-xl font-extrabold leading-tight text-green-800">
                Golden Trails
                <span className="block text-sm">Completed!</span>
              </dd>
            </div>
          </dl>
          {bonus > 0 && <p className="mt-3 font-semibold text-purple-900">Curse bonus earned: +{bonus} gold</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button ref={replayRef} type="button" className="btn-green" onClick={onReplay}>
              <RotateCcw size={20} /> Replay
            </button>
            <Link href="/levels" className="btn-wood">
              <ListOrdered size={20} /> All levels
            </Link>
          </div>
          <Link href="/" className="mt-4 inline-flex items-center gap-1 font-bold text-[#7a5430] underline">
            <Home size={16} /> Main menu
          </Link>
        </div>
      </div>
    </div>
  );
}
