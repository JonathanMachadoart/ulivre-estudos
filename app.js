"use strict";
/* ---------- utilidades ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const secs=d=>d?d.split(":").map(Number).reduce((a,n)=>a*60+n,0):0;
const fmtH=s=>{s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.round(s%3600/60);if(h>=100)return `${h}h`;return h?`${h}h${String(m).padStart(2,"0")}`:`${m} min`;};
const fmtHours=s=>{const h=s/3600;return h>=10?Math.round(h).toLocaleString("pt-BR"):h.toLocaleString("pt-BR",{maximumFractionDigits:1});};
const pad=n=>String(n).padStart(2,"0");
const dkey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>dkey(new Date());
const parseD=k=>{const [y,m,d]=k.split("-").map(Number);return new Date(y,m-1,d);};
const addDays=(k,n)=>{const d=parseD(k);d.setDate(d.getDate()+n);return dkey(d);};
const diffDays=(a,b)=>Math.round((parseD(b)-parseD(a))/864e5);
const MES=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
const MESL=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const fmtD=k=>{const d=parseD(k);return `${d.getDate()} ${MES[d.getMonth()]} ${d.getFullYear()}`;};
const fmtMonth=k=>{const d=parseD(k);return `${MESL[d.getMonth()]} de ${d.getFullYear()}`;};
const norm=s=>String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const listId=u=>(String(u).match(/[?&]list=([\w-]+)/)||[])[1];
const ICON={
  home:'<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
  flag:'<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  rev:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  note:'<path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4M8 13h8M8 17h5"/>',
  book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  ex:'<path d="M9 11l2 2 4-4"/><rect x="4" y="4" width="16" height="16" rx="3"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  board:'<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>',
  map:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 6h10M6 8l5 8M18 8l-5 8"/>',
  pen:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  chev:'<path d="m6 9 6 6 6-6"/>',
};
const ico=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
const PLAY='<svg viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z"/></svg>';

/* ---------- dados ---------- */
const {tracks:TRACKS,courses:C,books:BOOKS}=DATA;
const TR=Object.fromEntries(TRACKS.map(t=>[t.id,t]));
if(TR.data)TR.data.short="DS";
const tcolor=t=>`var(--t-${TR[t].color})`;
Object.values(C).forEach(c=>{c.deps=[];c.total=c.L.reduce((a,l)=>a+secs(l[1]),0);});
Object.values(C).forEach(c=>c.pre.forEach(p=>C[p]&&C[p].deps.push(c.id)));
const EXRE=/exerc|lista\s*\d|lista de|resolu[cç]|prova|desafio|\blab\b|lab\s*\d|laborat|revis[aã]o/i;
const isEx=t=>EXRE.test(t);
const watchUrl=(c,v,t)=>{const pl=listId(c.url);return `https://www.youtube.com/watch?v=${v}`+(pl?`&list=${pl}`:"")+(t?`&t=${t}s`:"");};
const PLATS=[["freeCodeCamp","https://www.freecodecamp.org/learn","Trilhas com projetos práticos de web, JS, APIs e dados"],["Exercism","https://exercism.org/","Exercícios em dezenas de linguagens com mentoria"],["Kaggle","https://www.kaggle.com/learn","Projetos de ciência de dados e IA com notebooks"],["HackerRank","https://www.hackerrank.com/","Desafios de algoritmos e estruturas de dados"],["LeetCode","https://leetcode.com/","Banco de problemas para entrevistas técnicas"],["SadServers","https://sadservers.com/","Cenários reais de erro em servidores Linux"],["SQLZoo","https://sqlzoo.net/","Exercícios progressivos de SQL no navegador"]];

/* ---------- estado ---------- */
const KEY="ulivre-estudos-v2";
const DEF=()=>({status:{},watched:{},notes:{},lnotes:{},reviews:{},books:{},mastered:0,
  plan:{hours:10,factor:1.5,par:2,start:today(),tracks:["cc"]},onb:{done:{},hide:false},ui:{views:{},closed:{}}});
let S=DEF();
try{
  const s=JSON.parse(localStorage.getItem(KEY)||"null");
  if(s&&s.status) S=Object.assign(DEF(),s,{plan:Object.assign(DEF().plan,s.plan||{}),onb:Object.assign(DEF().onb,s.onb||{}),ui:Object.assign(DEF().ui,s.ui||{})});
  else{const o=JSON.parse(localStorage.getItem("ulivre-cc-v1")||"null");
    if(o&&o.status){S.status=o.status||{};S.notes=o.notes||{};const now=Date.now();Object.keys(o.watched||{}).forEach(v=>S.watched[v]=now);}}
}catch(e){}
let saveT=0;
const save=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}},150);};

/* ---------- derivados ---------- */
const raw=id=>S.status[id]||"todo";
function status(id){const r=raw(id);if(r!=="todo")return r;return C[id].pre.every(p=>raw(p)==="done")?"avail":"locked";}
const LABEL={done:"Concluído",doing:"Cursando",avail:"Disponível",locked:"Bloqueado"};
function lstats(c){
  let w=0,left=0,next=-1;
  c.L.forEach(([v,d],i)=>{if(S.watched[v])w++;else{left+=secs(d);if(next<0)next=i;}});
  return {n:c.L.length,w,left,next,pct:c.L.length?w/c.L.length:(raw(c.id)==="done"?1:0)};
}
function trackStats(t){
  let n=0,done=0,doing=0,ln=0,lw=0;
  t.groups.forEach(g=>g.items.forEach(id=>{n++;const s=raw(id);if(s==="done")done++;if(s==="doing")doing++;const st=lstats(C[id]);ln+=st.n;lw+=st.w;}));
  return {n,done,doing,ln,lw,pct:n?done/n:0};
}
const allVids=()=>{const m=new Map();Object.values(C).forEach(c=>c.L.forEach(l=>m.set(l[0],l)));return m;};
const VIDS=allVids();
const vidCourse=new Map();Object.values(C).forEach(c=>c.L.forEach((l,i)=>{if(!vidCourse.has(l[0]))vidCourse.set(l[0],[c.id,i]);}));
const RI=[1,3,7,21,60];
const reviewsDue=()=>Object.entries(S.reviews).filter(([v,r])=>r.due<=today()).sort((a,b)=>a[1].due.localeCompare(b[1].due));
const noteCount=()=>Object.values(S.lnotes).reduce((a,l)=>a+l.length,0);

/* ---------- ações ---------- */
function setWatched(v,on,cid){
  if(on){S.watched[v]=Date.now();S.reviews[v]={step:0,due:addDays(today(),RI[0])};}
  else{delete S.watched[v];delete S.reviews[v];}
  const c=C[cid];
  if(c){const st=lstats(c);
    if(on&&raw(cid)==="todo")S.status[cid]="doing";
    if(st.n&&st.w===st.n)S.status[cid]="done";
    else if(!on&&raw(cid)==="done")S.status[cid]="doing";
    // mesma aula em outros cursos (playlists compartilhadas)
    Object.values(C).forEach(o=>{if(o.id!==cid&&o.L.some(l=>l[0]===v)){const s2=lstats(o);if(on&&raw(o.id)==="todo")S.status[o.id]="doing";if(s2.n&&s2.w===s2.n)S.status[o.id]="done";}});
  }
  save();
}
function setStatus(id,s){if(s==="todo")delete S.status[id];else S.status[id]=s;save();}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2200);}

/* ---------- roteamento ---------- */
const PAGES={inicio:"Início",comecar:"Comece aqui",plano:"Plano de estudos",revisoes:"Revisões",anotacoes:"Anotações",exercicios:"Exercícios",estante:"Estante"};
let route="inicio",sel=null,dtab="aulas",openNote=null,lq="";
function go(r){if(!PAGES[r]&&!TR[r])r="inicio";route=r;try{history.replaceState(null,"","#"+r);}catch(e){}$("#side").classList.remove("on");$("#content").scrollTop=0;render();}
window.addEventListener("hashchange",()=>{const h=location.hash.slice(1);if(h&&h!==route)go(h);});

/* ---------- barra lateral ---------- */
function renderNav(){
  const due=reviewsDue().length;
  const onbN=onbSteps().filter(s=>s.done).length;
  const item=(id,icon,label,extra="")=>`<a href="#${id}" data-go="${id}" class="${route===id?"on":""}"><span class="ic">${ico(icon)}</span>${label}${extra}</a>`;
  let h=item("inicio","home","Início")+item("comecar","flag","Comece aqui",onbN<5?`<span class="cnt">${onbN}/5</span>`:"")+item("plano","cal","Plano de estudos")
   +item("revisoes","rev","Revisões",due?`<span class="badge">${due}</span>`:"")+item("anotacoes","note","Anotações",`<span class="cnt">${noteCount()||""}</span>`)
   +item("exercicios","ex","Exercícios")+item("estante","book","Estante",`<span class="cnt">${BOOKS.length}</span>`);
  const sec=(title,list)=>`<div class="nav-h">${title}</div>`+list.map(t=>{const st=trackStats(t);return `<a href="#${t.id}" data-go="${t.id}" class="${route===t.id?"on":""}" style="--tc:${tcolor(t.id)}"><span class="ic"><span class="dot"></span></span><span class="lbl">${esc(t.name)}</span><span class="pct">${Math.round(st.pct*100)}%</span></a>`;}).join("");
  h+=sec("Currículos",TRACKS.filter(t=>t.kind==="Currículo"))+sec("Especializações",TRACKS.filter(t=>t.kind!=="Currículo"));
  $("#nav").innerHTML=h;
}
$("#nav").addEventListener("click",e=>{const a=e.target.closest("[data-go]");if(a){e.preventDefault();go(a.dataset.go);}});
$("#menuBtn").addEventListener("click",()=>$("#side").classList.toggle("on"));

