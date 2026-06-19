const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let resources = { food: 920, wood: 720, stone: 480, gold: 320 };
let buildings = [];
let troops = 45;
let gatheringParties = []; // {x, y, type, amount, progress, targetX, targetY}
let placing = null;
let currentKingdom = "San Jose del Monte Kingdom";

const GRID = 48;
const WORLD_W = 100;
const WORLD_H = 70;
let cameraX = 1400, cameraY = 900;
let isDragging = false, lastX, lastY;

let map = Array.from({length: WORLD_H}, () => Array(WORLD_W).fill(0));
let resourceNodes = [];

// Generate better map + resource nodes
for (let i = 0; i < 2200; i++) map[Math.floor(Math.random()*WORLD_H)][Math.floor(Math.random()*WORLD_W)] = 1; // trees
for (let i = 0; i < 800; i++) map[Math.floor(Math.random()*WORLD_H)][Math.floor(Math.random()*WORLD_W)] = 2; // grass
for (let i = 0; i < 550; i++) map[Math.floor(Math.random()*WORLD_H)][Math.floor(Math.random()*WORLD_W)] = 3; // mountains

// Generate Resource Nodes
function generateResourceNodes() {
    resourceNodes = [];
    // Food (grain fields)
    for (let i = 0; i < 35; i++) {
        let x = Math.floor(Math.random()*WORLD_W);
        let y = Math.floor(Math.random()*WORLD_H);
        if (map[y][x] !== 3) resourceNodes.push({x, y, type: 'food', amount: 420 + Math.random()*300});
    }
    // Wood (extra trees)
    for (let i = 0; i < 45; i++) {
        let x = Math.floor(Math.random()*WORLD_W);
        let y = Math.floor(Math.random()*WORLD_H);
        if (map[y][x] !== 3) resourceNodes.push({x, y, type: 'wood', amount: 380 + Math.random()*250});
    }
    // Stone
    for (let i = 0; i < 30; i++) {
        let x = Math.floor(Math.random()*WORLD_W);
        let y = Math.floor(Math.random()*WORLD_H);
        if (map[y][x] === 3 || Math.random() > 0.6) resourceNodes.push({x, y, type: 'stone', amount: 280 + Math.random()*220});
    }
    // Gold (rare)
    for (let i = 0; i < 18; i++) {
        let x = Math.floor(Math.random()*WORLD_W);
        let y = Math.floor(Math.random()*WORLD_H);
        if (map[y][x] === 3 || Math.random() > 0.7) resourceNodes.push({x, y, type: 'gold', amount: 120 + Math.random()*180});
    }
}
generateResourceNodes();

const philippineKingdoms = [ /* same as before */ ];

function populateList(filter = '') { /* same as before */ }
function startGame(kingdom) { /* same as before */ }

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

// ==================== DRAWING ====================
function draw() {
    ctx.fillStyle = '#0a180a';
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

            ctx.fillStyle = (x + y) % 2 === 0 ? '#1e3a1e' : '#1a341a';
            ctx.fillRect(sx, sy, GRID, GRID);

            if (type === 3) { // Mountain
                ctx.fillStyle = '#555566';
                ctx.fillRect(sx+4, sy+4, GRID-8, GRID-12);
            } else if (type === 1) {
                ctx.fillStyle = '#0d2a0d';
                ctx.fillRect(sx+12, sy+22, GRID-24, GRID-18);
                ctx.fillStyle = '#228822';
                ctx.beginPath(); ctx.arc(sx+GRID/2, sy+GRID/3, GRID*0.35, 0, Math.PI*2); ctx.fill();
            }
        }
    }

    // Draw Resource Nodes
    resourceNodes.forEach(node => {
        const sx = node.x * GRID - cameraX;
        const sy = node.y * GRID - cameraY;
        if (sx < -GRID || sx > canvas.width || sy < -GRID || sy > canvas.height) return;

        if (node.type === 'food') {
            ctx.fillStyle = '#ff0';
            ctx.fillRect(sx+12, sy+12, GRID-24, GRID-24);
            ctx.fillStyle = '#6c6';
            ctx.fillRect(sx+18, sy+18, GRID-36, GRID-36);
        } else if (node.type === 'wood') {
            ctx.fillStyle = '#1a5';
            ctx.fillRect(sx+8, sy+8, GRID-16, GRID-12);
            ctx.fillStyle = '#0b3';
            ctx.beginPath(); ctx.arc(sx+GRID/2, sy+GRID*0.35, GRID*0.32, 0, Math.PI*2); ctx.fill();
        } else if (node.type === 'stone') {
            ctx.fillStyle = '#777';
            ctx.fillRect(sx+10, sy+14, GRID-20, GRID-22);
            ctx.fillStyle = '#999';
            ctx.fillRect(sx+18, sy+20, GRID-34, 12);
        } else if (node.type === 'gold') {
            ctx.fillStyle = '#ff0';
            ctx.fillRect(sx+14, sy+14, GRID-28, GRID-28);
            ctx.fillStyle = '#fd0';
            ctx.fillRect(sx+20, sy+20, GRID-40, GRID-40);
        }
    });

    // Buildings
    buildings.forEach(b => {
        const sx = b.x * GRID - cameraX;
        const sy = b.y * GRID - cameraY;
        if (b.type === 'townhall') {
            ctx.fillStyle = '#b97'; ctx.fillRect(sx+6, sy+6, GRID-12, GRID-18);
        } else if (b.type === 'farm') {
            ctx.fillStyle = '#6a5'; ctx.fillRect(sx+6, sy+12, GRID-12, GRID-20);
        } else if (b.type === 'barracks') {
            ctx.fillStyle = '#333'; ctx.fillRect(sx+5, sy+8, GRID-10, GRID-16);
        } else if (b.type === 'house') {
            ctx.fillStyle = '#a87'; ctx.fillRect(sx+8, sy+14, GRID-16, GRID-26);
        }
    });

    ctx.fillStyle = '#fff'; ctx.font = 'bold 28px Arial';
    ctx.fillText(`👥 ${troops}`, 30, 55);
}

