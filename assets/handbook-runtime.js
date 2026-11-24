/* Handbook runtime 1.5.0; API 1 */
(()=>{if(window.HandbookRuntime)return;window.HandbookRuntime=Object.freeze({"version": "1.5.0", "api": 1});

(function(){
 const ua=navigator.userAgent||'';
 const ipad=/iPad/i.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>0);
 const mobile=ipad||/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
 const narrow=innerWidth<900;
 if(!mobile&&!narrow)return;
 document.documentElement.classList.add('mobile-blocked');document.body.classList.add('mobile-blocked');
 if(document.querySelector('.mobile-block'))return;
 const screen=document.createElement('div');screen.className='mobile-block';screen.setAttribute('role','alertdialog');screen.setAttribute('aria-modal','true');
 const card=document.createElement('div');card.className='mb-card';
 const heading=document.createElement('h2');heading.textContent=mobile?'请使用电脑打开':'请扩大电脑浏览器窗口';
 const p=document.createElement('p');p.textContent=mobile?'本资料仅支持电脑端。手机和平板不开放正文与交互。':'请使用至少 900px 宽的电脑浏览器窗口查看。';
 card.append(heading,p);screen.append(card);document.body.append(screen);
})();

// 翻页导航：一次显示一个小节卡片
(function(){
  const secs=[...document.querySelectorAll('.section[id]')];
  const links=[...document.querySelectorAll('.nav-link')];
  if(!secs.length)return;
  let cur=0;
  const prev=document.getElementById('pager-prev');
  const next=document.getElementById('pager-next');
  const pos=document.getElementById('pager-pos');
  const title=document.getElementById('pager-title');
  function show(i,initial){
    cur=Math.max(0,Math.min(secs.length-1,i));
    secs.forEach((s,k)=>s.classList.toggle('active',k===cur));
    const id=secs[cur].id;
    links.forEach(a=>{const on=a.getAttribute('href')==='#'+id;
      a.classList.toggle('target-current',on);
      if(on){a.setAttribute('aria-current','true');const g=a.closest('.nav-group');
        if(g)g.open=true;
        document.querySelectorAll('.sidebar details.nav-group').forEach(d=>{if(d!==g)d.open=false;});
        // 目录自动跟随：把当前项滚进侧栏可视区
        const side=a.closest('.sidebar');
        if(side){const ar=a.getBoundingClientRect(),sr=side.getBoundingClientRect();
          if(ar.top<sr.top+40||ar.bottom>sr.bottom-20){side.scrollTo({top:side.scrollTop+(ar.top-sr.top)-100,behavior:'smooth'});}}
      }
      else a.removeAttribute('aria-current');});
    if(pos)pos.innerHTML='第 <b>'+(cur+1)+'</b> / '+secs.length+' 节';
    if(title)title.textContent=secs[cur].querySelector('h2')?.textContent||'';
    if(prev)prev.disabled=cur===0;
    if(next)next.disabled=cur===secs.length-1;
    if(!initial){
      document.body.classList.add('viewing');
      secs[cur].scrollIntoView({block:'start'}); // 定位到当前小节顶部
    } else {
      window.scrollTo({top:0,behavior:'instant'});
    }
    try{history.replaceState(null,'','#'+id);}catch(e){}
    try{window.dispatchEvent(new CustomEvent('hb:sectionchange',{detail:{index:cur,id:id}}));}catch(e){}
  }
  window.__showSection=show;
  // 封面「开始阅读」：进入正文第一小节
  const startBtn=document.getElementById('cover-start');
  if(startBtn)startBtn.addEventListener('click',()=>{
    document.body.classList.add('viewing');
    show(0);
    try{history.replaceState(null,'',location.pathname);}catch(e){}
  });
  // 顶栏「封面」：回到开场封面
  const homeBtn=document.getElementById('home-btn');
  if(homeBtn)homeBtn.addEventListener('click',()=>{
    document.body.classList.remove('viewing');
    links.forEach(a=>{a.classList.remove('target-current');a.removeAttribute('aria-current');});
    try{history.replaceState(null,'',location.pathname);}catch(e){}
    window.scrollTo({top:0,behavior:'instant'});
  });
  links.forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();
    const i=secs.findIndex(s=>s.id===a.getAttribute('href').slice(1));
    if(i>=0)show(i);closeMenu();
  }));
  if(prev)prev.addEventListener('click',()=>show(cur-1));
  if(next)next.addEventListener('click',()=>show(cur+1));
  // 键盘左右翻页（输入框 / 弹窗 / tab / 报站控件内不触发）
  document.addEventListener('keydown',e=>{
    if(/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;
    const lb=document.getElementById('lightbox');
    if(lb&&lb.open)return; // 弹窗打开时方向键用于切图，不翻小节
    // tab / metro 等自带方向键的控件抢占焦点时不翻页
    if(document.activeElement.closest('.sidebar,.search-box,[role="tab"],[role="tablist"],.tabset,.metro-stop,.metro,.multi-gallery,.china-map-component,.hw-fold-grid,.hw-detail-table,.hw-matrix,.scriptlib,.hw-audio'))return;
    if(e.key==='ArrowLeft')show(cur-1);
    if(e.key==='ArrowRight')show(cur+1);
  });
  // 交叉引用：点相关章节 chip 跳到对应小节
  document.addEventListener('click',e=>{
    const chip=e.target.closest('[data-goto]');
    if(!chip||chip.matches('.metro-stop')||chip.disabled||chip.getAttribute('aria-disabled')==='true')return;
    const i=secs.findIndex(s=>s.id===chip.getAttribute('data-goto'));
    if(i>=0){e.preventDefault();show(i);}
  });
  // 深链接：带 hash 直接进正文；否则停在封面
  const h=decodeURIComponent(location.hash.slice(1));
  const start=secs.findIndex(s=>s.id===h);
  if(start>=0){show(start,true);document.body.classList.add('viewing');}
  else show(0,true);
  window.addEventListener('hashchange',()=>{const id=decodeURIComponent(location.hash.slice(1));const i=secs.findIndex(s=>s.id===id);if(i>=0){show(i,true);document.body.classList.add('viewing');}});
})();
// 移动菜单
function closeMenu(){document.querySelector('.sidebar')?.classList.remove('open');}
document.querySelector('.menu-btn')?.addEventListener('click',()=>document.querySelector('.sidebar')?.classList.toggle('open'));
// 图片点击放大（lightbox）
(function(){
  const box=document.getElementById('lightbox');
  if(!box)return;
  const im=box.querySelector('img');
  const cap=box.querySelector('.lightbox-cap');
  const close=box.querySelector('.lightbox-close');
  // 同一组图片（同一 gallery / 图组）内左右切换
  let group=[],gi=0;
  const prevBtn=box.querySelector('.lb-prev'),nextBtn=box.querySelector('.lb-next');
  function paint(){
    if(!group.length)return;
    const el=group[gi];im.src=el.src;im.alt=el.alt||'';
    cap.textContent=el.closest('figure')?.querySelector('figcaption')?.textContent||el.alt||'';
    const multi=group.length>1;
    if(prevBtn)prevBtn.hidden=!multi;
    if(nextBtn)nextBtn.hidden=!multi;
  }
  function step(d){if(group.length<2)return;gi=(gi+d+group.length)%group.length;paint();}
  document.addEventListener('click',e=>{
    const t=e.target.closest('img.zoomable, img.avatar, .gallery-item img');
    if(!t)return;
    if(t.classList.contains('avatar'))return; // 头像是装饰，不放大
    openAt(t);
  });
  function openAt(t){
    // 收集同组图片：优先同 figure 的兄弟，其次同 gallery / 同 section 的所有可放大图
    const scope=t.closest('.gallery')||t.closest('.section')||document;
    group=[...scope.querySelectorAll('img.zoomable, .gallery-item img')].filter(x=>!x.classList.contains('avatar'));
    if(!group.includes(t))group=[t];
    gi=Math.max(0,group.indexOf(t));
    paint();box.showModal();
  }
  // 键盘：图片可聚焦，回车 / 空格打开放大
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const t=e.target.closest('img.zoomable, .gallery-item img');
    if(!t)return;
    e.preventDefault();openAt(t);
  });
  if(prevBtn)prevBtn.addEventListener('click',e=>{e.stopPropagation();step(-1);});
  if(nextBtn)nextBtn.addEventListener('click',e=>{e.stopPropagation();step(1);});
  // 关闭：优先原生 closedby="any"（背景点击 / Esc / 返回手势），仅在不支持时补兜底
  close.addEventListener('click',()=>box.close());
  if(!('closedBy' in HTMLDialogElement.prototype)){
    // 回退：指针按下与抬起都在对话框外才关闭（避免文字选中拖拽误关）
    const outside=(e)=>{const r=box.getBoundingClientRect();
      return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;};
    let pressedOutside=false;
    box.addEventListener('pointerdown',e=>{pressedOutside=outside(e);});
    box.addEventListener('pointerup',e=>{if(pressedOutside&&outside(e))box.close();pressedOutside=false;});
  }
  // 左右键翻图；Esc 由原生模态处理，不重复拦截
  box.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}
    if(e.key==='ArrowRight'){e.preventDefault();step(1);}
  });
})();
// 复制：命令式 + 点击 fallback，Async Clipboard + 传统兜底（copy-button 指南）
let lastMsg='';
function legacyCopy(text){
  const f=document.createElement('textarea');f.value=text;f.setAttribute('readonly','');
  f.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.append(f);f.select();
  try{return document.execCommand('copy');}finally{f.remove();}
}
async function doCopyEl(btn,target){
  if(!target)return;
  const text=target.innerText.trim();if(!text)return;
  let ok=false;
  try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(text);ok=true;}}catch(e){}
  if(!ok)ok=legacyCopy(text);
  report(btn,ok);
}
function report(btn,ok){
  clearTimeout(btn._t);btn.removeAttribute('data-copied');btn.removeAttribute('data-failed');
  const tip=btn.nextElementSibling;let msg=ok?'已复制':'复制失败';
  if(msg===lastMsg)msg+='\u00A0';lastMsg=msg;
  void btn.offsetWidth;btn.setAttribute(ok?'data-copied':'data-failed','');
  requestAnimationFrame(()=>{if(tip)tip.textContent=msg;});
  btn._t=setTimeout(()=>{btn.removeAttribute('data-copied');btn.removeAttribute('data-failed');if(tip)tip.textContent='';},1800);
}
// Invoker Commands：command 事件不冒泡，用捕获阶段监听；event.source 是按钮，event.target 是 commandfor 元素
document.addEventListener('command',e=>{
  if(e.command!=='--copy')return;
  doCopyEl(e.source,e.target);
},true);
// 只有不支持 CommandEvent 的环境才注册点击路径，避免一次点击复制两次
if(!('CommandEvent' in window)){
  document.addEventListener('click',e=>{
    const b=e.target.closest('.copy-button[command]');if(!b)return;
    doCopyEl(b,document.getElementById(b.getAttribute('commandfor')));
  });
}
// 原生单选卡：浏览器处理方向键、空格、禁用；高亮与 checked 同步。
(function(){
  document.querySelectorAll('.pick-grid').forEach(grid=>{
    const cards=[...grid.querySelectorAll('.pick-card')];
    grid.addEventListener('change',e=>{
      if(!e.target.matches('.pick-control'))return;
      cards.forEach(c=>c.classList.toggle('on',c.querySelector('.pick-control').checked));
    });
  });
})();
// Tab 切换（点击 + 键盘方向键 / Home / End，符合 tablist 交互）
(function(){
  document.querySelectorAll('.tabset').forEach(set=>{
    const heads=[...set.querySelectorAll('.tab-head')], panels=[...set.querySelectorAll('.tab-panel')];
    heads.forEach(h=>{h.tabIndex=h.classList.contains('on')?0:-1;});
    function pick(i,focus){
      heads.forEach((x,k)=>{const on=k===i;x.classList.toggle('on',on);x.tabIndex=on?0:-1;
        x.setAttribute('aria-selected',String(on));});
      panels.forEach(p=>p.classList.toggle('on',p.dataset.idx===String(i)));
      if(focus)heads[i].focus();
      set.dispatchEvent(new CustomEvent('hb:tabchange',{bubbles:true,detail:{key:heads[i].dataset.tabKey}}));
    }
    heads.forEach((h,i)=>{
      h.addEventListener('click',()=>pick(i,false));
      h.addEventListener('keydown',e=>{
        let n=null;
        if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%heads.length;
        else if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(i-1+heads.length)%heads.length;
        else if(e.key==='Home')n=0;
        else if(e.key==='End')n=heads.length-1;
        if(n!==null){e.preventDefault();pick(n,true);}
      });
    });
  });
})();
// 地铁报站导航
(function(){  document.querySelectorAll('.metro').forEach(metro=>{
    const track=metro.querySelector('.metro-track');
    const stops=[...metro.querySelectorAll('.metro-stop')],panels=[...metro.querySelectorAll('.metro-panel')];
    const fill=metro.querySelector('.metro-fill'),train=metro.querySelector('.metro-train');
    const now=metro.querySelector('.metro-now b'),nextChip=metro.querySelector('.metro-next');
    if(!stops.length)return;
    let current=Math.max(0,stops.findIndex(s=>s.classList.contains('on')));
    function place(i){
      if(!track||!fill||!train)return;
      const tr=track.getBoundingClientRect();
      const dots=stops.map(s=>s.querySelector('.metro-dot').getBoundingClientRect());
      const first=dots[0].left+dots[0].width/2-tr.left,cur=dots[i].left+dots[i].width/2-tr.left;
      fill.style.left=first+'px';fill.style.width=Math.max(0,cur-first)+'px';train.style.left=cur+'px';
    }
    function go(i){
      current=i;
      stops.forEach((s,k)=>{const on=k===i;s.classList.toggle('on',on);s.setAttribute('aria-pressed',String(on));});
      panels.forEach(p=>p.classList.toggle('on',p.dataset.stop===String(i)));
      if(now)now.textContent=stops[i].querySelector('.metro-label b')?.textContent||'';
      if(nextChip){const nx=stops[i+1]?.querySelector('.metro-label b')?.textContent||'';
        nextChip.hidden=!nx;const nb=nextChip.querySelector('b');if(nb)nb.textContent=nx;}
      place(i);
    }
    stops.forEach((s,i)=>s.addEventListener('click',()=>{
      go(i);
      if(metro.dataset.nav==='1'&&s.dataset.goto&&window.__showSection){
        const list=[...document.querySelectorAll('.section[id]')];
        const idx=list.indexOf(document.getElementById(s.dataset.goto));
        if(idx>=0)window.__showSection(idx);
      }
    }));
    go(current);
    window.addEventListener('resize',()=>place(current),{passive:true});
    window.addEventListener('hb:sectionchange',()=>{if(metro.getBoundingClientRect().width>0)place(current);});
  });
})();
// 数字滚动：进入当前小节时从 0 滚向目标值；尊重系统「减少动态」设置
(function(){
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fmt(v,decimals){
    if(decimals>0)return v.toFixed(decimals);
    return String(Math.round(v));
  }
  function run(el){
    if(el.dataset.done==='1')return;
    el.dataset.done='1';
    const raw=el.getAttribute('data-count')||'0';
    const target=parseFloat(raw.replace(/[^0-9.]/g,''))||0;
    const decimals=(raw.split('.')[1]||'').length;
    const dur=parseInt(el.getAttribute('data-dur')||'1100',10);
    const vEl=el.querySelector('.stat-v');
    if(!vEl)return;
    if(reduce){vEl.textContent=fmt(target,decimals);return;}
    const t0=performance.now();
    function tick(now){
      const p=Math.min(1,(now-t0)/dur);
      const eased=1-Math.pow(1-p,3); // easeOutCubic
      vEl.textContent=fmt(target*eased,decimals);
      if(p<1)requestAnimationFrame(tick);
      else vEl.textContent=fmt(target,decimals);
    }
    requestAnimationFrame(tick);
  }
  function runIn(section){
    if(!section)return;
    section.querySelectorAll('[data-count]').forEach(el=>{
      // 每次进入该节都重播：先清空标记
      el.dataset.done='';
      run(el);
    });
  }
  // 首屏：若已直接进入正文
  const first=document.querySelector('.section.active');
  if(first)runIn(first);
  window.addEventListener('hb:sectionchange',e=>{
    const list=[...document.querySelectorAll('.section[id]')];
    runIn(list[e.detail.index]);
  });
})();
// 顶部阅读进度条（按「第几节 + 本节滚动比例」计算；只写 transform，rAF 节流）
(function(){
  const bar=document.querySelector('.read-progress');
  if(!bar)return;
  let ticking=false;
  function upd(){
    const secs=[...document.querySelectorAll('.section[id]')];
    if(!secs.length){bar.style.setProperty('--p','0');return;}
    const active=document.querySelector('.section.active');
    const idx=active?secs.indexOf(active):0;
    const sc=window.scrollY||document.documentElement.scrollTop;
    const docH=document.documentElement.scrollHeight-window.innerHeight;
    const inner=docH>0?Math.min(1,Math.max(0,sc/docH)):0;
    const pct=Math.min(1,(Math.max(0,idx)+inner)/secs.length);
    bar.style.setProperty('--p',pct.toFixed(4));
    ticking=false;
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(upd);}}
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  window.addEventListener('hb:sectionchange',()=>setTimeout(upd,30));
  upd();
})();
// 朋友圈点赞 / 评论 / 进入提示
(function(){
  const hinted=new WeakSet();
  function tryHint(){
    document.querySelectorAll('.moments').forEach(card=>{
      if(hinted.has(card)||card.offsetParent===null)return;
      const r=card.getBoundingClientRect();if(!r.width||!r.height)return;
      hinted.add(card);card.classList.add('mm-hint');
      setTimeout(()=>card.classList.remove('mm-hint'),1800);
    });
  }
  document.querySelectorAll('.moments').forEach(card=>{
    const like=card.querySelector('.mm-like'),comment=card.querySelector('.mm-comment');
    const box=card.querySelector('.mm-comment-box'),input=card.querySelector('.mm-comment-input');
    const send=card.querySelector('.mm-comment-send'),list=card.querySelector('.mm-comments');
    function burst(btn){
      if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      const wrap=document.createElement('span');wrap.className='mm-heart-burst';
      const xs=[-26,-12,0,12,26],ys=[-32,-44,-52,-42,-30],rs=['-18deg','-8deg','0deg','9deg','18deg'];
      xs.forEach((x,i)=>{const h=document.createElement('i');h.className='mm-heart';h.textContent='♥';
        h.style.setProperty('--hx',x+'px');h.style.setProperty('--hy',ys[i]+'px');h.style.setProperty('--hr',rs[i]);
        h.style.animationDelay=(i*38)+'ms';wrap.appendChild(h);});
      btn.appendChild(wrap);setTimeout(()=>wrap.remove(),1250);
    }
    if(like)like.addEventListener('click',()=>{
      const on=!like.classList.contains('on');
      like.classList.toggle('on',on);like.setAttribute('aria-pressed',String(on));
      const lt=card.querySelector('.mm-likes-text');
      if(lt){const base=lt.dataset.base||'';
        if(on){lt.textContent='';const me=document.createElement('span');me.className='mm-like-me';me.textContent='我';
          lt.append(me,document.createTextNode('、'+base));}else lt.textContent=base;}
      if(on)burst(like);
    });
    if(comment)comment.addEventListener('click',()=>{
      const open=box.classList.toggle('open');comment.setAttribute('aria-expanded',String(open));
      card.classList.remove('comments-shown');void card.offsetWidth;card.classList.add('comments-shown');
      if(open)input?.focus();
    });
    function addComment(){
      const feedback=card.querySelector('.mm-feedback');
      const v=input?.value.trim();if(!v){if(feedback)feedback.textContent='请先输入评论';return;}card.classList.add('comments-shown');
      const row=document.createElement('div');row.className='mm-comment-item mine';
      const av=document.createElement('span');av.className='mm-c-avatar mine';av.textContent='我';
      const body=document.createElement('span');body.className='mm-c-body';
      const who=document.createElement('b');who.textContent='我';
      const txt=document.createElement('span');txt.textContent=v;
      body.append(who,txt);row.append(av,body);list?.appendChild(row);input.value='';if(feedback)feedback.textContent='评论已添加到本页示例';
    }
    if(send)send.addEventListener('click',addComment);
    if(input)input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing&&e.keyCode!==229){e.preventDefault();addComment();}});
  });
  window.addEventListener('hb:sectionchange',()=>setTimeout(tryHint,90));
  document.addEventListener('click',()=>setTimeout(tryHint,90));
  window.addEventListener('load',()=>setTimeout(tryHint,320));
  setTimeout(tryHint,420);
})();

