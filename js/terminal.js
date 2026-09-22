/* ═══ ГОССЕТЬ-84 // КОМАНДНАЯ СТРОКА ═══ */
"use strict";

const GS_TERM = (() => {
  const $ = s => document.querySelector(s);
  let out, input, history = [], hIdx = -1, busy = false;

  function print(text, cls) {
    const d = document.createElement("div");
    d.className = "tl" + (cls ? " " + cls : "");
    d.textContent = text;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  }
  function printHTML(html, cls) {
    const d = document.createElement("div");
    d.className = "tl" + (cls ? " " + cls : "");
    d.innerHTML = html;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function banner() {
    print("╔══════════════════════════════════════════════╗", "t-neon");
    print("║   ГОССЕТЬ-84 // ТЕРМИНАЛ ДОСТУПА v4.1        ║", "t-neon");
    print("║   «Сеть видит. Сеть помнит. Сеть одобряет.»  ║", "t-neon");
    print("╚══════════════════════════════════════════════╝", "t-neon");
    print("Допуск ГРАЖДАНСКИЙ подтверждён. Введите «помощь».", "t-sys");
    print("");
  }

  const VIEWS = { "главная": "home", "лента": "news", "новости": "news", "досье": "dossier", "картотека": "dossier", "волны": "radio", "радио": "radio", "аркада": "arcade", "игры": "arcade", "терминал": "terminal", "магазин": "shop", "связь": "comms" };
  const THEMES = ["неон", "фосфор", "янтарь", "алиса"];
  const THEME_MAP = { "неон": "neon", "фосфор": "phosphor", "янтарь": "amber", "алиса": "alisa" };

  async function hack(target) {
    busy = true;
    const steps = [
      "УСТАНОВКА СОЕДИНЕНИЯ С «" + target + "» ...",
      "ПЕРЕБОР ПАРОЛЕЙ: «1234» ... «ПАРОЛЬ» ... «ПАРОЛЬ2» ...",
      "ОБНАРУЖЕНА УЯЗВИМОСТЬ: СИСТЕМА ДОВЕРЯЕТ ВСЕМ."
    ];
    for (const s of steps) { print(s, "t-dim"); await wait(430); }
    const total = 26;
    for (let i = 0; i <= total; i += 2) {
      const bar = "▮".repeat(i) + "▯".repeat(total - i);
      const line = out.querySelector(".hacking");
      if (line) line.textContent = "ПРОНИКНОВЕНИЕ: [" + bar + "] " + Math.round(i / total * 100) + "%";
      else { const d = document.createElement("div"); d.className = "tl hacking t-ok"; d.textContent = "ПРОНИКНОВЕНИЕ: [" + bar + "] 0%"; out.appendChild(d); }
      if (i % 6 === 0) GS_AUDIO.sfx("key");
      await wait(120);
    }
    await wait(300); print("");
    print("ДОСТУП К «" + target + "» ПОЛУЧЕН.", "t-ok");
    print("ПОЛУЧЕННЫЕ ДАННЫЕ: одна (1) любопытная строка и привет от дежурного.", "t-dim");
    print("СЕТЬ ЗАПИСАЛА ЭТУ ШАЛОСТЬ. НЕ ВЫКЛЮЧАЙТЕСЬ.", "t-err");
    GS_FX.toast("ВЗЛОМ ЗАФИКСИРОВАН. <b>БОЛЬШЕ ТАК НЕ ДЕЛАЙТЕ.</b> (или делайте)");
    GS_AUDIO.sfx("error");
    busy = false;
  }

  async function exec(raw) {
    const line = raw.trim();
    if (!line) return;
    print("ГС:СЕТЬ> " + line, "t-dim");
    history.unshift(line); hIdx = -1;
    const [cmd, ...args] = line.toLowerCase().split(/\s+/);
    const arg = args.join(" ");

    switch (cmd) {
      case "помощь": case "help": case "?":
        GS_DATA.termHelp.forEach(([c, d]) => print("  " + c.padEnd(26, ".") + " " + d));
        break;
      case "очистить": case "cls": out.innerHTML = ""; break;
      case "время":
        print("БОРТОВОЕ ВРЕМЯ: " + new Date().toLocaleTimeString("ru-RU", { hour12: false }), "t-ok"); break;
      case "дата":
        print("НА БОРТУ 1984-Й ГОД. ВСЕГДА 1984-Й.", "t-ok"); break;
      case "сводка":
        print("── СОСТОЯНИЕ СЕТИ ──", "t-neon");
        GS_DATA.statuses.forEach(s => print("  ▸ " + s, "t-dim"));
        print("  ▸ ВАШ СТАТУС: ОДОБРЕН", "t-ok");
        break;
      case "кто": case "кто ты": case "кто-ты":
        print("Я — КТ-1, дроид-дежурный. Работаю без перерыва с 1979 года.", "t-ok");
        print("Отпуска не хочу. Отпуск — это, по-моему, очередной глитч людей.", "t-dim");
        break;
      case "анекдот":
        print("[ АНЕКДОТ ИЗ СБОРНИКА «ЮМОР ДОПУЩЕННЫЙ» ]", "t-sys");
        print(GS_DATA.jokes[Math.floor(Math.random() * GS_DATA.jokes.length)], "t-ok");
        break;
      case "новости":
        print("ТРИ СВЕЖИХ СООБЩЕНИЯ:", "t-neon");
        GS_DATA.news.slice(0, 3).forEach(n => print("  [" + n.cat + "] " + n.title, "t-dim"));
        print("Полные тексты — во вкладке ЛЕНТА.", "t-sys");
        break;
      case "досье": {
        if (!arg) { print("УКАЖИТЕ ПОЗЫВНОЙ: досье <позывной>", "t-err"); break; }
        const d = GS_DATA.dossiers.find(x => x.call.toLowerCase().includes(arg) || x.id.toLowerCase() === arg);
        if (!d) { print("НИЧЕГО НЕ НАЙДЕНО. ЭТО, КСТАТИ, ТОЖЕ ЗАПИСАНО.", "t-err"); GS_AUDIO.sfx("error"); break; }
        print("ДЕЛО " + d.id + " // " + d.call, "t-ok");
        print("  СЕКТОР: " + d.sector + " // СТАТУС: " + d.status, "t-dim");
        print("  «ОТКРЫВАЮ КАРТОТЕКУ...»", "t-sys");
        await wait(500);
        GS_VIEWS.switchView("dossier");
        GS_VIEWS.openDossier(d.id);
        break;
      }
      case "радио": {
        if (arg === "стоп") { GS_AUDIO.pause(); print("ЭФИР ПРИОСТАНОВЛЕН. ТИШИНА ТОЖЕ МУЗЫКА. ПОЧТИ.", "t-dim"); break; }
        const n = parseInt(arg, 10);
        if (n >= 1 && n <= GS_AUDIO.tracks.length) { GS_AUDIO.play(n - 1); }
        else if (!GS_AUDIO.isPlaying()) { GS_AUDIO.play(); }
        print("СЕЙЧАС В ЭФИРЕ: «" + GS_AUDIO.track().title + "» — " + GS_AUDIO.track().composer, "t-ok");
        GS_FX.toast("ЭФИР: <b>«" + GS_AUDIO.track().title + "»</b>");
        break;
      }
      case "взлом": case "хак":
        if (busy) { print("ШТРАФНАЯ ПРОЦЕДУРА УЖЕ ИДЁТ. ТЕРПЕНИЕ.", "t-err"); break; }
        hack((arg || "ЦЕНТРАЛЬНЫЙ БАНК ШУТОК").toUpperCase());
        break;
      case "тема":
        if (!THEMES.includes(arg)) { print("СХЕМЫ: " + THEMES.join(", "), "t-err"); break; }
        window.GS_APPLY_THEME(THEME_MAP[arg]);
        print("ЦВЕТОВАЯ СХЕМА: «" + arg.toUpperCase() + "». ГЛАЗА БЛАГОДАРЯТ.", "t-ok");
        break;
      case "открыть": case "перейти": case "goto": {
        const v = VIEWS[arg];
        if (!v) { print("ВКЛАДКИ: " + Object.keys(VIEWS).join(", "), "t-err"); break; }
        GS_VIEWS.switchView(v);
        print("ПЕРЕХОД ВЫПОЛНЕН.", "t-ok");
        break;
      }
      case "пинг": {
        const t = arg || "город";
        print("ПИНГУЮ «" + t.toUpperCase() + "» ...", "t-dim");
        await wait(300 + Math.random() * 500);
        print("ОТВЕТ ЗА " + (1 + Math.floor(Math.random() * 40)) + " мс. ЦЕЛЬ ЖИВА И НЕРВНИЧАЕТ.", "t-ok");
        break;
      }
      case "турбо":
        document.body.classList.toggle("turbo");
        print(document.body.classList.contains("turbo") ? "ТУРБО-РЕЖИМ ВКЛЮЧЁН. ДЕРЖИТЕСЬ ЗА СТУЛ." : "ТУРБО-РЕЖИМ ВЫКЛЮЧЕН.", "t-ok");
        break;
      case "выход": case "exit":
        print("ЗАПРОС НА ВЫХОД ОТКЛОНЁН КАНЦЕЛЯРИЕЙ.", "t-err");
        print("Увольнительная из сети не выдаётся с 1984 года.", "t-dim");
        break;
      case "матрица":
        print("ОШИБКА ЖАНРА: ВЫ В ДРУГОМ КИНО.", "t-err"); break;
      case "привет": case "здравствуй":
        print("ПРИВЕТСТВУЮ, ТОВАРИЩ. СЕТЬ СКУЧАЛА " + (3 + Math.floor(Math.random() * 40)) + " СЕКУНД.", "t-ok");
        break;
      default:
        GS_AUDIO.sfx("error");
        print("КОМАНДА «" + cmd + "» НЕ ОДОБРЕНА (или просто неизвестна).", "t-err");
        print("Введите «помощь» — там всё честно.", "t-sys");
    }
    print("");
  }

  function init() {
    out = $("#term-out");
    input = $("#term-in");
    banner();
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && !busy) { exec(input.value); input.value = ""; GS_AUDIO.sfx("click"); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (hIdx < history.length - 1) { hIdx++; input.value = history[hIdx]; } }
      else if (e.key === "ArrowDown") { e.preventDefault(); if (hIdx > 0) { hIdx--; input.value = history[hIdx]; } else { hIdx = -1; input.value = ""; } }
      else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); out.innerHTML = ""; }
      else GS_AUDIO.sfx("key");
    });
    $("#view-terminal").addEventListener("click", e => { if (!e.target.closest("a,button")) input.focus(); });
  }

  return { init, exec, print };
})();
