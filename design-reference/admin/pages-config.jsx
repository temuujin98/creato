// admin/pages-config.jsx — Categories, Types, Models, Sizes, Quality, CreditPackages, Settings, Logs
const { useState } = React;

function makeSortable(data, defCol, defDir='asc') {
  const [sortCol, setSortCol] = useState(defCol||null);
  const [sortDir, setSortDir] = useState(defDir);
  function onSort(col){if(sortCol===col)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortCol(col);setSortDir('asc');}}
  const sorted = sortCol ? [...data].sort((a,b)=>{let av=a[sortCol],bv=b[sortCol];if(typeof av==='string'){av=av.toLowerCase();bv=bv.toLowerCase();}return sortDir==='asc'?(av>bv?1:-1):(av<bv?1:-1);}) : data;
  return {sorted,sortCol,sortDir,onSort};
}

function STH({children,col,sortCol,sortDir,onSort,w,align}) {
  const active=col&&sortCol===col;
  return <th onClick={col?()=>onSort(col):undefined} style={{padding:'10px 12px',textAlign:align||'left',fontSize:11,fontWeight:700,color:active?'#C4B5FD':'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:w,cursor:col?'pointer':'default',userSelect:'none',whiteSpace:'nowrap',transition:'color .15s'}}>
    {children}{col&&<span style={{marginLeft:4,display:'inline-flex',flexDirection:'column',gap:1,verticalAlign:'middle',opacity:active?1:0.3}}>
      <svg width="7" height="5" viewBox="0 0 7 5" fill={active&&sortDir==='asc'?'#9D5FF5':'#71717A'}><polygon points="3.5,0 7,5 0,5"/></svg>
      <svg width="7" height="5" viewBox="0 0 7 5" fill={active&&sortDir==='desc'?'#9D5FF5':'#71717A'}><polygon points="3.5,5 7,0 0,0"/></svg>
    </span>}
  </th>;
}
function NTH() { return <th style={{padding:'10px 12px',fontSize:11,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:40}}>№</th>; }
function NTD({n}) { return <td style={{padding:'10px 12px',fontSize:12,fontWeight:600,color:'#52525B'}}>{n}</td>; }
function CTD({children,style={}}) { return <td style={{padding:'10px 12px',fontSize:13,color:'#E4E4E7',...style}}>{children}</td>; }

/* ── CATEGORIES ──────────────────────────────────────────── */
function AdminCategoriesPage(){
  const RAW=[{id:1,name:'Портрет',order:1,active:true,presets:4},{id:2,name:'Бизнес',order:2,active:true,presets:3},{id:3,name:'Соц медиа',order:3,active:true,presets:2},{id:4,name:'Урлаг',order:4,active:true,presets:2},{id:5,name:'Брэнд',order:5,active:true,presets:1},{id:6,name:'Байгаль',order:6,active:true,presets:1},{id:7,name:'Зар',order:7,active:false,presets:1}];
  const {sorted:cats,sortCol,sortDir,onSort}=makeSortable(RAW,'order');
  const sp={sortCol,sortDir,onSort};
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontSize:16,fontWeight:700}}>Ангилалууд</h2>
        <SmBtn color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' style={{fontWeight:600,border:'none'}}>+ Ангилал нэмэх</SmBtn>
      </div>
      <ACard style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            <NTH/><STH col="name" {...sp}>Нэр</STH><STH col="presets" align="right" {...sp}>Presets</STH><STH col="order" {...sp}>Дараалал</STH><STH col="active" {...sp}>Статус</STH><th></th>
          </tr></thead>
          <tbody>{cats.map((c,i)=>(
            <tr key={c.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <NTD n={i+1}/><CTD style={{fontWeight:500}}>{c.name}</CTD>
              <CTD style={{textAlign:'right',color:'#A1A1AA'}}>{c.presets}</CTD>
              <CTD style={{color:'#71717A'}}>{c.order}</CTD>
              <CTD><APill color={c.active?'green':'gray'}>{c.active?'Идэвхтэй':'Идэвхгүй'}</APill></CTD>
              <CTD><div style={{display:'flex',gap:4}}><SmBtn>Засах</SmBtn><SmBtn color='#EF4444' bg='rgba(239,68,68,.06)'>Устгах</SmBtn></div></CTD>
            </tr>
          ))}</tbody>
        </table>
      </ACard>
    </div>
  );
}

