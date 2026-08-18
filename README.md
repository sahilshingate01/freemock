# Freemock

Free, in-browser 3D device mockups built by **Sahil Shingate**. Drop a screenshot onto a phone or laptop, light the studio, keyframe a camera move, and export a still or a short video.

**Inspired by [Ultramock](https://www.ultramock.io/)** — a polished commercial mockup editor by Josh Millgate. Freemock is an independent, from-scratch implementation of that *idea*: turn product screens into cinematic device shots. It is **not** a fork, **not** affiliated with Ultramock, and **does not** include Ultramock source code, trademarks, or proprietary assets.

## Inspiration vs this codebase

| | Ultramock | Freemock |
| --- | --- | --- |
| Product | Commercial Next.js app | Open-source MIT editor |
| Stack | Next.js (proprietary app) | TanStack Start, React 19, Vite, Tailwind |
| 3D | Closed application code | React Three Fiber + drei + Three.js, written here |
| State | Their store | Zustand persist in [`src/lib/store.ts`](src/lib/store.ts) |
| Devices | Their packed GLBs / finishes | Original procedural meshes in [`src/components/editor/devices.tsx`](src/components/editor/devices.tsx) |
| Paywall | Upgrade / capture limits | Every feature is free |

What we *did* take from the public product is the **brief**: glass toolbar, 280px inspector, timeline shots, labels like Fill / Finish / Tilt / FOV, and the studio-grey look. Those were reimplemented against that public UI, not copied from their JavaScript bundles.

What we **did not** copy:

- Ultramock application source, webpack chunks, or origin-lock
- Their device GLBs, finish textures, or brand icon
- Their name, logo, or “Ultramock” trademark

If you want the original product, use [ultramock.io](https://www.ultramock.io/).

## Features

- Device mockups (iPhone, MacBook, iPad, Watch) as original procedural models
- Drag / paste / upload a screen onto the display
- Fill, finish, lights, camera (tilt, FOV, zoom, pan, roll, rotate, blur)
- Templates that generate a keyframed camera scene
- Timeline playhead, record keyframes (K), space to play
- Export PNG still or WebM/MP4 footage from the canvas

## Stack

- [TanStack Start](https://tanstack.com/start) + React 19 + Vite
- [React Three Fiber](https://r3f.docs.pmnd.rs/) + [drei](https://drei.docs.pmnd.rs/) + Three.js
- Zustand, Tailwind v4, Radix / shadcn-style primitives

## Develop

```bash
npm install
npm run dev
```

Then open the printed local URL. `npm run typecheck` and `npm run build` for a production check.

## License

[MIT](LICENSE) © 2026 Sahil Shingate

HDR studio lighting optionally uses [Poly Haven](https://polyhaven.com/) CC0 environments. Three.js, Basis transcoders, and other dependencies keep their own licenses.

## Trademark

Ultramock is a trademark of its owner. Freemock is an independent project.
