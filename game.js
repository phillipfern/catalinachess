import { pieceSVG } from "./pieces.js";
import { Chess } from "./vendor/chess.js";

// A single playable board. The human is White; Black is an AI that actively
// tries to LOSE. When White wins (checkmate, or Black resigns once hopeless),
// onWin() fires.

// --- The self-sabotaging Black AI ------------------------------------------

const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

// Evaluate from White's point of view: higher = better for White = closer to
// Black's goal of losing. Material plus a nudge for Black's king wandering out.
function evalForWhite(game) {
  const board = game.board();
  let score = 0;
  let bk = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = board[r][c];
      if (!cell) continue;
      score += cell.color === "w" ? VALUE[cell.type] : -VALUE[cell.type];
      if (cell.color === "b" && cell.type === "k") bk = { r, c };
    }
  }
  if (!bk) return score;

  // Bring the king up off the back rank into the open.
  score += 2.5 * bk.r;

  // Clear the pawns directly in front of the king so it has a way out, weighting
  // its own file most (that's the straight-ahead escape).
  for (const [f, w] of [[bk.c - 1, 1.5], [bk.c, 2.5], [bk.c + 1, 1.5]]) {
    if (f < 0 || f > 7) continue;
    const cell = board[1][f];
    if (!(cell && cell.color === "b" && cell.type === "p")) score += w; // pawn is gone
  }

  return score;
}

// The black king is "out" once it has left the back two ranks (reached rank 6
// or beyond). After that we stop walking it around.
function blackKing(game) {
  const board = game.board();
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const x = board[r][c];
      if (x && x.color === "b" && x.type === "k") return { r, c };
    }
  return null;
}

// Depth-2 search: pick the Black move that lets White be best off afterwards
// (so Black bares its king), preferring lines where White has an immediate mate.
function chooseLosingMove(game) {
  const root = new Chess(game.fen());
  let moves = root.moves({ verbose: true });

  // 1. Never capture White's pieces — keep your whole army for the mate. (Only
  //    relent if literally every legal move is a capture.)
  const quiet = moves.filter((m) => !m.captured);
  if (quiet.length) moves = quiet;

  // 2. Once the king is out in the open, STOP moving it — a running king is hard
  //    to checkmate. Shuffle pawns (or any non-king piece) instead and leave the
  //    king sitting there as an easy target. Only move it when forced (in check).
  const bk = blackKing(root);
  if (bk && bk.r >= 2 && !root.inCheck()) {
    const pawns = moves.filter((m) => m.piece === "p");
    const nonKing = moves.filter((m) => m.piece !== "k");
    if (pawns.length) moves = pawns;
    else if (nonKing.length) moves = nonKing;
  }

  let best = null;
  let bestScore = -Infinity;
  let bestMate = 99;

  for (const m of moves) {
    root.move({ from: m.from, to: m.to, promotion: m.promotion });
    let score;
    let mate = 99;

    if (root.isCheckmate()) {
      score = -100000; // Black just mated White — the opposite of the goal
    } else if (root.isStalemate() || root.isDraw()) {
      score = -1000; // a draw doesn't let White win, so avoid it
    } else {
      let whiteBest = -Infinity;
      for (const wm of root.moves({ verbose: true })) {
        root.move({ from: wm.from, to: wm.to, promotion: wm.promotion });
        let s;
        if (root.isCheckmate()) {
          s = 100000;
          mate = 1;
        } else if (root.isStalemate() || root.isDraw()) {
          s = -1000;
        } else {
          s = evalForWhite(root);
        }
        if (s > whiteBest) whiteBest = s;
        root.undo();
      }
      score = whiteBest;
    }

    root.undo();

    if (score > bestScore || (score === bestScore && mate < bestMate)) {
      bestScore = score;
      bestMate = mate;
      best = m;
    }
  }
  return best;
}

// Optional: a fixed line for Black, played when legal, else the heuristic above
// takes over. Drop SAN strings here (Black's 1st move, 2nd move, ...) to script
// the loss, e.g. ["e5", "Qh4", "Bc5"].
const SCRIPT = [];

// --- The board -------------------------------------------------------------

