
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* =========================
   GAME STATE
========================= */

let gameStarted = false;

/* =========================
   RESOURCES
========================= */

let resources = {
  food: 100,
  wood: 100,
  stone: 100,
  gold: 100
};

/* =========================
   BUILDINGS (ROK SYSTEM)
========================= */

let buildings = {
  castle: 1,
  farm: 0,
  lumber: 0,
  quarry: 0,
  goldmine: 0
};

/* =========================
   UI UPDATE
========================= */

function updateUI() {
  document.getElementById("food").innerText = resources.food;
  document.getElementById("wood").innerText = resources.wood;
  document.getElementById("stone").innerText = resources.stone;
  document.getElementById("gold").innerText = resources.gold;
}

/* =========================
   BUILDING BONUS SYSTEM
========================= */

function applyBuildingIncome() {

  resources.food += buildings.farm * 2;
  resources.wood += buildings.lumber * 2;
  resources.stone += buildings.quarry * 2;
  resources.gold += buildings.goldmine * 2;

  if (buildings.castle > 1) {
    resources.food += buildings.castle;
    resources.wood += buildings.castle;
    resources.stone += buildings.castle;
    resources.gold += buildings.castle;
  }
}

/* =========================
   PASSIVE INCOME
========================= */

setInterval(() => {

  if (!gameStarted) return;

  resources.food += 5;
  resources.wood += 5;
  resources.stone += 3;
  resources.gold += 2;

  applyBuildingIncome();
  updateUI();

}, 2000);

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
   LAVA RIVER (UNCHANGED)
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
   UNITS
========================= */

let units = [];

function drawUnits() {

  for (let u of units) {

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(u.x, u.y, 10, 10);

    u.y -= u.speed;
  }
}

/* =========================
   CONTROLS
========================= */

// SPAWN UNIT
document.addEventListener("click", () => {

  if (!gameStarted) return;

  units.push({
    x: Math.random() * canvas.width,
    y: canvas.height - 60,
    speed: 1 + Math.random() * 2
  });
});

// BUILD SYSTEM
document.addEventListener("keydown", (e) => {

  if (!gameStarted) return;

  if (e.key === "1") buildings.farm++;
  if (e.key === "2") buildings.lumber++;
  if (e.key === "3") buildings.quarry++;
  if (e.key === "4") buildings.goldmine++;
  if (e.key === "c") buildings.castle++;

  if (e.key === "f") resources.food += 20;
  if (e.key === "w") resources.wood += 20;
  if (e.key === "s") resources.stone += 20;
  if (e.key === "g") resources.gold += 20;

  updateUI();
});

/* =========================
   LOOP
========================= */

function loop() {

  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawLavaRiver();
  drawEmbers();
  drawUnits();

  requestAnimationFrame(loop);
}

/* =========================
   START GAME
========================= */

window.onload = () => {

  const startScreen = document.getElementById("start-screen");
  const gameScreen = document.getElementById("game-screen");

  document.addEventListener("click", () => {

    if (gameStarted) return;

    gameStarted = true;

    startScreen.style.display = "none";
    gameScreen.classList.remove("hidden");

    updateUI();
    loop();
  });
};
