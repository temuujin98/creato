// admin/layout.jsx — Admin Sidebar + Header (v2)
const { useState, useRef, useEffect } = React;

/* ── NAV DATA ─────────────────────────────────────────────── */
const ADMIN_NAV = [
  { id:'admin-dash',             label:'Хянах самбар',              icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, section:null },
  { id:'admin-presets',          label:'Presets',                icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>, section:'Контент' },
  { id:'admin-preset-reviews',   label:'Preset хянах',           icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, section:null },
  { id:'admin-categories',       label:'Ангилал',                icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, section:null },
  { id:'admin-types',            label:'Төрөл',                  icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, section:null },
  { id:'admin-models',           label:'Models',                 icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, section:'Тохиргоо' },
  { id:'admin-sizes',            label:'Хэмжээ',                 icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>, section:null },
  { id:'admin-quality',          label:'Чанар',                  icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>, section:null },
  { id:'admin-users',            label:'Хэрэглэгчид',            icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, section:'Хэрэглэгч' },
  { id:'admin-wallet',           label:'Wallet гүйлгээ',         icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>, section:null },
  { id:'admin-packages',         label:'Credit багц',            icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, section:null },
  { id:'admin-payments',         label:'Төлбөрүүд',              icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>, section:'Санхүү' },
  { id:'admin-company',          label:'Байгууллагын хүсэлт',    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></svg>, section:null },
  { id:'admin-generations',      label:'Генерацууд',             icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>, section:'Систем' },
  { id:'admin-ratings',          label:'Үнэлгээ',                icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>, section:null },
  { id:'admin-homepage',         label:'Homepage',               icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, section:'CMS' },
  { id:'admin-settings',         label:'Тохиргоо',               icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, section:null },
  { id:'admin-logs',             label:'Логууд',                 icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="11" y2="17"/></svg>, section:null },
  { id:'admin-reports',          label:'Санхүүгийн тайлан',      icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><rect x="2" y="3" width="20" height="18" rx="2"/></svg>, section:'Тайлан' },
];

const PAGE_TITLES = {
  'admin-dash':'Хянах самбар','admin-user-detail':'Хэрэглэгчийн дэлгэрэнгүй',
  'admin-preset-edit':'Preset засварлах','admin-homepage-banners':'Баннер удирдлага',
  'admin-homepage-sections':'Section удирдлага',
};
ADMIN_NAV.forEach(n => PAGE_TITLES[n.id] = n.label);

/* ── MOCK NOTIFICATIONS ───────────────────────────────────── */
const NOTIF_DATA = [
  { id:1, type:'review',  text:'Preset хянуулахаар ирсэн: "Уламжлалт хувцас"',   time:'2 мин өмнө',  read:false },
  { id:2, type:'payment', text:'50 credit багц зарагдсан — Батбаяр Д.',           time:'15 мин өмнө', read:false },
  { id:3, type:'error',   text:'Генерац амжилтгүй #4419 — retry шаардлагатай',    time:'1 цаг өмнө',  read:false },
  { id:4, type:'user',    text:'Шинэ хэрэглэгч бүртгүүлсэн — Солонго А.',        time:'3 цаг өмнө',  read:true  },
  { id:5, type:'reward',  text:'Creator reward олгогдсон — Дорж Б. +1 cr',        time:'5 цаг өмнө',  read:true  },
];

const NOTIF_COLORS = {
  review:'#FBBF24', payment:'#4ADE80', error:'#EF4444', user:'#38BDF8', reward:'#9D5FF5',
};
const NOTIF_ICONS = {
  review:'◈', payment:'◇', error:'✕', user:'○', reward:'★',
};