/* ---------- render principal ---------- */
function render(){
  renderNav();
  const cr=$("#crumb");
  if(TR[route]){const t=TR[route];cr.innerHTML=`<span class="dot" style="--tc:${tcolor(t.id)}"></span><span>${esc(t.name)}</span><small>${t.kind}</small>`;}
  else cr.innerHTML=`<span>${PAGES[route]}</span>`;
  const el=$("#content");
  const fn={inicio:pHome,comecar:pOnb,plano:pPlan,revisoes:pReviews,anotacoes:pNotes,exercicios:pEx,estante:pShelf}[route]||pTrack;
  el.innerHTML=`<div class="page">${fn()}</div>`;
  after();
  if(sel)refreshDrawer();
}
function refreshDrawer(){const b=$("#drBody"),sc=b?b.scrollTop:0;renderDrawer();const nb=$("#drBody");if(nb)nb.scrollTop=sc;}
let afterFns=[];const after=()=>{const f=afterFns;afterFns=[];f.forEach(x=>x());};

/* ---------- Início ---------- */
function streak(){
  const days=new Set(Object.values(S.watched).map(t=>dkey(new Date(t))));
  let k=today(),n=0;if(!days.has(k))k=addDays(k,-1);
  while(days.has(k)){n++;k=addDays(k,-1);}return n;
}
function heatmap(){
  const cnt={};Object.values(S.watched).forEach(t=>{const k=dkey(new Date(t));cnt[k]=(cnt[k]||0)+1;});
  const end=today(),endD=parseD(end);const start=addDays(end,-(16*7+endD.getDay()));
  let h="";for(let k=start;k<=end;k=addDays(k,1)){const n=cnt[k]||0;const l=n===0?0:n<2?1:n<5?2:3;h+=`<i data-l="${l}" title="${fmtD(k)}: ${n} aula${n===1?"":"s"}"></i>`;}
  return h;
}
function pHome(){
  const hr=new Date().getHours();const hi=hr<12?"Bom dia":hr<18?"Boa tarde":"Boa noite";
  let lw=0,secW=0;VIDS.forEach((l,v)=>{if(S.watched[v]){lw++;secW+=secs(l[1]);}});
  const due=reviewsDue();const plan=computePlan();
  const doing=Object.values(C).filter(c=>raw(c.id)==="doing").sort((a,b)=>lastTouch(b)-lastTouch(a)).slice(0,4);
  const steps=onbSteps(),sd=steps.filter(s=>s.done).length;
  let h=`<div class="hello"><div><h1 class="ph">${hi}! Bora estudar?</h1><p class="sub">Seu painel com o que continuar, o que revisar e quando cada etapa termina.</p></div>
    <a class="btn pri" href="#plano" data-go="plano">${ico("cal").replace('<svg','<svg width="15" height="15" style="stroke:currentColor;fill:none;stroke-width:2"')} Ver meu plano</a></div>`;
  if(sd<5&&!S.onb.hide) h+=`<div class="onb-card"><div class="ring" style="--p:${sd/5*100}"><span>${sd}/5</span></div><div><b>Comece por aqui</b><div class="hint">Aprenda a estudar sozinho, configure o Git, escolha sua trilha e monte seu plano.</div></div><a class="btn pri" href="#comecar" data-go="comecar">Continuar</a></div>`;
  h+=`<div class="stats">
    <div class="card stat"><span class="k">Aulas assistidas</span><span class="v">${lw.toLocaleString("pt-BR")}<small>de ${VIDS.size.toLocaleString("pt-BR")}</small></span><span class="d">${Math.round(lw/VIDS.size*1000)/10}% de todo o conteúdo</span></div>
    <div class="card stat"><span class="k">Horas de aula</span><span class="v">${fmtHours(secW)}<small>h</small></span><span class="d">tempo de vídeo concluído</span></div>
    <div class="card stat"><span class="k">Revisões para hoje</span><span class="v">${due.length}</span><span class="d">${S.mastered?`${S.mastered} aulas fixadas`:"revisão espaçada: 1, 3, 7, 21 e 60 dias"}</span></div>
    <div class="card stat"><span class="k">Sequência</span><span class="v">${streak()}<small>${streak()===1?"dia":"dias"}</small></span><span class="d">dias seguidos com aula marcada</span></div></div>`;
  h+=`<div class="grid2"><div style="display:flex;flex-direction:column;gap:16px">
    <div class="card"><div class="card-h"><h2>Continuar de onde parou</h2></div><div class="card-b">`;
  if(doing.length){h+=`<div class="cont-list">`+doing.map(c=>{const st=lstats(c);const nx=st.next>=0?c.L[st.next]:null;
      return `<div class="cont">${nx?`<a class="play" href="${watchUrl(c,nx[0])}" target="_blank" rel="noopener" aria-label="Assistir próxima aula">${PLAY}</a>`:`<span class="play" style="background:var(--done)">✓</span>`}
      <div style="min-width:0"><b>${esc(c.name)}</b><span class="ls">${nx?`Aula ${st.next+1}: ${esc(nx[2])}`:c.ext?"Curso externo":"Todas as aulas marcadas"}</span>
      <div class="meta"><span class="bar"><i style="width:${st.pct*100}%"></i></span><span class="num">${st.w}/${st.n}</span><span class="tag"><span class="dot" style="--tc:${tcolor(c.track)};background:var(--tc)"></span>${TR[c.track].short}</span></div></div>
      <button class="btn sm" data-open="${c.id}">Abrir</button></div>`;}).join("")+`</div>`;}
  else{const first=Object.values(C).find(c=>c.track===(S.plan.tracks[0]||"cc")&&status(c.id)==="avail");
    h+=`<div class="empty">Nenhum curso em andamento. ${first?`Que tal começar por <a href="#" data-open="${first.id}">${esc(first.name)}</a>?`:""}</div>`;}
  h+=`</div></div>
    <div class="card"><div class="card-h"><h2>Suas trilhas</h2></div><div class="card-b"><div class="tracks-grid">`+TRACKS.map(t=>{const st=trackStats(t);
      return `<a class="trk" href="#${t.id}" data-go="${t.id}" style="--tc:${tcolor(t.id)}"><div class="trk-h"><span class="trk-ic">${t.short}</span><div><b>${esc(t.name)}</b><small>${t.kind} · ${st.n} cursos</small></div></div><span class="bar"><i style="width:${st.pct*100}%"></i></span><span class="row"><span>${st.done} concluídos</span><span class="num">${st.lw}/${st.ln} aulas</span></span></a>`;}).join("")+`</div></div></div>
  </div><div style="display:flex;flex-direction:column;gap:16px">
    <div class="card"><div class="card-h"><h2>Revisões de hoje</h2><a class="more" href="#revisoes" data-go="revisoes">Ver todas</a></div><div class="card-b">`
    +(due.length?`<div class="rv-mini">`+due.slice(0,5).map(([v])=>{const l=VIDS.get(v),[cid]=vidCourse.get(v)||[];return `<div><span title="${esc(l?l[2]:"")}">${esc(l?l[2]:v)}</span><span class="tag">${cid?TR[C[cid].track].short:""}</span></div>`;}).join("")+`</div>`:`<div class="empty">Nada para revisar hoje. Cada aula marcada volta aqui depois de 1 dia.</div>`)
    +`</div></div>
    <div class="card"><div class="card-h"><h2>Próximos marcos</h2><a class="more" href="#plano" data-go="plano">Plano</a></div><div class="card-b"><div class="miles">`
    +plan.miles.filter(m=>!m.done).slice(0,5).map(m=>`<div><span>${esc(m.label)}</span><b>${m.date?fmtMonth(m.date):"—"}</b></div>`).join("")+(plan.miles.every(m=>m.done)?`<div class="empty">Todos os marcos das trilhas do plano foram concluídos.</div>`:"")
    +`</div><p class="hint" style="margin:10px 0 0">Com ${S.plan.hours}h por semana, ${S.plan.par} curso${S.plan.par>1?"s":""} por vez.</p></div></div>
    <div class="card"><div class="card-h"><h2>Atividade</h2><span class="hint" style="margin-left:auto">últimas 17 semanas</span></div><div class="card-b"><div class="heat">${heatmap()}</div></div></div>
  </div></div>`;
  return h;
}
const lastTouch=c=>c.L.reduce((m,l)=>Math.max(m,S.watched[l[0]]||0),0);

