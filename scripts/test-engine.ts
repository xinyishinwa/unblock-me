/**
 * Engine tests for the Golden Trails mechanics. Run with `npm test`.
 * Pure logic only (no DOM): puzzle state transitions, solver, hints, stars and
 * backward-compatible progress parsing.
 */
import { LEVELS, getLevel, levelToPieces, CLASSIC_LEVELS } from "../data/levels";
import { axisPos, pieceCells } from "../lib/game/puzzle-engine";
import {
  applyStateMove,
  blockReason,
  canStateMoveTo,
  createInitialState,
  getAllStateMoves,
  getStateMoveRange,
  isFailed,
  puzzleStateKey,
} from "../lib/game/puzzle-state";
import {
  createSession,
  sessionHint,
  sessionMove,
  sessionReject,
  sessionReset,
  sessionUndo,
} from "../lib/game/game-session";
import { getStateHint, solveState } from "../lib/game/state-solver";
import { solve } from "../lib/game/puzzle-solver";
import { parseProgress, recordCompletion, STORAGE_KEY } from "../lib/game/game-storage";
import { bonusForMoves, starsForMoves, unusedMoves } from "../lib/game/stars";
import type { Move } from "../lib/game/puzzle-engine";
import type { PuzzleState, SpecialConfig } from "../lib/game/special-types";

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean, detail = ""): void {
  if (ok) passed++;
  else {
    failed++;
    console.log(`FAIL  ${name}${detail ? " — " + detail : ""}`);
  }
}
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function lvl(id: number) {
  const level = getLevel(id)!;
  const special: SpecialConfig = level.special ?? {};
  return { level, special, init: createInitialState(levelToPieces(level), special) };
}
function play(state: PuzzleState, special: SpecialConfig, moves: Move[]): PuzzleState[] {
  const out = [state];
  for (const m of moves) {
    const next = applyStateMove(out[out.length - 1], special, m);
    if (!next) throw new Error(`illegal move ${JSON.stringify(m)}`);
    out.push(next);
  }
  return out;
}

// ---------------------------------------------------------------- Levels 1-5
for (const level of CLASSIC_LEVELS) {
  const pieces = levelToPieces(level);
  const legacy = solve(pieces);
  const stateful = solveState(createInitialState(pieces, {}), {});
  check(`L${level.id} classic: state solver == legacy solver`, legacy.moves.length === stateful.moves.length && legacy.moves.length === level.minMoves);
  check(`L${level.id} classic: no special config`, level.special === undefined && level.chapter === undefined);
  const init = createInitialState(pieces, {});
  check(`L${level.id} classic: no move limit / flags`, init.movesLeft === null && !init.bridgeOpen && !init.gateUnlocked && init.frozen.length === 0);
}

// ----------------------------------------------------- every level: solution
for (const level of LEVELS) {
  const special = level.special ?? {};
  const init = createInitialState(levelToPieces(level), special);
  const r = solveState(init, special);
  check(`L${level.id} solvable`, r.solvable);
  check(`L${level.id} optimum == minMoves`, r.moves.length === level.minMoves, `${r.moves.length} vs ${level.minMoves}`);
  const replay = play(init, special, r.moves);
  check(`L${level.id} replayed solution completes`, replay[replay.length - 1].completed);
  check(`L${level.id} not complete before the last move`, replay.slice(0, -1).every((s) => !s.completed));
}

