
import dynamic from 'next/dynamic';
import { useState } from 'react';
const Configurator = dynamic(() => import('../src/Configurator'), { ssr: false });

export default function Home() {
  const [quote, setQuote] = useState<number|null>(null);

  return (
    <div className="container">
      <h1>Custom LED Logo Configurator (MVP)</h1>
      <p className="small">Upload logo, set dimensions, preview on your wall, get instant price. AI background studio included.</p>
      <div className="grid">
        <div className="card">
          <Configurator onPrice={(p:number)=>setQuote(p)} />
        </div>
        <div className="card">
          <h3>Instant Quote</h3>
          <p>Estimated price based on width, LED length and selected options.</p>
          <div className="badge">{quote !== null ? `€ ${quote.toFixed(2)}` : '—'}</div>
          <hr/>
          <h3>Useful Links</h3>
          <ul>
            <li><a href="/background">Open Background Studio</a></li>
          </ul>
          <hr/>
          <h3>Embed in Shopify</h3>
          <ol>
            <li>Deploy this app (e.g. to Vercel) and copy the URL.</li>
            <li>In Shopify Admin → Online Store → Themes → Customize → Add section → Custom Liquid.</li>
            <li>Paste the embed snippet from README.md and replace src with your deployed URL.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