/* ---------- Trilha ---------- */
let filt="all",tq="";
function pTrack(){
  const t=TR[route],st=trackStats(t);
  const views=t.map?["list","board","map"]:["list","board"];
  let v=S.ui.views[t.id]||"list";if(!views.includes(v))v="list";
  const counts={all:st.n,avail:0,doing:0,done:0,locked:0};t.groups.forEach(g=>g.items.forEach(id=>counts[status(id)]++));
  const VL={list:["list","Lista"],board:["board","Quadro"],map:["map","Mapa"]};
  let h=`<div class="th" style="--tc:${tcolor(t.id)}"><div class="th-l"><span class="trk-ic">${t.short}</span><div style="min-width:0"><h1 class="ph">${esc(t.name)}</h1><p class="sub desc">${esc(t.desc)}</p></div></div>
    <div class="th-r"><span class="k"><b class="num" style="color:var(--ink)">${st.done}/${st.n}</b> cursos · <span class="num">${st.lw}/${st.ln}</span> aulas</span><span class="bar"><i style="width:${st.pct*100}%;background:var(--tc)"></i></span><a class="hint" href="${t.link}" target="_blank" rel="noopener">Fonte no ${t.link.includes("miro.com")?"Miro":t.link.includes("youtube.com")?"YouTube":"GitHub"} ↗</a></div></div>
    <div class="toolbar"><div class="views" role="group" aria-label="Visualização">${views.map(x=>`<button data-view="${x}" aria-pressed="${x===v}">${ico(VL[x][0])}${VL[x][1]}</button>`).join("")}</div>
    ${v!=="board"?`<div class="chips" role="group" aria-label="Filtrar">${[["all","Todos"],["avail","Disponíveis"],["doing","Cursando"],["done","Concluídos"],["locked","Bloqueados"]].filter(([k])=>k==="all"||counts[k]||k===filt).map(([k,l])=>`<button class="chip" data-filt="${k}" aria-pressed="${filt===k}">${l}<span class="n">${counts[k]}</span></button>`).join("")}</div>`:""}</div>`;
  h+= v==="list"?listView(t):v==="board"?boardView(t):mapView(t);
  return h;
}
const vis=id=>filt==="all"||status(id)===filt;
function listView(t){
  return `<div class="lv">`+t.groups.map((g,gi)=>{
    const items=g.items.filter(vis);if(!items.length&&filt!=="all")return "";
    const gd=g.items.filter(id=>raw(id)==="done").length;const ck=t.id+":"+gi;
    return `<section class="grp ${S.ui.closed[ck]?"closed":""}" style="--tc:${tcolor(t.id)}">
      <button class="grp-h" data-grp="${ck}" aria-expanded="${!S.ui.closed[ck]}"><svg class="chev" viewBox="0 0 24 24">${ICON.chev}</svg><span class="gl">${esc(g.name)}</span><span class="gc">${g.items.length} cursos</span><span class="bar"><i style="width:${gd/g.items.length*100}%;background:var(--tc)"></i></span><span class="gp">${Math.round(gd/g.items.length*100)}%</span></button>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Curso</th><th>Status</th><th>Progresso</th><th>Restante</th><th>${t.map?"Pré-requisitos":"Conteúdos"}</th></tr></thead><tbody>`
      +items.map(id=>{const c=C[id],s=status(id),st=lstats(c);
        return `<tr data-open="${id}" class="${sel===id?"sel":""}" tabindex="0"><td><span class="nm">${esc(c.name)}${c.ext?'<span class="ext">EXTERNO</span>':""}${c.gone?'<span class="ext" style="color:var(--danger)">INDISPONÍVEL</span>':""}</span></td>
        <td><button class="pill" data-s="${s}" data-stat="${id}">${LABEL[s]}</button></td>
        <td><span class="pr"><span class="bar"><i style="width:${st.pct*100}%"></i></span><span class="num muted">${c.L.length?`${st.w}/${st.n}`:"—"}</span></span></td>
        <td class="num muted">${c.L.length?(st.left?fmtH(st.left):"✓"):(c.estH?`~${Math.round(c.estH)}h`:"—")}</td>
        <td>${t.map?(c.pre.length?`<span class="pre-chips">${c.pre.map(p=>`<span class="${raw(p)==="done"?"ok":""}">${esc(C[p].name)}</span>`).join("")}</span>`:'<span class="muted">—</span>'):`<span class="muted" style="font-size:12px">${esc(c.topics||"")}</span>`}</td></tr>`;}).join("")
      +`</tbody></table></div></section>`;}).join("")+`</div>`;
}
function boardView(t){
  const cols=[["locked","Bloqueado"],["avail","Disponível"],["doing","Cursando"],["done","Concluído"]];
  const all=t.groups.flatMap(g=>g.items);
  return `<p class="hint" style="margin:-8px 0 0">Arraste um cartão para mudar o status.</p><div class="board">`+cols.map(([k,l])=>{const items=all.filter(id=>status(id)===k);
    return `<div class="col" data-drop="${k}"><div class="col-h"><span class="pill" data-s="${k}">${l}</span><span class="n">${items.length}</span></div>`
      +items.map(id=>{const c=C[id],st=lstats(c);return `<div class="kc" draggable="${k==="locked"?"false":"true"}" data-open="${id}" data-drag="${id}" tabindex="0"><b>${esc(c.name)}</b>
        <span class="row"><span class="tag">${esc(t.groups[c.g].name)}</span>${c.ext?'<span class="tag">Externo</span>':""}</span>
        <span class="row"><span class="bar"><i style="width:${st.pct*100}%"></i></span><span class="num">${c.L.length?`${st.w}/${st.n}`:"—"}</span></span></div>`;}).join("")
      +(items.length?"":`<div class="empty" style="padding:10px 0">Vazio</div>`)+`</div>`;}).join("")+`</div>`;
}
function mapView(t){
  afterFns.push(drawEdges);
  return `<div class="map-legend"><span><i style="--c:var(--done)"></i>pré-requisito</span><span><i style="--c:var(--doing)"></i>libera</span><span>Clique em um curso para ver as ligações e abrir os detalhes.</span></div>
  <div class="map-wrap"><div class="map ${sel&&C[sel]&&C[sel].track===t.id?"focus":""}" id="map" style="grid-template-columns:repeat(${t.groups.length},minmax(150px,1fr))"><svg class="edges" id="edges" aria-hidden="true"></svg>`
   +t.groups.map(g=>`<div class="mcol"><div class="mcol-h">${esc(g.name)}</div>`+g.items.map(id=>{const c=C[id],s=status(id),st=lstats(c);const sc=sel&&C[sel];
     const cls=sel===id?"sel":sc&&sc.pre.includes(id)?"pre":sc&&sc.deps.includes(id)?"dep":"";
     return `<button class="mc ${cls}" id="m-${id}" data-s="${s}" data-open="${id}" style="${vis(id)?"":"opacity:.2"}"><b>${esc(c.name)}</b><span class="bar"><i style="width:${st.pct*100}%"></i></span></button>`;}).join("")+`</div>`).join("")+`</div></div>`;
}
function drawEdges(){
  const svg=$("#edges"),map=$("#map");if(!svg||!map)return;svg.innerHTML="";
  if(!sel||!C[sel]||C[sel].track!==route)return;
  const br=map.getBoundingClientRect(),me=$("#m-"+sel);if(!me)return;
  const R=el=>{const r=el.getBoundingClientRect();return{l:r.left-br.left,r:r.right-br.left,y:r.top-br.top+r.height/2};};
  const cs=getComputedStyle(document.documentElement);
  const line=(a,b,col)=>{const dx=Math.max(26,(b.l-a.r)/2);const p=document.createElementNS("http://www.w3.org/2000/svg","path");
    p.setAttribute("d",`M${a.r},${a.y} C${a.r+dx},${a.y} ${b.l-dx},${b.y} ${b.l},${b.y}`);p.setAttribute("fill","none");p.setAttribute("stroke",col);p.setAttribute("stroke-width","2");svg.appendChild(p);
    const d=document.createElementNS("http://www.w3.org/2000/svg","circle");d.setAttribute("cx",b.l);d.setAttribute("cy",b.y);d.setAttribute("r","3.5");d.setAttribute("fill",col);svg.appendChild(d);};
  C[sel].pre.forEach(p=>{const e=$("#m-"+p);if(e)line(R(e),R(me),cs.getPropertyValue("--done").trim());});
  C[sel].deps.forEach(p=>{const e=$("#m-"+p);if(e)line(R(me),R(e),cs.getPropertyValue("--doing").trim());});
}
window.addEventListener("resize",()=>{if(route&&TR[route])drawEdges();});

/* ---------- painel de detalhes ---------- */
function openCourse(id,tab){sel=id;dtab=tab||"aulas";openNote=null;lq="";renderDrawer();$("#drawer").classList.add("on");$("#scrim").classList.add("on");
  document.querySelectorAll("[data-open].sel").forEach(e=>e.classList.remove("sel"));document.querySelectorAll(`tr[data-open="${id}"]`).forEach(e=>e.classList.add("sel"));
  if(TR[route]&&(S.ui.views[route]||"list")==="map")refreshMain();}
