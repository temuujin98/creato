// client/layout.jsx — Sidebar, Header, AppShell
const { useState: _useState, useRef: _useRef, useEffect: _useEffect } = React;


/* ── CLIENT NOTIFICATIONS ───────────────────────────────── */
const CLIENT_NOTIFS = [
  { id:1, type:'reward',     text:'Таны "Монгол урлаг" preset ашиглагдлаа — +1 cr reward',   time:'5 мин өмнө',  read:false },
  { id:2, type:'generation', text:'Профайл зураг амжилттай үүсгэгдлээ',                        time:'32 мин өмнө', read:false },
  { id:3, type:'credit',     text:'50 credit амжилттай нэмэгдлээ',                             time:'2 цаг өмнө',  read:false },
  { id:4, type:'review',     text:'Таны preset хянагдаж байна',                                 time:'1 өдөр өмнө', read:true  },
  { id:5, type:'system',     text:'Тавтай морил! Creato-д бүртгүүлсэнд баярлалаа',             time:'3 өдөр өмнө', read:true  },
];

const CN_COLORS = { reward:'#9D5FF5', generation:'#4ADE80', credit:'#FBBF24', review:'#38BDF8', system:'#52525B' };
const CN_ICONS  = { reward:'★', generation:'◻', credit:'◈', review:'◧', system:'○' };

