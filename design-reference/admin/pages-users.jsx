// admin/pages-users.jsx — Users, UserDetail, WalletTxns, Payments, CompanyRequests, Generations, Ratings, Homepage mgmt
const { useState } = React;

/* ── USERS ────────────────────────────────────────────────── */
function AdminUsersPage({nav}){
  const RAW=[
    {id:1,name:'Батбаяр Д.',email:'batbayar@email.mn',cr:24,profile:40,paid:true,status:'active',joined:'2024-04-10'},
    {id:2,name:'Нарантуяа Г.',email:'narantuya@email.mn',cr:156,profile:100,paid:true,status:'active',joined:'2024-03-22'},
    {id:3,name:'Дорж Б.',email:'dorj@email.mn',cr:89,profile:100,paid:true,status:'active',joined:'2024-03-15'},
    {id:4,name:'Ганбаатар М.',email:'ganbaa@email.mn',cr:0,profile:60,paid:false,status:'active',joined:'2024-05-20'},
    {id:5,name:'Солонго А.',email:'solongo@email.mn',cr:5,profile:20,paid:true,status:'suspended',joined:'2024-05-28'},
  ];
  const [sortCol,setSortCol]=useState('id');
  const [sortDir,setSortDir]=useState('asc');
  function onSort(col){if(sortCol===col)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortCol(col);setSortDir('asc');}}
  const users=[...RAW].sort((a,b)=>{let av=a[sortCol],bv=b[sortCol];if(typeof av==='string'){av=av.toLowerCase();bv=bv.toLowerCase();}return sortDir==='asc'?(av>bv?1:-1):(av<bv?1:-1);});
  const sp={sortCol,sortDir,onSort};
  const SortTH=({children,col,w,align})=>{const active=col&&sp.sortCol===col;return<th onClick={col?()=>sp.onSort(col):undefined} style={{padding:'10px 12px',textAlign:align||'left',fontSize:11,fontWeight:700,color:active?'#C4B5FD':'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:w,cursor:col?'pointer':'default',userSelect:'none',whiteSpace:'nowrap',transition:'color .15s'}}>{children}{col&&<span style={{marginLeft:4,display:'inline-flex',flexDirection:'column',gap:1,verticalAlign:'middle',opacity:active?1:0.3}}><svg width="7" height="5" viewBox="0 0 7 5" fill={active&&sp.sortDir==='asc'?'#9D5FF5':'#71717A'}><polygon points="3.5,0 7,5 0,5"/></svg><svg width="7" height="5" viewBox="0 0 7 5" fill={active&&sp.sortDir==='desc'?'#9D5FF5':'#71717A'}><polygon points="3.5,5 7,0 0,0"/></svg></span>}</th>;};
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,gap:10}}>
        <h2 style={{fontSize:16,fontWeight:700}}>Хэрэглэгчид <span style={{fontSize:13,color:'#52525B',fontWeight:400}}>({users.length})</span></h2>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{display:'flex',alignItems:'center',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',borderRadius:6,padding:'6px 10px',gap:6}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3F3F46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Хэрэглэгч хайх..." style={{background:'none',border:'none',outline:'none',color:'#fff',fontSize:12,width:160,fontFamily:'inherit'}} />
          </div>
          <AdminSelect defaultValue="Бүгд" options={['Бүгд','Идэвхтэй','Блоклогдсон']} width="140px"/>
        </div>
      </div>
      <ACard style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            <th style={{padding:'10px 12px',fontSize:11,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:40}}>№</th>
            <SortTH col="name">Нэр</SortTH><SortTH col="email">Имэйл</SortTH>
            <SortTH col="cr" align="right">Credit</SortTH>
            <SortTH col="profile">Профайл</SortTH>
            <SortTH col="paid">Төлбөр</SortTH>
            <SortTH col="status">Статус</SortTH>
            <th></th>
          </tr></thead>
          <tbody>{users.map((u,i)=>(
            <tr key={u.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <td style={{padding:'10px 12px',fontSize:12,fontWeight:600,color:'#52525B'}}>{i+1}</td>
              <td style={{padding:'10px 12px',fontSize:13,color:'#E4E4E7'}}><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#38BDF8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0,color:'#fff'}}>{u.name[0]}</div><span style={{fontWeight:500}}>{u.name}</span></div></td>
              <td style={{padding:'10px 12px',fontSize:12,color:'#71717A'}}>{u.email}</td>
              <td style={{padding:'10px 12px',fontSize:13,textAlign:'right',fontWeight:600,color:'#C4B5FD'}}>{u.cr}</td>
              <td style={{padding:'10px 12px',fontSize:13}}><div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:40,height:4,borderRadius:2,background:'rgba(255,255,255,.07)',overflow:'hidden'}}><div style={{height:'100%',width:`${u.profile}%`,background:u.profile>=100?'#4ADE80':'#9D5FF5',borderRadius:2}}></div></div><span style={{fontSize:11,color:'#71717A'}}>{u.profile}%</span></div></td>
              <td style={{padding:'10px 12px',fontSize:13}}><APill color={u.paid?'green':'gray'}>{u.paid?'Төлсөн':'Үгүй'}</APill></td>
              <td style={{padding:'10px 12px',fontSize:13}}><APill color={u.status==='active'?'green':'red'}>{u.status==='active'?'Идэвхтэй':'Блоклогдсон'}</APill></td>
              <td style={{padding:'10px 12px',fontSize:13}}><SmBtn onClick={()=>nav('admin-user-detail')}>Дэлгэрэнгүй</SmBtn></td>
            </tr>
          ))}</tbody>
        </table>
      </ACard>
    </div>
  );
}


