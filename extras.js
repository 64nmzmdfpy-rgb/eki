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
function xRankRows(rows,labelFn,valueFn,limit=10){
  const a=[...rows].slice(0,limit);
  return a.length?a.map((x,i)=>`<div style="display:grid;grid-template-columns:28px 1fr auto;gap:8px;padding:7px 0;border-bottom:1px solid rgba(127,127,127,.22)"><b>${i+1}</b><span>${esc(labelFn(x))}</span><b>${esc(valueFn(x))}</b></div>`).join(''):'まだデータがありません'
}
function xZhiParts(item){
  const m=String(item.zhi||'').match(/^\\s*(\\d{1,2})\\s*(.*)$/);
  return m?{no:Number(m[1]),name:m[2].trim()||'名称不明'}:null
}
function xPersonCandidates(q){
  const text=String(q||'').normalize('NFKC');
  const stop=new Set(['これ','それ','あれ','どれ','ここ','そこ','あそこ','今日','明日','昨日','今回','今後','最終','平均','仕事','結婚','共演','ドラマ','視聴率','質問','正式','判定','本当に','可能性','場合','世間','人気','事務所','メンバー','タイトル','年内','来年','相手','子供','交際','連絡先','朝ドラ','全話']);
  const out=[];
  const re=/([一-龯々ヶヵぁ-んァ-ヶー]{2,8})(?=(?:は|が|と|の|を|に|から|より|へ|も))/g;
  for(const m of text.matchAll(re)){
    const v=m[1].replace(/^(その|この|あの)/,'');
    if(v.length>=2&&!stop.has(v)&&!/^\\d+$/.test(v))out.push(v)
  }
  return [...new Set(out)]
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
  const hourRank=hours.map((n,h)=>({h,n})).filter(x=>x.n).sort((a,b)=>b.n-a.n||a.h-b.h);
  const hourRankHtml=xRankRows(hourRank,x=>`${x.h}時台`,x=>`${x.n}件`);

  const hexMap=new Map(),zhiMap=new Map(),moveMap=new Map();
  for(const item of logs){
    const no=xHexNo(item);
    if(no){
      if(!hexMap.has(no))hexMap.set(no,{no,name:xHexName(item),n:0});
      hexMap.get(no).n++
    }
    const z=xZhiParts(item);
    if(z){
      if(!zhiMap.has(z.no))zhiMap.set(z.no,{...z,n:0});
      zhiMap.get(z.no).n++
    }
    const mv=String(item.move||'').trim();
    if(mv&&mv!=='なし'){
      for(const part of mv.split('・')){
        const k=part.trim();if(!k)continue;
        moveMap.set(k,(moveMap.get(k)||0)+1)
      }
    }
  }
  const hexRank=[...hexMap.values()].sort((a,b)=>b.n-a.n||a.no-b.no);
  const zhiRank=[...zhiMap.values()].sort((a,b)=>b.n-a.n||a.no-b.no);
  const moveRank=[...moveMap.entries()].map(([name,n])=>({name,n})).sort((a,b)=>b.n-a.n||a.name.localeCompare(b.name,'ja'));
  const rankHtml=xRankRows(hexRank,x=>`${x.no} ${x.name}`,x=>`${x.n}回`);
  const zhiHtml=xRankRows(zhiRank,x=>`${x.no} ${x.name}`,x=>`${x.n}回`);
  const moveHtml=xRankRows(moveRank,x=>x.name,x=>`${x.n}回`);

  const groups=new Map();
  for(const item of logs){
    const n=xNorm(item.q);if(!n)continue;
    if(!groups.has(n))groups.set(n,[]);
    groups.get(n).push(item)
  }
  const repeated=[...groups.values()].filter(a=>a.length>=2).sort((a,b)=>b.length-a.length||Math.max(...b.map(x=>Number(x.seq)||0))-Math.max(...a.map(x=>Number(x.seq)||0)));
  const questionRankHtml=xRankRows(repeated,a=>a[a.length-1].q,a=>`${a.length}回`);
  const historyHtml=repeated.length?repeated.slice(0,12).map(a=>{
    const sorted=[...a].sort((x,y)=>(Number(x.seq)||0)-(Number(y.seq)||0));
    const q=sorted[sorted.length-1].q;
    const seqs=sorted.map(x=>`#${esc(x.seq)} ${esc(xVerdictText(x))}`).join(' → ');
    return `<div style="padding:9px 0;border-bottom:1px solid rgba(127,127,127,.22)"><div style="font-weight:700">${esc(q)}</div><div class="status">${a.length}回 ／ ${seqs}</div></div>`
  }).join(''):'同一質問の複数履歴はまだありません';

  const verdictCounts={YES:0,NO:0,'中立':0,'未設定':0};
  for(const item of logs){
    const v=xVerdictText(item);
    if(v==='YES')verdictCounts.YES++;
    else if(v==='NO')verdictCounts.NO++;
    else if(v==='中立')verdictCounts['中立']++;
    else verdictCounts['未設定']++
  }
  const decided=verdictCounts.YES+verdictCounts.NO+verdictCounts['中立'];
  const pct=n=>decided?((n/decided)*100).toFixed(1)+'%':'0.0%';
  const verdictHtml=[
    {label:'YES',n:verdictCounts.YES,p:pct(verdictCounts.YES)},
    {label:'NO',n:verdictCounts.NO,p:pct(verdictCounts.NO)},
    {label:'中立',n:verdictCounts['中立'],p:pct(verdictCounts['中立'])}
  ].sort((a,b)=>b.n-a.n).map((x,i)=>`<div style="display:grid;grid-template-columns:28px 1fr auto;gap:8px;padding:7px 0;border-bottom:1px solid rgba(127,127,127,.22)"><b>${i+1}</b><span>${x.label}</span><b>${x.n}件・${x.p}</b></div>`).join('');

  const personMap=new Map();
  for(const item of logs){
    for(const name of xPersonCandidates(item.q))personMap.set(name,(personMap.get(name)||0)+1)
  }
  const personRank=[...personMap.entries()].map(([name,n])=>({name,n})).filter(x=>x.n>=2).sort((a,b)=>b.n-a.n||a.name.localeCompare(b.name,'ja'));
  const personHtml=xRankRows(personRank,x=>x.name,x=>`${x.n}件`);

  host.innerHTML=`
    <div class="title">分析</div>
    <details open style="margin-top:10px">
      <summary style="font-weight:700;cursor:pointer">時間帯ヒートマップ</summary>
      <div class="status" style="margin:6px 0">時刻を復元できた ${timed}件を集計</div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px">${heat}</div>
    </details>
    <details style="margin-top:14px">
      <summary style="font-weight:700;cursor:pointer">時間帯ランキング TOP10</summary>
      <div style="margin-top:6px">${hourRankHtml}</div>
    </details>
    <details style="margin-top:14px">
      <summary style="font-weight:700;cursor:pointer">よく占っている質問 TOP10</summary>
      <div class="status" style="margin:6px 0">同文・軽い表記ゆれをまとめて集計</div>
      <div>${questionRankHtml}</div>
    </details>
    <details style="margin-top:14px">
      <summary style="font-weight:700;cursor:pointer">正式判定 YES / NO / 中立</summary>
      <div class="status" style="margin:6px 0">正式判定済み ${decided}件。未設定 ${verdictCounts['未設定']}件は率から除外</div>
      <div>${verdictHtml}</div>
    </details>
    <details style="margin-top:14px">
      <summary style="font-weight:700;cursor:pointer">本卦ランキング TOP10</summary>
      <div style="margin-top:6px">${rankHtml}</div>
    </details>
    <details style="margin-top:14px">
      <summary style="font-weight:700;cursor:pointer">之卦ランキング TOP10</summary>
      <div style="margin-top:6px">${zhiHtml}</div>
    </details>
    <details style="margin-top:14px">
      <summary style="font-weight:700;cursor:pointer">変爻ランキング TOP10</summary>
      <div class="status" style="margin:6px 0">複数変爻は各爻を1回ずつ数える</div>
      <div>${moveHtml}</div>
    </details>
    <details style="margin-top:14px">
      <summary style="font-weight:700;cursor:pointer">人物名らしき語ランキング TOP10</summary>
      <div class="status" style="margin:6px 0">質問文から端末内で自動抽出。2件以上のみ表示</div>
      <div>${personHtml}</div>
    </details>
    <details style="margin-top:14px">
      <summary style="font-weight:700;cursor:pointer">同一質問の履歴</summary>
      <div class="status" style="margin:6px 0">2回以上ある質問の正式判定推移</div>
      <div>${historyHtml}</div>
    </details>`;
}
let xAnalyticsTimer=0;
function xScheduleAnalytics(){clearTimeout(xAnalyticsTimer);xAnalyticsTimer=setTimeout(xRenderAnalytics,40)}

const obs=new MutationObserver(()=>{xEnhanceCards();xPaintCalendar();xScheduleAnalytics()});const cards=document.getElementById('cards');if(cards)obs.observe(cards,{childList:true,subtree:true});const cal=document.getElementById('calendar');if(cal)obs.observe(cal,{childList:true,subtree:true});
document.getElementById('backup')?.addEventListener('click',()=>{localStorage.setItem(X_BACKUP,new Date().toISOString());setTimeout(xRefreshBackup,0)});
xSetupQuestionCheck();xRecoverCreatedAt();xRefreshBackup();xRefreshOverdue();xEnhanceCards();xPaintCalendar();xRenderAnalytics();xRestoreReturn();
})();