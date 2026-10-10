let mode=2,S=null,hist=[];
const $=id=>document.getElementById(id);
function show(el){el.classList.remove('hide','enter');void el.offsetWidth;el.classList.add('enter')}
function anim(el,c){el.classList.remove(c);void el.offsetWidth;el.classList.add(c)}
function setText(el,v,c){if(el.textContent!==String(v)){el.textContent=v;if(c)anim(el,c)}}
let best=1;
function setBest(n){best=n;[1,3,5].forEach(k=>$('f'+k).classList.toggle('on',k==n));if(typeof saveState==='function')saveState()}
function nextGame(){S.gameNo++;S.score=[0,0];S.gameOver=false;S.srv=(S.first+S.gameNo-1)%2;S.num=S.mode==2?2:1;render(true);anim($('game'),'swap')}
function setMode(m){mode=m;$('m1').classList.toggle('on',m==1);$('m2').classList.toggle('on',m==2);drawPlayers()}
function drawPlayers(){
 for(const t of ['a','b']){
  let h='';
  for(let i=1;i<=mode;i++){
   const old=$('p'+t+i)?$('p'+t+i).value:'';
   h+=`<label>Player ${i}</label><input id="p${t}${i}" value="${old}" placeholder="Player ${i} (${t.toUpperCase()})">`;
  }
  $('p'+t).innerHTML=h;
 }
}
drawPlayers();
let M=[],tabN=1,clrT;
try{M=JSON.parse(localStorage.getItem('drei_pikol_matches')||'[]')}catch(e){M=[]}
function persist(){try{localStorage.setItem('drei_pikol_matches',JSON.stringify(M))}catch(e){}}
const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function saveMatch(){
 if(!S.over||S.savedId)return;
 const id=Date.now();
 M.unshift({id,mode:S.mode,t:[...S.team],p:S.players.map(a=>[...a]),s:[S.games.reduce((t,g)=>t+g[0],0),S.games.reduce((t,g)=>t+g[1],0)],w:S.gw[0]>S.gw[1]?0:1,scorer:S.scorer,target:S.target,best:S.best,gw:[...S.gw],games:S.games.map(g=>[...g])});
 S.savedId=id;persist();
}
function ranking(){
 const m={};
 M.forEach(x=>[0,1].forEach(k=>{
  const key=x.t[k].toLowerCase();
  const r=m[key]||(m[key]={name:x.t[k],pl:0,w:0,l:0,pf:0,pa:0});
  r.pl++;r.pf+=x.s[k];r.pa+=x.s[1-k];x.w===k?r.w++:r.l++;
 }));
 return Object.values(m).sort((a,b)=>b.w-a.w||(b.pf-b.pa)-(a.pf-a.pa)||b.pf-a.pf||a.name.localeCompare(b.name));
}
function openDash(){drawDash();$('drawer').classList.add('on');$('scrim').classList.add('on')}
function closeDash(){$('drawer').classList.remove('on');$('scrim').classList.remove('on')}
function tab(n){tabN=n;$('t1').classList.toggle('on',n==1);$('t2').classList.toggle('on',n==2);drawDash();anim($('dbody'),'swap')}
function clearHist(){
 const b=$('clr');
 if(!M.length)return;
 if(b.dataset.arm){M=[];persist();delete b.dataset.arm;b.textContent='Clear history';if(S&&S.over)S.savedId=null;drawDash();return}
 b.dataset.arm=1;b.textContent='Tap again to confirm';
 clearTimeout(clrT);clrT=setTimeout(()=>{delete b.dataset.arm;b.textContent='Clear history'},3000);
}
function drawDash(){
 $('live').innerHTML=S?`<div class="live"><small>${S.over?'FINAL':'LIVE MATCH'}${S.best>1?' • BEST OF '+S.best:''} • ${S.mode==2?'DOUBLES':'SINGLES'}</small><div class="lr"><span>${esc(S.team[0])}</span><span>${S.score[0]}${S.best>1?` <small style="font-size:12px;opacity:.85">(G ${S.gw[0]})</small>`:''}</span></div><div class="lr"><span>${esc(S.team[1])}</span><span>${S.score[1]}${S.best>1?` <small style="font-size:12px;opacity:.85">(G ${S.gw[1]})</small>`:''}</span></div></div>`:'<div class="empty" style="padding:8px 0 14px">No match in progress</div>';
 let h='';
 if(tabN==1){
  const R=ranking();
  if(!R.length)h='<div class="empty">No finished matches yet.<br>Rankings appear after the first win.</div>';
  const medal=['🥇','🥈','🥉'];
  R.forEach((r,i)=>{
   const rate=Math.round(r.w/r.pl*100),d=r.pf-r.pa;
   h+=`<div class="rk ${i==0?'top1':''}"><div class="no"><i>${medal[i]||'🏓'}</i>Top ${i+1}</div><div class="nm"><b>${esc(r.name)}</b><small>${r.w}W - ${r.l}L • ${r.pf} pts • diff ${d>0?'+':''}${d}</small><div class="bar"><i style="width:${rate}%"></i></div></div><div class="pt">${r.w}</div></div>`;
  });
 }else{
  if(!M.length)h='<div class="empty">No results yet.<br>Finish a match to see it here.</div>';
  M.forEach(x=>{
   const d=new Date(x.id),when=d.toLocaleDateString([],{month:'short',day:'numeric'})+' '+d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
   h+=`<div class="res">${[0,1].map(k=>`<div class="r1 ${x.w===k?'w':''}"><span>${x.w===k?'🏆 ':''}${esc(x.t[k])} <small style="display:inline;margin:0">(${x.p[k].map(esc).join(' & ')})</small></span><span>${x.best>1?x.gw[k]:x.s[k]}</span></div>`).join('')}<small>${x.mode==2?'Doubles':'Singles'} • to ${x.target}${x.best>1?' • Best of '+x.best+' ('+x.games.map(g=>g.join('-')).join(', ')+')':''} • ${when}${x.scorer?' • Scorer: '+esc(x.scorer):''}</small></div>`;
  });
 }
 $('dbody').innerHTML=h;
 $('clr').classList.toggle('hide',!M.length);
}
let sysName='';
try{sysName=localStorage.getItem('drei_pikol_name')||''}catch(e){}
function saveState(){
 try{
  const form={};
  ['ta','tb','scorer','first','target'].forEach(id=>form[id]=$(id).value);
  ['a','b'].forEach(t=>{for(let i=1;i<=2;i++){const el=$('p'+t+i);if(el)form['p'+t+i]=el.value}});
  const screen=!$('game').classList.contains('hide')?'game':!$('setup').classList.contains('hide')?'setup':'welcome';
  localStorage.setItem('drei_pikol_state',JSON.stringify({sys:sysName,mode,best,form,screen,S,hist,tab:tabN}));
 }catch(e){}
}
function enterApp(){
 const el=$('sysin'),v=el.value.trim();
 if(!v){el.classList.remove('err');void el.offsetWidth;el.classList.add('err');el.focus();notify('Name needed','Please enter a name for your pickleball system.');return}
 sysName=v;try{localStorage.setItem('drei_pikol_name',v)}catch(e){}
 $('sysname').textContent=v;document.title=v;
 $('welcome').classList.add('hide');$('brand').classList.remove('hide');
 show($(S?'game':'setup'));
 saveState();
}
function renameSys(){
 $('sysin').value=sysName;
 ['game','setup','brand'].forEach(id=>$(id).classList.add('hide'));
 show($('welcome'));saveState();
}
document.addEventListener('input',saveState);
document.addEventListener('change',saveState);
document.addEventListener('visibilitychange',saveState);
window.addEventListener('pagehide',saveState);
let saved=null;
try{saved=JSON.parse(localStorage.getItem('drei_pikol_state')||'null')}catch(e){}
$('sysin').value=sysName;
if(saved&&saved.sys){
 sysName=saved.sys;$('sysin').value=sysName;$('sysname').textContent=sysName;document.title=sysName;
 setMode(saved.mode||2);setBest(saved.best||1);
 Object.keys(saved.form||{}).forEach(id=>{const el=$(id);if(el)el.value=saved.form[id]});
 tabN=saved.tab||1;$('t1').classList.toggle('on',tabN==1);$('t2').classList.toggle('on',tabN==2);
 if(saved.S){S=saved.S;hist=saved.hist||[]}
 const sc=saved.screen==='game'&&S?'game':saved.screen==='setup'?'setup':'welcome';
 if(sc==='welcome'){show($('welcome'))}
 else{$('welcome').classList.add('hide');$('brand').classList.remove('hide');show($(sc))}
 if(S)render(true);
 saveState();
}else{show($('welcome'))}
let curT;
function wake(){document.body.classList.remove('idle');clearTimeout(curT);curT=setTimeout(()=>document.body.classList.add('idle'),1500)}
['mousemove','mousedown','wheel'].forEach(ev=>document.addEventListener(ev,wake,{passive:true}));
['touchstart','keydown'].forEach(ev=>document.addEventListener(ev,()=>{clearTimeout(curT);document.body.classList.add('idle')},{passive:true}));
curT=setTimeout(()=>document.body.classList.add('idle'),1500);
let tt;
function notify(title,msg){$('toastmsg').innerHTML='<b>'+title+'</b>'+msg;const t=$('toast');t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),4200)}
document.addEventListener('input',e=>{if(e.target.classList)e.target.classList.remove('err')});
function start(){
 const need=[],bad=[];
 [['ta','Team A name'],['tb','Team B name']].forEach(([id,l])=>{if(!$(id).value.trim()){need.push(l);bad.push($(id))}});
 ['a','b'].forEach(t=>{for(let i=1;i<=mode;i++){const el=$('p'+t+i);if(!el.value.trim()){need.push(`Team ${t.toUpperCase()} Player ${i}`);bad.push(el)}}});
 if(need.length){
  bad.forEach(el=>{el.classList.remove('err');void el.offsetWidth;el.classList.add('err')});
  bad[0].focus();bad[0].scrollIntoView({behavior:'smooth',block:'center'});
  notify('Missing info',need.length>3?`Please fill in all team and player names (${need.length} missing).`:'Please enter: '+need.join(', ')+'.');
  return;
 }
 const names=[[],[]];
 ['a','b'].forEach((t,k)=>{for(let i=1;i<=mode;i++)names[k].push($('p'+t+i).value.trim()||`${t.toUpperCase()}${i}`)});
 const first=+$('first').value;
 S={mode,target:+$('target').value,team:[$('ta').value.trim()||'Team A',$('tb').value.trim()||'Team B'],
    players:names,first,scorer:$('scorer').value.trim(),score:[0,0],srv:first,num:mode==2?2:1,over:false,best,gw:[0,0],games:[],gameNo:1,gameOver:false};
 hist=[];
 $('setup').classList.add('hide');show($('game'));render(true);
}
function rally(w){
 if(S.over||S.gameOver)return;
 hist.push(JSON.stringify(S));
 if(w===S.srv){S.score[w]++}
 else if(S.mode==2&&S.num==1){S.num=2}
 else{S.srv=w;S.num=1}
 const [a,b]=S.score;
 if(Math.max(a,b)>=S.target&&Math.abs(a-b)>=2){
  const g=a>b?0:1;S.gw[g]++;S.games.push([a,b]);
  if(S.gw[g]>=Math.ceil(S.best/2)){S.over=true;saveMatch()}else S.gameOver=true;
 }
 render();
}
function undo(){if(hist.length){const sid=S.savedId;S=JSON.parse(hist.pop());if(sid){M=M.filter(x=>x.id!==sid);persist()}render()}}
function openNew(){const b=$('newbox');b.classList.remove('hide');anim(b,'popin');b.scrollIntoView({behavior:'smooth',block:'nearest'})}
function rematch(){S.score=[0,0];S.srv=S.first;S.num=S.mode==2?2:1;S.over=false;S.savedId=null;S.gw=[0,0];S.games=[];S.gameNo=1;S.gameOver=false;hist=[];$('newbox').classList.add('hide');$('end').classList.add('hide');render(true);anim($('game'),'swap')}
function newSetup(){S=null;hist=[];drawDash();$('newbox').classList.add('hide');$('end').classList.add('hide');$('game').classList.add('hide');show($('setup'));saveState()}
function render(first){
 drawDash();saveState();
 const r=1-S.srv;
 $('meta').textContent=`${S.mode==2?'Doubles':'Singles'} • ${S.best>1?'Best of '+S.best+' • Game '+S.gameNo+' • ':''}to ${S.target}, win by 2`+(S.scorer?` • Scorer: ${S.scorer}`:'');
 $('na').textContent=S.team[0];$('nb').textContent=S.team[1];
 $('pla').textContent=S.players[0].join(' & ');$('plb').textContent=S.players[1].join(' & ');
 setText($('sa'),S.score[0],first?null:'bump');setText($('sb'),S.score[1],first?null:'bump');
 $('va').classList.toggle('on',S.srv==0&&!S.over&&!S.gameOver);$('vb').classList.toggle('on',S.srv==1&&!S.over&&!S.gameOver);
 const call=[S.score[S.srv],S.score[r]].concat(S.mode==2?[S.num]:[]).join(' - ');
 setText($('call'),(S.over||S.gameOver)?'':call,'swap');
 const sp=S.players[S.srv][S.mode==2?S.num-1:0];
 const side=S.score[S.srv]%2==0?'right':'left';
 setText($('who'),(S.over||S.gameOver)?'':`${sp} serves from the ${side}`,'swap');
 $('ba').textContent=`Rally: ${S.team[0]}`;$('bb').textContent=`Rally: ${S.team[1]}`;
 $('ba').disabled=$('bb').disabled=S.over||S.gameOver;
 setText($('ga'),S.best>1?`Games won: ${S.gw[0]}`:'');setText($('gb'),S.best>1?`Games won: ${S.gw[1]}`:'');
 const gd=$('gend'),gh=gd.classList.contains('hide');gd.classList.toggle('hide',!S.gameOver);
 if(S.gameOver){const L=S.games[S.games.length-1],w=L[0]>L[1]?0:1;gd.innerHTML=`<h2>🎉 ${esc(S.team[w])} wins Game ${S.games.length}</h2><div>${L[0]} – ${L[1]}</div><div style="margin:8px 0 14px;color:var(--mut)">Games: ${S.gw[0]} – ${S.gw[1]}</div><button class="btn" onclick="nextGame()">Next game ▶</button>`;if(gh)anim(gd,'popin')}
 const e=$('end');const wasHidden=e.classList.contains('hide');e.classList.toggle('hide',!S.over);if(S.over&&wasHidden)anim(e,'popin');
 if(S.over){const w=S.gw[0]>S.gw[1]?0:1;e.innerHTML=`<h2>🏆 ${esc(S.team[w])} wins!</h2>${S.best>1?`<div>Games ${S.gw[0]} – ${S.gw[1]}</div><div style="color:var(--mut);font-size:13px;margin-top:4px">${S.games.map(g=>g[0]+'-'+g[1]).join(' • ')}</div>`:`<div>${S.score[0]} – ${S.score[1]}</div>`}<div class="row" style="margin-top:16px"><button class="btn" onclick="rematch()">🔁 Rematch<br><small style="font-weight:400;font-size:12px">same teams</small></button><button class="btn" style="background:var(--b)" onclick="newSetup()">🆕 New match<br><small style="font-weight:400;font-size:12px">change setup</small></button></div>`}
}