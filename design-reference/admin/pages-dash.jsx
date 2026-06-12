// admin/pages-dash.jsx — Admin Dashboard + Presets + PresetEditor + Reviews
const { useState, useEffect, useRef } = React;

/* ── shared ──────────────────────────────────────────────── */
const ACard=({children,style={}})=><div style={{background:'#12121C',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:20,...style}}>{children}</div>;
const APill=({children,color='purple'})=>{
  const m={purple:'rgba(124,58,237,.15),rgba(124,58,237,.25),#C4B5FD',blue:'rgba(56,189,248,.12),rgba(56,189,248,.2),#38BDF8',pink:'rgba(236,72,153,.12),rgba(236,72,153,.2),#EC4899',green:'rgba(74,222,128,.12),rgba(74,222,128,.2),#4ADE80',amber:'rgba(251,191,36,.12),rgba(251,191,36,.2),#FBBF24',red:'rgba(239,68,68,.12),rgba(239,68,68,.2),#EF4444',gray:'rgba(255,255,255,.07),rgba(255,255,255,.1),#A1A1AA'};
  const [bg,bdr,txt]=m[color].split(',');
  return <span style={{display:'inline-flex',alignItems:'center',gap:3,background:bg,border:`1px solid ${bdr}`,borderRadius:100,padding:'2px 8px',fontSize:11,fontWeight:600,color:txt,whiteSpace:'nowrap'}}>{children}</span>;
};
const TH=({children,w,align,col,sortCol,sortDir,onSort})=>{
  const active=col&&sortCol===col;
  return <th onClick={col?()=>onSort(col):undefined} style={{padding:'10px 12px',textAlign:align||'left',fontSize:11,fontWeight:700,color:active?'#C4B5FD':'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:w,cursor:col?'pointer':'default',userSelect:'none',whiteSpace:'nowrap',transition:'color .15s'}}>
    {children}
    {col&&<span style={{marginLeft:4,display:'inline-flex',flexDirection:'column',gap:1,verticalAlign:'middle',opacity:active?1:0.3}}>
      <svg width="7" height="5" viewBox="0 0 7 5" fill={active&&sortDir==='asc'?'#9D5FF5':'#71717A'}><polygon points="3.5,0 7,5 0,5"/></svg>
      <svg width="7" height="5" viewBox="0 0 7 5" fill={active&&sortDir==='desc'?'#9D5FF5':'#71717A'}><polygon points="3.5,5 7,0 0,0"/></svg>
    </span>}
  </th>;
};
const TD=({children,style={}})=><td style={{padding:'10px 12px',fontSize:13,color:'#E4E4E7',...style}}>{children}</td>;
const SmBtn=({children,color='#A1A1AA',bg='rgba(255,255,255,.05)',onClick,style={}})=><button onClick={onClick} style={{background:bg,border:'1px solid rgba(255,255,255,.07)',color,borderRadius:6,padding:'5px 10px',cursor:'pointer',fontSize:12,fontFamily:'inherit',...style}} onMouseOver={e=>e.currentTarget.style.opacity='.8'} onMouseOut={e=>e.currentTarget.style.opacity='1'}>{children}</button>;

/* ── CHART HELPERS ───────────────────────────────────────── */
const chartDefaults = {
  color:'rgba(255,255,255,.55)',
  gridColor:'rgba(255,255,255,.05)',
  tooltipBg:'#1A1A2E',
};

function LineChart({ data }) {
  const ref = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (inst.current) inst.current.destroy();
    inst.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Орлого (₮ мян)',
            data: data.revenue,
            borderColor: '#7C3AED',
            backgroundColor: 'rgba(124,58,237,.12)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#7C3AED',
            fill: true,
            tension: 0.4,
            yAxisID: 'y',
          },
          {
            label: 'Credit зарагдсан',
            data: data.credits,
            borderColor: '#38BDF8',
            backgroundColor: 'rgba(56,189,248,.08)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#38BDF8',
            fill: true,
            tension: 0.4,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: chartDefaults.color, boxWidth: 10, font: { size: 11 } } },
          tooltip: {
            backgroundColor: chartDefaults.tooltipBg,
            borderColor: 'rgba(255,255,255,.08)',
            borderWidth: 1,
            titleColor: '#fff',
            bodyColor: '#A1A1AA',
            padding: 10,
          },
        },
        scales: {
          x: { ticks: { color: chartDefaults.color, font:{size:11} }, grid: { color: chartDefaults.gridColor } },
          y: { position:'left', ticks: { color:'#C4B5FD', font:{size:11} }, grid: { color: chartDefaults.gridColor } },
          y1: { position:'right', ticks: { color:'#38BDF8', font:{size:11} }, grid: { display:false } },
        },
      },
    });
    return () => { if (inst.current) inst.current.destroy(); };
  }, []);
  return <canvas ref={ref} style={{width:'100%',height:'100%'}} />;
}