function closeDrawer(){sel=null;$("#drawer").classList.remove("on");$("#scrim").classList.remove("on");document.querySelectorAll("tr.sel").forEach(e=>e.classList.remove("sel"));if(TR[route]&&(S.ui.views[route]||"list")==="map")refreshMain();}
$("#scrim").addEventListener("click",closeDrawer);
function refreshMain(){const sc=$("#content").scrollTop;render();$("#content").scrollTop=sc;}
const relBtns=ids=>ids.length?ids.map(i=>`<button data-open="${i}"><i class="${status(i)}"></i>${esc(C[i].name)}</button>`).join(""):'<span class="hint">Nenhum</span>';
function renderDrawer(){
  const c=C[sel];if(!c)return;const t=TR[c.track],s=status(sel),st=lstats(c);
  const ex=c.L.filter(l=>isEx(l[2]));const bks=c.bk||[];const nn=c.L.reduce((a,l)=>a+(S.lnotes[l[0]]||[]).length,0)+(S.notes[sel]?1:0);
  const tabs=[["aulas","Aulas",c.L.length],["exercicios","Exercícios",ex.length],["livros","Livros",bks.length],["anotacoes","Anotações",nn]];
  let h=`<div class="dr-top"><span class="dot" style="--tc:${tcolor(t.id)};background:var(--tc)"></span>${esc(t.name)} › ${esc(t.groups[c.g].name)}<button class="x" id="drClose" aria-label="Fechar">${ico("x")}</button></div>
  <div class="dr-head"><h2>${esc(c.name)}</h2><div class="props">
    <span class="k">Status</span><span><button class="pill" data-s="${s}" data-stat="${sel}">${LABEL[s]}</button></span>
    <span class="k">Progresso</span><span style="display:flex;align-items:center;gap:8px"><span class="bar" style="width:140px"><i style="width:${st.pct*100}%"></i></span><span class="num hint">${c.L.length?`${st.w}/${st.n} aulas${st.left?` · ${fmtH(st.left)} restantes`:""}`:c.ext?"curso externo":"sem aulas listadas"}</span></span>
    ${t.map?`<span class="k">Pré-requisitos</span><span class="rel">${relBtns(c.pre)}</span><span class="k">Libera</span><span class="rel">${relBtns(c.deps)}</span>${c.topics?`<span class="k">Conteúdos</span><span>${esc(c.topics)}</span>`:""}`:`<span class="k">Conteúdos</span><span>${esc(c.topics||"—")}</span>`}
    ${c.dur||c.ded?`<span class="k">Carga sugerida</span><span>${esc([c.dur,c.ded].filter(Boolean).join(" · "))}</span>`:""}
    <span class="k">Links</span><span class="rel"><a class="btn sm" href="${c.url}" target="_blank" rel="noopener">${c.ext?"Abrir curso":"Playlist"} ↗</a>${c.alt?`<a class="btn sm" href="${c.alt}" target="_blank" rel="noopener">Alternativa ↗</a>`:""}${(c.links||[]).map(([l,u])=>`<a class="btn sm" href="${u}" target="_blank" rel="noopener">${esc(l)} ↗</a>`).join("")}</span>
  </div></div>
  <div class="tabs" role="tablist">${tabs.map(([k,l,n])=>`<button role="tab" data-tab="${k}" aria-selected="${dtab===k}">${l}${n?`<span class="n">${n}</span>`:""}</button>`).join("")}</div>
  <div class="dr-body" id="drBody">${drawerBody(c)}</div>`;
  $("#drawer").innerHTML=h;
}
function lessonRow(c,l,i,st,noNote){
  const [v,d,t]=l,w=!!S.watched[v],ns=S.lnotes[v]||[];
  return `<li><div class="lr ${w?"w":""} ${i===st.next?"cur":""}"><input type="checkbox" data-w="${v}" ${w?"checked":""} aria-label="Marcar como assistida: ${esc(t)}"><span class="ix">${i+1}</span><a class="lt" href="${watchUrl(c,v)}" target="_blank" rel="noopener">${esc(t)}</a><span class="du">${d}</span>${noNote?"<span></span>":`<button class="nb" data-nb="${v}" ${ns.length?`data-n="${ns.length}"`:""} aria-label="Anotações da aula">${ico("pen")}</button>`}</div>
  ${!noNote&&openNote===v?noteEditor(c,v):""}</li>`;
}
function noteEditor(c,v){
  const ns=S.lnotes[v]||[];
  return `<div class="lnotes">${ns.map((n,k)=>`<div class="ln"><a class="ts" href="${watchUrl(c,v,n.s)}" target="_blank" rel="noopener">${n.t}</a><p>${esc(n.x)}</p><button data-delnote="${v}:${k}" aria-label="Apagar anotação">✕</button></div>`).join("")}
    <form class="ln-form" data-addnote="${v}"><input class="field" name="t" placeholder="mm:ss" aria-label="Minuto do vídeo" inputmode="numeric" id="nt-${v}"><input class="field" name="x" placeholder="Anotação neste minuto…" aria-label="Texto da anotação" id="nx-${v}"><button class="btn sm pri">Salvar</button></form>
    <span class="hint">O minuto vira um link que abre o vídeo exatamente nesse ponto.</span></div>`;
}
function drawerBody(c){
  const st=lstats(c);
  if(dtab==="aulas"){
    if(c.ext)return `<div class="ext-card"><b>Este curso fica fora do YouTube</b><span class="hint">${esc(c.topics||"")}${c.dur?` · ${esc(c.dur)}`:""}${c.ded?` · ${esc(c.ded)}`:""}</span><div><a class="btn pri" href="${c.url}" target="_blank" rel="noopener">Abrir o curso ↗</a></div><span class="hint">Marque o status acima quando começar e quando terminar.</span></div>`;
    if(c.gone)return `<div class="warn red">A playlist deste curso está vazia ou privada no YouTube. Vale avisar a comunidade para sugerir uma alternativa.</div><div><a class="btn" href="${c.url}" target="_blank" rel="noopener">Abrir link original ↗</a></div>`;
    if(!c.L.length)return `<div class="note-box">${esc(c.note||"Sem aulas listadas.")}</div>`;
    const nx=st.next>=0?c.L[st.next]:null;const q=norm(lq);
    const miss=c.pre.filter(p=>raw(p)!=="done");
    return (miss.length&&raw(c.id)!=="done"?`<div class="warn">Faltam ${miss.length} pré-requisito${miss.length>1?"s":""}. A recomendação é concluí-los antes, mas a ordem é sua.</div>`:"")
      +(nx?`<a class="next" href="${watchUrl(c,nx[0])}" target="_blank" rel="noopener"><span class="play">${PLAY}</span><span><small>${st.w?"Continuar":"Começar"} · aula ${st.next+1} · ${nx[1]}</small><b>${esc(nx[2])}</b></span></a>`:`<div class="note-box">Você marcou todas as ${st.n} aulas deste curso.</div>`)
      +`<div class="lhead"><span>${st.w} de ${st.n} assistidas · ${fmtH(c.total)} no total</span></div>
      <input class="field" id="lq" type="search" placeholder="Buscar aula…" value="${esc(lq)}" aria-label="Buscar aula">
      <ol class="ll" id="ll">${c.L.map((l,i)=>q&&!norm(l[2]).includes(q)?"":lessonRow(c,l,i,st)).join("")}</ol>`;
  }
  if(dtab==="exercicios"){
    const ex=c.L.map((l,i)=>[l,i]).filter(([l])=>isEx(l[2]));
    return `<p class="hint" style="margin:0">Aulas desta playlist com listas, exercícios resolvidos, provas, laboratórios e revisões.</p>`
      +(ex.length?`<ol class="ll">${ex.map(([l,i])=>lessonRow(c,l,i,st)).join("")}</ol>`:`<div class="empty">Nenhuma aula de exercícios identificada nesta playlist.</div>`)
      +(c.bk&&c.bk.length?`<div class="note-box">Os livros recomendados trazem listas de exercícios. Veja a aba Livros.</div>`:"")
      +`<div><b style="font-size:13px">Pratique também</b><div class="plat" style="margin-top:8px">${PLATS.slice(0,4).map(([n,u,d])=>`<a href="${u}" target="_blank" rel="noopener"><b>${n} ↗</b><span>${d}</span></a>`).join("")}</div></div>`;
  }
  if(dtab==="livros"){
    if(!(c.bk&&c.bk.length))return `<div class="empty">A ULivre ainda não listou livros para este curso.</div>`;
    return `<div class="shelf" style="grid-template-columns:1fr">${c.bk.map(bookCard).join("")}</div>`;
  }
  const all=c.L.flatMap((l,i)=>(S.lnotes[l[0]]||[]).map((n,k)=>({l,i,n,k})));
  return `<div><label class="lb" for="cnote">Anotações gerais do curso</label><textarea class="field" id="cnote" placeholder="Resumo, dúvidas, links úteis…">${esc(S.notes[c.id]||"")}</textarea></div>
    <div><b style="font-size:13px">Anotações por aula</b></div>`
    +(all.length?all.map(({l,i,n,k})=>`<div class="nl-item"><div class="h"><span class="num">Aula ${i+1}</span><span>${esc(l[2])}</span></div><div class="ln"><a class="ts" href="${watchUrl(c,l[0],n.s)}" target="_blank" rel="noopener">${n.t}</a><p>${esc(n.x)}</p><button data-delnote="${l[0]}:${k}" aria-label="Apagar">✕</button></div></div>`).join(""):`<div class="empty">Abra uma aula na aba Aulas e clique no lápis para anotar com o minuto do vídeo.</div>`);
}
const BCOL=["#5B3FD9","#0E7F7B","#B8306F","#0B6FA8","#B9530C","#A92B38","#4B7D0C","#8330B8","#2F3A8F","#7A5A12"];
function bookCard(i){
  const b=BOOKS[i],k="b"+i,s=S.books[k]||"";
  return `<div class="book"><button class="open" data-bookopen="${i}" aria-label="Abrir ${esc(b.t)}"><div class="cover" style="--bc:${BCOL[i%BCOL.length]}"><span>${esc(b.t)}</span><em>${esc((b.a||"").split(/[;,]/)[0])}</em></div></button>
  <div style="min-width:0">${b.free?'<span class="free">Grátis</span>':""}<button class="open" data-bookopen="${i}"><b>${esc(b.t)}</b></button><div class="au">${esc(b.a)}${b.y?` · ${esc(b.y)}`:""}${b.e?` · ${esc(b.e)}`:""}</div><div class="ds">${esc(b.d)}</div>
  <div class="bseg" role="group" aria-label="Status de leitura">${[["want","Quero ler"],["reading","Lendo"],["read","Lido"]].map(([v,l])=>`<button data-book="${k}" data-bv="${v}" aria-pressed="${s===v}">${l}</button>`).join("")}</div>
  <div style="margin-top:8px"><button class="btn sm" data-bookopen="${i}">${b.free?"Ler grátis":"Onde ler"}</button></div></div></div>`;
}
function rerenderBody(){const b=$("#drBody");if(b){const sc=b.scrollTop;b.innerHTML=drawerBody(C[sel]);b.scrollTop=sc;}}
$("#drawer").addEventListener("click",e=>{
  if(e.target.closest("#drClose"))return closeDrawer();
  const tb=e.target.closest("[data-tab]");if(tb){dtab=tb.dataset.tab;openNote=null;renderDrawer();return;}
  const nb=e.target.closest("[data-nb]");if(nb){openNote=openNote===nb.dataset.nb?null:nb.dataset.nb;rerenderBody();const f=document.getElementById("nx-"+openNote);if(f)f.focus();return;}
  const dn=e.target.closest("[data-delnote]");if(dn){const [v,k]=dn.dataset.delnote.split(":");S.lnotes[v].splice(+k,1);if(!S.lnotes[v].length)delete S.lnotes[v];save();rerenderBody();renderNav();return;}
});
$("#drawer").addEventListener("submit",e=>{
  const f=e.target.closest("[data-addnote]");if(!f)return;e.preventDefault();
  const v=f.dataset.addnote,x=f.x.value.trim();if(!x){f.x.focus();return;}
  const tt=f.t.value.trim();let s=0;
  if(tt){const p=tt.split(/[:.,h]/).map(n=>parseInt(n,10)||0);s=p.reduce((a,n)=>a*60+n,0);}
  const lbl=s>=3600?`${Math.floor(s/3600)}:${pad(Math.floor(s%3600/60))}:${pad(s%60)}`:`${Math.floor(s/60)}:${pad(s%60)}`;
  (S.lnotes[v]=S.lnotes[v]||[]).push({t:lbl,s,x,at:Date.now()});S.lnotes[v].sort((a,b)=>a.s-b.s);save();rerenderBody();renderNav();
  const nf=document.getElementById("nx-"+v);if(nf)nf.focus();toast("Anotação salva");
});
$("#drawer").addEventListener("input",e=>{
  if(e.target.id==="lq"){lq=e.target.value.trim();const c=C[sel],st=lstats(c),q=norm(lq);$("#ll").innerHTML=c.L.map((l,i)=>q&&!norm(l[2]).includes(q)?"":lessonRow(c,l,i,st)).join("");}
  if(e.target.id==="cnote"){const v=e.target.value;if(v)S.notes[sel]=v;else delete S.notes[sel];save();}
});

