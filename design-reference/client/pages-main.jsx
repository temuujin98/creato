// client/pages.jsx — Dashboard, Presets, PresetDetail, Generate
const { useState, useEffect } = React;

/* ── shared tiny components ─────────────────────────────── */
const Pill = ({children, color='purple'}) => {
  const map={purple:'rgba(124,58,237,.15),rgba(124,58,237,.3),#C4B5FD',blue:'rgba(56,189,248,.12),rgba(56,189,248,.25),#38BDF8',pink:'rgba(236,72,153,.12),rgba(236,72,153,.25),#EC4899',green:'rgba(74,222,128,.12),rgba(74,222,128,.25),#4ADE80',amber:'rgba(251,191,36,.12),rgba(251,191,36,.25),#FBBF24',red:'rgba(239,68,68,.12),rgba(239,68,68,.25),#EF4444',gray:'rgba(255,255,255,.07),rgba(255,255,255,.12),#A1A1AA'};
  const [bg,bdr,txt]=map[color].split(',');
  return <span style={{display:'inline-flex',alignItems:'center',gap:4,background:bg,border:`1px solid ${bdr}`,borderRadius:100,padding:'3px 10px',fontSize:12,fontWeight:600,color:txt,whiteSpace:'nowrap'}}>{children}</span>;
};
const Card = ({children, style={}}) => <div style={{background:'var(--card)',border:'1px solid var(--bdr)',borderRadius:16,padding:24,...style}}>{children}</div>;
const SectionTitle = ({children,sub}) => <div style={{marginBottom:24}}><h2 style={{fontSize:20,fontWeight:700,letterSpacing:'-.5px',marginBottom:sub?6:0}}>{children}</h2>{sub&&<p style={{fontSize:14,color:'#A1A1AA'}}>{sub}</p>}</div>;
const GradThumbs = ['linear-gradient(160deg,#1A0A2E,#3D1B69,#7C3AED)','linear-gradient(135deg,#0C1A2E,#164E63,#0EA5E9,#38BDF8)','linear-gradient(135deg,#1A0515,#7C1D4E,#EC4899)','linear-gradient(135deg,#0A1A0A,#14532D,#16A34A,#4ADE80)','linear-gradient(135deg,#0F0A1E,#2D1B69,#C4B5FD)','linear-gradient(135deg,#1A1000,#78350F,#D97706,#FCD34D)','linear-gradient(160deg,#0A0F1E,#1E3A5F,#3B82F6)','linear-gradient(160deg,#0A1A15,#134E4A,#2DD4BF)'];