/* ── TYPES ────────────────────────────────────────────────── */
function AdminTypesPage(){
  const tRAW=[{id:1,name:'Зургийн генерац',active:true,order:1},{id:2,name:'Зураг засварлах',active:true,order:2},{id:3,name:'Текст-зураг',active:true,order:3},{id:4,name:'Зураг-зураг',active:false,order:4}];
  const {sorted:types,sortCol:tSC,sortDir:tSD,onSort:tOS}=makeSortable(tRAW,'order');
  const tsp={sortCol:tSC,sortDir:tSD,onSort:tOS};
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontSize:16,fontWeight:700}}>Төрлүүд</h2>
        <SmBtn color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' style={{fontWeight:600,border:'none'}}>+ Төрөл нэмэх</SmBtn>
      </div>
      <ACard style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            <NTH/><STH col="name" {...tsp}>Нэр</STH><STH col="order" {...tsp}>Дараалал</STH><STH col="active" {...tsp}>Статус</STH><th></th>
          </tr></thead>
          <tbody>{types.map((t,i)=>(
            <tr key={t.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <NTD n={i+1}/><CTD style={{fontWeight:500}}>{t.name}</CTD><CTD style={{color:'#71717A'}}>{t.order}</CTD>
              <CTD><APill color={t.active?'green':'gray'}>{t.active?'Идэвхтэй':'Идэвхгүй'}</APill></CTD>
              <CTD><div style={{display:'flex',gap:4}}><SmBtn>Засах</SmBtn><SmBtn color='#EF4444' bg='rgba(239,68,68,.06)'>Устгах</SmBtn></div></CTD>
            </tr>
          ))}</tbody>
        </table>
      </ACard>
    </div>
  );
}

/* ── MODELS ───────────────────────────────────────────────── */
function AdminModelsPage(){
  const RAW_M=[
    {id:1,provider:'OpenAI',name:'DALL-E 3',active:true,img:true,txt:true,cost:'$0.04',fallback:'SDXL'},
    {id:2,provider:'Stability AI',name:'SDXL',active:true,img:true,txt:false,cost:'$0.02',fallback:null},
    {id:3,provider:'Midjourney',name:'Midjourney v6',active:true,img:false,txt:false,cost:'$0.05',fallback:'DALL-E 3'},
    {id:4,provider:'OpenAI',name:'DALL-E 2',active:false,img:true,txt:false,cost:'$0.02',fallback:null},
  ];
  const {sorted:models,sortCol:mSC,sortDir:mSD,onSort:mOS}=makeSortable(RAW_M,'id');
  const msp={sortCol:mSC,sortDir:mSD,onSort:mOS};
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontSize:16,fontWeight:700}}>AI Models</h2>
        <SmBtn color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' style={{fontWeight:600,border:'none'}}>+ Модел нэмэх</SmBtn>
      </div>
      <ACard style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            <NTH/><STH col="provider" {...msp}>Provider</STH><STH col="name" {...msp}>Модел</STH>
            <th style={{padding:'10px 12px',fontSize:11,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.8px'}}>API Key</th>
            <STH col="img" {...msp}>Image</STH><STH col="txt" {...msp}>Text</STH>
            <STH col="cost" {...msp}>Cost</STH><STH col="fallback" {...msp}>Fallback</STH>
            <STH col="active" {...msp}>Статус</STH><th></th>
          </tr></thead>
          <tbody>{models.map((m,i)=>(
            <tr key={m.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <NTD n={i+1}/>
              <CTD style={{color:'#A1A1AA'}}>{m.provider}</CTD>
              <CTD style={{fontWeight:500}}>{m.name}</CTD>
              <CTD style={{color:'#3F3F46',fontFamily:'monospace',fontSize:11}}>sk-****...{m.id}f8</CTD>
              <CTD>{m.img?<APill color='green'>✓</APill>:<APill color='gray'>—</APill>}</CTD>
              <CTD>{m.txt?<APill color='green'>✓</APill>:<APill color='gray'>—</APill>}</CTD>
              <CTD style={{color:'#A1A1AA',fontSize:12}}>{m.cost}/img</CTD>
              <CTD style={{color:'#71717A',fontSize:12}}>{m.fallback||'—'}</CTD>
              <CTD><APill color={m.active?'green':'gray'}>{m.active?'Идэвхтэй':'Идэвхгүй'}</APill></CTD>
              <CTD><SmBtn>Засах</SmBtn></CTD>
            </tr>
          ))}</tbody>
        </table>
      </ACard>
    </div>
  );
}

/* ── SIZE OPTIONS ────────────────────────────────────────── */
function AdminSizesPage(){
  const RAW_SZ=[{id:1,name:'1:1',ratio:'1:1',dim:'1024×1024',extra:0,active:true,order:1},{id:2,name:'16:9',ratio:'16:9',dim:'1920×1080',extra:0,active:true,order:2},{id:3,name:'9:16',ratio:'9:16',dim:'1080×1920',extra:0,active:true,order:3},{id:4,name:'4:3',ratio:'4:3',dim:'1024×768',extra:1,active:true,order:4}];
  const {sorted:sizes,sortCol:szSC,sortDir:szSD,onSort:szOS}=makeSortable(RAW_SZ,'order');
  const szsp={sortCol:szSC,sortDir:szSD,onSort:szOS};
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontSize:16,fontWeight:700}}>Хэмжээний сонголтууд</h2>
        <SmBtn color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' style={{fontWeight:600,border:'none'}}>+ Хэмжээ нэмэх</SmBtn>
      </div>
      <ACard style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            <NTH/><STH col="name" {...szsp}>Нэр</STH><STH col="ratio" {...szsp}>Ratio</STH>
            <STH col="dim" {...szsp}>Dimension</STH><STH col="extra" align="right" {...szsp}>Нэмэлт cr</STH>
            <STH col="order" {...szsp}>Дараалал</STH><STH col="active" {...szsp}>Статус</STH><th></th>
          </tr></thead>
          <tbody>{sizes.map((s,i)=>(
            <tr key={s.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <NTD n={i+1}/><CTD style={{fontWeight:500}}>{s.name}</CTD><CTD style={{color:'#A1A1AA'}}>{s.ratio}</CTD><CTD style={{color:'#71717A',fontSize:12}}>{s.dim}</CTD>
              <CTD style={{textAlign:'right',color:s.extra?'#C4B5FD':'#3F3F46'}}>{s.extra?`+${s.extra}`:'—'}</CTD>
              <CTD style={{color:'#71717A'}}>{s.order}</CTD>
              <CTD><APill color={s.active?'green':'gray'}>{s.active?'Идэвхтэй':'Идэвхгүй'}</APill></CTD>
              <CTD><SmBtn>Засах</SmBtn></CTD>
            </tr>
          ))}</tbody>
        </table>
      </ACard>
    </div>
  );
}

