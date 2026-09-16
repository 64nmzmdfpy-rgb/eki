(()=>{
function detectFormalVerdict(text){
  const t=String(text||'').trim();
  if(!t)return{value:'',level:'要確認',reason:'レオの読みが未保存'};
  const lines=t.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  for(let i=lines.length-1;i>=0;i--){
    const m=lines[i].match(/(?:最終判定|判定)\s*[：:]\s*(YES|NO|中立)\b/i);
    if(m){
      const u=m[1].toUpperCase();
      return{value:u==='YES'?'YES':u==='NO'?'NO':'中立',level:'確定形式',reason:lines[i]};
    }
  }
  const tail=lines.slice(-8).join(' ');
  const patterns=[
    ['YES',/(?:結論|最終|判定)[^。]{0,20}(?:YES|Yes|yes|イエス)|(?:YES|Yes|yes)(?:寄り|方向|と判定)/],
    ['NO',/(?:結論|最終|判定)[^。]{0,20}(?:NO|No|no|ノー)|(?:NO|No|no)(?:寄り|方向|と判定)/],
    ['中立',/(?:結論|最終|判定)[^。]{0,20}中立|中立(?:判定|寄り|とする)/]
  ];
  const hits=patterns.filter(([,r])=>r.test(tail));
  if(hits.length===1)return{value:hits[0][0],level:'推定',reason:'末尾付近の表現から推定'};
  return{value:'',level:'要確認',reason:hits.length>1?'YES/NO/中立の表現が混在':'判定表現を安全に特定できず'};
}

leoPrompt=function(item){
  return `次の易占いを、質問そのものに即して詳しく読んでください。一般的な卦のキーワードを並べるだけではなく、この質問では本卦が何を意味するか、変爻が何を動かすか、之卦が最終的に何を示すかを自然な日本語で説明してください。最後は必ず独立した1行で「最終判定：YES」「最終判定：NO」「最終判定：中立」のいずれか1つだけを書いてください。返答はそのまま台帳へ貼って保存するので、JSONやコードブロックは不要です。\n\n通算番号：${item.seq}\n質問：${item.q}\n生データ（初爻→上爻）：${item.raw}\n本卦：${item.ben}\n変爻：${item.move}\n之卦：${item.zhi}`;
};

const baseRender=render;
render=function(){
  baseRender();
  const term=document.getElementById('search').value.toLowerCase();
  const dayLogs=logs.filter(x=>x.date===selected).sort((a,b)=>Number(a.seq)-Number(b.seq));
  const visible=dayLogs.filter(x=>JSON.stringify(x).toLowerCase().includes(term));
  const cards=[...document.querySelectorAll('#cards .card')];
  cards.forEach((card,i)=>{
    const item=visible[i]; if(!item)return;
    const d=detectFormalVerdict(item.leoRead);
    const verdict=card.querySelector('.verdict');
    if(verdict)verdict.textContent=`簡易判定：${item.verdict||'未判定'}`;

    const panel=document.createElement('div');
    panel.style.marginTop='10px';
    panel.style.padding='10px';
    panel.style.border='1px dashed #aaa';
    panel.style.borderRadius='12px';
    panel.innerHTML=`<div style="font-weight:800">正式判定：${esc(item.formalVerdict||'未設定')}</div><div class="saved">判定候補：${esc(d.value||'要確認')}（${esc(d.level)}）</div>${d.value&&!item.formalVerdict?`<button class="saveFormal" style="width:100%;margin-top:8px">候補「${esc(d.value)}」を正式判定に保存</button>`:''}<div class="three" style="margin-top:8px">${['YES','NO','中立'].map(v=>`<button data-formal="${v}" class="${item.formalVerdict===v?'active':''}">${v}</button>`).join('')}</div>`;
    if(verdict)verdict.insertAdjacentElement('afterend',panel);

    const saveBtn=panel.querySelector('.saveFormal');
    if(saveBtn)saveBtn.onclick=()=>{item.formalVerdict=d.value;item.formalVerdictSource=d.level;item.formalVerdictSavedAt=new Date().toISOString();saveLocal();render()};
    panel.querySelectorAll('[data-formal]').forEach(b=>b.onclick=()=>{item.formalVerdict=b.dataset.formal;item.formalVerdictSource='手動確認';item.formalVerdictSavedAt=new Date().toISOString();saveLocal();render()});

    const area=card.querySelector('.leoRead');
    if(area){
      const oldInput=area.oninput;
      area.oninput=ev=>{
        if(oldInput)oldInput(ev);
        const exact=detectFormalVerdict(ev.target.value);
        if(exact.level==='確定形式'&&exact.value){
          item.formalVerdict=exact.value;
          item.formalVerdictSource='確定形式';
          item.formalVerdictSavedAt=new Date().toISOString();
          saveLocal();
        }
      };
    }
  });
};

render();
})();