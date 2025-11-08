
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { room='office', widthCm=120, goals='' } = req.body || {};
  const openaiKey = process.env.OPENAI_API_KEY;

  const system = `You are an e-commerce LED signage assistant. 
Provide: 1) ideal width (cm) for the given room, 2) color temperature or RGB palette, 
3) short headline (<=60 chars), 4) 2 ad hooks, 5) installation tips in one sentence.`;

  const user = `Room: ${room}
Desired width: ${widthCm} cm
Goals: ${goals}`;

  if (!openaiKey) {
    const ideal = Math.min(Math.max(Number(widthCm)||120, 60), 220);
    const palette = String(room).toLowerCase().includes('bar') ? 'Warm white 2700–3000K' :
                    String(room).toLowerCase().includes('gym') ? 'Neutral white 4000K' :
                    'RGB palette with soft cyan/rose';
    return res.status(200).json({
      provider: 'fallback',
      result: {
        idealWidthCm: ideal,
        palette,
        headline: 'Tvoj logo koji stvarno svijetli',
        hooks: ['Pretvori zid u identitet brenda', 'Montaža u 15 minuta – plug & play'],
        tip: 'Označi dvije točke poznate duljine (npr. širinu stola) za realističan preview.'
      }
    });
  }

  try {
    const rsp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.7
      })
    });
    const data = await rsp.json();
    return res.status(200).json({ provider: 'openai', raw: data });
  } catch (e:any) {
    return res.status(500).json({ error: e?.message || 'AI error' });
  }
}
