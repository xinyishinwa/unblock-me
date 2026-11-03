"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ListOrdered, RotateCcw, Trophy } from "lucide-react";

interface Props {
  levelName: string;
  moves: number;
  bestMoves?: number;
  minMoves: number;
  nextLevelId: number | null;
  onReplay: () => void;
}

const CONFETTI = ["#ffd21f", "#ff6b6b", "#4ecb71", "#4dabf7", "#ff9f43", "#cc5de8"];

export default function WinScreen({
  levelName,
  moves,
  bestMoves,
  minMoves,
  nextLevelId,
  onReplay,
}: Props) {
  const nextRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const t = setTimeout(() => nextRef.current?.focus(), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-title"
    >
      {/* confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 36 }, (_, i) => (
          <span
            key={i}
            className="absolute top-0 block h-3 w-2 animate-confetti rounded-sm"
            style={{
              left: `${(i * 97) % 100}%`,
              background: CONFETTI[i % CONFETTI.length],
              animationDelay: `${((i * 37) % 30) / 10}s`,
              animationDuration: `${2.6 + ((i * 13) % 20) / 10}s`,
            }}
          />
        ))}
      </div>

      <div className="panel relative mt-12 w-full max-w-md animate-pop p-6 text-center sm:p-8">
        <div className="mx-auto -mt-16 mb-2 flex h-24 w-24 animate-floaty items-center justify-center rounded-full border-4 border-amber-700 bg-gradient-to-b from-yellow-200 to-amber-400 shadow-xl">
          <Trophy size={52} className="text-amber-900" />
        </div>
        <h2 id="win-title" className="font-display text-3xl font-extrabold text-amber-900 sm:text-4xl">
          You Found the Pot of Gold!
        </h2>
        <p className="mt-1 font-semibold text-[#7a5430]">{levelName} cleared</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/70 p-3">
            <p className="text-xs font-bold uppercase text-[#7a5430]">Total moves</p>
            <p className="font-display text-4xl font-extrabold text-amber-900">{moves}</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-3">
            <p className="text-xs font-bold uppercase text-[#7a5430]">Best / Perfect</p>
            <p className="font-display text-4xl font-extrabold text-green-800">
              {bestMoves ?? moves}
              <span className="text-xl text-stone-500"> / {minMoves}</span>
            </p>
          </div>
        </div>
        {moves === minMoves && (
          <p className="mt-3 font-display text-lg font-bold text-green-700">Perfect solution!</p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {nextLevelId !== null ? (
            <Link ref={nextRef} href={`/game?level=${nextLevelId}`} className="btn-green">
              Next Level <ArrowRight size={20} />
            </Link>
          ) : (
            <Link ref={nextRef} href="/levels" className="btn-green">
              <ListOrdered size={20} /> All levels done!
            </Link>
          )}
          <button type="button" className="btn-wood" onClick={onReplay}>
            <RotateCcw size={20} /> Replay
          </button>
        </div>
        <Link href="/levels" className="mt-4 inline-block font-bold text-[#7a5430] underline">
          Level selection
        </Link>
      </div>
    </div>
  );
}
