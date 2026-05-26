// /api/claude.js
// Vercel Serverless Function — proxies requests to Anthropic
// API key stays on the server (env var ANTHROPIC_API_KEY)

export default async function handler(req, res) {
  // CORS (allow same origin always; tweak if you serve a separate frontend)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is missing ANTHROPIC_API_KEY — please configure it in Vercel project settings.'
    });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (error) {
    console.error('Anthropic proxy error:', error);
    return res.status(500).json({ error: error.message || 'Upstream error' });
  }
}

export const config = {
  // images can be ~2-4MB so allow larger bodies
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
