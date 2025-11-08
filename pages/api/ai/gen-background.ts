
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } }
};

function gradientDataUrl(prompt: string, w:number=1280, h:number=768){
  const colors = ['#111827','#0ea5e9','#a78bfa','#22d3ee','#f472b6'];
  const stops = colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}" />`).join('');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      ${stops}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
  <text x="24" y="${h-24}" font-size="14" fill="rgba(255,255,255,0.55)">${prompt.replace(/</g,'&lt;')}</text>
</svg>`;
  const b64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt = 'modern moody studio with dark wood and led accents', width=1280, height=768 } = req.body || {};
  const key = process.env.OPENAI_API_KEY;

  if(!key){
    return res.status(200).json({ provider:'fallback', imageDataUrl: gradientDataUrl(String(prompt), Number(width), Number(height)) });
  }

  try {
    const rsp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: `Photorealistic interior background for showcasing a wall-mounted LED logo. ${prompt}. Camera: 35mm, soft bounce light, realistic materials.`,
        size: `${width}x${height}`
      })
    });
    const data = await rsp.json();
    const url = data?.data?.[0]?.url || null;
    if(!url){
      return res.status(200).json({ provider:'fallback', imageDataUrl: gradientDataUrl(String(prompt), Number(width), Number(height)) });
    }
    const imgRsp = await fetch(url);
    const buf = Buffer.from(await imgRsp.arrayBuffer());
    const b64 = buf.toString('base64');
    const mime = 'image/png';
    return res.status(200).json({ provider:'openai', imageDataUrl: `data:${mime};base64,${b64}` });
  } catch (e:any) {
    return res.status(500).json({ error: e?.message || 'background generation error' });
  }
}
