
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = process.env.REPLICATE_API_TOKEN;
  const { imageDataUrl } = req.body || {};
  if (!imageDataUrl) return res.status(400).json({ error: 'imageDataUrl required (data:image/...;base64,...)' });

  if (!token) {
    return res.status(200).json({ provider: 'noop', imageDataUrl });
  }
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'c2f5bf6a9e6d2c0e5bfa-EXAMPLE',
        input: { image: imageDataUrl }
      })
    });
    const pred = await response.json();
    return res.status(200).json({ provider: 'replicate', raw: pred });
  } catch (e:any) {
    return res.status(500).json({ error: e?.message || 'Matting error' });
  }
}
