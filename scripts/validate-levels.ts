import { LEVELS } from "../data/levels";
import { validateAllLevels } from "../lib/game/puzzle-validator";

const results = validateAllLevels(LEVELS);
for (const r of results) {
  const level = LEVELS.find((l) => l.id === r.levelId)!;
  console.log(
    `${r.ok ? "PASS" : "FAIL"}  Level ${r.levelId} (${level.name}, ${level.difficulty}) – BFS optimum: ${r.solutionMoves ?? "n/a"}, declared: ${level.minMoves}`,
  );
  r.errors.forEach((e) => console.log(`      ! ${e}`));
}
if (results.some((r) => !r.ok)) process.exit(1);
console.log(`\nAll ${results.length} levels are valid and solvable.`);
