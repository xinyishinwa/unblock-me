"use client";

import { Lightbulb, RotateCcw, Undo2 } from "lucide-react";

interface Props {
  canUndo: boolean;
  hasMoved: boolean;
  disabled: boolean;
  onUndo: () => void;
  onReset: () => void;
  onHint: () => void;
}

export default function GameControls({
  canUndo,
  hasMoved,
  disabled,
  onUndo,
  onReset,
  onHint,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <button type="button" className="btn-wood" onClick={onUndo} disabled={disabled || !canUndo}>
        <Undo2 size={20} /> Undo
      </button>
      <button type="button" className="btn-wood" onClick={onReset} disabled={disabled || !hasMoved}>
        <RotateCcw size={20} /> Reset
      </button>
      <button type="button" className="btn-primary" onClick={onHint} disabled={disabled}>
        <Lightbulb size={20} /> Hint
      </button>
    </div>
  );
}
