// Chess piece vectors, adapted from the open-license "Cburnett" set
// (Wikimedia Commons, multi-licensed BSD / GFDL / GPL). Drawn on a 45x45 grid.
// One source of truth per piece type; colored per side via the theme passed in.

const WHITE = { F: "#f4f4f4", O: "#2b2b2b", L: "#2b2b2b" }; // fill / outline / detail-line
const BLACK = { F: "#2b2b2b", O: "#0a0a0a", L: "#d8d8d8" };

const SHAPES = {
  P: ({ F, O }) => `
    <path d="M22.5,9 C20.29,9 18.5,10.79 18.5,13 C18.5,13.89 18.79,14.71 19.28,15.38 C17.33,16.5 16,18.59 16,21 C16,23.03 16.94,24.84 18.41,26.03 C15.41,27.09 11,31.58 11,39.5 L34,39.5 C34,31.58 29.59,27.09 26.59,26.03 C28.06,24.84 29,23.03 29,21 C29,18.59 27.67,16.5 25.72,15.38 C26.21,14.71 26.5,13.89 26.5,13 C26.5,10.79 24.71,9 22.5,9 z"
      fill="${F}" stroke="${O}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,

  R: ({ F, O, L }) => `
    <g fill="${F}" stroke="${O}" stroke-width="1.6" stroke-linejoin="round" fill-rule="evenodd">
      <path d="M9,39 L36,39 L36,36 L9,36 z" stroke-linecap="butt"/>
      <path d="M12,36 L12,32 L33,32 L33,36 z" stroke-linecap="butt"/>
      <path d="M11,14 L11,9 L15,9 L15,11 L20,11 L20,9 L25,9 L25,11 L30,11 L30,9 L34,9 L34,14 z" stroke-linecap="butt"/>
      <path d="M34,14 L31,17 L14,17 L11,14 z"/>
      <path d="M31,17 L31,29.5 L14,29.5 L14,17 z" stroke-linecap="butt" stroke-linejoin="miter"/>
      <path d="M31,29.5 L32.5,32 L12.5,32 L14,29.5 z"/>
      <path d="M11,14 L34,14" fill="none" stroke="${L}" stroke-linejoin="miter"/>
    </g>`,

  N: ({ F, O, L }) => `
    <g stroke="${O}" stroke-width="1.6" stroke-linejoin="round">
      <path d="M22,10 C32.5,11 38.5,18 38,39 L15,39 C15,30 25,32.5 23,18" fill="${F}"/>
      <path d="M24,18 C24.38,20.91 18.45,25.37 16,27 C13,29 13.18,31.34 11,31 C9.96,30.06 12.41,27.96 11,28 C10,28 11.19,29.23 10,30 C9,30 6,31 6,26 C6,24 12,14 12,14 C12,14 13.89,12.1 14,10.5 C13.27,9.51 13.5,8.5 13.5,7.5 C14.5,6.5 16.5,10 16.5,10 L18.5,10 C18.5,10 19.28,8.01 21,7 C22,7 22,10 22,10" fill="${F}"/>
      <path d="M9.5,25.5 A0.5,0.5 0 1,1 8.5,25.5 A0.5,0.5 0 1,1 9.5,25.5 z" fill="${L}" stroke="${L}"/>
      <path d="M15,15.5 A0.5,1.5 0 1,1 14,15.5 A0.5,1.5 0 1,1 15,15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="${L}" stroke="${L}"/>
    </g>`,

  B: ({ F, O, L }) => `
    <g fill="none" stroke="${O}" stroke-width="1.6" stroke-linejoin="round">
      <g fill="${F}" stroke-linecap="butt">
        <path d="M9,36 C12.39,35.03 19.11,36.43 22.5,34 C25.89,36.43 32.61,35.03 36,36 C36,36 37.65,36.54 39,38 C38.32,38.97 37.35,38.99 36,38.5 C32.61,37.53 25.89,38.96 22.5,37.5 C19.11,38.96 12.39,37.53 9,38.5 C7.65,38.99 6.68,38.97 6,38 C7.35,36.54 9,36 9,36 z"/>
        <path d="M15,32 C17.5,34.5 27.5,34.5 30,32 C30.5,30.5 30,30 30,30 C30,27.5 27.5,26 27.5,26 C33,24.5 33.5,14.5 22.5,10.5 C11.5,14.5 12,24.5 17.5,26 C17.5,26 15,27.5 15,30 C15,30 14.5,30.5 15,32 z"/>
        <path d="M25,8 A2.5,2.5 0 1,1 20,8 A2.5,2.5 0 1,1 25,8 z"/>
      </g>
      <path d="M17.5,26 L27.5,26 M15,30 L30,30 M22.5,15.5 L22.5,20.5 M20,18 L25,18" stroke="${L}" stroke-linejoin="miter"/>
    </g>`,

  Q: ({ F, O, L }) => `
    <g fill="${F}" stroke="${O}" stroke-width="1.6" stroke-linejoin="round">
      <path d="M9,26 C17.5,24.5 30,24.5 36,26 L38.5,13.5 L31,25 L30.7,10.9 L25.5,24.5 L22.5,10 L19.5,24.5 L14.3,10.9 L14,25 L6.5,13.5 L9,26 z"/>
      <path d="M9,26 C9,28 10.5,28 11.5,30 C12.5,31.5 12.5,31 12,33.5 C10.5,34.5 11,36 11,36 C9.5,37.5 11,38.5 11,38.5 C17.5,39.5 27.5,39.5 34,38.5 C34,38.5 35.5,37.5 34,36 C34,36 34.5,34.5 33,33.5 C32.5,31 32.5,31.5 33.5,30 C34.5,28 36,28 36,26 C27.5,24.5 17.5,24.5 9,26 z"/>
      <circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="8" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/>
      <path d="M11,38.5 C17.5,40.5 27.5,40.5 34,38.5" fill="none" stroke="${L}"/>
    </g>`,

  K: ({ F, O, L }) => `
    <g fill="none" stroke="${O}" stroke-width="1.6" stroke-linejoin="round">
      <path d="M22.5,11.63 L22.5,6 M20,8 L25,8" stroke-linecap="round"/>
      <path d="M22.5,25 C22.5,25 27,17.5 25.5,14.5 C25.5,14.5 24.5,12 22.5,12 C20.5,12 19.5,14.5 19.5,14.5 C18,17.5 22.5,25 22.5,25" fill="${F}" stroke-linecap="butt"/>
      <path d="M11.5,37 C17,40.5 27,40.5 32.5,37 L32.5,30 C32.5,30 41.5,25.5 38.5,19.5 C34.5,13 25,16 22.5,23.5 L22.5,27 L22.5,23.5 C19,16 9.5,13 6.5,19.5 C3.5,25.5 11.5,29.5 11.5,29.5 L11.5,37 z" fill="${F}"/>
      <path d="M11.5,30 C17,27 27,27 32.5,30 M11.5,33.5 C17,30.5 27,30.5 32.5,33.5 M11.5,37 C17,34 27,34 32.5,37" stroke="${L}"/>
    </g>`,
};

// code is like "wP", "bK": [color][type]
export function pieceSVG(code) {
  const theme = code[0] === "w" ? WHITE : BLACK;
  const type = code[1];
  return `<svg class="piece-svg" viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">${SHAPES[type](theme)}</svg>`;
}

const BACK_RANK = ["R", "N", "B", "Q", "K", "B", "N", "R"];

// Standard chess starting position as an 8x8 array of codes (or null).
export function startPosition() {
  const grid = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let c = 0; c < 8; c++) {
    grid[0][c] = "b" + BACK_RANK[c]; // black back rank (top)
    grid[1][c] = "bP";
    grid[6][c] = "wP";
    grid[7][c] = "w" + BACK_RANK[c]; // white back rank (bottom)
  }
  return grid;
}