/* ---------- eventos globais ---------- */
document.addEventListener("change",e=>{
  const v=e.target.dataset&&e.target.dataset.w;if(!v)return;
  const cid=sel&&C[sel].L.some(l=>l[0]===v)?sel:(vidCourse.get(v)||[])[0];
  setWatched(v,e.target.checked,cid);
  toast(e.target.checked?"Aula marcada · revisão amanhã":"Aula desmarcada");
  refreshMain();
});
document.addEventListener("click",e=>{
  const go_=e.target.closest("#content [data-go]");if(go_){e.preventDefault();go(go_.dataset.go);return;}
  const stb=e.target.closest("[data-stat]");if(stb){e.stopPropagation();statusMenu(stb);return;}
  const op=e.target.closest("[data-open]");if(op&&!e.target.closest("a[href^='http']")){e.preventDefault();openCourse(op.dataset.open);return;}
  const vw=e.target.closest("[data-view]");if(vw){S.ui.views[route]=vw.dataset.view;save();render();return;}
  const fl=e.target.closest("[data-filt]");if(fl){filt=fl.dataset.filt;render();return;}
  const gp=e.target.closest("[data-grp]");if(gp){const k=gp.dataset.grp;S.ui.closed[k]=!S.ui.closed[k];save();gp.closest(".grp").classList.toggle("closed");gp.setAttribute("aria-expanded",!S.ui.closed[k]);return;}
  const bk=e.target.closest("[data-book]");if(bk){const k=bk.dataset.book,v=bk.dataset.bv;if(S.books[k]===v)delete S.books[k];else S.books[k]=v;save();
    bk.parentElement.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",S.books[k]===b.dataset.bv));if(route==="estante")refreshMain();return;}
  if(!e.target.closest("#pop"))$("#pop").hidden=true;
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("#pop").hidden)$("#pop").hidden=true;else if(!$("#results").hidden)$("#results").hidden=true;else if(sel)closeDrawer();}
  if(e.key==="Enter"&&e.target.matches(".kc,tr[data-open]"))openCourse(e.target.dataset.open);});
function statusMenu(btn){
  const id=btn.dataset.stat,p=$("#pop"),cur=raw(id);
  p.innerHTML=[["todo",status(id)==="locked"&&cur==="todo"?"locked":"avail","Não iniciado"],["doing","doing","Cursando"],["done","done","Concluído"]]
    .map(([v,s,l])=>`<button data-setst="${id}:${v}"><span class="pill" data-s="${s}">${l}</span>${cur===v?'<span style="margin-left:auto">✓</span>':""}</button>`).join("");
  p.hidden=false;const r=btn.getBoundingClientRect();
  p.style.left=Math.min(r.left,innerWidth-200)+"px";p.style.top=(r.bottom+6+p.offsetHeight>innerHeight?r.top-p.offsetHeight-6:r.bottom+6)+"px";
}
$("#pop").addEventListener("click",e=>{const b=e.target.closest("[data-setst]");if(!b)return;const [id,v]=b.dataset.setst.split(":");setStatus(id,v);$("#pop").hidden=true;toast(`Status: ${v==="todo"?"não iniciado":v==="doing"?"cursando":"concluído"}`);refreshMain();});
/* arrastar no quadro */
let dragId=null;
document.addEventListener("dragstart",e=>{const k=e.target.closest&&e.target.closest("[data-drag]");if(!k)return;dragId=k.dataset.drag;k.classList.add("dragging");try{e.dataTransfer.setData("text/plain",dragId);e.dataTransfer.effectAllowed="move";}catch(_){}});
document.addEventListener("dragend",e=>{document.querySelectorAll(".dragging,.over").forEach(x=>x.classList.remove("dragging","over"));});
document.addEventListener("dragover",e=>{const col=e.target.closest&&e.target.closest("[data-drop]");if(col&&dragId){e.preventDefault();document.querySelectorAll(".col.over").forEach(x=>x!==col&&x.classList.remove("over"));col.classList.add("over");}});
document.addEventListener("drop",e=>{const col=e.target.closest&&e.target.closest("[data-drop]");if(!col||!dragId)return;e.preventDefault();const k=col.dataset.drop;
  setStatus(dragId,k==="doing"?"doing":k==="done"?"done":"todo");if(k==="locked"&&status(dragId)!=="locked")toast("Este curso não tem pré-requisitos pendentes, então fica como disponível");dragId=null;refreshMain();});

/* ---------- busca global ---------- */
const gs=$("#gsearch"),res=$("#results");let ract=-1;
gs.addEventListener("input",()=>{
  const q=norm(gs.value.trim());if(q.length<2){res.hidden=true;return;}
  const cs=Object.values(C).filter(c=>norm(c.name).includes(q)).slice(0,6);
  const ls=[];for(const c of Object.values(C)){for(let i=0;i<c.L.length&&ls.length<10;i++)if(norm(c.L[i][2]).includes(q))ls.push([c,i]);if(ls.length>=10)break;}
  res.innerHTML=(cs.length?`<div class="rk">Cursos</div>`+cs.map(c=>`<button data-rs="${c.id}"><span class="dot" style="--tc:${tcolor(c.track)};background:var(--tc)"></span>${esc(c.name)}<small>${TR[c.track].short}</small></button>`).join(""):"")
    +(ls.length?`<div class="rk">Aulas</div>`+ls.map(([c,i])=>`<button data-rs="${c.id}"><span class="num hint">${i+1}</span><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.L[i][2])}</span><small>${esc(c.name.length>22?c.name.slice(0,21)+"…":c.name)}</small></button>`).join(""):"")
    ||`<div class="empty">Nada encontrado para “${esc(gs.value)}”.</div>`;
  res.hidden=false;ract=-1;
});
res.addEventListener("click",e=>{const b=e.target.closest("[data-rs]");if(!b)return;res.hidden=true;const id=b.dataset.rs;if(route!==C[id].track)go(C[id].track);openCourse(id);});
gs.addEventListener("keydown",e=>{const bs=[...res.querySelectorAll("[data-rs]")];if(!bs.length)return;
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();ract=(ract+(e.key==="ArrowDown"?1:-1)+bs.length)%bs.length;bs.forEach((b,i)=>b.classList.toggle("act",i===ract));}
  if(e.key==="Enter"&&ract>=0){e.preventDefault();bs[ract].click();}});
document.addEventListener("click",e=>{if(!e.target.closest(".top-search"))res.hidden=true;});

