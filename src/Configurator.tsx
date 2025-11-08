
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Group, Rect } from 'react-konva';

type Props = { onPrice?: (price:number)=>void };

export default function Configurator({ onPrice }: Props) {
  const [wall, setWall] = useState<HTMLImageElement|null>(null);
  const [logo, setLogo] = useState<HTMLImageElement|null>(null);
  const [widthCm, setWidthCm] = useState<number>(100);
  const [heightCm, setHeightCm] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({width:600, height:400});
  const [logoOpacity, setLogoOpacity] = useState<number>(0.95);
  const [glow, setGlow] = useState<number>(0.35);
  const [color, setColor] = useState<string>('#00ffff');
  const [mono, setMono] = useState<boolean>(true);
  const [maskSmall, setMaskSmall] = useState<HTMLImageElement|null>(null);
  const [maskLarge, setMaskLarge] = useState<HTMLImageElement|null>(null);

  useEffect(()=>{
    const onResize = ()=>{
      const w = Math.min(900, window.innerWidth-48);
      setStageSize({width:w, height: Math.round(w*2/3)});
    };
    onResize();
    window.addEventListener('resize', onResize);
    // Try load background from localStorage
    try {
      const dataUrl = localStorage.getItem('led_bg_dataurl');
      if (dataUrl) {
        const img = new Image();
        img.onload = ()=> setWall(img);
        img.src = dataUrl;
      }
    } catch(e){}
    return ()=>window.removeEventListener('resize', onResize);
  },[]);

  useEffect(()=>{
    // price calculation (simplified): perimeter from width/height
    const width = widthCm;
    const height = heightCm || (logo ? width * (logo.naturalHeight/logo.naturalWidth) : width * 0.4);
    const perimeter = 2*(width+height)/100; // meters
    const ledRate = mono ? 12 : 18; // €/m
    const power = perimeter * (mono ? 8 : 12); // W estimate
    const psu = Math.max(30, power*1.4*0.25);
    const base = 49; // labor
    const total = base + perimeter*ledRate + psu;
    setPrice(total);
    onPrice && onPrice(total);
  },[widthCm, heightCm, mono, logo]);


  // Build colored glow masks from the uploaded logo to achieve realistic bloom
  useEffect(()=>{
    if(!logo) { setMaskSmall(null); setMaskLarge(null); return; }
    try {
      const w = logo.naturalWidth, h = logo.naturalHeight;
      const makeMask = (blurPx:number)=>{
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d')!;
        // draw original in white alpha
        ctx.clearRect(0,0,w,h);
        ctx.drawImage(logo, 0, 0, w, h);
        // tint with chosen color using source-in
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = color;
        ctx.fillRect(0,0,w,h);
        // apply simple box blur multiple passes to simulate gaussian
        // Using CanvasRenderingContext2D filter for modern browsers
        try {
          const c2 = document.createElement('canvas');
          c2.width = w; c2.height = h;
          const ctx2 = c2.getContext('2d')!;
          ctx2.filter = `blur(${blurPx}px)`;
          ctx2.drawImage(c, 0, 0);
          return c2.toDataURL('image/png');
        } catch(e) {
          // fallback: no extra blur
          return c.toDataURL('image/png');
        }
      };
      const smallUrl = makeMask(24);
      const largeUrl = makeMask(64);
      const sImg = new Image(); sImg.onload = ()=> setMaskSmall(sImg); sImg.src = smallUrl;
      const lImg = new Image(); lImg.onload = ()=> setMaskLarge(lImg); lImg.src = largeUrl;
    } catch(e){
      setMaskSmall(null); setMaskLarge(null);
    }
  }, [logo, color]);


  function loadImage(file: File, setter:(img:HTMLImageElement)=>void) {
    const img = new Image();
    img.onload = ()=> setter(img);
    img.src = URL.createObjectURL(file);
  }

  return (
    <div>
      <div className="row">
        <div style={{flex:1, minWidth:260}}>
          <label className="label">Upload wall photo (optional)</label>
          <input className="input" type="file" accept="image/*" onChange={(e)=>{
            const f = e.target.files?.[0]; if(f) loadImage(f, (img)=>setWall(img));
          }}/>
        </div>
        <div style={{flex:1, minWidth:260}}>
          <label className="label">Upload logo (PNG/SVG recommended)</label>
          <input className="input" type="file" accept="image/*,.svg" onChange={(e)=>{
            const f = e.target.files?.[0]; if(f) loadImage(f, (img)=>setLogo(img));
          }}/>
        </div>
      </div>

      <div className="row" style={{marginTop:8}}>
        <button className="button" onClick={()=>{
          try{
            const dataUrl = localStorage.getItem('led_bg_dataurl');
            if(!dataUrl){ alert('Nema spremljene pozadine. Otvori /background i generiraj ili uploadaj sliku.'); return; }
            const img = new Image();
            img.onload = ()=> setWall(img);
            img.src = dataUrl;
          } catch(e){
            alert('Nije moguće učitati pozadinu iz Studija.');
          }
        }}>Učitaj pozadinu iz Studija</button>
        <a className="button" href="/background" style={{textDecoration:'none', display:'inline-block', marginLeft:8}}>Otvori Background Studio</a>
      </div>

      <div className="row" style={{marginTop:12}}>
        <div style={{flex:1, minWidth:140}}>
          <label className="label">Width (cm)</label>
          <input className="input" type="number" min={20} max={300} value={widthCm} onChange={e=>setWidthCm(parseFloat(e.target.value)||0)} />
        </div>
        <div style={{flex:1, minWidth:140}}>
          <label className="label">Height (cm, auto if 0)</label>
          <input className="input" type="number" min={0} max={300} value={heightCm} onChange={e=>setHeightCm(parseFloat(e.target.value)||0)} />
        </div>
        <div style={{flex:1, minWidth:140}}>
          <label className="label">Mono / RGB</label>
          <select className="select" value={mono ? 'mono' : 'rgb'} onChange={e=>setMono(e.target.value==='mono')}>
            <option value="mono">Mono (warm/neutral/cool)</option>
            <option value="rgb">RGB (addressable)</option>
          </select>
        </div>
        <div style={{flex:1, minWidth:140}}>
          <label className="label">Color (for preview)</label>
          <input className="input" type="color" value={color} onChange={e=>setColor(e.target.value)} />
        </div>
      </div>

      <div className="preview" style={{marginTop:12}}>
        <Stage width={stageSize.width} height={stageSize.height} ref={stageRef}>
          <Layer>
            {/* Wall background */}
            <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="#0a0a0a" />
            {wall && <KonvaImage image={wall} width={stageSize.width} height={stageSize.height} />}
            {/* Logo group with simple glow */}
            {logo && (
              <Group x={stageSize.width/2 - Math.min(stageSize.width*0.8, stageSize.width*(widthCm/200)) / 2}
                     y={stageSize.height/2 - (Math.min(stageSize.width*0.8, stageSize.width*(widthCm/200)) * (logo.naturalHeight/logo.naturalWidth)) / 2}
              >
                {/* Realistic multi-pass glow: additive blend of blurred, colorized logo masks */}
                {maskLarge && (
                  <KonvaImage
                    image={maskLarge}
                    width={Math.min(stageSize.width*0.8, stageSize.width*(widthCm/200))}
                    height={Math.min(stageSize.width*0.8, stageSize.width*(widthCm/200)) * (logo.naturalHeight/logo.naturalWidth)}
                    opacity={Math.max(0, Math.min(1, glow*0.45))}
                    listening={false}
                    perfectDrawEnabled={false}
                    globalCompositeOperation="lighter"
                  />
                )}
                {maskSmall && (
                  <KonvaImage
                    image={maskSmall}
                    width={Math.min(stageSize.width*0.8, stageSize.width*(widthCm/200))}
                    height={Math.min(stageSize.width*0.8, stageSize.width*(widthCm/200)) * (logo.naturalHeight/logo.naturalWidth)}
                    opacity={Math.max(0, Math.min(1, glow))}
                    listening={false}
                    perfectDrawEnabled={false}
                    globalCompositeOperation="lighter"
                  />
                )}
                <KonvaImage
                  image={logo}
                  width={Math.min(stageSize.width*0.8, stageSize.width*(widthCm/200))}
                  height={Math.min(stageSize.width*0.8, stageSize.width*(widthCm/200)) * (logo.naturalHeight/logo.naturalWidth)}
                  opacity={logoOpacity}
                />
              </Group>
            )}
          </Layer>
        </Stage>
        <div className="row" style={{marginTop:8}}>
          <div style={{flex:1, minWidth:140}}>
            <label className="label">Glow intensity</label>
            <input className="input" type="range" min={0} max={1} step={0.01} value={glow} onChange={e=>setGlow(parseFloat(e.target.value))}/>
          </div>
          <div style={{flex:1, minWidth:140}}>
            <label className="label">Logo opacity</label>
            <input className="input" type="range" min={0.5} max={1} step={0.01} value={logoOpacity} onChange={e=>setLogoOpacity(parseFloat(e.target.value))}/>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <h3>AI asistent</h3>
        <p className="small">Predložit će idealnu širinu, paletu i headline.</p>
        <div className="row">
          <div style={{flex:1, minWidth:180}}>
            <label className="label">Tip prostora</label>
            <input id="ai-room" className="input" placeholder="office, bar, gym, studio" />
          </div>
          <div style={{flex:1, minWidth:180}}>
            <label className="label">Cilj / vibe</label>
            <input id="ai-goals" className="input" placeholder="minimalist, neon vibe, warm welcome" />
          </div>
          <div style={{alignSelf:'flex-end'}}>
            <button className="button" onClick={async()=>{
              const room = (document.getElementById('ai-room') as HTMLInputElement)?.value || 'office';
              const goals = (document.getElementById('ai-goals') as HTMLInputElement)?.value || '';
              const rsp = await fetch('/api/ai/suggest', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ room, widthCm, goals }) });
              const data = await rsp.json();
              alert(JSON.stringify(data, null, 2));
            }}>Pokreni AI prijedlog</button>
          </div>
        </div>
        <p className="small">Napomena: Ako ne postaviš API ključeve, dobit ćeš lokalne “smart” prijedloge.</p>
      </div>
    </div>
  );
}
