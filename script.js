/* =========================
   POLY KINGDOMS FIRE VERSION
========================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* =========================
   FIRE EFFECT VARIABLES
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
   LAVA RIVER
========================= */

function drawLavaRiver() {

  lavaOffset += 2;

  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    canvas.height
  );

  gradient.addColorStop(0, "#ffff66");
  gradient.addColorStop(0.2, "#ffcc00");
  gradient.addColorStop(0.4, "#ff8800");
  gradient.addColorStop(0.7, "#ff3300");
  gradient.addColorStop(1, "#660000");

  ctx.fillStyle = gradient;
  ctx.shadowBlur = 30;
  ctx.shadowColor = "#ff5500";

  // LEFT RIVER
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.25, 0);

  for (let y = 0; y < canvas.height; y += 20) {
    ctx.lineTo(
      canvas.width * 0.25 + Math.sin((y + lavaOffset) * 0.02) * 30,
      y
    );
  }

  ctx.lineTo(canvas.width * 0.30, canvas.height);
  ctx.fill();

  // RIGHT RIVER
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.70, 0);

  for (let y = 0; y < canvas.height; y += 20) {
    ctx.lineTo(
      canvas.width * 0.70 + Math.cos((y + lavaOffset) * 0.02) * 30,
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

  embers.forEach(p => {

    ctx.fillStyle = "#ffb300";

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    p.y -= p.speed;

    if (p.y < 0) {
      p.y = canvas.height;
      p.x = Math.random() * canvas.width;
    }
  });

}

/* =========================
   MAIN LOOP
========================= */

function loop() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawLavaRiver();
  drawEmbers();

  requestAnimationFrame(loop);
}

loop();
