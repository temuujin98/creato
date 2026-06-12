// admin/pages-preset-edit.jsx — AdminPresetEditPage v2
const { useState, useMemo, useEffect } = React;

/* ── FIELD TYPE OPTIONS ──────────────────────────────────── */
const PRESET_FIELD_TYPES = [
  {value:'text',         label:'Текст (нэг мөр)'},
  {value:'textarea',     label:'Текст (олон мөр)'},
  {value:'select',       label:'Dropdown сонголт'},
  {value:'radio',        label:'Radio сонголт'},
  {value:'checkbox',     label:'Checkbox'},
  {value:'color',        label:'Өнгө сонгох'},
  {value:'number',       label:'Тоо'},
  {value:'image',        label:'Зураг upload'},
  {value:'aspect_ratio', label:'Aspect ratio'},
];

const MODEL_MAP = {
  Gemini: ['imagen-3', 'gemini-2.0-flash-exp', 'gemini-pro-vision'],
  OpenAI:  ['dall-e-3', 'dall-e-2', 'gpt-4o'],
};
const SIZE_OPTS = ['1:1','4:5','9:16','16:9','3:4'];

/* ── SHARED MINI COMPONENTS ──────────────────────────────── */
function FL({children}) {
  return <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.7px',color:'#52525B',marginBottom:6}}>{children}</div>;
}
function Divider({mt=16, mb=16}) {
  return <div style={{borderTop:'1px solid rgba(255,255,255,.05)',marginTop:mt,marginBottom:mb}}/>;
}
const INP_S = {width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'9px 12px',color:'#E4E4E7',fontSize:13,outline:'none',fontFamily:'inherit'};
const TA_S  = {...INP_S, resize:'vertical'};