/* ---------- Plano de estudos ---------- */
function courseLoad(c){
  if(raw(c.id)==="done")return 0;
  if(c.L.length)return lstats(c).left*S.plan.factor;
  if(c.ext)return (c.estH||8)*3600;
  return 0;
}
function computePlan(){
  const P=S.plan,start=P.start||today();
  const order=[];P.tracks.forEach(tid=>{const t=TR[tid];if(t)t.groups.forEach(g=>g.items.forEach(id=>order.push(id)));});
  const rem={},fin={},beg={};order.forEach(id=>{rem[id]=courseLoad(C[id]);if(rem[id]<=0)fin[id]=-1;});
  const inPlan=new Set(order);
  const preOK=id=>C[id].pre.every(p=>!inPlan.has(p)?raw(p)==="done":fin[p]!==undefined);
  const daily=P.hours*3600/7;let day=0;
  while(order.some(id=>fin[id]===undefined)&&day<3650*2){
    let cap=daily;
    const act=order.filter(id=>fin[id]===undefined&&preOK(id)).slice(0,P.par);
    if(!act.length)break;
    act.forEach(id=>{if(beg[id]===undefined)beg[id]=day;});
    let share=cap/act.length,left=act.slice();
    while(cap>1e-6&&left.length){share=cap/left.length;const nl=[];left.forEach(id=>{const u=Math.min(share,rem[id]);rem[id]-=u;cap-=u;if(rem[id]<=1e-6)fin[id]=day;else nl.push(id);});if(nl.length===left.length)break;left=nl;}
    day++;
  }
  const rows=order.map(id=>({id,b:beg[id],e:fin[id]}));
  const miles=[];P.tracks.forEach(tid=>{const t=TR[tid];if(!t)return;t.groups.forEach(g=>{
    const ends=g.items.map(id=>fin[id]);const done=ends.every(x=>x===-1);const unk=ends.some(x=>x===undefined);
    const mx=Math.max(...ends.filter(x=>x!==undefined));
    miles.push({label:t.groups.length>1?`${t.short} · ${g.name}`:t.name,done,date:done?null:unk?null:addDays(start,mx<0?0:mx),track:tid});});});
  const endDay=Math.max(-1,...rows.map(r=>r.e??-1));
  return {rows,miles,start,endDay,total:order.reduce((a,id)=>a+courseLoad(C[id]),0)};
}
function pPlan(){
  const P=S.plan,plan=computePlan();
  const next=plan.miles.find(m=>!m.done);
  const lastDate=plan.endDay>=0?addDays(plan.start,plan.endDay):null;
  let h=`<div><h1 class="ph">Plano de estudos</h1><p class="sub">Diga quanto tempo você tem por semana e a plataforma monta o cronograma com a duração real das aulas que faltam, respeitando os pré-requisitos.</p></div>
`+`
  <div class="card headline">${P.tracks.length?
      (next&&next.date?`<span class="big">Você termina <em>${esc(next.label)}</em> em <em>${fmtMonth(next.date)}</em>.</span>`:next?`<span class="big">Escolha mais horas ou trilhas para estimar.</span>`:`<span class="big">Tudo concluído nas trilhas escolhidas. 🎉</span>`)
      +`<span class="hint">${lastDate?`Plano completo até ${fmtD(lastDate)} · ${fmtHours(plan.total)} horas de estudo restantes`:""}</span>`:`<span class="big">Escolha ao menos uma trilha.</span>`}</div>
  <div class="plan-grid"><div class="card"><div class="card-b form" style="padding-top:16px">
    <div><label class="lb" for="ph">Horas por semana</label><div class="range-row"><input type="range" id="ph" min="2" max="40" step="1" value="${P.hours}"><output class="num">${P.hours}h</output></div></div>
    <div><label class="lb" for="pf">Tempo de estudo por hora de vídeo</label><div class="range-row"><input type="range" id="pf" min="1" max="3" step="0.25" value="${P.factor}"><output class="num">${P.factor.toLocaleString("pt-BR")}×</output></div><span class="hint">Inclui pausas, exercícios e leitura. 1,5× é um bom começo.</span></div>
    <div><label class="lb" for="pp">Cursos em paralelo</label><div class="range-row"><input type="range" id="pp" min="1" max="5" step="1" value="${P.par}"><output class="num">${P.par}</output></div></div>
    <div><label class="lb" for="ps">Começar em</label><input class="field" type="date" id="ps" value="${P.start}"></div>
    <div><span class="lb">Trilhas no plano</span><div class="trk-pick">${TRACKS.map(t=>`<label style="--tc:${tcolor(t.id)}"><input type="checkbox" data-ptrack="${t.id}" ${P.tracks.includes(t.id)?"checked":""}><span class="dot"></span>${esc(t.name)}</label>`).join("")}</div><span class="hint">A ordem é: currículos primeiro, depois especializações.</span></div>
  </div></div>
  <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
    <div class="card"><div class="card-h"><h2>Marcos</h2></div><div class="card-b"><div class="mile-list">${plan.miles.map(m=>`<div class="mile ${m.done?"done":""}" style="--tc:${tcolor(m.track)}"><small>${esc(m.label)}</small><b>${m.done?"Concluído":m.date?fmtD(m.date):"—"}</b></div>`).join("")||'<div class="empty">Sem trilhas no plano.</div>'}</div></div></div>
    <div class="card"><div class="card-h"><h2>Esta semana</h2><span class="hint" style="margin-left:auto">${P.hours}h · próximas aulas na ordem do plano</span></div><div class="card-b"><div class="week">${weekList(plan)}</div></div></div>
    <div><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><b>Linha do tempo</b><span class="hint">a linha vermelha é hoje</span></div>${gantt(plan)}</div>
  </div></div>`;
  return h;
}
function weekList(plan){
  let cap=S.plan.hours*3600;const out=[];
  const act=plan.rows.filter(r=>r.e!==-1&&r.e!==undefined).sort((a,b)=>a.b-b.b).slice(0,S.plan.par);
  const per=act.length?cap/act.length:0;
  act.forEach(r=>{const c=C[r.id];let budget=per,k=0;const lim=Math.ceil(14/act.length);
    if(!c.L.length){out.push(`<div><span class="tag">${TR[c.track].short}</span><a href="#" data-open="${c.id}">${esc(c.name)} <span class="hint">(curso externo)</span></a><span class="num hint">${fmtH(Math.min(budget,courseLoad(c)))}</span></div>`);return;}
    for(const l of c.L){if(S.watched[l[0]])continue;const need=secs(l[1])*S.plan.factor;if(budget<need*0.5)break;budget-=need;if(k++>=lim)break;
      out.push(`<div><span class="tag">${TR[c.track].short}</span><a href="${watchUrl(c,l[0])}" target="_blank" rel="noopener">${esc(l[2])} <span class="hint">· ${esc(c.name)}</span></a><span class="num hint">${l[1]}</span></div>`);if(out.length>=14)break;}});
  return out.join("")||`<div class="empty">Nada pendente nas trilhas do plano.</div>`;
}
function gantt(plan){
  const rows=plan.rows.filter(r=>r.e!==-1&&r.b!==undefined);
  if(!rows.length)return `<div class="card"><div class="empty">Nada pendente para desenhar.</div></div>`;
  const D=Math.max(30,plan.endDay+14),px=Math.max(2,Math.min(8,900/D));const W=Math.ceil(D*px)+40;
  let axis="";const s0=parseD(plan.start);
  for(let m=0;;m++){const d=new Date(s0.getFullYear(),s0.getMonth()+m,1);const off=Math.round((d-s0)/864e5);if(off>D)break;if(off<0)continue;
    const step=D*px/ (D/30) <60?3:1;if(m%step)continue;axis+=`<span style="left:${off*px}px">${MES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}</span>`;}
  const tday=diffDays(plan.start,today());
  let body="",lastG=null;
  rows.forEach(r=>{const c=C[r.id],gk=c.track+c.g;
    if(gk!==lastG){lastG=gk;const t=TR[c.track];body+=`<div class="g-row gh"><b>${esc(t.groups.length>1?`${t.short} · ${t.groups[c.g].name}`:t.name)}</b></div>`;}
    const e=r.e===undefined?D:r.e;const w=Math.max(px*2,(e-r.b+1)*px);
    body+=`<div class="g-row"><div class="g-bar" data-open="${c.id}" style="--tc:${tcolor(c.track)};left:${r.b*px+4}px;width:${w}px" title="${esc(c.name)}: ${fmtD(addDays(plan.start,r.b))} → ${fmtD(addDays(plan.start,e))}">${esc(c.name)}</div></div>`;});
  return `<div class="gantt-wrap"><div class="gantt" style="width:${W}px"><div class="g-axis">${axis}</div>${tday>=0&&tday<=D?`<div class="g-today" style="left:${tday*px+4}px"></div>`:""}${body}</div></div>`;
}
document.addEventListener("input",e=>{
  const id=e.target.id;
  if(["ph","pf","pp"].includes(id)){const v=+e.target.value;S.plan[{ph:"hours",pf:"factor",pp:"par"}[id]]=v;e.target.nextElementSibling.textContent=id==="ph"?v+"h":id==="pf"?v.toLocaleString("pt-BR")+"×":v;save();clearTimeout(pPlan.t);pPlan.t=setTimeout(refreshMain,120);}
});
document.addEventListener("change",e=>{
  if(e.target.id==="ps"&&e.target.value){S.plan.start=e.target.value;save();refreshMain();}
  const pt=e.target.dataset&&e.target.dataset.ptrack;if(pt){const set=new Set(S.plan.tracks);e.target.checked?set.add(pt):set.delete(pt);S.plan.tracks=TRACKS.map(t=>t.id).filter(x=>set.has(x));save();refreshMain();}
});

