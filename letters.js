// 8x8 bitmaps for each character we need to spell "DATE 2?".
// '#' = a square that must end up occupied by a piece; '.' = empty.
// Row 0 is the top of the board (rank 8), row 7 the bottom (rank 1).

export const LETTERS = {
  D: [
    ".####...",
    ".#..#...",
    ".#...#..",
    ".#...#..",
    ".#...#..",
    ".#..#...",
    ".####...",
    "........",
  ],
  A: [
    "..##....",
    ".#..#...",
    ".#..#...",
    ".####...",
    ".#..#...",
    ".#..#...",
    ".#..#...",
    "........",
  ],
  T: [
    ".######.",
    "...#....",
    "...#....",
    "...#....",
    "...#....",
    "...#....",
    "...#....",
    "........",
  ],
  E: [
    ".####...",
    ".#......",
    ".#......",
    ".###....",
    ".#......",
    ".#......",
    ".####...",
    "........",
  ],
  "2": [
    ".###....",
    "#...#...",
    "....#...",
    "...#....",
    "..#.....",
    ".#......",
    "#####...",
    "........",
  ],
  "?": [
    ".###....",
    "#...#...",
    "....#...",
    "...#....",
    "..#.....",
    "........",
    "..#.....",
    "........",
  ],
};

// The six boards, left to right. A visual gap is rendered after index 3 (the "E").
export const MESSAGE = ["D", "A", "T", "E", "2", "?"];

// Convert a bitmap to the list of {r, c} squares that must be filled.
export function bitmapToSquares(bitmap) {
  const out = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (bitmap[r][c] === "#") out.push({ r, c });
    }
  }
  return out;
}
