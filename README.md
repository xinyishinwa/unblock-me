# Amulung: Pot of Gold

*Clear the logs. Find your fortune!*

A browser-based sliding block puzzle (Unblock Me style) set in the countryside of Amulung, Cagayan. Slide the wooden logs out of the way and roll the golden Pot of Gold off the right side of the 6×6 board.

Built with Next.js (App Router), TypeScript, React, Tailwind CSS and Lucide icons. No backend; progress is saved in `localStorage`.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run validate-levels   # BFS-verify every level is solvable and minMoves is optimal
```

## Controls

- Mouse / touch: drag a log along its length.
- Keyboard: click or Tab to select a log, then use the arrow keys.
- Undo, Reset, Hint, and Pause/Back buttons on the game screen.

## Structure

| Path | Purpose |
| --- | --- |
| `data/levels.ts` | The five level configurations (id, name, difficulty, pot position, logs, `minMoves`) |
| `lib/game/puzzle-engine.ts` | Pure movement/collision rules |
| `lib/game/puzzle-solver.ts` | BFS solver, used for hints and validation |
| `lib/game/puzzle-validator.ts` | Level layout + solvability validation |
| `lib/game/game-storage.ts` | localStorage progress |
| `lib/game/use-game.ts`, `use-progress.ts` | React hooks (game session, progress) |
| `components/game/` | Board, logs, pot, controls, level card, win screen, menu |
| `components/scenery/` | SVG countryside backdrop |
| `app/` | `/` menu, `/levels`, `/game?level=N` |

## Levels

| # | Name | Difficulty | Optimal moves |
| --- | --- | --- | --- |
| 1 | The Village Trail | Easy | 5 |
| 2 | The Rice Field | Easy | 6 |
| 3 | The River Crossing | Medium | 11 |
| 4 | The Mountain Path | Medium | 15 |
| 5 | The Treasure Route | Hard | 24 |

A "move" is one slide of one log by any distance. Optimal counts come from BFS (`npm run validate-levels`).