// ---------------------------------------------------------------- Level 6
{
  const { init, special } = lvl(6);
  check("L6 bridge starts closed", !init.bridgeOpen);
  const potRange = getStateMoveRange(init, special, "pot");
  check("L6 pot cannot be at the exit while closed", potRange.max + 2 <= 6);
  // closed bridge cells block the pot, and nothing in the closed-bridge world can enter them
  {
    const seenB = new Set<string>([puzzleStateKey(init)]);
    const q: PuzzleState[] = [init];
    let entered = false;
    let potReachedExitClosed = false;
    for (let h = 0; h < q.length && h < 5000; h++) {
      const st = q[h];
      if (!st.bridgeOpen) {
        if (st.pieces.some((pc) => pieceCells(pc).some(([x, y]) => special.bridge!.cells.some(([bx, by]) => bx === x && by === y)))) entered = true;
        if (st.completed) potReachedExitClosed = true;
      }
      for (const m of getAllStateMoves(st, special)) {
        const n = applyStateMove(st, special, m)!;
        const k = puzzleStateKey(n);
        if (!seenB.has(k)) { seenB.add(k); q.push(n); }
      }
    }
    check("L6 no piece ever occupies a closed bridge cell", !entered);
    check("L6 pot can never exit while the bridge is closed", !potReachedExitClosed);
  }
  const sol = solveState(init, special);
  const states = play(init, special, sol.moves);
  const openAt = states.findIndex((s) => s.bridgeOpen);
  check("L6 bridge opens during the solution", openAt > 0);
  check("L6 bridge stays open once activated", states.slice(openAt).every((s) => s.bridgeOpen));
  check("L6 pot reaches exit only after bridge opens", states.findIndex((s) => s.completed) >= openAt);
}

// ---------------------------------------------------------------- Level 7
{
  const { init, special } = lvl(7);
  check("L7 gate starts locked, no key", !init.gateUnlocked && !init.keyCollected);
  const sol = solveState(init, special);
  const states = play(init, special, sol.moves);
  const keyAt = states.findIndex((s) => s.keyCollected);
  check("L7 key collected during solution", keyAt > 0);
  check("L7 key collection unlocks the gate", states[keyAt].gateUnlocked && !states[keyAt - 1].gateUnlocked);
  check("L7 pot only exits after key", states.findIndex((s) => s.completed) >= keyAt);
}

// ---------------------------------------------------------------- Level 8
{
  const { init, special, level } = lvl(8);
  check("L8 limit configured", special.moveLimit === 14 && init.movesLeft === 14);
  const moves = getAllStateMoves(init, special);
  check("L8 magical log b moves at most 1 cell", moves.filter((m) => m.id === "b").every((m) => Math.abs(m.to - m.from) === 1));
  check("L8 some non-magical log can slide several cells", moves.some((m) => m.id !== "b" && Math.abs(m.to - m.from) > 1));
  check("L8 stones are immovable obstacles", special.stones!.length === 3);
  // stones block movement: in some reachable state a stone is the blocker, and the move is refused
  {
    const seenS = new Set<string>([puzzleStateKey(init)]);
    const q: PuzzleState[] = [init];
    let stoneBlocked = false;
    let stoneEverEntered = false;
    for (let h = 0; h < q.length && h < 5000; h++) {
      const st = q[h];
      for (const p of st.pieces) {
        for (const d of [-1, 1] as const) {
          if (blockReason(st, special, p.id, d) === "stone") {
            stoneBlocked = true;
            const to = axisPos(p) + d;
            if (applyStateMove(st, special, { id: p.id, from: axisPos(p), to }) !== null) stoneBlocked = false;
          }
        }
      }
      for (const m of getAllStateMoves(st, special)) {
        const n = applyStateMove(st, special, m)!;
        if (n.pieces.some((pc) => pieceCells(pc).some(([x, y]) => special.stones!.some(([sx, sy]) => sx === x && sy === y)))) stoneEverEntered = true;
        const k = puzzleStateKey(n);
        if (!seenS.has(k)) { seenS.add(k); q.push(n); }
      }
    }
    check("L8 a stone refuses a slide in a reachable state", stoneBlocked);
    check("L8 no piece can ever overlap a stone", !stoneEverEntered);
  }
  // invalid moves are rejected without consuming a move
  const bad = applyStateMove(init, special, { id: "a", from: 0, to: 0 });
  check("L8 zero-distance move rejected", bad === null);
  const illegal = applyStateMove(init, special, { id: "b", from: 2, to: 5 });
  check("L8 over-long magical move rejected", illegal === null);
  check("L8 rejected moves keep the counter", init.movesLeft === 14);
  // only valid moves count
  const sol = solveState(init, special);
  const states = play(init, special, sol.moves);
  check("L8 each valid move costs exactly 1", states.every((s, i) => s.movesLeft === 14 - i));
  check("L8 finishing leaves unused moves", states[states.length - 1].movesLeft === 14 - sol.moves.length);
  // exhausting the budget fails the level
  let s = init;
  let spent = 0;
  // shuffle without ever solving: bounce the first available move back and forth
  for (let i = 0; i < 40 && s.movesLeft! > 0 && !s.completed; i++) {
    const pick = getAllStateMoves(s, special).find((m) => {
      const n = applyStateMove(s, special, m);
      return n && !n.completed;
    });
    if (!pick) break;
    s = applyStateMove(s, special, pick)!;
    spent++;
  }
  check("L8 budget can be exhausted", s.movesLeft === 0 && spent === 14);
  check("L8 zero moves without completion = failed", isFailed(s));
  check("L8 no moves possible once failed", getAllStateMoves(s, special).length === 0);
  check("L8 failed state has a block reason", blockReason(s, special, "a", 1) === "no-moves");
  check("L8 hint is null when out of moves", getStateHint(s, special) === null);
  // star + bonus
  check("L8 3 stars at optimum", starsForMoves(level, level.minMoves) === 3);
  check("L8 bonus for unused moves", bonusForMoves(level, 11) === 3 * 25 && unusedMoves(level, 11) === 3);
  check("L8 no bonus at the limit", bonusForMoves(level, 14) === 0);
  check("L8 stars thresholds ordered", starsForMoves(level, 12) === 3 && starsForMoves(level, 13) === 2 && starsForMoves(level, 14) === 1);
}