// 全文搜索：按章节聚合，标题优先；空格分词取交集。全部处理在当前浏览器内完成。
(()=>{
 const box=document.querySelector('.search-box'),input=box?.querySelector('input');
 if(!input)return;
 const sections=[...document.querySelectorAll('.section[id]')];
 const panel=box.querySelector('.search-results'),list=box.querySelector('.search-result-list');
 const status=box.querySelector('.search-count');
 if(!panel||!list)return;
 const skip='search,[inert],script,style,template,noscript,.xref,.copy,.tip,[aria-hidden="true"],.hw-detail-feedback,.hw-detail-jump,[data-search-ignore]';
 const block='p,li,h2,h3,h4,h5,h6,td,th,dt,dd,summary,pre,figcaption,.card-title,.card-sub,.card-body,.sec-sub,.sec-kicker';
 let index=null,results=[],terms=[],timer,composing=false,target=null;
 const observer=new MutationObserver(()=>{index=null;});
 sections.forEach(s=>observer.observe(s,{childList:true,characterData:true,subtree:true}));
 function buildIndex(){
  if(index)return index;
  index=sections.map((section,order)=>{
   const nav=[...document.querySelectorAll('.nav-link')].find(a=>a.getAttribute('href')==='#'+section.id);
   const title=nav?.textContent.trim()||section.querySelector('h2')?.textContent.trim()||section.id;
   const heading=section.querySelector('h2')?.textContent||'';
   const walker=document.createTreeWalker(section,NodeFilter.SHOW_TEXT),nodes=[];
   let n,text='',lastBlock=null;
   while((n=walker.nextNode())){
    if(!n.nodeValue.trim()||n.parentElement.closest(skip))continue;
    const owner=n.parentElement.closest(block)||n.parentElement;
    if(lastBlock&&owner!==lastBlock)text+=' ';
    const start=text.length;text+=n.nodeValue;
    nodes.push({node:n,start,end:text.length});lastBlock=owner;
   }
   return {section,order,title,titleText:(title+' '+heading).toLowerCase(),text,lower:text.toLowerCase(),nodes};
  });
  return index;
 }
 function clearHighlight(){
  if(window.CSS?.highlights)CSS.highlights.delete('handbook-search');
  if(target){target.classList.remove('search-target');target=null;}
 }
 function close(){clearTimeout(timer);panel.hidden=true;}
 function marked(el,text){
  let at=0;
  while(at<text.length){
   const lower=text.toLowerCase();let found=-1,word='';
   terms.forEach(t=>{const p=lower.indexOf(t,at);if(p>=0&&(found<0||p<found||(p===found&&t.length>word.length))){found=p;word=t;}});
   if(found<0){el.append(document.createTextNode(text.slice(at)));break;}
   el.append(document.createTextNode(text.slice(at,found)));
   const mark=document.createElement('mark');mark.textContent=text.slice(found,found+word.length);el.append(mark);at=found+word.length;
  }
 }
 function rangeAt(record,start,end){
  const first=record.nodes.find(x=>x.end>start),last=record.nodes.find(x=>x.end>=end);
  if(!first||!last||start<first.start||end<=last.start)return null;
  const range=document.createRange();range.setStart(first.node,start-first.start);range.setEnd(last.node,end-last.start);return range;
 }
 function openResult(record){
  close();clearHighlight();
  window.__showSection?.(record.order);
  const hit=terms.map(t=>({at:record.lower.indexOf(t),term:t})).filter(x=>x.at>=0).sort((a,b)=>a.at-b.at)[0];
  const node=hit&&record.nodes.find(x=>x.end>hit.at)?.node;
  const origin=node?.parentElement;
  const el=(origin?.closest('.sr-only')?.parentElement||origin)||record.section.querySelector('h2')||record.section;
  const ancestors=[];for(let a=el;a&&a!==record.section;a=a.parentElement)ancestors.push(a);
  ancestors.reverse().forEach(a=>{
   if(a.matches('details'))a.open=true;
   if(a.matches('.hw-data-choice'))a.click();
   if(a.matches('[data-transcript-key]')){
    const audio=a.closest('.hw-audio'),section=audio.closest('.section');
    const host=[...section.querySelectorAll('.tabset')].find(x=>audio.dataset.tabset&&x.dataset.tabsKey===audio.dataset.tabset);
    if(host){[...host.querySelectorAll('.tab-head')].find(b=>b.dataset.tabKey===a.dataset.transcriptKey)?.click();}
    else{const select=audio.querySelector('select');select.value=a.dataset.transcriptKey;select.dispatchEvent(new Event('change',{bubbles:true}));}
   }
   if(a.matches('.tab-panel')){
    const root=a.closest('.tabset');[...root.querySelectorAll('.tab-head')].find(b=>b.dataset.idx===a.dataset.idx)?.click();
   }
   if(a.matches('.metro-panel')){
    const root=a.closest('.metro');[...root.querySelectorAll('.metro-stop')].find(b=>b.dataset.stop===a.dataset.stop)?.click();
   }
   if(a.matches('.hw-detail-panel')){
    const root=a.closest('.hw-detail-table');[...root.querySelectorAll('.hw-data-choice')].find(b=>b.dataset.detailKey===a.dataset.detailPanel)?.click();
   }
  });
  if(window.CSS?.highlights&&window.Highlight){
   const ranges=[];
   terms.forEach(term=>{let at=record.lower.indexOf(term);while(at>=0&&ranges.length<500){const r=rangeAt(record,at,at+term.length);if(r)ranges.push(r);at=record.lower.indexOf(term,at+term.length);}});
   CSS.highlights.set('handbook-search',new Highlight(...ranges));
  }
  target=el.ownerSVGElement||el.closest(block)||el;target.classList.add('search-target');
  if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
  const destination=target;
  requestAnimationFrame(()=>{if(target!==destination||!destination.isConnected)return;destination.focus({preventScroll:true});destination.scrollIntoView({block:'center',behavior:'instant'});});
 }
 function search(){
  clearTimeout(timer);clearHighlight();
  const q=input.value.trim().toLowerCase();terms=[...new Set(q.split(/\s+/).filter(Boolean))];
  list.replaceChildren();results=[];
  if(!terms.length){close();status.textContent='';return;}
  results=buildIndex().filter(r=>terms.every(t=>(r.titleText+' '+r.lower).includes(t))).map(r=>{
   const score=r.titleText.includes(q)?100:terms.every(t=>r.titleText.includes(t))?80:terms.filter(t=>r.titleText.includes(t)).length*10;
   return {...r,score};
  }).sort((a,b)=>b.score-a.score||a.order-b.order);
  results.forEach(r=>{
   const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.className='search-result';button.dataset.section=r.section.id;
   const title=document.createElement('span');title.className='search-result-title';marked(title,r.title);button.append(title);
   const positions=terms.map(t=>r.lower.indexOf(t)).filter(x=>x>=0);const at=positions.length?Math.min(...positions):0;
   const start=Math.max(0,at-24),end=Math.min(r.text.length,at+100);
   const snippet=document.createElement('span');snippet.className='search-result-snippet';marked(snippet,(start?'…':'')+r.text.slice(start,end).replace(/\s+/g,' ')+(end<r.text.length?'…':''));button.append(snippet);
   button.addEventListener('click',()=>openResult(r));li.append(button);list.append(li);
  });
  status.textContent=results.length?'找到 '+results.length+' 个章节 · 标题命中优先':'没有找到匹配内容，可缩短关键词重试';
  panel.hidden=false;
 }
 input.addEventListener('compositionstart',()=>{composing=true;clearTimeout(timer);});
 input.addEventListener('compositionend',()=>{composing=false;search();});
 input.addEventListener('input',()=>{clearTimeout(timer);if(!composing){if(!input.value.trim())search();else timer=setTimeout(search,150);}});
 input.addEventListener('focus',()=>{if(input.value.trim())search();});
 input.addEventListener('keydown',e=>{
  if(e.isComposing||composing||e.keyCode===229)return;
  if(e.key==='Enter'){e.preventDefault();search();if(results.length)openResult(results[0]);}
  if(e.key==='ArrowDown'){e.preventDefault();search();list.querySelector('button')?.focus();}
  if(e.key==='Escape'){e.preventDefault();close();}
 });
 panel.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();input.focus();close();return;}
  if(!e.target.matches('.search-result')||!['ArrowDown','ArrowUp'].includes(e.key))return;
  e.preventDefault();const buttons=[...list.querySelectorAll('button')],i=buttons.indexOf(e.target)+(e.key==='ArrowDown'?1:-1);
  if(i<0)input.focus();else buttons[Math.min(i,buttons.length-1)].focus();
 });
 box.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')e.stopPropagation();});
 box.querySelector('.search-close').addEventListener('click',()=>{input.focus();close();});
 document.addEventListener('pointerdown',e=>{if(!box.contains(e.target))close();});
 box.addEventListener('focusout',()=>{requestAnimationFrame(()=>{if(!box.contains(document.activeElement))close();});});
 window.addEventListener('hb:sectionchange',clearHighlight);
})();

