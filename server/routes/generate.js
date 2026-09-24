import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

// Reads ANTHROPIC_API_KEY from the environment — never hardcode it here.
const anthropic = new Anthropic();

const MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5';
const MAX_TOKENS = 1024;

// The stage prompts ask the model to respond with only JSON, but models
// sometimes wrap it in a ```json fence anyway — strip that before parsing.
function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  return JSON.parse(candidate.trim());
}

router.post('/', async (req, res) => {
  const { system, userText } = req.body || {};

  if (typeof system !== 'string' || typeof userText !== 'string' || !system.trim() || !userText.trim()) {
    return res.status(400).json({ error: 'Both "system" and "userText" are required strings.' });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: 'user', content: userText }]
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock) {
      return res.status(502).json({ error: 'Claude returned no text content.' });
    }

    let parsed;
    try {
      parsed = extractJson(textBlock.text);
    } catch (parseErr) {
      console.error('Failed to parse JSON from Claude response:', textBlock.text);
      return res.status(502).json({ error: 'Claude did not return valid JSON.' });
    }

    res.json(parsed);
  } catch (err) {
    console.error('Anthropic API error:', err);
    const status = Number.isInteger(err.status) ? err.status : 500;
    res.status(status).json({ error: err.message || 'Claude API request failed.' });
  }
});

export default router;
