/* ═══ ГОССЕТЬ-84 // ИГРОВЫЕ АВТОМАТЫ ═══ */
"use strict";

const GS_GAME = (() => {
  const $ = s => document.querySelector(s);

  /* ── ЗМЕЙКА-84 ── */
  const snake = {
    cv: null, c: null, CW: 30, CH: 20, CELL: 16,
    body: [], dir: { x: 1, y: 0 }, pend: { x: 1, y: 0 },
    food: { x: 15, y: 10 }, score: 0, hi: 0, timer: null,
    running: false, paused: false, alive: false
  };
  const LS_SNAKE = { get() { try { return +localStorage.getItem("gs84_snake_hi") || 0; } catch (e) { return 0; } }, set(v) { try { localStorage.setItem("gs84_snake_hi", v); } catch (e) {} } };

  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  function snakeInit() {
    snake.cv = $("#snake"); snake.c = snake.cv.getContext("2d");
    snake.hi = LS_SNAKE.get();
    $("#snake-hi").textContent = snake.hi;
    drawSnakeScene(true);
    $("#snake-start").addEventListener("click", startSnake);
    document.querySelectorAll(".snake-pad [data-dir]").forEach(b =>
      b.addEventListener("click", () => setDir(b.dataset.dir)));
    window.addEventListener("keydown", e => {
      const inArcade = $("#view-arcade").classList.contains("active");
      if (!inArcade || (e.target && e.target.matches && e.target.matches("input,textarea"))) return;
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
      if (k === "arrowup" || k === "ц" || k === "w") setDir("up");
      else if (k === "arrowdown" || k === "ы" || k === "s") setDir("down");
      else if (k === "arrowleft" || k === "ф" || k === "a") setDir("left");
      else if (k === "arrowright" || k === "в" || k === "d") setDir("right");
      else if (k === " ") togglePause();
    });
  }

  function setDir(d) {
    const map = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    const nd = map[d]; if (!nd || !snake.alive) return;
    if (nd.x === -snake.dir.x && nd.y === -snake.dir.y) return; // назад нельзя
    snake.pend = nd;
  }

  function startSnake() {
    clearInterval(snake.timer);
    snake.body = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    snake.dir = snake.pend = { x: 1, y: 0 };
    snake.score = 0; snake.alive = true; snake.paused = false; snake.running = true;
    spawnFood();
    $("#snake-overlay").classList.add("is-hidden");
    $("#snake-score").textContent = "0";
    $("#snake-speed").textContent = "1";
    snake.timer = setInterval(tick, 150);
    GS_AUDIO.sfx("open");
  }

  function spawnFood() {
    do {
      snake.food = { x: Math.floor(Math.random() * snake.CW), y: Math.floor(Math.random() * snake.CH) };
    } while (snake.body.some(b => b.x === snake.food.x && b.y === snake.food.y));
  }

  function speedLevel() { return Math.min(6, 1 + Math.floor(snake.score / 80)); }

  function tick() {
    if (snake.paused || !snake.alive) return;
    snake.dir = snake.pend;
    const head = { x: snake.body[0].x + snake.dir.x, y: snake.body[0].y + snake.dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= snake.CW || head.y >= snake.CH ||
        snake.body.some(b => b.x === head.x && b.y === head.y)) { die(); return; }
    snake.body.unshift(head);
    if (head.x === snake.food.x && head.y === snake.food.y) {
      snake.score += 10 * speedLevel();
      $("#snake-score").textContent = snake.score;
      const lvl = speedLevel();
      $("#snake-speed").textContent = lvl;
      clearInterval(snake.timer);
      snake.timer = setInterval(tick, Math.max(60, 160 - lvl * 15));
      GS_AUDIO.sfx("eat");
      spawnFood();
    } else snake.body.pop();
    drawSnakeScene();
  }

  function die() {
    snake.alive = false;
    clearInterval(snake.timer);
    GS_AUDIO.sfx("die");
    if (snake.score > snake.hi) { snake.hi = snake.score; LS_SNAKE.set(snake.hi); }
    $("#snake-hi").textContent = snake.hi;
    const ov = $("#snake-overlay");
    ov.querySelector(".so-title").textContent = "АВТОМАТ ГУДИТ";
    ov.querySelector(".so-sub").innerHTML = "ИТОГ: " + snake.score + " ОЧКОВ<br>РЕКОРД: " + snake.hi + "<br>ЖЕТОНЫ НЕ ВОЗВРАЩАЮТСЯ";
    ov.querySelector("#snake-start").textContent = "↻ ЕЩЁ РАЗ";
    ov.classList.remove("is-hidden");
  }

  function togglePause() {
    if (!snake.alive) return;
    snake.paused = !snake.paused;
    GS_FX.toast(snake.paused ? "ПАУЗА. ЗМЕЙКА МЕДИТИРУЕТ." : "ПОЕХАЛИ ДАЛЬШЕ.");
  }

  function drawSnakeScene(idle) {
    const c = snake.c, W = snake.cv.width, H = snake.cv.height;
    const neon = css("--neon"), neon2 = css("--neon2");
    c.fillStyle = "#030308"; c.fillRect(0, 0, W, H);
    // сетка
    c.fillStyle = "rgba(120,160,190,.07)";
    for (let x = 0; x < snake.CW; x += 2) for (let y = 0; y < snake.CH; y += 2)
      c.fillRect(x * snake.CELL + 7, y * snake.CELL + 7, 1.4, 1.4);
    if (idle && !snake.body.length) {
      c.strokeStyle = neon2; c.globalAlpha = .5; c.lineWidth = 2;
      c.strokeRect(4, 4, W - 8, H - 8); c.globalAlpha = 1;
      return;
    }
    // еда
    const t = performance.now() / 300;
    c.fillStyle = neon2;
    c.shadowColor = neon2; c.shadowBlur = 12;
    const fs = 6 + Math.sin(t) * 2;
    c.fillRect(snake.food.x * snake.CELL + 8 - fs / 2, snake.food.y * snake.CELL + 8 - fs / 2, fs, fs);
    c.shadowBlur = 0;
    // змейка
    snake.body.forEach((b, i) => {
      const a = 1 - i / (snake.body.length + 4);
      c.fillStyle = i === 0 ? "#ffffff" : neon;
      c.globalAlpha = Math.max(0.25, a);
      c.shadowColor = neon; c.shadowBlur = i === 0 ? 14 : 7;
      c.fillRect(b.x * snake.CELL + 1, b.y * snake.CELL + 1, snake.CELL - 2, snake.CELL - 2);
    });
    c.globalAlpha = 1; c.shadowBlur = 0;
  }

  function leaveArcade() { if (snake.alive && !snake.paused) snake.paused = true; }

  /* ── ПРОВЕРКА РЕФЛЕКСОВ ── */
  const react = { state: "idle", t0: 0, timer: null, best: null };
  function LS_REACT() { try { return +localStorage.getItem("gs84_react") || null; } catch (e) { return null; } }

  function reactInit() {
    react.best = LS_REACT();
    $("#react-best").textContent = react.best ? react.best + " мс" : "—";
    $("#react-pad").addEventListener("click", () => {
      const pad = $("#react-pad");
      if (react.state === "idle" || react.state === "done") {
        react.state = "armed";
        pad.className = "react-pad armed";
        pad.textContent = "ЖДИТЕ СИГНАЛ...";
        react.timer = setTimeout(() => {
          react.state = "go"; react.t0 = performance.now();
          pad.className = "react-pad go";
          pad.textContent = "СИГНАЛ! ЖМИ!";
          GS_AUDIO.sfx("coin");
        }, 1300 + Math.random() * 2900);
      } else if (react.state === "armed") {
        clearTimeout(react.timer);
        react.state = "idle";
        pad.className = "react-pad";
        pad.textContent = "РАНЬШЕ ВРЕМЕНИ. ШТРАФ: НЕТ.";
        $("#react-last").textContent = "ФАЛСТАРТ";
        GS_AUDIO.sfx("error");
      } else if (react.state === "go") {
        const dt = Math.round(performance.now() - react.t0);
        react.state = "done";
        pad.className = "react-pad";
        pad.textContent = dt + " мс — " + (dt < 220 ? "УРОВЕНЬ ДРОИДА!" : dt < 320 ? "ОТЛИЧНО, ГРАЖДАНИН" : "НОРМА ДОПУЩЕНА");
        $("#react-last").textContent = dt + " мс";
        if (!react.best || dt < react.best) {
          react.best = dt;
          try { localStorage.setItem("gs84_react", dt); } catch (e) {}
          $("#react-best").textContent = dt + " мс";
          GS_FX.toast("НОВЫЙ ЛИЧНЫЙ РЕКОРД: <b>" + dt + " мс</b>");
        }
        GS_AUDIO.sfx("turbo");
      }
    });
  }

  function init() { snakeInit(); reactInit(); }
  return { init, leaveArcade };
})();
