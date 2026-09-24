/* ---------- Shared completion helper (calls our own backend, which calls the Claude API) ---------- */
async function callClaude(system, userText) {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, userText })
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Request failed (${res.status})`);
    }
    return await res.json();
  } catch (e) {
    console.error('callClaude failed:', (e && e.message) || e);
    return null;
  }
}
function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