/* ── LOADING SPINNER ─────────────────────────────────────── */
function AdminSpinner({ size=20, color='#7C3AED' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{animation:'adminSpin 0.8s linear infinite'}}>
      <style>{`@keyframes adminSpin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.1)" strokeWidth="2.5" />
      <path d="M12 3a9 9 0 019 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function AdminSkeleton({ w='100%', h=16, r=6, style={} }) {
  return (
    <div style={{
      width:w, height:h, borderRadius:r,
      background:'linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%)',
      backgroundSize:'200% 100%',
      animation:'adminShimmer 1.4s infinite',
      ...style,
    }}>
      <style>{`@keyframes adminShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

function AdminLoadingPage() {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16,padding:'4px 0'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        {[0,1,2,3,4,5].map(i=>(
          <div key={i} style={{background:'#12121C',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:20}}>
            <AdminSkeleton h={11} w="60%" style={{marginBottom:10}} />
            <AdminSkeleton h={28} w="80%" style={{marginBottom:8}} />
            <AdminSkeleton h={10} w="40%" />
          </div>
        ))}
      </div>
      <div style={{background:'#12121C',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:20}}>
        <AdminSkeleton h={14} w="30%" style={{marginBottom:16}} />
        <AdminSkeleton h={220} r={8} />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {[0,1].map(i=>(
          <div key={i} style={{background:'#12121C',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:20}}>
            <AdminSkeleton h={14} w="40%" style={{marginBottom:16}} />
            <AdminSkeleton h={200} r={8} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── CHECKBOX ────────────────────────────────────────────── */
function ACheckbox({ label, checked, onChange, defaultChecked, description, style={} }) {
  const [val, setVal] = React.useState(checked !== undefined ? checked : (defaultChecked || false));
  const isControlled = checked !== undefined;
  const active = isControlled ? checked : val;
  function toggle() {
    if (!isControlled) setVal(v => !v);
    if (onChange) onChange(!active);
  }
  return (
    <div onClick={toggle} style={{display:'inline-flex',alignItems:'center',gap:9,cursor:'pointer',userSelect:'none',...style}}>
      <div style={{
        width:18,height:18,borderRadius:5,flexShrink:0,
        border:`2px solid ${active?'#7C3AED':'rgba(255,255,255,.2)'}`,
        background:active?'#7C3AED':'transparent',
        display:'flex',alignItems:'center',justifyContent:'center',
        transition:'all .16s',
        boxShadow:active?'0 0 8px rgba(124,58,237,.45)':'none',
      }}>
        {active&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
      </div>
      {(label||description)&&<div>
        {label&&<div style={{fontSize:13,fontWeight:500,color:'#E4E4E7',lineHeight:1.3}}>{label}</div>}
        {description&&<div style={{fontSize:11,color:'#52525B',marginTop:2}}>{description}</div>}
      </div>}
    </div>
  );
}


/* ── DATE PICKER ─────────────────────────────────────────── */
function ADatePicker({ value, onChange, placeholder='Огноо сонгох' }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(value ? parseInt(value.split('-')[0]) : today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(value ? parseInt(value.split('-')[1])-1 : today.getMonth());

  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const MONTHS = ['1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар','7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар'];
  const DAYS = ['Да','Мя','Лх','Пү','Ба','Бя','Ня'];

  function daysInMonth(y, m) { return new Date(y, m+1, 0).getDate(); }
  function firstDay(y, m) { return new Date(y, m, 1).getDay(); }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y=>y-1); }
    else setViewMonth(m=>m-1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y=>y+1); }
    else setViewMonth(m=>m+1);
  }

  function pick(d) {
    const v = viewYear+'-'+String(viewMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    if (onChange) onChange(v);
    setOpen(false);
  }

  const selParts = value ? value.split('-') : null;
  const label = selParts ? selParts[2]+'.'+selParts[1]+'.'+selParts[0] : null;
  const total = daysInMonth(viewYear, viewMonth);
  const fd = firstDay(viewYear, viewMonth);
  const offset = fd === 0 ? 6 : fd - 1;

  return (
    <div ref={ref} style={{position:'relative',width:'100%'}}>
      <div onClick={()=>setOpen(v=>!v)} style={{display:'flex',alignItems:'center',gap:8,background:open?'rgba(124,58,237,.1)':'rgba(255,255,255,.04)',border:'1px solid '+(open?'rgba(124,58,237,.5)':'rgba(255,255,255,.08)'),borderRadius:8,padding:'9px 12px',cursor:'pointer',transition:'all .15s',userSelect:'none'}}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={open?'#9D5FF5':'#52525B'} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span style={{fontSize:13,color:label?'#E4E4E7':'#52525B',flex:1}}>{label||placeholder}</span>
        {value && <span onClick={e=>{e.stopPropagation();if(onChange)onChange('');}} style={{color:'#3F3F46',fontSize:14,lineHeight:1,cursor:'pointer',padding:'0 2px'}} onMouseOver={e=>e.currentTarget.style.color='#EF4444'} onMouseOut={e=>e.currentTarget.style.color='#3F3F46'}>✕</span>}
      </div>

      {open && (
        <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,zIndex:9999,background:'#17172A',border:'1px solid rgba(124,58,237,.22)',borderRadius:12,padding:16,boxShadow:'0 20px 60px rgba(0,0,0,.75)',width:256}}>
          {/* Header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <button onClick={prevMonth} style={{width:26,height:26,borderRadius:7,border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.04)',color:'#A1A1AA',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span style={{fontSize:13,fontWeight:700,color:'#E4E4E7'}}>{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={{width:26,height:26,borderRadius:7,border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.04)',color:'#A1A1AA',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          {/* Day headers */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:4}}>
            {DAYS.map(d=><div key={d} style={{textAlign:'center',fontSize:10,fontWeight:700,color:'#3F3F46',padding:'4px 0'}}>{d}</div>)}
          </div>
          {/* Days grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
            {Array.from({length:offset}).map((_,i)=><div key={'e'+i}/>)}
            {Array.from({length:total}).map((_,i)=>{
              const d = i+1;
              const sel = selParts && parseInt(selParts[0])===viewYear && parseInt(selParts[1])-1===viewMonth && parseInt(selParts[2])===d;
              const isToday = today.getFullYear()===viewYear && today.getMonth()===viewMonth && today.getDate()===d;
              return (
                <button key={d} onClick={()=>pick(d)} style={{aspectRatio:'1',borderRadius:7,border:'none',background:sel?'#7C3AED':isToday?'rgba(124,58,237,.15)':'transparent',color:sel?'#fff':isToday?'#C4B5FD':'#A1A1AA',fontSize:12,fontWeight:sel?700:400,cursor:'pointer',fontFamily:'inherit',padding:'5px 0',transition:'all .1s'}} onMouseOver={e=>{if(!sel){e.currentTarget.style.background='rgba(255,255,255,.08)';e.currentTarget.style.color='#E4E4E7';}}} onMouseOut={e=>{if(!sel){e.currentTarget.style.background=isToday?'rgba(124,58,237,.15)':'transparent';e.currentTarget.style.color=isToday?'#C4B5FD':'#A1A1AA';}}}>
                  {d}
                </button>
              );
            })}
          </div>
          {/* Today shortcut */}
          <div style={{borderTop:'1px solid rgba(255,255,255,.06)',marginTop:10,paddingTop:10,textAlign:'center'}}>
            <button onClick={()=>{const t=new Date();pick(t.getDate());setViewYear(t.getFullYear());setViewMonth(t.getMonth());}} style={{fontSize:11,color:'#9D5FF5',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>Өнөөдөр</button>
          </div>
        </div>
      )}
    </div>
  );
}


/* ── TIME PICKER ─────────────────────────────────────────── */
function ATimePicker({ value, onChange, placeholder='Цаг сонгох' }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const [h, setH] = React.useState(value ? value.split(':')[0] : '');
  const [m, setM] = React.useState(value ? value.split(':')[1] : '');

  React.useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function pick(newH, newM) {
    const hv = newH !== undefined ? newH : h;
    const mv = newM !== undefined ? newM : m;
    setH(hv); setM(mv);
    if (hv !== '' && mv !== '') {
      if (onChange) onChange(hv + ':' + mv);
      setOpen(false);
    }
  }

  const label = h !== '' && m !== '' ? h + ':' + m : null;
  const hours = Array.from({length:24}, (_,i) => String(i).padStart(2,'0'));
  const mins = ['00','05','10','15','20','25','30','35','40','45','50','55'];

  return (
    <div ref={ref} style={{position:'relative',width:'100%'}}>
      <div onClick={()=>setOpen(v=>!v)} style={{display:'flex',alignItems:'center',gap:8,background:open?'rgba(124,58,237,.1)':'rgba(255,255,255,.04)',border:'1px solid '+(open?'rgba(124,58,237,.5)':'rgba(255,255,255,.08)'),borderRadius:8,padding:'9px 12px',cursor:'pointer',transition:'all .15s',userSelect:'none'}}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={open?'#9D5FF5':'#52525B'} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span style={{fontSize:13,color:label?'#E4E4E7':'#52525B',flex:1}}>{label||placeholder}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{transition:'transform .18s',transform:open?'rotate(180deg)':'none',flexShrink:0}}><path d="M2 4l4 4 4-4" stroke={open?'#9D5FF5':'#52525B'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      {open && (
        <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,zIndex:9999,background:'#17172A',border:'1px solid rgba(124,58,237,.22)',borderRadius:12,padding:14,boxShadow:'0 20px 60px rgba(0,0,0,.75)',width:220}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8,textAlign:'center'}}>Цаг</div>
              <div style={{maxHeight:180,overflowY:'auto',display:'flex',flexDirection:'column',gap:2}}>
                {hours.map(hh=>(
                  <button key={hh} onClick={()=>pick(hh, m||'00')} style={{padding:'6px',borderRadius:7,border:'none',background:h===hh?'rgba(124,58,237,.25)':'transparent',color:h===hh?'#C4B5FD':'#A1A1AA',fontSize:12,fontWeight:h===hh?700:400,cursor:'pointer',fontFamily:'inherit',textAlign:'center',transition:'all .1s'}} onMouseOver={e=>{if(h!==hh){e.currentTarget.style.background='rgba(255,255,255,.07)';e.currentTarget.style.color='#E4E4E7';}}} onMouseOut={e=>{if(h!==hh){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#A1A1AA';}}}>
                    {hh}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8,textAlign:'center'}}>Минут</div>
              <div style={{display:'flex',flexDirection:'column',gap:2}}>
                {mins.map(mm=>(
                  <button key={mm} onClick={()=>pick(h||'00', mm)} style={{padding:'6px',borderRadius:7,border:'none',background:m===mm?'rgba(124,58,237,.25)':'transparent',color:m===mm?'#C4B5FD':'#A1A1AA',fontSize:12,fontWeight:m===mm?700:400,cursor:'pointer',fontFamily:'inherit',textAlign:'center',transition:'all .1s'}} onMouseOver={e=>{if(m!==mm){e.currentTarget.style.background='rgba(255,255,255,.07)';e.currentTarget.style.color='#E4E4E7';}}} onMouseOut={e=>{if(m!==mm){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#A1A1AA';}}}>
                    :{mm}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── CUSTOM SELECT ───────────────────────────────────────── */
function AdminSelect({ value, onChange, options, placeholder, style={}, width, defaultValue }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(value !== undefined ? value : (defaultValue || ''));
  const ref = useRef(null);
  const isControlled = value !== undefined;
  const current = isControlled ? value : val;

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const opts = options.map(o => typeof o === 'string' ? { value:o, label:o } : o);
  const selected = opts.find(o => o.value === current);

  function pick(v) {
    if (!isControlled) setVal(v);
    if (onChange) onChange(v);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{position:'relative', width: width||'100%', ...style}}>
      <div onClick={() => setOpen(v => !v)} style={{
        background: open ? 'rgba(124,58,237,.1)' : 'rgba(255,255,255,.04)',
        border: `1px solid ${open ? 'rgba(124,58,237,.55)' : 'rgba(255,255,255,.09)'}`,
        borderRadius: 8, padding: '9px 12px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        color: selected ? '#E4E4E7' : '#52525B', fontSize: 13,
        transition: 'border-color .15s, background .15s', userSelect: 'none',
        minHeight: 38,
      }}>
        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{selected ? selected.label : (placeholder || 'Сонгох...')}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{flexShrink:0, transition:'transform .18s', transform: open ? 'rotate(180deg)' : 'rotate(0)'}}>
          <path d="M2 4l4 4 4-4" stroke={open?'#9D5FF5':'#52525B'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 5px)', left:0, right:0, zIndex:9999,
          background:'#17172A', border:'1px solid rgba(124,58,237,.22)',
          borderRadius:10, overflow:'hidden',
          boxShadow:'0 20px 60px rgba(0,0,0,.75), 0 0 0 1px rgba(124,58,237,.08)',
          maxHeight:220, overflowY:'auto',
        }}>
          {opts.map((o, i) => {
            const active = o.value === current;
            return (
              <div key={i} onClick={() => pick(o.value)} style={{
                padding:'9px 14px', cursor:'pointer', fontSize:13,
                color: active ? '#C4B5FD' : '#A1A1AA',
                background: active ? 'rgba(124,58,237,.18)' : 'transparent',
                borderBottom: i < opts.length-1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                transition: 'background .1s, color .1s',
                display:'flex', alignItems:'center', gap:10,
              }}
              onMouseOver={e => { if(!active){ e.currentTarget.style.background='rgba(255,255,255,.06)'; e.currentTarget.style.color='#E4E4E7'; }}}
              onMouseOut={e => { if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#A1A1AA'; }}}>
                <span style={{
                  width:7,height:7,borderRadius:'50%',flexShrink:0,
                  background: active ? '#9D5FF5' : 'rgba(255,255,255,.12)',
                  boxShadow: active ? '0 0 6px rgba(157,95,245,.5)' : 'none',
                  transition:'background .15s',
                }}></span>
                {o.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


/* ── SORT ICON ───────────────────────────────────────────── */
function SortIcon({ col, sortCol, sortDir }) {
  const active = sortCol === col;
  return (
    <span style={{marginLeft:4,display:'inline-flex',flexDirection:'column',gap:1,verticalAlign:'middle',opacity:active?1:0.3}}>
      <svg width="7" height="5" viewBox="0 0 7 5" fill={active&&sortDir==='asc'?'#9D5FF5':'#71717A'}><polygon points="3.5,0 7,5 0,5"/></svg>
      <svg width="7" height="5" viewBox="0 0 7 5" fill={active&&sortDir==='desc'?'#9D5FF5':'#71717A'}><polygon points="3.5,5 7,0 0,0"/></svg>
    </span>
  );
}

function useSortable(data, defaultCol) {
  const [sortCol, setSortCol] = useState(defaultCol||null);
  const [sortDir, setSortDir] = useState('asc');
  function handleSort(col) {
    if (sortCol===col) setSortDir(d=>d==='asc'?'desc':'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }
  const sorted = sortCol ? [...data].sort((a,b)=>{
    let av=a[sortCol], bv=b[sortCol];
    if(typeof av==='string'){av=av.toLowerCase();bv=bv.toLowerCase();}
    return sortDir==='asc'?(av>bv?1:-1):(av<bv?1:-1);
  }) : data;
  return { sorted, sortCol, sortDir, handleSort };
}

/* ── NOTIFICATION POPUP ──────────────────────────────────── */
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(NOTIF_DATA);
  const ref = useRef(null);
  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markAll = () => setNotifs(notifs.map(n => ({...n, read:true})));
  const markOne = id => setNotifs(notifs.map(n => n.id===id ? {...n,read:true} : n));

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width:36, height:36, borderRadius:9,
          background: open ? 'rgba(124,58,237,.15)' : 'rgba(255,255,255,.05)',
          border: `1px solid ${open ? 'rgba(124,58,237,.3)' : 'rgba(255,255,255,.07)'}`,
          color:'#A1A1AA', cursor:'pointer', position:'relative',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all .15s', fontFamily:'inherit',
        }}
        onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.color='#fff'; }}
        onMouseOut={e => { if(!open){ e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.color='#A1A1AA'; }}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position:'absolute', top:5, right:5, width:8, height:8,
            borderRadius:'50%', background:'#EF4444',
            border:'1.5px solid #05050A',
          }}></span>
        )}
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 8px)', right:0, width:320, zIndex:9999,
          background:'#12121C', border:'1px solid rgba(255,255,255,.1)',
          borderRadius:14, overflow:'hidden',
          boxShadow:'0 24px 64px rgba(0,0,0,.8), 0 0 0 1px rgba(124,58,237,.1)',
        }}>
          {/* Header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:14,fontWeight:700}}>Мэдэгдэлүүд</span>
              {unread > 0 && (
                <span style={{background:'#EF4444',color:'#fff',fontSize:10,fontWeight:700,borderRadius:100,padding:'1px 6px',minWidth:18,textAlign:'center'}}>{unread}</span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAll} style={{background:'none',border:'none',color:'#7C3AED',fontSize:12,cursor:'pointer',fontFamily:'inherit',padding:0}}>
                Бүгдийг уншсан
              </button>
            )}
          </div>

          {/* List */}
          <div style={{maxHeight:340, overflowY:'auto'}}>
            {notifs.length === 0 ? (
              <div style={{padding:'32px 16px',textAlign:'center',color:'#3F3F46',fontSize:13}}>Мэдэгдэл байхгүй</div>
            ) : notifs.map((n, i) => (
              <div key={n.id}
                onClick={() => markOne(n.id)}
                style={{
                  display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px',
                  borderBottom: i < notifs.length-1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                  background: n.read ? 'transparent' : 'rgba(124,58,237,.04)',
                  cursor:'pointer', transition:'background .1s',
                }}
                onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,.03)'}
                onMouseOut={e => e.currentTarget.style.background= n.read ? 'transparent' : 'rgba(124,58,237,.04)'}>
                <div style={{
                  width:30, height:30, borderRadius:8, flexShrink:0,
                  background:`rgba(${NOTIF_COLORS[n.type]==='#EF4444'?'239,68,68':NOTIF_COLORS[n.type]==='#4ADE80'?'74,222,128':NOTIF_COLORS[n.type]==='#FBBF24'?'251,191,36':NOTIF_COLORS[n.type]==='#38BDF8'?'56,189,248':'157,95,245'},.15)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13, color:NOTIF_COLORS[n.type],
                }}>{NOTIF_ICONS[n.type]}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12, color: n.read ? '#71717A' : '#E4E4E7', lineHeight:1.5, marginBottom:3}}>{n.text}</div>
                  <div style={{fontSize:11, color:'#3F3F46'}}>{n.time}</div>
                </div>
                {!n.read && <div style={{width:7,height:7,borderRadius:'50%',background:'#7C3AED',flexShrink:0,marginTop:5}}></div>}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{padding:'10px 16px',borderTop:'1px solid rgba(255,255,255,.05)',textAlign:'center'}}>
            <button style={{background:'none',border:'none',color:'#52525B',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}
              onMouseOver={e=>e.currentTarget.style.color='#A1A1AA'}
              onMouseOut={e=>e.currentTarget.style.color='#52525B'}>
              Бүгдийг харах →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── SIDEBAR ─────────────────────────────────────────────── */
function AdminSidebar({ collapsed, page, nav }) {
  let lastSection = null;
  return (
    <aside style={{
      width: collapsed ? 56 : 220, minHeight:'100vh', background:'#08080F',
      borderRight:'1px solid rgba(255,255,255,.06)', display:'flex',
      flexDirection:'column', flexShrink:0, transition:'width .22s cubic-bezier(.4,0,.2,1)',
      overflow:'hidden', position:'fixed', top:0, left:0, bottom:0, zIndex:50,
    }}>
      {/* Logo */}
      <div style={{
        height:52, borderBottom:'1px solid rgba(255,255,255,.05)',
        display:'flex', alignItems:'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? 0 : '0 16px',
        overflow:'hidden', flexShrink:0,
      }}>
        {!collapsed && (
          <span style={{fontSize:15,fontWeight:800,whiteSpace:'nowrap',letterSpacing:'-.3px'}}>
            Creato <span style={{fontSize:10,fontWeight:600,color:'#9D5FF5',background:'rgba(124,58,237,.15)',padding:'2px 6px',borderRadius:4,marginLeft:4}}>ADMIN</span>
          </span>
        )}
        {collapsed && (
          <span style={{fontSize:16,fontWeight:900,color:'#C4B5FD',letterSpacing:'-.5px'}}>C</span>
        )}
      </div>

      {/* Nav */}
      <nav style={{flex:1, padding:'8px 6px', overflowY:'auto', overflowX:'hidden', scrollbarWidth:'none'}}>
        {ADMIN_NAV.map(item => {
          let sectionHeader = null;
          if (item.section && item.section !== lastSection && !collapsed) {
            lastSection = item.section;
            sectionHeader = (
              <div key={'s-'+item.section} style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'#3F3F46',padding:'14px 10px 6px',whiteSpace:'nowrap'}}>
                {item.section}
              </div>
            );
          } else if (item.section) { lastSection = item.section; }
          const active = page === item.id;
          return (
            <React.Fragment key={item.id}>
              {sectionHeader}
              <button
                onClick={() => nav(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  width:'100%', display:'flex', alignItems:'center',
                  gap: collapsed ? 0 : 9,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '8px 0' : '7px 10px',
                  borderRadius:8, border:'none', cursor:'pointer',
                  background: active ? 'rgba(124,58,237,.15)' : 'transparent',
                  color: active ? '#C4B5FD' : '#71717A',
                  fontSize:13, fontWeight: active ? 600 : 400,
                  transition:'all .12s', marginBottom:1, fontFamily:'inherit',
                  whiteSpace:'nowrap', overflow:'hidden',
                  boxShadow: active ? 'inset 1px 0 0 #7C3AED' : 'none',
                }}
                onMouseOver={e => { if(!active){ e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.color='#E4E4E7'; }}}
                onMouseOut={e => { if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#71717A'; }}}>
                <span style={{display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,width:18}}>{item.icon}</span>
                {!collapsed && <span style={{fontSize:13}}>{item.label}</span>}
              </button>
            </React.Fragment>
          );
        })}
      </nav>
    </aside>
  );
}

/* ── HEADER ──────────────────────────────────────────────── */
function AdminHeader({ collapsed, setCollapsed, page, nav, sidebarWidth }) {
  return (
    <header style={{
      position:'fixed', top:0, left:sidebarWidth, right:0, height:52,
      background:'rgba(5,5,10,.94)', backdropFilter:'blur(20px)',
      borderBottom:'1px solid rgba(255,255,255,.06)',
      display:'flex', alignItems:'center', paddingRight:16,
      zIndex:40, transition:'left .22s cubic-bezier(.4,0,.2,1)', gap:10,
    }}>
      {/* Sidebar toggle — flush left in header */}
      <button
        onClick={() => setCollapsed(v => !v)}
        style={{
          width:52, height:52, flexShrink:0,
          background:'transparent', border:'none',
          color:'#52525B', cursor:'pointer', display:'flex',
          alignItems:'center', justifyContent:'center',
          transition:'color .15s', fontFamily:'inherit',
        }}
        onMouseOver={e => e.currentTarget.style.color='#A1A1AA'}
        onMouseOut={e => e.currentTarget.style.color='#52525B'}>
        {collapsed
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        }
      </button>

      {/* Page title */}
      <div style={{flex:1, paddingLeft:4}}>
        <div style={{fontSize:14,fontWeight:600,color:'#E4E4E7'}}>{PAGE_TITLES[page]||'Admin'}</div>
      </div>

      {/* Right actions */}
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <NotificationBell />

        {/* Avatar */}
        <div style={{
          width:32, height:32, borderRadius:9,
          background:'linear-gradient(135deg,#7C3AED,#EC4899)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:12, fontWeight:700, cursor:'pointer',
          boxShadow:'0 0 0 2px rgba(124,58,237,.3)',
        }}>A</div>
      </div>
    </header>
  );
}

/* ── SHELL ───────────────────────────────────────────────── */
function AdminShell({ page, nav, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const prevPage = useRef(page);

  // Brief loading flash on page change
  useEffect(() => {
    if (prevPage.current !== page) {
      prevPage.current = page;
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 320);
      return () => clearTimeout(t);
    }
  }, [page]);

  const sw = collapsed ? 56 : 220;
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#05050A',color:'#fff',fontFamily:"'Roboto',sans-serif"}}>
      <AdminSidebar collapsed={collapsed} page={page} nav={nav} />
      <div style={{flex:1, marginLeft:sw, transition:'margin-left .22s cubic-bezier(.4,0,.2,1)', display:'flex', flexDirection:'column', minHeight:'100vh'}}>
        <AdminHeader collapsed={collapsed} setCollapsed={setCollapsed} page={page} nav={nav} sidebarWidth={sw} />
        <main style={{flex:1, marginTop:52, padding:'24px 20px', overflowY:'auto', minHeight:'calc(100vh - 52px)'}}>
          {loading ? <AdminLoadingPage /> : children}
        </main>
      </div>
    </div>
  );
}

Object.assign(window, {
  AdminShell, AdminSidebar, AdminHeader, AdminSelect,
  AdminSpinner, AdminSkeleton, AdminLoadingPage, NotificationBell,
  ACheckbox, ADatePicker, ATimePicker, SortIcon, useSortable,
  ADMIN_NAV, PAGE_TITLES,
});
