import { LEVELS } from "../data/levels";
import { validateAllLevels } from "../lib/game/puzzle-validator";

const results = validateAllLevels(LEVELS);
for (const r of results) {
  const level = LEVELS.find((l) => l.id === r.levelId)!;
  const mech = r.mechanicsUsed.length ? ` [${r.mechanicsUsed.join(", ")}]` : "";
  console.log(
    `${r.ok ? "PASS" : "FAIL"}  Level ${r.levelId} (${level.name}, ${level.difficulty}) – BFS optimum: ${r.solutionMoves ?? "n/a"}, declared: ${level.minMoves}, states explored: ${r.explored}${mech}`,
  );
  r.errors.forEach((e) => console.log(`      ! ${e}`));
}
if (results.some((r) => !r.ok)) process.exit(1);
console.log(`\nAll ${results.length} levels are valid and solvable.`);
