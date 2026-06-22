# catalinachess

A little chess-themed surprise. Play a quick game against an AI that's
(secretly) trying to lose — once you win, the boards come alive and spell out a
message across six boards.

## Run locally

It's a dependency-free static site, so any static file server works:

```bash
python3 -m http.server 8123
```

Then open http://localhost:8123.

## Layout

| File | Purpose |
|------|---------|
| `index.html` / `styles.css` | Page structure and styling |
| `main.js` | Orchestrates the screens (game → finale → itinerary) |
| `game.js` | The playable board and the self-losing AI |
| `show.js` | The six-board "spell it out" animation |
| `letters.js` | 8×8 bitmaps for each character |
| `pieces.js` | Inline SVG chess pieces + start position |
| `vendor/chess.js` | [chess.js](https://github.com/jhlywa/chess.js) for move legality (MIT) |