function DonutChart({ data }) {
  const ref = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (inst.current) inst.current.destroy();
    inst.current = new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: ['#4ADE80','#EF4444','#38BDF8','#FBBF24'],
          borderColor: '#12121C',
          borderWidth: 3,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position:'bottom', labels:{ color:chartDefaults.color, boxWidth:10, padding:12, font:{size:11} } },
          tooltip: {
            backgroundColor: chartDefaults.tooltipBg,
            borderColor:'rgba(255,255,255,.08)',
            borderWidth:1,
            titleColor:'#fff',
            bodyColor:'#A1A1AA',
            padding:10,
          },
        },
      },
    });
    return () => { if (inst.current) inst.current.destroy(); };
  }, []);
  return <canvas ref={ref} style={{width:'100%',height:'100%'}} />;
}

function BarChart({ data }) {
  const ref = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (inst.current) inst.current.destroy();
    inst.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Ашиглалт',
          data: data.values,
          backgroundColor: [
            'rgba(124,58,237,.7)','rgba(56,189,248,.7)','rgba(236,72,153,.7)',
            'rgba(74,222,128,.7)','rgba(251,191,36,.7)',
          ],
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: chartDefaults.tooltipBg,
            borderColor:'rgba(255,255,255,.08)',
            borderWidth:1,
            titleColor:'#fff',
            bodyColor:'#A1A1AA',
            padding:10,
          },
        },
        scales: {
          x: { ticks:{ color:chartDefaults.color, font:{size:11} }, grid:{ color:chartDefaults.gridColor } },
          y: { ticks:{ color:'#A1A1AA', font:{size:12} }, grid:{ display:false } },
        },
      },
    });
    return () => { if (inst.current) inst.current.destroy(); };
  }, []);
  return <canvas ref={ref} style={{width:'100%',height:'100%'}} />;
}

/* ── TOP PRESETS TABLE ───────────────────────────────────── */
function TopPresetsTable({topPresets}) {
  const [sortCol,setSortCol]=useState('u');
  const [sortDir,setSortDir]=useState('desc');
  function onSort(col){if(sortCol===col)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortCol(col);setSortDir('asc');}}
  const rows=[...topPresets].sort((a,b)=>{let av=a[sortCol],bv=b[sortCol];return sortDir==='asc'?(av>bv?1:-1):(av<bv?1:-1);});
  const sp={sortCol,sortDir,onSort};
  return (
    <ACard>
      <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Шилдэг presets</div>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
          <TH w="40">№</TH>
          <TH col="n" {...sp}>Preset</TH>
          <TH col="u" align="right" {...sp}>Ашиглалт</TH>
          <TH col="cr" align="right" {...sp}>Credit</TH>
        </tr></thead>
        <tbody>{rows.map((p,i)=>(
          <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.04)',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
            <TD style={{color:'#52525B',fontWeight:600}}>{i+1}</TD>
            <TD style={{fontWeight:500,color:'#E4E4E7'}}>{p.n}</TD>
            <TD style={{textAlign:'right',color:'#A1A1AA'}}>{p.u.toLocaleString()}</TD>
            <TD style={{textAlign:'right',fontWeight:600,color:'#C4B5FD'}}>{p.cr.toLocaleString()}</TD>
          </tr>
        ))}</tbody>
      </table>
    </ACard>
  );
}

