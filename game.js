const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let resources = { food: 920, wood: 720, stone: 480, gold: 320 };
let buildings = [];
let troops = 25;
let placing = null;
let currentKingdom = "San Jose del Monte Kingdom";

const GRID = 46;
const WORLD_W = 90;
const WORLD_H = 60;
let cameraX = 800, cameraY = 500;
let isDragging = false, lastX, lastY;

let map = Array.from({length: WORLD_H}, () => Array(WORLD_W).fill(0));

for (let i = 0; i < 1400; i++) map[Math.floor(Math.random()*WORLD_H)][Math.floor(Math.random()*WORLD_W)] = 1;
for (let i = 0; i < 520; i++) if (map[Math.floor(Math.random()*WORLD_H)][Math.floor(Math.random()*WORLD_W)] === 0) map[Math.floor(Math.random()*WORLD_H)][Math.floor(Math.random()*WORLD_W)] = 2;
for (let i = 0; i < 320; i++) if (map[Math.floor(Math.random()*WORLD_H)][Math.floor(Math.random()*WORLD_W)] === 0) map[Math.floor(Math.random()*WORLD_H)][Math.floor(Math.random()*WORLD_W)] = 3;

const philippineKingdoms = [
    "San Jose del Monte Kingdom", "Sapang Palay Kingdom", "Quezon City Empire", "Manila Kingdom",
    "Davao Empire", "Cebu Kingdom", "Cagayan de Oro Realm", "Zamboanga Sultanate", 
    "Antipolo Kingdom", "Baguio Highland Kingdom", "Iloilo Kingdom", "General Santos Realm",
    "Makati Empire", "Taguig Kingdom", "Pasig River Kingdom"
];

function populateList(filter = '') {
    const list = document.getElementById('civ-list');
    list.innerHTML = '';
    const filtered = philippineKingdoms.filter(k => k.toLowerCase().includes(filter.toLowerCase()));
    filtered.forEach(k => {
        const btn = document.createElement('button');
        btn.textContent = k;
        btn.onclick = () => startGame(k);
        list.appendChild(btn);
    });
}

function startGame(kingdom) {
    currentKingdom = kingdom;
    document.getElementById('kingdom-name').textContent = `👑 ${kingdom}`;
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('container').classList.remove('hidden');
    log(`🏰 Maligayang pagdating sa <b>${kingdom}</b>!`);
}

document.getElementById('search').addEventListener('input', e => populateList(e.target.value));
populateList();

function updateUI() {
    document.getElementById('food').textContent = Math.floor(resources.food);
    document.getElementById('wood').textContent = Math.floor(resources.wood);
    document.getElementById('stone').textContent = Math.floor(resources.stone);
    document.getElementById('gold').textContent = Math.floor(resources.gold);
}

function log(msg) {
    const div = document.getElementById('log');
    div.innerHTML += `<div>${msg}</div>`;
    div.scrollTop = div.scrollHeight;
}

function draw() {
    ctx.fillStyle = '#0a1f0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const startX = Math.max(0, Math.floor(cameraX / GRID));
    const startY = Math.max(0, Math.floor(cameraY / GRID));
    const endX = Math.min(WORLD_W, Math.ceil((cameraX + canvas.width) / GRID));
    const endY = Math.min(WORLD_H, Math.ceil((cameraY + canvas.height) / GRID));

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const sx = x * GRID - cameraX;
            const sy = y * GRID - cameraY;
            const type = map[y][x];

            ctx.fillStyle = (x+y)%3 === 0 ? '#1e3a1e' : '#173217';
            ctx.fillRect(sx, sy, GRID, GRID);

            if (type === 3) {
                ctx.fillStyle = '#0b3d5e'; ctx.fillRect(sx, sy, GRID, GRID);
                ctx.fillStyle = '#1e7ab8'; ctx.fillRect(sx+5, sy+5, GRID-10, GRID-10);
            } else if (type === 2) {
                ctx.fillStyle = '#264726'; ctx.fillRect(sx+2, sy+2, GRID-4, GRID-4);
                ctx.fillStyle = '#3f5f3f'; ctx.beginPath(); ctx.ellipse(sx + GRID/2, sy + GRID/2.3, GRID*0.42, GRID*0.25, 0, 0, Math.PI*2); ctx.fill();
            } else if (type === 1) {
                ctx.fillStyle = '#0f2a0f'; ctx.fillRect(sx + GRID*0.32, sy + GRID*0.58, GRID*0.36, GRID*0.38);
                ctx.fillStyle = '#094'; ctx.beginPath(); ctx.arc(sx + GRID/2, sy + GRID/3.1, 21, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#1b9'; ctx.beginPath(); ctx.arc(sx + GRID/2 - 7, sy + GRID/3.6, 14, 0, Math.PI*2); ctx.fill();
            }
        }
    }

    buildings.forEach(b => {
        const sx = b.x * GRID - cameraX;
        const sy = b.y * GRID - cameraY;
        if (sx < -GRID || sx > canvas.width || sy < -GRID || sy > canvas.height) return;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(sx+6, sy+GRID-6, GRID-12, 8);

        if (b.type === 'townhall') {
            if (currentKingdom.includes("San Jose") || currentKingdom.includes("Sapang")) {
                ctx.fillStyle = '#b97'; ctx.fillRect(sx+4, sy+4, GRID-8, GRID-14);
                ctx.fillStyle = '#ff0'; ctx.fillRect(sx+10, sy+8, GRID-20, 24);
            } else if (currentKingdom.includes("Manila") || currentKingdom.includes("Quezon")) {
                ctx.fillStyle = '#a88'; ctx.fillRect(sx+3, sy+3, GRID-6, GRID-12);
                ctx.fillStyle = '#ff0'; ctx.fillRect(sx+9, sy+8, GRID-18, 20);
            } else {
                ctx.fillStyle = '#c98'; ctx.fillRect(sx+4, sy+4, GRID-8, GRID-10);
                ctx.fillStyle = '#ff0'; ctx.fillRect(sx+13, sy+10, GRID-26, 20);
            }
        } else if (b.type === 'farm') {
            ctx.fillStyle = '#6a5'; ctx.fillRect(sx+6, sy+8, GRID-12, GRID-16);
            ctx.fillStyle = '#ff0'; ctx.fillRect(sx+14, sy+14, 14, 12);
        } else if (b.type === 'barracks') {
            ctx.fillStyle = '#333'; ctx.fillRect(sx+5, sy+6, GRID-10, GRID-12);
            ctx.fillStyle = '#a22'; ctx.fillRect(sx+12, sy+12, GRID-24, GRID-24);
        } else if (b.type === 'house') {
            ctx.fillStyle = '#a87'; ctx.fillRect(sx+7, sy+12, GRID-14, GRID-22);
        }
    });

    ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Arial';
    ctx.fillText(`👥 ${troops}`, 30, 55);
}

