/* ═══ ГОССЕТЬ-84 // ВИЗУАЛЬНЫЕ ЭФФЕКТЫ ═══ */
"use strict";

const GS_FX = (() => {

  const $ = s => document.querySelector(s);

  /* ── уведомления ── */
  function toast(html, ms) {
    const box = $("#toasts");
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = html;
    box.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 450); }, ms || 4200);
  }

  /* ── печатающийся текст ── */
  const typeJobs = new WeakMap();
  function typewrite(el, text, speed, sound) {
    if (typeJobs.has(el)) clearInterval(typeJobs.get(el));
    el.textContent = "";
    let i = 0;
    const car = document.createElement("span"); car.className = "caret"; car.textContent = "▮";
    el.appendChild(car);
    const job = setInterval(() => {
      if (i >= text.length) { clearInterval(job); typeJobs.delete(el); setTimeout(() => car.remove(), 2400); return; }
      car.before(document.createTextNode(text[i]));
      if (sound && i % 3 === 0) GS_AUDIO.sfx("key");
      i++;
    }, speed || 34);
    typeJobs.set(el, job);
  }

  /* ── БИОС / загрузка ── */
  function boot(done) {
    const log = $("#boot-log"), skip = $("#boot-skip");
    const lines = GS_DATA.bootLines.slice();
    const hl = s => s.split("[ok]").join('<span class="ok">[OK]</span>');
    let li = 0, ci = 0, finished = false, gone = false;

    const iv = setInterval(() => {
      if (li >= lines.length) { finishType(); return; }
      const raw = lines[li];
      ci += 3;
      const typed = raw.slice(0, ci);
      log.innerHTML = hl(lines.slice(0, li).join("\n")) + (li > 0 ? "\n" : "") + hl(typed) + "▮";
      if (ci >= raw.length) { li++; ci = 0; }
    }, 24);

    function finishType() {
      if (finished) return;
      clearInterval(iv);
      log.innerHTML = hl(lines.join("\n"));
      skip.classList.remove("is-hidden");
      finished = true;
    }
    function go() {
      if (gone) return;
      if (!finished) { finishType(); return; }
      gone = true;
      GS_AUDIO.ensure(); GS_AUDIO.sfx("boot");
      const b = $("#boot");
      b.style.transition = "opacity .35s"; b.style.opacity = "0";
      setTimeout(() => { b.remove(); $("#crt").classList.remove("is-off"); done && done(); }, 380);
    }
    $("#boot").addEventListener("click", go);
    window.addEventListener("keydown", function k() {
      if (document.getElementById("boot")) go(); else window.removeEventListener("keydown", k);
    });
  }

  /* ── часы и статус ── */
  function startClock() {
    const el = $("#clock");
    const tick = () => {
      const t = new Date().toLocaleTimeString("ru-RU", { timeZone: "Europe/Moscow", hour12: false });
      el.textContent = "МОСКВА " + t + " // 1984";
    };
    tick(); setInterval(tick, 1000);
  }
  function rotateStatus() {
    const el = $("#status-msg");
    let i = 0;
    setInterval(() => { i = (i + 1) % GS_DATA.statuses.length; el.textContent = GS_DATA.statuses[i]; }, 6200);
  }

  /* ── бегущая строка ── */
  function initTicker() {
    const items = GS_DATA.ticker.map(t => "<b>///</b>&nbsp;&nbsp;" + t).join("&nbsp;&nbsp;&nbsp;&nbsp;");
    $("#ticker-track").innerHTML = items + "&nbsp;&nbsp;&nbsp;&nbsp;" + "<b>///</b>&nbsp;&nbsp;" + GS_DATA.ticker[0];
  }

  /* ── случайный глитч заголовков ── */
  function glitchLoop() {
    if (!document.hidden) {
      const els = [...document.querySelectorAll(".glitchable")].filter(e => e.offsetParent !== null);
      if (els.length) {
        const el = els[Math.floor(Math.random() * els.length)];
        el.classList.add("glitching");
        setTimeout(() => el.classList.remove("glitching"), 190);
      }
    }
    setTimeout(glitchLoop, 1400 + Math.random() * 2600);
  }

  /* ── неоновый горизонт (canvas) ── */
  function horizon(canvas) {
    const c = canvas.getContext("2d");
    let w, h, dpr, raf = null, t0 = performance.now(), running = false;
    const stars = Array.from({ length: 90 }, (_, i) => ({
      x: (i * 137.5) % 1, y: ((i * 89.7) % 55) / 100, s: 0.5 + ((i * 31) % 10) / 10
    }));
    const ridge = side => Array.from({ length: 26 }, (_, i) => ({
      x: i / 25, y: Math.abs(Math.sin(i * (side ? 2.3 : 1.7) + side * 3)) * 0.1 + ((i * 13 + side * 7) % 5) * 0.008
    }));
    const ridgeL = ridge(0), ridgeR = ridge(1);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

    function frame(now) {
      if (!running) return;
      if (!w || Math.abs(canvas.clientWidth - w) > 4) resize();
      const T = (now - t0) / 1000;
      const neon = css("--neon") || "#00f0ff";
      const neon2 = css("--neon2") || "#ff2bd6";
      const HY = h * 0.6, cx = w / 2;

      // небо
      c.fillStyle = "#02020a"; c.fillRect(0, 0, w, h);

      // звёзды
      for (const st of stars) {
        const a = 0.25 + 0.55 * Math.abs(Math.sin(T * 0.8 + st.x * 40));
        c.fillStyle = "rgba(200,240,255," + a.toFixed(3) + ")";
        c.fillRect(st.x * w, st.y * h, st.s + 0.6, st.s + 0.6);
      }

      // солнце с полосами
      const R = Math.min(w, h) * 0.26;
      c.save();
      c.shadowColor = neon2; c.shadowBlur = 34;
      c.fillStyle = neon2;
      c.beginPath(); c.arc(cx, HY - 4, R, 0, Math.PI * 2); c.fill();
      c.shadowBlur = 0;
      c.fillStyle = "#02020a";
      let sy = HY - 4 + R * 0.18, sh = 2;
      while (sy < HY - 4 + R) { c.fillRect(cx - R - 2, sy, R * 2 + 4, sh); sy += sh + Math.max(3, R * 0.1); sh *= 1.55; }
      c.restore();

      if (T % 6 < 3) {
        // периодический «сдвиг» изображения
        const gy = (Math.sin(T * 1.9) * 0.5 + 0.5) * HY * 0.9;
        c.fillStyle = "rgba(255,255,255,0.02)";
        c.fillRect(0, gy, w, 3);
      }

      // горные хребты
      const drawRidge = (r, fromRight) => {
        c.beginPath();
        r.forEach((p, i) => {
          const px = fromRight ? w * 0.58 + p.x * (w * 0.42) : p.x * (w * 0.42);
          const py = HY - p.y * h;
          i ? c.lineTo(px, py) : c.moveTo(px, py);
        });
        c.strokeStyle = neon; c.globalAlpha = 0.35; c.lineWidth = 1;
        c.shadowColor = neon; c.shadowBlur = 6;
        c.stroke(); c.globalAlpha = 1; c.shadowBlur = 0;
      };
      drawRidge(ridgeL, false); drawRidge(ridgeR, true);

      // земля
      c.fillStyle = "#04030f"; c.fillRect(0, HY, w, h - HY);

      // вертикали сетки
      c.strokeStyle = neon; c.lineWidth = 1;
      c.shadowColor = neon; c.shadowBlur = 7;
      const N = 16;
      for (let i = -N; i <= N; i++) {
        c.globalAlpha = 0.55 - Math.min(0.4, Math.abs(i) / N * 0.4);
        c.beginPath();
        c.moveTo(cx + i * (w / 90), HY);
        c.lineTo(cx + i * (w / 7.2), h);
        c.stroke();
      }

      // горизонтали, несущиеся к зрителю
      const rows = 14, speed = 0.45;
      for (let k = 0; k < rows; k++) {
        const p = (k / rows + T * speed) % 1;
        const y = HY + (h - HY) * Math.pow(p, 2.6);
        c.globalAlpha = 0.14 + p * 0.5;
        c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
      }
      c.globalAlpha = 1;

      // линия горизонта
      c.shadowBlur = 16; c.strokeStyle = "#fff"; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(0, HY); c.lineTo(w, HY); c.stroke();
      c.shadowBlur = 0;

      // пробегающий скан-луч
      const sweep = (T * 26) % (h + 60) - 30;
      c.fillStyle = "rgba(255,255,255,0.035)";
      c.fillRect(0, sweep, w, 2);

      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", () => { if (running) resize(); });
    return {
      start() { if (running) return; running = true; resize(); raf = requestAnimationFrame(frame); },
      stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }
    };
  }

  /* ── анимация чисел ── */
  function countUp(el) {
    const target = +el.dataset.count, suf = el.dataset.suffix || "";
    const t0 = performance.now(), dur = 1400;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased).toLocaleString("ru-RU") + suf;
      if (p < 1) requestAnimationFrame(step); else el.textContent = target.toLocaleString("ru-RU") + suf;
    };
    requestAnimationFrame(step);
  }

  return { toast, typewrite, boot, startClock, rotateStatus, initTicker, glitchLoop, horizon, countUp };
})();
