"use client";

import Link from "next/link";
import { ListOrdered, RotateCcw, Undo2, Skull } from "lucide-react";

interface Props {
  limit: number;
  onRetry: () => void;
  onUndo: () => void;
}

/** Shown when the move counter hits zero without the pot reaching the exit. */
export default function RetryScreen({ limit, onRetry, onUndo }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="retry-title"
      aria-describedby="retry-desc"
    >
      <div className="panel w-full max-w-sm animate-pop !border-purple-900 !bg-purple-100 p-6 text-center">
        <Skull size={48} className="mx-auto text-purple-900" aria-hidden="true" />
        <h2 id="retry-title" className="mt-1 font-display text-3xl font-extrabold text-purple-900">
          The curse wins!
        </h2>
        <p id="retry-desc" className="mt-1 font-semibold">
          You used all {limit} moves before the Pot of Gold escaped. Try a smarter route!
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <button type="button" className="btn-green" onClick={onRetry} autoFocus>
            <RotateCcw size={20} /> Try again
          </button>
          <button type="button" className="btn-wood" onClick={onUndo}>
            <Undo2 size={20} /> Undo last move
          </button>
          <Link href="/levels" className="btn-wood">
            <ListOrdered size={20} /> Level Selection
          </Link>
        </div>
      </div>
    </div>
  );
}