/* ── DASHBOARD ───────────────────────────────────────────── */
function MiniLineChart({ data, color, fill, width=320, height=80 }) {
  const pad = { t:8, r:8, b:24, l:32 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;
  const maxV = Math.max(...data.map(d=>d.v), 1);
  const pts = data.map((d,i)=>({
    x: pad.l + (i/(data.length-1))*W,
    y: pad.t + H - (d.v/maxV)*H,
    ...d
  }));
  const linePath = pts.map((p,i)=>`${i===0?'M':'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length-1].x},${pad.t+H} L${pts[0].x},${pad.t+H} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{overflow:'visible'}}>
      <defs>
        <linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0,0.5,1].map((t,i)=>(
        <line key={i} x1={pad.l} y1={pad.t+H*t} x2={pad.l+W} y2={pad.t+H*t}
          stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
      ))}
      {/* Y labels */}
      {[maxV, Math.round(maxV/2), 0].map((v,i)=>(
        <text key={i} x={pad.l-6} y={pad.t+H*(i/2)+4} textAnchor="end"
          fontSize="9" fill="#3F3F46">{v}</text>
      ))}
      {/* Area fill */}
      <path d={areaPath} fill={`url(#g${color.replace('#','')})`}/>
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* X labels */}
      {pts.map((p,i)=>(
        <text key={i} x={p.x} y={height-4} textAnchor="middle" fontSize="9" fill="#52525B">{p.l}</text>
      ))}
      {/* Dots */}
      {pts.map((p,i)=>(
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="#12121C" strokeWidth="1.5"/>
      ))}
    </svg>
  );
}

function DashboardPage({nav}) {
  const [chartTab, setChartTab] = useState('gen');
  const stats=[{v:'24',l:'Credit үлдэгдэл',ic:'◈',c:'purple'},{v:'138',l:'Нийт генерац',ic:'↗',c:'blue'},{v:'6',l:'Идэвхтэй preset',ic:'◧',c:'pink'},{v:'12',l:'Авсан credit',ic:'+',c:'green'}];
  const recents=[{name:'Профайл зураг',preset:'Профессиональ профайл',g:0,t:'2 мин өмнө'},{name:'Бизнес баннер',preset:'Бизнес баннер загвар',g:1,t:'1 цаг өмнө'},{name:'Лого загвар',preset:'Лого design',g:4,t:'Өчигдөр'},{name:'Монгол загвар',preset:'Монгол урлагийн загвар',g:3,t:'Өчигдөр'}];
  const txns=[{t:'Credit авалт',a:'+50',c:'green',d:'06/04 10:22'},{t:'Генерац зардал',a:'-2',c:'red',d:'06/04 09:15'},{t:'Creator reward',a:'+1',c:'green',d:'06/03 18:40'},{t:'Генерац зардал',a:'-1',c:'red',d:'06/03 14:20'},{t:'Credit авалт',a:'+25',c:'green',d:'06/02 09:00'}];

  const genData  = [{l:'5/29',v:3},{l:'5/30',v:7},{l:'5/31',v:5},{l:'6/01',v:12},{l:'6/02',v:8},{l:'6/03',v:15},{l:'6/04',v:10}];
  const crData   = [{l:'5/29',v:4},{l:'5/30',v:8},{l:'5/31',v:6},{l:'6/01',v:14},{l:'6/02',v:9},{l:'6/03',v:18},{l:'6/04',v:12}];
  const rwData   = [{l:'5/29',v:0},{l:'5/30',v:1},{l:'5/31',v:2},{l:'6/01',v:3},{l:'6/02',v:2},{l:'6/03',v:4},{l:'6/04',v:1}];

  const chartCfg = {
    gen: { data:genData,  color:'#9D5FF5', label:'Генерацийн тоо',      total:genData.reduce((a,d)=>a+d.v,0),  unit:'генерац' },
    cr:  { data:crData,   color:'#38BDF8', label:'Credit зарцуулалт',   total:crData.reduce((a,d)=>a+d.v,0),   unit:'cr' },
    rw:  { data:rwData,   color:'#4ADE80', label:'Creator reward',      total:rwData.reduce((a,d)=>a+d.v,0),   unit:'cr' },
  };
  const cc = chartCfg[chartTab];
  return (
    <div>
      {/* Profile incomplete banner */}
      <div style={{background:'rgba(251,191,36,.08)',border:'1px solid rgba(251,191,36,.2)',borderRadius:12,padding:'14px 18px',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:14,color:'#FCD34D'}}>!</span>
          <div><div style={{fontSize:14,fontWeight:600,color:'#FCD34D'}}>Профайл бүрэн биш байна</div><div style={{fontSize:13,color:'#A1A1AA'}}>Preset үүсгэхийн тулд профайлаа бүрэн бөглөнө үү</div></div>
        </div>
        <button onClick={()=>nav('settings')} style={{background:'rgba(251,191,36,.15)',border:'1px solid rgba(251,191,36,.3)',color:'#FCD34D',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:600,whiteSpace:'nowrap',fontFamily:'inherit'}}>Бөглөх →</button>
      </div>
      {/* Welcome */}
      <div style={{background:'linear-gradient(135deg,rgba(124,58,237,.12) 0%,rgba(56,189,248,.06) 100%)',border:'1px solid rgba(124,58,237,.2)',borderRadius:20,padding:'28px 32px',marginBottom:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-80,right:-80,width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,.12) 0%,transparent 70%)',pointerEvents:'none'}}></div>
        <div style={{fontSize:13,color:'#9D5FF5',fontWeight:600,marginBottom:8}}>Тавтай морил</div>
        <h1 style={{fontSize:26,fontWeight:800,letterSpacing:'-1px',marginBottom:8}}>Батбаяр</h1>
        <p style={{fontSize:14,color:'#A1A1AA',marginBottom:20}}>Өнөөдөр ямар зураг үүсгэх вэ? 48 preset таны хүлээлтэд бэлэн.</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={()=>nav('presets')} style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'#fff',border:'none',borderRadius:10,padding:'10px 20px',cursor:'pointer',fontSize:14,fontWeight:600,boxShadow:'0 0 18px rgba(124,58,237,.3)',fontFamily:'inherit'}}>Preset үзэх →</button>
          <button onClick={()=>nav('credits')} style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',borderRadius:10,padding:'10px 20px',cursor:'pointer',fontSize:14,fontWeight:500,fontFamily:'inherit'}}>Credit авах</button>
        </div>
      </div>
      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:28}}>
        {stats.map((s,i)=>(
          <Card key={i} style={{padding:20}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
              <span style={{fontSize:22}}>{s.ic}</span>
              <Pill color={s.c}>{s.c==='purple'?'Wallet':s.c==='blue'?'+12%':s.c==='pink'?'Идэвхтэй':'+5'}</Pill>
            </div>
            <div style={{fontSize:28,fontWeight:800,letterSpacing:'-1px'}}>{s.v}</div>
            <div style={{fontSize:13,color:'#A1A1AA',marginTop:3}}>{s.l}</div>
          </Card>
        ))}
      </div>
      {/* Chart */}
      <Card style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
          <div>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:3}}>7 хоногийн идэвхжил</h3>
            <div style={{fontSize:24,fontWeight:800,letterSpacing:'-1px',color:cc.color}}>{cc.total} <span style={{fontSize:13,fontWeight:500,color:'#71717A'}}>{cc.unit}</span></div>
          </div>
          <div style={{display:'flex',gap:6}}>
            {[
              ['gen','Генерац','#9D5FF5','rgba(157,95,245,.12)','rgba(157,95,245,.35)'],
              ['cr', 'Credit', '#38BDF8','rgba(56,189,248,.12)', 'rgba(56,189,248,.35)'],
              ['rw', 'Reward', '#4ADE80','rgba(74,222,128,.12)', 'rgba(74,222,128,.35)'],
            ].map(([k,l,c,bg,bdr])=>(
              <button key={k} onClick={()=>setChartTab(k)} style={{
                padding:'6px 14px', borderRadius:100, fontSize:12, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit', transition:'all .15s',
                background: chartTab===k ? bg : 'transparent',
                border: `1px solid ${chartTab===k ? bdr : 'rgba(255,255,255,.07)'}`,
                color: chartTab===k ? c : '#71717A',
              }}>{l}</button>
            ))}
          </div>
        </div>
        <MiniLineChart data={cc.data} color={cc.color} height={100} width={600}/>
      </Card>
      {/* Recent generations + transactions */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <Card>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <h3 style={{fontSize:15,fontWeight:700}}>Сүүлийн генерацууд</h3>
            <button onClick={()=>nav('my-images')} style={{fontSize:12,color:'#9D5FF5',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Бүгд →</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {recents.map((r,i)=>(
              <div key={i} onClick={()=>nav('my-images')} style={{borderRadius:10,overflow:'hidden',cursor:'pointer',border:'1px solid rgba(255,255,255,.07)',transition:'transform .2s'}}
                onMouseOver={e=>e.currentTarget.style.transform='translateY(-3px)'}
                onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{height:80,background:GradThumbs[r.g]}}></div>
                <div style={{padding:'8px 10px',background:'var(--glass)'}}>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.name}</div>
                  <div style={{fontSize:11,color:'#52525B'}}>{r.t}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <h3 style={{fontSize:15,fontWeight:700}}>Сүүлийн гүйлгээ</h3>
            <button onClick={()=>nav('transactions')} style={{fontSize:12,color:'#9D5FF5',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Бүгд →</button>
          </div>
          {txns.map((t,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:i<txns.length-1?'1px solid rgba(255,255,255,.06)':'none'}}>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>{t.t}</div>
                <div style={{fontSize:11,color:'#52525B'}}>{t.d}</div>
              </div>
              <span style={{fontSize:14,fontWeight:700,color:t.c==='green'?'#4ADE80':'#EF4444'}}>{t.a} cr</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ── PRESETS PAGE ─────────────────────────────────────────── */
const PRESETS = [
  {id:1,name:'Профессиональ профайл зураг',cat:'Портрет',g:0,cr:2,rating:4.9,uses:1240,badge:'top',creator:null},
  {id:2,name:'Бизнес баннер загвар',cat:'Бизнес',g:1,cr:1,rating:4.7,uses:890,badge:'new',creator:null},
  {id:3,name:'Instagram пост загвар',cat:'Соц медиа',g:2,cr:1,rating:4.8,uses:743,badge:'hot',creator:null},
  {id:4,name:'Монгол урлагийн загвар',cat:'Урлаг',g:3,cr:2,rating:5.0,uses:621,badge:'top',creator:'Дорж.Б'},
  {id:5,name:'Лого загвар хийх',cat:'Брэнд',g:4,cr:3,rating:4.6,uses:512,badge:null,creator:null},
  {id:6,name:'Визитний карт загвар',cat:'Зурагт хуудас',g:5,cr:2,rating:4.5,uses:480,badge:null,creator:null},
  {id:7,name:'Онлайн зарын зураг',cat:'Зар',g:6,cr:1,rating:4.4,uses:399,badge:'new',creator:null},
  {id:8,name:'Монголын байгаль зираг',cat:'Байгаль',g:7,cr:2,rating:4.8,uses:377,badge:'hot',creator:'Батаа.М'},
  {id:9,name:'YouTube thumbnail загвар',cat:'Соц медиа',g:1,cr:1,rating:4.6,uses:310,badge:null,creator:null},
  {id:10,name:'Facebook cover загвар',cat:'Бизнес',g:2,cr:1,rating:4.5,uses:289,badge:null,creator:null},
  {id:11,name:'Хүн зургийн дизайн',cat:'Портрет',g:0,cr:2,rating:4.7,uses:260,badge:'new',creator:null},
  {id:12,name:'Зочид буудлын баннер',cat:'Бизнес',g:6,cr:2,rating:4.4,uses:245,badge:null,creator:'Нарантуяа.Г'},
];
const TABS=[{id:'featured',label:'Онцлох'},{id:'new',label:'Шинэ'},{id:'trending',label:'Тренд'},{id:'popular',label:'Их ашиглагдсан'},{id:'top',label:'Өндөр үнэлгээтэй'}];
const CATS=['Бүгд','Портрет','Бизнес','Соц медиа','Урлаг','Брэнд','Байгаль','Зар'];

function PresetsPage({nav,onPreset}) {
  const [tab,setTab]=useState('featured');
  const [cat,setCat]=useState('Бүгд');
  const [q,setQ]=useState('');
  const badgeMap={top:{c:'purple',l:'Онцлох'},new:{c:'blue',l:'Шинэ'},hot:{c:'pink',l:'Тренд'}};
  const filtered=PRESETS.filter(p=>(cat==='Бүгд'||p.cat===cat)&&(!q||p.name.toLowerCase().includes(q.toLowerCase())));
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24,flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:200,display:'flex',alignItems:'center',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,padding:'10px 14px',gap:8}}>
          <span style={{color:'#52525B'}}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Preset хайх..." style={{background:'none',border:'none',outline:'none',color:'#fff',fontSize:14,width:'100%',fontFamily:'inherit'}} />
        </div>
        <select style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,padding:'10px 14px',color:'#A1A1AA',fontSize:14,outline:'none',fontFamily:'inherit',cursor:'pointer'}}>
          <option>Бүх загвар</option><option>Зураг орно</option><option>Текст орно</option>
        </select>
        <select style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,padding:'10px 14px',color:'#A1A1AA',fontSize:14,outline:'none',fontFamily:'inherit',cursor:'pointer'}}>
          <option>Үнэлгээгээр</option><option>Хамгийн шинэ</option><option>Их ашиглагдсан</option>
        </select>
      </div>
      {/* Tabs */}
      <div style={{display:'flex',gap:6,marginBottom:20,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'8px 18px',borderRadius:100,border:`1px solid ${tab===t.id?'rgba(124,58,237,.5)':'rgba(255,255,255,.08)'}`,background:tab===t.id?'rgba(124,58,237,.15)':'rgba(255,255,255,.04)',color:tab===t.id?'#C4B5FD':'#A1A1AA',fontSize:13,fontWeight:tab===t.id?600:400,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit',transition:'all .15s'}}>
            {t.label}
          </button>
        ))}
      </div>
      {/* Category chips */}
      <div style={{display:'flex',gap:8,marginBottom:24,overflowX:'auto',scrollbarWidth:'none'}}>
        {CATS.map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{padding:'7px 16px',borderRadius:100,border:`1px solid ${cat===c?'rgba(124,58,237,.4)':'rgba(255,255,255,.07)'}`,background:cat===c?'rgba(124,58,237,.12)':'rgba(255,255,255,.03)',color:cat===c?'#fff':'#A1A1AA',fontSize:13,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit',flexShrink:0,transition:'all .15s'}}>
            {c}
          </button>
        ))}
      </div>
      {/* Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
        {filtered.map(p=>(
          <div key={p.id} onClick={()=>onPreset(p)} style={{background:'#12121C',border:'1px solid rgba(255,255,255,.08)',borderRadius:14,overflow:'hidden',cursor:'pointer',transition:'transform .2s,box-shadow .2s,border-color .2s'}}
            onMouseOver={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow='0 16px 48px rgba(0,0,0,.5)';e.currentTarget.style.borderColor='rgba(124,58,237,.25)'}}
            onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor='rgba(255,255,255,.08)'}}>
            <div style={{aspectRatio:'3/2',background:GradThumbs[p.g],position:'relative'}}>
              {p.badge && <div style={{position:'absolute',top:8,left:8}}><Pill color={badgeMap[p.badge].c}>{badgeMap[p.badge].l}</Pill></div>}
              {p.creator && <div style={{position:'absolute',bottom:8,right:8,background:'rgba(0,0,0,.7)',borderRadius:100,padding:'3px 8px',fontSize:11,color:'#A1A1AA'}}>👤 {p.creator}</div>}
            </div>
            <div style={{padding:'12px 14px 14px'}}>
              <div style={{fontSize:11,color:'#52525B',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4}}>{p.cat}</div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:10,lineHeight:1.35}}>{p.name}</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{fontSize:12,color:'#A1A1AA',display:'flex',alignItems:'center',gap:6}}>
                  <span style={{color:'#FBBF24'}}>★</span>{p.rating}
                  <span style={{color:'#3F3F46',marginLeft:2}}>{p.uses.toLocaleString()}</span>
                </div>
                
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── PRESET DETAIL ───────────────────────────────────────── */
function PresetDetailPage({preset,nav}) {
  if(!preset) return <div style={{textAlign:'center',padding:80,color:'#52525B'}}>Preset олдсонгүй</div>;
  const examples=[0,1,2,3].map(i=>GradThumbs[(preset.g+i)%GradThumbs.length]);
  return (
    <div style={{maxWidth:900,margin:'0 auto'}}>
      <button onClick={()=>nav('presets')} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:'#A1A1AA',cursor:'pointer',fontSize:14,fontFamily:'inherit',marginBottom:24,padding:0}}>← Буцах</button>
      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:24}}>
        <div>
          {/* Hero image */}
          <div style={{borderRadius:16,overflow:'hidden',marginBottom:16,aspectRatio:'16/9',background:GradThumbs[preset.g],position:'relative'}}>
            {preset.badge && <div style={{position:'absolute',top:14,left:14}}><Pill color={preset.badge==='top'?'purple':preset.badge==='new'?'blue':'pink'}>{preset.badge==='top'?'⭐ Онцлох':preset.badge==='new'?'✨ Шинэ':'🔥 Тренд'}</Pill></div>}
          </div>
          {/* Example outputs */}
          <h3 style={{fontSize:14,fontWeight:600,color:'#A1A1AA',marginBottom:10}}>Жишээ гаралтууд</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:24}}>
            {examples.map((g,i)=><div key={i} style={{aspectRatio:'1',borderRadius:10,background:g,border:'1px solid rgba(255,255,255,.07)'}}></div>)}
          </div>
          {/* Description */}
          <Card style={{marginBottom:16}}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:10}}>Тайлбар</h3>
            <p style={{fontSize:14,color:'#A1A1AA',lineHeight:1.7}}>Энэ preset нь дэлхийн жишгийн профессиональ зург үүсгэнэ. Гэрэл зургийн студи яаралтай хэрэгтэй байгаа бизнесийн хүмүүст зориулсан. Энгийн тохиргоогоор мэргэжлийн дүр төрхтэй зураг авах боломжтой.</p>
          </Card>
          {/* Ratings */}
          <Card>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <h3 style={{fontSize:15,fontWeight:700}}>Үнэлгээ</h3>
              <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:24,fontWeight:800}}>{preset.rating}</span><div style={{fontSize:16,color:'#FBBF24'}}>★★★★★</div></div>
            </div>
            {[['Батбаяр Д.','Маш гайхалтай!',5,'1 цаг өмнө'],['Нарантуяа.Г','Хурдан, чанартай',4,'3 цаг өмнө'],['Ганбаатар.М','Сайн байна',5,'Өчигдөр']].map(([n,c,r,t],i)=>(
              <div key={i} style={{padding:'12px 0',borderTop:'1px solid rgba(255,255,255,.06)'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${['#7C3AED,#38BDF8','#EC4899,#7C3AED','#38BDF8,#4ADE80'][i]})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700}}>{n[0]}</div>
                  <div><div style={{fontSize:13,fontWeight:600}}>{n}</div><div style={{fontSize:11,color:'#52525B'}}>{t}</div></div>
                  <div style={{marginLeft:'auto',color:'#FBBF24',fontSize:12}}>{'★'.repeat(r)}</div>
                </div>
                <p style={{fontSize:13,color:'#A1A1AA',marginLeft:36}}>{c}</p>
              </div>
            ))}
          </Card>
        </div>
        {/* Sidebar */}
        <div>
          <Card style={{marginBottom:14}}>
            <h2 style={{fontSize:18,fontWeight:800,letterSpacing:'-.5px',marginBottom:6}}>{preset.name}</h2>
            <div style={{fontSize:12,color:'#52525B',marginBottom:14}}>{preset.cat} • {preset.uses.toLocaleString()} удаа ашиглагдсан</div>
            {preset.creator && <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px',background:'rgba(255,255,255,.04)',borderRadius:8,marginBottom:14}}><div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#EC4899)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700}}>{preset.creator[0]}</div><div><div style={{fontSize:13,fontWeight:600}}>{preset.creator}</div><div style={{fontSize:11,color:'#52525B'}}>Creator</div></div></div>}
            {/* Cost breakdown */}
            <div style={{background:'rgba(124,58,237,.08)',border:'1px solid rgba(124,58,237,.2)',borderRadius:10,padding:14,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:'#9D5FF5',textTransform:'uppercase',letterSpacing:'1px',marginBottom:10}}>Credit зарцуулалт</div>
              {[['Үндсэн генерац','1 cr'],preset.cr>1?['Чанарын нэмэлт',`+${preset.cr-1} cr`]:null,preset.creator?['Creator reward','+1 cr']:null].filter(Boolean).map(([l,v],i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'5px 0',borderBottom:'1px solid rgba(124,58,237,.15)',color:'#A1A1AA'}}><span>{l}</span><span style={{fontWeight:600,color:'#C4B5FD'}}>{v}</span></div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',fontSize:15,fontWeight:700,marginTop:8}}><span>Нийт</span><span style={{color:'#9D5FF5'}}>{preset.cr+(preset.creator?1:0)} cr</span></div>
            </div>
            <button onClick={()=>nav('generate')} style={{width:'100%',background:'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'#fff',border:'none',borderRadius:10,padding:'14px',fontSize:15,fontWeight:600,cursor:'pointer',boxShadow:'0 0 20px rgba(124,58,237,.35)',fontFamily:'inherit',marginBottom:10}}>Үүсгэж эхлэх →</button>
            <button style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'#A1A1AA',borderRadius:10,padding:'11px',fontSize:14,cursor:'pointer',fontFamily:'inherit'}}>Хадгалах</button>
          </Card>
          {/* Required inputs */}
          <Card>
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>Шаардлагатай оролт</h3>
            {[['◻','Зураг оруулах','Тань заавал зураг оруулах шаардлагатай'],['Aa','Текст оруулах','Нэр эсвэл тайлбар бичнэ'],['◉','Өнгө сонголт','Үндсэн өнгийг сонгоно']].map(([ic,t,d],i)=>(
              <div key={i} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:i<2?'1px solid rgba(255,255,255,.06)':'none'}}>
                <span style={{fontSize:16}}>{ic}</span>
                <div><div style={{fontSize:13,fontWeight:600}}>{t}</div><div style={{fontSize:12,color:'#52525B'}}>{d}</div></div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── GENERATE WORKSPACE ──────────────────────────────────── */
function GeneratePage({preset,nav}) {
  const [quality,setQuality]=useState('standard');
  const [size,setSize]=useState('1:1');
  const [color,setColor]=useState('#7C3AED');
  const [text,setText]=useState('');
  const [state,setState]=useState('idle'); // idle | loading | done | error
  const p=preset||PRESETS[0];
  const baseCr=p.cr; const qualCr=quality==='hd'?1:0; const creatCr=p.creator?1:0; const total=baseCr+qualCr+creatCr;

  function generate(){
    setState('loading');
    setTimeout(()=>setState('done'),2800);
  }
  return (
    <div style={{maxWidth:1100,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button onClick={()=>nav('presets')} style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'#A1A1AA',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:13,fontFamily:'inherit',display:'flex',alignItems:'center',gap:6}}>← Буцах</button>
        <div style={{flex:1}}>
          <h2 style={{fontSize:18,fontWeight:700,letterSpacing:'-.5px'}}>{p.name}</h2>
          <div style={{fontSize:13,color:'#52525B'}}>{p.cat}</div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'380px 1fr',gap:20}}>
        {/* LEFT: Options */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* Image upload */}
          <Card>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Зураг оруулах</div>
            <div style={{border:'2px dashed rgba(255,255,255,.1)',borderRadius:10,padding:24,textAlign:'center',cursor:'pointer',transition:'border-color .2s'}}
              onMouseOver={e=>e.currentTarget.style.borderColor='rgba(124,58,237,.4)'}
              onMouseOut={e=>e.currentTarget.style.borderColor='rgba(255,255,255,.1)'}>
              <div style={{fontSize:20,marginBottom:8,color:'#52525B'}}>⬆</div>
              <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>Зураг чирж тавих</div>
              <div style={{fontSize:12,color:'#52525B'}}>PNG, JPG, WEBP — 10MB хүртэл</div>
              <button style={{marginTop:12,background:'var(--bdr)',border:'1px solid rgba(255,255,255,.1)',color:'#A1A1AA',borderRadius:8,padding:'7px 16px',cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>Файл сонгох</button>
            </div>
          </Card>
          {/* Text input */}
          <Card>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Текст оруулах</div>
            <input value={text} onChange={e=>setText(e.target.value)} placeholder="Нэр, тайлбар эсвэл гарчиг..." style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'10px 14px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit'}} />
            <div style={{fontSize:11,color:'#52525B',marginTop:6}}>Зурагт оруулах текстийн агуулга</div>
          </Card>
          {/* Color */}
          <Card>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Өнгө сонголт</div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {['#7C3AED','#EC4899','#38BDF8','#10B981','#F59E0B','#EF4444','#F97316','#1D4ED8'].map(c=>(
                <div key={c} onClick={()=>setColor(c)} style={{width:32,height:32,borderRadius:'50%',background:c,cursor:'pointer',border:`2px solid ${color===c?'#fff':'transparent'}`,boxShadow:color===c?`0 0 12px ${c}80`:'none',transition:'all .15s'}}></div>
              ))}
            </div>
          </Card>
          {/* Size */}
          <Card>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Хэмжээ</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[['1:1','1024×1024',0],['16:9','1920×1080',0],['9:16','1080×1920',0],['4:3','1024×768',1]].map(([s,d,ex])=>(
                <button key={s} onClick={()=>setSize(s)} style={{padding:'10px',borderRadius:8,border:`1px solid ${size===s?'rgba(124,58,237,.5)':'rgba(255,255,255,.08)'}`,background:size===s?'rgba(124,58,237,.12)':'rgba(255,255,255,.03)',cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
                  <div style={{fontSize:13,fontWeight:600,color:size===s?'#C4B5FD':'#fff'}}>{s}</div>
                  <div style={{fontSize:11,color:'#52525B'}}>{d}</div>
                  {ex>0&&<div style={{fontSize:10,color:'#9D5FF5',marginTop:2}}>+{ex} cr</div>}
                </button>
              ))}
            </div>
          </Card>
          {/* Quality */}
          <Card>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Чанар</div>
            <div style={{display:'flex',gap:8}}>
              {[['standard','Стандарт',0],['hd','HD Чанар',1]].map(([q,l,ex])=>(
                <button key={q} onClick={()=>setQuality(q)} style={{flex:1,padding:'10px 12px',borderRadius:8,border:`1px solid ${quality===q?'rgba(124,58,237,.5)':'rgba(255,255,255,.08)'}`,background:quality===q?'rgba(124,58,237,.12)':'rgba(255,255,255,.03)',cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
                  <div style={{fontSize:13,fontWeight:600,color:quality===q?'#C4B5FD':'#fff'}}>{l}</div>
                  {ex>0&&<div style={{fontSize:11,color:'#9D5FF5'}}>+{ex} cr</div>}
                </button>
              ))}
            </div>
          </Card>
          {/* Cost + Generate */}
          <Card style={{background:'linear-gradient(135deg,rgba(124,58,237,.1),rgba(17,17,28,1))'}}>
            <div style={{fontSize:12,fontWeight:700,color:'#9D5FF5',textTransform:'uppercase',letterSpacing:'1px',marginBottom:12}}>Credit зарцуулалт</div>
            {[['Үндсэн генерац',`${baseCr} cr`],['Чанарын нэмэлт',qualCr>0?`+${qualCr} cr`:'—'],['Creator reward',creatCr>0?`+${creatCr} cr`:'—']].map(([l,v],i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'5px 0',borderBottom:'1px solid rgba(124,58,237,.1)',color:'#A1A1AA'}}><span>{l}</span><span style={{fontWeight:600,color:v==='—'?'#3F3F46':'#C4B5FD'}}>{v}</span></div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',fontSize:16,fontWeight:700,marginTop:10,marginBottom:16}}><span>Нийт</span><span style={{color:'#9D5FF5'}}>{total} cr</span></div>
            <button onClick={generate} disabled={state==='loading'} style={{width:'100%',background:state==='loading'?'rgba(124,58,237,.3)':'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'#fff',border:'none',borderRadius:10,padding:'14px',fontSize:15,fontWeight:600,cursor:state==='loading'?'not-allowed':'pointer',boxShadow:'0 0 20px rgba(124,58,237,.35)',fontFamily:'inherit',transition:'all .2s'}}>
              {state==='loading'?'Үүсгэж байна...':'Үүсгэх'}
            </button>
          </Card>
        </div>
        {/* RIGHT: Result */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card style={{flex:1,minHeight:400,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
            {state==='idle' && (
              <div style={{textAlign:'center',color:'#3F3F46'}}>
                <div style={{fontSize:36,marginBottom:12,color:'#3F3F46'}}>◻</div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:6,color:'#52525B'}}>Үр дүн энд гарна</div>
                <div style={{fontSize:13}}>Тохиргоо хийж үүсгэх товч дарна уу</div>
              </div>
            )}
            {state==='loading' && (
              <div style={{textAlign:'center'}}>
                <div style={{width:80,height:80,borderRadius:'50%',border:'3px solid rgba(124,58,237,.2)',borderTop:'3px solid #7C3AED',animation:'spin 1s linear infinite',margin:'0 auto 20px'}}></div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>AI боловсруулж байна...</div>
                <div style={{fontSize:13,color:'#52525B'}}>Дунджаар 15–30 секунд</div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}
            {state==='done' && (
              <div style={{width:'100%',height:'100%',minHeight:400,display:'flex',flexDirection:'column',gap:0}}>
                <div style={{flex:1,minHeight:340,background:GradThumbs[p.g],borderRadius:10,position:'relative'}}>
                  <div style={{position:'absolute',top:12,right:12}}><Pill color='green'>✓ Амжилттай</Pill></div>
                </div>
                <div style={{display:'flex',gap:10,marginTop:14,flexWrap:'wrap'}}>
                  <button style={{flex:1,background:'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'#fff',border:'none',borderRadius:8,padding:'10px 14px',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit'}}>⬇ Татаж авах</button>
                  <button style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',borderRadius:8,padding:'10px 14px',cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>🔄 Дахин үүсгэх</button>
                  <button style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',borderRadius:8,padding:'10px 14px',cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>💾 Хадгалах</button>
                </div>
                <div style={{marginTop:14,background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#4ADE80'}}>
                  ✓ {total} credit зарцуулагдлаа · Үлдэгдэл: {24-total} credit
                </div>
              </div>
            )}
            {state==='error' && (
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:28,marginBottom:12,color:'#EF4444'}}>✕</div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:6,color:'#EF4444'}}>Алдаа гарлаа</div>
                <div style={{fontSize:13,color:'#A1A1AA',marginBottom:16}}>Техникийн алдааны улмаас үүсгэж чадсангүй</div>
                <div style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#4ADE80',marginBottom:16}}>✓ {total} credit буцаагдлаа</div>
                <button onClick={generate} style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'#fff',border:'none',borderRadius:8,padding:'10px 20px',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit'}}>🔄 Дахин оролдох</button>
              </div>
            )}
          </Card>
          {/* Examples row */}
          <Card style={{padding:16}}>
            <div style={{fontSize:12,color:'#52525B',marginBottom:10}}>Жишээ гаралтууд</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
              {[0,1,2,3].map(i=><div key={i} style={{aspectRatio:'1',borderRadius:8,background:GradThumbs[(p.g+i)%GradThumbs.length],cursor:'pointer',border:'1px solid rgba(255,255,255,.07)'}}></div>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardPage, PresetsPage, PresetDetailPage, GeneratePage, PRESETS, GradThumbs, Card, Pill, SectionTitle });