/* ── QUALITY OPTIONS ─────────────────────────────────────── */
function AdminQualityPage(){
  const RAW_Q=[{id:1,name:'Стандарт',desc:'Энгийн чанар',extra:0,active:true,order:1},{id:2,name:'HD',desc:'Өндөр нарийвчлал',extra:1,active:true,order:2}];
  const {sorted:quals,sortCol:qSC,sortDir:qSD,onSort:qOS}=makeSortable(RAW_Q,'order');
  const qsp={sortCol:qSC,sortDir:qSD,onSort:qOS};
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontSize:16,fontWeight:700}}>Чанарын сонголтууд</h2>
        <SmBtn color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' style={{fontWeight:600,border:'none'}}>+ Чанар нэмэх</SmBtn>
      </div>
      <ACard style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            <NTH/><STH col="name" {...qsp}>Нэр</STH><STH col="desc" {...qsp}>Тайлбар</STH>
            <STH col="extra" align="right" {...qsp}>Нэмэлт cr</STH>
            <STH col="order" {...qsp}>Дараалал</STH><STH col="active" {...qsp}>Статус</STH><th></th>
          </tr></thead>
          <tbody>{quals.map((q,i)=>(
            <tr key={q.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <NTD n={i+1}/><CTD style={{fontWeight:500}}>{q.name}</CTD><CTD style={{color:'#A1A1AA'}}>{q.desc}</CTD>
              <CTD style={{textAlign:'right',color:q.extra?'#C4B5FD':'#3F3F46'}}>{q.extra?`+${q.extra}`:'—'}</CTD>
              <CTD style={{color:'#71717A'}}>{q.order}</CTD>
              <CTD><APill color={q.active?'green':'gray'}>{q.active?'Идэвхтэй':'Идэвхгүй'}</APill></CTD>
              <CTD><SmBtn>Засах</SmBtn></CTD>
            </tr>
          ))}</tbody>
        </table>
      </ACard>
    </div>
  );
}

