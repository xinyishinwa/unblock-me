"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Lock, Pause, Play, ListOrdered, Home } from "lucide-react";
import { LevelConfig, LEVELS } from "@/data/levels";
import { CHAPTERS, FINAL_LEVEL_ID, GOLDEN_TRAILS } from "@/data/chapters";
import { useGame } from "@/lib/game/use-game";
import { starsFor, totalStars, useProgress } from "@/lib/game/use-progress";
import { bonusForMoves, starsForMoves, unusedMoves } from "@/lib/game/stars";
import type { BlockReason, MechanicEvent } from "@/lib/game/puzzle-state";
import ThemeBackdrop from "@/components/scenery/ThemeBackdrop";
import GameBoard from "./GameBoard";
import GameControls from "./GameControls";
import MechanicHud, { MovesLeft } from "./MechanicHud";
import RetryScreen from "./RetryScreen";
import TutorialModal from "./TutorialModal";
import WinScreen from "./WinScreen";
import FinalScreen from "./FinalScreen";
import { THEMES } from "./themes";

const WIN_DELAY_MS = 1000;
/** Final level gets a longer pause so the treasure animation can play. */
const FINAL_WIN_DELAY_MS = 2600;
const TOAST_MS = 2600;
const TUTORIAL_KEY = "amulung-pot-of-gold:tutorial:v1";

const EVENT_TOAST: Record<MechanicEvent, string> = {
  "bridge-opened": "The bridge is open! The exit route is clear.",
  "key-collected": "Golden Key collected! The gate is unlocked.",
  "fire-lit": "The magical fire is lit — the ice is melting!",
};

const REASON_TOAST: Record<BlockReason, string> = {
  done: "The level is already complete.",
  "no-moves": "No moves left!",
  frozen: "That log is frozen solid. Light the fire to melt it.",
  stone: "A stone blocks the way.",
  bridge: "The bridge is closed — the river blocks the way.",
  gate: "The gate is locked.",
  log: "Another log is in the way.",
  magic: "Magical log: it moves one cell at a time.",
  edge: "That is the edge of the board.",
};

function readSeenTutorials(): number[] {
  try {
    const raw = window.localStorage.getItem(TUTORIAL_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === "number") : [];
  } catch {
    return [];
  }
}

function markTutorialSeen(levelId: number): void {
  try {
    const seen = new Set(readSeenTutorials());
    seen.add(levelId);
    window.localStorage.setItem(TUTORIAL_KEY, JSON.stringify([...seen]));
  } catch {
    /* ignore: tutorial just shows again next time */
  }
}