// ---------------------------------------------------------------- Level 9
{
  const { init, special } = lvl(9);
  check("L9 frozen logs listed", eq(init.frozen, ["b", "c", "d"]) && !init.fireActive);
  for (const id of init.frozen) {
    const r = getStateMoveRange(init, special, id);
    check(`L9 frozen ${id} cannot move`, r.min === r.max);
    check(`L9 frozen ${id} reports frozen`, [-1, 1].every((d) => blockReason(init, special, id, d as -1 | 1) === "frozen"));
  }
  check("L9 no move of a frozen log is generated", getAllStateMoves(init, special).every((m) => !init.frozen.includes(m.id)));
  const sol = solveState(init, special);
  const states = play(init, special, sol.moves);
  const fireAt = states.findIndex((s) => s.fireActive);
  check("L9 fire lit during solution", fireAt > 0);
  check("L9 fire melts every frozen log", states[fireAt].frozen.length === 0);
  const melted = states[fireAt];
  const movableAfter = ["b", "c", "d"].filter((id) => {
    const r = getStateMoveRange(melted, special, id);
    return r.min !== r.max;
  });
  const movableBefore = ["b", "c", "d"].filter((id) => {
    const r = getStateMoveRange({ ...melted, frozen: ["b", "c", "d"], fireActive: false }, special, id);
    return r.min !== r.max;
  });
  check("L9 melted logs are movable (state-driven rule change)", movableAfter.length > 0 && movableBefore.length === 0, movableAfter.join(","));
  check("L9 melting is permanent", states.slice(fireAt).every((s) => s.frozen.length === 0 && s.fireActive));
  check("L9 frozen logs never move before the fire", states.slice(0, fireAt).every((s, i, arr) => i === 0 || ["b", "c", "d"].every((id) => axisPos(s.pieces.find((p) => p.id === id)!) === axisPos(arr[0].pieces.find((p) => p.id === id)!))));
}