/* ── WALLET TRANSACTIONS ─────────────────────────────────── */
function AdminWalletPage(){
  const RAW_TXNS=[

    {id:1,user:'Батбаяр Д.',type:'purchase',desc:'+50 credit авалт',cr:'+50',date:'06/04 10:22'},
    {id:2,user:'Батбаяр Д.',type:'generation_spend',desc:'Профайл генерац',cr:'-2',date:'06/04 09:15'},
    {id:3,user:'Дорж Б.',type:'creator_reward',desc:'Монгол урлаг reward',cr:'+1',date:'06/03 18:40'},
    {id:4,user:'Нарантуяа Г.',type:'generation_spend',desc:'Баннер генерац',cr:'-1',date:'06/03 14:20'},
    {id:5,user:'Батбаяр Д.',type:'generation_refund',desc:'Генерац буцаалт',cr:'+1',date:'06/02 22:10'},
    {id:6,user:'Ганбаатар М.',type:'preset_create_fee',desc:'Preset үүсгэх',cr:'-10',date:'06/01 15:00'},
  ];
  const [wSC,setWSC]=useState('id');const [wSD,setWSD]=useState('asc');
  function wOS(col){if(wSC===col)setWSD(d=>d==='asc'?'desc':'asc');else{setWSC(col);setWSD('asc');}}
  const txns=[...RAW_TXNS].sort((a,b)=>{let av=a[wSC],bv=b[wSC];if(typeof av==='string'){av=av.toLowerCase();bv=bv.toLowerCase();}return wSD==='asc'?(av>bv?1:-1):(av<bv?1:-1);});
  const wsp={sortCol:wSC,sortDir:wSD,onSort:wOS};
  const WTH=({children,col,w,align})=>{const active=col&&wsp.sortCol===col;return<th onClick={col?()=>wsp.onSort(col):undefined} style={{padding:'10px 12px',textAlign:align||'left',fontSize:11,fontWeight:700,color:active?'#C4B5FD':'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:w,cursor:col?'pointer':'default',userSelect:'none',whiteSpace:'nowrap',transition:'color .15s'}}>{children}{col&&<span style={{marginLeft:4,display:'inline-flex',flexDirection:'column',gap:1,verticalAlign:'middle',opacity:active?1:0.3}}><svg width="7" height="5" viewBox="0 0 7 5" fill={active&&wsp.sortDir==='asc'?'#9D5FF5':'#71717A'}><polygon points="3.5,0 7,5 0,5"/></svg><svg width="7" height="5" viewBox="0 0 7 5" fill={active&&wsp.sortDir==='desc'?'#9D5FF5':'#71717A'}><polygon points="3.5,5 7,0 0,0"/></svg></span>}</th>;};
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontSize:16,fontWeight:700}}>Wallet гүйлгээнүүд</h2>
        <SmBtn>Export</SmBtn>
      </div>
      <ACard style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            <th style={{padding:'10px 12px',fontSize:11,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:40}}>№</th>
            <WTH col="user">Хэрэглэгч</WTH><WTH col="type">Төрөл</WTH><WTH col="desc">Тайлбар</WTH>
            <WTH col="date">Огноо</WTH><WTH col="cr" align="right">Credit</WTH>
          </tr></thead>
          <tbody>{txns.map((t,i)=>(
            <tr key={t.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <td style={{padding:'10px 12px',fontSize:12,fontWeight:600,color:'#52525B'}}>{i+1}</td>
              <TD style={{fontWeight:500,color:'#E4E4E7'}}>{t.user}</TD>
              <TD><APill color={t.cr.startsWith('+')?'green':'red'}>{t.type.replace(/_/g,' ')}</APill></TD>
              <TD style={{color:'#A1A1AA'}}>{t.desc}</TD><TD style={{color:'#71717A',fontSize:12}}>{t.date}</TD>
              <TD style={{textAlign:'right',fontWeight:700,color:t.cr.startsWith('+')?'#4ADE80':'#EF4444'}}>{t.cr}</TD>
            </tr>
          ))}</tbody>
        </table>
      </ACard>
    </div>
  );
}

/* ── PAYMENTS ────────────────────────────────────────────── */
function AdminPaymentsPage(){
  const RAW_PAYS=[
    {id:1,ref:'PAY-0012',user:'Батбаяр Д.',pkg:'50 cr',amt:'49,500₮',status:'paid',date:'2024-06-04'},
    {id:2,ref:'PAY-0009',user:'Нарантуяа Г.',pkg:'25 cr',amt:'24,750₮',status:'paid',date:'2024-05-20'},
    {id:3,ref:'PAY-0006',user:'Ганбаатар М.',pkg:'10 cr',amt:'9,900₮',status:'failed',date:'2024-05-10'},
    {id:4,ref:'PAY-0003',user:'Дорж Б.',pkg:'100 cr',amt:'99,000₮',status:'paid',date:'2024-04-28'},
    {id:5,ref:'PAY-0001',user:'Солонго А.',pkg:'10 cr',amt:'9,900₮',status:'pending',date:'2024-04-10'},
  ];
  const sc={paid:{c:'green',l:'Төлсөн'},pending:{c:'amber',l:'Хүлээгдэж'},failed:{c:'red',l:'Амжилтгүй'}};
  const [pSC,setPSC]=useState('id');const [pSD,setPSD]=useState('asc');
  function pOS(col){if(pSC===col)setPSD(d=>d==='asc'?'desc':'asc');else{setPSC(col);setPSD('asc');}}
  const pays=[...RAW_PAYS].sort((a,b)=>{let av=a[pSC],bv=b[pSC];if(typeof av==='string'){av=av.toLowerCase();bv=bv.toLowerCase();}return pSD==='asc'?(av>bv?1:-1):(av<bv?1:-1);});
  const psp={sortCol:pSC,sortDir:pSD,onSort:pOS};
  const PTH=({children,col,w,align})=>{const active=col&&psp.sortCol===col;return<th onClick={col?()=>psp.onSort(col):undefined} style={{padding:'10px 12px',textAlign:align||'left',fontSize:11,fontWeight:700,color:active?'#C4B5FD':'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:w,cursor:col?'pointer':'default',userSelect:'none',whiteSpace:'nowrap',transition:'color .15s'}}>{children}{col&&<span style={{marginLeft:4,display:'inline-flex',flexDirection:'column',gap:1,verticalAlign:'middle',opacity:active?1:0.3}}><svg width="7" height="5" viewBox="0 0 7 5" fill={active&&psp.sortDir==='asc'?'#9D5FF5':'#71717A'}><polygon points="3.5,0 7,5 0,5"/></svg><svg width="7" height="5" viewBox="0 0 7 5" fill={active&&psp.sortDir==='desc'?'#9D5FF5':'#71717A'}><polygon points="3.5,5 7,0 0,0"/></svg></span>}</th>;};
  return (
    <div>
      <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Төлбөрүүд</h2>
      <ACard style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            <th style={{padding:'10px 12px',fontSize:11,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:40}}>№</th>
            <PTH col="ref">Ref</PTH><PTH col="user">Хэрэглэгч</PTH><PTH col="pkg">Багц</PTH>
            <PTH col="amt" align="right">Дүн</PTH><PTH col="date">Огноо</PTH><PTH col="status">Статус</PTH><th></th>
          </tr></thead>
          <tbody>{pays.map((p,i)=>(
            <tr key={p.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <td style={{padding:'10px 12px',fontSize:12,fontWeight:600,color:'#52525B'}}>{i+1}</td>
              <TD style={{fontFamily:'monospace',fontSize:11,color:'#71717A'}}>{p.ref}</TD>
              <TD style={{fontWeight:500,color:'#E4E4E7'}}>{p.user}</TD><TD style={{color:'#A1A1AA'}}>{p.pkg}</TD>
              <TD style={{textAlign:'right',fontWeight:600,color:'#E4E4E7'}}>{p.amt}</TD><TD style={{color:'#71717A',fontSize:12}}>{p.date}</TD>
              <TD><APill color={sc[p.status].c}>{sc[p.status].l}</APill></TD>
              <TD>{p.status==='pending'&&<SmBtn color='#4ADE80' bg='rgba(74,222,128,.08)'>Баталгаажуулах</SmBtn>}</TD>
            </tr>
          ))}</tbody>
        </table>
      </ACard>
    </div>
  );
}

/* ── COMPANY REQUESTS ────────────────────────────────────── */
function AdminCompanyPage(){
  const reqs=[
    {id:1,company:'Creato Solutions',contact:'Батбаяр',phone:'+976 8888-0000',email:'info@test.mn',monthly:1000,status:'new'},
    {id:2,company:'TDB Bank',contact:'Нарантуяа',phone:'+976 9999-1111',email:'it@tdb.mn',monthly:5000,status:'contacted'},
  ];
  const sc={new:{c:'blue',l:'Шинэ'},contacted:{c:'amber',l:'Холбогдсон'},contracted:{c:'green',l:'Гэрээтэй'},closed:{c:'gray',l:'Хаагдсан'}};
  return (
    <div>
      <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Байгууллагын хүсэлтүүд</h2>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {reqs.map(r=>(
          <ACard key={r.id} style={{padding:16}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}><span style={{fontSize:15,fontWeight:700}}>{r.company}</span><APill color={sc[r.status].c}>{sc[r.status].l}</APill></div>
                <div style={{fontSize:12,color:'#71717A'}}>Холбогч: {r.contact} · {r.phone} · {r.email}</div>
                <div style={{fontSize:12,color:'#52525B',marginTop:4}}>Сарын хэрэглээ: ~{r.monthly.toLocaleString()} credit</div>
              </div>
              <div style={{display:'flex',gap:6}}><SmBtn>Тэмдэглэл</SmBtn><SmBtn color='#4ADE80' bg='rgba(74,222,128,.08)'>Холбогдох</SmBtn></div>
            </div>
          </ACard>
        ))}
      </div>
    </div>
  );
}

/* ── GENERATIONS ──────────────────────────────────────────── */
function AdminGenerationsPage(){
  const RAW=[
    {id:4421,user:'Батбаяр Д.',preset:'Профайл зураг',model:'DALL-E 3',status:'completed',cr:2,cost:'$0.08',retry:0,date:'06/04 09:15'},
    {id:4420,user:'Нарантуяа Г.',preset:'Баннер загвар',model:'DALL-E 3',status:'completed',cr:1,cost:'$0.04',retry:0,date:'06/04 09:10'},
    {id:4419,user:'Дорж Б.',preset:'Монгол урлаг',model:'SDXL',status:'failed',cr:2,cost:'$0.00',retry:2,date:'06/04 08:45'},
    {id:4418,user:'Ганбаатар М.',preset:'Instagram пост',model:'Midjourney',status:'processing',cr:1,cost:'—',retry:0,date:'06/04 08:30'},
    {id:4417,user:'Батбаяр Д.',preset:'Лого загвар',model:'DALL-E 3',status:'completed',cr:3,cost:'$0.04',retry:0,date:'06/03 22:00'},
    {id:4416,user:'Солонго А.',preset:'Профайл зураг',model:'DALL-E 3',status:'refunded',cr:2,cost:'$0.04',retry:1,date:'06/03 20:15'},
  ];
  const [sortCol,setSortCol]=useState('id');
  const [sortDir,setSortDir]=useState('desc');
  function onSort(col){if(sortCol===col)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortCol(col);setSortDir('asc');}}
  const gens=[...RAW].sort((a,b)=>{let av=a[sortCol],bv=b[sortCol];if(typeof av==='string'){av=av.toLowerCase();bv=bv.toLowerCase();}return sortDir==='asc'?(av>bv?1:-1):(av<bv?1:-1);});
  const sp={sortCol,sortDir,onSort};
  const STH=({children,col,w,align})=>{const active=col&&sp.sortCol===col;return<th onClick={col?()=>sp.onSort(col):undefined} style={{padding:'10px 12px',textAlign:align||'left',fontSize:11,fontWeight:700,color:active?'#C4B5FD':'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:w,cursor:col?'pointer':'default',userSelect:'none',whiteSpace:'nowrap',transition:'color .15s'}}>{children}{col&&<span style={{marginLeft:4,display:'inline-flex',flexDirection:'column',gap:1,verticalAlign:'middle',opacity:active?1:0.3}}><svg width="7" height="5" viewBox="0 0 7 5" fill={active&&sp.sortDir==='asc'?'#9D5FF5':'#71717A'}><polygon points="3.5,0 7,5 0,5"/></svg><svg width="7" height="5" viewBox="0 0 7 5" fill={active&&sp.sortDir==='desc'?'#9D5FF5':'#71717A'}><polygon points="3.5,5 7,0 0,0"/></svg></span>}</th>;};
  const sc={completed:{c:'green',l:'Амжилттай'},failed:{c:'red',l:'Алдаа'},processing:{c:'blue',l:'Боловсруулж байна'},refunded:{c:'amber',l:'Буцаагдсан'},created:{c:'gray',l:'Үүсгэгдсэн'}};
  return (
    <div>
      <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Генерацууд</h2>
      <ACard style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            <STH w="50" col="id">№</STH>
            <STH col="user">Хэрэглэгч</STH>
            <STH col="preset">Preset</STH>
            <STH col="model">Модел</STH>
            <STH col="status">Статус</STH>
            <STH col="cr" align="right">Credit</STH>
            <STH col="cost" align="right">Cost</STH>
            <STH col="retry">Retry</STH>
            <STH col="date">Огноо</STH>
            <th></th>
          </tr></thead>
          <tbody>{gens.map((g,i)=>(
            <tr key={g.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <TD style={{fontFamily:'monospace',fontSize:11,color:'#52525B'}}>#{g.id}</TD>
              <TD style={{fontWeight:500,color:'#E4E4E7'}}>{g.user}</TD>
              <TD style={{color:'#A1A1AA'}}>{g.preset}</TD>
              <TD style={{color:'#71717A',fontSize:12}}>{g.model}</TD>
              <TD><APill color={sc[g.status].c}>{sc[g.status].l}</APill></TD>
              <TD style={{textAlign:'right',fontWeight:600,color:'#C4B5FD'}}>{g.cr}</TD>
              <TD style={{textAlign:'right',color:'#71717A',fontSize:12}}>{g.cost}</TD>
              <TD style={{color:g.retry>0?'#FBBF24':'#3F3F46'}}>{g.retry}</TD>
              <TD style={{color:'#71717A',fontSize:12}}>{g.date}</TD>
              <TD><div style={{display:'flex',gap:4}}>{g.status==='failed'&&<><SmBtn color='#FBBF24' bg='rgba(251,191,36,.08)'>Retry</SmBtn><SmBtn color='#4ADE80' bg='rgba(74,222,128,.08)'>Refund</SmBtn></>}{g.status==='completed'&&<SmBtn>Үзэх</SmBtn>}</div></TD>
            </tr>
          ))}</tbody>
        </table>
      </ACard>
    </div>
  );
}

/* ── RATINGS ──────────────────────────────────────────────── */
function AdminRatingsPage(){
  const RAW_RAT=[
    {id:1,user:'Батбаяр Д.',preset:'Профайл зураг',rating:5,comment:'Маш гайхалтай!',date:'06/04'},
    {id:2,user:'Нарантуяа Г.',preset:'Баннер загвар',rating:4,comment:'Хурдан, чанартай',date:'06/03'},
    {id:3,user:'Ганбаатар М.',preset:'Instagram пост',rating:5,comment:'Сайн байна',date:'06/03'},
    {id:4,user:'Дорж Б.',preset:'Монгол урлаг',rating:3,comment:'Дундаж чанар',date:'06/02'},
  ];
  const [rSC,setRSC]=useState('id');const [rSD,setRSD]=useState('asc');
  function rOS(col){if(rSC===col)setRSD(d=>d==='asc'?'desc':'asc');else{setRSC(col);setRSD('asc');}}
  const ratings=[...RAW_RAT].sort((a,b)=>{let av=a[rSC],bv=b[rSC];if(typeof av==='string'){av=av.toLowerCase();bv=bv.toLowerCase();}return rSD==='asc'?(av>bv?1:-1):(av<bv?1:-1);});
  const rsp={sortCol:rSC,sortDir:rSD,onSort:rOS};
  const RTH=({children,col,w,align})=>{const active=col&&rsp.sortCol===col;return<th onClick={col?()=>rsp.onSort(col):undefined} style={{padding:'10px 12px',textAlign:align||'left',fontSize:11,fontWeight:700,color:active?'#C4B5FD':'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:w,cursor:col?'pointer':'default',userSelect:'none',whiteSpace:'nowrap',transition:'color .15s'}}>{children}{col&&<span style={{marginLeft:4,display:'inline-flex',flexDirection:'column',gap:1,verticalAlign:'middle',opacity:active?1:0.3}}><svg width="7" height="5" viewBox="0 0 7 5" fill={active&&rsp.sortDir==='asc'?'#9D5FF5':'#71717A'}><polygon points="3.5,0 7,5 0,5"/></svg><svg width="7" height="5" viewBox="0 0 7 5" fill={active&&rsp.sortDir==='desc'?'#9D5FF5':'#71717A'}><polygon points="3.5,5 7,0 0,0"/></svg></span>}</th>;};
  return (
    <div>
      <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Үнэлгээ / Сэтгэгдлүүд</h2>
      <ACard style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)'}}>
            <th style={{padding:'10px 12px',fontSize:11,fontWeight:700,color:'#52525B',textTransform:'uppercase',letterSpacing:'.8px',width:40}}>№</th>
            <RTH col="user">Хэрэглэгч</RTH><RTH col="preset">Preset</RTH><RTH col="rating">Оноо</RTH>
            <RTH col="comment">Сэтгэгдэл</RTH><RTH col="date">Огноо</RTH><th></th>
          </tr></thead>
          <tbody>{ratings.map((r,i)=>(
            <tr key={r.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <td style={{padding:'10px 12px',fontSize:12,fontWeight:600,color:'#52525B'}}>{i+1}</td>
              <TD style={{fontWeight:500,color:'#E4E4E7'}}>{r.user}</TD><TD style={{color:'#A1A1AA'}}>{r.preset}</TD>
              <TD><span style={{color:'#FBBF24'}}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span></TD>
              <TD style={{color:'#A1A1AA'}}>{r.comment}</TD><TD style={{color:'#71717A',fontSize:12}}>{r.date}</TD>
              <TD><div style={{display:'flex',gap:4}}><SmBtn>Нуух</SmBtn><SmBtn color='#EF4444' bg='rgba(239,68,68,.06)'>Устгах</SmBtn></div></TD>
            </tr>
          ))}</tbody>
        </table>
      </ACard>
    </div>
  );
}

/* ── HOMEPAGE MANAGER ────────────────────────────────────── */
function AdminHomepagePage({nav}){
  const sections=[
    {id:1,title:'Hero баннер',type:'banner',status:'published',order:1},
    {id:2,title:'Онцлох presets',type:'section',status:'published',order:2},
    {id:3,title:'Шинэ presets',type:'section',status:'published',order:3},
    {id:4,title:'Тренд presets',type:'section',status:'draft',order:4},
    {id:5,title:'Зуны урамшуулал',type:'banner',status:'scheduled',order:5},
  ];
  const sc={published:{c:'green',l:'Нийтлэгдсэн'},draft:{c:'gray',l:'Ноорог'},scheduled:{c:'blue',l:'Хуваарьтай'}};
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontSize:16,fontWeight:700}}>Homepage удирдлага</h2>
        <div style={{display:'flex',gap:6}}>
          <SmBtn onClick={()=>nav('admin-homepage-banners')} color='#38BDF8' bg='rgba(56,189,248,.08)' style={{borderColor:'rgba(56,189,248,.2)'}}>+ Баннер</SmBtn>
          <SmBtn onClick={()=>nav('admin-homepage-sections')} color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' style={{fontWeight:600,border:'none'}}>+ Section</SmBtn>
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {sections.map(s=>(
          <ACard key={s.id} style={{padding:14}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:24,textAlign:'center',fontSize:14,color:'#3F3F46',cursor:'grab'}}>⋮⋮</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:14,fontWeight:600}}>{s.title}</span><APill color={s.type==='banner'?'blue':'purple'}>{s.type}</APill><APill color={sc[s.status].c}>{sc[s.status].l}</APill></div>
                <div style={{fontSize:11,color:'#3F3F46',marginTop:4}}>Дараалал: {s.order}</div>
              </div>
              <div style={{display:'flex',gap:6}}>
                <SmBtn onClick={()=>s.type==='banner'?nav('admin-homepage-banners'):nav('admin-homepage-sections')}>Засах</SmBtn>
                <SmBtn color='#EF4444' bg='rgba(239,68,68,.06)'>Устгах</SmBtn>
              </div>
            </div>
          </ACard>
        ))}
      </div>
    </div>
  );
}

/* ── HOMEPAGE BANNER BUILDER ─────────────────────────────── */
function AdminBannersPage({nav}){
  return (
    <div style={{maxWidth:700,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
        <SmBtn onClick={()=>nav('admin-homepage')}>← Буцах</SmBtn>
        <h2 style={{fontSize:16,fontWeight:700,flex:1}}>Баннер үүсгэх / засах</h2>
        <SmBtn color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' style={{fontWeight:600,border:'none'}}>Хадгалах</SmBtn>
      </div>
      <ACard>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Баннер нэр *</label><input defaultValue="Зуны урамшуулал" style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit'}} /></div>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Тайлбар</label><textarea rows={2} style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit',resize:'vertical'}} /></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Background color</label><input type="color" defaultValue="#7C3AED" style={{width:48,height:36,border:'1px solid rgba(255,255,255,.07)',borderRadius:6,cursor:'pointer',background:'transparent'}} /></div>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Background image</label><div style={{border:'2px dashed rgba(255,255,255,.08)',borderRadius:8,padding:'12px',textAlign:'center',fontSize:12,color:'#3F3F46',cursor:'pointer'}}>⬆ Зураг оруулах</div></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>CTA текст</label><input defaultValue="Одоо авах" style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit'}} /></div>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>CTA зорилтот хуудас</label><AdminSelect defaultValue="/presets" options={['/presets','/credits','/company']}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Статус</label><AdminSelect defaultValue="Draft" options={['Draft','Published','Scheduled']}/></div>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Хуваарь огноо</label><ADatePicker placeholder="Огноо сонгох"/></div>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Хуваарь цаг</label><ATimePicker placeholder="Цаг сонгох"/></div>
          </div>
          <ACheckbox label="Идэвхтэй" defaultChecked={true}/>
        </div>
      </ACard>
    </div>
  );
}

/* ── SECTION PRESETS SELECTOR ────────────────────────────── */
function SectionPresetsSelector() {
  const ALL = ['Профайл зураг','Баннер загвар','Instagram пост','Монгол урлаг','Лого загвар','Тэнгэрлэг байгаль','Уламжлалт хувцас','Бизнес зураг'];
  const [selected, setSelected] = useState(['Профайл зураг','Баннер загвар','Instagram пост','Монгол урлаг']);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  function remove(p){ setSelected(s=>s.filter(x=>x!==p)); }
  function add(p){ if(!selected.includes(p)){ setSelected(s=>[...s,p]); } setShowAdd(false); setSearch(''); }

  const filtered = ALL.filter(p=>!selected.includes(p)&&p.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <label style={{fontSize:12,color:'#52525B',fontWeight:600}}>Сонгогдсон presets <span style={{color:'#3F3F46',fontWeight:400}}>({selected.length})</span></label>
        <button onClick={()=>setShowAdd(v=>!v)} style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',borderRadius:7,border:'1px solid rgba(124,58,237,.3)',background:'rgba(124,58,237,.08)',color:'#9D5FF5',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(124,58,237,.15)'} onMouseOut={e=>e.currentTarget.style.background='rgba(124,58,237,.08)'}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>
          Нэмэх
        </button>
      </div>

      {/* Selected list */}
      <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:showAdd?10:0}}>
        {selected.length===0&&<div style={{fontSize:12,color:'#3F3F46',padding:'10px',textAlign:'center',background:'rgba(255,255,255,.02)',borderRadius:8,border:'1px dashed rgba(255,255,255,.08)'}}>Preset сонгогдоогүй</div>}
        {selected.map((p,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',background:'rgba(124,58,237,.06)',border:'1px solid rgba(124,58,237,.15)',borderRadius:8,transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(124,58,237,.1)'} onMouseOut={e=>e.currentTarget.style.background='rgba(124,58,237,.06)'}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#3F3F46" strokeWidth="1.5" strokeLinecap="round" style={{cursor:'grab',flexShrink:0}}><line x1="2" y1="4" x2="10" y2="4"/><line x1="2" y1="8" x2="10" y2="8"/></svg>
            <div style={{width:24,height:24,borderRadius:6,background:'rgba(124,58,237,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#C4B5FD',flexShrink:0}}>{i+1}</div>
            <span style={{flex:1,fontSize:13,fontWeight:500,color:'#E4E4E7'}}>{p}</span>
            <button onClick={()=>remove(p)} style={{width:22,height:22,borderRadius:6,border:'1px solid rgba(239,68,68,.2)',background:'rgba(239,68,68,.06)',color:'#EF4444',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontFamily:'inherit',flexShrink:0,transition:'all .15s'}} onMouseOver={e=>e.currentTarget.style.background='rgba(239,68,68,.15)'} onMouseOut={e=>e.currentTarget.style.background='rgba(239,68,68,.06)'}>✕</button>
          </div>
        ))}
      </div>

      {/* Add dropdown */}
      {showAdd&&(
        <div style={{background:'#17172A',border:'1px solid rgba(124,58,237,.22)',borderRadius:10,padding:10,boxShadow:'0 12px 40px rgba(0,0,0,.6)'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Preset хайх..." autoFocus style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:7,padding:'7px 10px',color:'#E4E4E7',fontSize:12,outline:'none',fontFamily:'inherit',marginBottom:8}}/>
          <div style={{display:'flex',flexDirection:'column',gap:2,maxHeight:160,overflowY:'auto'}}>
            {filtered.length===0&&<div style={{fontSize:12,color:'#3F3F46',padding:'8px',textAlign:'center'}}>Олдсонгүй</div>}
            {filtered.map((p,i)=>(
              <button key={i} onClick={()=>add(p)} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:7,border:'none',background:'transparent',color:'#A1A1AA',fontSize:12,cursor:'pointer',fontFamily:'inherit',textAlign:'left',transition:'all .1s'}} onMouseOver={e=>{e.currentTarget.style.background='rgba(124,58,237,.1)';e.currentTarget.style.color='#E4E4E7';}} onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#A1A1AA';}}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── HOMEPAGE SECTION BUILDER ────────────────────────────── */
function AdminSectionsPage({nav}){
  return (
    <div style={{maxWidth:700,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
        <SmBtn onClick={()=>nav('admin-homepage')}>← Буцах</SmBtn>
        <h2 style={{fontSize:16,fontWeight:700,flex:1}}>Preset section үүсгэх / засах</h2>
        <SmBtn color='#fff' bg='linear-gradient(135deg,#7C3AED,#6D28D9)' style={{fontWeight:600,border:'none'}}>Хадгалах</SmBtn>
      </div>
      <ACard>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Section гарчиг *</label><input defaultValue="Онцлох presets" style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit'}} /></div>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Тайлбар</label><input style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit'}} /></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Background color</label><input type="color" defaultValue="#0D0D14" style={{width:48,height:36,border:'1px solid rgba(255,255,255,.07)',borderRadius:6,cursor:'pointer',background:'transparent'}} /></div>
            <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Background image</label><div style={{border:'2px dashed rgba(255,255,255,.08)',borderRadius:8,padding:'12px',textAlign:'center',fontSize:12,color:'#3F3F46',cursor:'pointer'}}>⬆ Зураг оруулах</div></div>
          </div>
          <div><label style={{display:'block',fontSize:12,color:'#52525B',marginBottom:6}}>Preset сонгох арга</label>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <button style={{padding:'7px 14px',borderRadius:6,border:'1px solid rgba(124,58,237,.4)',background:'rgba(124,58,237,.12)',color:'#C4B5FD',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Гараар сонгох</button>
              <button style={{padding:'7px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,.06)',background:'transparent',color:'#71717A',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Ангилалаар</button>
              <button style={{padding:'7px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,.06)',background:'transparent',color:'#71717A',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Төрлөөр</button>
            </div>
          </div>
          <SectionPresetsSelector />
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <ACheckbox label="Идэвхтэй" defaultChecked={true}/>
            <ACheckbox label="Хуваарьтай нийтлэл" defaultChecked={false}/>
          </div>
        </div>
      </ACard>
    </div>
  );
}

Object.assign(window, { AdminUsersPage, AdminWalletPage, AdminPaymentsPage, AdminCompanyPage, AdminGenerationsPage, AdminRatingsPage, AdminHomepagePage, AdminBannersPage, AdminSectionsPage });
