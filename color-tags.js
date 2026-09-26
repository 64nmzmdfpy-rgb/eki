(()=>{
const KEY='uranai-ledger-v1';
const COLORS={none:'',red:'#f7c7c7',yellow:'#f8e9a1',green:'#cfead6',blue:'#cfe3f6',purple:'#e1d3f4',gray:'#dedede'};
const DOTS={none:'#ffffff',red:'#e57373',yellow:'#f4cf57',green:'#78c58a',blue:'#72aee6',purple:'#a78bd4',gray:'#a8a8a8'};
const st=document.createElement('style');st.textContent=`
.colorDots{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px;padding-top:8px;border-top:1px solid rgba(127,127,127,.22)}
.colorDot{width:22px!important;height:22px!important;min-width:22px;padding:0!important;border-radius:50%!important;border:2px solid rgba(80,80,80,.35)!important;box-shadow:none!important}
.colorDot[data-c="none"]{background:linear-gradient(135deg,#fff 46%,#999 47%,#999 53%,#fff 54%)!important}
.colorDot.selected{outline:3px solid currentColor!important;outline-offset:2px}
.card[data-markcolor="red"]{background:#fff1f1!important;border-color:#e7a1a1!important}.card[data-markcolor="yellow"]{background:#fff9df!important;border-color:#dfc865!important}.card[data-markcolor="green"]{background:#f0fbf2!important;border-color:#8fc89c!important}.card[data-markcolor="blue"]{background:#f0f7ff!important;border-color:#8fb9e0!important}.card[data-markcolor="purple"]{background:#f7f2ff!important;border-color:#b8a1d8!important}.card[data-markcolor="gray"]{background:#f1f1f1!important;border-color:#b9b9b9!important}
@media(prefers-color-scheme:dark){.card[data-markcolor="red"]{background:#3a2323!important}.card[data-markcolor="yellow"]{background:#39331f!important}.card[data-markcolor="green"]{background:#203628!important}.card[data-markcolor="blue"]{background:#203142!important}.card[data-markcolor="purple"]{background:#312742!important}.card[data-markcolor="gray"]{background:#303030!important}.colorDot[data-c="none"]{background:linear-gradient(135deg,#222 46%,#aaa 47%,#aaa 53%,#222 54%)!important}}
`;document.head.appendChild(st);
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
function save(a){localStorage.setItem(KEY,JSON.stringify(a))}
function enhance(){
 const logs=read();
 document.querySelectorAll('.card').forEach(card=>{
  const t=card.querySelector('.numline')?.textContent||'';const m=t.match(/通算\s*#(\d+)/);if(!m)return;const seq=Number(m[1]);const item=logs.find(x=>Number(x.seq)===seq);if(!item)return;
  card.dataset.markcolor=item.markColor||'none';
  let box=card.querySelector('.colorDots');if(!box){box=document.createElement('div');box.className='colorDots';box.setAttribute('aria-label','色マーク');
   Object.keys(DOTS).forEach(c=>{const b=document.createElement('button');b.type='button';b.className='colorDot';b.dataset.c=c;b.title=c==='none'?'色なし':({red:'赤',yellow:'黄',green:'緑',blue:'青',purple:'紫',gray:'グレー'}[c]);if(c!=='none')b.style.background=DOTS[c];b.addEventListener('click',ev=>{ev.stopPropagation();const arr=read();const x=arr.find(v=>Number(v.seq)===seq);if(!x)return;x.markColor=c==='none'?'':c;save(arr);card.dataset.markcolor=c;box.querySelectorAll('.colorDot').forEach(d=>d.classList.toggle('selected',d.dataset.c===c));});box.appendChild(b)});
   const anchor=card.querySelector('.toggle')||card.querySelector('.formalVerdict')||card.lastElementChild;anchor?.insertAdjacentElement('beforebegin',box);
  }
  box.querySelectorAll('.colorDot').forEach(d=>d.classList.toggle('selected',d.dataset.c===(item.markColor||'none')));
 });
}
enhance();new MutationObserver(enhance).observe(document.getElementById('cards')||document.body,{childList:true,subtree:true});
})();