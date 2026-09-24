# Generative UI Lab

A demo of different approaches to AI-generated UI (list/board/visual/concierge/story layouts,
component composition, negotiated edits, etc.), originally built as a Claude.ai artifact and
now wired up to run as a real local app against the Claude API.

## Structure

```
public/
  index.html          the app shell
  styles/main.css      all styling
  js/                   split by concern, loaded as plain scripts in this order:
    stage-switcher.js       tab navigation between stages
    stage5-irresponsible.js static demo, no API calls
    stage6-scale.js         static demo, no API calls
    claude-client.js        callClaude() — calls our backend's /api/generate
    stage1.js .. stage4.js  the interactive stages that call the model
    intro.js                the intro splash screen
server/
  index.js             Express app — serves public/ and mounts the API route
  routes/generate.js   POST /api/generate — holds the API key, calls Claude, returns JSON
generative-ui-lab.html  the original single-file Claude.ai artifact export, kept for reference
```

`callClaude(system, userText)` in `claude-client.js` has the same signature it always did, so
none of the stage code changed — it just posts to `/api/generate` instead of calling the
Claude.ai artifact sandbox's built-in `window.claude.use('sample')`.

## Setup

```bash
npm install
cp .env.example .env
# then edit .env and paste in your key from https://console.anthropic.com/settings/keys
```

## Run

```bash
npm run dev    # auto-restarts on file changes (nodemon)
# or
npm start
```

Then open http://localhost:3000.

## Model

Defaults to `claude-haiku-4-5` — fast and cheap, which fits these small, frequent, live
JSON-fill calls (pick a layout, generate content for it, etc.). Override with
`CLAUDE_MODEL` in `.env` if you want higher quality (e.g. `claude-sonnet-5` or
`claude-opus-5`) at the cost of latency/price.

## Not done yet

- **No deployment target chosen.** This runs locally only for now. Before putting it on the
  public internet, add rate limiting to `/api/generate` (right now anyone who can reach the
  server can spend your API budget) and decide on a host (Vercel/Netlify serverless, or a
  plain Node server on Render/Fly.io both work fine with this Express setup).
- **No build step.** The JS files are loaded as plain `<script>` tags in dependency order,
  not ES modules — intentional, so the split didn't require re-deriving cross-file references
  by hand. Fine for now; revisit if the project grows enough to want real imports/bundling.
