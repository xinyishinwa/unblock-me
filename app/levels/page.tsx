"use client";

import Link from "next/link";
import { ArrowLeft, Crown, Star } from "lucide-react";
import { LEVELS, getLevel } from "@/data/levels";
import { CHAPTERS, GOLDEN_TRAILS } from "@/data/chapters";
import { starsFor, totalStars, useProgress } from "@/lib/game/use-progress";
import Logo from "@/components/game/Logo";
import LevelCard from "@/components/game/LevelCard";

export default function LevelsPage() {
  const { progress } = useProgress();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 px-4 py-8">
      <Link href="/" className="btn-wood self-start !px-4 !py-2 !text-base">
        <ArrowLeft size={18} /> Menu
      </Link>
      <Logo compact />
      <h2 className="text-center font-display text-2xl font-extrabold text-white title-stroke">
        Choose a Level
      </h2>

      {CHAPTERS.map((chapter) => {
        const levels = chapter.levelIds.map((id) => getLevel(id)).filter((l) => !!l);
        const isGolden = chapter.id === GOLDEN_TRAILS.id;
        const done = chapter.levelIds.filter((id) => progress.best[id] !== undefined).length;
        const stars = totalStars(progress, chapter.levelIds);
        const unlockedAny = chapter.levelIds.some((id) => id <= progress.highestUnlocked);
        const finished = isGolden && (progress.chapters[GOLDEN_TRAILS.id] || done === chapter.levelIds.length);

        return (
          <section key={chapter.id} aria-labelledby={`chapter-${chapter.id}`} className="flex flex-col gap-3">
            {isGolden && (
              <header
                className={`panel flex items-center gap-3 px-4 py-3 ${
                  unlockedAny ? "" : "opacity-70 grayscale"
                } !border-amber-700 !bg-gradient-to-r !from-[#fff1c2] !to-[#ffdc82]`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-amber-700 bg-gradient-to-b from-yellow-200 to-amber-400">
                  <Crown size={26} className="text-amber-900" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 id={`chapter-${chapter.id}`} className="font-display text-2xl font-extrabold uppercase leading-tight tracking-wide text-amber-900">
                    {chapter.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#7a5430]">{chapter.tagline}</p>
                </div>
                <div className="shrink-0 text-right" data-testid="chapter-summary">
                  <p className="flex items-center justify-end gap-1 font-display text-lg font-extrabold">
                    <Star size={18} className="fill-yellow-400 text-yellow-600" aria-hidden="true" />
                    {stars}/{chapter.levelIds.length * 3}
                  </p>
                  <p className="text-xs font-bold text-[#7a5430]">
                    {finished ? "Chapter complete!" : `${done}/${chapter.levelIds.length} cleared`}
                  </p>
                </div>
              </header>
            )}
            {!isGolden && (
              <h3 id={`chapter-${chapter.id}`} className="sr-only">
                {chapter.name}
              </h3>
            )}
            <ul className="flex flex-col gap-3">
              {levels.map((level) => (
                <li key={level.id}>
                  <LevelCard
                    level={level}
                    locked={level.id > progress.highestUnlocked}
                    bestMoves={progress.best[level.id]}
                    stars={starsFor(progress, level.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className="sr-only">{LEVELS.length} levels in total</p>
    </main>
  );
}