(function(){
 const cover=document.querySelector('.cover-fluid-mode'),button=cover?.querySelector('.cover-motion-toggle');
 if(!cover||!button)return;
 let paused=false;
 function sync(){cover.classList.toggle('flow-paused',paused||document.hidden);button.textContent=paused?'开启动效':'暂停动态';}
 button.addEventListener('click',()=>{paused=!paused;sync();});
 document.addEventListener('visibilitychange',sync);sync();
})();

(function(){
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 document.querySelectorAll('.multi-gallery').forEach(g=>{
  const track=g.querySelector('.g-track'),slides=[...g.querySelectorAll('.g-slide')],markers=[...g.querySelectorAll('.g-marker')];
  const prev=g.querySelector('.g-prev'),next=g.querySelector('.g-next'),count=g.querySelector('.g-count'),status=g.querySelector('.g-status');
  if(!slides.length)return;
  let current=-1,pending=null,frame=0,timer,lastAnnounced=-1,user=false,drag=null,suppressClickUntil=0;
  const center=i=>slides[i].offsetLeft+slides[i].offsetWidth/2-track.offsetLeft-track.clientWidth/2;
  // offsetLeft may be relative to different offset parents; rectangles provide track-local deltas.
  function target(i){const a=slides[i].getBoundingClientRect(),b=track.getBoundingClientRect();return track.scrollLeft+a.left+a.width/2-b.left-track.clientWidth/2;}
  function nearest(){let best=0,d=Infinity;slides.forEach((s,i)=>{const r=s.getBoundingClientRect(),t=track.getBoundingClientRect();const x=Math.abs(r.left+r.width/2-t.left-track.clientWidth/2);if(x<d){d=x;best=i;}});return best;}
  function paint(i){
   current=i;slides.forEach((s,k)=>{s.classList.toggle('is-current',k===i);s.classList.toggle('is-before',k<i);s.classList.toggle('is-after',k>i)});
   markers.forEach((m,k)=>m.setAttribute('aria-current',String(k===i)));count.textContent=(i+1)+' / '+slides.length;
   prev.disabled=i===0;next.disabled=i===slides.length-1;
   // Keep keyboard focus reachable when the active edge button becomes disabled.
   if(document.activeElement===prev&&prev.disabled&&!next.disabled)next.focus({preventScroll:true});
   if(document.activeElement===next&&next.disabled&&!prev.disabled)prev.focus({preventScroll:true});
  }
  function settled(){
   if(!track.clientWidth)return;
   const i=nearest();
   if(pending!==null&&i!==pending){clearTimeout(timer);timer=setTimeout(()=>{pending=null;settled()},200);return;}
   pending=null;paint(i);
   if(user&&i!==lastAnnounced){status.textContent='第 '+(i+1)+' 张，共 '+slides.length+' 张';lastAnnounced=i;}
  }
  function go(i,instant=false){
   if(!track.clientWidth)return;
   i=Math.max(0,Math.min(slides.length-1,i));pending=i;paint(i);
   const left=target(i),behavior=instant||reduce.matches?'instant':'smooth';track.scrollTo({left,behavior});
   if(Math.abs(track.scrollLeft-left)<1){pending=null;settled();}
  }
  prev.addEventListener('click',()=>{user=true;go((pending??current)-1)});
  next.addEventListener('click',()=>{user=true;go((pending??current)+1)});
  markers.forEach((m,i)=>m.addEventListener('click',()=>{user=true;go(i)}));
  track.addEventListener('scroll',()=>{
   if(!frame&&pending===null)frame=requestAnimationFrame(()=>{frame=0;if(track.clientWidth)paint(nearest())});
   if(!('onscrollend' in track)){clearTimeout(timer);timer=setTimeout(settled,130)}
  },{passive:true});
  if('onscrollend' in track)track.addEventListener('scrollend',settled);
  track.addEventListener('wheel',()=>{user=true;pending=null},{passive:true});
  track.addEventListener('touchstart',()=>{user=true;pending=null},{passive:true});
  track.addEventListener('keydown',e=>{
   if(e.target.closest('button,input,textarea,a'))return;
   let n=null;if(e.key==='ArrowLeft')n=(pending??current)-1;if(e.key==='ArrowRight')n=(pending??current)+1;if(e.key==='Home')n=0;if(e.key==='End')n=slides.length-1;
   if(n!==null){e.preventDefault();e.stopPropagation();user=true;go(n)}
   else if((e.key==='Enter'||e.key===' ')&&e.target.matches('img')&&slides.indexOf(e.target.closest('.g-slide'))!==current){e.preventDefault();e.stopPropagation();user=true;go(slides.indexOf(e.target.closest('.g-slide')))}
  });
  track.addEventListener('click',e=>{
   if(Date.now()<suppressClickUntil){e.preventDefault();e.stopPropagation();return;}
   const slide=e.target.closest('.g-slide');if(!slide)return;
   const i=slides.indexOf(slide);
   if(i!==current){e.preventDefault();e.stopPropagation();user=true;go(i)}
  },true);
  track.querySelectorAll('img').forEach(im=>im.draggable=false);
  track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,left:track.scrollLeft,id:e.pointerId,moved:false}});
  track.addEventListener('pointermove',e=>{if(!drag)return;if(!e.buttons){endDrag();return;}const dx=e.clientX-drag.x;if(Math.abs(dx)>6){drag.moved=true;user=true;pending=null;track.classList.add('dragging');track.setPointerCapture(e.pointerId)}if(drag.moved){e.preventDefault();track.scrollTo({left:drag.left-dx,behavior:'instant'})}});
  function endDrag(){if(!drag)return;const moved=drag.moved,id=drag.id;drag=null;track.classList.remove('dragging');if(track.hasPointerCapture(id))track.releasePointerCapture(id);if(moved){suppressClickUntil=Date.now()+350;go(nearest())}}
  track.addEventListener('pointerup',endDrag);track.addEventListener('pointercancel',endDrag);
  function portraitPadding(){
   if(!g.classList.contains('g-portrait')||!track.clientWidth)return;
   track.style.paddingInlineStart=Math.max(16,(track.clientWidth-slides[0].offsetWidth)/2)+'px';
   track.style.paddingInlineEnd=Math.max(16,(track.clientWidth-slides[slides.length-1].offsetWidth)/2)+'px';
  }
  if(g.classList.contains('g-portrait'))track.querySelectorAll('img').forEach(im=>im.addEventListener('load',()=>{portraitPadding();go(current>=0?current:(Number(g.dataset.default)||0),true)}));
  const initial=Number(g.dataset.default)||0;let wasVisible=false;
  const resize=new ResizeObserver(()=>{if(!track.clientWidth){wasVisible=false;return;}portraitPadding();go(current>=0?current:initial,true);wasVisible=true;});resize.observe(track);
 });
})();