// --------------------------------------------------------------- Level 10
{
  const { init, special, level } = lvl(10);
  check("L10 6x6 grid + all mechanics", !!special.bridge && !!special.key && !!special.fire && !!special.stones && special.exitRequires!.length === 2);
  const sol = solveState(init, special);
  const states = play(init, special, sol.moves);
  const last = states[states.length - 1];
  check("L10 solution activates bridge, key, gate and fire", last.bridgeOpen && last.keyCollected && last.gateUnlocked && last.fireActive);
  check("L10 solution count", sol.moves.length === level.minMoves && level.minMoves === 14);

  // exit conditions follow the real state: removing any requirement changes the answer
  const noBridgeOpen = { ...states[states.length - 2], bridgeOpen: false };
  check("L10 exit needs bridge", applyStateMove(noBridgeOpen, special, sol.moves[sol.moves.length - 1])?.completed !== true);
  const noGate = { ...states[states.length - 2], gateUnlocked: false };
  check("L10 exit needs gate", applyStateMove(noGate, special, sol.moves[sol.moves.length - 1])?.completed !== true);

  // order is not forced: collect the key *before* the bridge by exploring alternatives
  const orders = new Set<string>();
  const queue: PuzzleState[] = [init];
  const seen = new Set<string>();
  const key = (s: PuzzleState) => JSON.stringify([s.pieces.map((p) => p.x * 10 + p.y), s.bridgeOpen, s.keyCollected, s.fireActive]);
  seen.add(key(init));
  for (let head = 0; head < queue.length && head < 20000; head++) {
    const s = queue[head];
    for (const m of getAllStateMoves(s, special)) {
      const n = applyStateMove(s, special, m)!;
      const ev = [!s.bridgeOpen && n.bridgeOpen ? "B" : "", !s.keyCollected && n.keyCollected ? "K" : "", !s.fireActive && n.fireActive ? "F" : ""].join("");
      if (ev) orders.add(`${[s.bridgeOpen && "B", s.keyCollected && "K", s.fireActive && "F"].filter(Boolean).join("")}+${ev}`);
      const k = key(n);
      if (!seen.has(k)) { seen.add(k); queue.push(n); }
    }
  }
  const firstEvents = [...orders].filter((o) => o.startsWith("+")).map((o) => o.slice(1));
  check("L10 several mechanics can be triggered first (no forced order)", firstEvents.length >= 2, firstEvents.join(","));
}

// ------------------------------------------------- Undo / Reset / full state
// These drive the real session transitions used by the React hook.
for (const id of [6, 7, 8, 9, 10]) {
  const { init, special } = lvl(id);
  const sol = solveState(init, special);
  let s = createSession(init);
  const snapshots: PuzzleState[] = [init];
  for (const m of sol.moves) {
    s = sessionMove(s, special, m.id, m.to);
    snapshots.push(s.state);
  }
  check(`L${id} session plays the whole solution`, s.state.completed && s.history.length === sol.moves.length);

  // Undo every move: after each undo the *entire* state equals the earlier snapshot.
  let allEqual = true;
  for (let i = sol.moves.length - 1; i >= 0; i--) {
    s = sessionUndo(s);
    if (!eq(s.state, snapshots[i])) allEqual = false;
  }
  check(`L${id} undo restores the complete previous state at every step`, allEqual);
  check(`L${id} full undo returns to the exact initial state`, eq(s.state, init) && s.history.length === 0);

  // Each mechanic transition is reversed by exactly one Undo.
  const full = sol.moves.reduce((acc, m) => sessionMove(acc, special, m.id, m.to), createSession(init));
  for (let i = 1; i < snapshots.length; i++) {
    const a = snapshots[i - 1];
    const b = snapshots[i];
    if (a.bridgeOpen !== b.bridgeOpen || a.keyCollected !== b.keyCollected || a.fireActive !== b.fireActive) {
      let t2 = createSession(init);
      for (let k = 0; k < i; k++) t2 = sessionMove(t2, special, sol.moves[k].id, sol.moves[k].to);
      const undone = sessionUndo(t2);
      check(`L${id} undo of move ${i} reverts the switch (bridge/key/gate/fire/frozen)`,
        undone.state.bridgeOpen === a.bridgeOpen && undone.state.keyCollected === a.keyCollected &&
        undone.state.gateUnlocked === a.gateUnlocked && undone.state.fireActive === a.fireActive &&
        eq(undone.state.frozen, a.frozen));
    }
  }

  // Reset from a finished game and from mid-game restores everything.
  check(`L${id} reset after finishing restores the original state`, eq(sessionReset(full, init).state, init) && sessionReset(full, init).history.length === 0);
  const mid = sol.moves.slice(0, Math.max(1, sol.moves.length - 3)).reduce((acc, m) => sessionMove(acc, special, m.id, m.to), createSession(init));
  const resetMid = sessionReset(mid, init);
  check(`L${id} reset mid-game restores the original state`, eq(resetMid.state, init) && resetMid.state.movesLeft === init.movesLeft);
  check(`L${id} initial state object never mutated by play`, eq(init, createInitialState(levelToPieces(getLevel(id)!), special)));
}

