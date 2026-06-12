// client/pages-secondary.jsx — MyImages, MyPresets, CreatePreset, Credits, Billing, Transactions, Settings, Help
const { useState } = React;

/* ── CUSTOM CHECKBOX ─────────────────────────────────────── */
function CustomCheckbox({ checked, onChange, label, description }) {
  return (
    <div onClick={()=>onChange(!checked)} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:checked?'rgba(124,58,237,.08)':'rgba(255,255,255,.03)',border:`1px solid ${checked?'rgba(124,58,237,.3)':'rgba(255,255,255,.08)'}`,borderRadius:10,cursor:'pointer',transition:'all .2s',userSelect:'none'}}>
      <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${checked?'#7C3AED':'rgba(255,255,255,.2)'}`,background:checked?'#7C3AED':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .16s',boxShadow:checked?'0 0 8px rgba(124,58,237,.45)':'none'}}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:500,color:checked?'#E4E4E7':'#A1A1AA',transition:'color .18s'}}>{label}</div>
        {description && <div style={{fontSize:11,color:'#52525B',marginTop:2}}>{description}</div>}
      </div>
    </div>
  );
}

/* ── MY IMAGES ───────────────────────────────────────────── */
function MyImagesPage({nav}) {
  const [filter,setFilter]=useState('all');
  const [sel,setSel]=useState(null);
  const imgs=[
    {id:1,name:'Профайл зураг #1',preset:'Профайл загвар',g:0,date:'2024-06-04',cr:2},
    {id:2,name:'Бизнес баннер',preset:'Баннер загвар',g:1,date:'2024-06-04',cr:1},
    {id:3,name:'Instagram пост',preset:'Соц медиа',g:2,date:'2024-06-03',cr:1},
    {id:4,name:'Монгол загвар',preset:'Монгол урлаг',g:3,date:'2024-06-03',cr:2},
    {id:5,name:'Лого загвар',preset:'Брэнд загвар',g:4,date:'2024-06-02',cr:3},
    {id:6,name:'Байгалийн зираг',preset:'Байгаль',g:7,date:'2024-06-01',cr:2},
    {id:7,name:'Профайл зураг #2',preset:'Профайл загвар',g:0,date:'2024-05-31',cr:2},
    {id:8,name:'Зарын зураг',preset:'Зар загвар',g:6,date:'2024-05-30',cr:1},
  ];
  if(imgs.length===0) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:400,textAlign:'center',color:'#52525B'}}>
      <div style={{fontSize:36,marginBottom:16,color:'#3F3F46'}}>◻</div>
      <div style={{fontSize:18,fontWeight:700,color:'#A1A1AA',marginBottom:8}}>Зураг байхгүй байна</div>
      <p style={{fontSize:14,marginBottom:24}}>Эхний зургаа үүсгэж эхэл!</p>
      <button onClick={()=>nav('presets')} style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',cursor:'pointer',fontSize:14,fontWeight:600,fontFamily:'inherit'}}>Preset үзэх →</button>
    </div>
  );
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <h2 style={{fontSize:20,fontWeight:700,letterSpacing:'-.5px'}}>Миний зургууд <span style={{fontSize:14,color:'#52525B',fontWeight:400}}>({imgs.length})</span></h2>
        <div style={{display:'flex',gap:8}}>
          {['all','today','week'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'7px 14px',borderRadius:100,border:`1px solid ${filter===f?'rgba(124,58,237,.4)':'rgba(255,255,255,.07)'}`,background:filter===f?'rgba(124,58,237,.12)':'transparent',color:filter===f?'#C4B5FD':'#A1A1AA',fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>
              {f==='all'?'Бүгд':f==='today'?'Өнөөдөр':'7 хоног'}
            </button>
          ))}
          <select style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'7px 12px',color:'#A1A1AA',fontSize:13,outline:'none',fontFamily:'inherit',cursor:'pointer'}}>
            <option>Preset-ээр</option>{['Профайл','Баннер','Соц медиа','Лого'].map(p=><option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14}}>
        {imgs.map(img=>(
          <div key={img.id} style={{background:'var(--card)',border:`1px solid ${sel===img.id?'rgba(124,58,237,.4)':'rgba(255,255,255,.07)'}`,borderRadius:12,overflow:'hidden',cursor:'pointer',transition:'all .2s',position:'relative'}}
            onClick={()=>setSel(sel===img.id?null:img.id)}
            onMouseOver={e=>e.currentTarget.style.borderColor='rgba(124,58,237,.25)'}
            onMouseOut={e=>e.currentTarget.style.borderColor=sel===img.id?'rgba(124,58,237,.4)':'rgba(255,255,255,.07)'}>
            <div style={{aspectRatio:'1',background:GradThumbs[img.g],position:'relative'}}>
              {sel===img.id && <div style={{position:'absolute',inset:0,background:'rgba(124,58,237,.25)',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:24,height:24,borderRadius:'50%',background:'#7C3AED',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>✓</div></div>}
            </div>
            <div style={{padding:'10px 12px'}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{img.name}</div>
              <div style={{fontSize:11,color:'#52525B',marginBottom:9}}>{img.preset} · {img.date}</div>
              <div style={{display:'flex',gap:5}}>
                {/* Татах */}
                <button
                  title="Татах"
                  style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,background:'rgba(255,255,255,.05)',border:'1px solid var(--bdr)',borderRadius:8,padding:'7px 4px',cursor:'pointer',transition:'all .15s',color:'#A1A1AA'}}
                  onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,.11)';e.currentTarget.style.borderColor='rgba(255,255,255,.18)';e.currentTarget.style.color='#fff'}}
                  onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,.05)';e.currentTarget.style.borderColor='rgba(255,255,255,.08)';e.currentTarget.style.color='#A1A1AA'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 21h14"/>
                  </svg>
                  <span style={{fontSize:9,fontWeight:600,letterSpacing:'.3px',fontFamily:'inherit'}}>Татах</span>
                </button>
                {/* Дахин үүсгэх */}
                <button
                  title="Дахин үүсгэх"
                  onClick={(e)=>{e.stopPropagation();nav('generate')}}
                  style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.22)',borderRadius:8,padding:'7px 4px',cursor:'pointer',transition:'all .15s',color:'#9D5FF5'}}
                  onMouseOver={e=>{e.currentTarget.style.background='rgba(124,58,237,.2)';e.currentTarget.style.borderColor='rgba(124,58,237,.45)';e.currentTarget.style.color='#C4B5FD'}}
                  onMouseOut={e=>{e.currentTarget.style.background='rgba(124,58,237,.1)';e.currentTarget.style.borderColor='rgba(124,58,237,.22)';e.currentTarget.style.color='#9D5FF5'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                  </svg>
                  <span style={{fontSize:9,fontWeight:600,letterSpacing:'.3px',fontFamily:'inherit'}}>Үүсгэх</span>
                </button>
                {/* Устгах */}
                <button
                  title="Устгах"
                  onClick={e=>e.stopPropagation()}
                  style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,background:'rgba(239,68,68,.07)',border:'1px solid rgba(239,68,68,.18)',borderRadius:8,padding:'7px 4px',cursor:'pointer',transition:'all .15s',color:'#EF4444'}}
                  onMouseOver={e=>{e.currentTarget.style.background='rgba(239,68,68,.16)';e.currentTarget.style.borderColor='rgba(239,68,68,.38)';e.currentTarget.style.color='#F87171'}}
                  onMouseOut={e=>{e.currentTarget.style.background='rgba(239,68,68,.07)';e.currentTarget.style.borderColor='rgba(239,68,68,.18)';e.currentTarget.style.color='#EF4444'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  <span style={{fontSize:9,fontWeight:600,letterSpacing:'.3px',fontFamily:'inherit'}}>Устгах</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {sel && (
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'rgba(13,13,20,.95)',border:'1px solid rgba(255,255,255,.1)',borderRadius:12,padding:'12px 20px',display:'flex',alignItems:'center',gap:12,backdropFilter:'blur(16px)',zIndex:200,boxShadow:'0 16px 48px rgba(0,0,0,.6)'}}>
          <span style={{fontSize:13,color:'#A1A1AA'}}>1 зураг сонгогдсон</span>
          <button style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>⬇ Татах</button>
          <button style={{background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.25)',color:'#EF4444',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>🗑 Устгах</button>
          <button onClick={()=>setSel(null)} style={{background:'none',border:'none',color:'#52525B',cursor:'pointer',fontSize:16,fontFamily:'inherit'}}>✕</button>
        </div>
      )}
    </div>
  );
}

/* ── MY PRESETS ──────────────────────────────────────────── */
function MyPresetsPage({nav}) {
  const profileComplete=false;
  const myPresets=[
    {id:1,name:'Монгол хот зираг',status:'active',uses:84,rewards:84,cat:'Байгаль',g:7,cr:2},
    {id:2,name:'Уламжлалт хувцас',status:'pending_review',uses:0,rewards:0,cat:'Урлаг',g:3,cr:2},
    {id:3,name:'Оффисийн ажилчид',status:'draft',uses:0,rewards:0,cat:'Бизнес',g:1,cr:1},
    {id:4,name:'Тэнгэрлэг байгаль',status:'rejected',uses:0,rewards:0,cat:'Байгаль',g:7,cr:2},
  ];
  const statusMap={active:{c:'green',l:'Идэвхтэй'},pending_review:{c:'amber',l:'Хянагдаж байна'},draft:{c:'gray',l:'Ноорог'},rejected:{c:'red',l:'Татгалзсан'},hidden:{c:'gray',l:'Нуугдсан'}};
  if(!profileComplete) return (
    <div style={{maxWidth:520,margin:'80px auto',textAlign:'center'}}>
      <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(124,58,237,.12)',border:'1px solid rgba(124,58,237,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,margin:'0 auto 20px',color:'#9D5FF5'}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>
      <h2 style={{fontSize:22,fontWeight:800,letterSpacing:'-.5px',marginBottom:12}}>Профайл бүрэн биш байна</h2>
      <p style={{fontSize:14,color:'#A1A1AA',lineHeight:1.7,marginBottom:24}}>Preset үүсгэхийн тулд эхлээд дэлгэрэнгүй профайлаа бөглөнө үү. Энэ нь нэг удааны процесс бөгөөд дуусгасны дараа preset үүсгэж болно.</p>
      <div style={{background:'rgba(124,58,237,.08)',border:'1px solid rgba(124,58,237,.2)',borderRadius:12,padding:16,marginBottom:24,textAlign:'left'}}>
        {['Бүтэн нэр','Утасны дугаар','Creator нэр (дисплей нэр)','Товч намтар','Зөвшөөрлийн нөхцөл'].map((f,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderBottom:i<4?'1px solid rgba(124,58,237,.1)':'none'}}>
            <span style={{color:'#EF4444',fontSize:11}}>○</span>
            <span style={{fontSize:13,color:'#A1A1AA'}}>{f}</span>
          </div>
        ))}
      </div>
      <button onClick={()=>nav('settings')} style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'#fff',border:'none',borderRadius:10,padding:'13px 28px',cursor:'pointer',fontSize:15,fontWeight:600,fontFamily:'inherit',boxShadow:'0 0 20px rgba(124,58,237,.35)'}}>Профайл бөглөх →</button>
    </div>
  );
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,letterSpacing:'-.5px'}}>Миний presets</h2>
          <p style={{fontSize:13,color:'#52525B',marginTop:4}}>Нийт {myPresets.length} preset · {myPresets.filter(p=>p.status==='active').length} идэвхтэй</p>
        </div>
        <button onClick={()=>nav('create-preset')} style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'#fff',border:'none',borderRadius:10,padding:'11px 20px',cursor:'pointer',fontSize:14,fontWeight:600,fontFamily:'inherit',display:'flex',alignItems:'center',gap:8,boxShadow:'0 0 16px rgba(124,58,237,.3)'}}>+ Preset үүсгэх</button>
      </div>
      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
        {[['◈','Нийт reward',myPresets.reduce((a,p)=>a+p.rewards,0)+' cr','purple'],['↗','Нийт ашиглалт',myPresets.reduce((a,p)=>a+p.uses,0),'blue'],['◧','Идэвхтэй preset',myPresets.filter(p=>p.status==='active').length,'pink']].map(([ic,l,v,c],i)=>(
          <Card key={i} style={{padding:20,background:'var(--card)',border:'1px solid var(--bdr)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
              <span style={{fontSize:20}}>{ic}</span>
              <span style={{fontSize:13,color:'#A1A1AA'}}>{l}</span>
            </div>
            <div style={{fontSize:26,fontWeight:800,letterSpacing:'-1px',color:c==='purple'?'#C4B5FD':c==='blue'?'#38BDF8':'#EC4899'}}>{v}</div>
          </Card>
        ))}
      </div>
      {/* List */}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {myPresets.map(p=>(
          <Card key={p.id} style={{padding:16}}>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:60,height:44,borderRadius:8,background:GradThumbs[p.g],flexShrink:0}}></div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                  <span style={{fontSize:15,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</span>
                  <Pill color={statusMap[p.status].c}>{statusMap[p.status].l}</Pill>
                </div>
                <div style={{fontSize:12,color:'#52525B'}}>{p.cat} · 💎 {p.cr} cr · {p.uses} ашиглалт · +{p.rewards} cr reward</div>
              </div>
              <div style={{display:'flex',gap:8,flexShrink:0}}>
                <button style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'#A1A1AA',borderRadius:8,padding:'7px 12px',cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>Засах</button>
                {p.status==='rejected'&&<button style={{background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.2)',color:'#EF4444',borderRadius:8,padding:'7px 12px',cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>Шалтгаан</button>}
              </div>
            </div>
            {p.status==='rejected' && <div style={{marginTop:10,padding:'10px 12px',background:'rgba(239,68,68,.06)',border:'1px solid rgba(239,68,68,.15)',borderRadius:8,fontSize:12,color:'#EF4444'}}>❌ Татгалзсан шалтгаан: Prompt агуулга зөвшөөрөгдөхгүй. Засаж дахин илгээнэ үү.</div>}
            {p.status==='pending_review' && <div style={{marginTop:10,padding:'10px 12px',background:'rgba(251,191,36,.06)',border:'1px solid rgba(251,191,36,.15)',borderRadius:8,fontSize:12,color:'#FCD34D'}}>⏳ Admin баг хянаж байна. 1–2 ажлын өдрийн дотор шийдэгдэнэ.</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ── CREATE PRESET ───────────────────────────────────────── */
function CreatePresetPage({nav}) {
  const [step,setStep]=useState(1);
  const steps=['Үндсэн мэдээлэл','Ангилал/Төрөл','Оролтын талбарууд','Агуулга','Зураг/Жишээ','Credit тохиргоо','Хянаж илгээх'];
  const [form,setForm]=useState({name:'',cat:'',type:'',desc:'',imageUpload:false,textInput:false,colorOption:false,baseCr:1,rewardCr:0,visibility:'public'});
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  return (
    <div style={{maxWidth:720,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
        <button onClick={()=>step>1?setStep(step-1):nav('my-presets')} style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'#A1A1AA',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>← Буцах</button>
        <div style={{flex:1}}>
          <h2 style={{fontSize:18,fontWeight:700,letterSpacing:'-.5px'}}>Preset үүсгэх</h2>
          <div style={{fontSize:13,color:'#52525B'}}>Алхам {step}/{steps.length}: {steps[step-1]}</div>
        </div>
      </div>
      {/* Cost notice */}
      <div style={{background:'rgba(251,191,36,.07)',border:'1px solid rgba(251,191,36,.2)',borderRadius:10,padding:'12px 16px',marginBottom:20,display:'flex',alignItems:'center',gap:10,fontSize:13,color:'#FCD34D'}}>
        <span style={{fontSize:14,color:'#FCD34D'}}>!</span>
        <span>Preset үүсгэхэд <strong>10 credit</strong> зарцуулагдана. Таны одоогийн үлдэгдэл: 💎 24 cr</span>
      </div>
      {/* Step indicator */}
      <div style={{display:'flex',gap:0,marginBottom:28,background:'rgba(255,255,255,.04)',borderRadius:12,padding:4}}>
        {steps.map((_,i)=>(
          <div key={i} onClick={()=>i<step&&setStep(i+1)} style={{flex:1,height:4,borderRadius:4,background:i+1<=step?'#7C3AED':'transparent',cursor:i<step?'pointer':'default',transition:'background .3s'}}></div>
        ))}
      </div>
      <Card style={{marginBottom:16}}>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:20}}>{steps[step-1]}</h3>
        {step===1 && (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div><label style={{display:'block',fontSize:13,fontWeight:500,color:'#A1A1AA',marginBottom:7}}>Preset нэр *</label><input value={form.name} onChange={e=>upd('name',e.target.value)} placeholder="Жишээ: Профессиональ профайл зураг" style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'11px 14px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit'}} /></div>
            <div><label style={{display:'block',fontSize:13,fontWeight:500,color:'#A1A1AA',marginBottom:7}}>Тайлбар *</label><textarea value={form.desc} onChange={e=>upd('desc',e.target.value)} placeholder="Preset юу хийдэг, хэнд зориулсан тайлбар..." rows={4} style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'11px 14px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit',resize:'vertical'}} /></div>
          </div>
        )}
        {step===2 && (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div><label style={{display:'block',fontSize:13,fontWeight:500,color:'#A1A1AA',marginBottom:10}}>Ангилал *</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {['Портрет','Бизнес','Соц медиа','Урлаг','Брэнд','Байгаль'].map(c=>(
                  <button key={c} onClick={()=>upd('cat',c)} style={{padding:'10px',borderRadius:8,border:`1px solid ${form.cat===c?'rgba(124,58,237,.4)':'rgba(255,255,255,.08)'}`,background:form.cat===c?'rgba(124,58,237,.12)':'rgba(255,255,255,.03)',color:form.cat===c?'#C4B5FD':'#A1A1AA',cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>{c}</button>
                ))}
              </div>
            </div>
            <div><label style={{display:'block',fontSize:13,fontWeight:500,color:'#A1A1AA',marginBottom:10}}>Төрөл *</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {['Зургийн генерац','Зураг засварлах','Текст-зураг','Зураг-зураг'].map(t=>(
                  <button key={t} onClick={()=>upd('type',t)} style={{padding:'10px',borderRadius:8,border:`1px solid ${form.type===t?'rgba(124,58,237,.4)':'rgba(255,255,255,.08)'}`,background:form.type===t?'rgba(124,58,237,.12)':'rgba(255,255,255,.03)',color:form.type===t?'#C4B5FD':'#A1A1AA',cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step===3 && (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{fontSize:13,color:'#A1A1AA',marginBottom:4}}>Хэрэглэгч юу оруулах боломжтой байх вэ?</div>
            {[['imageUpload','Зураг оруулах','Хэрэглэгч зургаа оруулах шаардлагатай'],['textInput','Текст оруулах','Нэр, тайлбар эсвэл текст оруулах'],['colorOption','Өнгө сонгох','Өнгөний сонголт нэмэх']].map(([k,l,d])=>(
              <div key={k} onClick={()=>upd(k,!form[k])} style={{display:'flex',alignItems:'center',gap:14,padding:14,background:form[k]?'rgba(124,58,237,.08)':'rgba(255,255,255,.03)',border:`1px solid ${form[k]?'rgba(124,58,237,.3)':'rgba(255,255,255,.07)'}`,borderRadius:10,cursor:'pointer',transition:'all .15s'}}>
                <div style={{width:20,height:20,borderRadius:6,background:form[k]?'#7C3AED':'rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>{form[k]?'✓':''}</div>
                <div><div style={{fontSize:14,fontWeight:500}}>{l}</div><div style={{fontSize:12,color:'#52525B'}}>{d}</div></div>
              </div>
            ))}
          </div>
        )}
        {step===4 && (
          <div>
            <div style={{background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.2)',borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:13,color:'#EF4444'}}>
              Prompt талбар зөвхөн admin-д харагдана. Нийтийн хэрэглэгчдэд нуугдсан байна.
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><label style={{display:'block',fontSize:13,color:'#A1A1AA',marginBottom:7}}>Үндсэн instruction / prompt *</label><textarea placeholder="AI-д өгөх нарийвчилсан instruction..." rows={5} style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'11px 14px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit',resize:'vertical'}} /></div>
              <div><label style={{display:'block',fontSize:13,color:'#A1A1AA',marginBottom:7}}>Нэмэлт prompt (optional)</label><textarea placeholder="Хэрэглэгчийн тохиргоог нэмж болно..." rows={3} style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'11px 14px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit',resize:'vertical'}} /></div>
            </div>
          </div>
        )}
        {step===5 && (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div><label style={{display:'block',fontSize:13,color:'#A1A1AA',marginBottom:10}}>Thumbnail зураг *</label>
              <div style={{border:'2px dashed rgba(255,255,255,.1)',borderRadius:10,padding:32,textAlign:'center',cursor:'pointer'}} onMouseOver={e=>e.currentTarget.style.borderColor='rgba(124,58,237,.4)'} onMouseOut={e=>e.currentTarget.style.borderColor='rgba(255,255,255,.1)'}>
                <div style={{fontSize:18,marginBottom:8,color:'#52525B'}}>⬆</div>
                <div style={{fontSize:13,color:'#A1A1AA'}}>Thumbnail зураг оруулах</div>
                <div style={{fontSize:11,color:'#52525B',marginTop:4}}>PNG, JPG — 5MB хүртэл</div>
              </div>
            </div>
            <div><label style={{display:'block',fontSize:13,color:'#A1A1AA',marginBottom:10}}>Жишээ гаралтын зургууд (заавал биш)</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {[0,1,2,3].map(i=><div key={i} style={{aspectRatio:'1',border:'2px dashed rgba(255,255,255,.08)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,color:'#3F3F46',cursor:'pointer'}} onMouseOver={e=>e.currentTarget.style.borderColor='rgba(124,58,237,.3)'} onMouseOut={e=>e.currentTarget.style.borderColor='rgba(255,255,255,.08)'}>+</div>)}
              </div>
            </div>
          </div>
        )}
        {step===6 && (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div><label style={{display:'block',fontSize:13,color:'#A1A1AA',marginBottom:7}}>Үндсэн генерацийн credit *</label>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <input type="number" value={form.baseCr} onChange={e=>upd('baseCr',+e.target.value)} min={1} max={10} style={{width:80,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'10px',color:'#fff',fontSize:16,fontWeight:700,outline:'none',fontFamily:'inherit',textAlign:'center'}} />
                <span style={{fontSize:13,color:'#52525B'}}>credit = {form.baseCr*990}₮</span>
              </div>
            </div>
            <div><label style={{display:'block',fontSize:13,color:'#A1A1AA',marginBottom:7}}>Creator reward (optional)</label>
              <input type="number" value={form.rewardCr} onChange={e=>upd('rewardCr',+e.target.value)} min={0} max={5} style={{width:80,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'10px',color:'#fff',fontSize:16,fontWeight:700,outline:'none',fontFamily:'inherit',textAlign:'center'}} />
              <div style={{fontSize:12,color:'#52525B',marginTop:6}}>Хэрэглэгч таны preset ашиглах тутамд энэ credit авна</div>
            </div>
          </div>
        )}
        {step===7 && (
          <div>
            <div style={{background:'rgba(124,58,237,.08)',border:'1px solid rgba(124,58,237,.2)',borderRadius:10,padding:16,marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:'#9D5FF5',marginBottom:10}}>Илгээхийн өмнөх хураангуй</div>
              {[['Нэр',form.name||'—'],['Ангилал',form.cat||'—'],['Зураг оруулах',form.imageUpload?'Тийм':'Үгүй'],['Үндсэн credit',`${form.baseCr} cr`],['Creator reward',`${form.rewardCr} cr`]].map(([l,v],i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'6px 0',borderBottom:i<4?'1px solid rgba(124,58,237,.1)':'none'}}><span style={{color:'#A1A1AA'}}>{l}</span><span style={{fontWeight:600}}>{v}</span></div>
              ))}
            </div>
            <div style={{background:'rgba(251,191,36,.07)',border:'1px solid rgba(251,191,36,.2)',borderRadius:10,padding:14,marginBottom:20,fontSize:13,color:'#FCD34D'}}>
              ⚠️ Илгээснийхээ дараа admin баг 1–2 ажлын өдрийн дотор хянана. Зөвшөөрсний дараа нийтэд нээлттэй болно.
            </div>
            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'#A1A1AA',borderRadius:10,padding:'12px',cursor:'pointer',fontSize:14,fontFamily:'inherit'}}>💾 Ноорог хадгалах</button>
              <button onClick={()=>nav('my-presets')} style={{flex:2,background:'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'#fff',border:'none',borderRadius:10,padding:'12px',cursor:'pointer',fontSize:14,fontWeight:600,fontFamily:'inherit',boxShadow:'0 0 16px rgba(124,58,237,.3)'}}>✅ Хянуулахаар илгээх (10 cr)</button>
            </div>
          </div>
        )}
      </Card>
      {step<7 && <div style={{display:'flex',justifyContent:'flex-end'}}>
        <button onClick={()=>setStep(step+1)} style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',cursor:'pointer',fontSize:14,fontWeight:600,fontFamily:'inherit',boxShadow:'0 0 16px rgba(124,58,237,.3)'}}>Дараагийн алхам →</button>
      </div>}
    </div>
  );
}

/* ── CREDITS ─────────────────────────────────────────────── */
function CreditsPage({nav}) {
  const [pay, setPay] = useState(null);
  const pkgs = [
    {cr:10,  price:9900,  color:'#A1A1AA', perCr:990},
    {cr:25,  price:24750, color:'#38BDF8', perCr:990},
    {cr:50,  price:49500, color:'#9D5FF5', perCr:990, popular:true},
    {cr:100, price:99000, color:'#EC4899', perCr:990},
    {cr:null,price:null,  color:'#38BDF8', corp:true},
  ];

  return (
    <div>
      {/* Wallet balance bar */}
      <div style={{background:'linear-gradient(135deg,rgba(124,58,237,.12),rgba(56,189,248,.05))',border:'1px solid rgba(124,58,237,.18)',borderRadius:16,padding:'20px 24px',marginBottom:28,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div>
            <div style={{fontSize:12,color:'#9D5FF5',fontWeight:600,marginBottom:4,textTransform:'uppercase',letterSpacing:'.5px'}}>Одоогийн үлдэгдэл</div>
            <div style={{display:'flex',alignItems:'baseline',gap:6}}><span style={{fontSize:32,fontWeight:900,letterSpacing:'-1.5px',color:'#E9D5FF'}}>24</span><span style={{fontSize:15,color:'#9D5FF5',fontWeight:600}}>credit</span></div>
          </div>
        </div>
        <button onClick={()=>nav('transactions')} style={{display:'inline-flex',alignItems:'center',gap:7,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'#A1A1AA',borderRadius:10,padding:'10px 16px',cursor:'pointer',fontSize:13,fontFamily:'inherit',transition:'all .15s'}}
          onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,.1)';e.currentTarget.style.color='#fff'}}
          onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,.06)';e.currentTarget.style.color='#A1A1AA'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Гүйлгээний түүх
        </button>
      </div>

      {/* Section title */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'2px',color:'#9D5FF5',marginBottom:6}}>Credit багц</div>
      </div>

      {/* Package cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:28}}>
        {pkgs.map((p,i)=>{
          const sel = pay===p;
          const palette = [
            {main:'#A1A1AA',bg:'rgba(161,161,170,.08)',bdr:'rgba(161,161,170,.2)'},
            {main:'#38BDF8',bg:'rgba(56,189,248,.08)', bdr:'rgba(56,189,248,.25)'},
            {main:'#9D5FF5',bg:'rgba(157,95,245,.1)',  bdr:'rgba(157,95,245,.3)'},
            {main:'#EC4899',bg:'rgba(236,72,153,.08)', bdr:'rgba(236,72,153,.25)'},
            {main:'#38BDF8',bg:'rgba(56,189,248,.06)', bdr:'rgba(56,189,248,.2)'},
          ][i];
          return (
            <div key={i}
              style={{
                position:'relative',borderRadius:18,overflow:'visible',
                cursor:p.corp?'default':'pointer',transition:'transform .2s,box-shadow .2s',
                display:'flex',flexDirection:'column',
                background: p.popular ? `linear-gradient(160deg,${palette.bg},var(--card))` : 'var(--card)',
                border:'1px solid rgba(255,255,255,.08)',
                borderTop:`2px solid ${palette.main}`,
                boxShadow:'none',
              }}
              onMouseOver={e=>{if(!p.corp){e.currentTarget.style.transform='translateY(-6px)';e.currentTarget.style.boxShadow='0 20px 40px rgba(0,0,0,.45)';}}}
              onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>

              {p.popular && <div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#7C3AED,#EC4899)',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 14px',borderRadius:100,letterSpacing:'.6px',whiteSpace:'nowrap',fontFamily:"'Roboto',sans-serif",boxShadow:'0 2px 10px rgba(124,58,237,.4)',zIndex:2}}>ТОП</div>}

              <div style={{padding:p.popular?'22px 14px 16px':'18px 14px 16px',textAlign:'center',fontFamily:"'Roboto',sans-serif",display:'flex',flexDirection:'column',flexGrow:1,minHeight:200}}>

                {/* Amount */}
                {p.corp ? (
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:46,fontWeight:900,letterSpacing:'-3px',lineHeight:1,color:palette.main}}>B2B</div>
                    <div style={{fontSize:10,fontWeight:700,color:'#3F3F46',textTransform:'uppercase',letterSpacing:'1.5px',marginTop:2}}>байгууллага</div>
                  </div>
                ) : (
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:46,fontWeight:900,letterSpacing:'-3px',lineHeight:1,color:palette.main}}>{p.cr}</div>
                    <div style={{fontSize:10,fontWeight:700,color:'#3F3F46',textTransform:'uppercase',letterSpacing:'1.5px',marginTop:2}}>credit</div>
                  </div>
                )}

                {/* Price */}
                {p.corp ? (
                  <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',marginBottom:12}}>
                    <div style={{height:'1px',background:'rgba(255,255,255,.05)',marginBottom:10}}></div>
                    <div style={{fontSize:14,fontWeight:700,color:'#E4E4E7',letterSpacing:'-.3px'}}>Тусгай тариф</div>
                  </div>
                ) : (
                  <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',marginBottom:12}}>
                    <div style={{height:'1px',background:'rgba(255,255,255,.05)',marginBottom:10}}></div>
                    <div style={{fontSize:19,fontWeight:800,color:'#E4E4E7',letterSpacing:'-.5px'}}>{p.price.toLocaleString()}₮</div>
                    <div style={{fontSize:11,color:'#52525B',marginTop:2}}>990₮ / credit</div>
                  </div>
                )}

                {/* CTA — pinned to bottom */}
                <div style={{marginTop:'auto'}}>
                {p.corp ? (
                  <button onClick={e=>{e.stopPropagation();nav('company')}}
                    style={{width:'100%',background:palette.bg,border:`1px solid ${palette.bdr}`,color:palette.main,borderRadius:10,padding:'9px',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'inherit',transition:'background .15s'}}
                    onMouseOver={e=>e.currentTarget.style.background=palette.bg.replace('.06',',.15').replace('.08',',.16')}
                    onMouseOut={e=>e.currentTarget.style.background=palette.bg}>
                    Холбогдох
                  </button>
                ) : (
                  <button onClick={e=>{e.stopPropagation();setPay(p);}}
                    style={{
                      width:'100%',border:'none',borderRadius:10,padding:'10px',
                      cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'inherit',transition:'all .15s',
                      background: p.popular ? 'linear-gradient(135deg,#7C3AED,#6D28D9)' : 'var(--glass)',
                      color: p.popular ? '#fff' : 'var(--t)',
                      boxShadow: p.popular ? '0 4px 16px rgba(124,58,237,.3)' : 'none',
                    }}
                    onMouseOver={e=>{e.currentTarget.style.background=p.popular?'linear-gradient(135deg,#8B5CF6,#7C3AED)':`${palette.main}22`;e.currentTarget.style.color='#fff';}}
                    onMouseOut={e=>{e.currentTarget.style.background=p.popular?'linear-gradient(135deg,#7C3AED,#6D28D9)':`rgba(255,255,255,.07)`;}}>
                    Авах
                  </button>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Payment modal */}
      {pay && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:24}}
          onClick={()=>setPay(null)}>
          <div style={{background:'var(--card)',border:'1px solid var(--bdr)',borderRadius:20,width:'100%',maxWidth:420,padding:28,boxShadow:'0 32px 80px rgba(0,0,0,.7)'}}
            onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <h3 style={{fontSize:17,fontWeight:700}}>Төлбөр хийх</h3>
              <button onClick={()=>setPay(null)} style={{width:30,height:30,borderRadius:8,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',color:'#71717A',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontFamily:'inherit'}}>✕</button>
            </div>
            <div style={{padding:'16px',background:'rgba(124,58,237,.07)',border:'1px solid rgba(124,58,237,.18)',borderRadius:12,marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#A1A1AA',marginBottom:10}}><span>Сонгосон багц</span><span style={{fontWeight:700,color:'#E4E4E7'}}>{pay.cr} credit</span></div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:20,fontWeight:800}}><span>Нийт дүн</span><span style={{color:'#C4B5FD'}}>{pay.price.toLocaleString()}₮</span></div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,marginBottom:16}}>
              <div style={{width:38,height:38,borderRadius:10,background:'rgba(124,58,237,.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:13,fontWeight:800,color:'#9D5FF5',letterSpacing:'-.5px'}}>QR</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:'#E4E4E7'}}>Онлайн төлбөр</div><div style={{fontSize:11,color:'#52525B'}}>Дотоодын банкны карт, QR</div></div>
              <div style={{width:18,height:18,borderRadius:'50%',background:'#7C3AED',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <button style={{width:'100%',background:'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'#fff',border:'none',borderRadius:10,padding:'14px',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 0 20px rgba(124,58,237,.35)',fontFamily:'inherit',marginBottom:10,letterSpacing:'-.3px'}}>
              Төлбөр хийх
            </button>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:11,color:'#3F3F46'}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Аюулгүй, шифрлэгдсэн төлбөр
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── BILLING ─────────────────────────────────────────────── */
function BillingPage() {
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const RAW = [
    {ref:'BON-2024-0012',pkg:'50 Credit',cr:50,amt:49500,status:'paid',   date:'2024-06-04'},
    {ref:'BON-2024-0009',pkg:'25 Credit',cr:25,amt:24750,status:'paid',   date:'2024-05-20'},
    {ref:'BON-2024-0006',pkg:'10 Credit',cr:10,amt:9900, status:'failed', date:'2024-05-10'},
    {ref:'BON-2024-0003',pkg:'25 Credit',cr:25,amt:24750,status:'paid',   date:'2024-04-28'},
    {ref:'BON-2024-0001',pkg:'10 Credit',cr:10,amt:9900, status:'paid',   date:'2024-04-10'},
  ];

  const sc = {
    paid:    {dot:'#4ADE80', bg:'rgba(74,222,128,.1)',  bdr:'rgba(74,222,128,.25)',  txt:'#4ADE80',  l:'Амжилттай'},
    pending: {dot:'#FBBF24', bg:'rgba(251,191,36,.1)',  bdr:'rgba(251,191,36,.25)', txt:'#FBBF24',  l:'Хүлээгдэж байна'},
    failed:  {dot:'#EF4444', bg:'rgba(239,68,68,.1)',   bdr:'rgba(239,68,68,.22)',  txt:'#F87171',  l:'Амжилтгүй'},
  };

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }

  const rows = [...RAW].sort((a, b) => {
    let av = a[sortCol], bv = b[sortCol];
    if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
    return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const SortIcon = ({col}) => {
    const active = sortCol === col;
    return (
      <span style={{marginLeft:5,display:'inline-flex',flexDirection:'column',gap:1,verticalAlign:'middle',opacity: active ? 1 : 0.3}}>
        <svg width="7" height="5" viewBox="0 0 7 5" fill={active && sortDir==='asc' ? '#9D5FF5' : '#71717A'}><polygon points="3.5,0 7,5 0,5"/></svg>
        <svg width="7" height="5" viewBox="0 0 7 5" fill={active && sortDir==='desc' ? '#9D5FF5' : '#71717A'}><polygon points="3.5,5 7,0 0,0"/></svg>
      </span>
    );
  };

  const thStyle = (col) => ({
    padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700,
    color: sortCol===col ? '#C4B5FD' : '#52525B',
    textTransform:'uppercase', letterSpacing:'.8px',
    cursor:'pointer', userSelect:'none', whiteSpace:'nowrap',
    transition:'color .15s',
  });

  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:700,letterSpacing:'-.5px',marginBottom:24}}>Төлбөрийн түүх</h2>
      <Card style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.02)'}}>
              <th style={{padding:'12px 12px 12px 16px',fontSize:11,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:'5%',whiteSpace:'nowrap',userSelect:'none'}}>№</th>
              <th style={{...thStyle('ref'),width:'22%'}} onClick={()=>handleSort('ref')}>Лавлах дугаар<SortIcon col="ref"/></th>
              <th style={{...thStyle('pkg'),width:'15%'}} onClick={()=>handleSort('cr')}>Багц<SortIcon col="cr"/></th>
              <th style={{...thStyle('amt'),width:'15%'}} onClick={()=>handleSort('amt')}>Дүн<SortIcon col="amt"/></th>
              <th style={{...thStyle('date'),width:'15%'}} onClick={()=>handleSort('date')}>Огноо<SortIcon col="date"/></th>
              <th style={{...thStyle('status'),width:'16%'}} onClick={()=>handleSort('status')}>Төлөв<SortIcon col="status"/></th>
              <th style={{width:'12%'}}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>{
              const s = sc[r.status];
              return (
                <tr key={i}
                  style={{borderBottom:i<rows.length-1?'1px solid rgba(255,255,255,.05)':'none',transition:'background .12s'}}
                  onMouseOver={e=>e.currentTarget.style.background='var(--glass)'}
                  onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'13px 12px 13px 16px',fontSize:12,fontWeight:600,color:'#3F3F46'}}>{i+1}</td>
                  <td style={{padding:'13px 16px',fontSize:12,color:'#71717A',fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.ref}</td>
                  <td style={{padding:'13px 16px',fontSize:13,fontWeight:500,color:'#E4E4E7'}}>{r.pkg}</td>
                  <td style={{padding:'13px 16px',fontSize:13,fontWeight:700,color:'#E4E4E7'}}>{r.amt.toLocaleString()}₮</td>
                  <td style={{padding:'13px 16px',fontSize:13,color:'#71717A'}}>{r.date}</td>
                  <td style={{padding:'13px 16px'}}>
                    <span style={{display:'inline-flex',alignItems:'center',gap:6,background:s.bg,border:`1px solid ${s.bdr}`,borderRadius:100,padding:'4px 10px',fontSize:12,fontWeight:600,color:s.txt,whiteSpace:'nowrap'}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:s.dot,flexShrink:0,boxShadow:`0 0 5px ${s.dot}`}}></span>
                      {s.l}
                    </span>
                  </td>
                  <td style={{padding:'13px 16px'}}>
                    <button style={{display:'inline-flex',alignItems:'center',gap:5,background:'rgba(157,95,245,.1)',border:'1px solid rgba(157,95,245,.2)',color:'#9D5FF5',borderRadius:7,padding:'5px 10px',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit',transition:'all .15s'}}
                      onMouseOver={e=>{e.currentTarget.style.background='rgba(157,95,245,.2)';e.currentTarget.style.borderColor='rgba(157,95,245,.4)'}}
                      onMouseOut={e=>{e.currentTarget.style.background='rgba(157,95,245,.1)';e.currentTarget.style.borderColor='rgba(157,95,245,.2)'}}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 21h14"/></svg>
                      PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ── TRANSACTIONS ────────────────────────────────────────── */
function TransactionsPage() {
  const RAW_TXNS=[
    {type:'purchase',       desc:'50 credit багц авалт',          crNum:50,  cr:'+50', date:'2024-06-04 10:22', ref:'BON-0012'},
    {type:'generation_spend',desc:'Профайл зураг үүсгэх',         crNum:-2,  cr:'-2',  date:'2024-06-04 09:15', ref:'GEN-4421'},
    {type:'creator_reward', desc:'Монгол хот зираг ашиглалт',     crNum:1,   cr:'+1',  date:'2024-06-03 18:40', ref:'CRW-0089'},
    {type:'generation_spend',desc:'Бизнес баннер үүсгэх',         crNum:-1,  cr:'-1',  date:'2024-06-03 14:20', ref:'GEN-4398'},
    {type:'generation_refund',desc:'Генерац буцаалт (алдаа)',      crNum:1,   cr:'+1',  date:'2024-06-02 22:10', ref:'REF-0023'},
    {type:'preset_create_fee',desc:'Preset үүсгэх хураамж',       crNum:-10, cr:'-10', date:'2024-06-01 15:00', ref:'FEE-0012'},
    {type:'purchase',       desc:'25 credit багц авалт',          crNum:25,  cr:'+25', date:'2024-05-20 11:00', ref:'BON-0009'},
    {type:'generation_spend',desc:'Instagram пост үүсгэх',        crNum:-1,  cr:'-1',  date:'2024-05-19 16:30', ref:'GEN-4302'},
  ];
  const typeMap={
    purchase:         {ic:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M7 11l5 5 5-5"/></svg>,        label:'Авалт',       color:'#4ADE80', bg:'rgba(74,222,128,.1)',  bdr:'rgba(74,222,128,.2)'},
    generation_spend: {ic:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21V8M7 13l5-5 5 5"/></svg>,         label:'Генерац',     color:'#F87171', bg:'rgba(239,68,68,.1)',   bdr:'rgba(239,68,68,.2)'},
    creator_reward:   {ic:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9"/></svg>, label:'Reward', color:'#FBBF24', bg:'rgba(251,191,36,.1)', bdr:'rgba(251,191,36,.2)'},
    generation_refund:{ic:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>, label:'Буцаалт', color:'#38BDF8', bg:'rgba(56,189,248,.1)', bdr:'rgba(56,189,248,.2)'},
    preset_create_fee:{ic:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>, label:'Хураамж', color:'#A78BFA', bg:'rgba(167,139,250,.1)', bdr:'rgba(167,139,250,.2)'},
  };

  const [filter, setFilter] = useState('all');
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  function handleSort(col) {
    if (sortCol===col) setSortDir(d=>d==='asc'?'desc':'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }

  const SortIcon = ({col}) => {
    const active = sortCol===col;
    return (
      <span style={{marginLeft:5,display:'inline-flex',flexDirection:'column',gap:1,verticalAlign:'middle',opacity:active?1:0.3}}>
        <svg width="7" height="5" viewBox="0 0 7 5" fill={active&&sortDir==='asc'?'#9D5FF5':'#71717A'}><polygon points="3.5,0 7,5 0,5"/></svg>
        <svg width="7" height="5" viewBox="0 0 7 5" fill={active&&sortDir==='desc'?'#9D5FF5':'#71717A'}><polygon points="3.5,5 7,0 0,0"/></svg>
      </span>
    );
  };

  const thStyle = col => ({
    padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700,
    color:sortCol===col?'#C4B5FD':'#52525B', textTransform:'uppercase',
    letterSpacing:'.8px', cursor:'pointer', userSelect:'none',
    whiteSpace:'nowrap', transition:'color .15s', fontFamily:"'Roboto',sans-serif",
  });

  const filtered = filter==='all' ? RAW_TXNS
    : RAW_TXNS.filter(t => (filter==='in' && t.crNum>0)||(filter==='out' && t.crNum<0));

  const rows = [...filtered].sort((a,b)=>{
    let av=a[sortCol], bv=b[sortCol];
    if(typeof av==='string') { av=av.toLowerCase(); bv=bv.toLowerCase(); }
    return sortDir==='asc'?(av>bv?1:-1):(av<bv?1:-1);
  });

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <h2 style={{fontSize:20,fontWeight:700,letterSpacing:'-.5px'}}>Гүйлгээний дэвтэр</h2>
        <div style={{display:'flex',gap:8}}>
          {['all','in','out'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'7px 14px',borderRadius:100,border:`1px solid ${filter===f?'rgba(124,58,237,.4)':'rgba(255,255,255,.07)'}`,background:filter===f?'rgba(124,58,237,.12)':'transparent',color:filter===f?'#C4B5FD':'#A1A1AA',fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>
              {f==='all'?'Бүгд':f==='in'?'Орлого (+)':'Зарлага (-)'}
            </button>
          ))}
        </div>
      </div>
      <Card style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed',fontFamily:"'Roboto',sans-serif"}}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.02)'}}>
              <th style={{padding:'12px 12px 12px 16px',fontSize:11,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:'5%',userSelect:'none'}}>№</th>
              <th style={{...thStyle('desc'),width:'38%'}} onClick={()=>handleSort('desc')}>Тайлбар<SortIcon col="desc"/></th>
              <th style={{...thStyle('date'),width:'20%'}} onClick={()=>handleSort('date')}>Огноо<SortIcon col="date"/></th>
              <th style={{...thStyle('ref'),width:'18%'}} onClick={()=>handleSort('ref')}>Лавлах<SortIcon col="ref"/></th>
              <th style={{...thStyle('crNum'),width:'14%',textAlign:'right'}} onClick={()=>handleSort('crNum')}>Credit<SortIcon col="crNum"/></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t,i)=>{
              const tm = typeMap[t.type]||{ic:'•',label:'Бусад',color:'#A1A1AA',bg:'rgba(255,255,255,.06)',bdr:'rgba(255,255,255,.1)'};
              return (
                <tr key={i} style={{borderBottom:i<rows.length-1?'1px solid rgba(255,255,255,.04)':'none',transition:'background .12s'}}
                  onMouseOver={e=>e.currentTarget.style.background='var(--glass)'}
                  onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'13px 12px 13px 16px',fontSize:12,fontWeight:600,color:'#3F3F46'}}>{i+1}</td>
                  <td style={{padding:'13px 16px',fontSize:13,fontWeight:400,color:'#E4E4E7',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {t.desc}
                  </td>
                  <td style={{padding:'13px 16px',fontSize:12,color:'#71717A'}}>{t.date}</td>
                  <td style={{padding:'13px 16px',fontSize:12,color:'#52525B',fontFamily:'monospace'}}>{t.ref}</td>
                  <td style={{padding:'13px 16px',textAlign:'right',fontSize:14,fontWeight:700,color:t.crNum>0?'#4ADE80':'#F87171'}}>{t.cr} cr</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ── AVATAR MODAL ────────────────────────────────────────── */
function AvatarModal({ onClose, onConfirm }) {
  const [preview, setPreview] = useState(null);
  const [drag, setDrag] = useState(false);
  const inputRef = React.useRef(null);

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);
  }

  function onDrop(e) {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:24}}
      onClick={onClose}>
      <div style={{background:'#12121C',border:'1px solid rgba(255,255,255,.1)',borderRadius:20,width:'100%',maxWidth:420,padding:28,boxShadow:'0 32px 80px rgba(0,0,0,.7)'}}
        onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
          <div style={{fontSize:16,fontWeight:700}}>Профайл зураг сонгох</div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',color:'#71717A',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,lineHeight:1,fontFamily:'inherit'}}>✕</button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e=>{e.preventDefault();setDrag(true)}}
          onDragLeave={()=>setDrag(false)}
          onDrop={onDrop}
          onClick={()=>inputRef.current.click()}
          style={{
            border:`2px dashed ${drag?'rgba(124,58,237,.7)':preview?'rgba(74,222,128,.4)':'rgba(255,255,255,.12)'}`,
            borderRadius:14, height:180, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', cursor:'pointer',
            background: drag?'rgba(124,58,237,.06)': preview?'transparent':'rgba(255,255,255,.02)',
            transition:'all .2s', position:'relative', overflow:'hidden', marginBottom:18,
          }}>
          <input ref={inputRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])} />
          {preview ? (
            <img src={preview} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:12}} alt="preview" />
          ) : (
            <>
              <div style={{width:48,height:48,borderRadius:14,background:'rgba(124,58,237,.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9D5FF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
              <div style={{fontSize:14,fontWeight:600,color:'#E4E4E7',marginBottom:5}}>Зураг чирж оруулах</div>
              <div style={{fontSize:12,color:'#52525B'}}>эсвэл дарж файл сонгох</div>
              <div style={{fontSize:11,color:'#3F3F46',marginTop:6}}>PNG, JPG, WEBP — 5MB хүртэл</div>
            </>
          )}
        </div>

        {/* Preview info */}
        {preview && (
          <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'rgba(74,222,128,.06)',border:'1px solid rgba(74,222,128,.2)',borderRadius:10,marginBottom:18}}>
            <img src={preview} style={{width:40,height:40,borderRadius:'50%',objectFit:'cover',flexShrink:0}} alt="" />
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:'#4ADE80',marginBottom:2}}>Зураг бэлэн боллоо</div>
              <div style={{fontSize:11,color:'#52525B'}}>Хадгалахын тулд доорх товчийг дарна уу</div>
            </div>
            <button onClick={()=>setPreview(null)} style={{background:'none',border:'none',color:'#52525B',cursor:'pointer',fontSize:16,fontFamily:'inherit'}}>✕</button>
          </div>
        )}

        {/* Actions */}
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'#A1A1AA',borderRadius:10,padding:'11px',cursor:'pointer',fontSize:14,fontFamily:'inherit'}}>Цуцлах</button>
          <button onClick={()=>{onConfirm(preview);onClose();}} disabled={!preview}
            style={{flex:2,background:preview?'linear-gradient(135deg,#7C3AED,#6D28D9)':'rgba(255,255,255,.05)',border:'none',color:preview?'#fff':'#52525B',borderRadius:10,padding:'11px',cursor:preview?'pointer':'not-allowed',fontSize:14,fontWeight:600,fontFamily:'inherit',boxShadow:preview?'0 0 16px rgba(124,58,237,.3)':'none',transition:'all .2s'}}>
            Хадгалах
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── SETTINGS ────────────────────────────────────────────── */
function SettingsPage() {
  const [completion]=useState(40);
  const [tab,setTab]=useState('profile');
  const [avatarModal,setAvatarModal]=useState(false);
  const [avatar,setAvatar]=useState(null);
  const [agree,setAgree]=useState(false);

  function AgreeCheck() {
    return <CustomCheckbox checked={agree} onChange={setAgree} label="Creator-ийн нөхцлийг зөвшөөрч байна" description="Preset үүсгэж reward авахын тулд зөвшөөрөх шаардлагатай" />;
  }
  const fields=[{k:'name',l:'Бүтэн нэр',v:'Батбаяр',done:true},{k:'email',l:'Имэйл',v:'batbayar@email.mn',done:true},{k:'phone',l:'Утасны дугаар',v:'',done:false},{k:'bio',l:'Товч намтар',v:'',done:false},{k:'creator_name',l:'Creator дисплей нэр',v:'',done:false},{k:'agree',l:'Зөвшөөрлийн нөхцөл',v:'',done:false}];
  const doneCnt=fields.filter(f=>f.done).length;
  return (
    <div style={{maxWidth:680,margin:'0 auto'}}>
      <div style={{display:'flex',gap:8,marginBottom:24}}>
        {['profile','account','security'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 18px',borderRadius:100,border:`1px solid ${tab===t?'rgba(124,58,237,.4)':'rgba(255,255,255,.07)'}`,background:tab===t?'rgba(124,58,237,.12)':'transparent',color:tab===t?'#C4B5FD':'#A1A1AA',fontSize:13,cursor:'pointer',fontFamily:'inherit',fontWeight:tab===t?600:400}}>
            {t==='profile'?'Профайл':t==='account'?'Бүртгэл':'Аюулгүй байдал'}
          </button>
        ))}
      </div>
      {tab==='profile' && <>
        {/* Completion */}
        <Card style={{marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div>
              <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>Профайлын бүрэн байдал</div>
              <div style={{fontSize:13,color:'#A1A1AA'}}>{doneCnt}/{fields.length} талбар бөглөгдсэн</div>
            </div>
            <div style={{fontSize:28,fontWeight:900,color:completion>=100?'#4ADE80':'#9D5FF5'}}>{completion}%</div>
          </div>
          <div style={{height:6,background:'rgba(255,255,255,.07)',borderRadius:100,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${completion}%`,background:'linear-gradient(90deg,#7C3AED,#9D5FF5)',borderRadius:100,transition:'width .5s'}}></div>
          </div>
          {completion<100 && <div style={{marginTop:12,padding:'10px 14px',background:'rgba(124,58,237,.08)',border:'1px solid rgba(124,58,237,.2)',borderRadius:8,fontSize:13,color:'#9D5FF5'}}>Бүрэн бөглөсний дараа preset үүсгэх эрх нээгдэнэ</div>}
        </Card>
        {/* Avatar */}
        <Card style={{marginBottom:16,display:'flex',alignItems:'center',gap:16}}>
          {avatar
            ? <img src={avatar} style={{width:64,height:64,borderRadius:'50%',objectFit:'cover',flexShrink:0,border:'2px solid rgba(124,58,237,.4)'}} alt="avatar" />
            : <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#38BDF8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:700,flexShrink:0}}>Б</div>
          }
          <div>
            <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>Профайл зураг</div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setAvatarModal(true)} style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(124,58,237,.12)',border:'1px solid rgba(124,58,237,.25)',color:'#C4B5FD',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:13,fontFamily:'inherit',transition:'all .15s'}}
                onMouseOver={e=>{e.currentTarget.style.background='rgba(124,58,237,.22)'}}
                onMouseOut={e=>{e.currentTarget.style.background='rgba(124,58,237,.12)'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                Зураг сонгох
              </button>
              {avatar && <button onClick={()=>setAvatar(null)} style={{background:'none',border:'1px solid rgba(239,68,68,.2)',color:'#EF4444',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>Устгах</button>}
            </div>
          </div>
        </Card>
        {avatarModal && <AvatarModal onClose={()=>setAvatarModal(false)} onConfirm={setAvatar} />}
        {/* Fields */}
        <Card>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {fields.map(f=>(
              <div key={f.k}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7}}>
                  <label style={{fontSize:13,fontWeight:500,color:'#A1A1AA',display:'flex',alignItems:'center',gap:3}}>{f.l}{!f.done&&<span style={{color:'#EF4444',fontSize:16,lineHeight:1,fontWeight:700,marginTop:1}}>*</span>}</label>
                  {f.done&&<span style={{fontSize:11,color:'#4ADE80'}}>✓</span>}
                </div>
                {f.k==='bio'?<textarea placeholder="Өөрийнхөө тухай товч бичнэ..." rows={3} style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'10px 14px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit',resize:'vertical'}} defaultValue={f.v}/>:f.k==='agree'?<AgreeCheck/>:<input defaultValue={f.v} placeholder={`${f.l} оруулах...`} style={{width:'100%',background:'rgba(255,255,255,.04)',border:`1px solid ${f.done?'rgba(74,222,128,.2)':'rgba(255,255,255,.08)'}`,borderRadius:8,padding:'10px 14px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit'}} />}
              </div>
            ))}
            <button style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'#fff',border:'none',borderRadius:10,padding:'12px',cursor:'pointer',fontSize:14,fontWeight:600,fontFamily:'inherit',marginTop:6,boxShadow:'0 0 16px rgba(124,58,237,.3)'}}>Хадгалах</button>
          </div>
        </Card>
      </>}
      {tab==='account' && <Card><p style={{color:'#A1A1AA',fontSize:14}}>Бүртгэлийн тохиргоо: имэйл хаяг солих, бүртгэл устгах...</p></Card>}
      {tab==='security' && <Card><p style={{color:'#A1A1AA',fontSize:14}}>Нууц үг солих, 2FA тохиргоо...</p></Card>}
    </div>
  );
}