export function createGame({ mount, titleEl, statusEl, onWin }) {
  const chess = new Chess();

  const squares = document.createElement("div");
  squares.className = "squares";
  const sqEls = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const s = document.createElement("div");
      s.className = "square " + ((r + c) % 2 === 0 ? "light" : "dark");
      squares.appendChild(s);
      sqEls.push(s);
    }
  }
  const piecesLayer = document.createElement("div");
  piecesLayer.className = "pieces";
  mount.append(squares, piecesLayer);

  const rc = (square) => ({ r: 8 - parseInt(square[1], 10), c: square.charCodeAt(0) - 97 });
  const sq = (r, c) => String.fromCharCode(97 + c) + (8 - r);

  const pieceAt = new Map(); // algebraic square -> piece element

  function addPiece(square, cell) {
    const code = cell.color + cell.type.toUpperCase();
    const { r, c } = rc(square);
    const el = document.createElement("div");
    el.className = "piece";
    el.style.setProperty("--r", r);
    el.style.setProperty("--c", c);
    el.innerHTML = pieceSVG(code);
    el.dataset.square = square;
    piecesLayer.appendChild(el);
    pieceAt.set(square, el);
  }

  function render() {
    piecesLayer.innerHTML = "";
    pieceAt.clear();
    const board = chess.board();
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) if (board[r][c]) addPiece(sq(r, c), board[r][c]);
  }

  function movePieceEl(from, to) {
    const el = pieceAt.get(from);
    if (!el) return;
    const { r, c } = rc(to);
    el.style.setProperty("--r", r);
    el.style.setProperty("--c", c);
    el.dataset.square = to;
    pieceAt.delete(from);
    pieceAt.set(to, el);
  }

  function removePieceEl(square) {
    const el = pieceAt.get(square);
    if (!el) return;
    pieceAt.delete(square);
    el.classList.add("captured");
    setTimeout(() => el.remove(), 420);
  }

  // Reflect a chess.js move object in the DOM (capture, en passant, castle, promo).
  function applyMove(m) {
    if (m.flags.includes("e")) removePieceEl(m.to[0] + m.from[1]);
    else if (m.captured) removePieceEl(m.to);

    movePieceEl(m.from, m.to);

    if (m.flags.includes("k")) movePieceEl("h" + m.from[1], "f" + m.from[1]);
    if (m.flags.includes("q")) movePieceEl("a" + m.from[1], "d" + m.from[1]);

    if (m.promotion) {
      const el = pieceAt.get(m.to);
      if (el) el.innerHTML = pieceSVG(m.color + m.promotion.toUpperCase());
    }
  }

  // --- interaction (White only) ---

  let drag = null;
  let locked = false;
  let won = false;
  let blackPly = 0;

  function clearHints() {
    sqEls.forEach((s) => s.classList.remove("target", "capture", "origin"));
  }

  function showHints(square) {
    for (const m of chess.moves({ square, verbose: true })) {
      const { r, c } = rc(m.to);
      sqEls[r * 8 + c].classList.add(m.captured ? "capture" : "target");
    }
    const o = rc(square);
    sqEls[o.r * 8 + o.c].classList.add("origin");
  }

  piecesLayer.addEventListener("pointerdown", (e) => {
    if (locked || won || chess.isGameOver() || chess.turn() !== "w") return;
    const el = e.target.closest(".piece");
    if (!el) return;
    const square = el.dataset.square;
    const piece = chess.get(square);
    if (!piece || piece.color !== "w") return;
    const rect = mount.getBoundingClientRect();
    drag = { el, square, rect, cell: rect.width / 8 };
    el.classList.add("dragging");
    try {
      el.setPointerCapture(e.pointerId);
    } catch (_) {}
    showHints(square);
    e.preventDefault();
  });

  piecesLayer.addEventListener("pointermove", (e) => {
    if (!drag) return;
    drag.el.style.setProperty("--c", (e.clientX - drag.rect.left - drag.cell / 2) / drag.cell);
    drag.el.style.setProperty("--r", (e.clientY - drag.rect.top - drag.cell / 2) / drag.cell);
  });

  function snapBack() {
    if (!drag) return;
    const { r, c } = rc(drag.square);
    drag.el.style.setProperty("--r", r);
    drag.el.style.setProperty("--c", c);
  }

  piecesLayer.addEventListener("pointerup", (e) => {
    if (!drag) return;
    const { square, rect, cell } = drag;
    drag.el.classList.remove("dragging");
    const c = Math.max(0, Math.min(7, Math.floor((e.clientX - rect.left) / cell)));
    const r = Math.max(0, Math.min(7, Math.floor((e.clientY - rect.top) / cell)));
    const target = sq(r, c);
    clearHints();

    let move = null;
    if (target !== square) {
      try {
        move = chess.move({ from: square, to: target, promotion: "q" });
      } catch (_) {
        move = null;
      }
    }
    if (move) {
      applyMove(move);
      drag = null;
      afterHumanMove();
    } else {
      snapBack();
      drag = null;
    }
  });

  piecesLayer.addEventListener("pointercancel", () => {
    if (!drag) return;
    drag.el.classList.remove("dragging");
    snapBack();
    clearHints();
    drag = null;
  });

  function afterHumanMove() {
    setStatus();
    if (handleEnd()) return;
    locked = true;
    setTimeout(aiMove, 520);
  }

  function aiMove() {
    if (chess.isGameOver()) {
      locked = false;
      return;
    }
    const m = scriptedMove() || chooseLosingMove(chess);
    if (!m) {
      locked = false;
      return;
    }
    const made = chess.move({ from: m.from, to: m.to, promotion: m.promotion });
    applyMove(made);
    blackPly++;
    setStatus();
    locked = false;
    handleEnd();
  }

  function scriptedMove() {
    const san = SCRIPT[blackPly];
    if (!san) return null;
    for (const m of chess.moves({ verbose: true })) {
      if (m.san === san) return m;
    }
    return null; // scripted move illegal in this position — fall back to heuristic
  }

  function handleEnd() {
    if (chess.isCheckmate()) {
      if (chess.turn() === "b") {
        win();
      } else {
        statusEl.textContent = "Black blundered into a win — resetting…";
        setTimeout(reset, 1600);
      }
      return true;
    }
    if (chess.isStalemate() || chess.isDraw()) {
      statusEl.textContent = "A draw?! Let's run that back…";
      setTimeout(reset, 1600);
      return true;
    }
    return false;
  }

  function win() {
    if (won) return;
    won = true;
    locked = true;
    if (onWin) onWin();
  }

  function reset() {
    chess.reset();
    render();
    won = false;
    locked = false;
    blackPly = 0;
    if (titleEl) titleEl.textContent = "Quick game of chess?";
    setStatus();
  }

  function setStatus() {
    if (!statusEl) return;
    if (chess.isCheckmate()) statusEl.textContent = chess.turn() === "b" ? "Checkmate — you win!" : "Checkmate.";
    else if (chess.isStalemate()) statusEl.textContent = "Stalemate.";
    else if (chess.inCheck()) statusEl.textContent = chess.turn() === "w" ? "You're in check." : "Check!";
    else statusEl.textContent = chess.turn() === "w" ? "Your move — you're White." : "Black is thinking…";
  }

  render();
  setStatus();
  return { reset };
}
