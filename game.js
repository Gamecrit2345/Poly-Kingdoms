const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 👑 KINGDOM DATA
const kingdoms = [
  {
    name: "San Jose Del Monte Kingdom",
    bonus: "Gold +20%"
  },
  {
    name: "Sapang Palay Kingdom",
    bonus: "Troop Attack +20%"
  }
];

let currentKingdom = "";

// 🌾 RESOURCES
let resources = {
  food: 100,
  wood: 100,
  stone: 100,
  gold: 100
};

// 👑 LOAD KINGDOM BUTTONS
function loadKingdoms() {
  const list = document.getElementById("civ-list");
  list.innerHTML = "";

  kingdoms.forEach(k => {
    const btn = document.createElement("button");
    btn.className = "kingdom-btn";
    btn.innerHTML = `<b>${k.name}</b><br><small>${k.bonus}</small>`;

    btn.onclick = () => startGame(k);

    list.appendChild(btn);
  });
}

loadKingdoms();

// 🚀 START GAME
function startGame(kingdom) {
  currentKingdom = kingdom.name;

  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");

  console.log("Selected Kingdom:", kingdom.name);
  updateUI();
}

// 📊 UPDATE UI
function updateUI() {
  document.getElementById("food").textContent = resources.food;
  document.getElementById("wood").textContent = resources.wood;
  document.getElementById("stone").textContent = resources.stone;
  document.getElementById("gold").textContent = resources.gold;
}

// 🎮 SIMPLE GAME LOOP (placeholder world)
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // simple map background
  ctx.fillStyle = "#1c3a1c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // player base (example)
  ctx.fillStyle = "yellow";
  ctx.fillRect(200, 200, 60, 60);

  requestAnimationFrame(gameLoop);
}

gameLoop();

// 🌾 PASSIVE RESOURCE GAIN
setInterval(() => {
  resources.food += 2;
  resources.wood += 2;
  resources.stone += 1;
  resources.gold += 1;

  updateUI();
}, 2000);
