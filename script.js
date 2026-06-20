const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* =========================
   GAME STATE
========================= */

let gameStarted = false;

/* =========================
   EMBERS
========================= */

const embers = [];
let lavaOffset = 0;

for (let i = 0; i < 120; i++) {
  embers.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 2 + 0.5
  });
}

/* =========================
   DRAW LAVA
========================= */

function drawLavaRiver() {

  lavaOffset += 2;

  ctx.shadowBlur = 25;
  ctx.shadowColor = "#ff5500";

  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);

  g.addColorStop(0, "#ffff66");
  g.addColorStop(0.3, "#ff9900");
  g.addColorStop(0.6, "#ff3300");
  g.addColorStop(1, "#660000");

  ctx.fillStyle = g;

  // LEFT
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.25, 0);

  for (let y = 0; y < canvas.height; y += 20) {
    ctx.lineTo(
      canvas.width * 0.25 + Math.sin((y + lavaOffset) * 0.02) * 25,
      y
    );
  }

  ctx.lineTo(canvas.width * 0.30, canvas.height);
  ctx.fill();

  // RIGHT
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.70, 0);

  for (let y = 0; y < canvas.height; y += 20) {
    ctx.lineTo(
      canvas.width * 0.70 + Math.cos((y + lavaOffset) * 0.02) * 25,
      y
    );
  }

  ctx.lineTo(canvas.width * 0.75, canvas.height);
  ctx.fill();

  ctx.shadowBlur = 0;
}

/* =========================
   EMBERS
========================= */

function drawEmbers() {

  for (let p of embers) {

    ctx.fillStyle = "#ffb300";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    p.y -= p.speed;

    if (p.y < 0) {
      p.y = canvas.height;
      p.x = Math.random() * canvas.width;
    }
  }
}

/* =========================
   LOOP (SAFE)
========================= */

function loop() {

  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawLavaRiver();
  drawEmbers();

  requestAnimationFrame(loop);
}

/* =========================
   START GAME FIX
========================= */

window.onload = () => {

  const startScreen = document.getElementById("start-screen");
  const gameScreen = document.getElementById("game-screen");

  document.addEventListener("click", () => {

    if (gameStarted) return;

    gameStarted = true;

    startScreen.style.display = "none";
    gameScreen.classList.remove("hidden");

    loop();
  });

};