/* ---------- Revisões ---------- */
function pReviews(){
  const due=reviewsDue();const up=Object.entries(S.reviews).filter(([,r])=>r.due>today()).sort((a,b)=>a[1].due.localeCompare(b[1].due));
  const item=([v,r],isDue)=>{const l=VIDS.get(v);if(!l)return "";const [cid,i]=vidCourse.get(v);const c=C[cid];const ns=S.lnotes[v]||[];
    return `<div class="rv-item"><div style="min-width:0"><div class="t">${esc(l[2])}</div><div class="m"><span class="tag"><span class="dot" style="--tc:${tcolor(c.track)};background:var(--tc)"></span>${esc(c.name)}</span><span>aula ${i+1}</span><span class="steps" title="Etapa ${r.step+1} de ${RI.length}">${RI.map((_,k)=>`<i class="${k<=r.step?"on":""}"></i>`).join("")}</span><span>${isDue?(r.due<today()?`atrasada desde ${fmtD(r.due)}`:"para hoje"):`em ${fmtD(r.due)}`}</span></div></div>
      <div class="acts">${isDue?`<a class="btn sm" href="${watchUrl(c,v)}" target="_blank" rel="noopener">Rever ↗</a><button class="btn sm pri" data-rvok="${v}">Revisei</button><button class="btn sm ghost" data-rvskip="${v}">Amanhã</button>`:`<button class="btn sm ghost" data-rvdel="${v}">Remover</button>`}</div>
      ${isDue&&ns.length?`<div class="rv-notes">${ns.map(n=>`<div class="ln"><a class="ts" href="${watchUrl(c,v,n.s)}" target="_blank" rel="noopener">${n.t}</a><p>${esc(n.x)}</p></div>`).join("")}</div>`:""}</div>`;};
  return `<div><h1 class="ph">Revisões</h1><p class="sub">Cada aula marcada como assistida volta para revisão depois de 1, 3, 7, 21 e 60 dias. Reveja os pontos principais ou suas anotações e marque como revisada.</p></div>
    <div class="card"><div class="card-h"><h2>Para hoje</h2><span class="hint" style="margin-left:auto">${due.length} aula${due.length===1?"":"s"}</span></div><div class="card-b"><div class="rv">${due.map(x=>item(x,true)).join("")||`<div class="empty">Nenhuma revisão pendente hoje.</div>`}</div></div></div>
    <div class="card"><div class="card-h"><h2>Próximas</h2><span class="hint" style="margin-left:auto">${up.length} agendada${up.length===1?"":"s"}${S.mastered?` · ${S.mastered} fixadas`:""}</span></div><div class="card-b"><div class="rv">${up.slice(0,30).map(x=>item(x,false)).join("")||`<div class="empty">Marque aulas como assistidas para agendar revisões.</div>`}${up.length>30?`<div class="hint">+${up.length-30} outras</div>`:""}</div></div></div>`;
}
document.addEventListener("click",e=>{
  const ok=e.target.closest("[data-rvok]"),sk=e.target.closest("[data-rvskip]"),dl=e.target.closest("[data-rvdel]");
  if(ok){const v=ok.dataset.rvok,r=S.reviews[v];r.step++;if(r.step>=RI.length){delete S.reviews[v];S.mastered++;toast("Aula fixada! Sem mais revisões.");}else{r.due=addDays(today(),RI[r.step]);toast(`Próxima revisão em ${RI[r.step]} dias`);}save();refreshMain();}
  if(sk){S.reviews[sk.dataset.rvskip].due=addDays(today(),1);save();refreshMain();}
  if(dl){delete S.reviews[dl.dataset.rvdel];save();refreshMain();}
});

/* ---------- Anotações ---------- */
let nq="";
function pNotes(){
  const items=[];Object.entries(S.lnotes).forEach(([v,ns])=>{const vc=vidCourse.get(v);if(!vc)return;ns.forEach((n,k)=>items.push({v,n,k,c:C[vc[0]],i:vc[1]}));});
  Object.entries(S.notes).forEach(([cid,x])=>{if(C[cid]&&x)items.push({gen:true,c:C[cid],x});});
  const q=norm(nq);const list=items.filter(it=>!q||norm((it.gen?it.x:it.n.x)+" "+it.c.name+(it.gen?"":" "+VIDS.get(it.v)[2])).includes(q)).sort((a,b)=>(b.gen?0:b.n.at)-(a.gen?0:a.n.at));
  return `<div><h1 class="ph">Anotações</h1><p class="sub">Tudo o que você anotou, com o minuto exato do vídeo. Para anotar, abra um curso e clique no lápis ao lado da aula.</p></div>
    <input class="field" id="nq" type="search" placeholder="Buscar nas anotações…" value="${esc(nq)}" style="max-width:420px" aria-label="Buscar nas anotações">
    <div class="notes-list">${list.map(it=>it.gen?`<div class="nl-item"><div class="h"><span class="tag">${TR[it.c.track].short}</span><a href="#" data-open="${it.c.id}">${esc(it.c.name)}</a><span>anotação geral</span></div><p style="margin:0;white-space:pre-wrap">${esc(it.x)}</p></div>`
      :`<div class="nl-item"><div class="h"><span class="tag">${TR[it.c.track].short}</span><a href="#" data-open="${it.c.id}">${esc(it.c.name)}</a><span>aula ${it.i+1}: ${esc(VIDS.get(it.v)[2])}</span><span style="margin-left:auto">${new Date(it.n.at).toLocaleDateString("pt-BR")}</span></div><div class="ln"><a class="ts" href="${watchUrl(it.c,it.v,it.n.s)}" target="_blank" rel="noopener">${it.n.t}</a><p>${esc(it.n.x)}</p></div></div>`).join("")
      ||`<div class="card"><div class="empty">${items.length?"Nada encontrado.":"Você ainda não fez anotações."}</div></div>`}</div>`;
}
document.addEventListener("input",e=>{if(e.target.id==="nq"){nq=e.target.value;const p=e.target.selectionStart;refreshMain();const f=$("#nq");f.focus();f.setSelectionRange(p,p);}});

/* ---------- Exercícios ---------- */
function pEx(){
  let total=0;
  const blocks=TRACKS.map(t=>{const cs=t.groups.flatMap(g=>g.items).map(id=>C[id]).map(c=>[c,c.L.map((l,i)=>[l,i]).filter(([l])=>isEx(l[2]))]).filter(([,x])=>x.length);
    if(!cs.length)return "";const n=cs.reduce((a,[,x])=>a+x.length,0);total+=n;
    return `<div style="display:flex;flex-direction:column;gap:8px"><h3 style="margin:6px 0 0;font-size:14px;display:flex;gap:8px;align-items:center"><span class="dot" style="--tc:${tcolor(t.id)}"></span>${esc(t.name)}<span class="hint num">${n}</span></h3>`
      +cs.map(([c,x])=>{const st=lstats(c);const w=x.filter(([l])=>S.watched[l[0]]).length;return `<details class="ex-c"><summary>${esc(c.name)}<span class="n">${w}/${x.length}</span></summary><ol class="ll" style="border:0;border-radius:0;border-top:1px solid var(--line2)">${x.map(([l,i])=>lessonRow(c,l,i,st,true)).join("")}</ol></details>`;}).join("")+`</div>`;}).join("");
  return `<div><h1 class="ph">Exercícios</h1><p class="sub">Listas, exercícios resolvidos, provas, laboratórios e revisões encontrados nas playlists de cada curso: ${total} aulas no total.</p></div>
    <div><b>Plataformas para praticar</b><div class="plat" style="margin-top:10px">${PLATS.map(([n,u,d])=>`<a href="${u}" target="_blank" rel="noopener"><b>${n} ↗</b><span>${d}</span></a>`).join("")}</div></div>${blocks}`;
}

/* ---------- Estante ---------- */
let bf="all",bq="";
function pShelf(){
  const cnt={all:BOOKS.length,free:BOOKS.filter(b=>b.free).length,want:0,reading:0,read:0};Object.values(S.books).forEach(v=>cnt[v]++);
  const q=norm(bq);const byC={};
  BOOKS.forEach((b,i)=>{const s=S.books["b"+i];if(bf==="free"?!b.free:bf!=="all"&&s!==bf)return;if(q&&!norm(b.t+" "+b.a+" "+C[b.c].name).includes(q))return;(byC[b.c]=byC[b.c]||[]).push(i);});
  const ids=Object.keys(byC);
  return `<div><h1 class="ph">Estante</h1><p class="sub">Os ${BOOKS.length} livros recomendados nos currículos (Ciência da Computação e Full Stack). Clique num livro para ver onde ler: ${BOOKS.filter(b=>b.free).length} têm versão gratuita oficial e os demais podem ser encontrados em prévia, empréstimo, bibliotecas ou sebos.</p></div>
    <div class="toolbar"><div class="chips">${[["all","Todos"],["free","Grátis"],["want","Quero ler"],["reading","Lendo"],["read","Lidos"]].map(([k,l])=>`<button class="chip" data-bf="${k}" aria-pressed="${bf===k}">${l}<span class="n">${cnt[k]}</span></button>`).join("")}</div><input class="field" id="bq" type="search" placeholder="Buscar título, autor ou cadeira…" value="${esc(bq)}" style="max-width:320px;margin-left:auto" aria-label="Buscar livros"></div>
    ${ids.map(cid=>`<div class="shelf-g"><h3><a href="#" data-open="${cid}" style="color:var(--ink);text-decoration:none">${esc(C[cid].name)}</a><span class="hint">${esc(TR[C[cid].track].groups[C[cid].g].name)}</span></h3><div class="shelf">${byC[cid].map(bookCard).join("")}</div></div>`).join("")||`<div class="card"><div class="empty">Nenhum livro nesta seleção.</div></div>`}`;
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-bf]");if(b){bf=b.dataset.bf;refreshMain();}});
document.addEventListener("input",e=>{if(e.target.id==="bq"){bq=e.target.value;const p=e.target.selectionStart;refreshMain();const f=$("#bq");f.focus();f.setSelectionRange(p,p);}});

