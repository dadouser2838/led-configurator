
import { useRef, useState } from 'react';

type Props = { onUse?: (dataUrl:string)=>void };

export default function BackgroundStudio({ onUse }: Props){
  const [prompt, setPrompt] = useState('moody gaming room with textured dark wall, wood desk, LED accents');
  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState<string|null>(null);
  const fileRef = useRef<HTMLInputElement|null>(null);

  async function generate(){
    setLoading(true);
    try{
      const rsp = await fetch('/api/ai/gen-background', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ prompt, width: 1280, height: 768 })
      });
      const data = await rsp.json();
      setImg(data.imageDataUrl || null);
      if (data.imageDataUrl) {
        try { localStorage.setItem('led_bg_dataurl', data.imageDataUrl); } catch(e){}
      }
    } finally{
      setLoading(false);
    }
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setImg(dataUrl);
      try { localStorage.setItem('led_bg_dataurl', dataUrl); } catch(e){}
    };
    reader.readAsDataURL(f);
  }

  return (
    <div className="container">
      <h1>Background Studio</h1>
      <p className="small">Generiraj AI pozadinu ili uploadaj svoju fotku zida. Spremit ćemo je lokalno pa ju učitaj u Konfiguratoru.</p>
      <div className="card" style={{marginBottom:12}}>
        <h3>AI Generator pozadine</h3>
        <div className="row">
          <div style={{flex:1, minWidth:260}}>
            <label className="label">Opis pozadine (prompt)</label>
            <input className="input" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="bar with brick wall, warm ambience, matte black shelves" />
          </div>
          <div style={{alignSelf:'flex-end'}}>
            <button className="button" disabled={loading} onClick={generate}>{loading ? 'Generiram…' : 'Generiraj AI pozadinu'}</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Upload vlastite pozadine</h3>
        <input ref={fileRef} className="input" type="file" accept="image/*" onChange={onUpload} />
      </div>

      <div className="card" style={{marginTop:12}}>
        <h3>Pregled</h3>
        <div className="preview">
          {img ? <img alt="preview" src={img} style={{width:'100%', borderRadius:12}}/> : <div className="small">Još nema slike. Generiraj ili uploadaj iznad.</div>}
        </div>
        <div style={{marginTop:8}}>
          <button className="button" disabled={!img} onClick={()=>{
            if(img){
              try { localStorage.setItem('led_bg_dataurl', img); } catch(e){}
              onUse && onUse(img);
              alert('Pozadina spremljena. U Konfiguratoru klikni "Učitaj pozadinu iz Studija".');
            }
          }}>Spremi i koristi u Konfiguratoru</button>
        </div>
      </div>
    </div>
  );
}