function gameLoop() { draw(); requestAnimationFrame(gameLoop); }

// Drag & Touch
canvas.addEventListener('mousedown', e => { if(!placing){ isDragging=true; lastX=e.clientX; lastY=e.clientY; }});
canvas.addEventListener('mousemove', e => {
    if(!isDragging) return;
    cameraX -= e.clientX - lastX; cameraY -= e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    cameraX = Math.max(0, Math.min(cameraX, WORLD_W*GRID - canvas.width));
    cameraY = Math.max(0, Math.min(cameraY, WORLD_H*GRID - canvas.height));
});
canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

canvas.addEventListener('touchstart', e => { if(!placing){ isDragging=true; lastX=e.touches[0].clientX; lastY=e.touches[0].clientY; }}, {passive:false});
canvas.addEventListener('touchmove', e => {
    if(!isDragging) return;
    cameraX -= e.touches[0].clientX - lastX; cameraY -= e.touches[0].clientY - lastY;
    lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
    cameraX = Math.max(0, Math.min(cameraX, WORLD_W*GRID - canvas.width));
    cameraY = Math.max(0, Math.min(cameraY, WORLD_H*GRID - canvas.height));
    e.preventDefault();
}, {passive:false});
canvas.addEventListener('touchend', () => isDragging = false);

canvas.addEventListener('click', e => {
    if (!placing) return;
    const rect = canvas.getBoundingClientRect();
    const worldX = Math.floor((e.clientX - rect.left + cameraX) / GRID);
    const worldY = Math.floor((e.clientY - rect.top + cameraY) / GRID);
    if (worldX < 0 || worldX >= WORLD_W || worldY < 0 || worldY >= WORLD_H) return;
    if (buildings.some(b=>b.x===worldX && b.y===worldY) || map[worldY][worldX] !== 0) return log("❌ Hindi pwede dito!");
    
    let cost = {food:0,wood:0,stone:0};
    if(placing==='house') cost.food=80;
    else if(placing==='farm') cost.food=130;
    else if(placing==='townhall') cost.stone=250;
    else if(placing==='barracks') cost.wood=200;

    if(resources.food >= cost.food && resources.wood >= cost.wood && resources.stone >= cost.stone){
        resources.food -= cost.food; resources.wood -= cost.wood; resources.stone -= cost.stone;
        buildings.push({type:placing, x:worldX, y:worldY});
        updateUI();
        log(`✅ Napatayo ang <b>${placing.toUpperCase()}</b>!`);
        placing = null;
    } else log("❌ Kulang ang yaman!");
});

function startPlacing(type){ placing = type; log(`📍 Pumili ng lugar para sa <b>${type}</b>...`); }
function trainTroops(n){ const cost = n*10; if(resources.food >= cost){ resources.food -= cost; troops += n; updateUI(); log(`⚔️ Nasanay ${n} warriors!`); } else log("❌ Kulang sa pagkain!"); }
function attackBarbarians(){
    if(troops < 6) return log("❌ Kulang ang tropa!");
    const win = Math.random() > 0.4;
    const loot = Math.floor(Math.random()*220)+80;
    if(win){ resources.gold += loot; resources.food += Math.floor(loot*0.7); troops = Math.max(6, troops-4); log(`🏆 Nanalo! +${loot} ginto`); }
    else { troops = Math.max(3, troops-10); log("💥 Natalo sa laban..."); }
    updateUI();
}

setInterval(() => {
    const farms = buildings.filter(b => b.type === 'farm').length;
    const halls = buildings.filter(b => b.type === 'townhall').length;
    resources.food += farms * 10; resources.wood += halls * 7; resources.stone += halls * 5;
    updateUI();
}, 2400);

updateUI();
gameLoop();
log("👑 <b>Welcome to Poly Kingdoms!</b>");
log("🖱️ I-drag ang mapa para mag-explore");