// Invalid moves do not consume moves and never touch history.
{
  const { init, special } = lvl(8);
  let s = createSession(init);
  const illegal = sessionMove(s, special, "b", 5); // magical log, far too long a slide
  check("L8 session: invalid slide leaves state identical", illegal.state === s.state && illegal.history.length === 0);
  check("L8 session: invalid slide records a rejection reason", illegal.rejected?.id === "b");
  check("L8 session: invalid slide costs nothing", illegal.state.movesLeft === 14);
  const nudged = sessionReject(s, special, "b", 1);
  check("L8 session: blocked nudge gives feedback only", nudged.state === s.state);
  s = sessionMove(s, special, "a", 3);
  check("L8 session: valid move costs exactly one", s.state.movesLeft === 13);
  s = sessionUndo(s);
  check("L8 session: undo gives the move back", s.state.movesLeft === 14);
  s = sessionReset(sessionMove(s, special, "a", 3), init);
  check("L8 session: reset restores the full move budget", s.state.movesLeft === 14);

  // Drain the budget in the session and confirm the retry condition + hint behaviour.
  let drain = createSession(init);
  for (let i = 0; i < 40 && (drain.state.movesLeft ?? 0) > 0; i++) {
    const m = getAllStateMoves(drain.state, special).find((c) => !applyStateMove(drain.state, special, c)!.completed);
    if (!m) break;
    drain = sessionMove(drain, special, m.id, m.to);
  }
  check("L8 session: running out of moves = failed", isFailed(drain.state) && drain.state.movesLeft === 0);
  const hintFail = sessionHint(drain, special);
  check("L8 session: hint after failing reports no path", hintFail.hint === null && hintFail.hintMissing);
  const afterUndo = sessionUndo(drain);
  check("L8 session: undo from the retry screen recovers a move", !isFailed(afterUndo.state) && afterUndo.state.movesLeft === 1);
  check("L8 session: retry (reset) restores play", !isFailed(sessionReset(drain, init).state));
}

// Frozen logs refuse input at session level (and stay put).
{
  const { init, special } = lvl(9);
  const s = createSession(init);
  const tried = sessionMove(s, special, "b", 3);
  check("L9 session: frozen log refuses to move", tried.state === s.state && tried.rejected?.reason === "frozen");
  check("L9 session: frozen refusal costs no history", tried.history.length === 0);
}
// --------------------------------------------------------------------- Hints
for (const id of [1, 3, 5, 6, 7, 8, 9, 10]) {
  const { init, special, level } = lvl(id);
  let s = init;
  let steps = 0;
  while (!s.completed && steps < 60) {
    const hint = getStateHint(s, special);
    if (!hint) break;
    const n = applyStateMove(s, special, hint);
    if (!n) { check(`L${id} hint is a legal move`, false, JSON.stringify(hint)); break; }
    s = n;
    steps++;
  }
  check(`L${id} following hints completes the level in the optimum`, s.completed && steps === level.minMoves, `${steps} steps`);
}
{
  // hints also work from a mid-game / off-path position, and respect frozen logs
  const { init, special } = lvl(9);
  const first = getAllStateMoves(init, special)[0];
  const off = applyStateMove(init, special, first)!;
  const h = getStateHint(off, special);
  check("L9 hint from off-path state is legal", !!h && !!applyStateMove(off, special, h) && !init.frozen.includes(h.id) || !!h && off.fireActive);
}

