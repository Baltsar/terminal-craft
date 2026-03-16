# TERMCRAFT

**Build terminal UIs in seconds. No code. No fuss. Phone-friendly.**

→ [**terminal-craft** on GitHub](https://github.com/Baltsar/terminal-craft)

TERMCRAFT is a visual builder for terminal-style interfaces. Pick blocks from the palette, tap or drag them onto the canvas, tweak text and speed—see a live 80×24 preview and copy the build as code. Works great on desktop and **on your phone**: the canvas adapts, the palette moves to the bottom on small screens, and everything stays one tap away.

---

## Why TERMCRAFT?

- **Dead simple** — Blocks, panels, spinners, progress bars, buttons, confirm dialogs. Click or tap to add; click to edit. No drag-and-drop required on mobile.
- **Mobile-first** — Layout switches automatically: palette on the left on desktop, below the preview on phones. Big touch targets, no pinch-zoom hacks.
- **Live preview** — What you build appears in a real-time terminal-style preview. Copy the build as JSON-style code and plug it into your stack.
- **Glyph playground** — Dozens of spinner and glyph animations, filterable by category. Adjust speed per block. Built for TUI lovers and hackathon projects.

---

## Run it

```bash
npm install
npm run dev
```

Open **http://localhost:5174**

---

## Build for production

```bash
npm run build
npm run preview
```

---

## Tech

- **React** + **Vite**
- **i18n**: EN, SV, ES
- **Themes**: Dark, Light, Terminal, Midnight, Amber, Paper, Mono, Solarized Light

---

## Credits

Made during the hackathon — [Nous Research](https://nousresearch.com), [Hermes Agent](https://github.com/NousResearch/Hermes).

---

## License

MIT
