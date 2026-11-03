"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Pause, Play, ListOrdered, Home } from "lucide-react";
import { LevelConfig, LEVELS } from "@/data/levels";
import { useGame } from "@/lib/game/use-game";
import { useProgress } from "@/lib/game/use-progress";
import GameBoard from "./GameBoard";
import GameControls from "./GameControls";
import WinScreen from "./WinScreen";

const WIN_DELAY_MS = 1000;

export default function GameScreen({ level }: { level: LevelConfig }) {
  const { progress, hydrated, completeLevel } = useProgress();
  const game = useGame(level);
  const [paused, setPaused] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const savedRef = useRef(false);

  // Persist progress once, the moment the pot reaches the exit.
  useEffect(() => {
    if (!game.solved) return;
    if (!savedRef.current) {
      savedRef.current = true;
      completeLevel(level.id, game.moves);
    }
    const t = setTimeout(() => setShowWin(true), WIN_DELAY_MS);
    return () => clearTimeout(t);
  }, [game.solved, game.moves, level.id, completeLevel]);

  const replay = () => {
    game.reset();
    savedRef.current = false;
    setShowWin(false);
  };

  if (hydrated && level.id > progress.highestUnlocked) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="panel p-6">
          <Lock size={48} className="mx-auto text-stone-500" />
          <h1 className="mt-2 font-display text-2xl font-extrabold">Level {level.id} is locked</h1>
          <p className="mt-1 font-semibold">Complete level {level.id - 1} first.</p>
          <Link href="/levels" className="btn-green mt-4">
            <ListOrdered size={20} /> Level Selection
          </Link>
        </div>
      </main>
    );
  }

  const nextLevelId = level.id < LEVELS.length ? level.id + 1 : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center gap-4 px-3 py-4 sm:gap-5 sm:py-6">
      {/* header */}
      <header className="flex w-full items-center justify-between gap-2">
        <Link href="/levels" className="btn-wood !px-3 !py-2 !text-base" aria-label="Back to level selection">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Levels</span>
        </Link>
        <div className="panel min-w-0 flex-1 px-3 py-1.5 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7a5430]">
            Level {level.id} · {level.difficulty}
          </p>
          <h1 className="truncate font-display text-xl font-extrabold leading-tight sm:text-2xl">
            {level.name}
          </h1>
        </div>
        <button
          type="button"
          className="btn-wood !px-3 !py-2 !text-base"
          onClick={() => setPaused(true)}
          aria-label="Pause"
          disabled={game.solved}
        >
          <Pause size={20} /> <span className="hidden sm:inline">Pause</span>
        </button>
      </header>

      {/* stats */}
      <div className="flex gap-3">
        <div className="panel px-5 py-1.5 text-center">
          <p className="text-[11px] font-bold uppercase text-[#7a5430]">Moves</p>
          <p className="font-display text-3xl font-extrabold leading-none" data-testid="moves">
            {game.moves}
          </p>
        </div>
        <div className="panel px-5 py-1.5 text-center">
          <p className="text-[11px] font-bold uppercase text-[#7a5430]">Best possible</p>
          <p className="font-display text-3xl font-extrabold leading-none text-green-800">
            {level.minMoves}
          </p>
        </div>
      </div>

      <GameBoard
        pieces={game.pieces}
        hint={game.hint}
        solved={game.solved}
        disabled={paused || game.solved}
        onMove={game.move}
      />

      <GameControls
        canUndo={game.canUndo}
        hasMoved={game.moves > 0 && !game.solved}
        disabled={paused || game.solved}
        onUndo={game.undo}
        onReset={game.reset}
        onHint={game.requestHint}
      />
      <p className="rounded-full bg-[#6b4220]/80 px-4 py-1 text-center text-sm font-semibold text-amber-50">
        Drag the logs · or tap one and use the arrow keys
      </p>

      {paused && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-title"
        >
          <div className="panel w-full max-w-xs animate-pop p-6 text-center">
            <h2 id="pause-title" className="font-display text-3xl font-extrabold text-amber-900">
              Paused
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              <button type="button" className="btn-green" onClick={() => setPaused(false)} autoFocus>
                <Play size={20} className="fill-current" /> Resume
              </button>
              <Link href="/levels" className="btn-wood">
                <ListOrdered size={20} /> Level Selection
              </Link>
              <Link href="/" className="btn-wood">
                <Home size={20} /> Main Menu
              </Link>
            </div>
          </div>
        </div>
      )}

      {showWin && (
        <WinScreen
          levelName={level.name}
          moves={game.moves}
          bestMoves={progress.best[level.id]}
          minMoves={level.minMoves}
          nextLevelId={nextLevelId}
          onReplay={replay}
        />
      )}
    </main>
  );
}