/* ── DASHBOARD ───────────────────────────────────────────── */
function AdminDashPage({nav}){
  const stats=[
    {l:'Нийт орлого (сар)',v:'1,227,600₮',d:'+18% өнгөрсөн сараас',c:'green'},
    {l:'Нийт хэрэглэгч',v:'582',d:'+48 энэ сар',c:'blue'},
    {l:'Зарагдсан credit',v:'1,240 cr',d:'+340 энэ сар',c:'purple'},
    {l:'Нийт генерац',v:'2,847',d:'138 өнөөдөр',c:'pink'},
    {l:'AI өртөг (тооцоолол)',v:'~120,000₮',d:'OpenAI + Gemini',c:'amber'},
    {l:'Тооцоолсон ашиг',v:'982,800₮',d:'80.1% margin',c:'green'},
    {l:'Амжилтгүй генерац',v:'23',d:'0.8% алдааны хувь',c:'red'},
    {l:'Credit тохируулга',v:'40 cr',d:'10 тохиолдол',c:'amber'},
    {l:'Буцааж олгосон credit',v:'28 cr',d:'7 тохиолдол',c:'amber'},
  ];
  const topPresets=[{n:'Профайл зураг',u:1240,cr:2480},{n:'Баннер загвар',u:890,cr:890},{n:'Instagram пост',u:743,cr:743},{n:'Монгол урлаг',u:621,cr:1242},{n:'Лого загвар',u:512,cr:1536}];

  const lineData = {
    labels:['05/29','05/30','05/31','06/01','06/02','06/03','06/04'],
    revenue:[320,490,410,620,580,710,850],
    credits:[32,49,41,62,58,71,85],
  };
  const donutData = {
    labels:['Амжилттай','Амжилтгүй','Боловсруулж байна','Буцаагдсан'],
    values:[2631,23,112,81],
  };
  const barData = {
    labels:['Профайл зураг','Баннер загвар','Instagram пост','Монгол урлаг','Лого загвар'],
    values:[1240,890,743,621,512],
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        {stats.map((s,i)=>(
          <ACard key={i} style={{padding:16}}>
            <div style={{fontSize:12,color:'#52525B',marginBottom:4}}>{s.l}</div>
            <div style={{fontSize:24,fontWeight:800,letterSpacing:'-1px',marginBottom:2}}>{s.v}</div>
            <div style={{fontSize:11,color:s.c==='red'?'#EF4444':'#4ADE80'}}>{s.d}</div>
          </ACard>
        ))}
      </div>

      {/* Line chart — full width */}
      <ACard>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700}}>Орлого & Credit (7 хоног)</div>
          <div style={{display:'flex',gap:14,fontSize:11,color:'#52525B'}}>
            <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:10,height:2,background:'#7C3AED',borderRadius:1,display:'inline-block'}}></span>Орлого</span>
            <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:10,height:2,background:'#38BDF8',borderRadius:1,display:'inline-block'}}></span>Credit</span>
          </div>
        </div>
        <div style={{height:220}}>
          <LineChart data={lineData} />
        </div>
      </ACard>

      {/* Donut + Bar side by side */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <ACard>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Генерацийн статус</div>
          <div style={{height:220}}>
            <DonutChart data={donutData} />
          </div>
        </ACard>
        <ACard>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Шилдэг presets (ашиглалт)</div>
          <div style={{height:220}}>
            <BarChart data={barData} />
          </div>
        </ACard>
      </div>

      {/* Top presets table + Top spenders */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <TopPresetsTable topPresets={topPresets}/>
        <ACard>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Топ зарцуулагчид</div>
          {[
            {n:'Нарантуяа Г.',cr:156,rev:'154,440₮',gen:89},
            {n:'Дорж Б.',cr:89,rev:'88,110₮',gen:52},
            {n:'Батбаяр Д.',cr:74,rev:'73,260₮',gen:138},
            {n:'Солонго А.',cr:45,rev:'44,550₮',gen:28},
            {n:'Ганбаатар М.',cr:32,rev:'31,680₮',gen:19},
          ].map((u,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<4?'1px solid rgba(255,255,255,.04)':'none'}}>
              <div style={{width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#38BDF8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0,color:'#fff'}}>{u.n[0]}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:'#E4E4E7',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.n}</div>
                <div style={{fontSize:10,color:'#52525B'}}>{u.gen} генерац</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#C4B5FD'}}>{u.cr} cr</div>
                <div style={{fontSize:10,color:'#4ADE80'}}>{u.rev}</div>
              </div>
            </div>
          ))}
        </ACard>
      </div>

      {/* Generation success rate */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[
          {l:'Амжилтын хувь',v:'92.4%',color:'#4ADE80'},
          {l:'Амжилтгүй тоо',v:'23',color:'#EF4444'},
          {l:'Дундаж үргэлжлэх хугацаа',v:'4.2с',color:'#38BDF8'},
          {l:'Retry хийсэн',v:'7',color:'#FBBF24'},
        ].map((s,i)=>(
          <ACard key={i} style={{padding:14,textAlign:'center'}}>
            <div style={{fontSize:11,color:'#52525B',marginBottom:6}}>{s.l}</div>
            <div style={{fontSize:26,fontWeight:900,color:s.color,letterSpacing:'-1px'}}>{s.v}</div>
          </ACard>
        ))}
      </div>
    </div>
  );
}