/* ── FIELD CONFIG ACCORDION ROW ──────────────────────────── */
function FieldRow({varKey, config, inPrompt, expanded, onToggle, onSave}) {
  const unconfigured = inPrompt && !config;
  const unused       = !inPrompt && config;

  const defaultDraft = {
    key:varKey, label:varKey.replace(/_/g,' '),
    type:'text', required:true,
    placeholder:'', helpText:'', defaultValue:'', choices:'',
    sortOrder:0, active:true,
  };
  const [draft, setDraft] = useState(config || defaultDraft);
  useEffect(() => { if (config) setDraft(config); }, [config]);

  const borderColor = unconfigured ? 'rgba(251,191,36,.4)' : unused ? 'rgba(255,255,255,.07)' : 'rgba(124,58,237,.3)';
  const tagColor    = unconfigured ? '#FBBF24' : unused ? '#52525B' : '#A78BFA';
  const tagBg       = unconfigured ? 'rgba(251,191,36,.1)' : unused ? 'rgba(255,255,255,.04)' : 'rgba(124,58,237,.1)';
  const showChoices = ['select','radio','checkbox'].includes(draft.type);

  function save() { onSave(varKey, {...draft}); onToggle(); }

  return (
    <div style={{border:`1px solid ${borderColor}`,borderRadius:10,overflow:'hidden',marginBottom:6,transition:'border-color .15s'}}>
      {/* Header row */}
      <div onClick={onToggle} style={{display:'flex',alignItems:'center',gap:8,padding:'9px 12px',cursor:'pointer',background:expanded?'rgba(124,58,237,.05)':'transparent',userSelect:'none'}}>
        <span style={{fontFamily:'monospace',fontSize:12,fontWeight:700,color:tagColor,background:tagBg,padding:'2px 9px',borderRadius:5,flexShrink:0}}>[{varKey}]</span>
        {config
          ? <span style={{fontSize:12,color:'#71717A',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {config.label}<span style={{color:'#3F3F46'}}> · {PRESET_FIELD_TYPES.find(t=>t.value===config.type)?.label}</span>
              {config.required&&<span style={{color:'#EF4444',marginLeft:4}}>*</span>}
            </span>
          : <span style={{fontSize:12,color:'#52525B',flex:1,fontStyle:'italic'}}>Тохиргоо хийгдэж байна...</span>
        }
        {unconfigured && <span style={{fontSize:10,fontWeight:700,color:'#FBBF24',background:'rgba(251,191,36,.1)',border:'1px solid rgba(251,191,36,.2)',borderRadius:100,padding:'2px 9px',flexShrink:0,whiteSpace:'nowrap'}}>⚠ Тохиргоогүй</span>}
        {unused       && <span style={{fontSize:10,fontWeight:600,color:'#52525B',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:100,padding:'2px 9px',flexShrink:0,whiteSpace:'nowrap'}}>— Ашиглагдаагүй</span>}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{flexShrink:0,transition:'transform .18s',transform:expanded?'rotate(180deg)':'none'}}>
          <path d="M2 4l4 4 4-4" stroke={expanded?'#9D5FF5':'#52525B'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {/* Config panel */}
      {expanded && (
        <div style={{padding:14,borderTop:'1px solid rgba(255,255,255,.06)',background:'rgba(0,0,0,.22)',display:'flex',flexDirection:'column',gap:10}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div><FL>Field key</FL><input style={INP_S} value={draft.key} onChange={e=>setDraft(d=>({...d,key:e.target.value}))}/></div>
            <div><FL>Label (хэрэглэгчид харагдах)</FL><input style={INP_S} value={draft.label} onChange={e=>setDraft(d=>({...d,label:e.target.value}))}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div><FL>Input type</FL><AdminSelect value={draft.type} onChange={v=>setDraft(d=>({...d,type:v}))} options={PRESET_FIELD_TYPES}/></div>
            <div><FL>Sort order</FL><input type="number" style={INP_S} value={draft.sortOrder} onChange={e=>setDraft(d=>({...d,sortOrder:+e.target.value}))} min={0}/></div>
          </div>
          {showChoices && <div><FL>Choices (таслалаар тусгаарлана)</FL><input style={INP_S} value={draft.choices} onChange={e=>setDraft(d=>({...d,choices:e.target.value}))} placeholder="Сонголт 1, Сонголт 2, ..."/></div>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div><FL>Placeholder</FL><input style={INP_S} value={draft.placeholder} onChange={e=>setDraft(d=>({...d,placeholder:e.target.value}))}/></div>
            <div><FL>Default value</FL><input style={INP_S} value={draft.defaultValue} onChange={e=>setDraft(d=>({...d,defaultValue:e.target.value}))}/></div>
          </div>
          <div><FL>Help text</FL><input style={INP_S} value={draft.helpText} onChange={e=>setDraft(d=>({...d,helpText:e.target.value}))} placeholder="Хэрэглэгчид туслах тайлбар..."/></div>
          <div style={{display:'flex',gap:20,paddingTop:2}}>
            <ACheckbox label="Заавал бөглөх" checked={draft.required} onChange={v=>setDraft(d=>({...d,required:v}))}/>
            <ACheckbox label="Идэвхтэй" checked={draft.active} onChange={v=>setDraft(d=>({...d,active:v}))}/>
          </div>
          <div style={{display:'flex',gap:8,paddingTop:4}}>
            <SmBtn color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' onClick={save} style={{border:'none',fontSize:12,padding:'6px 14px'}}>Хадгалах</SmBtn>
            <SmBtn onClick={onToggle} style={{fontSize:12}}>Болих</SmBtn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TAB: BASIC ──────────────────────────────────────────── */
function TabBasic() {
  const [requireImg, setRequireImg] = useState(true);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'grid',gridTemplateColumns:'160px 1fr',gap:12}}>
        <div><FL>Slug *</FL><input style={INP_S} defaultValue="profile-photo"/></div>
        <div><FL>Нэр *</FL><input style={INP_S} defaultValue="Профайл зураг"/></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <div><FL>Статус</FL><AdminSelect defaultValue="active" options={[{value:'draft',label:'Draft'},{value:'active',label:'Active'},{value:'hidden',label:'Hidden'}]}/></div>
        <div><FL>Ангилал</FL><AdminSelect defaultValue="Портрет" options={['Портрет','Бизнес','Соц медиа','Урлаг','Брэнд','Байгаль','Зар']}/></div>
        <div><FL>Дараалал</FL><input type="number" style={INP_S} defaultValue={1} min={0}/></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div><FL>Төрөл</FL><AdminSelect defaultValue="Зургийн генерац" options={['Зургийн генерац','Зураг засварлах','Текст-зураг','Зураг-зураг']}/></div>
        <div><FL>Богино тайлбар</FL><input style={INP_S} defaultValue="Профессиональ профайл зураг үүсгэнэ"/></div>
      </div>
      <div><FL>Дэлгэрэнгүй тайлбар</FL><textarea rows={3} style={TA_S} placeholder="Preset-ийн дэлгэрэнгүй тайлбар..."/></div>
      <div><FL>Хэрэглэгчийн гарын авлага</FL><textarea rows={3} style={TA_S} placeholder="Хэрэглэгчид хэрхэн ашиглахыг алхам алхмаар тайлбарлана уу..."/></div>

      <div>
        <FL>Flag-ууд</FL>
        <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
          <ACheckbox label="Онцлох" defaultChecked={true}/>
          <ACheckbox label="Тренд" defaultChecked={false}/>
          <ACheckbox label="Шинэ" defaultChecked={false}/>
          <ACheckbox label="Их ашиглагдсан" defaultChecked={false}/>
        </div>
      </div>

      <Divider mt={6} mb={6}/>
      <div>
        <FL>Upload шаардлага</FL>
        <div style={{background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.06)',borderRadius:10,padding:14,display:'flex',flexDirection:'column',gap:12}}>
          <ACheckbox label="Зураг upload шаардлагатай" checked={requireImg} onChange={setRequireImg}/>
          {requireImg && <>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><FL>Min зургийн тоо</FL><input type="number" style={INP_S} defaultValue={1} min={0}/></div>
              <div><FL>Max зургийн тоо</FL><input type="number" style={INP_S} defaultValue={3} min={1}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><FL>Зөвшөөрөгдсөн файл төрлүүд</FL><AdminSelect defaultValue="jpg,png,webp" options={[{value:'jpg,png,webp',label:'JPG, PNG, WebP'},{value:'jpg,png',label:'JPG, PNG'},{value:'all',label:'Бүх зураг'}]}/></div>
              <div><FL>Max файл хэмжээ (MB)</FL><input type="number" style={INP_S} defaultValue={10} min={1}/></div>
            </div>
            <div><FL>Upload гарын авлага</FL><textarea rows={2} style={TA_S} placeholder="Жишээ: Цагаан дэвсгэртэй, өндөр нарийвчлалтай зураг оруулна уу..."/></div>
          </>}
        </div>
      </div>
    </div>
  );
}

/* ── TAB: PROMPT & FIELDS ────────────────────────────────── */
function TabPromptFields() {
  const [prompt, setPrompt] = useState(
    'Create a professional [background_style] portrait. Product: [product_name]. Brand color: [brand_color]. Promo text: [promo_text].'
  );
  const [configs, setConfigs] = useState({
    product_name: {key:'product_name',label:'Бүтээгдэхүүний нэр',type:'text',required:true,placeholder:'Жишээ: Creato',helpText:'Таны бүтээгдэхүүн эсвэл брэндийн нэр',defaultValue:'Creato Pro',choices:'',sortOrder:1,active:true},
    brand_color:  {key:'brand_color',label:'Брэнд өнгө',type:'color',required:false,placeholder:'',helpText:'Hex формат',defaultValue:'#8B5CF6',choices:'',sortOrder:3,active:true},
  });
  const [exp, setExp] = useState(null);
  const [neg,  setNeg]  = useState('blurry, low quality, watermark, distorted, text artifacts');
  const [suf,  setSuf]  = useState('');
  const [qual, setQual] = useState('4k, high resolution, professional studio lighting, sharp focus');
  const [cln,  setCln]  = useState('');
  const [note, setNote] = useState('');
  const [ver,  setVer]  = useState('1.0');

  const promptVars = useMemo(() => {
    const m = prompt.match(/\[([a-zA-Z0-9_]+)\]/g) || [];
    return [...new Set(m.map(x => x.slice(1,-1)))];
  }, [prompt]);

  const extra = Object.keys(configs).filter(k => !promptVars.includes(k));

  function saveField(key, cfg) { setConfigs(p => ({...p, [key]: cfg})); setExp(null); }

  const previewParts = useMemo(() => {
    return prompt.split(/(\[[a-zA-Z0-9_]+\])/g).map((part, i) => {
      const m = part.match(/^\[([a-zA-Z0-9_]+)\]$/);
      if (!m) return {t:'text', v:part, i};
      const cfg = configs[m[1]];
      return {t:'var', key:m[1], v: cfg?.defaultValue || (cfg?.type==='color'?'#8B5CF6':part), i};
    });
  }, [prompt, configs]);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      {/* Base prompt */}
      <div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
          <FL>Base prompt *</FL>
          <span style={{fontSize:11,color:'#3F3F46',fontFamily:'monospace'}}>Variable: [square_bracket]</span>
        </div>
        <textarea rows={5} value={prompt} onChange={e=>setPrompt(e.target.value)}
          style={{...TA_S,fontFamily:'monospace',fontSize:13,lineHeight:1.8,color:'#E4E4E7',border:'1px solid rgba(255,255,255,.11)'}}/>
      </div>

      {/* Detected variables */}
      <div>
        <div style={{display:'flex',alignItems:'center',marginBottom:10}}>
          <span style={{fontSize:12,fontWeight:700,color:'#E4E4E7',flex:1}}>Илэрсэн variable-ууд</span>
          <span style={{fontSize:11,color:'#52525B'}}>{promptVars.length} variable</span>
        </div>
        {promptVars.length === 0
          ? <div style={{padding:16,border:'1px dashed rgba(255,255,255,.07)',borderRadius:8,textAlign:'center',fontSize:12,color:'#3F3F46'}}>
              Prompt дотор <span style={{fontFamily:'monospace',color:'#52525B'}}>[variable]</span> хэлбэрийн хувьсагч байхгүй
            </div>
          : promptVars.map(v => (
            <FieldRow key={v} varKey={v} config={configs[v]} inPrompt={true}
              expanded={exp===v} onToggle={()=>setExp(exp===v?null:v)} onSave={saveField}/>
          ))
        }
        {extra.length > 0 && <>
          <div style={{fontSize:11,color:'#52525B',padding:'8px 2px'}}>Тохируулсан ч prompt-д ашиглагдаагүй:</div>
          {extra.map(v => (
            <FieldRow key={v} varKey={v} config={configs[v]} inPrompt={false}
              expanded={exp===v} onToggle={()=>setExp(exp===v?null:v)} onSave={saveField}/>
          ))}
        </>}
      </div>

      {/* Extra prompt fields */}
      <Divider mt={4} mb={4}/>
      <div>
        <FL>Нэмэлт prompt тохиргоо</FL>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><FL>Negative prompt</FL><textarea rows={3} style={TA_S} value={neg} onChange={e=>setNeg(e.target.value)}/></div>
            <div><FL>Quality prompt</FL><textarea rows={3} style={TA_S} value={qual} onChange={e=>setQual(e.target.value)}/></div>
          </div>
          <div><FL>Prompt suffix</FL><textarea rows={2} style={TA_S} value={suf} onChange={e=>setSuf(e.target.value)} placeholder="Prompt-ын ард нэмэгдэх хэсэг..."/></div>
          <div><FL>Artifact cleanup prompt</FL><textarea rows={2} style={TA_S} value={cln} onChange={e=>setCln(e.target.value)} placeholder="Дүрс засах / дахин шүүх prompt..."/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><FL>Prompt version</FL><input style={INP_S} value={ver} onChange={e=>setVer(e.target.value)} placeholder="1.0"/></div>
            <div><FL>Дотоод тэмдэглэл (admin)</FL><input style={INP_S} value={note} onChange={e=>setNote(e.target.value)} placeholder="Admin-д харагдах тэмдэглэл..."/></div>
          </div>
        </div>
      </div>

      {/* Compiled preview */}
      <div style={{border:'1px solid rgba(124,58,237,.22)',borderRadius:10,overflow:'hidden'}}>
        <div style={{padding:'10px 14px',background:'rgba(124,58,237,.07)',borderBottom:'1px solid rgba(124,58,237,.15)',display:'flex',alignItems:'center',gap:8}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9D5FF5" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span style={{fontSize:12,fontWeight:700,color:'#9D5FF5'}}>Compiled prompt preview</span>
          <span style={{marginLeft:'auto',fontSize:11,color:'#3F3F46'}}>Жишээ утгаар харуулж байна</span>
        </div>
        <div style={{padding:14,background:'rgba(0,0,0,.3)',fontSize:13,lineHeight:1.85,fontFamily:'monospace',color:'#71717A',wordBreak:'break-word'}}>
          {previewParts.map(p =>
            p.t === 'var'
              ? <mark key={p.i} style={{background:'rgba(124,58,237,.22)',color:'#C4B5FD',borderRadius:4,padding:'1px 7px',fontStyle:'normal'}}>{p.v}</mark>
              : <span key={p.i}>{p.v}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── TAB: MODEL ──────────────────────────────────────────── */
function TabModel() {
  const [pp, setPP] = useState('Gemini');
  const [pm, setPM] = useState('imagen-3');
  const [fp, setFP] = useState('OpenAI');
  const [fm, setFM] = useState('dall-e-3');
  const [qual, setQual] = useState('standard');
  const [retry, setRetry]   = useState(3);
  const [cleanup, setCleanup] = useState(false);
  const [count, setCount]   = useState(1);
  const [sizes, setSizes]   = useState(['1:1','4:5']);

  function toggleSize(s) { setSizes(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]); }

  function ProvBtns({active, accent, onPick}) {
    return (
      <div style={{display:'flex',gap:8}}>
        {Object.keys(MODEL_MAP).map(p => {
          const on = active===p;
          return (
            <button key={p} onClick={()=>onPick(p)} style={{flex:1,padding:'9px',borderRadius:8,border:`1px solid ${on?`rgba(${accent},.5)`:'rgba(255,255,255,.07)'}`,background:on?`rgba(${accent},.12)`:'rgba(255,255,255,.03)',color:on?`rgb(${accent})`:'#71717A',fontSize:13,fontWeight:on?600:400,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
              {p}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Primary */}
      <ACard style={{padding:16}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:'#4ADE80',display:'inline-block'}}></span>
          <span style={{fontSize:13,fontWeight:700,color:'#E4E4E7'}}>Primary provider</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <FL>Provider</FL>
            <ProvBtns active={pp} accent="74,222,128" onPick={v=>{setPP(v);setPM(MODEL_MAP[v][0]);}}/>
          </div>
          <div>
            <FL>Модел</FL>
            <AdminSelect value={pm} onChange={setPM} options={MODEL_MAP[pp].map(m=>({value:m,label:m}))}/>
          </div>
        </div>
      </ACard>

      {/* Fallback */}
      <ACard style={{padding:16}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:'#FBBF24',display:'inline-block'}}></span>
          <span style={{fontSize:13,fontWeight:700,color:'#E4E4E7'}}>Fallback provider</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <FL>Provider</FL>
            <ProvBtns active={fp} accent="251,191,36" onPick={v=>{setFP(v);setFM(MODEL_MAP[v][0]);}}/>
          </div>
          <div>
            <FL>Модел</FL>
            <AdminSelect value={fm} onChange={setFM} options={MODEL_MAP[fp].map(m=>({value:m,label:m}))}/>
          </div>
        </div>
      </ACard>

      {/* Quality */}
      <div>
        <FL>Quality preset</FL>
        <div style={{display:'flex',gap:8}}>
          {['standard','high','premium'].map(q => {
            const on = qual===q;
            const lbl = q==='standard'?'Standard':q==='high'?'High':'Premium';
            return <button key={q} onClick={()=>setQual(q)} style={{flex:1,padding:'10px',borderRadius:10,border:`1px solid ${on?'rgba(124,58,237,.5)':'rgba(255,255,255,.07)'}`,background:on?'rgba(124,58,237,.15)':'rgba(255,255,255,.03)',color:on?'#C4B5FD':'#71717A',fontSize:13,fontWeight:on?700:400,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>{lbl}</button>;
          })}
        </div>
      </div>

      {/* Retry + count + cleanup */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1.6fr',gap:12}}>
        <div>
          <FL>Retry limit</FL>
          <input type="number" value={retry} onChange={e=>setRetry(+e.target.value)} min={1} max={10}
            style={{...INP_S,fontSize:18,fontWeight:800,textAlign:'center'}}/>
        </div>
        <div>
          <FL>Output count</FL>
          <input type="number" value={count} onChange={e=>setCount(+e.target.value)} min={1} max={4}
            style={{...INP_S,fontSize:18,fontWeight:800,textAlign:'center'}}/>
        </div>
        <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-end',paddingBottom:4}}>
          <FL>Artifact cleanup</FL>
          <ACheckbox label="Cleanup идэвхжүүлэх" checked={cleanup} onChange={setCleanup}/>
        </div>
      </div>

      {/* Allowed sizes chips */}
      <div>
        <FL>Зөвшөөрөгдсөн output хэмжээнүүд</FL>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {SIZE_OPTS.map(s => {
            const on = sizes.includes(s);
            return (
              <button key={s} onClick={()=>toggleSize(s)} style={{padding:'8px 22px',borderRadius:100,border:`1px solid ${on?'rgba(124,58,237,.5)':'rgba(255,255,255,.08)'}`,background:on?'rgba(124,58,237,.16)':'transparent',color:on?'#C4B5FD':'#71717A',fontSize:13,fontWeight:on?700:400,cursor:'pointer',fontFamily:'inherit',transition:'all .18s'}}>
                {s}
              </button>
            );
          })}
        </div>
        <div style={{fontSize:11,color:'#3F3F46',marginTop:8}}>Хэрэглэгч зөвхөн сонгосон хэмжээнүүдийг ашиглаж болно</div>
      </div>
    </div>
  );
}

/* ── TAB: MEDIA ──────────────────────────────────────────── */
function TabMedia() {
  function UpSlot({label, w, h}) {
    const [hov, setHov] = useState(false);
    return (
      <div style={{width:w,height:h,border:`2px dashed ${hov?'rgba(124,58,237,.5)':'rgba(255,255,255,.1)'}`,borderRadius:10,background:hov?'rgba(124,58,237,.05)':'transparent',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,cursor:'pointer',transition:'all .15s',flexShrink:0}}
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={hov?'#9D5FF5':'#3F3F46'} strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span style={{fontSize:10,color:hov?'#9D5FF5':'#3F3F46',textAlign:'center',lineHeight:1.3,padding:'0 4px'}}>{label}</span>
      </div>
    );
  }

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 268px',gap:28,alignItems:'start'}}>
      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        <div>
          <FL>Thumbnail зураг</FL>
          <UpSlot label="Upload thumbnail" w={200} h={130}/>
        </div>
        <div>
          <FL>Жишээ output зургууд</FL>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[1,2,3,4].map(i => <UpSlot key={i} label={`Жишээ ${i}`} w={100} h={100}/>)}
          </div>
        </div>
        <div>
          <FL>Input guide зураг</FL>
          <div style={{fontSize:11,color:'#52525B',marginBottom:9}}>Хэрэглэгчид зураг хэрхэн оруулахыг харуулах жишээ зургууд</div>
          <div style={{display:'flex',gap:8}}>
            <UpSlot label="Guide 1" w={128} h={92}/>
            <UpSlot label="Guide 2" w={128} h={92}/>
            <UpSlot label="+ Нэмэх" w={80} h={92}/>
          </div>
        </div>
      </div>

      {/* Client preview card */}
      <div>
        <FL>Client preview card</FL>
        <div style={{fontSize:11,color:'#52525B',marginBottom:10}}>Хэрэглэгчид хэрхэн харагдахыг урьдчилан үзэх</div>
        <div style={{background:'#12101F',border:'1px solid rgba(139,92,246,.22)',borderRadius:16,overflow:'hidden',boxShadow:'0 12px 40px rgba(0,0,0,.55)'}}>
          <div style={{height:136,background:'linear-gradient(160deg,#1E1145,#3B1D8A,#7C3AED)',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:5}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <span style={{fontSize:10,color:'rgba(255,255,255,.22)'}}>thumbnail</span>
            </div>
            <div style={{position:'absolute',top:10,left:10}}>
              <span style={{fontSize:9,fontWeight:800,padding:'3px 9px',borderRadius:6,background:'rgba(232,121,249,.18)',border:'1px solid rgba(232,121,249,.35)',color:'#F0ABFC',textTransform:'uppercase',letterSpacing:'1px'}}>Онцлох</span>
            </div>
          </div>
          <div style={{padding:'12px 14px 14px'}}>
            <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'1.2px',color:'#3F3F46',marginBottom:4}}>Портрет</div>
            <div style={{fontSize:14,fontWeight:700,color:'#E4E4E7',marginBottom:4}}>Профайл зураг</div>
            <div style={{fontSize:11,color:'#71717A',marginBottom:10,lineHeight:1.5}}>Профессиональ профайл зураг үүсгэнэ</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:700,color:'#C4B5FD',background:'rgba(139,92,246,.12)',padding:'4px 11px',borderRadius:100}}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>
                2 credit
              </span>
              <span style={{fontSize:10,color:'#3F3F46'}}>1,240 ашиглалт</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── TAB: CREDIT ─────────────────────────────────────────── */
function TabCredit() {
  const [base, setBase]     = useState(2);
  const [ov,   setOv]       = useState(false);
  const [ovVal, setOvVal]   = useState(2);
  const [ovReason, setOvReason] = useState('');

  const breakdown = [
    {l:'Base credit',          v:`${base}`,  c:'#C4B5FD'},
    {l:'Provider: Gemini',     v:'+0',       c:'#4ADE80'},
    {l:'Model: imagen-3',      v:'+0',       c:'#4ADE80'},
    {l:'Quality: Standard',    v:'+0',       c:'#4ADE80'},
    {l:'Output count ×1',      v:'×1',       c:'#38BDF8'},
    {l:'Size: 1:1',            v:'+0',       c:'#4ADE80'},
    {l:'Cleanup: идэвхгүй',    v:'+0',       c:'#4ADE80'},
  ];
  const autoCalc = base;
  const final    = ov ? ovVal : autoCalc;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:18,maxWidth:540}}>
      {/* Base credit */}
      <div>
        <FL>Үндсэн credit *</FL>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <input type="number" value={base} onChange={e=>setBase(+e.target.value)} min={1}
            style={{...INP_S,width:90,fontSize:22,fontWeight:800,textAlign:'center'}}/>
          <span style={{fontSize:12,color:'#52525B'}}>credit</span>
        </div>
      </div>

      {/* Auto-calculated breakdown */}
      <ACard style={{padding:14}}>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#52525B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
          <span style={{fontSize:12,fontWeight:700,color:'#52525B'}}>Авто тооцоолсон credit (formula breakdown)</span>
        </div>
        {breakdown.map((b,i) => (
          <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:i<breakdown.length-1?'1px solid rgba(255,255,255,.03)':'none'}}>
            <span style={{fontSize:11,color:'#3F3F46'}}>{b.l}</span>
            <span style={{fontSize:12,fontWeight:700,color:b.c,fontFamily:'monospace'}}>{b.v}</span>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'space-between',paddingTop:10,marginTop:6,borderTop:'1px solid rgba(255,255,255,.07)'}}>
          <span style={{fontSize:12,fontWeight:700,color:'#71717A'}}>Авто нийлбэр</span>
          <span style={{fontSize:16,fontWeight:900,color:'#C4B5FD'}}>{autoCalc} cr</span>
        </div>
      </ACard>

      {/* Final credit pill */}
      <div style={{display:'flex',alignItems:'center',gap:16,padding:'14px 18px',background:'rgba(124,58,237,.09)',border:'1px solid rgba(124,58,237,.22)',borderRadius:10}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,fontWeight:600,color:'#71717A',textTransform:'uppercase',letterSpacing:'.6px',marginBottom:5}}>Client-д харагдах credit</div>
          <div style={{fontSize:26,fontWeight:900,color:'#C4B5FD',letterSpacing:'-1px'}}>{final} <span style={{fontSize:13,fontWeight:400,color:'#71717A'}}>credit</span></div>
        </div>
        {ov && <span style={{fontSize:10,fontWeight:700,padding:'4px 10px',borderRadius:100,background:'rgba(251,191,36,.1)',border:'1px solid rgba(251,191,36,.25)',color:'#FBBF24',whiteSpace:'nowrap'}}>Override идэвхтэй</span>}
      </div>

      {/* Admin override */}
      <div style={{border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:14}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:'#E4E4E7'}}>Admin override</div>
            <div style={{fontSize:11,color:'#52525B',marginTop:2}}>Credit утгыг гараар тохируулах</div>
          </div>
          <ACheckbox checked={ov} onChange={setOv}/>
        </div>
        {ov && (
          <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',flexDirection:'column',gap:10}}>
            <div>
              <FL>Override credit *</FL>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="number" value={ovVal} onChange={e=>setOvVal(+e.target.value)} min={1}
                  style={{...INP_S,width:80,border:'1px solid rgba(251,191,36,.4)',color:'#FBBF24',fontSize:16,fontWeight:800,textAlign:'center'}}/>
                <span style={{fontSize:12,color:'#52525B'}}>credit</span>
              </div>
            </div>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                <FL>Шалтгаан</FL>
                <span style={{fontSize:10,color:'#EF4444',fontWeight:600,marginBottom:6}}>* заавал</span>
              </div>
              <textarea value={ovReason} onChange={e=>setOvReason(e.target.value)} rows={2}
                placeholder="Override хийж буй шалтгааныг бичнэ үү..."
                style={{...TA_S,border:`1px solid ${ovReason?'rgba(255,255,255,.08)':'rgba(239,68,68,.35)'}`}}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MAIN EDIT PAGE ──────────────────────────────────────── */
function AdminPresetEditPage({nav}) {
  const [tab, setTab] = useState('basic');
  const TABS = [
    ['basic',  'Үндсэн'],
    ['prompt', 'Prompt & Fields'],
    ['model',  'Модел'],
    ['media',  'Зураг'],
    ['credit', 'Credit'],
  ];

  return (
    <div style={{maxWidth:940,margin:'0 auto'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
        <button onClick={()=>nav('admin-presets')}
          style={{display:'flex',alignItems:'center',gap:6,background:'transparent',border:'none',color:'#52525B',cursor:'pointer',fontSize:13,fontFamily:'inherit',padding:'4px 0',transition:'color .15s'}}
          onMouseOver={e=>e.currentTarget.style.color='#A1A1AA'}
          onMouseOut={e=>e.currentTarget.style.color='#52525B'}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13 8H3m0 0l4-4m-4 4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Буцах
        </button>
        <div style={{width:1,height:14,background:'rgba(255,255,255,.08)'}}/>
        <span style={{fontSize:15,fontWeight:700,flex:1,color:'#E4E4E7'}}>Preset засварлах</span>
        <SmBtn color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' style={{fontWeight:600,border:'none',padding:'8px 20px',fontSize:13}}>Хадгалах</SmBtn>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:20,overflowX:'auto',paddingBottom:2}}>
        {TABS.map(([id,lb]) => (
          <button key={id} onClick={()=>setTab(id)}
            style={{padding:'7px 16px',borderRadius:100,border:`1px solid ${tab===id?'rgba(124,58,237,.4)':'rgba(255,255,255,.06)'}`,background:tab===id?'rgba(124,58,237,.12)':'transparent',color:tab===id?'#C4B5FD':'#71717A',fontSize:12,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',transition:'all .15s'}}>
            {lb}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab==='basic'  && <ACard><TabBasic/></ACard>}
      {tab==='prompt' && <ACard><TabPromptFields/></ACard>}
      {tab==='model'  && <TabModel/>}
      {tab==='media'  && <ACard style={{overflow:'visible'}}><TabMedia/></ACard>}
      {tab==='credit' && <ACard><TabCredit/></ACard>}
    </div>
  );
}

Object.assign(window, { AdminPresetEditPage });
