/* Mike & Mary Ann's DREAMS Income Asset Builder
   No tracking, external services, or server dependency. Browser-only local storage. */
(() => {
  'use strict';
  const STORAGE_KEY='dreams-mikeandmary-public-v1';
  const seeds={
    recurring:[
      ['social','Social Security',0,'♛'],
      ['champ','CHAMP Plan',0,'✦'],
      ['erc','ERC',0,'▥'],
      ['quantum','Quantum',0,'◈'],
      ['taxprep','Tax Prep Advocates',0,'▣'],
      ['grouphealth','Group Health',0,'✚'],
      ['individual','Individual Health',0,'♡'],
      ['technology','DREAMS Technology',0,'▱'],
      ['bundle','DREAMS Bundle',0,'◫'],
      ['ai','AI Products',0,'✳'],
      ['channel','Channel Partners',0,'♧']
    ],
    linear:[
      ['vantage','Life & Annuities — Vantage',0,'◇'],
      ['trusolutions','TruSolutions',0,'✚'],
      ['goall','GOALL',0,'▥'],
      ['allianz','Allianz',0,'△'],
      ['bankbreezy','Bank Breezy',0,'♧'],
      ['tariffs','Tariff Refunds',0,'▤'],
      ['licensing','AI Data Licensing',0,'✳'],
      ['energy','Energy',0,'ϟ']
    ],
    rate:5,
    retention:100,
    stopped:true
  };
  const fresh=()=>({recurring:seeds.recurring.map(([id,name,amount,icon])=>({id,name,amount,icon})),linear:seeds.linear.map(([id,name,amount,icon])=>({id,name,amount,icon})),rate:seeds.rate,retention:seeds.retention,stopped:seeds.stopped});
  const $=id=>document.getElementById(id);
  const format=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const amount=v=>clamp(Number.isFinite(Number(v))?Number(v):0,0,1e9);
  const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state=fresh(),toastTimer=null;
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.recurring) && Array.isArray(saved.linear)) state=validate(saved);
  }catch(e){ /* private browsing can disable storage; calculator remains usable */ }
  function validate(raw){
    const clean=kind=>(Array.isArray(raw[kind])?raw[kind]:[]).slice(0,100).map((e,i)=>({id:String(e.id||`${kind}-${i}`).slice(0,80),name:String(e.name||'Additional income').slice(0,90),amount:amount(e.amount),icon:String(e.icon||'✦').slice(0,2)}));
    return {recurring:clean('recurring'),linear:clean('linear'),rate:clamp(Number(raw.rate)||5,.5,20),retention:clamp(Number.isFinite(Number(raw.retention))?Number(raw.retention):100,50,100),stopped:raw.stopped!==false};
  }
  function save(){
    const notice=$('storageStatus');
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));notice.textContent='Saved in this browser. Use Save backup to keep a separate copy.';notice.classList.remove('storage-warning');}
    catch(e){notice.textContent='Autosave is unavailable in this browser. Use Save backup before leaving.';notice.classList.add('storage-warning');}
  }
  function toast(msg){const box=$('toast');box.textContent=msg;box.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.classList.remove('show'),3200);}
  const sum=kind=>state[kind].reduce((n,s)=>n+amount(s.amount),0);
  function renderRows(kind){
    const root=$(kind==='recurring'?'recurringRows':'linearRows');
    root.innerHTML=state[kind].map((item,i)=>{
      const max=50000;
      return `<div class="income-row" data-kind="${kind}" data-index="${i}">
        <label class="source-name" for="${kind}-amount-${i}" title="${escapeHTML(item.name)}"><span class="source-icon" aria-hidden="true">${escapeHTML(item.icon)}</span><span class="source-label">${escapeHTML(item.name)}</span></label>
        <input class="amount-slider" type="range" min="0" max="${max}" step="50" value="${Math.min(item.amount,max)}" aria-label="Adjust ${escapeHTML(item.name)} income from zero to fifty thousand dollars">
        <div class="amount-box"><span aria-hidden="true">$</span><input id="${kind}-amount-${i}" class="amount-input" inputmode="decimal" type="number" min="0" max="1000000000" step="50" value="${item.amount}" aria-label="${escapeHTML(item.name)} amount in dollars"></div>
        <button type="button" class="remove-stream" title="Remove ${escapeHTML(item.name)}" aria-label="Remove ${escapeHTML(item.name)}" data-remove="true">×</button>
      </div>`;
    }).join('');
  }
  let reduceMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animators={};
  function numberDisplay(id,value,animate=true){
    const el=$(id);if(!el)return;
    if(animators[id])cancelAnimationFrame(animators[id]);
    const previous=Number(el.dataset.number);
    el.dataset.number=String(value);el.classList.toggle('is-large-number',Math.abs(value)>=100000000);
    if(!animate||reduceMotion||!Number.isFinite(previous)||previous===value){el.textContent=format(value);return;}
    const start=performance.now(),duration=400;
    const frame=time=>{
      const t=clamp((time-start)/duration,0,1),easing=1-Math.pow(1-t,3);
      el.textContent=format(previous+(value-previous)*easing);
      if(t<1)animators[id]=requestAnimationFrame(frame);
    };
    animators[id]=requestAnimationFrame(frame);
  }
  function update(animate=true){
    const rec=sum('recurring'),lin=sum('linear'),rate=clamp(state.rate,.5,20),capital=rec*12/(rate/100);
    numberDisplay('capitalValue',capital,animate);numberDisplay('recMonthly',rec,animate);numberDisplay('recAnnual',rec*12,animate);
    numberDisplay('linMonthly',lin,animate);numberDisplay('combinedMonthly',rec+lin,animate);
    numberDisplay('recFooter',rec*12,animate);numberDisplay('linFooter',lin,animate);
    numberDisplay('stopRec',rec,animate);numberDisplay('stopCapital',capital,animate);
    numberDisplay('stopLinear',state.stopped?0:lin,animate);
    $('recChip').textContent=`${format(rec)} / mo`;$('linChip').textContent=`${format(lin)} / mo`;
    $('stopLinearText').textContent=state.stopped?'No new transactions modeled after stopping sales.':'Assumes new one-time commissions are earned every month at the current entered level.';
    $('rateRange').value=String(rate);
    if(document.activeElement!==$('rateValue'))$('rateValue').value=String(rate);
    $('retention').value=String(state.retention);$('retentionOutput').textContent=`${state.retention}%`;
    $('stopToggle').checked=state.stopped;
    drawChart(rec,lin);
    save();
  }
  function onRows(event){
    const el=event.target,wrap=el.closest('.income-row');if(!wrap)return;
    const kind=wrap.dataset.kind,idx=Number(wrap.dataset.index),item=state[kind]?.[idx];if(!item)return;
    if(event.type==='click'&&el.closest('[data-remove]')){
      if(window.confirm(`Remove "${item.name}" from this calculator?`)){
        state[kind].splice(idx,1);renderRows(kind);update();toast('Income stream removed.');
      }
      return;
    }
    if(event.type!=='input')return;
    if(el.classList.contains('amount-slider')){
      item.amount=amount(el.value);
      wrap.querySelector('.amount-input').value=String(item.amount);
    }else if(el.classList.contains('amount-input')){
      item.amount=amount(el.value);
      const slider=wrap.querySelector('.amount-slider');
      slider.value=String(Math.min(item.amount,50000));
    }else{return;}
    update();
  }
  function addStream(kind){
    const label=kind==='recurring'?'recurring':'one-time';
    const name=window.prompt(`Name of new ${label} income stream:`);
    if(name===null)return;
    const clean=name.trim().slice(0,70);
    if(!clean){toast('Please enter an income stream name.');return;}
    const id=`custom-${Date.now()}-${Math.floor(Math.random()*10000)}`;
    state[kind].push({id,name:clean,amount:0,icon:'✦'});
    renderRows(kind);update();
    $(kind==='recurring'?'recurringRows':'linearRows').querySelector('.income-row:last-child .amount-input')?.focus();
    toast(`Added ${clean}.`);
  }
  function download(filename,contents,mime){
    const a=document.createElement('a'),url=URL.createObjectURL(new Blob([contents],{type:mime}));
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);
  }
  function exportCSV(){
    const rows=[['Category','Income source','Monthly amount'],...state.recurring.map(e=>['Recurring',e.name,e.amount]),...state.linear.map(e=>['One-time',e.name,e.amount]),['TOTAL RECURRING','',sum('recurring')],['TOTAL ONE-TIME','',sum('linear')],['ANNUITY INCOME EQUIVALENT','',sum('recurring')*12/(state.rate/100)]];
    const cell=v=>typeof v==='string'&&/^[\s]*[=+@-]/.test(v)?"'"+v:String(v);
    const csv='\ufeff'+rows.map(row=>row.map(v=>`"${cell(v).replaceAll('"','""')}"`).join(',')).join('\r\n');
    download('Mike-and-Mary-Ann-Income-Streams.csv',csv,'text/csv;charset=utf-8');toast('CSV downloaded.');
  }
  function saveBackup(){
    download('Mike-and-Mary-Ann-Income-Backup.json',JSON.stringify({...state,formatVersion:2,exportedAt:new Date().toISOString()},null,2),'application/json');toast('Private income backup downloaded.');
  }
  function drawChart(rec,lin){
    const W=720,H=264,l=66,r=25,t=25,b=45,innerW=W-l-r,innerH=H-t-b;
    const years=[0,1,2,3,4,5];
    const recurring=years.map(y=>rec*Math.pow(state.retention/100,y));
    const linear=years.map(y=>y===0?lin:(state.stopped?0:lin));
    $('chartEmpty').hidden=rec>0||lin>0;
    $('chart').hidden=rec===0&&lin===0;
    $('cashflowTable').innerHTML=years.map((year,i)=>`<tr><th scope="row">${year?'Year '+year:'Now'}</th><td>${format(recurring[i])}</td><td>${format(linear[i])}</td></tr>`).join('');
    const roughStep=Math.max(.01,...recurring,...linear)*1.15/4;
    const magnitude=10**Math.floor(Math.log10(roughStep));
    const tickStep=[1,2,2.5,5,10].find(step=>step>=roughStep/magnitude)*magnitude;
    const max=tickStep*4;
    const axisLabel=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:v>=1000?'compact':'standard',maximumFractionDigits:v>=1000?1:(v>0&&v<1?2:0)}).format(v);
    const x=i=>l+(i/(years.length-1))*innerW;
    const y=v=>t+innerH-(v/max)*innerH;
    const point=(values)=>values.map((v,i)=>`${i?'L':'M'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ');
    const area=point(recurring)+` L${x(5)},${y(0)} L${x(0)},${y(0)} Z`;
    let svg=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="recArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26eba5" stop-opacity=".34"/><stop offset="1" stop-color="#26eba5" stop-opacity="0"/></linearGradient><filter id="softGlow"><feGaussianBlur stdDeviation="3.4"/></filter></defs>`;
    for(let i=0;i<=4;i++){
      const v=max*i/4,yy=y(v);
      svg+=`<line x1="${l}" x2="${W-r}" y1="${yy}" y2="${yy}" stroke="#37688b" stroke-opacity=".36" stroke-dasharray="4 7"/><text x="${l-9}" y="${yy+4}" fill="#99b3ca" text-anchor="end" font-size="12">${axisLabel(v)}</text>`;
    }
    years.forEach((yr,i)=>svg+=`<text x="${x(i)}" y="${H-13}" text-anchor="middle" fill="#a6c3d5" font-size="13">${yr?'Yr '+yr:'Now'}</text>`);
    svg+=`<path d="${area}" fill="url(#recArea)"/><path d="${point(recurring)}" fill="none" stroke="#60ffc0" stroke-opacity=".25" stroke-width="8" filter="url(#softGlow)"/><path d="${point(recurring)}" fill="none" stroke="#61ffc0" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="${point(linear)}" fill="none" stroke="#ff718a" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="7 5"/>`;
    recurring.forEach((v,i)=>svg+=`<circle cx="${x(i)}" cy="${y(v)}" r="4.4" fill="#66ffbd" stroke="#063a38" stroke-width="2"><title>${i?'Year '+i:'Now'}: ${format(v)} monthly recurring income</title></circle>`);
    linear.forEach((v,i)=>svg+=`<circle cx="${x(i)}" cy="${y(v)}" r="3.7" fill="#ff7890" stroke="#3b1d29" stroke-width="1.5"><title>${i?'Year '+i:'Now'}: ${format(v)} one-time new sales income</title></circle>`);
    svg+='</svg>';
    const chart=$('chart');chart.innerHTML=svg;
    chart.setAttribute('aria-label',`Five-year illustrative monthly income: existing recurring ${format(rec)} now and ${format(recurring[5])} in year five assuming ${state.retention}% annual retention. One-time sales ${format(lin)} now; future one-time sales ${state.stopped?'zero after sales stop':'remain at '+format(lin)+' per month only if new sales are repeated'}.`);
  }
  function setRate(value){
    const parsed=Number(value);
    if(!Number.isFinite(parsed)||parsed<=0)return;
    state.rate=clamp(parsed,.5,20);update();
  }
  function bind(){
    ['recurringRows','linearRows'].forEach(id=>{const node=$(id);node.addEventListener('input',onRows);node.addEventListener('click',onRows);});
    document.querySelectorAll('[data-kind].add-stream').forEach(btn=>btn.addEventListener('click',()=>addStream(btn.dataset.kind)));
    $('rateRange').addEventListener('input',e=>setRate(e.target.value));
    $('rateValue').addEventListener('input',e=>{if(e.target.value!=='')setRate(e.target.value);});
    $('rateValue').addEventListener('blur',e=>{e.target.value=String(state.rate);});
    $('retention').addEventListener('input',e=>{state.retention=clamp(Number(e.target.value),50,100);update(false);});
    $('stopToggle').addEventListener('change',e=>{state.stopped=e.target.checked;update(false);});
    $('resetBtn').addEventListener('click',()=>{if(window.confirm('Restore the original starting figures and remove any custom income streams?')){state=fresh();renderAll(false);toast('Original figures restored.');}});
    $('exportCsv').addEventListener('click',exportCSV);
    $('saveBackup').addEventListener('click',saveBackup);
    $('importBackup').addEventListener('click',()=>$('backupFile').click());
    $('backupFile').addEventListener('change',async e=>{
      const file=e.target.files[0];if(!file)return;
      try{
        if(file.size>1_000_000)throw new Error('Backup file is too large.');
        const raw=JSON.parse(await file.text());
        if(!Array.isArray(raw.recurring)||!Array.isArray(raw.linear))throw new Error('Not a valid DREAMS income backup.');
        if(!window.confirm('Replace all current amounts with the numbers in this backup?'))return;
        state=validate(raw);renderAll(false);toast('Backup imported successfully.');
      }catch(err){toast(`Unable to import: ${err.message}`);}finally{e.target.value='';}
    });
    $('printBtn').addEventListener('click',()=>window.print());
    const menu=$('mobileNav'),button=$('menuToggle');
    button.addEventListener('click',()=>{const opening=menu.hasAttribute('hidden');menu.toggleAttribute('hidden',!opening);button.setAttribute('aria-expanded',String(opening));button.setAttribute('aria-label',opening?'Close navigation menu':'Open navigation menu');button.textContent=opening?'×':'☰';});
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.hidden=true;button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open navigation menu');button.textContent='☰';}));
  }
  function renderAll(animate=false){renderRows('recurring');renderRows('linear');update(animate);}
  renderAll(false);bind();
})();
