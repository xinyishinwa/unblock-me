import type { LevelConfig } from "./levels";

const h = "horizontal" as const;
const v = "vertical" as const;

/**
 * GOLDEN TRAILS chapter (levels 6–10).
 *
 * Every layout below was found with the state-based BFS solver and is
 * re-verified by `npm run validate-levels` (solvable, `minMoves` optimal,
 * every configured mechanic is actually used by the optimal solution).
 *
 * Cell coordinates are `[x, y]` = [column, row]; the exit row is y = 2.
 */
export const GOLDEN_TRAILS_LEVELS: LevelConfig[] = [
  {
    id: 6,
    name: "The River Crossing",
    difficulty: "Medium",
    blurb: "Float the switch log across the shallows to lower the bridge.",
    chapter: "golden-trails",
    theme: "river",
    mechanic: "bridge",
    mechanicLabel: "Bridge Switch",
    pot: { x: 0, y: 2 },
    logs: [
      { id: "a", x: 0, y: 5, length: 2, orientation: h },
      { id: "b", x: 4, y: 4, length: 2, orientation: v },
      { id: "c", x: 3, y: 0, length: 3, orientation: v },
      { id: "d", x: 2, y: 2, length: 3, orientation: v },
      { id: "e", x: 0, y: 3, length: 2, orientation: v },
      { id: "f", x: 3, y: 3, length: 2, orientation: h },
    ],
    special: {
      bridge: { cells: [[4, 2], [5, 2]], trigger: { logId: "a", cell: [5, 5] } },
      shallows: [[4, 5], [5, 5], [5, 4], [5, 3], [4, 3], [5, 1], [5, 0], [4, 0]],
      exitRequires: ["bridge"],
    },
    tutorial: {
      title: "The Bridge Switch",
      steps: [
        "A deep river blocks the exit. The bridge starts raised (closed).",
        "Slide the marked switch log until it covers the glowing lever pad in the shallows.",
        "The bridge lowers and the exit route opens. Then roll the Pot of Gold across!",
      ],
    },
    minMoves: 9,
    stars: { three: 10, two: 13 },
  },
  {
    id: 7,
    name: "The Golden Key",
    difficulty: "Medium",
    blurb: "Fetch the key and unlock the old countryside treasure gate.",
    chapter: "golden-trails",
    theme: "treasure-gate",
    mechanic: "key",
    mechanicLabel: "Key & Gate",
    pot: { x: 0, y: 2 },
    logs: [
      { id: "a", x: 0, y: 3, length: 3, orientation: v },
      { id: "b", x: 3, y: 4, length: 2, orientation: v },
      { id: "c", x: 4, y: 0, length: 2, orientation: v },
      { id: "d", x: 2, y: 1, length: 2, orientation: h },
      { id: "e", x: 0, y: 1, length: 2, orientation: h },
      { id: "f", x: 4, y: 4, length: 2, orientation: h },
      { id: "g", x: 2, y: 4, length: 2, orientation: v },
    ],
    special: {
      key: { trigger: { logId: "a", cell: [0, 0] }, gate: [[5, 2]] },
      exitRequires: ["gate"],
    },
    tutorial: {
      title: "The Golden Key",
      steps: [
        "The exit is sealed by a locked gate.",
        "Slide the key-carrying log into the glowing collection area to pick up the Golden Key.",
        "The gate unlocks. Now the Pot of Gold can leave!",
      ],
    },
    minMoves: 10,
    stars: { three: 11, two: 14 },
  },
  {
    id: 8,
    name: "The Golden Curse",
    difficulty: "Hard",
    blurb: "An enchanted forest. Solve it before the curse runs out your moves.",
    chapter: "golden-trails",
    theme: "enchanted",
    mechanic: "limited-moves",
    mechanicLabel: "Limited Moves",
    pot: { x: 0, y: 2 },
    logs: [
      { id: "a", x: 5, y: 0, length: 3, orientation: v },
      { id: "b", x: 2, y: 5, length: 3, orientation: h },
      { id: "c", x: 0, y: 3, length: 3, orientation: h },
      { id: "d", x: 2, y: 1, length: 2, orientation: v },
      { id: "e", x: 0, y: 4, length: 2, orientation: v },
      { id: "f", x: 3, y: 1, length: 3, orientation: v },
    ],
    special: {
      stones: [[2, 4], [4, 1], [1, 0]],
      magical: { b: { maxStep: 1 } },
      moveLimit: 14,
    },
    tutorial: {
      title: "The Golden Curse",
      steps: [
        "You only have a limited number of moves. Watch the counter!",
        "Grey stones never move. The glowing purple magical log can only slide one cell at a time.",
        "Only valid slides cost a move. Undo gives one back. Run out and the curse wins.",
      ],
    },
    minMoves: 11,
    stars: { three: 12, two: 13 },
  },
  {
    id: 9,
    name: "The Frozen Forest",
    difficulty: "Hard",
    blurb: "Light the magical fire to melt the ice-locked logs.",
    chapter: "golden-trails",
    theme: "frozen",
    mechanic: "frozen",
    mechanicLabel: "Frozen Logs & Fire",
    pot: { x: 0, y: 2 },
    logs: [
      { id: "a", x: 5, y: 3, length: 2, orientation: v },
      { id: "b", x: 0, y: 5, length: 2, orientation: h },
      { id: "c", x: 4, y: 0, length: 3, orientation: v },
      { id: "d", x: 2, y: 1, length: 2, orientation: v },
      { id: "e", x: 2, y: 4, length: 3, orientation: h },
      { id: "f", x: 3, y: 1, length: 2, orientation: v },
      { id: "g", x: 0, y: 0, length: 3, orientation: h },
      { id: "h", x: 0, y: 3, length: 2, orientation: v },
    ],
    special: {
      fire: { trigger: { logId: "a", cell: [5, 0] }, frozen: ["b", "c", "d"] },
    },
    tutorial: {
      title: "Frozen Logs & the Fire Switch",
      steps: [
        "Icy logs are frozen solid. They cannot move at first.",
        "Slide the fire-bearing log onto the glowing fire pad to light the magical fire.",
        "The ice melts and every frozen log becomes movable. Clear the path to the gold!",
      ],
    },
    minMoves: 11,
    stars: { three: 12, two: 15 },
  },
  {
    id: 10,
    name: "The Final Treasure",
    difficulty: "Expert",
    blurb: "Bridge, key, fire and stone — the legendary hidden treasure awaits.",
    chapter: "golden-trails",
    theme: "cagayan",
    mechanic: "combo",
    mechanicLabel: "Combination Challenge",
    pot: { x: 0, y: 2 },
    logs: [
      { id: "a", x: 1, y: 5, length: 2, orientation: h },
      { id: "b", x: 3, y: 0, length: 2, orientation: h },
      { id: "c", x: 0, y: 3, length: 2, orientation: v },
      { id: "d", x: 3, y: 3, length: 2, orientation: h },
      { id: "e", x: 1, y: 4, length: 2, orientation: h },
      { id: "f", x: 4, y: 1, length: 2, orientation: v },
      { id: "g", x: 1, y: 0, length: 2, orientation: v },
      { id: "h", x: 2, y: 1, length: 2, orientation: v },
    ],
    special: {
      stones: [[2, 3], [3, 5]],
      bridge: { cells: [[3, 2]], trigger: { logId: "a", cell: [0, 5] } },
      key: { trigger: { logId: "b", cell: [5, 0] }, gate: [[5, 2]] },
      fire: { trigger: { logId: "c", cell: [0, 0] }, frozen: ["d", "e"] },
      exitRequires: ["bridge", "gate"],
    },
    tutorial: {
      title: "The Final Treasure",
      steps: [
        "Every trick you learned is here: bridge switch, golden key, fire switch and stones.",
        "Each switch log has its own pad. Open the bridge, fetch the key, light the fire.",
        "There is no fixed order — plan your own route to the legendary Pot of Gold!",
      ],
    },
    minMoves: 14,
    stars: { three: 15, two: 19 },
  },
];
