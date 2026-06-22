import { pieceSVG, startPosition } from "./pieces.js";
import { LETTERS, MESSAGE, bitmapToSquares } from "./letters.js";

// The six-board "DATE 2?" finale. Call runShow() to build the boards in the
// standard position and immediately play the self-spelling animation.

const boards = [];
let started = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makePieceEl(code, r, c) {
  const el = document.createElement("div");
  el.className = "piece";
  el.style.setProperty("--r", r);
  el.style.setProperty("--c", c);
  el.innerHTML = pieceSVG(code);
  return el;
}

function buildBoards(boardsEl) {
  const start = startPosition();
  for (let i = 0; i < 6; i++) {
    const root = document.createElement("div");
    root.className = "board";
    root.dataset.index = i;

    const squares = document.createElement("div");
    squares.className = "squares";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const s = document.createElement("div");
        s.className = "square " + ((r + c) % 2 === 0 ? "light" : "dark");
        squares.appendChild(s);
      }
    }

    const pieces = document.createElement("div");
    pieces.className = "pieces";
    root.append(squares, pieces);
    boardsEl.appendChild(root);

    const grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const code = start[r][c];
        if (!code) continue;
        const el = makePieceEl(code, r, c);
        pieces.appendChild(el);
        const obj = { code, color: code[0], type: code[1], r, c, el };
        grid[r][c] = obj;
      }
    }

    boards.push({ index: i, root, squares, pieces, grid });

    // Visual space between "E" (index 3) and "2" (index 4).
    if (i === 3) {
      const gap = document.createElement("div");
      gap.className = "gap";
      boardsEl.appendChild(gap);
    }
  }
}

// Assign each target square of a letter to the nearest available piece, then
// split the work into a white queue and a black queue. Forms (a piece gliding
// to a letter square) and clears (an unused piece sliding off) are interleaved
// so the letter assembles while the leftovers melt away.
function buildPlan(board, ch) {
  const targets = bitmapToSquares(LETTERS[ch]);
  const pieces = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) if (board.grid[r][c]) pieces.push(board.grid[r][c]);

  const pairs = [];
  for (let ti = 0; ti < targets.length; ti++) {
    for (let pi = 0; pi < pieces.length; pi++) {
      const dr = targets[ti].r - pieces[pi].r;
      const dc = targets[ti].c - pieces[pi].c;
      pairs.push({ d: dr * dr + dc * dc, ti, pi });
    }
  }
  pairs.sort((a, b) => a.d - b.d);

  const tUsed = Array(targets.length).fill(false);
  const pUsed = Array(pieces.length).fill(false);
  const assign = Array(targets.length).fill(null);
  let n = 0;
  for (const pr of pairs) {
    if (n === targets.length) break;
    if (tUsed[pr.ti] || pUsed[pr.pi]) continue;
    tUsed[pr.ti] = true;
    pUsed[pr.pi] = true;
    assign[pr.ti] = pieces[pr.pi];
    n++;
  }

  const forms = [];
  for (let ti = 0; ti < targets.length; ti++) {
    if (assign[ti]) forms.push({ type: "move", piece: assign[ti], tr: targets[ti].r, tc: targets[ti].c });
  }
  forms.sort((a, b) => a.tr - b.tr || a.tc - b.tc); // assemble top to bottom

  const clears = [];
  for (let pi = 0; pi < pieces.length; pi++) {
    if (!pUsed[pi]) clears.push({ type: "clear", piece: pieces[pi] });
  }

  const white = [];
  const black = [];
  for (const a of interleave(forms, clears)) {
    (a.piece.color === "w" ? white : black).push(a);
  }
  return { white, black };
}

function interleave(a, b) {
  const out = [];
  for (let i = 0, j = 0; i < a.length || j < b.length; ) {
    if (i < a.length) out.push(a[i++]);
    if (j < b.length) out.push(b[j++]);
  }
  return out;
}

function applyAction(action) {
  if (action.type === "clear") {
    animateClear(null, action.piece);
    return;
  }
  const p = action.piece;
  p.r = action.tr;
  p.c = action.tc;
  p.el.style.setProperty("--r", action.tr);
  p.el.style.setProperty("--c", action.tc);
}

function animateClear(board, p) {
  if (board && board.grid[p.r] && board.grid[p.r][p.c] === p) board.grid[p.r][p.c] = null;
  p.el.classList.add("captured");
  p.el.style.setProperty("--c", p.c < 4 ? -2.5 : 10.5); // slide off the nearer side
  setTimeout(() => p.el.remove(), 520);
}

async function playSpell() {
  const plans = boards.map((b, i) => buildPlan(b, MESSAGE[i]));
  const STAGGER = 2; // beats each board lags behind the one to its left
  const BEAT = 240; // ms per half-move

  let beat = 0;
  while (plans.some((p) => p.white.length || p.black.length)) {
    const white = beat % 2 === 0;
    for (let i = 0; i < plans.length; i++) {
      if (beat < i * STAGGER) continue; // left-to-right wave
      const queue = white ? plans[i].white : plans[i].black;
      if (queue.length) applyAction(queue.shift());
    }
    await sleep(BEAT);
    beat++;
  }

  lightUpLetters();
  document.body.classList.add("done"); // reveals the action buttons (see CSS)
}

// Collapse each board's checkerboard into its letter: light the occupied
// squares, send the rest into the background.
function lightUpLetters() {
  boards.forEach((b, i) => {
    const lit = new Set(bitmapToSquares(LETTERS[MESSAGE[i]]).map((s) => s.r * 8 + s.c));
    const squares = b.squares.children;
    for (let idx = 0; idx < squares.length; idx++) {
      squares[idx].classList.add(lit.has(idx) ? "lit" : "off");
    }
  });
}

export function runShow() {
  if (started) return;
  started = true;
  buildBoards(document.getElementById("boards"));
  // Let the boards paint in their start position for a beat before they animate.
  setTimeout(() => playSpell(), 500);
}
