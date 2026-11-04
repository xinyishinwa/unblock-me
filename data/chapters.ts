export interface ChapterDef {
  id: string;
  name: string;
  tagline: string;
  levelIds: number[];
}

/** Level groups shown on the level-selection screen. */
export const CHAPTERS: ChapterDef[] = [
  {
    id: "amulung",
    name: "Amulung Countryside",
    tagline: "The original five trails",
    levelIds: [1, 2, 3, 4, 5],
  },
  {
    id: "golden-trails",
    name: "Golden Trails",
    tagline: "Bridges, keys, curses and ice — levels 6 to 10",
    levelIds: [6, 7, 8, 9, 10],
  },
];

export const GOLDEN_TRAILS = CHAPTERS[1];
export const FINAL_LEVEL_ID = GOLDEN_TRAILS.levelIds[GOLDEN_TRAILS.levelIds.length - 1];