/* ── CREDIT PACKAGES ─────────────────────────────────────── */
function AdminPackagesPage(){
  const RAW_PKG=[{id:1,cr:10,price:9900,bonus:0,active:true,order:1},{id:2,cr:25,price:24750,bonus:0,active:true,order:2},{id:3,cr:50,price:49500,bonus:0,active:true,order:3},{id:4,cr:100,price:99000,bonus:0,active:true,order:4},{id:5,cr:'Corp',price:null,bonus:0,active:true,order:5}];
  const {sorted:pkgs,sortCol:pkSC,sortDir:pkSD,onSort:pkOS}=makeSortable(RAW_PKG,'order');
  const pksp={sortCol:pkSC,sortDir:pkSD,onSort:pkOS};
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontSize:16,fontWeight:700}}>Credit багцууд</h2>
        <SmBtn color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' style={{fontWeight:600,border:'none'}}>+ Багц нэмэх</SmBtn>
      </div>
      <ACard style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            <NTH/><STH col="cr" {...pksp}>Credit</STH><STH col="price" align="right" {...pksp}>Үнэ (₮)</STH>
            <STH col="bonus" align="right" {...pksp}>Бонус cr</STH>
            <STH col="order" {...pksp}>Дараалал</STH><STH col="active" {...pksp}>Статус</STH><th></th>
          </tr></thead>
          <tbody>{pkgs.map((p,i)=>(
            <tr key={p.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <NTD n={i+1}/><CTD style={{fontWeight:600}}>{p.cr}</CTD>
              <CTD style={{textAlign:'right',color:'#E4E4E7'}}>{p.price?p.price.toLocaleString()+'₮':'Тусгай'}</CTD>
              <CTD style={{textAlign:'right',color:p.bonus?'#4ADE80':'#3F3F46'}}>{p.bonus||'—'}</CTD>
              <CTD style={{color:'#71717A'}}>{p.order}</CTD>
              <CTD><APill color={p.active?'green':'gray'}>{p.active?'Идэвхтэй':'Идэвхгүй'}</APill></CTD>
              <CTD><SmBtn>Засах</SmBtn></CTD>
            </tr>
          ))}</tbody>
        </table>
      </ACard>
    </div>
  );
}

/* ── SETTINGS ────────────────────────────────────────────── */
function AdminSettingsPage(){
  return (
    <div style={{maxWidth:600,margin:'0 auto'}}>
      <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Ерөнхий тохиргоо</h2>
      <ACard>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Сайтын нэр</label><input defaultValue="Creato" style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit'}} /></div>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>1 credit үнэ (₮)</label><input type="number" defaultValue={990} style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit'}} /></div>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Бүртгэлийн үнэгүй credit</label><input type="number" defaultValue={0} style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit'}} /></div>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Дэмжлэг имэйл</label><input defaultValue="support@creato.mn" style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit'}} /></div>
          <ACheckbox label="Maintenance горим" defaultChecked={false}/>
          <SmBtn color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' style={{fontWeight:600,border:'none',padding:'10px 20px',alignSelf:'flex-start'}}>Хадгалах</SmBtn>
        </div>
      </ACard>
    </div>
  );
}

/* ── LOGS ─────────────────────────────────────────────────── */
function AdminLogsPage(){
  const RAW_LOG=[
    {who:'Admin',action:'Preset #1 засварласан',entity:'preset',date:'2024-06-04 10:22'},
    {who:'Admin',action:'Хэрэглэгч #42-д 5 cr нэмсэн',entity:'user',date:'2024-06-04 09:15'},
    {who:'Admin',action:'Preset #6 зөвшөөрсөн',entity:'preset',date:'2024-06-03 18:40'},
    {who:'Admin',action:'Credit багц үнэ солигдсон',entity:'settings',date:'2024-06-03 14:20'},
    {who:'Admin',action:'Модел SDXL нэмсэн',entity:'model',date:'2024-06-02 11:00'},
    {who:'Admin',action:'Хэрэглэгч #18 блоклосон',entity:'user',date:'2024-06-01 16:30'},
  ];
  const {sorted:logs,sortCol:lSC,sortDir:lSD,onSort:lOS}=makeSortable(RAW_LOG,'date');
  const lsp={sortCol:lSC,sortDir:lSD,onSort:lOS};
  return (
    <div>
      <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Admin логууд</h2>
      <ACard style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            <th style={{padding:'10px 12px',fontSize:11,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:40}}>№</th>
            <STH col="who" {...lsp}>Хэн</STH><STH col="action" {...lsp}>Үйлдэл</STH>
            <STH col="entity" {...lsp}>Төрөл</STH><STH col="date" {...lsp}>Огноо</STH>
          </tr></thead>
          <tbody>{logs.map((l,i)=>(
            <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <td style={{padding:'10px 12px',fontSize:12,fontWeight:600,color:'#52525B'}}>{i+1}</td>
              <CTD style={{fontWeight:500}}>{l.who}</CTD><CTD>{l.action}</CTD>
              <CTD><APill color='gray'>{l.entity}</APill></CTD><CTD style={{color:'#71717A',fontSize:12}}>{l.date}</CTD>
            </tr>
          ))}</tbody>
        </table>
      </ACard>
    </div>
  );
}

Object.assign(window, { AdminCategoriesPage, AdminTypesPage, AdminModelsPage, AdminSizesPage, AdminQualityPage, AdminPackagesPage, AdminSettingsPage, AdminLogsPage });