(function(){document.querySelectorAll('.china-map-component').forEach(root=>{
 const frame=root.querySelector('.cm-mapframe'),svg=root.querySelector('svg'),points=[...root.querySelectorAll('.cm-point')],cities=[...root.querySelectorAll('.cm-city')].sort((a,b)=>Number(a.dataset.city)-Number(b.dataset.city));
 const info=root.querySelector('.cm-selection'),zoom=root.querySelector('.cm-zoom');
 let scale=1,x=0,y=0,drag=null,suppress=0;
 function paint(){const w=660/scale,h=503/scale;x=Math.max(0,Math.min(660-w,x));y=Math.max(0,Math.min(503-h,y));svg.setAttribute('viewBox',[x,y,w,h].join(' '));zoom.textContent=Math.round(scale*100)+'%';root.querySelector('[data-map-action=out]').disabled=scale===1;root.querySelector('[data-map-action=in]').disabled=scale===4;const u=w/(frame.clientWidth||660);svg.classList.toggle('is-zoomed',scale>=1.55);points.forEach(p=>{p.querySelector('.cm-dot').setAttribute('r',4*u);p.querySelector('.cm-halo').setAttribute('r',9*u);p.querySelector('.cm-label').style.fontSize=10.5*u+'px'});placeLabels(u);}
 function placeLabels(u){const placed=[],fs=10.5*u;points.slice().sort((a,b)=>+a.querySelector('.cm-dot').getAttribute('cy')-b.querySelector('.cm-dot').getAttribute('cy')).forEach(p=>{const dot=p.querySelector('.cm-dot'),label=p.querySelector('.cm-label'),cx=+dot.getAttribute('cx'),cy=+dot.getAttribute('cy'),w=label.getBBox().width||label.textContent.length*fs,h=fs*1.2;let best=null;for(const dy of [-fs,fs*1.65,-fs*2.2,fs*2.8,-fs*3.5])for(const dx of [0,-w*.65,w*.65,-w*1.2,w*1.2]){const box={l:cx+dx-w/2,r:cx+dx+w/2,t:cy+dy-h,b:cy+dy+fs*.2};const overlap=placed.reduce((n,b)=>n+Math.max(0,Math.min(b.r,box.r)-Math.max(b.l,box.l)+u)*Math.max(0,Math.min(b.b,box.b)-Math.max(b.t,box.t)+u),0);const score=overlap*100+Math.abs(dy)+Math.abs(dx)*.6;if(!best||score<best.score)best={box,score,dx,dy};}label.setAttribute('x',cx+(scale>=1.55?best.dx:0));label.setAttribute('y',cy+(scale>=1.55?best.dy:-fs));placed.push(best.box);});}
 function zoomAt(f,cx=.5,cy=.5){const px=x+cx*660/scale,py=y+cy*503/scale;scale=Math.max(1,Math.min(4,scale*f));x=px-cx*660/scale;y=py-cy*503/scale;paint();}
 function pick(i){points.forEach((p,k)=>p.setAttribute('aria-pressed',String(k===i)));cities.forEach((c,k)=>c.classList.toggle('is-selected',k===i));const c=cities[i];info.textContent=c.textContent+' · '+c.dataset.region+(c.dataset.detail?' — '+c.dataset.detail:'');}
 points.forEach((p,i)=>{p.addEventListener('click',e=>{if(Date.now()<suppress)return;e.stopPropagation();pick(i)});p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();pick(i)}})});
 root.querySelectorAll('[data-map-action]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.mapAction==='reset'){scale=1;x=0;y=0;paint();}else zoomAt(b.dataset.mapAction==='in'?1.4:1/1.4);}));
 frame.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const r=frame.getBoundingClientRect();zoomAt(Math.exp(-e.deltaY*.002),(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);},{passive:false});
 frame.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x,y,moved:false};});
 frame.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;if(Math.hypot(dx,dy)>5){drag.moved=true;frame.setPointerCapture(e.pointerId);frame.classList.add('is-dragging');}if(drag.moved){const r=frame.getBoundingClientRect();x=drag.x-dx*660/(r.width*scale);y=drag.y-dy*503/(r.height*scale);paint();}});
 function end(){if(!drag)return;const d=drag;drag=null;if(frame.hasPointerCapture(d.id))frame.releasePointerCapture(d.id);frame.classList.remove('is-dragging');if(d.moved)suppress=Date.now()+300;}
 frame.addEventListener('pointerup',end);frame.addEventListener('pointercancel',end);frame.addEventListener('lostpointercapture',end);
 frame.addEventListener('keydown',e=>{let handled=true;if(e.key==='+'||e.key==='=')zoomAt(1.4);else if(e.key==='-')zoomAt(1/1.4);else if(e.key==='Home'){scale=1;x=0;y=0;paint();}else if(e.key.startsWith('Arrow')){const step=35/scale;if(e.key==='ArrowLeft')x-=step;else if(e.key==='ArrowRight')x+=step;else if(e.key==='ArrowUp')y-=step;else if(e.key==='ArrowDown')y+=step;paint();}else handled=false;if(handled){e.preventDefault();e.stopPropagation();}});new ResizeObserver(paint).observe(frame);document.fonts.ready.then(paint);paint();
});})();