function gameLoop() { 
    draw(); 
    requestAnimationFrame(gameLoop); 
}

// ==================== GATHERING SYSTEM ====================
function startGathering(resType, numTroops) {
    if (troops < numTroops) return log("❌ Kulang ang sundalo!");

    // Find nearest node of that type
    let nearest = null;
    let minDist = Infinity;
    resourceNodes.forEach((node, i) => {
        if (node.type === resType && node.amount > 20) {
            const dist = Math.hypot(node.x - 25, node.y - 18); // rough center
            if (dist < minDist) {
                minDist = dist;
                nearest = {node, index: i};
            }
        }
    });

    if (!nearest) return log(`❌ Walang makitang ${resType} sa malapit!`);

    const node = nearest.node;
    troops -= numTroops;

    gatheringParties.push({
        x: 25, y: 18, // starting from center-ish
        targetX: node.x,
        targetY: node.y,
        type: resType,
        amount: numTroops * (resType === 'gold' ? 8 : 18),
        progress: 0,
        troops: numTroops,
        nodeIndex: nearest.index
    });

    log(`🚶 ${numTroops} sundalo ang ipinadala para mag-farm ng <b>${resType}</b>...`);
}

function updateGathering() {
    for (let i = gatheringParties.length - 1; i >= 0; i--) {
        const g = gatheringParties[i];
        g.progress += 0.018;

        if (g.progress >= 1) {
            // Return resources
            if (g.type === 'food') resources.food += g.amount;
            else if (g.type === 'wood') resources.wood += g.amount;
            else if (g.type === 'stone') resources.stone += g.amount;
            else if (g.type === 'gold') resources.gold += g.amount;

            // Reduce node amount
            resourceNodes[g.nodeIndex].amount -= g.amount * 0.6;

            troops += g.troops;
            log(`✅ Bumalik ang ${g.troops} sundalo! +${Math.floor(g.amount)} ${g.type}`);
            gatheringParties.splice(i, 1);
            updateUI();
        }
    }
}

// ==================== CONTROLS (same drag + placement) ====================
canvas.addEventListener('mousedown', e => { if(!placing){ isDragging=true; lastX=e.clientX; lastY=e.clientY; }});
// ... (keep the rest of drag, touch, click for building placement from previous version)

canvas.addEventListener('click', e => {
    if (!placing) return;
    // ... (same building placement code as previous)
});

function startPlacing(type){ 
    placing = type; 
    log(`📍 Pumili ng lugar para sa <b>${type}</b>...`); 
}

// Add to HTML buttons later if needed, but for now we'll add in UI

// Resource tick + gathering update
setInterval(() => {
    // Passive from buildings
    const farms = buildings.filter(b => b.type === 'farm').length;
    resources.food += farms * 9;
    updateUI();
    updateGathering();
}, 1200);

updateUI();
gameLoop();
log("👑 <b>Poly Kingdoms</b> - Farming Update");
log("🌾 Magpadala ng sundalo para mag-farm sa mapa!");
