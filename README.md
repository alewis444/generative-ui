# Generative UI Lab

A demo of different approaches to AI-generated UI (list/board/visual/concierge/story layouts,
component composition, negotiated edits, etc.), originally built as a Claude.ai artifact and
now wired up to run as a real local app against the Claude API.

## Problem We're Solving

A common pattern in AI product design is to fall back on a single chatbot as the terminal
interaction surface — even after a person has moved through structured UI (a dashboard, cards,
buttons) to get there. For example: browse a few dashboard options, pick one, see it rendered
live, then be dropped into a raw text box to make any further change. That's increasingly
recognized as an anti-pattern, for a few reasons:

- **It throws away the structure you just built.** The person just spent several steps building
  shared context visually; a blank chat input asks them to re-articulate all of it in prose.
- **It hides the action space instead of showing it.** Buttons and cards make the possible
  actions discoverable. A chat box shows nothing — the person has to guess what's expressible.
- **It reintroduces ambiguity the structured steps were designed to remove.** A click has a
  deterministic outcome; a sentence has to be parsed and mapped onto a constrained action space,
  which is strictly less reliable, with no benefit on the common cases.
- **It's often a design cop-out, not a decision.** "We don't know how to build controls for
  every edge case, so add a chat box that can do anything" ships fast, but pushes design work
  from build-time onto the user at run-time, every time.

This project explores the alternative: a ladder of approaches (Shape → Atomic → Adjust → Common
Use Case) where free text, when it's offered at all, is a narrow escape hatch for describing an
*edit* — constrained by a fixed component library and a diff-not-regenerate rule — and the
result always lands back in structured UI, not a scrolling chat transcript. Chat is a tool for
one well-defined step, never the final, catch-all destination.

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
