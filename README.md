
# LED Configurator + AI Background Studio (Shopify-embeddable)

Features:
- Logo upload (PNG/SVG)
- Dimension input (cm)
- Visual preview with adjustable glow
- Instant price estimation
- **Background Studio**: generate AI background from prompt or upload your own, store locally, and load into configurator
- AI assistant (suggest ideal width, palette, headline)
- Shopify embed via simple widget

## Dev
```bash
npm i
npm run dev
# http://localhost:3000
```

## Deploy (Vercel)
- Import repo → Next.js → Deploy
- Set environment variables as needed:
  - `OPENAI_API_KEY`
  - `REPLICATE_API_TOKEN` (optional)

## Endpoints
- `POST /api/ai/gen-background` → `{ imageDataUrl }` (OpenAI images if key set, otherwise gradient fallback)
- `POST /api/ai/suggest` → AI assistant (fallback heuristics without key)
- `POST /api/ai/matte` → hook for background removal (no-op without token)
- `GET  /api/price` → price quote

## Shopify (Custom Liquid)
```liquid
<div id="led-configurator-embed"></div>
<script>window.LED_CONFIGURATOR_SRC = "https://your-app.vercel.app";</script>
<script src="https://your-app.vercel.app/widget.js" defer></script>
```

## Notes
- Background Studio lives at `/background`.
- Configurator has a button **"Učitaj pozadinu iz Studija"** which reads `localStorage.led_bg_dataurl`.
- For realistic perspective/glow, extend with OpenCV.js or WebGL (Three.js) in future iterations.