export default function GameScreen({ level }: { level: LevelConfig }) {
  const { progress, hydrated, completeLevel } = useProgress();
  const game = useGame(level);
  const special = level.special ?? {};
  const [paused, setPaused] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; kind: "good" | "bad"; n: number } | null>(null);
  const savedRef = useRef(false);
  const lastRunRef = useRef({ stars: 0, bonus: 0 });
  const tutorialChecked = useRef(false);

  const isFinal = level.id === FINAL_LEVEL_ID;
  const limit = special.moveLimit;
  const runStars = starsForMoves(level, game.moves);
  const runBonus = bonusForMoves(level, game.moves);

  // First visit: show the level tutorial.
  useEffect(() => {
    if (tutorialChecked.current || !hydrated || !level.tutorial) return;
    tutorialChecked.current = true;
    if (!readSeenTutorials().includes(level.id)) {
      setTutorialOpen(true);
    }
  }, [hydrated, level]);

  const closeTutorial = () => {
    markTutorialSeen(level.id);
    setTutorialOpen(false);
  };

  // Toast on mechanic activation.
  useEffect(() => {
    if (game.events.length === 0) return;
    setToast({ text: game.events.map((e) => EVENT_TOAST[e]).join(" "), kind: "good", n: game.tick });
  }, [game.events, game.tick]);

  // Toast on rejected moves.
  useEffect(() => {
    if (!game.rejected) return;
    setToast({ text: REASON_TOAST[game.rejected.reason], kind: "bad", n: game.rejected.n + 10_000 });
  }, [game.rejected]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(t);
  }, [toast]);

  // Persist progress once, the moment the pot reaches the exit.
  useEffect(() => {
    if (!game.solved) return;
    if (!savedRef.current) {
      savedRef.current = true;
      lastRunRef.current = { stars: runStars, bonus: runBonus };
      completeLevel(level.id, game.moves, {
        stars: runStars,
        bonus: limit !== undefined ? runBonus : undefined,
        chapterCompleted: isFinal ? GOLDEN_TRAILS.id : undefined,
      });
    }
    const t = setTimeout(() => setShowWin(true), isFinal ? FINAL_WIN_DELAY_MS : WIN_DELAY_MS);
    return () => clearTimeout(t);
  }, [game.solved, game.moves, level.id, limit, isFinal, runStars, runBonus, completeLevel]);

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
  const chapter = CHAPTERS.find((c) => c.levelIds.includes(level.id));
  const theme = level.theme;
  const blockInput = paused || game.solved || game.failed || tutorialOpen;
  const stars = starsFor(progress, level.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center gap-4 px-3 py-4 sm:gap-5 sm:py-6">
      {theme && <ThemeBackdrop theme={theme} />}

      {/* header */}
      <header className="flex w-full items-center justify-between gap-2">
        <Link href="/levels" className="btn-wood !px-3 !py-2 !text-base" aria-label="Back to level selection">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Levels</span>
        </Link>
        <div className="panel min-w-0 flex-1 px-3 py-1.5 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7a5430]">
            Level {level.id} · {level.difficulty}
            {level.mechanicLabel ? ` · ${level.mechanicLabel}` : ""}
          </p>
          <h1 className="truncate font-display text-xl font-extrabold leading-tight sm:text-2xl">
            {level.name}
          </h1>
        </div>
        {level.tutorial && (
          <button
            type="button"
            className="btn-wood !px-3 !py-2 !text-base"
            onClick={() => setTutorialOpen(true)}
            aria-label="Show tutorial"
            disabled={game.solved}
          >
            <BookOpen size={20} />
          </button>
        )}
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
      <div className="flex flex-wrap items-stretch justify-center gap-3">
        {limit !== undefined && game.movesLeft !== null && (
          <MovesLeft left={game.movesLeft} limit={limit} />
        )}
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
        {chapter?.id === GOLDEN_TRAILS.id && (
          <div className="panel px-4 py-1.5 text-center">
            <p className="text-[11px] font-bold uppercase text-[#7a5430]">Stars</p>
            <p className="font-display text-3xl font-extrabold leading-none" data-testid="level-stars">
              {game.solved ? runStars : stars}
              <span className="text-lg text-stone-500"> / 3</span>
            </p>
          </div>
        )}
      </div>

      <MechanicHud state={game.state} special={special} />

      <div className="relative">
        <GameBoard
          state={game.state}
          special={special}
          theme={theme}
          hint={game.hint}
          solved={game.solved}
          disabled={blockInput}
          onMove={game.move}
          onReject={game.reject}
          shake={game.rejected ? { id: game.rejected.id, n: game.rejected.n } : null}
        />
        {isFinal && game.solved && (
          <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden="true">
            {Array.from({ length: 28 }, (_, i) => (
              <span
                key={i}
                className="absolute top-0 block animate-coin rounded-full border-2 border-amber-700 bg-yellow-300"
                style={{
                  left: `${(i * 83) % 100}%`,
                  width: 12 + (i % 3) * 4,
                  height: 12 + (i % 3) * 4,
                  animationDelay: `${((i * 29) % 20) / 10}s`,
                  animationDuration: `${1.8 + ((i * 7) % 12) / 10}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <GameControls
        canUndo={game.canUndo}
        hasMoved={game.moves > 0 && !game.solved}
        disabled={paused || game.solved || tutorialOpen}
        onUndo={game.undo}
        onReset={game.reset}
        onHint={game.requestHint}
      />

      <div className="min-h-[2.5rem] text-center" aria-live="polite" role="status">
        {toast ? (
          <p
            key={toast.n}
            className={`inline-block animate-rise rounded-full px-4 py-1 text-sm font-bold shadow ${
              toast.kind === "good" ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
            data-testid="toast"
          >
            {toast.text}
          </p>
        ) : game.hintMissing ? (
          <p className="inline-block rounded-full bg-red-600 px-4 py-1 text-sm font-bold text-white shadow">
            No winning path from here — try Undo or Reset.
          </p>
        ) : (
          <p className="inline-block rounded-full bg-[#6b4220]/80 px-4 py-1 text-sm font-semibold text-amber-50">
            Drag the logs · or tap one and use the arrow keys
          </p>
        )}
      </div>

      {tutorialOpen && level.tutorial && (
        <TutorialModal
          tutorial={level.tutorial}
          badge={level.mechanicLabel ?? "Mechanic"}
          onClose={closeTutorial}
        />
      )}

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

      {game.failed && limit !== undefined && (
        <RetryScreen limit={limit} onRetry={game.reset} onUndo={game.undo} />
      )}

      {showWin && !isFinal && (
        <WinScreen
          levelName={level.name}
          moves={game.moves}
          bestMoves={progress.best[level.id]}
          minMoves={level.minMoves}
          nextLevelId={nextLevelId}
          onReplay={replay}
          stars={level.chapter ? lastRunRef.current.stars : undefined}
          bonus={limit !== undefined ? lastRunRef.current.bonus : undefined}
          unusedMoves={unusedMoves(level, game.moves)}
          confetti={theme ? THEMES[theme].confetti : undefined}
        />
      )}

      {showWin && isFinal && (
        <FinalScreen
          totalCompleted={Object.keys(progress.best).length}
          totalLevels={LEVELS.length}
          levelMoves={game.moves}
          minMoves={level.minMoves}
          levelStars={lastRunRef.current.stars}
          starsCollected={totalStars(progress, LEVELS.map((l) => l.id))}
          maxStars={LEVELS.length * 3}
          bonus={lastRunRef.current.bonus}
          onReplay={replay}
        />
      )}
    </main>
  );
}