/* ── HELP ────────────────────────────────────────────────── */
function HelpPage() {
  const [open,setOpen]=useState(null);
  const faqs=[['Credit яаж ажилладаг вэ?','1 credit = 990₮. Та credit-ийг Credit авах хэсгээс онлайнаар авна. Credit нь хугацаагүй.'],['Preset яаж ашиглах вэ?','Presets хэсгийг нь орж хүссэн preset-ийг сонго. Тохиргоо хийж Generate дараад зураг үүснэ.'],['Creator reward гэж юу вэ?','Та preset үүсгэж нийтэлснийхээ дараа бусад хэрэглэгч ашиглах бүрд +1 credit авна.'],['Алдаа гарвал credit буцдаг уу?','Тийм. Техникийн алдааны улмаас генерац бүтэлгүйтвэл credit автоматаар буцаагдна.'],['Төлбөрийн систем юу вэ?','Дотоодын банкны карт болон QR-аар аюулгүй онлайн төлбөр хийх боломжтой.']];
  const contacts=[{ic:'@',t:'Имэйл',v:'support@creato.mn'},{ic:'☎',t:'Утас',v:'+976 8888-0000'},{ic:'f',t:'Facebook',v:'fb.com/creato'}];
  return (
    <div style={{maxWidth:720,margin:'0 auto'}}>
      <div style={{textAlign:'center',marginBottom:36}}>
        <div style={{fontSize:28,marginBottom:12,color:'#9D5FF5'}}>?</div>
        <h2 style={{fontSize:24,fontWeight:800,letterSpacing:'-1px',marginBottom:8}}>Тусламжийн төв</h2>
        <p style={{fontSize:14,color:'#A1A1AA'}}>Түгээмэл асуулт болон холбоо барих мэдээлэл</p>
      </div>
      <div style={{display:'flex',gap:14,marginBottom:32,flexWrap:'wrap'}}>
        {[['◇','Credit','Яаж авах, яаж зарцуулах'],['◧','Presets','Яаж ашиглах, яаж үүсгэх'],['◈','Төлбөр','Хэрхэн ажилладаг'],['★','Creator','Reward систем']].map(([ic,t,d],i)=>(
          <div key={i} style={{flex:'1 1 160px',background:'#12121C',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:16,cursor:'pointer',transition:'border-color .2s'}}
            onMouseOver={e=>e.currentTarget.style.borderColor='rgba(124,58,237,.25)'}
            onMouseOut={e=>e.currentTarget.style.borderColor='rgba(255,255,255,.07)'}>
            <div style={{fontSize:24,marginBottom:8}}>{ic}</div>
            <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{t}</div>
            <div style={{fontSize:12,color:'#52525B'}}>{d}</div>
          </div>
        ))}
      </div>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Түгээмэл асуулт</h3>
      <div style={{marginBottom:32}}>
        {faqs.map(([q,a],i)=>(
          <div key={i} style={{borderBottom:'1px solid rgba(255,255,255,.06)'}}>
            <button onClick={()=>setOpen(open===i?null:i)} style={{width:'100%',background:'none',border:'none',color:'#fff',fontFamily:'inherit',fontSize:14,fontWeight:500,padding:'16px 0',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',gap:16,textAlign:'left'}}>
              {q}<span style={{color:'#52525B',fontSize:18,transform:open===i?'rotate(45deg)':'none',transition:'transform .25s',flexShrink:0}}>+</span>
            </button>
            {open===i && <p style={{fontSize:13,color:'#A1A1AA',lineHeight:1.7,paddingBottom:16}}>{a}</p>}
          </div>
        ))}
      </div>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:14}}>Холбоо барих</h3>
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        {contacts.map((c,i)=>(
          <div key={i} style={{flex:'1 1 180px',background:'#12121C',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:16,display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:18,flexShrink:0,color:'#9D5FF5'}}>{c.ic}</span>
            <div><div style={{fontSize:13,fontWeight:600,marginBottom:3}}>{c.t}</div><div style={{fontSize:12,color:'#9D5FF5'}}>{c.v}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── COMPANY ─────────────────────────────────────────────── */
function CompanyPage({nav}) {
  return (
    <div style={{maxWidth:640,margin:'0 auto'}}>
      <div style={{background:'linear-gradient(135deg,rgba(124,58,237,.12),rgba(56,189,248,.06))',border:'1px solid rgba(124,58,237,.2)',borderRadius:20,padding:32,textAlign:'center',marginBottom:24}}>
        <div style={{fontSize:28,marginBottom:12,color:'#9D5FF5'}}>⊞</div>
        <h2 style={{fontSize:24,fontWeight:800,letterSpacing:'-1px',marginBottom:8}}>Байгууллагын тусгай багц</h2>
        <p style={{fontSize:14,color:'#A1A1AA',lineHeight:1.7}}>Олон ажилтан, их хэмжээний генерац хэрэгтэй байна уу? Тусгай тариф, invoice-тай тооцоо боломжтой.</p>
      </div>
      <Card>
        <h3 style={{fontSize:15,fontWeight:700,marginBottom:20}}>Хүсэлт илгээх</h3>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {[['Байгууллагын нэр','Creato Solutions LLC'],['Холбогч хүний нэр',''],['Утасны дугаар',''],['Имэйл хаяг',''],['Сарын тооцоолсон credit хэрэглээ','Жишээ: 1000 credit/сар'],['Бизнесийн чиглэл',''],].map(([l,ph],i)=>(
            <div key={i}><label style={{display:'block',fontSize:13,fontWeight:500,color:'#A1A1AA',marginBottom:7}}>{l} <span style={{color:'#EF4444',fontSize:15,fontWeight:700}}>*</span></label><input placeholder={ph} style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'10px 14px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit'}} /></div>
          ))}
          <div><label style={{display:'block',fontSize:13,fontWeight:500,color:'#A1A1AA',marginBottom:7}}>Нэмэлт мэдэгдэл</label><textarea rows={3} placeholder="Тусгай хүсэлт, асуулт..." style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'10px 14px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit',resize:'vertical'}} /></div>
          <button style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'#fff',border:'none',borderRadius:10,padding:'13px',cursor:'pointer',fontSize:15,fontWeight:600,fontFamily:'inherit',boxShadow:'0 0 18px rgba(124,58,237,.3)'}}>Байгууллагын багц авах →</button>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { MyImagesPage, MyPresetsPage, CreatePresetPage, CreditsPage, BillingPage, TransactionsPage, SettingsPage, HelpPage, CompanyPage });
