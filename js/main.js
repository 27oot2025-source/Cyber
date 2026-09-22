/* ═══ ГОССЕТЬ-84 // СБОРКА И ЗАПУСК ═══ */
"use strict";

(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  /* ══════ НАСТРОЙКИ ══════ */
  const DEF = { theme: "neon", scan: true, flicker: true, rgb: true, sfx: true, vol: 70, muted: false };
  let settings;
  try { settings = Object.assign({}, DEF, JSON.parse(localStorage.getItem("gs84_settings") || "{}")); }
  catch (e) { settings = Object.assign({}, DEF); }
  const save = () => { try { localStorage.setItem("gs84_settings", JSON.stringify(settings)); } catch (e) {} };

  function applySettings() {
    document.documentElement.dataset.theme = settings.theme;
    const crt = $("#crt");
    crt.classList.toggle("noscan", !settings.scan);
    crt.classList.toggle("noflicker", !settings.flicker);
    crt.classList.toggle("norgb", !settings.rgb);
    GS_AUDIO.setVolume(settings.muted ? 0 : settings.vol / 100);
    GS_AUDIO.setSfx(settings.sfx);
    $("#btn-sound").textContent = settings.muted ? "ЗВУК: ВЫКЛ" : "ЗВУК: ВКЛ";
    $$("#modal-settings .toggle").forEach(b => b.textContent = settings[b.dataset.set] ? "ВКЛ" : "ВЫКЛ");
    $("#set-vol").value = settings.vol;
    $$("#set-theme .btn").forEach(b => b.classList.toggle("on", b.dataset.th === settings.theme));
  }

  function initSettingsUI() {
    applySettings();
    $("#btn-settings").addEventListener("click", () => { $("#modal-settings").classList.remove("is-hidden"); GS_AUDIO.sfx("open"); });
    $("#settings-close").addEventListener("click", () => {
      $("#modal-settings").classList.add("is-hidden"); save(); GS_AUDIO.sfx("back");
      GS_FX.toast("НАСТРОЙКИ СОХРАНЕНЫ В ПОСТОЯННУЮ ПАМЯТЬ.");
    });
    $$("#modal-settings .toggle").forEach(b => b.addEventListener("click", () => {
      settings[b.dataset.set] = !settings[b.dataset.set];
      applySettings(); save(); GS_AUDIO.sfx("click");
    }));
    $$("#set-theme .btn").forEach(b => b.addEventListener("click", () => {
      settings.theme = b.dataset.th; applySettings(); save(); GS_AUDIO.sfx("coin");
      GS_VIEWS && document.querySelector('.view.active') && document.querySelector('#logo').classList.add('glitching');
      setTimeout(() => document.querySelector('#logo').classList.remove('glitching'), 220);
    }));
    $("#set-vol").addEventListener("input", e => {
      settings.vol = +e.target.value; if (settings.vol > 0) settings.muted = false;
      applySettings(); save();
    });
    $("#set-wipe").addEventListener("click", () => {
      localStorage.clear();
      GS_FX.toast("<b>ПАМЯТЬ ТЕРМИНАЛА СТЁРТА.</b><br>ПЕРЕЗАГРУЗКА ЧЕРЕЗ 2 СЕКУНДЫ...");
      setTimeout(() => location.reload(), 2000);
    });
    $("#btn-sound").addEventListener("click", () => {
      settings.muted = !settings.muted;
      applySettings(); save();
      if (!settings.muted) GS_AUDIO.sfx("coin");
    });
    window.GS_APPLY_THEME = t => { settings.theme = t; applySettings(); save(); };
  }

  /* ══════ КОД КОНАМИ ══════ */
  const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  let kBuf = [];
  function initKonami() {
    window.addEventListener("keydown", e => {
      if (e.target && e.target.matches && e.target.matches("input,textarea")) return;
      kBuf.push(e.key.toLowerCase());
      kBuf = kBuf.slice(-KONAMI.length);
      if (KONAMI.every((k, i) => kBuf[i] === k)) {
        document.body.classList.toggle("turbo");
        const on = document.body.classList.contains("turbo");
        GS_AUDIO.sfx("turbo");
        GS_FX.toast(on
          ? "<b>ТУРБО-РЕЖИМ АКТИВИРОВАН.</b><br>ЧАСТОТА ЦВЕТОМУЗЫКИ ПОВЫШЕНА ПРИКАЗОМ №77."
          : "ТУРБО-РЕЖИМ ОТКЛЮЧЁН. СКРОМНОСТЬ УКРАШАЕТ ТЕРМИНАЛ.", 5200);
      }
    });
  }

  /* ══════ ЗАПУСК ══════ */
  let bootStarted = false;
  function bootInit() {
    if (bootStarted) return;
    bootStarted = true;
    window.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      $$(".modal").forEach(m => m.classList.add("is-hidden"));
    });
    initSettingsUI();
    initKonami();
    GS_FX.initTicker();
    GS_FX.startClock();
    GS_FX.rotateStatus();

    // прогрев аудио-процессора первым касанием
    const warm = () => { GS_AUDIO.ensure(); window.removeEventListener("pointerdown", warm); };
    window.addEventListener("pointerdown", warm);

    GS_FX.boot(() => {
      GS_VIEWS.init();
      GS_TERM.init();
      GS_GAME.init();
      setTimeout(GS_FX.glitchLoop, 1500);
      setTimeout(() => GS_FX.toast("ДОБРО ПОЖАЛОВАТЬ В СЕТЬ, ТОВАРИЩ.<br><span class='dim'>КЛАВИШИ 1–8 ПЕРЕКЛЮЧАЮТ ВКЛАДКИ. ИЩИТЕ ТУРБОКОД.</span>", 6400), 900);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootInit);
  else bootInit();
})();