// ---------------------------------------------- Mechanic ablation sanity
{
  const { init, special } = lvl(9);
  const noFire: SpecialConfig = { ...special, fire: undefined };
  const a = solveState(init, special).moves.length;
  const b = solveState(createInitialState(levelToPieces(getLevel(9)!), noFire), noFire).moves.length;
  check("L9 ice makes the level harder than without it", b < a, `${b} vs ${a}`);
}

// ------------------------------------------------ Progress / compatibility
{
  const total = LEVELS.length;
  // a save written by the original game (5 levels, only 2 fields)
  const old = JSON.stringify({ highestUnlocked: 5, best: { "1": 5, "2": 6, "3": 11, "4": 15, "5": 24 } });
  const p = parseProgress(old, total);
  check("old save: best kept", eq(p.best, { 1: 5, 2: 6, 3: 11, 4: 15, 5: 24 }));
  check("old save: all 5 completed => Level 6 unlocked", p.highestUnlocked === 6);
  check("old save: new fields default empty", eq(p.stars, {}) && eq(p.bonus, {}) && eq(p.chapters, {}));
  const old2 = parseProgress(JSON.stringify({ highestUnlocked: 3, best: { "1": 5, "2": 6 } }), total);
  check("old save: partial progress unchanged", old2.highestUnlocked === 3 && eq(old2.best, { 1: 5, 2: 6 }));
  check("garbage save falls back", parseProgress("{nope", total).highestUnlocked === 1 && parseProgress(null, total).highestUnlocked === 1);
  check("unlock never exceeds level count", parseProgress(JSON.stringify({ highestUnlocked: 99, best: {} }), total).highestUnlocked === total);
  check("out-of-range stars dropped", eq(parseProgress(JSON.stringify({ highestUnlocked: 1, best: {}, stars: { "1": 9, "2": 3 } }), total).stars, { 2: 3 }));

  // recordCompletion round-trip through a fake localStorage
  const store: Record<string, string> = {};
  const fake = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
  };
  const g = globalThis as unknown as { window?: unknown };
  g.window = { localStorage: fake, dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} };
  (globalThis as unknown as { Event: unknown }).Event = class { constructor(public type: string) {} };
  store[STORAGE_KEY] = old;
  recordCompletion(6, 12, total, { stars: 2 });
  let saved = parseProgress(store[STORAGE_KEY], total);
  check("record: Level 6 keeps Levels 1-5 intact", eq(saved.best[3], 11) && saved.best[6] === 12);
  check("record: Level 7 unlocked after Level 6", saved.highestUnlocked === 7);
  check("record: star rating saved", saved.stars[6] === 2);
  recordCompletion(6, 9, total, { stars: 3 });
  recordCompletion(6, 14, total, { stars: 1 });
  saved = parseProgress(store[STORAGE_KEY], total);
  check("record: best moves & stars keep the best result", saved.best[6] === 9 && saved.stars[6] === 3);
  recordCompletion(8, 11, total, { stars: 3, bonus: 75 });
  recordCompletion(8, 13, total, { stars: 2, bonus: 25 });
  saved = parseProgress(store[STORAGE_KEY], total);
  check("record: best bonus kept", saved.bonus[8] === 75);
  recordCompletion(10, 14, total, { stars: 3, chapterCompleted: "golden-trails" });
  saved = parseProgress(store[STORAGE_KEY], total);
  check("record: chapter completion saved", saved.chapters["golden-trails"] === true && saved.highestUnlocked === total);
  check("record: replaying keeps unlocks", saved.highestUnlocked === total);
  // persists across a "refresh" (re-parse of the stored JSON)
  const again = parseProgress(store[STORAGE_KEY], total);
  check("persistence: reload yields identical progress", eq(saved, again));
  recordCompletion(1, 9, total);
  check("record: legacy-style call (no extras) still works", parseProgress(store[STORAGE_KEY], total).best[1] === 5);
}

console.log(`\n${failed === 0 ? "ALL PASSED" : "FAILURES"}: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
