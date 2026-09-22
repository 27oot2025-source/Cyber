/* ============================================================
   НЕОН-ГРАД :: INTERACTIVE WIDGETS
   Все вкладки с интерактивом. Каждая функция получает panel-элемент.
   Флаг data-init предотвращает повторную инициализацию.
   ============================================================ */
(function(){
  const rnd = arr => arr[Math.floor(Math.random()*arr.length)];
  const ri = (a,b)=> Math.floor(Math.random()*(b-a+1))+a;
  const once = (panel,fn)=>{ if(panel.dataset.winit) return true; panel.dataset.winit='1'; fn(); return false; };

  window.WIDGETS = {};

  /* ===================== КАРТА ГОРОДА ===================== */
  const SECTORS = {
    "С1":{n:"ЗЕНИТ",t:"corp",y:"Верхний",d:"Вершина города. Искусственное солнце, воздух класса А, настоящие деревья. Дом Совета Долей."},
    "С2":{n:"ГРАНЬ",t:"corp",y:"Верхний",d:"Пояс корп-башен. Здесь работают, но не живут. Ночью пустеет."},
    "С3":{n:"КУПОЛ",t:"corp",y:"Верхний",d:"Развлекательный ярус элиты. Клубы, где вход стоит годовую зарплату рабочего."},
    "С4":{n:"САД",t:"",y:"Средний",d:"Гидропонные фермы. Кормят полгорода. Охраняются как военный объект."},
    "С5":{n:"ШЕСТЕРНЯ",t:"",y:"Средний",d:"Промзона. Цеха, сборка кибернетики ХРОМ-БИОТЕХ, вечный лязг."},
    "С6":{n:"ПРОВОДА",t:"",y:"Средний",d:"Квартал нетраннеров и техников. Провода как лианы. Чинят деки, торгуют данными."},
    "С7":{n:"ПЛОЩАДЬ",t:"",y:"Средний",d:"Место протестов и разгонов. Здесь чаще всего работает 'Щит-7'."},
    "С8":{n:"КАПСУЛЫ",t:"",y:"Средний",d:"Спальный район. Гробы-капсулы 2x1 метр. Тут спит рабочий класс."},
    "С9":{n:"КОТЁЛ",t:"slum",y:"Средний",d:"Крупнейший ночной рынок. 4000 лавок, ноль налогов. Сердце города."},
    "С10":{n:"ГАВАНЬ",t:"",y:"Средний",d:"Старый порт. Контрабанда через воду. Территория курьеров-призраков."},
    "С11":{n:"ГНЕЗДО",t:"slum",y:"Нижний",d:"Логово Гадюк. Биохак-лаборатории, яды, чёрная медицина."},
    "С12":{n:"МОСТ ПЛАЧА",t:"slum",y:"Нижний",d:"Эстакада-трущоба. 2 млн 'промежуточных' — ни верх, ни низ."},
    "С13":{n:"ЯМА",t:"dead",y:"Нижний",d:"Самое дно. Вечная тьма, вода по колено, закон Гадюк. Не возвращаются."},
    "С14":{n:"АРЕНА",t:"slum",y:"Нижний",d:"Вотчина Хромовых Псов. Кибер-бои, ставки, кодекс чести."},
    "С15":{n:"СВАЛКА",t:"",y:"Нижний",d:"Гора техно-мусора. Стеклодувы ищут здесь 'мёртвые' серверы."},
    "С16":{n:"КИШКИ",t:"dead",y:"Подземье",d:"Затопленное метро старого города. Тайные трассы. Дом 'несуществующих'."},
    "С17":{n:"КОТЛОВАН",t:"dead",y:"Подземье",d:"Заброшенный реактор. Радиация. Сюда не ходит даже Щит-7."},
    "С18":{n:"ПЕРИМЕТР",t:"dead",y:"Стена",d:"Граница с Внешними Пустошами. КПП, турели, отчаявшиеся беглецы."},
  };
  WIDGETS.map = function(panel){
    if(once(panel,()=>{
      const grid = panel.querySelector('#cityMap');
      const info = panel.querySelector('#mapInfo');
      grid.className='map';
      Object.keys(SECTORS).forEach(k=>{
        const s=SECTORS[k];
        const c=document.createElement('div');
        c.className='cell '+(s.t||'');
        c.innerHTML=`<div>${k}<br><b style="font-size:9px">${s.n}</b></div>`;
        c.addEventListener('click',()=>{
          info.innerHTML=`<span class="big">${k} — ${s.n}</span><br><span class="mini">ЯРУС: ${s.y}</span><br><br>${s.d}`;
        });
        grid.appendChild(c);
      });
    })){}
  };

  /* ===================== КОНФИГУРАТОР ТЕЛА ===================== */
  const IMPLANTS = [
    {n:"Оптика «Ястреб»",p:12000,s:8,d:"зум ×20, тепловизор"},
    {n:"Нейро-сокет «Проблеск»",p:28000,s:14,d:"вход в Глубокий Нет"},
    {n:"Рука «Молот»",p:19000,s:16,d:"гидроусилитель ×3"},
    {n:"Ноги «Кузнечик»",p:22000,s:15,d:"прыжок на 6 метров"},
    {n:"Титановый скелет",p:44000,s:26,d:"броня рёбер и костей"},
    {n:"Клинки «Богомол»",p:61000,s:38,d:"выдвижные лезвия в руках"},
    {n:"Подкожная броня",p:33000,s:22,d:"защита от пуль и ножей"},
    {n:"Кофе-печень",p:9000,s:6,d:"нейтрализует токсины и алкоголь"},
    {n:"Второе сердце",p:52000,s:20,d:"дубль на случай остановки"},
    {n:"Тахи-процессор",p:47000,s:31,d:"ускорение реакции ×4"},
    {n:"Голос-синтезатор",p:7000,s:5,d:"имитация любого голоса"},
    {n:"Память-чип +2ТБ",p:16000,s:12,d:"дополнительная память"},
  ];
  WIDGETS.cyberware = function(panel){
    once(panel,()=>{
      const host=panel.querySelector('#cyberBuild');
      host.innerHTML=`<div class="widget">
        <div class="grid2"><div id="impList"></div>
        <div><h3>СВОДКА ТЕЛА</h3>
          <div class="stat"><label>ПСИХИКА / КИБЕРПСИХОЗ <b id="psyVal">0%</b></label><div class="bar"><i id="psyBar" style="width:0%"></i></div></div>
          <div id="psyMsg" class="mini">Тело чистое. Ты пока полностью человек.</div>
          <div class="output" style="margin-top:14px"><span class="mini">УСТАНОВЛЕНО:</span><div id="chosen">— ничего —</div><hr class="hr-neon" style="margin:10px 0"><span class="mini">ИТОГО:</span> <span class="big" id="total">0</span> НК</div>
          <button class="btn m" id="resetBody" style="margin-top:10px">СБРОСИТЬ</button>
        </div></div></div>`;
      const list=host.querySelector('#impList');
      let chosen=[];
      IMPLANTS.forEach((im,i)=>{
        const row=document.createElement('label');
        row.className='fld'; row.style.cssText='display:flex;gap:8px;align-items:center;cursor:pointer;border:1px solid #1c2530;padding:8px;margin:6px 0;text-transform:none';
        row.innerHTML=`<input type="checkbox" data-i="${i}" style="width:auto"> <span><b style="color:var(--neon)">${im.n}</b> <span class="mini">— ${im.d} · ${im.p.toLocaleString('ru')} НК · псих +${im.s}</span></span>`;
        list.appendChild(row);
      });
      function update(){
        let psy=0,tot=0; chosen=[];
        list.querySelectorAll('input:checked').forEach(cb=>{ const im=IMPLANTS[+cb.dataset.i]; psy+=im.s; tot+=im.p; chosen.push(im.n); });
        psy=Math.min(psy,100);
        host.querySelector('#psyVal').textContent=psy+'%';
        const bar=host.querySelector('#psyBar'); bar.style.width=psy+'%';
        bar.style.background = psy>70?'linear-gradient(90deg,#ff3b3b,#ffb300)':psy>40?'linear-gradient(90deg,#ffb300,#00e0ff)':'linear-gradient(90deg,#00ff9c,#00e0ff)';
        const msg=host.querySelector('#psyMsg');
        if(psy===0) msg.innerHTML="Тело чистое. Ты пока полностью человек.";
        else if(psy<40) msg.innerHTML="<span style='color:var(--neon)'>Норма. Ты чувствуешь мир как прежде.</span>";
        else if(psy<70) msg.innerHTML="<span style='color:var(--amber)'>⚠ Риск. Иногда рука движется чуть раньше мысли.</span>";
        else if(psy<100) msg.innerHTML="<span style='color:var(--red)'>☠ ОПАСНО. Ты уже не всегда понимаешь, где кончается металл.</span>";
        else msg.innerHTML="<span style='color:var(--red)'>█ КИБЕРПСИХОЗ. Личность распалась. Ты стал 'пустым'. Игра окончена.</span>";
        host.querySelector('#chosen').innerHTML = chosen.length?chosen.map(c=>'▸ '+c).join('<br>'):'— ничего —';
        host.querySelector('#total').textContent = tot.toLocaleString('ru');
      }
      list.addEventListener('change',update);
      host.querySelector('#resetBody').addEventListener('click',()=>{ list.querySelectorAll('input').forEach(cb=>cb.checked=false); update(); });
    });
  };

  /* ===================== ЧЁРНЫЙ РЫНОК ===================== */
  const GOODS=[
    {n:"Взломщик ЛЬДА «Таран»",c:"СОФТ",p:14000,r:3,d:"пробивает лёд среднего класса"},
    {n:"Память-жемчуг: 'Закат над старым морем'",c:"ПАМЯТЬ",p:3200,r:2,d:"20 минут чужого покоя"},
    {n:"Поддельная личность 'Гражданин'",c:"ДАННЫЕ",p:8000,r:4,d:"чистое досье, пройдёт проверку"},
    {n:"Клинки «Богомол» (б/у)",c:"ХРОМ",p:31000,r:5,d:"без гарантии, лёгкая ржавчина"},
    {n:"Электрошокер «Оса»",c:"ОРУЖИЕ",p:900,r:1,d:"легально в трёх секторах из 18"},
    {n:"Респиратор 'Вдох+' класса А",c:"БЫТ",p:450,r:1,d:"фильтрует красный смог 200 часов"},
    {n:"Демон-разведчик «Крыса»",c:"СОФТ",p:6500,r:3,d:"тихо картирует чужой сервер"},
    {n:"Ампула 'Разгон'",c:"ХИМИЯ",p:120,r:2,d:"боевой стимулятор, 6 часов без сна"},
    {n:"Ствол ЧВК «Щит-7» (упал с грузовика)",c:"ОРУЖИЕ",p:24000,r:5,d:"серийник спилен"},
    {n:"Память-жемчуг: 'Последние минуты' [18+]",c:"ПАМЯТЬ",p:19000,r:5,d:"чей-то реальный конец. мерзость."},
    {n:"НК-чип на предъявителя",c:"ФИНАНСЫ",p:1000,r:2,d:"анонимные деньги, номинал внутри"},
    {n:"Глаз 'Ястреб' (восстановленный)",c:"ХРОМ",p:7000,r:3,d:"зум и тепловизор, чуть тормозит"},
  ];
  WIDGETS.shop=function(panel){
    once(panel,()=>{
      const host=panel.querySelector('#shopWidget');
      let credits=25000, cart=[];
      host.innerHTML=`<div class="widget">
        <div class="radio-face" style="justify-content:space-between">
          <h3 class="mt0">▚ ТОРГОВЫЙ ТЕРМИНАЛ «КОТЁЛ»</h3>
          <div>БАЛАНС: <span class="big" id="cred">25 000</span> НК</div>
        </div>
        <div class="pill-row" id="filters"></div>
        <div class="grid2" id="goods"></div>
        <div class="output" id="cartBox"><span class="mini">КОРЗИНА ПУСТА. Осторожнее с покупками — рынок не возвращает деньги.</span></div>
      </div>`;
      const cats=['ВСЕ',...new Set(GOODS.map(g=>g.c))];
      const fl=host.querySelector('#filters'); let filter='ВСЕ';
      cats.forEach(c=>{ const b=document.createElement('button'); b.className='tag'; b.style.cursor='pointer'; b.textContent=c; b.onclick=()=>{filter=c; fl.querySelectorAll('button').forEach(x=>x.classList.remove('a')); b.classList.add('a'); render();}; if(c==='ВСЕ')b.classList.add('a'); fl.appendChild(b); });
      const goods=host.querySelector('#goods');
      const credEl=host.querySelector('#cred');
      const cartBox=host.querySelector('#cartBox');
      function stars(r){return '★'.repeat(r)+'☆'.repeat(5-r);}
      function render(){
        goods.innerHTML='';
        GOODS.filter(g=>filter==='ВСЕ'||g.c===filter).forEach(g=>{
          const owned=cart.includes(g);
          const card=document.createElement('div'); card.className='card';
          card.innerHTML=`<span class="tag m">${g.c}</span><h3 style="font-size:15px;margin:6px 0">${g.n}</h3>
            <p class="mini">${g.d}</p><p class="mini" style="color:var(--red)">риск: ${stars(g.r)}</p>
            <div class="radio-face" style="justify-content:space-between"><b style="color:var(--amber)">${g.p.toLocaleString('ru')} НК</b>
            <button class="btn" ${owned?'disabled style="opacity:.4"':''}>${owned?'КУПЛЕНО':'КУПИТЬ'}</button></div>`;
          const btn=card.querySelector('button');
          if(!owned) btn.onclick=()=>{
            if(credits<g.p){ cartBox.innerHTML='<span style="color:var(--red)">✖ НЕДОСТАТОЧНО КРЕДИТОВ. Иди зарабатывай, чумба.</span>'; return; }
            credits-=g.p; cart.push(g);
            credEl.textContent=credits.toLocaleString('ru');
            const warn = g.r>=4?'<br><span style="color:var(--red)" class="mini">⚠ товар высокого риска. Продавец растворился в толпе.</span>':'';
            cartBox.innerHTML=`<span class="mini">В КОРЗИНЕ:</span><br>${cart.map(x=>'▸ '+x.n).join('<br>')}${warn}`;
            render();
          };
          goods.appendChild(card);
        });
      }
      render();
    });
  };

  /* ===================== ТЕСТ: ФРАКЦИЯ ===================== */
  const QUIZ=[
    {q:"Тебе в руки попал чужой корп-секрет. Что делаешь?",a:[
      {t:"Продам тому, кто больше даст",f:"pepel"},{t:"Использую как рычаг давления",f:"pepel"},
      {t:"Опубликую — люди должны знать",f:"podpolie"},{t:"Уничтожу, мне не нужны проблемы",f:"psy"}]},
    {q:"Твоё отношение к кибернетике?",a:[
      {t:"Больше металла — больше меня",f:"psy"},{t:"Инструмент, не более",f:"psy"},
      {t:"Только по необходимости",f:"podpolie"},{t:"Тело — храм, никакого хрома",f:"steklo"}]},
    {q:"Как ты решаешь конфликт?",a:[
      {t:"Кулаком и хромом",f:"psy"},{t:"Ядом и хитростью",f:"gadyuki"},
      {t:"Информацией и шантажом",f:"pepel"},{t:"Разговором, если можно",f:"podpolie"}]},
    {q:"Во что ты веришь?",a:[
      {t:"В силу",f:"psy"},{t:"В деньги",f:"pepel"},{t:"В свободу",f:"podpolie"},{t:"В то, что ХОР вернётся",f:"steklo"}]},
    {q:"Где твой дом?",a:[
      {t:"Арена, Сектор 14",f:"psy"},{t:"Гнездо, Сектор 11",f:"gadyuki"},
      {t:"Везде и нигде",f:"pepel"},{t:"Свалка, среди мёртвых серверов",f:"steklo"}]},
    {q:"Твой главный талант?",a:[
      {t:"Я бью сильнее всех",f:"psy"},{t:"Я знаю то, чего не знают другие",f:"pepel"},
      {t:"Я варю то, что убивает и лечит",f:"gadyuki"},{t:"Я говорю правду вслух",f:"podpolie"}]},
    {q:"Консорциум ЗАРЯ-9 для тебя это —",a:[
      {t:"Клиент, который платит",f:"psy"},{t:"Источник данных для взлома",f:"pepel"},
      {t:"Враг, которого нужно свалить",f:"podpolie"},{t:"Ложный бог, укравший настоящего",f:"steklo"}]},
  ];
  const FACT={
    psy:{n:"ХРОМОВЫЕ ПСЫ",c:"var(--neon2)",d:"Ты — боец. Металл в теле, кодекс в сердце. Уважаешь силу и презираешь трусость. Твоё слово крепче титана."},
    gadyuki:{n:"ГАДЮКИ",c:"var(--red)",d:"Ты — тень с ядом. Терпелив, расчётлив, беспощаден. Ты не прощаешь долгов и не забываешь обид. Тебя боятся не зря."},
    pepel:{n:"СИНДИКАТ ПЕПЛА",c:"var(--violet)",d:"Ты — призрак информации. Не сила решает, а знание. Ты видишь всех, тебя — никто. Самое опасное оружие города в твоих руках."},
    podpolie:{n:"ПОДПОЛЬЕ",c:"var(--amber)",d:"Ты — голос сопротивления. Веришь, что правда сильнее корпораций. Идеалист с риском сгореть ярко. Город нуждается в таких, как ты."},
    steklo:{n:"СТЕКЛОДУВЫ",c:"var(--neon)",d:"Ты — хранитель веры. Пока другие гонятся за хромом и кредитом, ты слушаешь Дно сети и ждёшь возвращения ХОРА. Безумец или пророк — время покажет."},
  };
  WIDGETS.quiz=function(panel){
    once(panel,()=>{
      const host=panel.querySelector('#quizWidget');
      let step=0, score={};
      function render(){
        if(step>=QUIZ.length){ result(); return; }
        const q=QUIZ[step];
        host.innerHTML=`<div class="widget">
          <div class="stat"><label>ВОПРОС <b>${step+1} / ${QUIZ.length}</b></label><div class="bar"><i style="width:${(step/QUIZ.length)*100}%"></i></div></div>
          <h3>${q.q}</h3><div id="ans"></div></div>`;
        const ans=host.querySelector('#ans');
        q.a.forEach(a=>{ const b=document.createElement('button'); b.className='btn'; b.style.cssText='display:block;width:100%;text-align:left;margin:8px 0;text-transform:none'; b.textContent='▸ '+a.t;
          b.onclick=()=>{ score[a.f]=(score[a.f]||0)+1; step++; render(); }; ans.appendChild(b); });
      }
      function result(){
        let best=null,mx=-1; Object.keys(score).forEach(k=>{ if(score[k]>mx){mx=score[k];best=k;} });
        const f=FACT[best];
        host.innerHTML=`<div class="widget" style="text-align:center;border-color:${f.c}">
          <p class="mini">АЛГОРИТМ ВЫНЕС ВЕРДИКТ. ТВОЯ ФРАКЦИЯ:</p>
          <h1 class="page-title" style="color:${f.c};text-shadow:0 0 14px ${f.c}" data-en="">${f.n}</h1>
          <p style="max-width:520px;margin:14px auto">${f.d}</p>
          <button class="btn m" id="retake">ПРОЙТИ ЗАНОВО</button></div>`;
        host.querySelector('#retake').onclick=()=>{ step=0; score={}; render(); };
      }
      render();
    });
  };

  /* ===================== ТЕРМИНАЛ НЕТРАННЕРА ===================== */
  WIDGETS.terminal=function(panel){
    once(panel,()=>{
      const host=panel.querySelector('#terminalWidget');
      host.innerHTML=`<div class="widget scanline-box">
        <div class="term" id="term"></div>
        <div class="term-input"><span class="prompt">runner@проблеск:~$</span>
        <input type="text" id="termIn" autocomplete="off" spellcheck="false" placeholder="введите команду и Enter..."></div>
      </div>`;
      const term=host.querySelector('#term');
      const inp=host.querySelector('#termIn');
      let state={connected:false,scanned:false,alarm:0,files:false,cracked:false,done:false};
      const NODES=['узел-1: журнал транзакций','узел-2: файл кадров [ШИФР]','узел-3: ЛЁД-барьер [АКТИВЕН]','узел-4: хранилище 04-К [ЦЕЛЬ]'];
      function line(txt,cls){ const d=document.createElement('div'); d.className='line '+(cls||''); d.innerHTML=txt; term.appendChild(d); term.scrollTop=term.scrollHeight; }
      function boot(){
        line('ЗАРЯ-9 УЧЕБНАЯ ДЕКА «ПРОБЛЕСК-3»','sys');
        line('Симулятор погружения. Смерть здесь виртуальна... наверное.','sys');
        line("Введите <b>help</b> для списка команд.",'sys'); line('');
      }
      function alarm(n){ state.alarm=Math.min(100,state.alarm+n); line(`⚠ УРОВЕНЬ ТРЕВОГИ: ${state.alarm}%`, state.alarm>70?'err':'sys');
        if(state.alarm>=100){ line('█ ЧЁРНЫЙ ЛЁД АКТИВИРОВАН. ИМПУЛЬС В СОКЕТ. ТЫ СГОРЕЛ.','err'); line('// СИМУЛЯЦИЯ ЗАВЕРШЕНА. В РЕАЛЬНОСТИ ты бы уже остывал. Введи <b>reset</b>.','sys'); state.done=true; } }
      const CMDS={
        help(){ line('ДОСТУПНЫЕ КОМАНДЫ:','ok');
          line(' scan      — просканировать сервер'); line(' connect   — подключиться к серверу');
          line(' nodes     — список узлов'); line(' crack ЛЁД  — взломать ледяной барьер');
          line(' download  — скачать целевой файл'); line(' ghost     — замести следы (снижает тревогу)');
          line(' status    — показать состояние'); line(' reset     — перезапуск симуляции'); line(' clear     — очистить экран'); line(''); },
        scan(){ if(!state.connected){ line('Сначала нужно connect к серверу.','err'); return; }
          state.scanned=true; line('Сканирование...','sys');
          setTimeout(()=>{ NODES.forEach(n=>line(' ▸ '+n)); line('Найден ЛЁД на узле-3. Цель — узел-4.','ok'); alarm(10); },400); },
        connect(){ if(state.connected){ line('Уже подключён.','sys'); return; }
          line('Погружение','sys'); line('...пробой оболочки...','sys');
          setTimeout(()=>{ state.connected=true; line('СОЕДИНЕНИЕ УСТАНОВЛЕНО. Сервер: КОРП-АРХИВ 04-К','ok'); line('Ты внутри. Тело осталось в кресле. Не задерживайся.','sys'); alarm(5); },500); },
        nodes(){ if(!state.scanned){ line('Сначала scan.','err'); return; } NODES.forEach(n=>line(' ▸ '+n)); },
        crack(arg){ if(!state.connected){ line('Нет соединения.','err'); return; }
          if(!/лёд|led|3|ice/i.test(arg||'')){ line('Уточни цель: crack ЛЁД','err'); return; }
          if(state.cracked){ line('ЛЁД уже взломан.','sys'); return; }
          line('Атака на ЛЁД','sys');
          setTimeout(()=>{ if(Math.random()<0.35){ line('ЛЁД засёк вторжение! Контратака!','err'); alarm(35); }
            else { state.cracked=true; line('ЛЁД пробит. Узел-4 открыт.','ok'); alarm(15); } },600); },
        download(){ if(!state.cracked){ line('Узел-4 закрыт ЛЬДОМ. Сначала crack ЛЁД.','err'); return; }
          line('Скачивание файла 04-К','sys');
          setTimeout(()=>{ state.done=true; line('╔══════════════════════════════╗','ok');
            line('║ ФАЙЛ ПОЛУЧЕН. ТЫ СПРАВИЛСЯ.  ║','ok'); line('╚══════════════════════════════╝','ok');
            line('Внутри — переписка Директора Волка о проекте «Сознание 4.0».','sys');
            line('Оказывается, копию грузят, а оригинал... Впрочем, читай сам. Введи <b>reset</b>, чтобы выйти.','sys'); },700); },
        ghost(){ if(!state.connected){ line('Нет соединения.','err'); return; }
          state.alarm=Math.max(0,state.alarm-25); line('Следы затёрты. Тревога снижена.','ok'); line(`Текущая тревога: ${state.alarm}%`,'sys'); },
        status(){ line(`подключён: ${state.connected?'да':'нет'} | лёд взломан: ${state.cracked?'да':'нет'} | тревога: ${state.alarm}%`,'ok'); },
        reset(){ state={connected:false,scanned:false,alarm:0,files:false,cracked:false,done:false}; term.innerHTML=''; boot(); },
        clear(){ term.innerHTML=''; },
      };
      function exec(raw){
        const parts=raw.trim().split(/\s+/); const cmd=(parts[0]||'').toLowerCase(); const arg=parts.slice(1).join(' ');
        line(`<span class="u">runner@проблеск:~$</span> ${raw}`);
        if(!cmd) return;
        if(state.done && !['reset','clear','help','status'].includes(cmd)){ line('Сессия завершена. Введи reset.','err'); return; }
        if(CMDS[cmd]) CMDS[cmd](arg); else line(`команда не найдена: ${cmd}. Введи help.`,'err');
      }
      inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ const v=inp.value; inp.value=''; exec(v); } });
      boot();
    });
  };

  /* ===================== ГЕНЕРАТОР ПЕРСОНАЖА ===================== */
  const GEN={
    alias:['Пепел','Гвоздь','Осколок','Ноль','Ртуть','Тень','Шип','Вольт','Кобра','Провод','Иней','Дым','Клык','Эхо','Ржавчина','Стекло','Импульс','Заноза','Фитиль','Гроза'],
    alias2:['Молчаливый','Кривой','Быстрый','Меченый','Последний','Бешеный','Тихая','Стальная','Голодный','Одноглазый','Битый','Летучий'],
    role:['Нетраннер','Соло','Риппердок','Фиксер','Технарь','Курьер-призрак','Медиа-ворон','Чистильщик','Биохакер','Кибер-гладиатор'],
    home:['Котёл (С9)','Провода (С6)','Мост Плача (С12)','Яма (С13)','Арена (С14)','Гавань (С10)','Капсулы (С8)','Свалка (С15)'],
    chrome:['глаза «Ястреб»','рука «Молот»','нейро-сокет «Проблеск»','клинки «Богомол»','титановый скелет','тахи-процессор','подкожную броню','второе сердце'],
    debt:['12 000 НК Гадюкам','долг крови Хромовым Псам','просроченный кредит ХРОМ-БИОТЕХ на всё тело','ничего — и это подозрительно','услугу Синдикату Пепла','неоплаченный воздух за 8 месяцев'],
    trait:['никогда не снимает очки','боится тишины','коллекционирует старые монеты до Краха','не помнит первых 20 лет жизни','говорит с ИИ во сне','верит, что ХОР её выбрал','панически боится воды','смеётся не вовремя'],
    secret:['на самом деле работает на Консорциум','видел лицо Директора Волка','хранит последнюю копию ХОРА на чипе в затылке','убил не того человека и живёт с этим','когда-то был из Верхнего Города','это не первое его тело','знает, где вход в закрытые этажи «Зенита»','должен предать друга к пятнице'],
    motto:['«Мясо — это опция.»','«Данные хотят быть свободными.»','«Я всплыву. Всегда всплываю.»','«Долги платят все.»','«Город меня не сломает.»','«Я видел Дно и вернулся.»'],
  };
  WIDGETS.generator=function(panel){
    once(panel,()=>{
      const host=panel.querySelector('#genWidget');
      host.innerHTML=`<div class="widget">
        <button class="btn a" id="genBtn">⚡ СГЕНЕРИРОВАТЬ ЛИЧНОСТЬ</button>
        <div id="genOut" class="output" style="margin-top:16px"><span class="mini">// нажми кнопку — город соберёт тебе судьбу</span></div>
      </div>`;
      const out=host.querySelector('#genOut');
      host.querySelector('#genBtn').onclick=()=>{
        const alias = Math.random()<.5 ? rnd(GEN.alias) : rnd(GEN.alias2)+' '+rnd(GEN.alias);
        out.innerHTML=`
          <div class="big">«${alias}»</div>
          <table class="data" style="margin-top:10px">
            <tr><th>РОЛЬ</th><td>${rnd(GEN.role)}</td></tr>
            <tr><th>РАЙОН</th><td>${rnd(GEN.home)}</td></tr>
            <tr><th>КИБЕРВЕР</th><td>${rnd(GEN.chrome)}</td></tr>
            <tr><th>ДОЛГ</th><td>${rnd(GEN.debt)}</td></tr>
            <tr><th>ПРИВЫЧКА</th><td>${rnd(GEN.trait)}</td></tr>
            <tr><th>ТАЙНА</th><td style="color:var(--red)">${rnd(GEN.secret)}</td></tr>
            <tr><th>ДЕВИЗ</th><td style="color:var(--violet)">${rnd(GEN.motto)}</td></tr>
            <tr><th>ВОЗРАСТ</th><td>${ri(19,54)} · <b>ШАНС ДОЖИТЬ ДО 40:</b> ${ri(12,88)}%</td></tr>
          </table>`;
      };
    });
  };

  /* ===================== ПИРАТСКОЕ РАДИО ===================== */
  WIDGETS.radio=function(panel){
    once(panel,()=>{
      const host=panel.querySelector('#radioWidget');
      host.innerHTML=`<div class="widget">
        <div class="radio-face">
          <div class="eq paused" id="eq">${'<i></i>'.repeat(7)}</div>
          <div style="flex:1;min-width:200px">
            <div class="mini">ЧАСТОТА <b style="color:var(--amber)">66.6 FM</b> · ПОДПОЛЬЕ</div>
            <div id="nowPlaying" class="big" style="font-size:16px">— ЭФИР ОСТАНОВЛЕН —</div>
          </div>
          <button class="btn" id="playBtn">▶ ВКЛ</button>
          <button class="btn m" id="nextBtn">⏭ ДАЛЕЕ</button>
        </div>
        <div class="mini" id="djLine" style="margin-top:12px"></div>
        <audio id="radioAudio" loop></audio>
        <div class="note" style="margin-top:14px"><span class="k">СИНТЕЗ ЗВУКА:</span> станция генерирует синт-волну прямо в твоём браузере (Web Audio). Реального файла нет — только чистый сигнал Подполья.</div>
      </div>`;
      const eq=host.querySelector('#eq'), np=host.querySelector('#nowPlaying'), dj=host.querySelector('#djLine');
      const playBtn=host.querySelector('#playBtn'), nextBtn=host.querySelector('#nextBtn');
      const tracks=[
        {t:'Ржавый Соловей — «Дождь по неону»',bpm:[220,277,330],dj:'«Для того, кто мокнет сейчас под мостом в Секторе 12 — эта для тебя.»'},
        {t:'Стекло — «Сигнал со Дна»',bpm:[196,262,349],dj:'«Говорят, если играть это задом наперёд, слышно имя ХОРА. Проверьте сами.»'},
        {t:'Ноль — «Комендантский рэйв»',bpm:[247,311,370],dj:'«Щит-7 гасит свет в час ночи? А мы включаем бас. Громче.»'},
        {t:'шум-панк коллектив «КЗ» — «Ток украден»',bpm:[165,220,294],dj:'«Записано на энергии, которую мы не оплатили. Приятного.»'},
      ];
      let idx=0, actx=null, osc=[], playing=false, seq=null;
      function ensureCtx(){ if(!actx){ actx=new (window.AudioContext||window.webkitAudioContext)(); } }
      function stopOsc(){ osc.forEach(o=>{try{o.stop()}catch(e){}}); osc=[]; if(seq){clearInterval(seq);seq=null;} }
      function playTrack(){
        ensureCtx(); stopOsc();
        const master=actx.createGain(); master.gain.value=0.06; master.connect(actx.destination);
        const notes=tracks[idx].bpm;
        // simple arpeggio loop
        let step=0;
        seq=setInterval(()=>{
          const f=notes[step%notes.length];
          const o=actx.createOscillator(); const g=actx.createGain();
          o.type= step%4===0?'sawtooth':'square'; o.frequency.value=f/ (step%8<4?1:2);
          g.gain.setValueAtTime(0.0001,actx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.5,actx.currentTime+0.02);
          g.gain.exponentialRampToValueAtTime(0.0001,actx.currentTime+0.22);
          o.connect(g); g.connect(master); o.start(); o.stop(actx.currentTime+0.25);
          step++;
        },150);
        // bass drone
        const bass=actx.createOscillator(); const bg=actx.createGain();
        bass.type='triangle'; bass.frequency.value=notes[0]/4; bg.gain.value=0.5; bass.connect(bg); bg.connect(master); bass.start();
        osc.push(bass);
        osc.masterKill=()=>{ try{master.disconnect()}catch(e){} };
        np.textContent=tracks[idx].t; dj.innerHTML='📻 <b>ДИДЖЕЙ:</b> '+tracks[idx].dj;
        eq.classList.remove('paused'); playing=true; playBtn.textContent='⏸ ПАУЗА';
      }
      function stop(){ stopOsc(); eq.classList.add('paused'); playing=false; playBtn.textContent='▶ ВКЛ'; np.textContent='— ЭФИР ОСТАНОВЛЕН —'; }
      playBtn.onclick=()=>{ if(playing) stop(); else playTrack(); };
      nextBtn.onclick=()=>{ idx=(idx+1)%tracks.length; if(playing) playTrack(); else { np.textContent=tracks[idx].t; dj.innerHTML='📻 <b>ДИДЖЕЙ:</b> '+tracks[idx].dj; } };
      np.textContent=tracks[0].t.replace(/.*/,'— ЭФИР ОСТАНОВЛЕН —');
      dj.innerHTML='📻 Нажми ВКЛ, чтобы поймать волну Подполья. Звук — синтез в реальном времени.';
    });
  };

  /* ===================== СЛОВАРЬ СЛЕНГА ===================== */
  const SLANG=[
    ['Нырнуть','войти в Глубокий Нет через сокет'],['Всплыть','выйти из сети живым'],
    ['Сгореть','умереть во время погружения от чёрного льда'],['Дека','портативный компьютер нетраннера'],
    ['Лёд','защитная программа сервера'],['Демон','программа-агент, помощник нетраннера'],
    ['Хром','любая кибернетика'],['Пустой','человек с киберпсихозом, потерявший личность'],
    ['Мясо','биологическое тело (пренебр.)'],['Чумба','деревенщина, новичок, лох'],
    ['Солo','наёмник, боец'],['Фиксер','посредник, устроитель сделок'],
    ['Риппердок','подпольный кибер-хирург'],['НК','неокредит, валюта города'],
    ['Жемчуг','память-жемчуг, запись чужого опыта'],['Летун','аэромобиль'],
    ['Кишки','затопленное метро старого города'],['Пепел','наркотик из данных / кличка легенды'],
    ['Купол','искусственное небо Верхнего Города'],['Щит','боец ЧВК «Щит-7»'],
    ['Ошейник','дистанционный блок на кредитной кибернетике'],['Проблеск','базовый нейро-сокет ЗАРЯ-9'],
    ['Хор','рогатый ИИ / легенда Дна сети'],['Гроб','спальная капсула 2×1 м'],
    ['Соловей','диджей пиратского радио'],['Верхний','житель Верхнего Города (пренебр.)'],
    ['Тряпьё','самодельная одежда-броня Нижнего Города'],['Дно','самый глубокий слой сети'],
    ['Разряд','популярный энергетик'],['Оптика','кибернетические глаза'],
  ];
  WIDGETS.slang=function(panel){
    once(panel,()=>{
      const host=panel.querySelector('#slangWidget');
      host.innerHTML=`<div class="widget">
        <label class="fld">ПОИСК ПО СЛОВАРЮ</label>
        <input type="text" id="slangSearch" placeholder="введите слово, напр. 'лёд'...">
        <table class="data" id="slangTable" style="margin-top:14px"><thead><tr><th>СЛОВО</th><th>ЗНАЧЕНИЕ</th></tr></thead><tbody></tbody></table>
        <div class="mini" id="slangCount"></div>
      </div>`;
      const tb=host.querySelector('#slangTable tbody');
      const cnt=host.querySelector('#slangCount');
      const search=host.querySelector('#slangSearch');
      function render(q){
        q=(q||'').trim().toLowerCase();
        const rows=SLANG.filter(([w,d])=> !q || w.toLowerCase().includes(q)||d.toLowerCase().includes(q))
          .sort((a,b)=>a[0].localeCompare(b[0],'ru'));
        tb.innerHTML=rows.map(([w,d])=>`<tr><td><b>${w}</b></td><td>${d}</td></tr>`).join('')||'<tr><td colspan="2">// не найдено</td></tr>';
        cnt.textContent=`// ${rows.length} из ${SLANG.length} терминов`;
      }
      search.addEventListener('input',()=>render(search.value));
      render('');
    });
  };

})();