/* ---------- ficha do livro ---------- */
let lastFocus=null;
function openBook(i){
  const b=BOOKS[i],q=encodeURIComponent(b.t+" "+(b.a||"").split(/[;,]/)[0]),isbn=b.isbn,k="b"+i,s=S.books[k]||"";
  const L=[];
  if(b.free)L.push(["go",b.free,"Ler grátis","Versão gratuita e oficial indicada pela ULivre"]);
  L.push(["",isbn?`https://books.google.com.br/books?vid=ISBN${isbn}`:`https://www.google.com/search?tbm=bks&q=${q}`,"Google Livros","Prévia de páginas, quando a editora libera"]);
  L.push(["",isbn?`https://openlibrary.org/isbn/${isbn}`:`https://openlibrary.org/search?q=${q}`,"Open Library","Empréstimo digital gratuito, quando disponível"]);
  L.push(["",isbn?`https://search.worldcat.org/search?q=bn:${isbn}`:`https://search.worldcat.org/search?q=${q}`,"Bibliotecas (WorldCat)","Encontre a biblioteca mais próxima com o livro"]);
  L.push(["",`https://www.estantevirtual.com.br/busca?q=${encodeURIComponent(b.t)}`,"Estante Virtual","Exemplares usados em sebos"]);
  L.push(["",`https://www.amazon.com.br/s?k=${isbn||q}`,"Amazon","Livro novo ou e-book"]);
  const m=$("#modal");lastFocus=document.activeElement;
  m.innerHTML=`<div class="mbox"><button class="x" data-mclose aria-label="Fechar">${ico("x")}</button>
    <div class="cover" style="--bc:${BCOL[i%BCOL.length]}"><span>${esc(b.t)}</span><em>${esc((b.a||"").split(/[;,]/)[0])}</em></div>
    <div style="min-width:0">${b.free?'<span class="free">Grátis</span>':""}<h2 id="mTitle">${esc(b.t)}</h2><div class="au hint">${esc(b.a||"Autor não informado")}${b.y?` · ${esc(b.y)}`:""}${b.e?` · ${esc(b.e)}`:""}${isbn?` · ISBN <span class="num">${isbn}</span>`:""}</div>
    <div style="margin-top:8px"><span class="tag">Recomendado em</span> <a href="#" data-open="${b.c}" data-mclose>${esc(C[b.c].name)}</a></div>
    <div class="bseg" role="group" aria-label="Status de leitura" style="margin:12px 0 14px">${[["want","Quero ler"],["reading","Lendo"],["read","Lido"]].map(([v,l])=>`<button data-book="${k}" data-bv="${v}" aria-pressed="${s===v}">${l}</button>`).join("")}</div>
    <b style="font-size:13px">Onde ler</b><div class="olinks">${L.map(([c,u,t,d])=>`<a class="${c}" href="${u}" target="_blank" rel="noopener"><b>${t} ↗</b><span>${d}</span></a>`).join("")}</div>
    ${b.free?"":`<p class="hint" style="margin:10px 0 0">Este livro tem direitos autorais. As opções acima levam a prévias, empréstimos e compras legais.</p>`}
    ${b.d?`<b style="font-size:13px;display:block;margin-top:16px">Sobre o livro</b><p class="dsc" style="margin-top:6px">${esc(b.d)}${b.d.length>=1400?"…":""}</p>`:""}</div></div>`;
  m.hidden=false;m.querySelector(".x").focus();
}
function closeBook(){const m=$("#modal");if(m.hidden)return;m.hidden=true;m.innerHTML="";if(lastFocus&&lastFocus.focus)lastFocus.focus();}
document.addEventListener("click",e=>{
  const o=e.target.closest("[data-bookopen]");if(o){e.preventDefault();openBook(+o.dataset.bookopen);return;}
  if(e.target.closest("[data-mclose]")||e.target.id==="modal")closeBook();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#modal").hidden){e.stopImmediatePropagation();closeBook();}},true);

/* ---------- Comece aqui ---------- */
function onbSteps(){
  const d=S.onb.done;
  return [
    {k:"aprender",t:"Aprenda a aprender",p:"Ser autodidata é ser responsável pelo próprio ensino. Antes de tudo, entenda como a memória funciona e como organizar o tempo de estudo.",
      links:[["Aprendendo a aprender (Coursera)","https://pt.coursera.org/learn/aprender"],["Como estudar do jeito certo","https://www.youtube.com/playlist?list=PL5TJqBvpXQv7Q2lT7L7BrTrh6tgZY872s"]],done:!!d.aprender},
    {k:"git",t:"Configure o Git e o GitHub",p:"Use o Git para organizar seus projetos de estudo e o GitHub como portfólio. Publique só o que os cursos permitem, e nunca plagie.",
      links:[["Git e GitHub para iniciantes","https://www.youtube.com/playlist?list=PLlAbYrWSYTiPA2iEiQ2PF_A9j__C4hi0A"],["Git e GitHub (Curso em Vídeo)","https://www.cursoemvideo.com/curso/curso-de-git-e-github/"]],done:!!d.git},
    {k:"trilha",t:"Escolha suas trilhas",p:"Ciência da Computação, Matemática, Full Stack Development e Inteligência Artificial são os currículos completos. As especializações aprofundam uma área depois da formação geral.",trilha:true,done:S.plan.tracks.length>0&&!!d.trilha},
    {k:"plano",t:"Monte seu plano",p:"Diga quantas horas por semana você tem e veja quando cada etapa termina.",go:"plano",done:!!d.plano},
    {k:"comunidade",t:"Entre na comunidade",p:"Estudar sozinho não é estudar isolado. Apresente-se no Telegram, tire dúvidas e encontre grupos de estudo.",
      links:[["Telegram da ULivre","https://t.me/universidadebrasileiralivre"],["Issues do currículo","https://github.com/Universidade-Livre/ciencia-da-computacao/issues"]],done:!!d.comunidade},
  ];
}
function pOnb(){
  const st=onbSteps(),n=st.filter(s=>s.done).length;
  return `<div class="hello"><div><h1 class="ph">Comece aqui</h1><p class="sub">Cinco passos para começar bem na Universidade Brasileira Livre.</p></div><div class="ring" style="--p:${n/5*100}"><span>${n}/5</span></div></div>
  <div class="onb">${st.map((s,i)=>`<div class="step ${s.done?"done":""}"><span class="sn">${s.done?"✓":i+1}</span><div><h3>${s.t}</h3><p>${s.p}</p>
    ${s.trilha?`<div class="trk-pick" style="flex-direction:row;flex-wrap:wrap;margin-bottom:10px">${TRACKS.map(t=>`<label style="--tc:${tcolor(t.id)}"><input type="checkbox" data-ptrack="${t.id}" ${S.plan.tracks.includes(t.id)?"checked":""}><span class="dot"></span>${esc(t.name)}</label>`).join("")}</div>`:""}
    <div class="links">${(s.links||[]).map(([l,u])=>`<a class="btn sm" href="${u}" target="_blank" rel="noopener">${l} ↗</a>`).join("")}${s.go?`<a class="btn sm" href="#${s.go}" data-go="${s.go}" data-onbgo="${s.k}">Abrir o plano</a>`:""}
    <button class="btn sm ${s.done?"":"pri"}" data-onb="${s.k}">${s.done?"Desmarcar":"Marcar como feito"}</button></div></div></div>`).join("")}
  ${n<5?`<button class="btn ghost" data-onbhide style="align-self:flex-start">${S.onb.hide?"Mostrar":"Ocultar"} o lembrete no Início</button>`:`<div class="card"><div class="card-b" style="padding-top:16px"><b>Tudo pronto!</b> <a href="#${S.plan.tracks[0]||"cc"}" data-go="${S.plan.tracks[0]||"cc"}">Abrir sua primeira trilha</a></div></div>`}</div>`;
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-onb]");if(b){const k=b.dataset.onb;S.onb.done[k]=!S.onb.done[k];save();refreshMain();}
  const g=e.target.closest("[data-onbgo]");if(g){S.onb.done[g.dataset.onbgo]=true;save();}
  if(e.target.closest("[data-onbhide]")){S.onb.hide=!S.onb.hide;save();refreshMain();}
});

/* ---------- início ---------- */
const h0=location.hash.slice(1);route=(PAGES[h0]||TR[h0])?h0:"inicio";
render();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(TR[route])drawEdges();});
