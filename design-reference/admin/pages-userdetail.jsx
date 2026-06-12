// admin/pages-userdetail.jsx — User Detail with Credit Balance, Adjustment Modal, History, Audit Log
const { useState: _udSt } = React;

function AdminUserDetailPage({nav}){
  const u={name:'Батбаяр Д.',email:'batbayar@email.mn',phone:'+976 8888-1234',cr:24,reserved:2,totalPurchased:150,totalUsed:124,totalRefunded:5,lifetimeRevenue:148500,profile:40,joined:'2024-04-10',genCount:138,presetsCreated:2,rewardsEarned:12};
  const [blockModal,setBlockModal]=_udSt(false);
  const [blocked,setBlocked]=_udSt(false);
  const [adjModal,setAdjModal]=_udSt(false);
  const [adjType,setAdjType]=_udSt('');
  const [adjAmount,setAdjAmount]=_udSt('');
  const [adjReason,setAdjReason]=_udSt('');
  const [adjNote,setAdjNote]=_udSt('');
  const [adjAccNote,setAdjAccNote]=_udSt('');
  const [adjConfirm,setAdjConfirm]=_udSt(false);
  const [adjSubmitted,setAdjSubmitted]=_udSt(false);
  const [adjGenRef,setAdjGenRef]=_udSt('');
  const [adjPayRef,setAdjPayRef]=_udSt('');
  const [hSC,setHSC]=_udSt('date');
  const [hSD,setHSD]=_udSt('desc');

  const adjTypeOpts=[
    {value:'refund',label:'Refund credit'},
    {value:'compensation',label:'Compensation credit'},
    {value:'manual_topup',label:'Manual top-up'},
    {value:'bonus',label:'Bonus credit'},
    {value:'correction',label:'Correction'},
    {value:'failed_gen',label:'Failed generation reimbursement'},
    {value:'other',label:'Other'},
  ];
  const adjReasonOpts=[
    {value:'ai_failed',label:'AI output failed'},
    {value:'poor_quality',label:'Poor quality output'},
    {value:'duplicate',label:'Duplicate charge'},
    {value:'manual_payment',label:'Payment confirmed manually'},
    {value:'support',label:'Customer support decision'},
    {value:'promo',label:'Promotion/bonus'},
    {value:'accounting',label:'Accounting correction'},
    {value:'other',label:'Other'},
  ];

  const creditHistory=[
    {date:'2026-06-04 10:22',type:'purchase',label:'Credit авалт',amount:'+50',prev:0,next:50,genRef:'—',payRef:'PAY-0032',reason:'Bought 50cr package',admin:'—',note:'QPay баталгаа',status:'completed'},
    {date:'2026-06-04 09:15',type:'gen_spend',label:'Генерац зарцуулсан',amount:'-2',prev:50,next:48,genRef:'GEN-4421',payRef:'—',reason:'Профайл зураг генерац',admin:'—',note:'',status:'completed'},
    {date:'2026-06-03 18:40',type:'reward',label:'Creator reward',amount:'+1',prev:48,next:49,genRef:'GEN-4350',payRef:'—',reason:'Монгол урлаг preset ашиглалт',admin:'—',note:'',status:'completed'},
    {date:'2026-06-02 11:00',type:'adj',label:'Admin тохируулга',amount:'+3',prev:21,next:24,genRef:'GEN-4300',payRef:'—',reason:'Failed generation reimbursement',admin:'А.Менежер',note:'Генерац алдаа 3 удаа давтагдсан',status:'completed'},
    {date:'2026-05-20 11:00',type:'purchase',label:'Credit авалт',amount:'+25',prev:0,next:25,genRef:'—',payRef:'PAY-0021',reason:'Bought 25cr package',admin:'—',note:'',status:'completed'},
    {date:'2026-05-15 09:00',type:'fee',label:'Preset fee',amount:'-10',prev:25,next:15,genRef:'—',payRef:'—',reason:'Preset үүсгэх төлбөр',admin:'—',note:'',status:'completed'},
  ];

  function hOS(col){if(hSC===col)setHSD(d=>d==='asc'?'desc':'asc');else{setHSC(col);setHSD('asc');}}
  const sortedHistory=[...creditHistory].sort((a,b)=>{let av=a[hSC]||'',bv=b[hSC]||'';if(typeof av==='string'){av=av.toLowerCase();bv=bv.toLowerCase();}return hSD==='asc'?(av>bv?1:-1):(av<bv?1:-1);});
  const hsp={sortCol:hSC,sortDir:hSD,onSort:hOS};

  function HTH({children,col,w,align}){
    const active=col&&hsp.sortCol===col;
    return <th onClick={col?()=>hsp.onSort(col):undefined} style={{padding:'9px 12px',textAlign:align||'left',fontSize:10,fontWeight:700,color:active?'#C4B5FD':'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:w,cursor:col?'pointer':'default',userSelect:'none',whiteSpace:'nowrap',transition:'color .15s'}}>
      {children}{col&&<span style={{marginLeft:3,display:'inline-flex',flexDirection:'column',gap:1,verticalAlign:'middle',opacity:active?1:0.3}}>
        <svg width="6" height="4" viewBox="0 0 7 5" fill={active&&hsp.sortDir==='asc'?'#9D5FF5':'#71717A'}><polygon points="3.5,0 7,5 0,5"/></svg>
        <svg width="6" height="4" viewBox="0 0 7 5" fill={active&&hsp.sortDir==='desc'?'#9D5FF5':'#71717A'}><polygon points="3.5,5 7,0 0,0"/></svg>
      </span>}
    </th>;
  }

  const auditLog=[
    {date:'2026-06-02 11:00',action:'Credit тохируулга',detail:'+3 credit — Failed generation reimbursement',admin:'А.Менежер',type:'adj'},
    {date:'2026-05-28 15:30',action:'Хэрэглэгч блоклох',detail:'Spam гомдол — 48ц блок',admin:'А.Менежер',type:'block'},
    {date:'2026-05-28 18:00',action:'Блок арилгах',detail:'Хугацаа дуусгавар',admin:'System',type:'unblock'},
    {date:'2026-04-10 14:00',action:'Бүртгүүлсэн',detail:'Шинэ хэрэглэгч',admin:'System',type:'register'},
  ];
  const atc={adj:'#FBBF24',block:'#EF4444',unblock:'#4ADE80',register:'#38BDF8'};
  const tc={purchase:'#4ADE80',gen_spend:'#38BDF8',reward:'#9D5FF5',fee:'#FBBF24',adj:'#FBBF24'};
  const canSubmit=adjType&&adjAmount&&adjReason&&adjNote.trim().length>0&&adjConfirm;

  function submitAdj(){
    if(!canSubmit)return;
    setAdjSubmitted(true);
    setTimeout(()=>{setAdjModal(false);setAdjSubmitted(false);setAdjType('');setAdjAmount('');setAdjReason('');setAdjNote('');setAdjAccNote('');setAdjConfirm(false);setAdjGenRef('');setAdjPayRef('');},1400);
  }

  const inputStyle={width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'9px 12px',color:'#E4E4E7',fontSize:13,outline:'none',fontFamily:'inherit'};
  const labelStyle={display:'block',fontSize:12,color:'#52525B',fontWeight:600,marginBottom:7};

  return (
    <div style={{maxWidth:920,margin:'0 auto'}}>

      {/* ── Block Modal ── */}
      {blockModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:24}} onClick={()=>setBlockModal(false)}>
          <div style={{background:'#12121C',border:'1px solid rgba(239,68,68,.25)',borderRadius:18,width:'100%',maxWidth:380,padding:28,boxShadow:'0 32px 80px rgba(0,0,0,.7)'}} onClick={e=>e.stopPropagation()}>
            <div style={{width:48,height:48,borderRadius:14,background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </div>
            <div style={{fontSize:16,fontWeight:700,textAlign:'center',marginBottom:8}}>Хэрэглэгч блоклох уу?</div>
            <div style={{fontSize:13,color:'#71717A',textAlign:'center',marginBottom:24,lineHeight:1.6}}><strong style={{color:'#E4E4E7'}}>{u.name}</strong> хэрэглэгч системд нэвтрэх боломжгүй болно.</div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setBlockModal(false)} style={{flex:1,padding:'10px',borderRadius:9,border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.04)',color:'#A1A1AA',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Болих</button>
              <button onClick={()=>{setBlocked(true);setBlockModal(false);}} style={{flex:1,padding:'10px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#DC2626,#B91C1C)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 16px rgba(239,68,68,.3)'}}>Блоклох</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Credit Adjustment Modal ── */}
      {adjModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.82)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:16}} onClick={()=>setAdjModal(false)}>
          <div style={{background:'#12121C',border:'1px solid rgba(251,191,36,.18)',borderRadius:20,width:'100%',maxWidth:540,maxHeight:'94vh',overflowY:'auto',padding:28,boxShadow:'0 40px 100px rgba(0,0,0,.85)'}} onClick={e=>e.stopPropagation()}>
            {adjSubmitted ? (
              <div style={{textAlign:'center',padding:'32px 0'}}>
                <div style={{width:60,height:60,borderRadius:'50%',background:'rgba(74,222,128,.12)',border:'1px solid rgba(74,222,128,.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px'}}>
                  <svg width="26" height="20" viewBox="0 0 26 20" fill="none"><path d="M1 10L9 18L25 2" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{fontSize:17,fontWeight:700,color:'#4ADE80',marginBottom:8}}>Амжилттай бүртгэгдлээ</div>
                <div style={{fontSize:13,color:'#71717A'}}>Credit тохируулга audit log-т хадгалагдлаа.</div>
              </div>
            ) : (
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:38,height:38,borderRadius:10,background:'rgba(251,191,36,.1)',border:'1px solid rgba(251,191,36,.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700}}>Credit тохируулах</div>
                      <div style={{fontSize:11,color:'#71717A'}}>Санхүүгийн тайланд бүртгэгдэнэ · Буцаах боломжгүй</div>
                    </div>
                  </div>
                  <button onClick={()=>setAdjModal(false)} style={{width:30,height:30,borderRadius:7,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'#52525B',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit',fontSize:15}}>✕</button>
                </div>

                {/* Target user info */}
                <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:10,padding:'10px 14px',marginBottom:20,display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#38BDF8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,flexShrink:0}}>Б</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:'#E4E4E7'}}>{u.name}</div>
                    <div style={{fontSize:11,color:'#52525B'}}>Одоогийн үлдэгдэл: <strong style={{color:'#C4B5FD'}}>{u.cr} credit</strong></div>
                  </div>
                  <APill color='amber'>Санхүүгийн үйлдэл</APill>
                </div>

                <div style={{display:'flex',flexDirection:'column',gap:15}}>
                  <div>
                    <label style={labelStyle}>Тохируулгын төрөл <span style={{color:'#EF4444'}}>*</span></label>
                    <AdminSelect value={adjType} onChange={setAdjType} options={adjTypeOpts} placeholder="Төрөл сонгох..."/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div>
                      <label style={labelStyle}>Credit дүн <span style={{color:'#EF4444'}}>*</span></label>
                      <input type="number" min="1" value={adjAmount} onChange={e=>setAdjAmount(e.target.value)} placeholder="0" style={{...inputStyle,fontSize:17,fontWeight:700,textAlign:'center'}}/>
                    </div>
                    <div>
                      <label style={labelStyle}>Шалтгаан <span style={{color:'#EF4444'}}>*</span></label>
                      <AdminSelect value={adjReason} onChange={setAdjReason} options={adjReasonOpts} placeholder="Шалтгаан сонгох..."/>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div>
                      <label style={labelStyle}>Холбоотой генерац <span style={{color:'#3F3F46',fontWeight:400}}>(заавал биш)</span></label>
                      <input value={adjGenRef} onChange={e=>setAdjGenRef(e.target.value)} placeholder="GEN-XXXX" style={inputStyle}/>
                    </div>
                    <div>
                      <label style={labelStyle}>Холбоотой төлбөр <span style={{color:'#3F3F46',fontWeight:400}}>(заавал биш)</span></label>
                      <input value={adjPayRef} onChange={e=>setAdjPayRef(e.target.value)} placeholder="PAY-XXXX" style={inputStyle}/>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Admin тайлбар <span style={{color:'#EF4444'}}>*</span></label>
                    <textarea value={adjNote} onChange={e=>setAdjNote(e.target.value)} placeholder="Тохируулгын дэлгэрэнгүй тайлбар..." rows={3} style={{...inputStyle,resize:'vertical'}}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Санхүүгийн тэмдэглэл <span style={{color:'#3F3F46',fontWeight:400}}>(дотоод)</span></label>
                    <textarea value={adjAccNote} onChange={e=>setAdjAccNote(e.target.value)} placeholder="Нягтлан бодогч тэмдэглэл..." rows={2} style={{...inputStyle,resize:'vertical'}}/>
                  </div>

                  {/* Confirm checkbox */}
                  <div onClick={()=>setAdjConfirm(v=>!v)} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'12px 14px',background:adjConfirm?'rgba(251,191,36,.06)':'rgba(255,255,255,.02)',border:'1px solid '+(adjConfirm?'rgba(251,191,36,.25)':'rgba(255,255,255,.07)'),borderRadius:10,cursor:'pointer',userSelect:'none',transition:'all .18s'}}>
                    <div style={{width:18,height:18,borderRadius:5,border:'2px solid '+(adjConfirm?'#FBBF24':'rgba(255,255,255,.2)'),background:adjConfirm?'#FBBF24':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1,transition:'all .16s',boxShadow:adjConfirm?'0 0 8px rgba(251,191,36,.4)':'none'}}>
                      {adjConfirm&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div style={{fontSize:12,color:adjConfirm?'#FDE68A':'#71717A',lineHeight:1.6}}>
                      Энэ credit өөрчлөлт нь <strong style={{color:adjConfirm?'#FBBF24':'#A1A1AA'}}>санхүүгийн тайланд бүртгэгдэх</strong>ийг ойлгож байна. Энэ үйлдэл буцаах боломжгүй.
                    </div>
                  </div>

                  <button onClick={submitAdj} disabled={!canSubmit} style={{width:'100%',padding:'14px',borderRadius:10,border:'none',background:canSubmit?'linear-gradient(135deg,#D97706,#B45309)':'rgba(255,255,255,.05)',color:canSubmit?'#fff':'#3F3F46',fontSize:14,fontWeight:700,cursor:canSubmit?'pointer':'not-allowed',fontFamily:'inherit',boxShadow:canSubmit?'0 4px 20px rgba(217,119,6,.3)':'none',transition:'all .2s',letterSpacing:'-.2px'}}>
                    Credit нэмэх / тохируулах
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <SmBtn onClick={()=>nav('admin-users')}>← Буцах</SmBtn>
        <h2 style={{fontSize:16,fontWeight:700,flex:1}}>Хэрэглэгчийн дэлгэрэнгүй</h2>
        <SmBtn color='#FBBF24' bg='rgba(251,191,36,.07)' style={{borderColor:'rgba(251,191,36,.2)'}} onClick={()=>setAdjModal(true)}>
          <span style={{display:'flex',alignItems:'center',gap:6}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            Credit тохируулах
          </span>
        </SmBtn>
        {blocked
          ? <SmBtn color='#4ADE80' bg='rgba(74,222,128,.08)' style={{borderColor:'rgba(74,222,128,.2)'}} onClick={()=>setBlocked(false)}>Блок арилгах</SmBtn>
          : <SmBtn color='#EF4444' bg='rgba(239,68,68,.08)' style={{borderColor:'rgba(239,68,68,.2)'}} onClick={()=>setBlockModal(true)}>Блоклох</SmBtn>
        }
      </div>

      {/* ── Row 1: Profile / Stats / Credit Balance ── */}
      <div style={{display:'grid',gridTemplateColumns:'1.1fr 0.85fr 1.05fr',gap:12,marginBottom:12}}>
        {/* Profile */}
        <ACard>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
            <div style={{width:50,height:50,borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#38BDF8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,fontWeight:800,flexShrink:0,boxShadow:'0 0 18px rgba(124,58,237,.3)',color:'#fff'}}>Б</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                <div style={{fontSize:15,fontWeight:700}}>{u.name}</div>
                {blocked&&<APill color='red'>Блок</APill>}
              </div>
              <div style={{fontSize:11,color:'#71717A',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.email}</div>
              <div style={{fontSize:11,color:'#52525B'}}>{u.phone}</div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.05)',borderRadius:8,padding:'8px 10px'}}>
              <div style={{fontSize:10,color:'#52525B',marginBottom:3}}>Бүртгүүлсэн</div>
              <div style={{fontSize:12,fontWeight:600,color:'#E4E4E7'}}>{u.joined}</div>
            </div>
            <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.05)',borderRadius:8,padding:'8px 10px'}}>
              <div style={{fontSize:10,color:'#52525B',marginBottom:5}}>Профайл</div>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <div style={{flex:1,height:4,borderRadius:2,background:'rgba(255,255,255,.07)',overflow:'hidden'}}><div style={{height:'100%',width:u.profile+'%',background:u.profile>=100?'#4ADE80':'#9D5FF5',borderRadius:2}}></div></div>
                <span style={{fontSize:11,fontWeight:700,color:'#C4B5FD'}}>{u.profile}%</span>
              </div>
            </div>
          </div>
        </ACard>

        {/* Activity stats */}
        <ACard>
          <div style={{fontSize:11,color:'#52525B',fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:12}}>Идэвхжил</div>
          {[['Нийт генерац',u.genCount,'#38BDF8'],['Preset үүсгэсэн',u.presetsCreated,'#9D5FF5'],['Reward авсан',u.rewardsEarned,'#4ADE80']].map(([l,v,c],i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 0',borderBottom:i<2?'1px solid rgba(255,255,255,.04)':'none'}}>
              <span style={{fontSize:12,color:'#71717A'}}>{l}</span>
              <span style={{fontSize:18,fontWeight:800,color:c}}>{v}</span>
            </div>
          ))}
        </ACard>

        {/* Credit Balance */}
        <ACard style={{borderColor:'rgba(124,58,237,.2)',background:'linear-gradient(135deg,rgba(124,58,237,.07),#12121C)'}}>
          <div style={{fontSize:11,color:'#9D5FF5',fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10}}>Credit Баланс</div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:'#52525B',marginBottom:2}}>Боломжит</div>
            <div style={{fontSize:30,fontWeight:900,color:'#C4B5FD',letterSpacing:'-1.5px',lineHeight:1}}>{u.cr}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
            {[['Нийт авсан',u.totalPurchased,'#E4E4E7'],['Нийт зарцуулсан',u.totalUsed,'#71717A'],['Буцааж олгосон',u.totalRefunded,'#C4B5FD'],['Lifetime revenue',u.lifetimeRevenue.toLocaleString()+'₮','#4ADE80']].map(([l,v,c],i)=>(
              <div key={i} style={{background:'rgba(255,255,255,.03)',borderRadius:7,padding:'6px 9px'}}>
                <div style={{fontSize:9,color:'#3F3F46',marginBottom:2}}>{l}</div>
                <div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div>
              </div>
            ))}
          </div>
        </ACard>
      </div>

      {/* ── Credit Adjustment strip ── */}
      <ACard style={{marginBottom:12,padding:'12px 16px',background:'rgba(251,191,36,.04)',border:'1px solid rgba(251,191,36,.12)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'#E4E4E7'}}>Credit тохируулга — Санхүүгийн үйлдэл</div>
              <div style={{fontSize:11,color:'#71717A'}}>Буцааж авах, нөхөн төлбөр, тохируулга хийх. Бүх өөрчлөлт тайланд бүртгэгдэнэ.</div>
            </div>
          </div>
          <button onClick={()=>setAdjModal(true)} style={{padding:'9px 20px',borderRadius:9,border:'1px solid rgba(251,191,36,.3)',background:'rgba(251,191,36,.1)',color:'#FBBF24',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',transition:'all .15s'}} onMouseOver={e=>{e.currentTarget.style.background='rgba(251,191,36,.18)';}} onMouseOut={e=>{e.currentTarget.style.background='rgba(251,191,36,.1)';}}>
            Credit тохируулах
          </button>
        </div>
      </ACard>

      {/* ── Credit History Table ── */}
      <ACard style={{padding:0,overflow:'hidden',marginBottom:12}}>
        <div style={{padding:'13px 16px 11px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
          <div style={{fontSize:14,fontWeight:700}}>Credit гүйлгээний түүх</div>
          <APill color='gray'>{creditHistory.length} мөр</APill>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:860}}>
            <thead><tr style={{background:'rgba(255,255,255,.02)'}}>
              <HTH col="date" w="130">Огноо</HTH>
              <HTH col="label">Төрөл</HTH>
              <HTH col="amount" align="right">Дүн</HTH>
              <HTH col="prev" align="right">Өмнөх</HTH>
              <HTH col="next" align="right">Шинэ</HTH>
              <HTH col="genRef">Генерац</HTH>
              <HTH col="payRef">Төлбөр</HTH>
              <HTH col="reason">Шалтгаан</HTH>
              <HTH col="admin">Admin</HTH>
              <HTH col="status">Статус</HTH>
            </tr></thead>
            <tbody>{sortedHistory.map((h,i)=>{
              const amt=parseInt(h.amount);
              return (
                <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .1s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.02)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'9px 12px',fontSize:11,color:'#52525B',whiteSpace:'nowrap'}}>{h.date}</td>
                  <td style={{padding:'9px 12px'}}><div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:6,height:6,borderRadius:'50%',background:tc[h.type]||'#52525B',flexShrink:0}}></div><span style={{fontSize:12,color:'#A1A1AA'}}>{h.label}</span></div></td>
                  <td style={{padding:'9px 12px',textAlign:'right',fontSize:13,fontWeight:700,color:amt>0?'#4ADE80':'#EF4444'}}>{h.amount}</td>
                  <td style={{padding:'9px 12px',textAlign:'right',fontSize:12,color:'#52525B'}}>{h.prev}</td>
                  <td style={{padding:'9px 12px',textAlign:'right',fontSize:12,fontWeight:600,color:'#C4B5FD'}}>{h.next}</td>
                  <td style={{padding:'9px 12px',fontSize:11,color:'#52525B'}}>{h.genRef}</td>
                  <td style={{padding:'9px 12px',fontSize:11,color:'#52525B'}}>{h.payRef}</td>
                  <td style={{padding:'9px 12px',fontSize:11,color:'#71717A',maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.reason}</td>
                  <td style={{padding:'9px 12px',fontSize:11,color:h.admin==='—'?'#3F3F46':'#A1A1AA'}}>{h.admin}</td>
                  <td style={{padding:'9px 12px'}}><APill color='green'>Баталгаажсан</APill></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </ACard>

      {/* ── Audit Log ── */}
      <ACard style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'13px 16px 11px',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
          <div style={{fontSize:14,fontWeight:700}}>Admin Audit Log</div>
          <div style={{fontSize:11,color:'#52525B',marginTop:2}}>Энэ хэрэглэгчтэй холбоотой бүх admin үйлдлүүд</div>
        </div>
        {auditLog.map((a,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 16px',borderBottom:i<auditLog.length-1?'1px solid rgba(255,255,255,.03)':'none',transition:'background .1s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.015)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
            <div style={{width:30,height:30,borderRadius:8,background:(atc[a.type]||'#52525B')+'18',border:'1px solid '+(atc[a.type]||'#52525B')+'30',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:atc[a.type]||'#52525B'}}></div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:'#E4E4E7'}}>{a.action}</div>
              <div style={{fontSize:11,color:'#52525B',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.detail}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:11,color:'#A1A1AA',marginBottom:2}}>{a.admin}</div>
              <div style={{fontSize:10,color:'#3F3F46'}}>{a.date}</div>
            </div>
          </div>
        ))}
      </ACard>

    </div>
  );
}

Object.assign(window, { AdminUserDetailPage });
