"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LEVELS, getLevel } from "@/data/levels";
import GameScreen from "@/components/game/GameScreen";

function GameRoute() {
  const params = useSearchParams();
  const id = Number(params.get("level") ?? 1);
  const level = getLevel(id) ?? LEVELS[0];
  // `key` guarantees fresh game state when navigating between levels.
  return <GameScreen key={level.id} level={level} />;
}

export default function GamePage() {
  return (
    <Suspense fallback={null}>
      <GameRoute />
    </Suspense>
  );
}
