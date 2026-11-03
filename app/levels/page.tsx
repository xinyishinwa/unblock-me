"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LEVELS } from "@/data/levels";
import { useProgress } from "@/lib/game/use-progress";
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
      <ul className="flex flex-col gap-3">
        {LEVELS.map((level) => (
          <li key={level.id}>
            <LevelCard
              level={level}
              locked={level.id > progress.highestUnlocked}
              bestMoves={progress.best[level.id]}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