function ClientNotifBell({ nav }) {
  const [open, setOpen] = _useState(false);
  const [notifs, setNotifs] = _useState(CLIENT_NOTIFS);
  const ref = _useRef(null);
  const unread = notifs.filter(n => !n.read).length;

  _useEffect(() => {
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
          width:36, height:36, borderRadius:8,
          background: open ? 'rgba(124,58,237,.15)' : 'rgba(255,255,255,.05)',
          border: `1px solid ${open ? 'rgba(124,58,237,.3)' : 'rgba(255,255,255,.08)'}`,
          color:'#A1A1AA', cursor:'pointer', position:'relative',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all .15s', fontFamily:'inherit',
        }}
        onMouseOver={e=>{ e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.color='#fff'; }}
        onMouseOut={e=>{ if(!open){ e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.color='#A1A1AA'; }}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position:'absolute', top:5, right:5, width:8, height:8,
            borderRadius:'50%', background:'#EC4899',
            border:'1.5px solid #05050A',
            boxShadow:'0 0 6px rgba(236,72,153,.6)',
          }}></span>
        )}
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 8px)', right:0, width:316, zIndex:9999,
          background:'#12121C', border:'1px solid rgba(255,255,255,.1)',
          borderRadius:14, overflow:'hidden',
          boxShadow:'0 24px 64px rgba(0,0,0,.8), 0 0 0 1px rgba(124,58,237,.1)',
        }}>
          {/* Header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:14,fontWeight:700}}>Мэдэгдэлүүд</span>
              {unread > 0 && (
                <span style={{background:'#EC4899',color:'#fff',fontSize:10,fontWeight:700,borderRadius:100,padding:'1px 6px'}}>{unread}</span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAll} style={{background:'none',border:'none',color:'#9D5FF5',fontSize:12,cursor:'pointer',fontFamily:'inherit',padding:0}}>
                Бүгдийг уншсан
              </button>
            )}
          </div>

          {/* List */}
          <div style={{maxHeight:320, overflowY:'auto'}}>
            {notifs.map((n, i) => (
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
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12, color: n.read ? '#71717A' : '#E4E4E7', lineHeight:1.5, marginBottom:3}}>{n.text}</div>
                  <div style={{fontSize:11, color:'#3F3F46'}}>{n.time}</div>
                </div>
                {!n.read && <div style={{width:7,height:7,borderRadius:'50%',background:'#9D5FF5',flexShrink:0,marginTop:5}}></div>}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{padding:'10px 16px',borderTop:'1px solid rgba(255,255,255,.05)',textAlign:'center'}}>
            <button
              onClick={()=>{ nav('transactions'); setOpen(false); }}
              style={{background:'none',border:'none',color:'#52525B',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}
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

const NAV_ITEMS = [
  { id:'dashboard',    label:'Хяналтын самбар', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { id:'presets',      label:'Presets',          icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg> },
  { id:'my-images',    label:'Миний зургууд',    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg> },
  { id:'my-presets',   label:'Миний presets',    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9"/><path d="M16 3h5v5"/><path d="M21 3l-7 7"/></svg> },
  { id:'credits',      label:'Credit авах',      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg> },
  { id:'billing',      label:'Төлбөрийн түүх',  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg> },
  { id:'transactions', label:'Гүйлгээ',          icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { id:'settings',     label:'Тохиргоо',         icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  { id:'help',         label:'Тусламж',          icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
];

function Sidebar({ page, nav, collapsed, onToggle }) {
  return (
    <aside style={{
      width: collapsed ? 64 : 232, minHeight:'100vh', background:'#08080F',
      borderRight:'1px solid rgba(255,255,255,.07)', display:'flex',
      flexDirection:'column', flexShrink:0, transition:'width .25s cubic-bezier(.4,0,.2,1)',
      overflow:'hidden', position:'fixed', top:0, left:0, bottom:0, zIndex:50
    }}>
      {/* Logo */}
      <div style={{
        height:60, borderBottom:'1px solid rgba(255,255,255,.06)', flexShrink:0,
        display:'flex', alignItems:'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? 0 : '0 20px', overflow:'hidden',
      }}>
        {!collapsed && <span style={{fontSize:17,fontWeight:800,letterSpacing:'-.5px',whiteSpace:'nowrap'}}>Creato</span>}
        {collapsed  && <span style={{fontSize:17,fontWeight:900,color:'#C4B5FD',letterSpacing:'-.5px'}}>C</span>}
      </div>
      {/* Nav */}
      <nav style={{flex:1, padding:'12px 8px', overflow:'hidden'}}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={()=>nav(item.id)} style={{
            width:'100%', display:'flex', alignItems:'center', gap:10,
            padding:collapsed?'10px 16px':'10px 12px',
            borderRadius:10, border:'none', cursor:'pointer', textAlign:'left',
            background: page===item.id ? 'rgba(124,58,237,.15)' : 'transparent',
            color: page===item.id ? '#C4B5FD' : '#A1A1AA',
            fontSize:14, fontWeight: page===item.id ? 600 : 400,
            transition:'all .15s', marginBottom:2,
            boxShadow: page===item.id ? 'inset 2px 0 0 #7C3AED' : 'none',
            fontFamily:'inherit', whiteSpace:'nowrap', overflow:'hidden',
          }}
          onMouseOver={e=>{if(page!==item.id){e.currentTarget.style.background='rgba(255,255,255,.05)';e.currentTarget.style.color='#fff'}}}
          onMouseOut={e=>{if(page!==item.id){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#A1A1AA'}}}>
            <span style={{display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,width:16}}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      {/* User + credit */}
      {!collapsed && (
        <div style={{padding:'10px 10px 14px', display:'flex', flexDirection:'column', gap:8}}>
          {/* Wallet card */}
          <div style={{
            background:'linear-gradient(135deg,rgba(124,58,237,.14) 0%,rgba(109,40,217,.08) 100%)',
            border:'none',
            borderRadius:12, padding:'12px 14px',
            position:'relative', overflow:'hidden',
          }}>
            {/* subtle glow */}
            <div style={{position:'absolute',top:-30,right:-30,width:90,height:90,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,.2) 0%,transparent 70%)',pointerEvents:'none'}}></div>
            <div style={{display:'flex',alignItems:'baseline',gap:5,marginBottom:10}}>
              <span style={{fontSize:28,fontWeight:900,letterSpacing:'-1.5px',color:'#E9D5FF',lineHeight:1}}>24</span>
              <span style={{fontSize:13,fontWeight:600,color:'#9D5FF5'}}>credit</span>
            </div>
            {/* mini usage bar */}
            <div style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:10,color:'#52525B'}}>Ашигласан: 76 cr</span>
                <span style={{fontSize:10,color:'#52525B'}}>100 cr-ийн</span>
              </div>
              <div style={{height:3,background:'rgba(255,255,255,.08)',borderRadius:100,overflow:'hidden'}}>
                <div style={{height:'100%',width:'24%',background:'linear-gradient(90deg,#7C3AED,#C4B5FD)',borderRadius:100}}></div>
              </div>
            </div>
            <button onClick={()=>nav('credits')} style={{
              width:'100%', background:'rgba(124,58,237,.18)', border:'1px solid rgba(124,58,237,.3)',
              borderRadius:8, padding:'7px', color:'#C4B5FD', fontSize:12, fontWeight:600,
              cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center',
              justifyContent:'center', gap:5, transition:'all .15s',
            }}
            onMouseOver={e=>{e.currentTarget.style.background='rgba(124,58,237,.4)';e.currentTarget.style.borderColor='rgba(124,58,237,.55)'}}
            onMouseOut={e=>{e.currentTarget.style.background='rgba(124,58,237,.25)';e.currentTarget.style.borderColor='rgba(124,58,237,.35)'}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Credit нэмэх
            </button>
          </div>
          {/* User row removed */}
        </div>
      )}

    </aside>
  );
}

/* ── CLIENT LOADING SKELETON ─────────────────────────────── */
function ClientLoadingPage() {
  const sk = (w,h,r=6) => <div style={{width:w,height:h,borderRadius:r,background:'linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%)',backgroundSize:'200% 100%',animation:'cShimmer 1.4s infinite'}}></div>;
  return (
    <div>
      <style>{`@keyframes cShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[0,1,2,3].map(i=><div key={i} style={{background:'#12121C',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:20}}>{sk('60%',11,5)}<div style={{marginTop:10}}>{sk('80%',26,6)}</div><div style={{marginTop:8}}>{sk('40%',10,5)}</div></div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div style={{background:'#12121C',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:20}}>{sk('40%',13,5)}<div style={{marginTop:14}}>{sk('100%',180,8)}</div></div>
        <div style={{background:'#12121C',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:20}}>{sk('40%',13,5)}<div style={{marginTop:14}}>{sk('100%',180,8)}</div></div>
      </div>
    </div>
  );
}

function Header({ page, nav, sidebarCollapsed, onToggle }) {
  const [dropOpen, setDropOpen] = React.useState(false);
  const titles = {
    dashboard:'Хяналтын самбар', presets:'Presets', 'my-images':'Миний зургууд',
    'my-presets':'Миний presets', credits:'Credit авах', billing:'Төлбөрийн түүх',
    transactions:'Гүйлгээ', settings:'Тохиргоо', help:'Тусламж',
    generate:'Зураг үүсгэх', 'preset-detail':'Preset дэлгэрэнгүй',
    'create-preset':'Preset үүсгэх', company:'Байгууллагын багц',
  };
  return (
    <header style={{
      position:'fixed', top:0, left: sidebarCollapsed ? 64 : 232, right:0, height:60,
      background:'rgba(5,5,10,.9)', backdropFilter:'blur(20px)',
      borderBottom:'1px solid rgba(255,255,255,.07)',
      display:'flex', alignItems:'center', paddingRight:24,
      zIndex:40, transition:'left .25s cubic-bezier(.4,0,.2,1)', gap:14
    }}>
      {/* Sidebar toggle — flush left */}
      <button
        onClick={onToggle}
        style={{
          width:60, height:60, flexShrink:0,
          background:'transparent', border:'none',
          color:'#52525B', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'color .15s', fontFamily:'inherit',
        }}
        onMouseOver={e=>e.currentTarget.style.color='#A1A1AA'}
        onMouseOut={e=>e.currentTarget.style.color='#52525B'}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div style={{flex:1}}>
        <div style={{fontSize:16,fontWeight:700,color:'#fff'}}>{titles[page]||'Creato'}</div>
      </div>

      <ClientNotifBell nav={nav} />
      {/* Avatar */}
      <div style={{position:'relative'}}>
        <button onClick={()=>setDropOpen(!dropOpen)} style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#38BDF8)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff',fontFamily:'inherit'}}>Б</button>
        {dropOpen && (
          <div style={{position:'absolute',top:'calc(100% + 8px)',right:0,width:192,background:'#12121C',border:'1px solid rgba(255,255,255,.1)',borderRadius:12,padding:6,boxShadow:'0 20px 60px rgba(0,0,0,.6)',zIndex:200}}>
            <div style={{padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,.07)',marginBottom:4}}>
              <div style={{fontSize:13,fontWeight:600}}>Батбаяр Д.</div>
              <div style={{fontSize:11,color:'#52525B'}}>batbayar@email.mn</div>
            </div>
            {[['settings','⚙','Тохиргоо'],['billing','🧾','Төлбөрийн түүх']].map(([id,ic,lb])=>(
              <button key={id} onClick={()=>{nav(id);setDropOpen(false)}} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,border:'none',background:'transparent',color:'#A1A1AA',fontSize:13,cursor:'pointer',fontFamily:'inherit',textAlign:'left'}}
                onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,.06)';e.currentTarget.style.color='#fff'}}
                onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#A1A1AA'}}>
                <span>{ic}</span>{lb}
              </button>
            ))}
            <div style={{borderTop:'1px solid rgba(255,255,255,.07)',marginTop:4,paddingTop:4}}>
              <a href="Homepage.html" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,color:'#EF4444',fontSize:13,textDecoration:'none'}}
                onMouseOver={e=>{e.currentTarget.style.background='rgba(239,68,68,.08)'}}
                onMouseOut={e=>{e.currentTarget.style.background='transparent'}}>
                <span>🚪</span>Гарах
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function AppShell({ page, nav, children }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const prevPage = React.useRef(page);

  React.useEffect(() => {
    if (prevPage.current !== page) {
      prevPage.current = page;
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 280);
      return () => clearTimeout(t);
    }
  }, [page]);

  const sw = collapsed ? 64 : 232;
  const toggle = () => setCollapsed(v => !v);
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#05050A',color:'#fff',fontFamily:"'Roboto',sans-serif"}}>
      <Sidebar page={page} nav={nav} collapsed={collapsed} onToggle={toggle} />
      <div style={{flex:1,marginLeft:sw,transition:'margin-left .25s cubic-bezier(.4,0,.2,1)',display:'flex',flexDirection:'column',minHeight:'100vh'}}>
        <Header page={page} nav={nav} sidebarCollapsed={collapsed} onToggle={toggle} />
        <main style={{flex:1,marginTop:60,padding:'32px 28px',overflowY:'auto'}}>
          {loading ? <ClientLoadingPage /> : children}
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { AppShell, Sidebar, Header });