/* ── PRESETS TABLE ────────────────────────────────────────── */
const ADMIN_PRESETS=[
  {id:1,name:'Профайл зураг',cat:'Портрет',status:'active',model:'DALL-E 3',uses:1240,cr:2,owner:null,featured:true},
  {id:2,name:'Баннер загвар',cat:'Бизнес',status:'active',model:'DALL-E 3',uses:890,cr:1,owner:null,featured:false},
  {id:3,name:'Instagram пост',cat:'Соц медиа',status:'active',model:'Midjourney',uses:743,cr:1,owner:null,featured:true},
  {id:4,name:'Монгол урлаг',cat:'Урлаг',status:'active',model:'SDXL',uses:621,cr:2,owner:'Дорж.Б',featured:false},
  {id:5,name:'Лого загвар',cat:'Брэнд',status:'active',model:'DALL-E 3',uses:512,cr:3,owner:null,featured:false},
  {id:6,name:'Уламжлалт хувцас',cat:'Урлаг',status:'pending_review',model:'SDXL',uses:0,cr:2,owner:'Батаа.М',featured:false},
  {id:7,name:'Тэнгэрлэг байгаль',cat:'Байгаль',status:'rejected',model:'DALL-E 3',uses:0,cr:2,owner:'Нараа.Г',featured:false},
  {id:8,name:'Оффис ажилчид',cat:'Бизнес',status:'draft',model:'DALL-E 3',uses:0,cr:1,owner:'Батбаяр.Д',featured:false},
];

function AdminPresetsPage({nav}){
  const [filter,setFilter]=useState('all');
  const [sortCol,setSortCol]=useState('id');
  const [sortDir,setSortDir]=useState('asc');
  function onSort(col){if(sortCol===col)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortCol(col);setSortDir('asc');}}
  const stMap={active:{c:'green',l:'Идэвхтэй'},pending_review:{c:'amber',l:'Хянагдаж байна'},rejected:{c:'red',l:'Татгалзсан'},draft:{c:'gray',l:'Ноорог'},hidden:{c:'gray',l:'Нуугдсан'}};
  const base=filter==='all'?ADMIN_PRESETS:ADMIN_PRESETS.filter(p=>p.status===filter);
  const filtered=[...base].sort((a,b)=>{let av=a[sortCol],bv=b[sortCol];if(typeof av==='string'){av=av.toLowerCase();bv=bv.toLowerCase();}return sortDir==='asc'?(av>bv?1:-1):(av<bv?1:-1);});
  const sp={sortCol,sortDir,onSort};
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',gap:6}}>
          {['all','active','pending_review','rejected','draft'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'6px 12px',borderRadius:100,border:`1px solid ${filter===f?'rgba(124,58,237,.4)':'rgba(255,255,255,.06)'}`,background:filter===f?'rgba(124,58,237,.12)':'transparent',color:filter===f?'#C4B5FD':'#71717A',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
              {f==='all'?'Бүгд':stMap[f]?.l||f}
            </button>
          ))}
        </div>
        <SmBtn color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' onClick={()=>nav('admin-preset-edit')} style={{fontWeight:600,padding:'7px 14px'}}>+ Preset нэмэх</SmBtn>
      </div>
      <ACard style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            <TH w="40">№</TH><TH col="name" {...sp}>Нэр</TH><TH col="cat" {...sp}>Ангилал</TH><TH col="model" {...sp}>Модел</TH><TH col="status" {...sp}>Статус</TH><TH col="owner" {...sp}>Эзэмшигч</TH><TH col="uses" align="right" {...sp}>Ашиглалт</TH><TH col="cr" align="right" {...sp}>Credit</TH><TH></TH>
          </tr></thead>
          <tbody>{filtered.map((p,i)=>(
            <tr key={p.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .12s'}}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'}
              onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <TD style={{color:'#52525B',fontWeight:600}}>{i+1}</TD>
              <TD><div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontWeight:500,color:'#E4E4E7'}}>{p.name}</span>{p.featured&&<APill color='purple'>Онцлох</APill>}</div></TD>
              <TD style={{color:'#71717A'}}>{p.cat}</TD>
              <TD style={{color:'#71717A',fontSize:12}}>{p.model}</TD>
              <TD><APill color={stMap[p.status].c}>{stMap[p.status].l}</APill></TD>
              <TD style={{color:'#71717A'}}>{p.owner||'Admin'}</TD>
              <TD style={{textAlign:'right',color:'#E4E4E7'}}>{p.uses.toLocaleString()}</TD>
              <TD style={{textAlign:'right',fontWeight:600,color:'#C4B5FD'}}>{p.cr}</TD>
              <TD><SmBtn onClick={()=>nav('admin-preset-edit')}>Засах</SmBtn></TD>
            </tr>
          ))}</tbody>
        </table>
      </ACard>
    </div>
  );
}

