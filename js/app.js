/* ============================================================
   НЕОН-ГРАД :: APP CORE
   Рендер вкладок, навигация, поиск, горячие клавиши, boot.
   ============================================================ */
(function(){
  const L = window.LORE;
  const $ = (s,c)=> (c||document).querySelector(s);
  const $$ = (s,c)=> Array.from((c||document).querySelectorAll(s));
  const pad = n => String(n).padStart(2,'0');

  /* ---------- BOOT SCREEN ---------- */
  const bootLines = [
    "ЗАРЯ-9 CYBERDECK BIOS v9.31 :: (c) 2099 КОНСОРЦИУМ",
    "ПРОВЕРКА ПАМЯТИ....... 64 ТБ [OK]",
    "НЕЙРО-СОКЕТ........... ПОДКЛЮЧЁН [OK]",
    "ФИЛЬТР ВОЗДУХА........ КЛАСС C [!]",
    "СЕТЕВОЙ УЗЕЛ.......... ГЛУБОКИЙ НЕТ [OK]",
    "ШИФРОВАНИЕ КАНАЛА..... АНОНИМ [OK]",
    "ЗАГРУЗКА АРХИВА НЕОН-ГРАДА...",
    "ОБХОД ЦЕНЗУРЫ ОКО-МЕДИА...... [OK]",
    "ДОСТУП РАЗРЕШЁН. ДОБРО ПОЖАЛОВАТЬ, ГОСТЬ.",
  ];
  function runBoot(){
    const boot = $("#boot");
    const pre = $("#bootText");
    if(sessionStorage.getItem('ng_booted')){ boot.classList.add('hidden'); setTimeout(()=>boot.remove(),50); return; }
    let i=0, buf="";
    (function next(){
      if(i>=bootLines.length){
        buf+="\n> _";
        pre.innerHTML = buf.replace(/_$/,'<span class="cursor"></span>');
        setTimeout(()=>{ boot.classList.add('hidden'); sessionStorage.setItem('ng_booted','1'); setTimeout(()=>boot.remove(),650); }, 700);
        return;
      }
      buf += bootLines[i] + "\n";
      pre.innerHTML = buf + '<span class="cursor"></span>';
      i++;
      setTimeout(next, 160 + Math.random()*140);
    })();
  }

  /* ---------- TICKER ---------- */
  function buildTicker(){
    const t = $("#ticker .track");
    const items = L.ticker.map(x=>`<span>${x}</span>`).join(" ◆ ");
    t.innerHTML = items + " ◆ " + items;
  }

  /* ---------- NAV + PANELS ---------- */
  let current = 0;
  function buildTabs(){
    const nav = $("#tabs");
    const main = $("#main");
    L.tabs.forEach((tab,i)=>{
      const b = document.createElement('button');
      b.innerHTML = `<span class="idx">${pad(i+1)}</span>${tab.nav}`;
      b.dataset.i = i;
      b.addEventListener('click', ()=> show(i));
      nav.appendChild(b);

      const p = document.createElement('section');
      p.className='panel'; p.id='panel-'+tab.id;
      p.innerHTML = `
        <div class="crumb">АРХИВ // <b>${tab.nav.toUpperCase()}</b> // ФАЙЛ ${pad(i+1)}/${pad(L.tabs.length)}</div>
        <h1 class="page-title" data-en="${tab.en}">${tab.title}</h1>
        ${tab.lede?`<div class="lede">${tab.lede}</div>`:''}
        <div class="article">${tab.html}</div>
      `;
      main.appendChild(p);
    });
    // graceful image fallback -> "signal lost" placeholder
    $$('.figure img', main).forEach(img=>{
      img.addEventListener('error', ()=>{
        const box=document.createElement('div');
        box.className='imgfail';
        box.innerHTML='◢◤ СИГНАЛ ПОТЕРЯН ◥◣<small>// изображение недоступно · канал зашумлён</small>';
        img.replaceWith(box);
      });
    });
  }

  function show(i, push){
    i = (i+L.tabs.length)%L.tabs.length;
    current = i;
    $$('#tabs button').forEach((b,bi)=> b.classList.toggle('active', bi===i));
    $$('.panel').forEach((p,pi)=> p.classList.toggle('active', pi===i));
    const tab = L.tabs[i];
    // activate active tab button into view
    const btn = $$('#tabs button')[i];
    if(btn) btn.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});
    window.scrollTo({top:0,behavior:'smooth'});
    if(push!==false) location.hash = tab.id;
    // lazy-init interactive widget
    if(tab.interactive && window.WIDGETS && window.WIDGETS[tab.interactive]){
      try{ window.WIDGETS[tab.interactive](document.getElementById('panel-'+tab.id)); }catch(e){ console.warn(e); }
    }
    document.title = `${tab.title} :: НЕОН-ГРАД 2099`;
  }

  function showById(id){
    const i = L.tabs.findIndex(t=>t.id===id);
    if(i>=0) show(i);
  }

  /* ---------- SEARCH ---------- */
  function buildSearch(){
    const inp = $("#search");
    const box = $("#searchResults");
    // build index
    const idx = L.tabs.map((t,i)=>({
      i, id:t.id, nav:t.nav, title:t.title,
      text:(t.title+' '+t.nav+' '+(t.lede||'')+' '+t.html).replace(/<[^>]+>/g,' ').toLowerCase()
    }));
    function render(q){
      q = q.trim().toLowerCase();
      if(!q){ box.classList.add('hidden'); box.innerHTML=''; return; }
      const res = idx.filter(x=> x.text.includes(q)).slice(0,8);
      if(!res.length){ box.innerHTML = '<div class="sr-item">// НИЧЕГО НЕ НАЙДЕНО</div>'; box.classList.remove('hidden'); return; }
      box.innerHTML = res.map(r=>{
        const pos = r.text.indexOf(q);
        const snip = r.text.slice(Math.max(0,pos-30),pos+50).replace(/</g,'&lt;');
        return `<div class="sr-item" data-i="${r.i}"><b>${r.nav}</b> — <span class="sr-snip">…${snip}…</span></div>`;
      }).join('');
      box.classList.remove('hidden');
      $$('.sr-item',box).forEach(el=> el.addEventListener('click',()=>{
        if(el.dataset.i){ show(+el.dataset.i); box.classList.add('hidden'); inp.value=''; }
      }));
    }
    inp.addEventListener('input', ()=> render(inp.value));
    inp.addEventListener('keydown', e=>{
      if(e.key==='Enter'){ const first=$('.sr-item[data-i]',box); if(first){ show(+first.dataset.i); box.classList.add('hidden'); inp.value=''; } }
      if(e.key==='Escape'){ box.classList.add('hidden'); inp.blur(); }
    });
    document.addEventListener('click', e=>{ if(!box.contains(e.target)&&e.target!==inp) box.classList.add('hidden'); });
  }

  /* ---------- CLOCK ---------- */
  function clock(){
    const el = $("#clock");
    setInterval(()=>{
      const d = new Date();
      el.innerHTML = `<b>${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}</b> НЕОН-ВРЕМЯ`;
    },1000);
  }

  /* ---------- CRT TOGGLE + HOTKEYS ---------- */
  function controls(){
    const crtBtn = $("#crtToggle");
    if(localStorage.getItem('ng_noflick')==='1') document.body.classList.add('noflick');
    crtBtn.addEventListener('click', ()=>{
      document.body.classList.toggle('noflick');
      localStorage.setItem('ng_noflick', document.body.classList.contains('noflick')?'1':'0');
    });
    $("#helpBtn").addEventListener('click', showHelp);
    document.addEventListener('keydown', e=>{
      if(/input|textarea/i.test(e.target.tagName)) { return; }
      if(e.key==='ArrowRight') show(current+1);
      else if(e.key==='ArrowLeft') show(current-1);
      else if(e.key==='/'){ e.preventDefault(); $("#search").focus(); }
      else if(e.key==='?') showHelp();
      else if(e.key.toLowerCase()==='c') crtBtn.click();
    });
  }
  function showHelp(){
    alert("НЕОН-ГРАД 2099 :: ГОРЯЧИЕ КЛАВИШИ\n\n←  →   переключение вкладок\n/       поиск\n?       эта справка\nC       вкл/выкл CRT-эффекты\n\nСверху — 24 вкладки архива. Ищи интерактив: Карта, Терминал, Магазин, Тест, Генератор, Радио, Словарь, Конфигуратор тела.");
  }

  /* ---------- INIT ---------- */
  document.addEventListener('DOMContentLoaded', ()=>{
    runBoot();
    buildTicker();
    buildTabs();
    buildSearch();
    clock();
    controls();
    window.NG = { show, showById };
    const h = location.hash.replace('#','');
    if(h && L.tabs.some(t=>t.id===h)) showById(h); else show(0,false);
    window.addEventListener('hashchange', ()=>{
      const hh = location.hash.replace('#','');
      const i = L.tabs.findIndex(t=>t.id===hh);
      if(i>=0 && i!==current) show(i,false);
    });
  });
})();
