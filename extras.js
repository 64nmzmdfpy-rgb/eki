(()=>{
const X_BACKUP='uranai-ledger-last-backup-v1';
const X_RETURN='uranai-index-return-v1';
function xToday(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function xNorm(s){return String(s||'').normalize('NFKC').toLowerCase().replace(/[\s　。、！？!?.,・「」『』（）()［\][\]{}【】<>＜＞:：;；'"’”“`]/g,'')}
function xDupes(q){const n=xNorm(q);if(!n)return[];return logs.filter(x=>xNorm(x.q)===n)}
function xBackupText(){const s=localStorage.getItem(X_BACKUP);return s?`最終バックアップ記録：${new Date(s).toLocaleString()}`:'最終バックアップ記録：まだありません'}
function xRefreshBackup(){let el=document.getElementById('xLastBackup');if(!el){const host=document.getElementById('backupStatus');if(!host)return;el=document.createElement('div');el.id='xLastBackup';el.className='status';host.after(el)}el.textContent=xBackupText()}
function xRefreshOverdue(){const n=logs.filter(x=>x.check&&(x.grade||'未判定')==='未判定'&&x.check<xToday()).length;let el=document.getElementById('xOverdue');if(!el){el=document.createElement('section');el.id='xOverdue';el.className='panel';const main=document.querySelector('main');main.insertBefore(el,main.firstChild)}el.style.display=n?'block':'none';el.innerHTML=n?`<div class="title">期限切れ未判定</div><div style="font-weight:700;margin-top:6px">${n}件あります</div><button type="button" style="width:100%;margin-top:10px" onclick="location.href='search-all.html?v=20260917-4'">確認する</button>`:''}
function xSetupQuestionCheck(){const q=document.getElementById('q'),cast=document.getElementById('cast');if(!q||!cast)return;let info=document.getElementById('xDupeInfo');if(!info){info=document.createElement('div');info.id='xDupeInfo';info.className='status';q.after(info)}const refresh=()=>{const v=q.value.trim(),m=xDupes(v);info.textContent=v&&m.length?`同文・軽い表記ゆれ一致：${m.length}件（通算 #${m.map(x=>x.seq).join(', #')}）`:''};q.addEventListener('input',refresh);cast.addEventListener('click',ev=>{const m=xDupes(q.value.trim());if(m.length&&!confirm(`似た質問が${m.length}件あります。それでも占う？`)){ev.preventDefault();ev.stopImmediatePropagation()}},true)}
function xRecoverCreatedAt(){let changed=false;for(const item of logs){if(item.createdAt)continue;const m=String(item.id||'').match(/^L(\d{13})$/);if(!m)continue;const ms=Number(m[1]),d=new Date(ms);if(!Number.isFinite(ms)||Number.isNaN(d.getTime()))continue;const date=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;if(item.date&&item.date!==date)continue;item.createdAt=d.toISOString();changed=true}if(changed)saveLocal()}
function xTimeText(item){if(!item.createdAt)return'';const d=new Date(item.createdAt);if(Number.isNaN(d.getTime()))return'';return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
function xSaveReturn(item){try{sessionStorage.setItem(X_RETURN,JSON.stringify({scrollY:window.scrollY,selected,viewY,viewM,seq:item.seq,at:Date.now()}))}catch(e){}}
function xRestoreReturn(){const p=new URLSearchParams(location.search);if(p.get('return')!=='1')return;let state=null;try{state=JSON.parse(sessionStorage.getItem(X_RETURN)||'null')}catch(e){}if(!state)return;if(state.selected){selected=state.selected;const parts=String(state.selected).split('-').map(Number);if(parts.length>=2&&parts[0]&&parts[1]){viewY=parts[0];viewM=parts[1]}}render();requestAnimationFrame(()=>requestAnimationFrame(()=>{window.scrollTo(0,Math.max(0,Number(state.scrollY)||0));try{sessionStorage.removeItem(X_RETURN)}catch(e){}history.replaceState(null,'',location.pathname)}))}
function xEnhanceCards(){xRecoverCreatedAt();document.querySelectorAll('#cards .card').forEach(card=>{if(card.dataset.xEnhanced)return;const num=card.querySelector('.numline'),n=num?.textContent||'',m=n.match(/通算\s*#(\d+)/),seq=m?Number(m[1]):null,item=logs.find(x=>Number(x.seq)===seq);if(!item)return;card.dataset.xEnhanced='1';const t=xTimeText(item);if(t&&num&&!num.textContent.includes(t))num.textContent+=` ／ ${t}`;card.style.position='relative';card.style.paddingRight='52px';const mark=document.createElement('button');mark.type='button';mark.textContent=item.important?'★':'☆';mark.setAttribute('aria-label',item.important?'重要を解除':'重要にする');mark.title=item.important?'重要を解除':'重要にする';mark.style.cssText='position:absolute;top:10px;right:10px;width:auto;border:0;background:transparent;font-size:24px;padding:4px 6px;line-height:1';mark.onclick=()=>{item.important=!item.important;saveLocal();render()};card.append(mark);const toggle=card.querySelector('.toggle');if(toggle){const row=document.createElement('div');row.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px';toggle.style.marginTop='0';toggle.parentNode.insertBefore(row,toggle);row.append(toggle);const link=document.createElement('a');link.href=`result.html?seq=${encodeURIComponent(item.seq||'')}&from=index`;link.textContent='この占いを開く →';link.style.cssText='display:flex;align-items:center;justify-content:center;text-align:center;border:1px solid #bbb;border-radius:12px;padding:11px 10px;font-size:13px;font-weight:700;text-decoration:none;color:inherit;box-sizing:border-box';link.addEventListener('click',()=>xSaveReturn(item));row.append(link)}})}
function xNthMonday(y,m,n){const first=new Date(y,m-1,1),offset=(8-first.getDay())%7;return 1+offset+(n-1)*7}
function xVernal(y){return Math.floor(20.8431+0.242194*(y-1980)-Math.floor((y-1980)/4))}
function xAutumnal(y){return Math.floor(23.2488+0.242194*(y-1980)-Math.floor((y-1980)/4))}
function xBaseHolidays(y){const s=new Set(),add=(m,d)=>s.add(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);add(1,1);add(1,xNthMonday(y,1,2));add(2,11);if(y>=2020)add(2,23);add(3,xVernal(y));add(4,29);add(5,3);add(5,4);add(5,5);add(7,xNthMonday(y,7,3));add(8,11);add(9,xNthMonday(y,9,3));add(9,xAutumnal(y));add(10,xNthMonday(y,10,2));add(11,3);add(11,23);return s}
function xHolidaySet(y){const s=xBaseHolidays(y);for(const k of [...s]){const [yy,mm,dd]=k.split('-').map(Number),d=new Date(yy,mm-1,dd);if(d.getDay()===0){let t=new Date(d);do{t.setDate(t.getDate()+1)}while(s.has(`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`));s.add(`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`)}}for(let m=1;m<=12;m++){const days=new Date(y,m,0).getDate();for(let d=2;d<days;d++){const k=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`,p=`${y}-${String(m).padStart(2,'0')}-${String(d-1).padStart(2,'0')}`,n=`${y}-${String(m).padStart(2,'0')}-${String(d+1).padStart(2,'0')}`;if(!s.has(k)&&s.has(p)&&s.has(n))s.add(k)}}return s}
function xPaintCalendar(){const week=document.querySelector('.week');if(week&&week.children[0])week.children[0].style.color='#d00';const holidays=xHolidaySet(viewY);document.querySelectorAll('#calendar .day').forEach(btn=>{const d=Number(btn.querySelector('b')?.textContent||0);if(!d)return;const k=`${viewY}-${String(viewM).padStart(2,'0')}-${String(d).padStart(2,'0')}`,sun=new Date(viewY,viewM-1,d).getDay()===0;btn.style.color=(sun||holidays.has(k))?'#d00':''})}

function xHexNo(item){const m=String(item.ben||'').match(/^\\s*(\\d{1,2})\\b/);return m?Number(m[1]):null}
function xHexName(item){return String(item.ben||'').replace(/^\\s*\\d{1,2}\\s*/,'').trim()||'名称不明'}
function xVerdictText(item){return item.formalVerdict||parseLeoVerdict(item.leoRead)||'未設定'}
function xAnalyticsHost(){
  let el=document.getElementById('xAnalytics');
  if(el)return el;
  el=document.createElement('section');
  el.id='xAnalytics';
  el.className='panel';
  const searchPanel=document.getElementById('search')?.closest('.panel');
  if(searchPanel)searchPanel.after(el);
  else document.querySelector('main')?.append(el);
  return el
}
function xHeatLevel(n,max){
  if(!max||!n)return 0;
  return Math.max(1,Math.ceil((n/max)*5))
}
function xRenderAnalytics(){
  xRecoverCreatedAt();
  const host=xAnalyticsHost();
  if(!host)return;

  const hours=Array(24).fill(0);
  let timed=0;
  for(const item of logs){
    if(!item.createdAt)continue;
    const d=new Date(item.createdAt);
    if(Number.isNaN(d.getTime()))continue;
    hours[d.getHours()]++;timed++
  }
  const maxHour=Math.max(0,...hours);
  const heat=hours.map((n,h)=>{
    const lv=xHeatLevel(n,maxHour);
    const alpha=lv?0.10+lv*0.12:0.03;
    return `<div title="${h}時台：${n}件" style="border:1px solid #bbb;border-radius:10px;padding:7px 2px;text-align:center;background:rgba(127,127,127,${alpha})"><b style="display:block;font-size:12px">${h}</b><span style="font-size:12px">${n}</span></div>`
  }).join('');

  const hexMap=new Map();
  for(const item of logs){
    const no=xHexNo(item);if(!no)continue;
    const key=no;
    if(!hexMap.has(key))hexMap.set(key,{no,name:xHexName(item),n:0});
    hexMap.get(key).n++
  }
  const rank=[...hexMap.values()].sort((a,b)=>b.n-a.n||a.no-b.no).slice(0,10);
  const rankHtml=rank.length?rank.map((x,i)=>`<div style="display:grid;grid-template-columns:28px 1fr auto;gap:8px;padding:7px 0;border-bottom:1px solid rgba(127,127,127,.22)"><b>${i+1}</b><span>${x.no} ${esc(x.name)}</span><b>${x.n}回</b></div>`).join(''):'まだデータがありません';

  const groups=new Map();
  for(const item of logs){
    const n=xNorm(item.q);if(!n)continue;
    if(!groups.has(n))groups.set(n,[]);
    groups.get(n).push(item)
  }
  const repeated=[...groups.values()].filter(a=>a.length>=2).sort((a,b)=>b.length-a.length||Math.max(...b.map(x=>Number(x.seq)||0))-Math.max(...a.map(x=>Number(x.seq)||0))).slice(0,12);
  const historyHtml=repeated.length?repeated.map(a=>{
    const sorted=[...a].sort((x,y)=>(Number(x.seq)||0)-(Number(y.seq)||0));
    const q=sorted[sorted.length-1].q;
    const seqs=sorted.map(x=>`#${esc(x.seq)} ${esc(xVerdictText(x))}`).join(' → ');
    return `<div style="padding:9px 0;border-bottom:1px solid rgba(127,127,127,.22)"><div style="font-weight:700">${esc(q)}</div><div class="status">${a.length}回 ／ ${seqs}</div></div>`
  }).join(''):'同一質問の複数履歴はまだありません';

  host.innerHTML=`
    <div class="title">分析</div>
    <details open style="margin-top:10px">
      <summary style="font-weight:700;cursor:pointer">時間帯ヒートマップ</summary>
      <div class="status" style="margin:6px 0">時刻を復元できた ${timed}件を集計</div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px">${heat}</div>
    </details>
    <details style="margin-top:14px">
      <summary style="font-weight:700;cursor:pointer">本卦ランキング TOP10</summary>
      <div style="margin-top:6px">${rankHtml}</div>
    </details>
    <details style="margin-top:14px">
      <summary style="font-weight:700;cursor:pointer">同一質問の履歴</summary>
      <div class="status" style="margin:6px 0">表記ゆれを軽く正規化して、2回以上ある質問を表示</div>
      <div>${historyHtml}</div>
    </details>`;
}
let xAnalyticsTimer=0;
function xScheduleAnalytics(){clearTimeout(xAnalyticsTimer);xAnalyticsTimer=setTimeout(xRenderAnalytics,40)}

const obs=new MutationObserver(()=>{xEnhanceCards();xPaintCalendar();xScheduleAnalytics()});const cards=document.getElementById('cards');if(cards)obs.observe(cards,{childList:true,subtree:true});const cal=document.getElementById('calendar');if(cal)obs.observe(cal,{childList:true,subtree:true});
document.getElementById('backup')?.addEventListener('click',()=>{localStorage.setItem(X_BACKUP,new Date().toISOString());setTimeout(xRefreshBackup,0)});
xSetupQuestionCheck();xRecoverCreatedAt();xRefreshBackup();xRefreshOverdue();xEnhanceCards();xPaintCalendar();xRenderAnalytics();xRestoreReturn();
})();