/* ── PRESET EDITOR ───────────────────────────────────────── */
function AdminPresetEditPage({nav}){
  const [tab,setTab]=useState('basic');
  const tabs=[['basic','Үндсэн'],['model','Модел/Чанар'],['prompt','Prompt'],['inputs','Оролт'],['media','Зураг'],['credit','Credit']];
  return (
    <div style={{maxWidth:800,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
        <h2 style={{fontSize:16,fontWeight:700,flex:1}}>Preset засварлах</h2>
        <SmBtn color='#4ADE80' bg='rgba(74,222,128,.1)' style={{borderColor:'rgba(74,222,128,.2)'}}>Test Generate</SmBtn>
        <SmBtn color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' style={{fontWeight:600,border:'none'}}>Хадгалах</SmBtn>
      </div>
      <div style={{display:'flex',gap:4,marginBottom:20,overflowX:'auto'}}>
        {tabs.map(([id,lb])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'7px 14px',borderRadius:100,border:`1px solid ${tab===id?'rgba(124,58,237,.4)':'rgba(255,255,255,.06)'}`,background:tab===id?'rgba(124,58,237,.12)':'transparent',color:tab===id?'#C4B5FD':'#71717A',fontSize:12,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
            {lb}
          </button>
        ))}
      </div>
      <ACard>
        {tab==='basic'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Нэр *</label><input defaultValue="Профайл зураг" style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit'}} /></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Ангилал</label><AdminSelect defaultValue="Портрет" options={['Портрет','Бизнес','Соц медиа','Урлаг','Брэнд']}/></div>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Төрөл</label><AdminSelect defaultValue="Зургийн генерац" options={['Зургийн генерац','Зураг засварлах','Текст-зураг']}/></div>
          </div>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Тайлбар</label><textarea rows={3} defaultValue="Профессиональ профайл зураг үүсгэнэ" style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit',resize:'vertical'}} /></div>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <ACheckbox label="Идэвхтэй" defaultChecked={true}/>
            <ACheckbox label="Онцлох" defaultChecked={true}/>
            <ACheckbox label="Тренд" defaultChecked={false}/>
          </div>
        </div>}
        {tab==='model'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Модел *</label><AdminSelect defaultValue="DALL-E 3" options={['DALL-E 3','SDXL','Midjourney v6','Gemini Vision','Local AI']}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Хэмжээ</label><AdminSelect defaultValue="1:1 (1024×1024)" options={['1:1 (1024×1024)','16:9 (1792×1024)','9:16 (1024×1792)','4:3 (1280×960)']}/></div>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Чанар</label><AdminSelect defaultValue="Стандарт" options={['Стандарт','HD']}/></div>
          </div>
        </div>}
        {tab==='prompt'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Үндсэн prompt *</label><textarea rows={5} defaultValue="Professional headshot portrait, studio lighting, clean background, high resolution" style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:13,outline:'none',fontFamily:'inherit',resize:'vertical'}} /></div>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Нэмэлт prompt</label><textarea rows={3} style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:13,outline:'none',fontFamily:'inherit',resize:'vertical'}} /></div>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Negative prompt</label><textarea rows={2} defaultValue="blurry, low quality, distorted" style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:13,outline:'none',fontFamily:'inherit',resize:'vertical'}} /></div>
        </div>}
        {tab==='inputs'&&<div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{fontSize:13,color:'#52525B',marginBottom:4}}>Хэрэглэгчийн оруулах талбарууд</div>
          {[['Зураг оруулах','image_upload',true],['Текст оруулах','text_input',true],['Өнгө сонгох','color_picker',false]].map(([l,k,on],i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:8}}>
              <div><div style={{fontSize:13,fontWeight:500}}>{l}</div><div style={{fontSize:11,color:'#3F3F46'}}>{k}</div></div>
              <ACheckbox checked={on} onChange={()=>{}}/>
            </div>
          ))}
          <SmBtn style={{alignSelf:'flex-start'}}>+ Custom field нэмэх</SmBtn>
        </div>}
        {tab==='media'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div><div style={{fontSize:12,color:'#52525B',marginBottom:8}}>Thumbnail</div><div style={{width:160,height:100,border:'2px dashed rgba(255,255,255,.1)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'#3F3F46',cursor:'pointer'}}>⬆</div></div>
          <div><div style={{fontSize:12,color:'#52525B',marginBottom:8}}>Жишээ зургууд</div><div style={{display:'flex',gap:8}}>{[0,1,2,3].map(i=><div key={i} style={{width:80,height:80,border:'2px dashed rgba(255,255,255,.07)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'#3F3F46',cursor:'pointer'}}>+</div>)}</div></div>
        </div>}
        {tab==='credit'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Үндсэн credit</label><input type="number" defaultValue={2} min={1} style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:16,fontWeight:700,outline:'none',fontFamily:'inherit'}} /></div>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Creator reward credit</label><input type="number" defaultValue={1} min={0} style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:16,fontWeight:700,outline:'none',fontFamily:'inherit'}} /></div>
          </div>
        </div>}
      </ACard>
    </div>
  );
}

