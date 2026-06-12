// admin/pages-reports.jsx — Monthly Financial Report
const { useState: _rpSt } = React;

function AdminReportsPage(){
  const [month,setMonth]=_rpSt('2026-06');
  const [tab,setTab]=_rpSt('summary');

  /* ── Summary KPI data ── */
  const kpis=[
    {label:'Нийт credit борлуулалт',val:'1,240 cr',sub:'энэ сар',color:'#C4B5FD',icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>},
    {label:'Нийт орлого',val:'1,227,600₮',sub:'брутто',color:'#4ADE80',icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>},
    {label:'Нийт зарцуулсан credit',val:'984 cr',sub:'генерацаар',color:'#38BDF8',icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>},
    {label:'AI өртөг (тооцоолол)',val:'$82.40',sub:'~120,000₮',color:'#F472B6',icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>},
    {label:'Буцааж олгосон credit',val:'28 cr',sub:'7 тохиолдол',color:'#FBBF24',icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>},
    {label:'Admin тохируулга',val:'12 cr',sub:'3 тохиолдол',color:'#FBBF24',icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>},
    {label:'Бонус/нөхөн credit',val:'18 cr',sub:'маркетинг',color:'#9D5FF5',icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>},
    {label:'Тооцоолсон ашиг',val:'982,800₮',sub:'~80% margin',color:'#4ADE80',icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>},
    {label:'Margin %',val:'80.1%',sub:'тооцоолол',color:'#4ADE80',icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>},
    {label:'Төлбөрийн систем комисс',val:'24,552₮',sub:'~2% QPay',color:'#EF4444',icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/></svg>},
    {label:'AI provider өртөг',val:'~120,000₮',sub:'OpenAI + Gemini',color:'#F472B6',icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>},
    {label:'Хадгалалт / үйлдлийн зардал',val:'~20,000₮',sub:'тооцоолол',color:'#71717A',icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>},
  ];

  
/* ── MONTH PICKER ─────────────────────────────────────────── */
function MonthPicker({ value, onChange }) {
  const [open, setOpen] = _rpSt(false);
  const ref = React.useRef(null);
  const MONTHS = ['1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар','7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар'];
  const [year, mon] = value.split('-').map(Number);
  const [viewYear, setViewYear] = _rpSt(year);

  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  function pick(m) {
    onChange(viewYear + '-' + String(m+1).padStart(2,'0'));
    setOpen(false);
  }

  const label = MONTHS[mon-1] + ' ' + year;

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button onClick={()=>setOpen(v=>!v)} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:8,border:'1px solid '+(open?'rgba(124,58,237,.5)':'rgba(255,255,255,.09)'),background:open?'rgba(124,58,237,.1)':'rgba(255,255,255,.04)',color:'#E4E4E7',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'inherit',transition:'all .15s',minWidth:150,justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:7}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={open?'#9D5FF5':'#71717A'} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {label}
        </div>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{transition:'transform .18s',transform:open?'rotate(180deg)':'none'}}><path d="M2 4l4 4 4-4" stroke={open?'#9D5FF5':'#52525B'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {open && (
        <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,zIndex:9999,background:'#17172A',border:'1px solid rgba(124,58,237,.22)',borderRadius:12,padding:16,boxShadow:'0 20px 60px rgba(0,0,0,.75)',width:240}}>
          {/* Year nav */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <button onClick={()=>setViewYear(y=>y-1)} style={{width:28,height:28,borderRadius:7,border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.04)',color:'#A1A1AA',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span style={{fontSize:14,fontWeight:700,color:'#E4E4E7'}}>{viewYear}</span>
            <button onClick={()=>setViewYear(y=>y+1)} style={{width:28,height:28,borderRadius:7,border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.04)',color:'#A1A1AA',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          {/* Month grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5}}>
            {MONTHS.map((m,i)=>{
              const sel = viewYear===year && i+1===mon;
              return (
                <button key={i} onClick={()=>pick(i)} style={{padding:'8px 4px',borderRadius:8,border:'1px solid '+(sel?'rgba(124,58,237,.5)':'rgba(255,255,255,.06)'),background:sel?'rgba(124,58,237,.25)':'transparent',color:sel?'#C4B5FD':'#A1A1AA',fontSize:11,fontWeight:sel?700:400,cursor:'pointer',fontFamily:'inherit',transition:'all .12s',textAlign:'center'}} onMouseOver={e=>{if(!sel){e.currentTarget.style.background='rgba(255,255,255,.06)';e.currentTarget.style.color='#E4E4E7';}}} onMouseOut={e=>{if(!sel){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#A1A1AA';}}}>
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Table data ── */
  const salesData=[
    {date:'2026-06-04',user:'Батбаяр Д.',provider:'QPay',ref:'PAY-0032',pkg:'50 credit',cr:50,amt:49500,fee:990,net:48510,status:'paid'},
    {date:'2026-06-03',user:'Нарантуяа Г.',provider:'QPay',ref:'PAY-0031',pkg:'100 credit',cr:100,amt:99000,fee:1980,net:97020,status:'paid'},
    {date:'2026-06-02',user:'Дорж Б.',provider:'Khan Bank',ref:'PAY-0030',pkg:'25 credit',cr:25,amt:24750,fee:0,net:24750,status:'paid'},
    {date:'2026-06-01',user:'Солонго А.',provider:'QPay',ref:'PAY-0029',pkg:'10 credit',cr:10,amt:9900,fee:198,net:9702,status:'paid'},
    {date:'2026-05-31',user:'Ганбаатар М.',provider:'QPay',ref:'PAY-0028',pkg:'50 credit',cr:50,amt:49500,fee:990,net:48510,status:'refunded'},
  ];
  const usageData=[
    {date:'2026-06-04 09:15',user:'Батбаяр Д.',product:'Профайл зураг',genId:'GEN-4421',provider:'OpenAI',cr:2,cost:'$0.08',status:'completed'},
    {date:'2026-06-04 09:10',user:'Нарантуяа Г.',product:'Баннер загвар',genId:'GEN-4420',provider:'OpenAI',cr:1,cost:'$0.04',status:'completed'},
    {date:'2026-06-03 18:40',user:'Дорж Б.',product:'Монгол урлаг',genId:'GEN-4419',provider:'SDXL',cr:2,cost:'$0.00',status:'failed'},
    {date:'2026-06-03 14:20',user:'Нарантуяа Г.',product:'Instagram пост',genId:'GEN-4418',provider:'Gemini',cr:1,cost:'$0.03',status:'completed'},
    {date:'2026-06-02 22:00',user:'Батбаяр Д.',product:'Лого загвар',genId:'GEN-4417',provider:'OpenAI',cr:3,cost:'$0.12',status:'completed'},
  ];
  const adjData=[
    {date:'2026-06-02 11:00',user:'Батбаяр Д.',adjType:'Failed generation reimbursement',cr:'+3',reason:'AI output failed',admin:'А.Менежер',ref:'GEN-4300',note:'3 удаа алдаа гарсан'},
    {date:'2026-05-28 10:00',user:'Солонго А.',adjType:'Compensation credit',cr:'+5',reason:'Poor quality output',admin:'А.Менежер',ref:'GEN-4250',note:'Дахин боловсруулалт хийсэн'},
    {date:'2026-05-20 09:00',user:'Дорж Б.',adjType:'Bonus credit',cr:'+10',reason:'Promotion/bonus',admin:'System',ref:'—',note:'Нээлтийн урамшуулал'},
  ];
  const profitData=[
    {item:'Нийт орлого',val:'1,227,600₮',type:'positive'},
    {item:'QPay комисс (-2%)',val:'-24,552₮',type:'negative'},
    {item:'OpenAI/Gemini өртөг',val:'-120,000₮',type:'negative'},
    {item:'SDXL/Local AI өртөг',val:'-5,000₮',type:'negative'},
    {item:'Хадгалалт / операцийн зардал',val:'-20,000₮',type:'negative'},
    {item:'Буцаалт/нөхөн төлбөрийн нөлөө',val:'-75,248₮',type:'negative'},
    {item:'Цэвэр тооцоолсон ашиг',val:'982,800₮',type:'profit'},
  ];

  const [sSC,setSSC]=_rpSt('date');const [sSD,setSSD]=_rpSt('desc');
  const [uSC,setUSC]=_rpSt('date');const [uSD,setUSD]=_rpSt('desc');
  const [aSC,setASC]=_rpSt('date');const [aSD,setASD]=_rpSt('desc');
  function makeSort(sc,sd,setSC,setSD){return function(col){if(sc===col)setSD(d=>d==='asc'?'desc':'asc');else{setSC(col);setSD('asc');};};}
  const sortRows=(rows,sc,sd)=>[...rows].sort((a,b)=>{let av=a[sc]||'',bv=b[sc]||'';if(typeof av==='string'){av=av.toLowerCase();bv=bv.toLowerCase();}return sd==='asc'?(av>bv?1:-1):(av<bv?1:-1);});

  function STH({children,col,sc,sd,onS,w,align}){
    const active=col&&sc===col;
    return <th onClick={col?()=>onS(col):undefined} style={{padding:'10px 12px',textAlign:align||'left',fontSize:10,fontWeight:700,color:active?'#C4B5FD':'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:w,cursor:col?'pointer':'default',userSelect:'none',whiteSpace:'nowrap',transition:'color .15s'}}>
      {children}{col&&<span style={{marginLeft:3,display:'inline-flex',flexDirection:'column',gap:1,verticalAlign:'middle',opacity:active?1:0.3}}>
        <svg width="6" height="4" viewBox="0 0 7 5" fill={active&&sd==='asc'?'#9D5FF5':'#71717A'}><polygon points="3.5,0 7,5 0,5"/></svg>
        <svg width="6" height="4" viewBox="0 0 7 5" fill={active&&sd==='desc'?'#9D5FF5':'#71717A'}><polygon points="3.5,5 7,0 0,0"/></svg>
      </span>}
    </th>;
  }
  function CTD({children,style={}}){return <td style={{padding:'9px 12px',fontSize:12,color:'#E4E4E7',...style}}>{children}</td>;}

  const TABS=['summary','sales','usage','adjustments','profit'];
  const TAB_LABELS={summary:'Хураангуй',sales:'Credit борлуулалт',usage:'Credit ашиглалт',adjustments:'Credit тохируулга',profit:'Ашгийн тооцоо'};

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h2 style={{fontSize:17,fontWeight:700,marginBottom:3}}>Санхүүгийн тайлан</h2>
          <div style={{fontSize:12,color:'#52525B'}}>Credit борлуулалт, зарцуулалт, тохируулга, ашгийн тооцоо</div>
        </div>
  <div style={{display:'flex',alignItems:'center',gap:10}}>
          <MonthPicker value={month} onChange={setMonth}/>
          <button style={{padding:'8px 14px',borderRadius:8,border:'1px solid rgba(74,222,128,.2)',background:'rgba(74,222,128,.06)',color:'#4ADE80',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:6}} onMouseOver={e=>e.currentTarget.style.background='rgba(74,222,128,.12)'} onMouseOut={e=>e.currentTarget.style.background='rgba(74,222,128,.06)'}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Excel
          </button>
          <button style={{padding:'8px 14px',borderRadius:8,border:'1px solid rgba(56,189,248,.2)',background:'rgba(56,189,248,.06)',color:'#38BDF8',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:6}} onMouseOver={e=>e.currentTarget.style.background='rgba(56,189,248,.12)'} onMouseOut={e=>e.currentTarget.style.background='rgba(56,189,248,.06)'}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:20,borderBottom:'1px solid rgba(255,255,255,.06)',paddingBottom:0}}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 16px',borderRadius:'8px 8px 0 0',border:'none',background:tab===t?'rgba(124,58,237,.15)':'transparent',color:tab===t?'#C4B5FD':'#52525B',fontSize:12,fontWeight:tab===t?700:500,cursor:'pointer',fontFamily:'inherit',borderBottom:tab===t?'2px solid #7C3AED':'2px solid transparent',marginBottom:-1,transition:'all .15s'}}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── Summary tab ── */}
      {tab==='summary'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
          {kpis.map((k,i)=>(
            <ACard key={i} style={{padding:16}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div style={{width:32,height:32,borderRadius:8,background:k.color+'18',border:'1px solid '+k.color+'28',display:'flex',alignItems:'center',justifyContent:'center',color:k.color,flexShrink:0}}>{k.icon}</div>
                <div style={{fontSize:11,color:'#52525B',lineHeight:1.4}}>{k.label}</div>
              </div>
              <div style={{fontSize:20,fontWeight:800,color:k.color,letterSpacing:'-.5px'}}>{k.val}</div>
              <div style={{fontSize:10,color:'#3F3F46',marginTop:3}}>{k.sub}</div>
            </ACard>
          ))}
        </div>
      )}

      {/* ── Sales tab ── */}
      {tab==='sales'&&(
        <ACard style={{padding:0,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,.06)',fontSize:13,fontWeight:700}}>A. Credit борлуулалтын тайлан</div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:880}}>
              <thead><tr style={{background:'rgba(255,255,255,.02)'}}>
                <th style={{padding:'10px 12px',fontSize:11,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:40}}>№</th>
                <STH col="date" sc={sSC} sd={sSD} onS={makeSort(sSC,sSD,setSSC,setSSD)}>Огноо</STH>
                <STH col="user" sc={sSC} sd={sSD} onS={makeSort(sSC,sSD,setSSC,setSSD)}>Хэрэглэгч</STH>
                <STH col="provider" sc={sSC} sd={sSD} onS={makeSort(sSC,sSD,setSSC,setSSD)}>Provider</STH>
                <STH col="ref" sc={sSC} sd={sSD} onS={makeSort(sSC,sSD,setSSC,setSSD)}>Ref</STH>
                <STH col="pkg" sc={sSC} sd={sSD} onS={makeSort(sSC,sSD,setSSC,setSSD)}>Багц</STH>
                <STH col="cr" align="right" sc={sSC} sd={sSD} onS={makeSort(sSC,sSD,setSSC,setSSD)}>Credit</STH>
                <STH col="amt" align="right" sc={sSC} sd={sSD} onS={makeSort(sSC,sSD,setSSC,setSSD)}>Дүн (₮)</STH>
                <STH col="fee" align="right" sc={sSC} sd={sSD} onS={makeSort(sSC,sSD,setSSC,setSSD)}>Комисс</STH>
                <STH col="net" align="right" sc={sSC} sd={sSD} onS={makeSort(sSC,sSD,setSSC,setSSD)}>Цэвэр</STH>
                <STH col="status" sc={sSC} sd={sSD} onS={makeSort(sSC,sSD,setSSC,setSSD)}>Статус</STH>
              </tr></thead>
              <tbody>{sortRows(salesData,sSC,sSD).map((r,i)=>(
                <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .1s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.02)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'9px 12px',fontSize:11,fontWeight:600,color:'#52525B'}}>{i+1}</td>
                  <CTD style={{color:'#71717A',whiteSpace:'nowrap'}}>{r.date}</CTD>
                  <CTD style={{fontWeight:500}}>{r.user}</CTD>
                  <CTD style={{color:'#A1A1AA'}}>{r.provider}</CTD>
                  <CTD style={{fontFamily:'monospace',fontSize:11,color:'#52525B'}}>{r.ref}</CTD>
                  <CTD>{r.pkg}</CTD>
                  <CTD style={{textAlign:'right',fontWeight:700,color:'#C4B5FD'}}>{r.cr}</CTD>
                  <CTD style={{textAlign:'right'}}>{r.amt.toLocaleString()}₮</CTD>
                  <CTD style={{textAlign:'right',color:r.fee?'#EF4444':'#3F3F46'}}>{r.fee?r.fee.toLocaleString()+'₮':'—'}</CTD>
                  <CTD style={{textAlign:'right',fontWeight:700,color:'#4ADE80'}}>{r.net.toLocaleString()}₮</CTD>
                  <CTD><APill color={r.status==='paid'?'green':'red'}>{r.status==='paid'?'Төлсөн':'Буцаасан'}</APill></CTD>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </ACard>
      )}

      {/* ── Usage tab ── */}
      {tab==='usage'&&(
        <ACard style={{padding:0,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,.06)',fontSize:13,fontWeight:700}}>B. Credit ашиглалтын тайлан</div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:820}}>
              <thead><tr style={{background:'rgba(255,255,255,.02)'}}>
                <th style={{padding:'10px 12px',fontSize:11,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:40}}>№</th>
                <STH col="date" sc={uSC} sd={uSD} onS={makeSort(uSC,uSD,setUSC,setUSD)}>Огноо</STH>
                <STH col="user" sc={uSC} sd={uSD} onS={makeSort(uSC,uSD,setUSC,setUSD)}>Хэрэглэгч</STH>
                <STH col="product" sc={uSC} sd={uSD} onS={makeSort(uSC,uSD,setUSC,setUSD)}>Бүтээгдэхүүн</STH>
                <STH col="genId" sc={uSC} sd={uSD} onS={makeSort(uSC,uSD,setUSC,setUSD)}>Генерац ID</STH>
                <STH col="provider" sc={uSC} sd={uSD} onS={makeSort(uSC,uSD,setUSC,setUSD)}>Provider</STH>
                <STH col="cr" align="right" sc={uSC} sd={uSD} onS={makeSort(uSC,uSD,setUSC,setUSD)}>Credit</STH>
                <STH col="cost" align="right" sc={uSC} sd={uSD} onS={makeSort(uSC,uSD,setUSC,setUSD)}>AI өртөг</STH>
                <STH col="status" sc={uSC} sd={uSD} onS={makeSort(uSC,uSD,setUSC,setUSD)}>Статус</STH>
              </tr></thead>
              <tbody>{sortRows(usageData,uSC,uSD).map((r,i)=>(
                <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .1s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.02)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'9px 12px',fontSize:11,fontWeight:600,color:'#52525B'}}>{i+1}</td>
                  <CTD style={{color:'#71717A',whiteSpace:'nowrap',fontSize:11}}>{r.date}</CTD>
                  <CTD style={{fontWeight:500}}>{r.user}</CTD>
                  <CTD style={{color:'#A1A1AA'}}>{r.product}</CTD>
                  <CTD style={{fontFamily:'monospace',fontSize:11,color:'#52525B'}}>{r.genId}</CTD>
                  <CTD style={{color:'#A1A1AA'}}>{r.provider}</CTD>
                  <CTD style={{textAlign:'right',fontWeight:700,color:'#C4B5FD'}}>{r.cr}</CTD>
                  <CTD style={{textAlign:'right',color:'#F472B6',fontSize:12}}>{r.cost}</CTD>
                  <CTD><APill color={r.status==='completed'?'green':r.status==='failed'?'red':'amber'}>{r.status==='completed'?'Амжилттай':r.status==='failed'?'Алдаа':'Хүлээгдэж'}</APill></CTD>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </ACard>
      )}

      {/* ── Adjustments tab ── */}
      {tab==='adjustments'&&(
        <ACard style={{padding:0,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,.06)',fontSize:13,fontWeight:700}}>C. Credit тохируулгын тайлан</div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:820}}>
              <thead><tr style={{background:'rgba(255,255,255,.02)'}}>
                <th style={{padding:'10px 12px',fontSize:11,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:40}}>№</th>
                <STH col="date" sc={aSC} sd={aSD} onS={makeSort(aSC,aSD,setASC,setASD)}>Огноо</STH>
                <STH col="user" sc={aSC} sd={aSD} onS={makeSort(aSC,aSD,setASC,setASD)}>Хэрэглэгч</STH>
                <STH col="adjType" sc={aSC} sd={aSD} onS={makeSort(aSC,aSD,setASC,setASD)}>Төрөл</STH>
                <STH col="cr" align="right" sc={aSC} sd={aSD} onS={makeSort(aSC,aSD,setASC,setASD)}>Credit</STH>
                <STH col="reason" sc={aSC} sd={aSD} onS={makeSort(aSC,aSD,setASC,setASD)}>Шалтгаан</STH>
                <STH col="admin" sc={aSC} sd={aSD} onS={makeSort(aSC,aSD,setASC,setASD)}>Admin</STH>
                <STH col="ref" sc={aSC} sd={aSD} onS={makeSort(aSC,aSD,setASC,setASD)}>Ref</STH>
                <th style={{padding:'10px 12px',fontSize:10,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.8px'}}>Тэмдэглэл</th>
              </tr></thead>
              <tbody>{sortRows(adjData,aSC,aSD).map((r,i)=>(
                <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .1s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.02)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'9px 12px',fontSize:11,fontWeight:600,color:'#52525B'}}>{i+1}</td>
                  <CTD style={{color:'#71717A',whiteSpace:'nowrap',fontSize:11}}>{r.date}</CTD>
                  <CTD style={{fontWeight:500}}>{r.user}</CTD>
                  <CTD><APill color='amber'>{r.adjType}</APill></CTD>
                  <CTD style={{textAlign:'right',fontWeight:700,color:'#9D5FF5'}}>{r.cr}</CTD>
                  <CTD style={{color:'#A1A1AA',fontSize:11}}>{r.reason}</CTD>
                  <CTD style={{color:'#E4E4E7'}}>{r.admin}</CTD>
                  <CTD style={{fontFamily:'monospace',fontSize:11,color:'#52525B'}}>{r.ref}</CTD>
                  <CTD style={{color:'#71717A',fontSize:11}}>{r.note}</CTD>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </ACard>
      )}

      {/* ── Profit tab ── */}
      {tab==='profit'&&(
        <div style={{maxWidth:560}}>
          <ACard style={{padding:0,overflow:'hidden'}}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,.06)',fontSize:13,fontWeight:700}}>D. Ашгийн тооцоо</div>
            {profitData.map((r,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px',borderBottom:i<profitData.length-1?'1px solid rgba(255,255,255,.04)':'none',background:r.type==='profit'?'rgba(74,222,128,.04)':'transparent',transition:'background .1s'}} onMouseOver={e=>{if(r.type!=='profit')e.currentTarget.style.background='rgba(255,255,255,.02)';}} onMouseOut={e=>{if(r.type!=='profit')e.currentTarget.style.background='transparent';}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:r.type==='profit'?'#4ADE80':r.type==='negative'?'#EF4444':'#E4E4E7',flexShrink:0}}></div>
                  <span style={{fontSize:13,color:r.type==='profit'?'#E4E4E7':'#A1A1AA',fontWeight:r.type==='profit'?700:400}}>{r.item}</span>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:r.type==='profit'?'#4ADE80':r.type==='negative'?'#EF4444':'#E4E4E7'}}>{r.val}</span>
              </div>
            ))}
          </ACard>
          <div style={{marginTop:14,padding:'14px 18px',background:'rgba(124,58,237,.08)',border:'1px solid rgba(124,58,237,.2)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:13,color:'#A1A1AA'}}>Тооцоолсон margin</div>
            <div style={{fontSize:22,fontWeight:900,color:'#4ADE80'}}>80.1%</div>
          </div>
        </div>
      )}

    </div>
  );
}

Object.assign(window, { AdminReportsPage });
