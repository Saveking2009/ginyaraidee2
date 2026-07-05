/* ============================================================
   Community Food Memory — คลังความจำรวมจากผู้ใช้ทุกคน
   - POST: ผู้ใช้แก้แคลอาหาร → เก็บ (ชื่อเมนู + แคล) แบบไม่ระบุตัวตน
   - GET: ดึงค่าเฉลี่ยแคลของแต่ละเมนูที่ผู้ใช้จริงยืนยันแล้ว
   ใช้ Upstash Redis (REST) — ตั้งค่า env บน Vercel:
     UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
     (หรือ KV_REST_API_URL + KV_REST_API_TOKEN จาก Vercel KV)
   ถ้ายังไม่ตั้งค่า endpoint จะตอบ items ว่าง — แอปทำงานปกติ
   ============================================================ */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

async function redisPipeline(commands) {
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  return res.json();
}

// Upstash HGETALL คืน array [field, value, field, value, ...]
function pairsToObject(arr) {
  const o = {};
  if (!Array.isArray(arr)) return o;
  for (let i = 0; i < arr.length - 1; i += 2) o[arr[i]] = +arr[i + 1];
  return o;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ยังไม่ต่อ Redis — ตอบว่างแบบสุภาพ แอปฝั่งหน้าใช้ต่อได้ปกติ
  if (!REDIS_URL || !REDIS_TOKEN) {
    if (req.method === 'GET') return res.status(200).json({ items: [], enabled: false });
    return res.status(200).json({ ok: false, enabled: false });
  }

  try {
    if (req.method === 'GET') {
      const [sumR, cntR] = await redisPipeline([
        ['HGETALL', 'community:sum'],
        ['HGETALL', 'community:count'],
      ]);
      const sums = pairsToObject(sumR?.result);
      const counts = pairsToObject(cntR?.result);
      const items = Object.keys(counts)
        .map(name => ({
          name,
          count: counts[name],
          avgCal: Math.round((sums[name] || 0) / (counts[name] || 1)),
        }))
        .filter(it => it.avgCal >= 10 && it.avgCal <= 5000)
        .sort((a, b) => b.count - a.count)
        .slice(0, 80);
      return res.status(200).json({ items, enabled: true });
    }

    if (req.method === 'POST') {
      const list = (req.body?.corrections || []).slice(0, 5);
      const cmds = [];
      for (const c of list) {
        const name = String(c.realName || '').trim().replace(/\s+/g, ' ').slice(0, 60);
        const kcal = Math.round(+c.realCal);
        if (!name || name.length < 2 || !isFinite(kcal) || kcal < 10 || kcal > 5000) continue;
        cmds.push(['HINCRBY', 'community:sum', name, kcal]);
        cmds.push(['HINCRBY', 'community:count', name, 1]);
      }
      if (cmds.length) await redisPipeline(cmds);
      return res.status(200).json({ ok: true, saved: cmds.length / 2 });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(200).json({ items: [], ok: false, error: 'community unavailable' });
  }
}