/* ── PRESET REVIEWS ──────────────────────────────────────── */
function AdminPresetReviewsPage({nav}){
  const reviews=[
    {id:6,name:'Уламжлалт хувцас',creator:'Батаа.М',date:'2024-06-03',status:'pending_review'},
    {id:7,name:'Тэнгэрлэг байгаль',creator:'Нараа.Г',date:'2024-06-01',status:'rejected'},
    {id:8,name:'Оффис ажилчид',creator:'Батбаяр.Д',date:'2024-05-28',status:'pending_review'},
  ];
  const stMap={pending_review:{c:'amber',l:'Хянагдаж байна'},rejected:{c:'red',l:'Татгалзсан'},active:{c:'green',l:'Зөвшөөрсөн'}};
  return (
    <div>
      <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Preset хянах дараалал</h2>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {reviews.map(r=>(
          <ACard key={r.id} style={{padding:16}}>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:50,height:36,borderRadius:6,background:'linear-gradient(135deg,#1A0A2E,#7C3AED)',flexShrink:0}}></div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}><span style={{fontSize:14,fontWeight:600}}>{r.name}</span><APill color={stMap[r.status].c}>{stMap[r.status].l}</APill></div>
                <div style={{fontSize:12,color:'#52525B'}}>Creator: {r.creator} · {r.date}</div>
              </div>
              <div style={{display:'flex',gap:6}}>
                <SmBtn onClick={()=>nav('admin-preset-edit')}>Үзэх</SmBtn>
                {r.status==='pending_review'&&<><SmBtn color='#4ADE80' bg='rgba(74,222,128,.1)' style={{borderColor:'rgba(74,222,128,.2)'}}>Зөвшөөрөх</SmBtn><SmBtn color='#EF4444' bg='rgba(239,68,68,.08)' style={{borderColor:'rgba(239,68,68,.2)'}}>Татгалзах</SmBtn></>}
              </div>
            </div>
          </ACard>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { AdminDashPage, AdminPresetsPage, AdminPresetEditPage, AdminPresetReviewsPage, ACard, APill, TH, TD, SmBtn });