(()=>{
 document.querySelectorAll('.hw-detail-table').forEach(root=>{
  const choices=[...root.querySelectorAll('.hw-data-choice')].filter(x=>x.closest('.hw-detail-table')===root);
  const panels=[...root.querySelectorAll('.hw-detail-panel')].filter(x=>x.closest('.hw-detail-table')===root);
  const status=root.querySelector(':scope > .hw-detail-feedback'),jump=root.querySelector(':scope > .hw-detail-jump');
  function select(key,announce=false){
   const button=choices.find(x=>x.dataset.detailKey===key),panel=panels.find(x=>x.dataset.detailPanel===key);
   if(!button||!panel)return;
   choices.forEach(x=>x.setAttribute('aria-pressed',String(x===button)));
   panels.forEach(x=>x.hidden=x!==panel);
   root.dataset.currentKey=key;
   if(announce)status.textContent='当前查看：'+panel.querySelector('h3').textContent+'。详情位于汇总表下方。';
  }
  choices.forEach(button=>button.addEventListener('click',()=>select(button.dataset.detailKey,true)));
  select(root.dataset.defaultKey);
  jump.hidden=false;
  jump.addEventListener('click',()=>{
   const current=panels.find(x=>x.dataset.detailPanel===root.dataset.currentKey);
   if(current)current.querySelector('h3').focus();
  });
 });
})();

