/* ============================================================
   API — เรียก Claude ผ่าน /api/claude แบบปลอดภัย
   - เช็ค HTTP status และ error จาก API ก่อนใช้ผลลัพธ์
   - มี timeout กันค้าง (default 60 วินาที)
   ============================================================ */

export async function callClaude(payload, { timeoutMs = 60000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.error || !Array.isArray(data.content)) {
      const msg = data?.error?.message || data?.error || `API error (${res.status})`;
      throw new Error(typeof msg === 'string' ? msg : 'API error');
    }
    return data.content.map(b => b.text || '').join('').trim();
  } finally {
    clearTimeout(timer);
  }
}

// ดึง JSON ออกจากคำตอบ AI — ทนต่อ ```json fence และข้อความปนหน้า/หลัง
export function parseAIJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const s = cleaned.indexOf('{');
    const e = cleaned.lastIndexOf('}');
    if (s !== -1 && e > s) return JSON.parse(cleaned.slice(s, e + 1));
    throw new Error('No JSON in AI response');
  }
}
