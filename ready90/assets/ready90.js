(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const tabs=$$('.tab'), panels=$$('.panel'), ids=tabs.map(t=>t.getAttribute('aria-controls'));
  const base=new URL(document.querySelector('base').href), chapters=$('#chapters');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const behavior=()=>reduce.matches?'instant':'smooth';
  let feedbackTimer;
  function notify(message){$('#feedback').textContent=message;clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>{$('#feedback').textContent='';},4500);}
  function headerSize(){document.documentElement.style.setProperty('--header-height',$('.site-top').offsetHeight+'px');}
  headerSize();addEventListener('resize',headerSize);
  function route(){const hash=decodeURIComponent(location.hash.slice(1));if(ids.includes(hash))return hash;const tail=location.pathname.slice(base.pathname.length).split('/')[0];return ids.includes(tail)?tail:ids[0];}
  function show(id,{scroll=false,push=false,focus=false}={}){
    if(!ids.includes(id))return;
    tabs.forEach(tab=>{const selected=tab.getAttribute('aria-controls')===id;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
    panels.forEach(panel=>{panel.hidden=panel.id!==id;panel.classList.toggle('on',panel.id===id);const heading=panel.querySelector('.ph h1,.ph h3');const tag=panel.id===id&&document.body.classList.contains('chapter-route')?'H1':'H3';if(heading.tagName!==tag){const replacement=document.createElement(tag);replacement.textContent=heading.textContent;heading.replaceWith(replacement);}});
    document.body.dataset.chapter=id;
    const active=$('#'+id),title=active.querySelector('.ph h1,.ph h3').textContent;
    $('#crumb-title').textContent=title;
    if(push){const url=new URL(id+'/',base);if(location.pathname!==url.pathname||location.hash)history.pushState({chapter:id},'',url.pathname);}
    const isHome=location.pathname===base.pathname&&!ids.includes(location.hash.slice(1));
    document.title='Ready90 · '+(isHome?'90-Day Family Preparedness Game Plan':title)+' | Dreams Business Resources';
    const url=new URL(isHome?'./':id+'/',base);$('link[rel="canonical"]').href='https://renewalsforlifestyle.com'+url.pathname;
    const tab=$('#t-'+id),bar=$('.tabbar');
    if(bar.scrollWidth>bar.clientWidth){bar.scrollTo({left:tab.offsetLeft-bar.offsetLeft-(bar.clientWidth-tab.offsetWidth)/2,behavior:behavior()});}
    if(scroll)chapters.scrollIntoView({behavior:behavior(),block:'start'});
    if(focus)active.focus({preventScroll:true});
    sync();
  }
  $$('[data-go]').forEach(link=>link.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
    event.preventDefault();show(link.dataset.go,{scroll:!link.classList.contains('tab'),push:true});
  }));
  tabs.forEach((tab,index)=>tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight')next=(index+1)%ids.length;
    if(event.key==='ArrowLeft')next=(index-1+ids.length)%ids.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=ids.length-1;
    if(event.key===' '){event.preventDefault();show(ids[index],{push:true});return;}
    if(next!==undefined){event.preventDefault();show(ids[next],{push:true});tabs[next].focus({preventScroll:true});}
  }));
  $$('[data-next],[data-prev],[data-first]').forEach(button=>button.addEventListener('click',()=>{const current=ids.indexOf(document.body.dataset.chapter);const next=button.hasAttribute('data-first')?0:current+(button.hasAttribute('data-next')?1:-1);show(ids[Math.max(0,Math.min(ids.length-1,next))],{scroll:true,push:true,focus:true});}));
  addEventListener('popstate',()=>show(route(),{scroll:true}));
  addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(ids.includes(id))show(id,{scroll:true});});
  // Hash links always target the current document, even with a shared base URL.
  $$('a[href^="#"]:not([data-go])').forEach(link=>link.addEventListener('click',event=>{
    const id=link.getAttribute('href').slice(1);const target=document.getElementById(id);if(!target)return;
    event.preventDefault();target.scrollIntoView({behavior:behavior(),block:'start'});if(link.classList.contains('skip')){$('#'+document.body.dataset.chapter).focus({preventScroll:true});}
  }));
  $$('.share-chapter').forEach(button=>button.addEventListener('click',async()=>{const link='https://renewalsforlifestyle.com/ready90/'+document.body.dataset.chapter+'/';try{await navigator.clipboard.writeText(link);notify('Chapter link copied. Ready to share.');}catch{notify('Chapter link: '+link);}}));
  $$('.print-chapter').forEach(button=>button.addEventListener('click',()=>window.print()));
  const ppl=$('#ppl'), dayButtons=$$('#days button');let days=90;
  function calc(){const people=Number(ppl.value),factor=people*days/360;
    $('#pplv').textContent=people;ppl.setAttribute('aria-valuetext',people+' people');
    $('#o-water').textContent=(people*days).toLocaleString('en-US');
    $('#o-cal').textContent=(people*days*2000).toLocaleString('en-US');
    $('#o-rice').textContent=(Math.ceil(150*factor*10)/10).toLocaleString('en-US')+' lb';
    $('#o-beans').textContent=(Math.ceil(50*factor*10)/10).toLocaleString('en-US')+' lb';
    $('#o-pb').textContent=Math.max(1,Math.ceil(12*factor));
    $('#o-cost').textContent='~$'+Math.round(670*factor).toLocaleString('en-US');
    dayButtons.forEach(button=>{const on=Number(button.dataset.d)===days;button.classList.toggle('on',on);button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',button.dataset.d+' days');});
  }
  ppl.addEventListener('input',calc);dayButtons.forEach(button=>button.addEventListener('click',()=>{days=Number(button.dataset.d);calc();}));calc();
  const boxes=$$('#checklist input'),key='ready90-cart-v2';let saved={},undo;
  const itemKey=box=>box.parentElement.querySelector('span').textContent.trim();
  try{const value=JSON.parse(localStorage.getItem(key)||'{}');if(value&&typeof value==='object'&&!Array.isArray(value))saved=value;}catch{}
  boxes.forEach(box=>{box.checked=Boolean(saved[itemKey(box)]);box.addEventListener('change',update);});
  function update(){const value=Object.fromEntries(boxes.map(box=>[itemKey(box),box.checked]));const count=boxes.filter(box=>box.checked).length;
    $('#ckn').textContent=count;$('#ckt').textContent=boxes.length;$('#ckbar').style.width=(count/boxes.length*100)+'%';
    $('.prog').setAttribute('role','progressbar');$('.prog').setAttribute('aria-label','Shopping checklist progress');$('.prog').setAttribute('aria-valuemin','0');$('.prog').setAttribute('aria-valuemax',String(boxes.length));$('.prog').setAttribute('aria-valuenow',String(count));
    try{localStorage.setItem(key,JSON.stringify(value));}catch{const note=$('#cart .ph p');note.textContent='Check items as you buy them. Storage is unavailable in this browser; this visit’s changes may not be saved.';}
  }
  $('#ckreset').addEventListener('click',()=>{if(undo){boxes.forEach((box,i)=>box.checked=undo[i]);undo=null;$('#ckreset').textContent='Reset checklist';notify('Checklist restored.');}else{undo=boxes.map(box=>box.checked);boxes.forEach(box=>box.checked=false);$('#ckreset').textContent='Undo reset';notify('Checklist reset. Use Undo reset to restore it.');}update();});update();
  addEventListener('storage',event=>{if(event.key!==key)return;try{const values=JSON.parse(event.newValue||'{}');boxes.forEach(box=>box.checked=Boolean(values[itemKey(box)]));update();}catch{}});
  const sections=[['hero','Top'],['pillars','Essentials'],['chapters','Chapters'],['calculator','Calculator'],['videos','Videos'],['sources','Sources'],['download','Brochure'],['footer','Dreams']].map(([id,label])=>({el:$('#'+id),id,label})).filter(s=>s.el);
  const dots=$('#dots');sections.forEach(section=>{const link=document.createElement('a');link.href='#'+section.id;link.setAttribute('aria-label','Go to '+section.label);link.dataset.section=section.id;const span=document.createElement('span');span.textContent=section.label;link.append(span);link.addEventListener('click',event=>{event.preventDefault();section.el.scrollIntoView({behavior:behavior(),block:'start'});});dots.append(link);});
  const visibleSections=()=>sections.filter(section=>section.el.getClientRects().length>0);
  function current(){const items=visibleSections();const edge=$('.site-top').offsetHeight+50;let index=0;items.forEach((section,i)=>{if(section.el.getBoundingClientRect().top<=edge)index=i;});return {items,index};}
  function go(direction){const {items,index}=current();const edge=$('.site-top').offsetHeight+50;let next=index+direction;if(direction<0&&items[index].el.getBoundingClientRect().top<edge-70)next=index;if(next<0){window.scrollTo({top:0,behavior:behavior()});return;}if(next>=items.length){window.scrollTo({top:document.documentElement.scrollHeight,behavior:behavior()});return;}items[next].el.scrollIntoView({behavior:behavior(),block:'start'});}
  function sync(){if(!dots)return;const {items,index}=current();const end=window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-5;[...dots.children].forEach(link=>{const section=sections.find(x=>x.id===link.dataset.section);link.hidden=!section.el.getClientRects().length;const selected=link.dataset.section===(end?items.at(-1).id:items[index].id);link.classList.toggle('on',selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});$('#up').disabled=scrollY<8;$('#down').disabled=end;}
  $('#up').addEventListener('click',()=>go(-1));$('#down').addEventListener('click',()=>go(1));
  let frame=false;addEventListener('scroll',()=>{if(!frame){frame=true;requestAnimationFrame(()=>{sync();frame=false;});}},{passive:true});addEventListener('resize',sync);
  const initial=route();const home=!document.body.classList.contains('chapter-route')&&!ids.includes(location.hash.slice(1));
  if(!home)show(initial);else{document.body.dataset.chapter=initial;sync();}
  if(ids.includes(location.hash.slice(1)))requestAnimationFrame(()=>chapters.scrollIntoView({behavior:'instant',block:'start'}));
})();
