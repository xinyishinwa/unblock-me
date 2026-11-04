import { LevelConfig, levelToPieces } from "@/data/levels";
import { BOARD_SIZE, POT_ID, Piece, buildGrid, isSolved } from "./puzzle-engine";
import { createInitialState } from "./puzzle-state";
import { solveState } from "./state-solver";
import type { Cell, SpecialConfig } from "./special-types";

export interface ValidationResult {
  levelId: number;
  ok: boolean;
  errors: string[];
  /** Optimal solution length found by BFS (if solvable). */
  solutionMoves: number | null;
  /** Special mechanics the optimal solution actually switched on. */
  mechanicsUsed: string[];
  /** Search effort (distinct states explored by the BFS). */
  explored: number;
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

const cellKey = (c: Cell) => `${c[0]},${c[1]}`;

/** Checks for the special objects of a level (cells, ids, trigger lanes). */
export function validateSpecial(
  pieces: readonly Piece[],
  special: SpecialConfig,
): string[] {
  const errors: string[] = [];
  const logIds = new Set(pieces.filter((p) => p.id !== POT_ID).map((p) => p.id));
  const blockers: Array<[string, readonly Cell[]]> = [
    ["stone", special.stones ?? []],
    ["bridge", special.bridge?.cells ?? []],
    ["gate", special.key?.gate ?? []],
  ];
  const seen = new Map<string, string>();
  const occupied = new Set<string>();
  for (const p of pieces) {
    const horizontal = p.orientation === "horizontal";
    for (let i = 0; i < p.length; i++) {
      occupied.add(cellKey(horizontal ? [p.x + i, p.y] : [p.x, p.y + i]));
    }
  }

  const inBoard = (c: Cell) =>
    Number.isInteger(c[0]) && Number.isInteger(c[1]) &&
    c[0] >= 0 && c[0] < BOARD_SIZE && c[1] >= 0 && c[1] < BOARD_SIZE;

  for (const [label, cells] of blockers) {
    for (const c of cells) {
      if (!inBoard(c)) errors.push(`${label} cell [${c}] is out of bounds`);
      else if (occupied.has(cellKey(c))) errors.push(`${label} cell [${c}] overlaps a piece`);
      else if (seen.has(cellKey(c))) errors.push(`${label} cell [${c}] overlaps a ${seen.get(cellKey(c))}`);
      else seen.set(cellKey(c), label);
    }
  }
  for (const c of special.stones ?? []) {
    if (c[1] === 2 && inBoard(c)) errors.push(`stone [${c}] sits on the exit row`);
  }

  const checkTrigger = (label: string, t: { logId: string; cell: Cell }) => {
    const log = pieces.find((p) => p.id === t.logId);
    if (!log) return errors.push(`${label}: unknown trigger log "${t.logId}"`);
    if (!inBoard(t.cell)) return errors.push(`${label}: trigger cell out of bounds`);
    const sameLane =
      log.orientation === "horizontal" ? log.y === t.cell[1] : log.x === t.cell[0];
    if (!sameLane) errors.push(`${label}: log "${t.logId}" can never reach its trigger cell [${t.cell}]`);
    if (occupied.has(cellKey(t.cell))) errors.push(`${label}: trigger cell [${t.cell}] starts covered`);
    if (seen.has(cellKey(t.cell))) errors.push(`${label}: trigger cell [${t.cell}] is blocked`);
  };
  if (special.bridge) checkTrigger("bridge", special.bridge.trigger);
  if (special.key) checkTrigger("key", special.key.trigger);
  if (special.fire) {
    checkTrigger("fire", special.fire.trigger);
    for (const id of special.fire.frozen) {
      if (!logIds.has(id)) errors.push(`frozen log "${id}" does not exist`);
      if (id === special.fire.trigger.logId) errors.push(`fire switch log "${id}" is frozen (deadlock)`);
    }
  }
  for (const id of Object.keys(special.magical ?? {})) {
    if (!logIds.has(id)) errors.push(`magical log "${id}" does not exist`);
  }
  if (special.exitRequires?.includes("bridge") && !special.bridge) errors.push("exit requires a bridge that is not defined");
  if (special.exitRequires?.includes("gate") && !special.key) errors.push("exit requires a gate that is not defined");
  if (special.bridge && !special.exitRequires?.includes("bridge") &&
      !special.bridge.cells.some(([, y]) => y === 2)) {
    errors.push("bridge does not touch the exit row");
  }
  return errors;
}

export function validateLevel(level: LevelConfig): ValidationResult {
  const pieces = levelToPieces(level);
  const special: SpecialConfig = level.special ?? {};
  const errors = [...validateLayout(pieces), ...validateSpecial(pieces, special)];
  let solutionMoves: number | null = null;
  let explored = 0;
  const mechanicsUsed: string[] = [];

  if (errors.length === 0) {
    const result = solveState(createInitialState(pieces, special), special);
    explored = result.explored;
    if (!result.solvable) errors.push("Level is not solvable");
    else {
      solutionMoves = result.moves.length;
      const final = result.states[result.states.length - 1];
      if (!final.completed) errors.push("Solution does not complete the level");
      if (level.minMoves !== solutionMoves) {
        errors.push(`minMoves is ${level.minMoves} but BFS optimum is ${solutionMoves}`);
      }
      // The solution must really activate every configured mechanic.
      if (special.bridge) {
        if (final.bridgeOpen) mechanicsUsed.push("bridge");
        else errors.push("Solution never opens the bridge");
      }
      if (special.key) {
        if (final.keyCollected && final.gateUnlocked) mechanicsUsed.push("key+gate");
        else errors.push("Solution never collects the key");
      }
      if (special.fire) {
        if (final.fireActive && final.frozen.length === 0) mechanicsUsed.push("fire");
        else errors.push("Solution never lights the fire");
      }
      if (special.stones?.length) mechanicsUsed.push("stones");
      if (special.magical) mechanicsUsed.push("magical-log");
      if (special.moveLimit !== undefined) {
        mechanicsUsed.push(`limit ${special.moveLimit}`);
        if (solutionMoves > special.moveLimit) {
          errors.push(`optimum ${solutionMoves} exceeds the move limit ${special.moveLimit}`);
        }
        if (final.movesLeft !== special.moveLimit - solutionMoves) {
          errors.push("Move counter disagrees with solution length");
        }
        // The limit must be fair: unlimited play may not need fewer moves
        // than the limit allows, and must not be wildly looser.
        const relaxed: SpecialConfig = { ...special, moveLimit: undefined };
        const free = solveState(createInitialState(pieces, relaxed), relaxed);
        if (!free.solvable || free.moves.length !== solutionMoves) {
          errors.push("Move limit changes the optimal solution length");
        }
      }
      if (level.stars) {
        if (level.stars.three < level.minMoves) errors.push("3-star threshold below optimum");
        if (level.stars.two < level.stars.three) errors.push("2-star threshold below 3-star threshold");
        if (special.moveLimit !== undefined && level.stars.two >= special.moveLimit) {
          errors.push("2-star threshold must be below the move limit");
        }
      }
      // Each switch mechanic must matter: removing it must make the puzzle easier.
      const ablations: Array<[string, SpecialConfig | null]> = [
        ["bridge", special.bridge ? { ...special, bridge: undefined, exitRequires: special.exitRequires?.filter((r) => r !== "bridge") } : null],
        ["key", special.key ? { ...special, key: undefined, exitRequires: special.exitRequires?.filter((r) => r !== "gate") } : null],
        ["fire", special.fire ? { ...special, fire: undefined } : null],
        ["magical-log", special.magical ? { ...special, magical: undefined } : null],
      ];
      for (const [name, variant] of ablations) {
        if (!variant) continue;
        const v = solveState(createInitialState(pieces, variant), variant);
        if (v.solvable && v.moves.length >= solutionMoves) {
          errors.push(`Mechanic "${name}" has no effect on the solution length`);
        }
      }
    }
  }
  return { levelId: level.id, ok: errors.length === 0, errors, solutionMoves, mechanicsUsed, explored };
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
