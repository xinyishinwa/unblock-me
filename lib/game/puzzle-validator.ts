import { LevelConfig, levelToPieces } from "@/data/levels";
import { BOARD_SIZE, POT_ID, Piece, buildGrid, isSolved } from "./puzzle-engine";
import { solve } from "./puzzle-solver";

export interface ValidationResult {
  levelId: number;
  ok: boolean;
  errors: string[];
  /** Optimal solution length found by BFS (if solvable). */
  solutionMoves: number | null;
}

/** Structural checks: bounds, overlaps, orientation of the pot. */
export function validateLayout(pieces: readonly Piece[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  let occupied = 0;

  for (const p of pieces) {
    if (ids.has(p.id)) errors.push(`Duplicate piece id "${p.id}"`);
    ids.add(p.id);
    if (p.length < 2 || p.length > 3) errors.push(`"${p.id}" has odd length ${p.length}`);
    const endX = p.orientation === "horizontal" ? p.x + p.length - 1 : p.x;
    const endY = p.orientation === "vertical" ? p.y + p.length - 1 : p.y;
    if (p.x < 0 || p.y < 0 || endX >= BOARD_SIZE || endY >= BOARD_SIZE) {
      errors.push(`"${p.id}" is out of bounds`);
    }
    occupied += p.length;
  }

  if (errors.length === 0) {
    const filled = buildGrid(pieces).flat().filter((c) => c !== null).length;
    if (filled !== occupied) errors.push("Pieces overlap");
  }

  const pot = pieces.find((p) => p.id === POT_ID);
  if (!pot) errors.push("Missing Pot of Gold");
  else {
    if (pot.orientation !== "horizontal") errors.push("Pot must be horizontal");
    if (pot.y !== 2) errors.push("Pot must sit on the exit row (row 3)");
    if (isSolved(pieces)) errors.push("Pot starts already solved");
  }
  return errors;
}

export function validateLevel(level: LevelConfig): ValidationResult {
  const pieces = levelToPieces(level);
  const errors = validateLayout(pieces);
  let solutionMoves: number | null = null;

  if (errors.length === 0) {
    const result = solve(pieces);
    if (!result.solvable) errors.push("Level is not solvable");
    else {
      solutionMoves = result.moves.length;
      if (level.minMoves !== solutionMoves) {
        errors.push(
          `minMoves is ${level.minMoves} but BFS optimum is ${solutionMoves}`,
        );
      }
    }
  }
  return { levelId: level.id, ok: errors.length === 0, errors, solutionMoves };
}

export function validateAllLevels(levels: readonly LevelConfig[]): ValidationResult[] {
  const results = levels.map(validateLevel);
  const seen = new Map<string, number>();
  levels.forEach((lvl, i) => {
    const key = JSON.stringify(
      levelToPieces(lvl).map((p) => [p.id, p.x, p.y, p.length, p.orientation]),
    );
    const prev = seen.get(key);
    if (prev !== undefined) {
      results[i].ok = false;
      results[i].errors.push(`Same layout as level ${prev}`);
    }
    seen.set(key, lvl.id);
  });
  return results;
}