(()=>{
 const players=[];
 document.querySelectorAll('.hw-audio').forEach(root=>{
  const audio=root.querySelector('audio'),play=root.querySelector('.hw-audio-play'),seek=root.querySelector('.hw-audio-seek');
  const rate=root.querySelector('.hw-audio-rate'),note=root.querySelector('.hw-audio-note'),time=root.querySelector('.hw-audio-time');
  const picker=root.querySelector('.hw-audio-picker'),select=picker.querySelector('select'),title=root.querySelector('.hw-audio-title');
  const tracks=JSON.parse(root.dataset.tracks),rates=[1,1.25,1.5,2];let current=null,rateIndex=0,generation=0;
  const section=root.closest('.section');
  const host=root.dataset.tabset?[...section.querySelectorAll('.tabset')].find(x=>x.dataset.tabsKey===root.dataset.tabset):null;
  players.push({root,audio,host});
  const fmt=n=>Number.isFinite(n)?String(Math.floor(n/60)).padStart(2,'0')+':'+String(Math.floor(n%60)).padStart(2,'0'):'--:--';
  function state(value,message){root.dataset.state=value;const active=value==='playing'||value==='loading'&&!audio.paused;play.classList.toggle('is-playing',active);play.setAttribute('aria-label',active?'暂停录音':'播放录音');if(message!==undefined)note.textContent=message;}
  function paint(){
   const duration=audio.duration,position=audio.currentTime||0,p=Number.isFinite(duration)&&duration>0?position/duration*100:0;
   seek.value=String(p);seek.style.setProperty('--p',p+'%');seek.disabled=!Number.isFinite(duration)||duration<=0||root.dataset.state==='error';
   seek.setAttribute('aria-valuetext',fmt(position)+'，共 '+fmt(duration));time.textContent=fmt(position)+' / '+fmt(duration);
  }
  function load(key){
   const track=tracks.find(x=>x.key===key);if(!track||current?.key===key)return;
   generation++;audio.pause();current=track;title.textContent=track.title;select.value=key;rateIndex=0;rate.textContent='1×';rate.setAttribute('aria-label','播放速度 1 倍');audio.playbackRate=1;
   root.querySelectorAll('[data-transcript-key]').forEach(x=>x.hidden=x.dataset.transcriptKey!==key);
   play.disabled=!track.src;rate.disabled=!track.src;seek.disabled=true;seek.value='0';seek.style.setProperty('--p','0%');time.textContent='00:00 / --:--';
   if(track.src){audio.removeAttribute('src');state('ready','按播放键收听');}
   else{audio.removeAttribute('src');state('empty','这段录音待补充');}
   audio.load();
  }
  play.addEventListener('click',async()=>{
   if(!current?.src)return;
   if(!audio.paused){audio.pause();return;}
   const token=generation;if(!audio.hasAttribute('src')){audio.src=current.src;audio.load();}audio.playbackRate=rates[rateIndex];state('loading','正在加载录音');
   try{await audio.play();}
   catch(error){if(token!==generation||!current?.src)return;if(error.name==='AbortError'&&audio.paused){state('paused','已暂停');return;}state('error',error.name==='NotAllowedError'?'播放未获允许，请再次点击':'录音加载失败，请检查文件或地址');play.disabled=false;seek.disabled=true;}
  });
  audio.addEventListener('play',()=>{players.forEach(p=>{if(p.audio!==audio)p.audio.pause();});state('loading','正在加载录音');});
  audio.addEventListener('playing',()=>state('playing','播放中'));
  audio.addEventListener('waiting',()=>{if(!audio.paused)state('loading','正在缓冲录音');});
  audio.addEventListener('pause',()=>{if(current?.src&&['playing','loading'].includes(root.dataset.state))state('paused','已暂停');});
  audio.addEventListener('ended',()=>state('paused','播放结束，可重新播放'));
  audio.addEventListener('error',()=>{if(!current?.src||!audio.hasAttribute('src'))return;state('error','录音加载失败，请检查文件或地址');seek.disabled=true;});
  audio.addEventListener('loadedmetadata',paint);audio.addEventListener('timeupdate',paint);
  seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration)){audio.currentTime=Number(seek.value)/100*audio.duration;paint();}});
  rate.addEventListener('click',()=>{rateIndex=(rateIndex+1)%rates.length;audio.playbackRate=rates[rateIndex];rate.textContent=rates[rateIndex]+'×';rate.setAttribute('aria-label','播放速度 '+rates[rateIndex]+' 倍');});
  select.addEventListener('change',()=>load(select.value));
  if(host){picker.hidden=true;host.addEventListener('hb:tabchange',e=>{if(e.target===host)load(e.detail.key);});}
  root.classList.add('is-enhanced');root.querySelector('.hw-audio-bar').hidden=false;
  load(host?.querySelector('.tab-head.on')?.dataset.tabKey||root.dataset.default);
 });
 function pauseHidden(){players.forEach(p=>{if(!p.root.getClientRects().length||p.host&&!p.host.getClientRects().length)p.audio.pause();});}
 document.addEventListener('hb:tabchange',pauseHidden);
 document.addEventListener('toggle',pauseHidden,true);
 document.getElementById('home-btn')?.addEventListener('click',()=>players.forEach(p=>p.audio.pause()));
 const visibility=new MutationObserver(pauseHidden),watched=new Set();
 players.forEach(p=>{for(let parent=p.root.parentElement;parent;parent=parent.parentElement){if(!watched.has(parent)){visibility.observe(parent,{attributes:true,attributeFilter:['hidden','class']});watched.add(parent);}}});
 window.addEventListener('pagehide',()=>players.forEach(p=>p.audio.pause()));
 window.addEventListener('hb:sectionchange',pauseHidden);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)players.forEach(p=>p.audio.pause());});
})();

