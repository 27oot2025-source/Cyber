/* ═══ ГОССЕТЬ-84 // ЛОГИКА ВКЛАДОК И ИНТЕРФЕЙСА ═══ */
"use strict";

const GS_VIEWS = (() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const LS = {
    get(k, d) { try { const v = localStorage.getItem("gs84_" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("gs84_" + k, JSON.stringify(v)); } catch (e) {} }
  };

  let horizonCtl = null, eqRunning = false, firstHome = true;

  /* ══════ ПАНЕЛИ: ярлыки и пиксель-иконки ══════ */
  function decoratePanels() {
    $$(".panel[data-label]").forEach(p => {
      if (p.querySelector(":scope > .p-label")) return;
      const s = document.createElement("span");
      s.className = "p-label";
      s.textContent = "[ " + p.dataset.label + " ]";
      p.prepend(s);
    });
  }

  /* пиксель-арт через box-shadow: 1 — основной неон, 2 — акцент */
  const SPRITES = {
    robot: ["01000010", "00111100", "01111110", "12011021", "01111110", "01100110", "01011010", "11000011"],
    soda:  ["0011100", "0112110", "1111111", "1111111", "1122211", "1111111", "1122211", "1111111", "0111110"],
    term:  ["01111110", "12111121", "11122111", "11112211", "11111211", "01111110", "00111000", "01111110"],
    cass:  ["01111110", "12122121", "11111111", "10011001", "11111111", "11011011", "01111110", "00011000"],
    visor: ["11111111", "12222221", "11111111", "01100110", "00100100", "00011000"],
    token: ["0011100", "0122210", "1221221", "1222221", "1221221", "0122210", "0011100"]
  };
  function spriteCSS(key) {
    const rows = SPRITES[key]; if (!rows) return "";
    const sh = [];
    rows.forEach((row, y) => row.split("").forEach((ch, x) => {
      if (ch === ".") return;
      sh.push(x + "px " + y + "px 0 " + (ch === "1" ? "var(--neon)" : "var(--neon2)"));
    }));
    const cols = rows[0].length, rowsN = rows.length;
    return "box-shadow:" + sh.join(",") +
      ";margin-left:" + (-cols * 6) + "px;margin-top:" + (-rowsN * 6) + "px;" +
      "filter:drop-shadow(0 0 3px var(--neon-soft))";
  }

  /* ══════ МАРШРУТИЗАТОР ══════ */
  const ORDER = ["home", "news", "dossier", "radio", "arcade", "terminal", "shop", "comms"];
  function switchView(name, quiet) {
    if (!ORDER.includes(name)) return;
    $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.view === name));
    $$(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + name));
    if (!quiet) GS_AUDIO.sfx("open");
    $("#logo").classList.add("glitching");
    setTimeout(() => $("#logo").classList.remove("glitching"), 200);

    if (name === "home") { horizonCtl && horizonCtl.start(); if (firstHome) { firstHome = false; homeIntro(); } }
    else horizonCtl && horizonCtl.stop();

    if (name === "radio") startEQ(); else stopEQ();
    if (name === "terminal") setTimeout(() => $("#term-in").focus(), 60);
    if (name !== "arcade" && window.GS_GAME) GS_GAME.leaveArcade();
  }

  function initRouter() {
    $$(".tab").forEach(t => t.addEventListener("click", () => switchView(t.dataset.view)));
    $$("[data-goto]").forEach(b => b.addEventListener("click", () => switchView(b.dataset.goto)));
    $("#logo").addEventListener("click", () => switchView("home"));
    window.addEventListener("keydown", e => {
      if (e.target && e.target.matches && e.target.matches("input,textarea,select")) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= ORDER.length) switchView(ORDER[n - 1]);
    });
    // звук наведения — делегирование, чтобы покрыть динамические кнопки
    let lastHover = 0;
    document.addEventListener("mouseover", e => {
      const t = e.target && e.target.closest ? e.target.closest(".btn,.wbtn,.tab,.track,.news-item,.dos") : null;
      if (!t) return;
      const now = performance.now();
      if (now - lastHover < 70) return;
      lastHover = now;
      GS_AUDIO.sfx("hover");
    });
  }

  /* ══════ ГЛАВНАЯ ══════ */
  function homeIntro() {
    GS_FX.typewrite($("#hero-sub"), "ГОСУДАРСТВЕННАЯ ИНФОРМАЦИОННАЯ СЕТЬ ▸ ДОБРО ПОЖАЛОВАТЬ, ТОВАРИЩ", 32, true);
    $$(".stat-num").forEach(GS_FX.countUp);
  }
  function initQuote() {
    const q = () => $("#daily-quote").textContent = GS_DATA.quotes[Math.floor(Math.random() * GS_DATA.quotes.length)];
    q();
    $("#btn-quote").addEventListener("click", () => { q(); GS_AUDIO.sfx("click"); });
  }

  /* опрос */
  function renderPoll() {
    const box = $("#poll");
    const voted = LS.get("poll", null);
    const votes = GS_DATA.poll.base.slice();
    if (voted !== null) votes[voted] += 1;
    const total = votes.reduce((a, b) => a + b, 0);
    box.innerHTML = "";
    GS_DATA.poll.opts.forEach((opt, i) => {
      const pct = Math.round(votes[i] / total * 100);
      const d = document.createElement("div");
      d.className = "poll-opt" + (voted === i ? " voted" : "");
      d.innerHTML =
        '<div class="po-line"><span>' + (voted !== null ? (i === voted ? "▸ " : "  ") : "[ ] ") + opt + "</span>" +
        '<span class="po-pct">' + pct + "%</span></div>" +
        '<div class="po-bar"><div class="po-fill"></div></div>';
      d.addEventListener("click", () => {
        if (LS.get("poll", null) !== null) return;
        LS.set("poll", i); GS_AUDIO.sfx("coin");
        GS_FX.toast("ВАШ ГОЛОС УЧЁТ. <b>ГОСУДАРСТВО ДОВОЛЬНО ВАМИ.</b>");
        renderPoll();
      });
      box.appendChild(d);
      requestAnimationFrame(() => setTimeout(() => d.querySelector(".po-fill").style.width = pct + "%", 60));
    });
    if (voted !== null) {
      const th = document.createElement("div");
      th.className = "poll-thanks";
      th.textContent = "УЧАСТНИКОВ: " + total.toLocaleString("ru-RU") + " // ВАШ ГОЛОС ЗАФИКСИРОВАН";
      box.appendChild(th);
    }
  }

  /* ══════ ЛЕНТА ══════ */
  function renderNews() {
    const list = $("#news-list");
    list.innerHTML = "";
    GS_DATA.news.forEach(n => {
      const d = document.createElement("div");
      d.className = "news-item";
      d.innerHTML = '<span class="news-cat">[' + n.cat + ']</span><div class="news-title">' + n.title + '</div><div class="news-date">' + n.date + "</div>";
      d.addEventListener("click", () => openNews(n.id));
      list.appendChild(d);
    });
    openNews(GS_DATA.news[0].id);
  }
  function openNews(id) {
    const n = GS_DATA.news.find(x => x.id === id); if (!n) return;
    $$(".news-item").forEach((el, i) => el.classList.toggle("sel", GS_DATA.news[i].id === id));
    const r = $("#news-reader");
    let html = '<div class="news-body"><h3>' + n.title + '</h3><div class="nb-meta">' + n.cat + " // " + n.date + " // КАНАЛ 27-А</div>";
    n.body.forEach((p, i) => html += '<p class="rev" style="animation-delay:' + (i * 160) + 'ms">' + p + "</p>");
    html += '<div class="stamp rev" style="animation-delay:' + (n.body.length * 160) + 'ms">' + n.stamp + "</div></div>";
    r.innerHTML = '<span class="p-label">[ ПОЛНЫЙ ТЕКСТ ]</span>' + html;
    GS_AUDIO.sfx("click");
  }

  /* ══════ ДОСЬЕ ══════ */
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function portrait(canvas, seedStr) {
    const c = canvas.getContext("2d"), W = canvas.width = 120, H = canvas.height = 140;
    let seed = hashStr(seedStr);
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const style = getComputedStyle(document.documentElement);
    const neon = style.getPropertyValue("--neon").trim() || "#0ff";
    const neon2 = style.getPropertyValue("--neon2").trim() || "#f0f";
    c.fillStyle = "#050810"; c.fillRect(0, 0, W, H);
    // силуэт
    c.fillStyle = "rgba(0,0,0,.85)";
    const hx = 40 + rnd() * 20, hy = 30 + rnd() * 14, hr = 20 + rnd() * 8;
    c.beginPath(); c.arc(hx + hr, hy + hr, hr, 0, 7); c.fill();
    c.fillRect(hx + hr - 24, hy + hr + 12, 48, H - hy - hr);
    // контур
    c.strokeStyle = neon; c.globalAlpha = 0.8; c.lineWidth = 2;
    c.beginPath(); c.arc(hx + hr, hy + hr, hr, Math.PI * 0.9, Math.PI * 2.1); c.stroke();
    c.globalAlpha = 1;
    // шум
    for (let i = 0; i < 700; i++) {
      const a = rnd();
      c.fillStyle = a > 0.93 ? neon2 : (a > 0.86 ? neon : "rgba(120,160,190," + (rnd() * 0.16).toFixed(2) + ")");
      c.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1);
    }
    // блики строк
    for (let y = 0; y < H; y += 4) if (rnd() > 0.8) { c.fillStyle = "rgba(255,255,255,.05)"; c.fillRect(0, y, W, 1); }
    c.font = "7px 'Press Start 2P', monospace"; c.fillStyle = neon2; c.textAlign = "center";
    c.fillText("ЗАСЕКРЕЧЕНО", W / 2, H - 12);
  }

  function renderDossiers() {
    const q = ($("#dossier-q").value || "").toLowerCase();
    const f = $("#dossier-f").value;
    const list = $("#dossier-list");
    list.innerHTML = "";
    const found = GS_DATA.dossiers.filter(d =>
      (!f || d.status === f) &&
      (!q || d.call.toLowerCase().includes(q) || d.sector.toLowerCase().includes(q) ||
       d.traits.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)));
    if (!found.length) {
      list.innerHTML = '<div class="news-empty" style="padding-top:30px">ЗАПИСЕЙ НЕ НАЙДЕНО. СЕТЬ ВСЁ ЗАПИСАЛА.</div>';
      return;
    }
    found.forEach(d => {
      const el = document.createElement("div");
      el.className = "dos";
      el.innerHTML = '<div class="dos-id">ДЕЛО ' + d.id + '</div><div class="dos-name">' + d.call + '</div><span class="dos-status ' + d.stClass + '">' + d.status + "</span>";
      el.addEventListener("click", () => openDossier(d.id));
      list.appendChild(el);
    });
  }

  function openDossier(id) {
    const d = GS_DATA.dossiers.find(x => x.id === id); if (!d) return false;
    $$(".dos").forEach(el => el.classList.toggle("sel", el.textContent.includes(d.id)));
    const card = $("#dossier-card");
    card.innerHTML = '<span class="p-label">[ ЛИЧНОЕ ДЕЛО // ' + d.id + ' ]</span>' +
      '<div class="dc-head"><div class="dc-photo"><canvas></canvas><div class="dc-classified">ФОТО СЕТИ</div></div>' +
      '<div><div class="dc-name">' + d.call + '</div><div class="dc-alias">' + d.name + '</div>' +
      '<span class="dos-status ' + d.stClass + '" style="margin-top:10px">' + d.status + "</span></div></div>" +
      '<dl class="dc-rows">' +
      "<dt>ДЕЛО</dt><dd>" + d.id + "</dd>" +
      "<dt>СЕКТОР</dt><dd>" + d.sector + "</dd>" +
      "<dt>ДОПУСК</dt><dd>" + d.access + "</dd>" +
      "<dt>ПРИМЕТЫ</dt><dd>" + d.traits + "</dd></dl>" +
      '<div class="dc-note">' + d.note + "</div>" +
      '<div class="dc-warning">▲ РАЗГЛАШЕНИЕ КАРАЕТСЯ ОТКЛЮЧЕНИЕМ ОТ ЭФИРА</div>';
    portrait(card.querySelector("canvas"), d.id);
    GS_AUDIO.sfx("click");
    return true;
  }

  /* ══════ ВОЛНЫ (радио) ══════ */
  function renderTracks() {
    const box = $("#tracklist");
    box.innerHTML = "";
    GS_AUDIO.tracks.forEach((t, i) => {
      const d = document.createElement("div");
      d.className = "track" + (i === GS_AUDIO.trackIdx() ? " playing" : "");
      d.innerHTML = '<span class="t-num">' + String(i + 1).padStart(2, "0") + '</span><span class="t-name">' + t.title +
        '</span><span class="t-note">' + t.composer + '</span><span class="t-dur">' + t.bpm + " УД/МИН</span>";
      d.addEventListener("click", () => GS_AUDIO.play(i));
      box.appendChild(d);
    });
    const cur = GS_AUDIO.track();
    $("#radio-num").textContent = String(GS_AUDIO.trackIdx() + 1).padStart(2, "0");
    $("#radio-title").textContent = "«" + cur.title + "»";
    $("#radio-composer").textContent = cur.composer + " // ЧАСТОТА 84.0 МГЦ";
    $("#radio-play").textContent = GS_AUDIO.isPlaying() ? "❚❚ ПАУЗА" : "▸ В ЭФИР";
  }

  function initRadio() {
    renderTracks();
    GS_AUDIO.onUpdate(renderTracks);
    $("#radio-play").addEventListener("click", () => GS_AUDIO.isPlaying() ? GS_AUDIO.pause() : GS_AUDIO.play());
    $("#radio-next").addEventListener("click", () => GS_AUDIO.next());
    $("#radio-prev").addEventListener("click", () => GS_AUDIO.prev());
    $("#radio-vol").addEventListener("input", e => GS_AUDIO.setVolume(e.target.value / 100));
    setInterval(() => { $("#radio-bar").style.width = (GS_AUDIO.progress() * 100).toFixed(1) + "%"; }, 120);
  }

  function startEQ() { if (!eqRunning) { eqRunning = true; drawEQ(); } }
  function stopEQ() { eqRunning = false; }
  function drawEQ() {
    if (!eqRunning) return;
    requestAnimationFrame(drawEQ);
    const cv = $("#eq"), c = cv.getContext("2d");
    const W = cv.width, H = cv.height;
    const style = getComputedStyle(document.documentElement);
    const neon = style.getPropertyValue("--neon").trim();
    const neon2 = style.getPropertyValue("--neon2").trim();
    c.fillStyle = "#000"; c.fillRect(0, 0, W, H);
    const an = GS_AUDIO.analyser();
    const t = performance.now() / 1000;
    let data = null;
    if (an && GS_AUDIO.isPlaying()) { data = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(data); }
    const bars = 24, bw = W / bars;
    for (let i = 0; i < bars; i++) {
      let v;
      if (data) v = data[Math.floor(i * data.length / bars * 0.8)] / 255;
      else v = 0.12 + 0.09 * Math.abs(Math.sin(t * 1.4 + i * 0.55));
      const bh = Math.max(2, v * (H - 8));
      for (let y = 0; y < bh; y += 6) {
        c.fillStyle = y > H * 0.5 ? neon2 : neon;
        c.globalAlpha = 0.55 + v * 0.45;
        c.fillRect(i * bw + 1, H - y - 5, bw - 2, 4);
      }
    }
    c.globalAlpha = 1;
  }

  /* ══════ МАГАЗИН ══════ */
  let cart = [];
  function cartCount() { return cart.reduce((a, i) => a + i.qty, 0); }
  function syncCartBadge() { $("#cart-count").textContent = cartCount(); }

  function renderShop() {
    const grid = $("#shop-grid");
    grid.innerHTML = "";
    GS_DATA.products.forEach(p => {
      const d = document.createElement("div");
      d.className = "shop-card";
      d.innerHTML =
        (p.stock ? '<span class="sc-stock">' + p.stock + "</span>" : "") +
        '<div class="sc-visual"><span class="px" style="' + spriteCSS(p.icon.replace("px-", "")) + '"></span></div>' +
        '<div class="sc-name">' + p.name + '</div><div class="sc-desc">' + p.desc + "</div>" +
        '<div class="sc-foot"><span class="sc-price">' + p.price.toLocaleString("ru-RU") + ' КР.</span>' +
        '<button class="btn small">[ В КОРЗИНУ ]</button></div>';
      d.querySelector("button").addEventListener("click", () => addToCart(p.id));
      grid.appendChild(d);
    });
  }
  function addToCart(id) {
    const row = cart.find(i => i.id === id);
    row ? row.qty++ : cart.push({ id, qty: 1 });
    LS.set("cart", cart); syncCartBadge();
    GS_AUDIO.sfx("coin");
    const p = GS_DATA.products.find(x => x.id === id);
    GS_FX.toast("<b>" + p.name + "</b> — ДОБАВЛЕНО В ЗАЯВКУ<br><span class='dim'>СКЛД. СООБЩИЛ: «ЕСТЬ, НАВЕРНОЕ»</span>");
  }
  function renderCart() {
    const list = $("#cart-list");
    if (!cart.length) {
      list.innerHTML = '<div class="news-empty" style="padding:30px 0">КОРЗИНА ПУСТА. СПРОС, ОДНАКО, ЖИВ.</div>';
    } else {
      list.innerHTML = "";
      cart.forEach(row => {
        const p = GS_DATA.products.find(x => x.id === row.id);
        const d = document.createElement("div");
        d.className = "cart-row";
        d.innerHTML = '<span class="cr-name">' + p.name + " × " + row.qty + '</span><span class="cr-price">' +
          (p.price * row.qty).toLocaleString("ru-RU") + ' КР.</span><button class="cr-x">УБРАТЬ</button>';
        d.querySelector(".cr-x").addEventListener("click", () => {
          cart = cart.filter(i => i.id !== row.id);
          LS.set("cart", cart); syncCartBadge(); renderCart(); GS_AUDIO.sfx("back");
        });
        list.appendChild(d);
      });
    }
    const total = cart.reduce((a, r) => a + GS_DATA.products.find(p => p.id === r.id).price * r.qty, 0);
    $("#cart-total").textContent = total.toLocaleString("ru-RU") + " КР.";
  }
  function initCart() {
    cart = LS.get("cart", []); syncCartBadge();
    $("#btn-cart").addEventListener("click", () => { renderCart(); $("#modal-cart").classList.remove("is-hidden"); GS_AUDIO.sfx("open"); });
    $("#cart-clear").addEventListener("click", () => { cart = []; LS.set("cart", cart); syncCartBadge(); renderCart(); });
    $("#cart-order").addEventListener("click", () => {
      if (!cart.length) { GS_FX.toast("СНАЧАЛА ПОЛОЖИТЕ ЧТО-НИБУДЬ. ХОТЯ БЫ ГРЕЧКУ."); return; }
      const num = "ГС-" + Math.floor(1000 + Math.random() * 9000);
      cart = []; LS.set("cart", cart); syncCartBadge(); renderCart();
      $("#modal-cart").classList.add("is-hidden");
      GS_AUDIO.sfx("turbo");
      GS_FX.toast("ЗАЯВКА <b>" + num + "</b> ПРИНЯТА.<br><span class='dim'>ОЖИДАЙТЕ КУРЬЕРА НА РЕАКТИВНОЙ ТЯГЕ В ТЕЧЕНИЕ 2 ЛЕТ</span>", 6000);
    });
  }

  /* ══════ СВЯЗЬ ══════ */
  function mskTime() {
    const d = new Date();
    return d.toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow", day: "2-digit", month: "2-digit" }) + ".1984 " +
      d.toLocaleTimeString("ru-RU", { timeZone: "Europe/Moscow", hour: "2-digit", minute: "2-digit", hour12: false });
  }
  function renderMsgs() {
    const msgs = LS.get("msgs", null) || GS_DATA.guestSeed;
    const box = $("#msg-list");
    box.innerHTML = "";
    msgs.slice(0, 24).forEach(g => {
      const d = document.createElement("div");
      d.className = "msg";
      d.innerHTML = '<div class="msg-head"><span>ОТ: ' + g.name + '</span><span class="msg-time">' + g.time + "</span></div>" +
        '<div class="msg-text">' + g.text + "</div>" + (g.chan ? '<div class="msg-chan">КАНАЛ: ' + g.chan + "</div>" : "");
      box.appendChild(d);
    });
  }
  function initComms() {
    renderMsgs();
    $("#msg-form").addEventListener("submit", e => {
      e.preventDefault();
      const name = $("#msg-name").value.trim() || "АНОНИМ СЕТИ";
      const chan = $("#msg-chan").value.trim();
      const text = $("#msg-text").value.trim();
      if (!text) return;
      const msgs = LS.get("msgs", null) || GS_DATA.guestSeed.slice();
      msgs.unshift({ name, chan, text, time: mskTime() });
      LS.set("msgs", msgs);
      $("#msg-form").reset();
      renderMsgs();
      GS_AUDIO.sfx("open");
      GS_FX.toast("ТЕЛЕГРАММА ПРИНЯТА ДРОИДОМ КТ-1.<br><b>ОТВЕТ ПРИДЁТ В ТЕЧЕНИЕ ПЯТИЛЕТКИ.</b>");
    });
  }

  /* ══════ сборка ══════ */
  function init() {
    decoratePanels();
    horizonCtl = GS_FX.horizon($("#horizon"));
    initRouter();
    initQuote();
    renderPoll();
    renderNews();
    renderDossiers();
    $("#dossier-go").addEventListener("click", () => { renderDossiers(); GS_AUDIO.sfx("click"); });
    $("#dossier-q").addEventListener("input", renderDossiers);
    $("#dossier-f").addEventListener("change", renderDossiers);
    initRadio();
    renderShop();
    initCart();
    initComms();
    // закрытие модалок по фону
    $$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m) m.classList.add("is-hidden"); }));
    horizonCtl.start();
  }

  return { init, switchView, openDossier, renderPoll, LS };
})();
