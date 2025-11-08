
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { widthCm=100, heightCm=0, mono='true' } = req.query as any;
  const w = parseFloat(widthCm as any) || 100;
  const h = parseFloat(heightCm as any) || 0;
  const isMono = (mono as string) !== 'false';
  const height = h || w * 0.4;
  const perimeter = 2*(w+height)/100; // meters
  const ledRate = isMono ? 12 : 18; // €/m
  const power = perimeter * (isMono ? 8 : 12); // W
  const psu = Math.max(30, power*1.4*0.25);
  const base = 49;
  const total = base + perimeter*ledRate + psu;
  res.status(200).json({ price: Math.round(total*100)/100 });
}