/* hw-section-navigation:start v1 */
(()=>{
 const groups=[...document.querySelectorAll('.hw-section-jump')].map(nav=>{
  const section=nav.closest('.section');if(!section)return null;
  let links=nav.querySelector('.hw-section-jump-links');
  if(!links){links=document.createElement('div');links.className='hw-section-jump-links';[...nav.querySelectorAll('button[data-scroll]')].forEach(b=>links.append(b));nav.append(links);}
  const buttons=[...links.querySelectorAll('button[data-scroll]')];
  const targets=buttons.map(b=>[...section.querySelectorAll('[data-hw-anchor]')].find(t=>t.dataset.hwAnchor===b.dataset.scroll));
  buttons.forEach((b,i)=>{if(targets[i]?.id)b.setAttribute('aria-controls',targets[i].id);});
  return {nav,section,links,buttons,targets,current:null};
 }).filter(Boolean);
 if(!groups.length)return;
 const visible=x=>!!x?.getClientRects().length;
 const header=document.querySelector('body > .topbar');let pending=false;
 function reveal(g,b){
  const r=b.getBoundingClientRect(),box=g.links.getBoundingClientRect();
  if(r.left<box.left)g.links.scrollLeft-=box.left-r.left+4;
  else if(r.right>box.right)g.links.scrollLeft+=r.right-box.right+4;
 }
 function mark(g,index){
  const button=g.buttons[index]||null;if(g.current===button)return;g.current=button;
  g.buttons.forEach(b=>{if(b===button)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');});
  if(button)reveal(g,button);
 }
 function update(){
  pending=false;const top=visible(header)?Math.max(0,header.getBoundingClientRect().bottom):0,seen=new Set();
  groups.forEach(g=>{
   const shown=visible(g.nav),primary=shown&&!seen.has(g.section);if(primary)seen.add(g.section);
   g.nav.classList.toggle('is-primary',primary);
   if(!shown){mark(g,-1);return;}
   const value=top+'px';if(g.nav.style.getPropertyValue('--hw-section-top')!==value)g.nav.style.setProperty('--hw-section-top',value);
   const rect=g.nav.getBoundingClientRect();g.nav.classList.toggle('is-stuck',primary&&Math.abs(rect.top-top)<2);
   const sticky=primary?g.nav:groups.find(x=>x.section===g.section&&x.nav.classList.contains('is-primary'))?.nav;
   const offset=top+(sticky?.getBoundingClientRect().height||0)+24,margin=offset+'px';
   if(primary&&g.section.style.getPropertyValue('--hw-anchor-offset')!==margin)g.section.style.setProperty('--hw-anchor-offset',margin);
   const entries=g.targets.map((target,index)=>({target,index})).filter(x=>visible(x.target)).sort((a,b)=>a.target.getBoundingClientRect().top-b.target.getBoundingClientRect().top);
   let current=entries[0]?.index??-1;
   for(const x of entries){if(x.target.getBoundingClientRect().top<=offset+4)current=x.index;}
   if(scrollY+innerHeight>=document.documentElement.scrollHeight-2&&entries.length)current=entries.at(-1).index;
   mark(g,current);
  });
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(update);}}
 document.addEventListener('click',e=>{
  const button=e.target.closest('.hw-section-jump [data-scroll]');if(!button)return;
  const g=groups.find(x=>x.nav.contains(button)),target=g?.targets[g.buttons.indexOf(button)];if(!visible(target))return;
  update();
  const primary=groups.find(x=>x.section===g.section&&x.nav.classList.contains('is-primary'));
  const offset=(visible(header)?Math.max(0,header.getBoundingClientRect().bottom):0)+(primary?.nav.getBoundingClientRect().height||0)+24;
  target.focus({preventScroll:true});
  window.scrollTo({top:scrollY+target.getBoundingClientRect().top-offset,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  schedule();
 });
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('hb:sectionchange',schedule);
 document.addEventListener('toggle',schedule,true);
 const observer=new ResizeObserver(schedule);if(header)observer.observe(header);
 new Set(groups.map(g=>g.section)).forEach(s=>observer.observe(s));groups.forEach(g=>observer.observe(g.nav));
 document.fonts?.ready.then(schedule);update();
})();
/* hw-section-navigation:end */

})();
