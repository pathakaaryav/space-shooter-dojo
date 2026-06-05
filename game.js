// NEON STRIKE 1.5 - Story Mode Campaign
// CS 1.5 Physics Engine, 4 Mission Objectives, Level Loaders, Steal Mechanics, Boss AI

// Game & Scene
let scene, camera, renderer;
let player, floorGrid;
let yaw = 0, pitch = 0;

// Game State Machine
let gameState = 'MENU'; // MENU, PLAYING, MISSION_COMPLETE, GAMEOVER
let currentMissionId = 1;
let unlockedMissions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]; // Persistent during session

// Mission data definitions
const MISSIONS = {
    1: {
        title: "GRID ENTRY",
        subtitle: "SECTOR TELEMETRY SECURED",
        story: "Rogue AI scout drones have breached Sector 7's perimeter. Re-establish telemetry signals by eliminating all hostile scouts. Use standard counter-strafing techniques to retain accuracy while moving.",
        xp: 1200
    },
    2: {
        title: "SILENT CRYPT",
        subtitle: "SECURITY FIREWALL BYPASSED",
        story: "You must enter the mainframe server vaults to disable the defense firewall. The core security turrets are sensitive to movement. Walk silently (hold Shift) or crouch (hold Ctrl) to keep your speed low and bypass the defense scanner beams. Locate and destroy all 4 server nodes.",
        xp: 1800
    },
    3: {
        title: "THE ASCENT",
        subtitle: "BROADCAST DISH RETRIEVED",
        story: "The AI signal jammer is broadcasted from a high-altitude platform. Climb to the top transmitter dish by jumping (Space) across the floating platforms. Fast hovering drones will harass you; utilize scope zoom (Right-Click) to eliminate them.",
        xp: 2200
    },
    4: {
        title: "SINGULARITY CORE",
        subtitle: "CENTRAL AI PURGED",
        story: "Infiltrate the central reactor chamber. The Core Singularity is heavily armored and protected by rotating shield barriers. Dodge dense waves of energy lasers and target the Core when shields drop. Good luck operator.",
        xp: 5000
    },
    5: {
        title: "OUTPOST INFILTRATION",
        subtitle: "OUTPOST CLEARED",
        story: "Infiltrate a heavily fortified enemy sentinel outpost. The sector security grid is defended by automatic sentry turrets and armed guards. Break through the defenses by neutralizing all sentinel forces.",
        xp: 3500
    },
    6: {
        title: "TURRET ALLEY",
        subtitle: "ALLEY CLEARED",
        story: "A long corridor heavily defended by 8 turrets. Walk/crouch carefully to survive.",
        xp: 3500
    },
    7: {
        title: "SHADOW REALM",
        subtitle: "BEACONS DESTROYED",
        story: "Destroy 5 signal beacons scattered in the dark, guarded by 10 fast drones.",
        xp: 4000
    },
    8: {
        title: "SKY FALL",
        subtitle: "AERIAL SUPERIORITY",
        story: "Scale a series of very high floating platforms while dodging fast aerial drones.",
        xp: 4500
    },
    9: {
        title: "THE TWINS",
        subtitle: "CORES OVERLOADED",
        story: "A brutal boss battle against two heavily shielded Singularity Cores simultaneously.",
        xp: 7500
    },
    10: {
        title: "AARYAV'S WRATH",
        subtitle: "SYSTEM PURGED",
        story: "The ultimate endurance run. Survive 20 drones, 4 turrets, and the final Boss Core.",
        xp: 10000
    },
    11: {
        title: "NIGHTMARE 11",
        subtitle: "DRONE SWARM SURVIVED",
        story: "Extreme threat level. Overwhelming drone presence. Survive the onslaught.",
        xp: 12000
    },
    12: {
        title: "NIGHTMARE 12",
        subtitle: "SQUADS ELIMINATED",
        story: "Extreme threat level. Hostile elite squads have entered the area. Terminate them.",
        xp: 13000
    },
    13: {
        title: "NIGHTMARE 13",
        subtitle: "TURRET GRID DESTROYED",
        story: "Extreme threat level. A dense perimeter of defense turrets blocks the path. Clear the grid.",
        xp: 14000
    },
    14: {
        title: "NIGHTMARE 14",
        subtitle: "GROUND WAR WON",
        story: "Extreme threat level. Massive infantry deployment detected on the ground level. Neutralize all forces.",
        xp: 15000
    },
    15: {
        title: "NIGHTMARE 15",
        subtitle: "EXTREME SWARM PURGED",
        story: "Extreme threat level. A massive drone swarm is closing in. Eliminate all hostiles.",
        xp: 16000
    },
    16: {
        title: "NIGHTMARE 16",
        subtitle: "SENTRY HELLSCAPE CLEARED",
        story: "Extreme threat level. Heavy sentry turrets are locked onto this zone. Destroy them.",
        xp: 17000
    },
    17: {
        title: "NIGHTMARE 17",
        subtitle: "COMBINED FORCES NEUTRALIZED",
        story: "Extreme threat level. Drones and soldiers have coordinated an assault. Wipe them out.",
        xp: 18000
    },
    18: {
        title: "NIGHTMARE 18",
        subtitle: "ELITE INFANTRY PURGED",
        story: "Extreme threat level. Elite forces are holding the line. Break through.",
        xp: 19000
    },
    19: {
        title: "NIGHTMARE 19",
        subtitle: "FORTRESS BREACHED",
        story: "Extreme threat level. Sentry turrets protect the central sector. Cleanse it.",
        xp: 20000
    },
    20: {
        title: "NIGHTMARE 20",
        subtitle: "AIR SUPERIORITY SECURED",
        story: "Extreme threat level. Massive swarm of hostile aerial entities. Take them down.",
        xp: 22000
    },
    21: {
        title: "NIGHTMARE 21",
        subtitle: "FORTIFIED FRONT CLEARED",
        story: "Extreme threat level. Heavily fortified position with soldiers and turrets. Break the defenses.",
        xp: 24000
    },
    22: {
        title: "NIGHTMARE 22",
        subtitle: "CORES OVERLOADED",
        story: "Extreme threat level. Multiple reactor cores are online and guarded. Overload them all.",
        xp: 26000
    },
    23: {
        title: "NIGHTMARE 23",
        subtitle: "DOOMSDAY SWARM CLEARED",
        story: "Extreme threat level. An endless swarm of scout drones is descending. Survive and destroy.",
        xp: 28000
    },
    24: {
        title: "NIGHTMARE 24",
        subtitle: "TOTAL ANNIHILATION COMPLETE",
        story: "Extreme threat level. Maximum hostile army deployment. Eliminate all targets.",
        xp: 30000
    },
    25: {
        title: "NIGHTMARE 25",
        subtitle: "NIGHTMARE CONQUERED",
        story: "The ultimate nightmare. Destroy 5 boss cores and purge the surrounding army.",
        xp: 50000
    }
};

// Campaign Objective System
let objectives = [];

// Game loops objects list
let drones = [];
let droneLaserBeams = [];
let tracers = [];
let particles = [];
let platforms = []; // Floating platform meshes for Mission 3
let staticObstacles = []; // Custom pillars/walls for collisions
let turrets = []; // Stationary Turrets for Mission 2
let beacons = []; // Beacons for Mission 3
let bosses = []; // Boss Core groups for Boss Fights
let opponents = []; // Armed Robots
let soldiers = []; // Human Soldiers

// Player stats
let health = 100;
let armor = 100;
let score = 0;
let isMoving = false;
let isCrouching = false;
let isWalking = false;

// Weapon parameters (CS 1.5 Rifle style)
let ammoClip = 30;
let ammoReserve = 90;
const MAX_CLIP = 30;
const MAX_RESERVE = 90;
let isReloading = false;
let reloadTimer = 0;
const RELOAD_DURATION = 1800; // 1.8 seconds reload (Mag in/out clicks)
let lastFireTime = 0;
const FIRE_RATE = 115; // ms cooldown
let isScoped = false;
let isShooting = false;

// CS 1.5 Physics Engine
let velocity = new THREE.Vector3();
let verticalVelocity = 0;
let isGrounded = true;

const GRAVITY = 0.0068;
const JUMP_FORCE = 0.40; // 4x original jump height (scales squarely)
const RUN_SPEED = 0.11;
const WALK_SPEED = 0.045;
const CROUCH_SPEED = 0.032;
const ACCELERATION = 0.18; // snappy GoldSrc acceleration
const FRICTION = 0.83; // snappy GoldSrc slide drag
const STANDING_HEIGHT = 1.8;
const CROUCH_HEIGHT = 0.95;
let currentHeight = STANDING_HEIGHT;

// Mobile touch controls variables
let isMobile = false;
let joystickVector = new THREE.Vector2();
let joystickTouchId = null;
let lookTouchId = null;
let lastLookTouchX = 0;
let lastLookTouchY = 0;

// CS 1.5 Accuracy & Recoil factors
let baseSpread = 0.002;
let movementSpread = 0;
let recoilSpread = 0;
let jumpSpread = 0;
const RECOIL_INCREASE = 0.008;

let selectedWeapon = 'MP5';
let primaryWeapon = 'MP5';
let secondaryWeapon = 'NeonSMG'; // Default secondary
let activeSlot = 1; // 1 = Primary, 2 = Secondary
let ammoClip1 = 30;
let ammoClip2 = 50;
let currentWeaponStats = null;
let maxClip = 30;
let ammoCrates = [];

let medkitCount = 2;
let medkits = [];
let isHealing = false;
let healTimer = 0;
const HEAL_DURATION = 3000;
let droppedWeapons = [];

const WEAPON_VISUALS = {
    'MP5': { color: 0xffaa00, speed: 0.45, thickness: 0.04 },
    'UMP': { color: 0xffbb00, speed: 0.45, thickness: 0.04 },
    'AK47': { color: 0xff3300, speed: 0.50, thickness: 0.05 },
    'AWM': { color: 0x00ffff, speed: 0.85, thickness: 0.07 },
    'CyberRifle': { color: 0x39ff14, speed: 0.52, thickness: 0.04 },
    'PlasmaShotgun': { color: 0xff0055, speed: 0.38, thickness: 0.05 },
    'PulseSniper': { color: 0xda70d6, speed: 0.95, thickness: 0.08 },
    'NeonSMG': { color: 0x00f0ff, speed: 0.55, thickness: 0.03 }
};

const WEAPON_STATS = {
    'MP5': { name: 'MP5', fireRate: 90, baseSpread: 0.015, recoilSpreadAdd: 0.008, damage: 35, clip: 30, pellets: 1 },
    'UMP': { name: 'UMP', fireRate: 110, baseSpread: 0.025, recoilSpreadAdd: 0.01, damage: 45, clip: 35, pellets: 1 },
    'AK47': { name: 'AK47', fireRate: 140, baseSpread: 0.02, recoilSpreadAdd: 0.015, damage: 55, clip: 30, pellets: 1 },
    'AWM': { name: 'AWM', fireRate: 1200, baseSpread: 0.005, recoilSpreadAdd: 0.04, damage: 200, clip: 5, pellets: 1 },
    'CyberRifle': { name: 'Cyber Rifle 1.5', fireRate: 100, baseSpread: 0.018, recoilSpreadAdd: 0.01, damage: 40, clip: 25, pellets: 1 },
    'PlasmaShotgun': { name: 'Plasma Shotgun', fireRate: 800, baseSpread: 0.08, recoilSpreadAdd: 0.02, damage: 25, clip: 8, pellets: 8 },
    'PulseSniper': { name: 'Pulse Sniper', fireRate: 1500, baseSpread: 0.0, recoilSpreadAdd: 0.05, damage: 250, clip: 4, pellets: 1 },
    'NeonSMG': { name: 'Neon SMG', fireRate: 60, baseSpread: 0.03, recoilSpreadAdd: 0.005, damage: 20, clip: 50, pellets: 1 }
};

let selectedAbility = 'Medic';
let isAbilityActive = false;
let abilityCooldownTimer = 0;
let abilityActiveTimer = 0;

const ABILITY_STATS = {
    'Medic': { name: 'Medic', cooldown: 45000, duration: 10000 },
    'Guardian': { name: 'Guardian', cooldown: 60000, duration: 6000 },
    'Phantom': { name: 'Phantom', cooldown: 50000, duration: 10000 },
    'Runner': { name: 'Runner', cooldown: 0, duration: 0, passive: true },
    'Striker': { name: 'Striker', cooldown: 40000, duration: 0 },
    'Survivor': { name: 'Survivor', cooldown: 0, duration: 0, passive: true },
    'Berserker': { name: 'Berserker', cooldown: 0, duration: 0, passive: true },
    'Vampire': { name: 'Vampire', cooldown: 0, duration: 0, passive: true }
};

function selectAbility(a) {
    selectedAbility = a;
    renderAbilities();
    const abilityNameEl = document.getElementById('ability-name');
    const abilityStatusEl = document.getElementById('ability-status');
    if (abilityNameEl) abilityNameEl.textContent = a.toUpperCase();
    if (abilityStatusEl) abilityStatusEl.textContent = ABILITY_STATS[a].passive ? "PASSIVE" : "READY (PRESS 5)";
}

let targetSlot = 1;
function setTargetSlot(slot) {
    targetSlot = slot;
    const btn1 = document.getElementById('btn-target-primary');
    const btn2 = document.getElementById('btn-target-secondary');
    if (slot === 1) {
        if (btn1) btn1.style.background = 'rgba(255, 0, 85, 0.2)';
        if (btn2) btn2.style.background = 'transparent';
    } else {
        if (btn1) btn1.style.background = 'transparent';
        if (btn2) btn2.style.background = 'rgba(0, 240, 255, 0.2)';
    }
    renderWeapons();
}

function selectWeapon(w) {
    if (targetSlot === 1) {
        primaryWeapon = w;
        selectedWeapon = primaryWeapon;
        activeSlot = 1;
    } else {
        secondaryWeapon = w;
    }
    renderWeapons();
}

const RECOIL_DECAY = 0.875;

// Weapon bobbing & kick animations
let bobTime = 0;
let gunKick = 0;
let gunRotationKick = 0;

// Key States
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
    ctrl: false,
    space: false
};

// HTML elements
const canvas = document.getElementById('game-canvas');
const hud = document.getElementById('hud');
const menuOverlay = document.getElementById('menu-overlay');
const gameOverOverlay = document.getElementById('game-over-overlay');
const missionCompleteOverlay = document.getElementById('mission-complete-overlay');
const btnPlay = document.getElementById('btn-play');
const btnRestart = document.getElementById('btn-restart');
const btnNextMission = document.getElementById('btn-next-mission');
const btnMenu = document.getElementById('btn-menu');
const btnMenuFailed = document.getElementById('btn-menu-failed');
const crosshair = document.getElementById('crosshair');
const scopeOverlay = document.getElementById('scope-overlay');

// Selected Info Pane
const selectedTitle = document.getElementById('selected-title');
const selectedStory = document.getElementById('selected-story');

// HUD indicators
const missionTitleVal = document.getElementById('mission-title-val');
const scoreVal = document.getElementById('score-val');
const healthNum = document.getElementById('health-num');
const healthFill = document.getElementById('health-fill');
const armorNum = document.getElementById('armor-num');
const armorFill = document.getElementById('armor-fill');
const ammoClipVal = document.getElementById('ammo-clip');
const ammoReserveVal = document.getElementById('ammo-reserve');
const reloadIndicator = document.getElementById('reload-indicator');
const reloadBarFill = document.getElementById('reload-bar-fill');
const moveStateFeed = document.getElementById('move-state');
const accuracyFeed = document.getElementById('accuracy-val');

// Weapon mesh components
let weaponGroup;
let weaponBarrel;

// Initialize Scene
function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04010a, 0.018);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    player = new THREE.Group();
    player.position.set(0, STANDING_HEIGHT, 0);
    player.add(camera);
    scene.add(player);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0x180a32, 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 0.9);
    dirLight.position.set(15, 25, 15);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff0055, 1.8, 100);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // Build general floor helper
    floorGrid = new THREE.GridHelper(120, 60, 0xff0055, 0x1d0b38);
    floorGrid.position.y = 0;
    scene.add(floorGrid);

    const floorGeo = new THREE.PlaneGeometry(120, 120);
    const floorMat = new THREE.MeshBasicMaterial({ color: 0x04010c, side: THREE.DoubleSide });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = Math.PI / 2;
    floorMesh.position.y = -0.01;
    scene.add(floorMesh);

    // Assemble Cyber Rifle
    createWeapon();

    // Setup input bindings
    setupInputListeners();

    // Dashboard card selections init
    renderWeapons();
    renderAbilities();
    selectWeapon('MP5');
    selectAbility('Medic');
    showMenuDashboard();
    selectMission(1);

    window.addEventListener('resize', onWindowResize);

    // Run animation frames loop
    animate();
}

// Assemble neon cyber rifle on camera
function createWeapon() {
    weaponGroup = new THREE.Group();

    // Receiver Body
    const bodyGeo = new THREE.BoxGeometry(0.04, 0.06, 0.28);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x101020, roughness: 0.2, metalness: 0.8 });
    const gunBody = new THREE.Mesh(bodyGeo, bodyMat);
    weaponGroup.add(gunBody);

    const stripGeo = new THREE.BoxGeometry(0.042, 0.01, 0.20);
    const stripMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const gunStrip = new THREE.Mesh(stripGeo, stripMat);
    gunStrip.position.set(0, 0.02, 0.02);
    weaponGroup.add(gunStrip);

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.26, 8);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x202030, roughness: 0.3, metalness: 0.9 });
    weaponBarrel = new THREE.Mesh(barrelGeo, barrelMat);
    weaponBarrel.rotation.x = Math.PI / 2;
    weaponBarrel.position.set(0, 0.01, -0.22);
    weaponGroup.add(weaponBarrel);

    // Hot neon laser tip muzzle
    const tipGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const gunTip = new THREE.Mesh(tipGeo, tipMat);
    gunTip.rotation.x = Math.PI / 2;
    gunTip.position.set(0, 0.01, -0.35);
    weaponGroup.add(gunTip);

    // Curved Ammo Mag
    const magGeo = new THREE.BoxGeometry(0.03, 0.12, 0.04);
    const magMat = new THREE.MeshStandardMaterial({ color: 0x0a0a14 });
    const gunMag = new THREE.Mesh(magGeo, magMat);
    gunMag.position.set(0, -0.07, -0.04);
    gunMag.rotation.x = -Math.PI / 10;
    weaponGroup.add(gunMag);

    // Laser Scope
    const scopeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8);
    const scopeMat = new THREE.MeshStandardMaterial({ color: 0x260d40 });
    const gunScope = new THREE.Mesh(scopeGeo, scopeMat);
    gunScope.rotation.x = Math.PI / 2;
    gunScope.position.set(0, 0.045, -0.02);
    weaponGroup.add(gunScope);

    const lensGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.004, 8);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const gunLens = new THREE.Mesh(lensGeo, lensMat);
    gunLens.rotation.x = Math.PI / 2;
    gunLens.position.set(0, 0.045, -0.07);
    weaponGroup.add(gunLens);

    // Position relative to camera view
    weaponGroup.position.set(0.25, -0.22, -0.45);
    camera.add(weaponGroup);
}

// Select mission card on dashboard
function selectMission(missionId) {
    if (!unlockedMissions.includes(missionId)) return;

    currentMissionId = missionId;
    gameState = 'MENU';
    document.getElementById('btn-play').textContent = "INITIALIZE SYSTEM";

    // Highlight selected card
    document.querySelectorAll('.mission-card').forEach(card => {
        card.classList.remove('selected');
        const m = parseInt(card.getAttribute('data-mission'));
        if (m === missionId) {
            card.classList.add('selected');
        }
    });

    // Populate info pane
    const data = MISSIONS[missionId];
    selectedTitle.textContent = `MISSION ${missionId}: ${data.title}`;
    selectedStory.textContent = data.story;
}

// Clear scene levels
function clearActiveLevel() {
    // Clear drones
    drones.forEach(d => scene.remove(d));
    droneLaserBeams.forEach(b => scene.remove(b.mesh));
    tracers.forEach(t => scene.remove(t.line));
    particles.forEach(p => scene.remove(p.mesh));
    
    // Clear custom columns/walls
    staticObstacles.forEach(w => scene.remove(w));
    
    // Clear platforms
    platforms.forEach(p => scene.remove(p));

    // Clear turrets
    turrets.forEach(t => scene.remove(t));

    // Clear beacons
    beacons.forEach(b => scene.remove(b));

    // Clear boss cores
    bosses.forEach(b => scene.remove(b));
    bosses = [];

    // Clear opponents
    opponents.forEach(o => scene.remove(o));
    opponents = [];

    // Clear soldiers
    soldiers.forEach(s => scene.remove(s));
    soldiers = [];

    // Clear ammo crates
    ammoCrates.forEach(c => scene.remove(c));
    ammoCrates = [];

    // Clear medkits
    medkits.forEach(m => scene.remove(m.mesh));
    medkits = [];

    // Clear dropped weapons
    droppedWeapons.forEach(w => scene.remove(w.mesh));
    droppedWeapons = [];

    drones = [];
    droneLaserBeams = [];
    tracers = [];
    particles = [];
    staticObstacles = [];
    platforms = [];
    turrets = [];
    beacons = [];
}

// Load level structures based on mission selection
function loadMissionLevel(missionId) {
    clearActiveLevel();

    gameState = 'PLAYING';
    health = 100;
    armor = 100;

    medkitCount = 2;
    isHealing = false;
    const healContainer = document.getElementById('heal-progress-container');
    if (healContainer) healContainer.classList.add('hidden');
    const promptContainer = document.getElementById('interaction-prompt');
    if (promptContainer) promptContainer.classList.add('hidden');

    selectedWeapon = primaryWeapon;
    activeSlot = 1;
    currentWeaponStats = WEAPON_STATS[selectedWeapon];
    maxClip = currentWeaponStats.clip;
    ammoClip1 = currentWeaponStats.clip;
    ammoClip2 = WEAPON_STATS[secondaryWeapon].clip;
    ammoClip = ammoClip1;
    ammoReserve = 180; // Larger shared reserve pool

    if (typeof updatePlayerWeaponVisuals === 'function') updatePlayerWeaponVisuals();

    isReloading = false;
    isScoped = false;
    isShooting = false;
    
    // Reset player transforms
    player.position.set(0, STANDING_HEIGHT, 0);
    velocity.set(0, 0, 0);
    verticalVelocity = 0;
    yaw = 0;
    pitch = 0;
    player.rotation.y = 0;
    camera.rotation.x = 0;
    camera.fov = 75;
    camera.updateProjectionMatrix();

    missionTitleVal.textContent = MISSIONS[missionId].title;
    
    // Setup HUD overlays
    hud.classList.remove('hidden');
    crosshair.classList.remove('hidden');
    scopeOverlay.classList.add('hidden');
    menuOverlay.classList.remove('active');
    missionCompleteOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    // Build specific layouts
    const customMission = MISSIONS[missionId];
    if (customMission && (missionId > 25 || customMission.isCustom)) {
        setupCustomMission(customMission);
    } else {
        switch(missionId) {
            case 1: setupMission1(); break;
            case 2: setupMission2(); break;
            case 3: setupMission3(); break;
            case 4: setupMission4(); break;
            case 5: setupMission5(); break;
            case 6: setupMission6(); break;
            case 7: setupMission7(); break;
            case 8: setupMission8(); break;
            case 9: setupMission9(); break;
            case 10: setupMission10(); break;
            case 11: setupMission11(); break;
            case 12: setupMission12(); break;
            case 13: setupMission13(); break;
            case 14: setupMission14(); break;
            case 15: setupMission15(); break;
            case 16: setupMission16(); break;
            case 17: setupMission17(); break;
            case 18: setupMission18(); break;
            case 19: setupMission19(); break;
            case 20: setupMission20(); break;
            case 21: setupMission21(); break;
            case 22: setupMission22(); break;
            case 23: setupMission23(); break;
            case 24: setupMission24(); break;
            case 25: setupMission25(); break;
        }
    }

    updateHUD();
    updateObjectivesHUD();
}

// Mission 1: Grid Entry (Recon Scouts)
function setupMission1() {
    objectives = [
        { type: 'drone', text: "Eliminate scout drones", count: 0, target: 8, completed: false },
    ];

    // Spawn simple columns around map
    const columnPositions = [
        [-15, -15], [-15, 15], [15, -15], [15, 15]
    ];
    columnPositions.forEach(([x, z]) => spawnPillar(x, z, 0x00f0ff));

    // Spawn 8 simple hovering drones
    const droneGeo = new THREE.OctahedronGeometry(0.7, 0);
    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 20 + Math.random() * 15;
        const dx = Math.cos(angle) * radius;
        const dz = Math.sin(angle) * radius;
        const dy = 1.5 + Math.random() * 5.0;

        spawnDrone(dx, dy, dz, 0.02, 0xff0055, 3000);
    }
    for (let i = 0; i < 4; i++) {
    }
}

// Mission 2: Silent Crypt (Vault Nodes Infiltration)
function setupMission2() {
    objectives = [
        { type: 'turret', text: "Infiltrate and destroy firewall nodes", count: 0, target: 4, completed: false },
    ];

    // Build a dark violet maze structure of security columns
    const wallSpots = [
        [-10, 0, 15, 4], [10, 0, 15, 4], // parallel corridors
        [0, -10, 4, 15], [0, 10, 4, 15],
        [-25, -25, 4, 25], [25, 25, 4, 25],
        [-25, 25, 25, 4], [25, -25, 25, 4]
    ];

    wallSpots.forEach(([x, z, w, d]) => {
        const geo = new THREE.BoxGeometry(w, 8, d);
        const mat = new THREE.MeshStandardMaterial({ color: 0x080415, roughness: 0.1 });
        const wall = new THREE.Mesh(geo, mat);
        wall.position.set(x, 4, z);
        scene.add(wall);
        
        // Outlines
        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x5a00b8 }));
        wall.add(line);

        // Track collision bounds
        wall.userData = { halfW: w/2 + 0.8, halfD: d/2 + 0.8 };
        staticObstacles.push(wall);
    });

    // Spawn 4 stationary firewall defense turrets at 4 corners
    const turretSpots = [
        [-22, -22], [-22, 22], [22, -22], [22, 22]
    ];

    turretSpots.forEach(([tx, tz]) => {
        spawnTurret(tx, tz);
    });
}

// Mission 3: The Ascent (Signal Dish Climb)
function setupMission3() {
    objectives = [
        { type: 'beacon', text: "Destroy signal beacons", count: 0, target: 3, completed: false },
    ];

    // Generate floating platforms forming a staircase
    // Each platform: BoxGeometry
    const platformSpecs = [
        // y, x, z, size
        { y: 2.2, x: 0, z: -10, w: 8, d: 8 },
        { y: 4.6, x: 9, z: -16, w: 7, d: 7 },
        { y: 7.0, x: 0, z: -25, w: 7, d: 7 },
        { y: 9.2, x: -9, z: -16, w: 7, d: 7 },
        { y: 11.5, x: 0, z: -5, w: 9, d: 9 } // Summit
    ];

    platformSpecs.forEach(spec => {
        const geo = new THREE.BoxGeometry(spec.w, 0.4, spec.d);
        const mat = new THREE.MeshStandardMaterial({ color: 0x09041a, roughness: 0.2 });
        const platform = new THREE.Mesh(geo, mat);
        platform.position.set(spec.x, spec.y, spec.z);
        scene.add(platform);

        // Glowing border outlines
        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x39ff14 }));
        platform.add(line);

        // Store custom bounds for falling landing colliders
        platform.userData = {
            halfW: spec.w/2,
            halfD: spec.d/2,
            halfH: 0.2
        };
        platforms.push(platform);
    });

    // Place 3 signal beacons (spinning neon cylinders) on platforms 2, 3, and 5
    const beaconSpots = [
        { x: 9, y: 4.6 + 0.6, z: -16 },
        { x: 0, y: 7.0 + 0.6, z: -25 },
        { x: 0, y: 11.5 + 0.6, z: -5 }
    ];

    beaconSpots.forEach((spot, idx) => {
        spawnBeacon(spot.x, spot.y, spot.z, idx + 1);
    });

    // Spawn aerial fast scout drones that hover at platform heights
    const droneSpots = [
        [-15, 3.5, -12], [15, 5.0, -20], [-10, 8.5, -28], [10, 12.0, -10]
    ];
    
    droneSpots.forEach(([x, y, z]) => {
        spawnDrone(x, y, z, 0.04, 0x00f0ff, 2000); // 0.04 speed (fast)
    });
}

// Mission 4: Singularity Core (Reactor Room Boss Fight)
function setupMission4() {
    objectives = [
        { type: 'boss', text: "Destroy Corrupted AI Core", count: 0, target: 1, completed: false },
    ];

    // Spawn massive reactor shield pillars around boss core
    const columns = [
        [-12, -12], [-12, 12], [12, -12], [12, 12]
    ];
    columns.forEach(([x, z]) => spawnPillar(x, z, 0xff0055));

    // Spawn central Boss Singularity Core
    let bossCore = new THREE.Group();
    bosses.push(bossCore);
    bossCore.position.set(0, 5, 0);

    // Inner Core geometry (glowing pulsing red)
    const coreGeo = new THREE.DodecahedronGeometry(2.3, 0);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    bossCore.add(coreMesh);

    // Shield outline
    const edges = new THREE.EdgesGeometry(coreGeo);
    const outline = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xff3333, linewidth: 2 }));
    bossCore.add(outline);

    // Outer rotating shield panels (semi-circle mesh rings blocking shots)
    const shieldGeo = new THREE.BoxGeometry(0.4, 6.0, 4.0);
    const shieldMat = new THREE.MeshStandardMaterial({
        color: 0x09031c,
        roughness: 0.1,
        metalness: 0.8
    });
    
    const shieldL = new THREE.Mesh(shieldGeo, shieldMat);
    shieldL.position.set(-3.5, 0, 0);
    const shieldLEdges = new THREE.EdgesGeometry(shieldGeo);
    const shieldLLines = new THREE.LineSegments(shieldLEdges, new THREE.LineBasicMaterial({ color: 0x00f0ff }));
    shieldL.add(shieldLLines);
    bossCore.add(shieldL);

    const shieldR = new THREE.Mesh(shieldGeo, shieldMat);
    shieldR.position.set(3.5, 0, 0);
    const shieldREdges = new THREE.EdgesGeometry(shieldGeo);
    const shieldRLines = new THREE.LineSegments(shieldREdges, new THREE.LineBasicMaterial({ color: 0x00f0ff }));
    shieldR.add(shieldRLines);
    bossCore.add(shieldR);

    scene.add(bossCore);

    // Set boss parameters
    bossCore.userData = {
        isBoss: true,
        health: 400,
        maxHealth: 400,
        lastAttack: Date.now(),
        attackInterval: 2200,
        shieldL: shieldL,
        shieldR: shieldR
    };
}

// Spawner Helpers
function spawnPillar(x, z, outlineColorHex) {
    const geo = new THREE.BoxGeometry(2.5, 12, 2.5);
    const mat = new THREE.MeshStandardMaterial({ color: 0x080414, roughness: 0.1 });
    const pillar = new THREE.Mesh(geo, mat);
    pillar.position.set(x, 6, z);
    scene.add(pillar);

    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: outlineColorHex }));
    pillar.add(line);

    pillar.userData = { halfW: 2.1, halfD: 2.1 }; // Collision offset bounds
    staticObstacles.push(pillar);
}

function spawnDrone(x, y, z, speed, beamColor, fireInterval) {
    if (x === undefined) x = (Math.random() - 0.5) * 60;
    if (y === undefined) y = 2 + Math.random() * 8;
    if (z === undefined) z = (Math.random() - 0.5) * 60;
    if (speed === undefined) speed = 0.04 + Math.random() * 0.04;
    if (beamColor === undefined) beamColor = 0xff0055;
    if (fireInterval === undefined) fireInterval = 1500 + Math.random() * 1500;

    const droneGeo = new THREE.OctahedronGeometry(0.8, 0);
    const droneMat = new THREE.MeshStandardMaterial({ color: 0x060312, roughness: 0.2 });
    const mesh = new THREE.Mesh(droneGeo, droneMat);

    const edges = new THREE.EdgesGeometry(droneGeo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: beamColor }));
    mesh.add(line);

    const droneGroup = new THREE.Group();
    droneGroup.position.set(x, y, z);
    droneGroup.add(mesh);

    droneGroup.userData = {
        isDrone: true,
        health: 100,
        speed: speed,
        mesh: mesh,
        lastFire: Date.now() + Math.random() * 2000,
        fireInterval: fireInterval,
        beamColor: beamColor
    };

    scene.add(droneGroup);
    drones.push(droneGroup);
}

// Mission 2 Stationary scanning turrets
function spawnTurret(x, z) {
    if (x === undefined) x = (Math.random() - 0.5) * 40;
    if (z === undefined) z = (Math.random() - 0.5) * 40;

    const turretGroup = new THREE.Group();
    turretGroup.position.set(x, 0, z);

    // Body base
    const baseGeo = new THREE.CylinderGeometry(0.8, 1.2, 0.6, 6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x100c25, metalness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.3;
    turretGroup.add(base);

    // Rotating Core
    const coreGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 1.0;
    turretGroup.add(core);

    // Neon scanner projection lines
    const lineGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const barrel = new THREE.Mesh(lineGeo, lineMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 1.0, -0.3);
    turretGroup.add(barrel);

    scene.add(turretGroup);

    turretGroup.userData = {
        isTurret: true,
        health: 100,
        coreMesh: core,
        lastFire: 0,
        scanRadius: 18.0
    };
    
    // Add to hit list
    turrets.push(turretGroup);
}

// Mission 3 Target beacons
function spawnBeacon(x, y, z, id) {
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(x, y, z);

    const geo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 0.4 });
    const outer = new THREE.Mesh(geo, mat);
    beaconGroup.add(outer);

    const edges = new THREE.EdgesGeometry(geo);
    const outline = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x39ff14 }));
    beaconGroup.add(outline);

    const innerGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 4);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const core = new THREE.Mesh(innerGeo, innerMat);
    beaconGroup.add(core);

    scene.add(beaconGroup);

    beaconGroup.userData = {
        isBeacon: true,
        health: 50,
        id: id,
        outerMesh: outer
    };
    beacons.push(beaconGroup);
}

// Setup input listeners (keyboard, mouse look triggers)
function setupInputListeners() {
    const modal = document.getElementById('control-mode-modal');
    const btnModePc = document.getElementById('btn-mode-pc');
    const btnModeTouch = document.getElementById('btn-mode-touch');

    btnModePc.addEventListener('click', () => {
        isMobile = false;
        document.body.classList.remove('touch-device');
        document.getElementById('mobile-controls').classList.add('hidden');
        modal.classList.add('hidden');
        modal.classList.remove('active');
    });

    btnModeTouch.addEventListener('click', () => {
        isMobile = true;
        document.body.classList.add('touch-device');
        document.getElementById('mobile-controls').classList.remove('hidden');
        modal.classList.add('hidden');
        modal.classList.remove('active');
        setupMobileTouchHandlers();
    });

    function enterMobileGameMode() {
        isPlaying = true;
        menuOverlay.classList.remove('active');
        hud.classList.remove('hidden');
        crosshair.classList.remove('hidden');
        window.sounds.resume();
    }

    btnPlay.addEventListener('click', () => {
        window.sounds.init();
        if (gameState !== 'PLAYING') {
            loadMissionLevel(currentMissionId);
        }
        if (isMobile) {
            enterMobileGameMode();
        } else {
            canvas.requestPointerLock();
        }
    });

    btnRestart.addEventListener('click', () => {
        window.sounds.init();
        loadMissionLevel(currentMissionId);
        if (isMobile) {
            enterMobileGameMode();
        } else {
            canvas.requestPointerLock();
        }
    });

    btnNextMission.addEventListener('click', () => {
        window.sounds.init();
        const maxMissionId = Math.max(...Object.keys(MISSIONS).map(Number));
        currentMissionId = Math.min(maxMissionId, currentMissionId + 1);
        loadMissionLevel(currentMissionId);
        if (isMobile) {
            enterMobileGameMode();
        } else {
            canvas.requestPointerLock();
        }
    });

    btnMenu.addEventListener('click', () => {
        showMenuDashboard();
    });

    btnMenuFailed.addEventListener('click', () => {
        showMenuDashboard();
    });

    // Secret Key Cheat Sequence Listener
    let secretCode = "aaryavtheoriginal";
    let typedKeys = "";
    window.addEventListener('keydown', (e) => {
        if (e.key && e.key.length === 1) {
            typedKeys += e.key.toLowerCase();
            if (typedKeys.length > secretCode.length) {
                typedKeys = typedKeys.substring(typedKeys.length - secretCode.length);
            }
            if (typedKeys === secretCode) {
                showSecretVerificationModal();
                typedKeys = "";
            }
        }
    });

    // Credits double-click shortcut
    const creditsText = document.getElementById('credits-text');
    if (creditsText) {
        creditsText.style.cursor = 'pointer';
        creditsText.addEventListener('dblclick', () => {
            showSecretVerificationModal();
        });
    }

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            isPlaying = true;
            menuOverlay.classList.remove('active');
            hud.classList.remove('hidden');
            crosshair.classList.remove('hidden');
            window.sounds.resume();
        } else {
            if (!isMobile) {
                isPlaying = false;
                // Go back to menu overlay if game is not over
                if (gameState === 'PLAYING') {
                    showMenuDashboard();
                }
            }
        }
    });

    // Firing shooting clicks
    window.addEventListener('mousedown', (e) => {
        if (gameState !== 'PLAYING' || !isPlaying) return;

        if (e.button === 0) {
            isShooting = true;
        } else if (e.button === 2) {
            toggleScope();
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            isShooting = false;
        }
    });

    window.addEventListener('contextmenu', e => e.preventDefault());

    // Mouse movement looking pitch & yaw
    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement !== canvas) return;

        let sensitivity = 0.0019;
        if (isScoped) {
            sensitivity = 0.0007; // Zoom CS sensitivity
        }

        yaw -= e.movementX * sensitivity;
        pitch -= e.movementY * sensitivity;

        pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, pitch));

        player.rotation.y = yaw;
        camera.rotation.x = pitch;
    });

    // Keyboard states
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w') keys.w = true;
        if (key === 'a') keys.a = true;
        if (key === 's') keys.s = true;
        if (key === 'd') keys.d = true;
        if (e.key === ' ' || e.key === 'Spacebar') keys.space = true;
        if (e.key === 'Shift') keys.shift = true;
        if (e.key === 'Control') keys.ctrl = true;
        
        if (key === 'r') {
            reloadWeapon();
        }
        
        if (key === '1' && activeSlot !== 1 && gameState === 'PLAYING') {
            ammoClip2 = ammoClip; // Save secondary clip
            activeSlot = 1;
            selectedWeapon = primaryWeapon;
            currentWeaponStats = WEAPON_STATS[selectedWeapon];
            maxClip = currentWeaponStats.clip;
            ammoClip = ammoClip1;
            isReloading = false;
            if (typeof updatePlayerWeaponVisuals === 'function') updatePlayerWeaponVisuals();
            updateHUD();
        }
        if (key === '2' && activeSlot !== 2 && gameState === 'PLAYING') {
            ammoClip1 = ammoClip; // Save primary clip
            activeSlot = 2;
            selectedWeapon = secondaryWeapon;
            currentWeaponStats = WEAPON_STATS[selectedWeapon];
            maxClip = currentWeaponStats.clip;
            ammoClip = ammoClip2;
            isReloading = false;
            if (typeof updatePlayerWeaponVisuals === 'function') updatePlayerWeaponVisuals();
            updateHUD();
        }
        
        if (key === '5' && gameState === 'PLAYING') {
            activateAbility();
        }
        
        if (key === '3' && gameState === 'PLAYING') {
            meleeAttack();
        }
        if (key === '4' && gameState === 'PLAYING') {
            throwGrenade();
        }
        if ((key === '6' || key === 'h') && gameState === 'PLAYING') {
            if (typeof startHealing === 'function') startHealing();
        }
        if (key === 'f' && gameState === 'PLAYING') {
            if (window.activeInteractionWeapon && typeof swapWeapon === 'function') {
                swapWeapon(window.activeInteractionWeapon);
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w') keys.w = false;
        if (key === 'a') keys.a = false;
        if (key === 's') keys.s = false;
        if (key === 'd') keys.d = false;
        if (e.key === ' ' || e.key === 'Spacebar') keys.space = false;
        if (e.key === 'Shift') keys.shift = false;
        if (e.key === 'Control') keys.ctrl = false;
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function showMenuDashboard() {
    // If we are currently in the middle of a mission, keep the state as PLAYING (pause menu)
    // Otherwise it defaults to MENU
    const btnPlay = document.getElementById('btn-play');
    if (gameState === 'PLAYING') {
        btnPlay.textContent = "RESUME MISSION";
    } else {
        btnPlay.textContent = "INITIALIZE SYSTEM";
    }
    
    isPlaying = false;
    
    // Re-render the dynamic missions grid list
    renderMissions();

    menuOverlay.classList.add('active');
    hud.classList.add('hidden');
    crosshair.classList.add('hidden');
    scopeOverlay.classList.add('hidden');
    missionCompleteOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
}

// Toggle sniper Scope overlay
function toggleScope() {
    isScoped = !isScoped;
    if (isScoped) {
        camera.fov = 30;
        scopeOverlay.classList.remove('hidden');
        crosshair.classList.add('hidden');
        weaponGroup.position.set(0, -0.3, -0.2);
    } else {
        camera.fov = 75;
        scopeOverlay.classList.add('hidden');
        crosshair.classList.remove('hidden');
        weaponGroup.position.set(0.25, -0.22, -0.45);
    }
    camera.updateProjectionMatrix();
}

// Recursive parent search helpers to resolve nested mesh hit groups
function findDroneParent(object) {
    let current = object;
    while (current) {
        if (current.userData && current.userData.isDrone) {
            return current;
        }
        current = current.parent;
    }
    return null;
}

function findTurretParent(object) {
    let current = object;
    while (current) {
        if (current.userData && current.userData.isTurret) {
            return current;
        }
        current = current.parent;
    }
    return null;
}

function findBeaconParent(object) {
    let current = object;
    while (current) {
        if (current.userData && current.userData.isBeacon) {
            return current;
        }
        current = current.parent;
    }
    return null;
}

function findBossParent(object) {
    let current = object;
    while (current) {
        if (current.userData && current.userData.isBoss) {
            return current;
        }
        current = current.parent;
    }
    return null;
}

// Weapon firing with recoil and bullet spread calculation
function fireWeapon() {
    const now = Date.now();
    if (!currentWeaponStats) currentWeaponStats = WEAPON_STATS[selectedWeapon];
    if (now - lastFireTime < currentWeaponStats.fireRate) return;
    if (isReloading) return;

    if (ammoClip <= 0) {
        reloadWeapon();
        return;
    }

    lastFireTime = now;
    ammoClip--;
    updateHUD();

    // CRITICAL: Force update matrix world so camera look orientation and drone positions are completely up-to-date
    scene.updateMatrixWorld(true);

    window.sounds.playShoot(isScoped);

    gunKick = 0.08;
    gunRotationKick = 0.06;

    pitch += (Math.random() * 0.007) + 0.005;
    yaw += (Math.random() - 0.5) * 0.006;

    // Recoil expansion
    recoilSpread = Math.min(0.04, recoilSpread + currentWeaponStats.recoilSpreadAdd);

    let currentBaseSpread = currentWeaponStats.baseSpread;
    if (isScoped && selectedWeapon === 'AWM') currentBaseSpread = 0.0;
    else if (isScoped) currentBaseSpread *= 0.5;

    const overallSpread = currentBaseSpread + movementSpread + recoilSpread + jumpSpread;

    // Targetable groups
    const targetables = [];
    drones.forEach(d => d.traverse(child => { if (child.isMesh) targetables.push(child); }));
    turrets.forEach(t => t.traverse(child => { if (child.isMesh) targetables.push(child); }));
    beacons.forEach(b => b.traverse(child => { if (child.isMesh) targetables.push(child); }));
    bosses.forEach(b => b.traverse(child => { if (child.isMesh) targetables.push(child); }));
    soldiers.forEach(s => s.traverse(child => { if (child.isMesh) targetables.push(child); }));
    staticObstacles.forEach(o => targetables.push(o));

    const pelletsCount = currentWeaponStats.pellets || 1;
    
    for (let p = 0; p < pelletsCount; p++) {
        const bulletRaycaster = new THREE.Raycaster();
        const spreadAngle = Math.random() * Math.PI * 2;
        const spreadRadius = Math.random() * overallSpread;
        const offsetX = Math.cos(spreadAngle) * spreadRadius;
        const offsetY = Math.sin(spreadAngle) * spreadRadius;

        bulletRaycaster.setFromCamera(new THREE.Vector2(offsetX, offsetY), camera);

        const intersects = bulletRaycaster.intersectObjects(targetables);
        let hitPoint = new THREE.Vector3();
        let hitObject = null;

        if (intersects.length > 0) {
            hitPoint.copy(intersects[0].point);
            hitObject = intersects[0].object;
        } else {
            bulletRaycaster.ray.direction.normalize();
            hitPoint.copy(camera.getWorldPosition(new THREE.Vector3()).add(bulletRaycaster.ray.direction.multiplyScalar(80)));
        }

        // Drawing trace line
        drawTracer(hitPoint);

        if (hitObject) {
            let isStructuralHit = false;

            // Traverse up hierarchy to find target parent nodes
            const droneParent = findDroneParent(hitObject);
            const turretParent = findTurretParent(hitObject);
            const beaconParent = findBeaconParent(hitObject);
            const bossParent = findBossParent(hitObject);
            const soldierParent = findSoldierParent(hitObject);

            if (droneParent) {
                damageDrone(droneParent, hitPoint);
                isStructuralHit = true;
            } else if (turretParent) {
                damageTurret(turretParent, hitPoint);
                isStructuralHit = true;
            } else if (beaconParent) {
                damageBeacon(beaconParent, hitPoint);
                isStructuralHit = true;
            } else if (bossParent) {
                damageBoss(hitObject, bossParent, hitPoint);
                isStructuralHit = true;
            } else if (soldierParent) {
                damageSoldier(soldierParent, hitPoint);
                isStructuralHit = true;
            }

            // If simple wall scenery spark impact (non-structural hit)
            if (!isStructuralHit) {
                spawnSparks(hitPoint, new THREE.Color(0x00f0ff), 6);
            }
        }
    }
}

function drawTracer(targetPoint) {
    const startPoint = new THREE.Vector3();
    if (weaponBarrel) {
        weaponBarrel.getWorldPosition(startPoint);
    } else {
        startPoint.copy(player.position).add(new THREE.Vector3(0.2, -0.2, -0.4).applyQuaternion(player.quaternion));
    }

    const material = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.95
    });

    const geometry = new THREE.BufferGeometry().setFromPoints([startPoint, targetPoint]);
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    tracers.push({
        line: line,
        age: 0,
        maxAge: 6
    });
}

function spawnSparks(position, color, count = 8) {
    for (let i = 0; i < count; i++) {
        const geo = new THREE.SphereGeometry(0.04, 4, 4);
        const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 1 });
        const particle = new THREE.Mesh(geo, mat);
        particle.position.copy(position);

        const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 0.12,
            (Math.random() - 0.5) * 0.12 + 0.04,
            (Math.random() - 0.5) * 0.12
        );

        scene.add(particle);
        particles.push({
            mesh: particle,
            velocity: vel,
            decay: 0.93,
            age: 0,
            maxAge: 25 + Math.random() * 15
        });
    }
}

function reloadWeapon() {
    if (isReloading || ammoClip === maxClip || ammoReserve <= 0) return;

    isReloading = true;
    reloadTimer = 0;
    reloadIndicator.classList.remove('hidden');
    window.sounds.playReload();

    if (isScoped) toggleScope();
}

// Damage entities
function damageDrone(drone, hitPoint, damageAmount) {
    window.sounds.playHitmarker();
    spawnSparks(hitPoint, new THREE.Color(0xff0055), 10);
    
    const damage = damageAmount !== undefined ? damageAmount : currentWeaponStats.damage;
    drone.userData.health -= damage;
    if (drone.userData.health <= 0) {
        score += 150;
        window.sounds.playExplosion();
        spawnSparks(drone.position, new THREE.Color(0xff0055), 24);

        if (Math.random() < 0.3) {
            if (typeof spawnMedkit === 'function') spawnMedkit(drone.position.x, 0.5, drone.position.z);
        } else {
            if (typeof spawnAmmo === 'function') spawnAmmo(drone.position.x, 0.5, drone.position.z);
        }
        scene.remove(drone);
        const idx = drones.indexOf(drone);
        if (idx > -1) drones.splice(idx, 1);

        incrementObjectiveType('drone');
        updateHUD();
    }
}

function damageTurret(turret, hitPoint, damageAmount) {
    window.sounds.playHitmarker();
    spawnSparks(hitPoint, new THREE.Color(0xff0055), 12);
    
    const damage = damageAmount !== undefined ? damageAmount : currentWeaponStats.damage;
    turret.userData.health -= damage; // 4 shot kill
    if (turret.userData.health <= 0) {
        score += 300;
        window.sounds.playExplosion();
        spawnSparks(turret.position, new THREE.Color(0xff0055), 24);

        scene.remove(turret);
        const idx = turrets.indexOf(turret);
        if (idx > -1) turrets.splice(idx, 1);

        incrementObjectiveType('turret');
        updateHUD();
    }
}

function damageBeacon(beacon, hitPoint, damageAmount) {
    window.sounds.playHitmarker();
    spawnSparks(hitPoint, new THREE.Color(0x39ff14), 10);
    
    const damage = damageAmount !== undefined ? damageAmount : currentWeaponStats.damage;
    beacon.userData.health -= damage;
    if (beacon.userData.health <= 0) {
        score += 200;
        window.sounds.playExplosion();
        spawnSparks(beacon.position, new THREE.Color(0x39ff14), 24);

        scene.remove(beacon);
        const idx = beacons.indexOf(beacon);
        if (idx > -1) beacons.splice(idx, 1);

        incrementObjectiveType('beacon');
        updateHUD();
    }
}

function damageBoss(hitMesh, bossGroup, hitPoint, damageAmount) {
    // If shield rotates in front of bullet path
    const shieldL = bossGroup.userData.shieldL;
    const shieldR = bossGroup.userData.shieldR;

    if (hitMesh === shieldL || hitMesh === shieldR) {
        // Bullet deflected! Shield protects core
        window.sounds.playShieldHit();
        spawnSparks(hitPoint, new THREE.Color(0x00f0ff), 12);
        return;
    }

    // Direct core hit!
    window.sounds.playHitmarker();
    spawnSparks(hitPoint, new THREE.Color(0xff1111), 15);
    
    const damage = damageAmount !== undefined ? damageAmount : currentWeaponStats.damage;
    bossGroup.userData.health -= damage;
    
    // Core health damage feedback (color pulsing)
    hitMesh.material.color.setHex(0xffffff);
    setTimeout(() => {
        if (bossGroup && hitMesh) hitMesh.material.color.setHex(0xff1111);
    }, 40);

    if (bossGroup.userData.health <= 0) {
        score += 1500;
        window.sounds.playBossExplosion();
        spawnSparks(bossGroup.position, new THREE.Color(0xff1111), 50);

        scene.remove(bossGroup);
        const idx = bosses.indexOf(bossGroup);
        if (idx > -1) bosses.splice(idx, 1);

        incrementObjectiveType('boss');
        updateHUD();
    }
}

// Complete Mission triggers success overlay
function completeMission() {
    gameState = 'MISSION_COMPLETE';
    document.exitPointerLock();

    window.sounds.playMissionSuccess();

    const data = MISSIONS[currentMissionId];
    
    // Update dashboard states
    const maxMissionId = Math.max(...Object.keys(MISSIONS).map(Number));
    if (currentMissionId < maxMissionId && !unlockedMissions.includes(currentMissionId + 1)) {
        unlockedMissions.push(currentMissionId + 1);
    }

    document.getElementById('complete-mission-name').textContent = data.title;
    document.getElementById('complete-subtitle').textContent = data.subtitle;
    document.getElementById('complete-xp').textContent = `+${data.xp.toLocaleString()} XP RECOVERY`;
    document.getElementById('complete-score').textContent = String(score).padStart(5, '0');

    hud.classList.add('hidden');
    crosshair.classList.add('hidden');
    scopeOverlay.classList.add('hidden');

    missionCompleteOverlay.classList.remove('hidden');
    missionCompleteOverlay.classList.add('active');

    // Hide Next Mission button if final mission completed
    if (currentMissionId === maxMissionId) {
        btnNextMission.classList.add('hidden');
    } else {
        btnNextMission.classList.remove('hidden');
    }
}

// Damage player
function damagePlayer(amount) {
    if (gameState !== 'PLAYING') return;

    window.sounds.playPlayerHit();

    if (armor > 0) {
        const reduction = amount * 0.6;
        const hpLoss = amount * 0.4;
        armor = Math.max(0, armor - reduction);
        health = Math.max(0, health - hpLoss);
    } else {
        health = Math.max(0, health - amount);
    }

    updateHUD();
    flashDamageScreen();

    if (health <= 0) {
        triggerGameOver();
    }
}

function flashDamageScreen() {
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'rgba(255, 0, 0, 0.25)';
    flash.style.zIndex = '40';
    flash.style.pointerEvents = 'none';
    
    document.getElementById('game-container').appendChild(flash);
    
    let op = 1;
    const anim = setInterval(() => {
        op -= 0.1;
        flash.style.opacity = op;
        if (op <= 0) {
            clearInterval(anim);
            flash.remove();
        }
    }, 20);
}

function triggerGameOver() {
    gameState = 'GAMEOVER';
    document.exitPointerLock();

    document.getElementById('summary-mission-name').textContent = MISSIONS[currentMissionId].title;
    document.getElementById('summary-score').textContent = String(score).padStart(5, '0');

    hud.classList.add('hidden');
    crosshair.classList.add('hidden');
    scopeOverlay.classList.add('hidden');

    gameOverOverlay.classList.remove('hidden');
    gameOverOverlay.classList.add('active');
}

// Stats HUD updates
function updateHUD() {
    scoreVal.textContent = String(score).padStart(5, '0');
    healthNum.textContent = Math.round(health);
    healthFill.style.width = `${health}%`;
    
    if (health < 30) {
        healthFill.className = "hud-bar-fill fill-green glow-red";
        healthFill.style.backgroundColor = "var(--red)";
    } else {
        healthFill.className = "hud-bar-fill fill-green";
        healthFill.style.backgroundColor = "";
    }

    armorNum.textContent = Math.round(armor);
    armorFill.style.width = `${armor}%`;

    ammoClipVal.textContent = ammoClip;
    ammoReserveVal.textContent = ammoReserve;

    const weaponNameEl = document.querySelector('.weapon-name');
    if (weaponNameEl && WEAPON_STATS[selectedWeapon]) {
        weaponNameEl.textContent = WEAPON_STATS[selectedWeapon].name.toUpperCase();
    }
}

function updateObjectivesHUD() {
    let html = "";
    objectives.forEach(obj => {
        const classText = obj.completed ? "class='objective-item complete'" : "class='objective-item'";
        const countText = obj.target > 1 ? ` (${obj.count}/${obj.target})` : "";
        html += `<li ${classText}><div class="objective-bullet"></div>${obj.text}${countText}</li>`;
    });
    document.getElementById('objectives-list').innerHTML = html;
}

function incrementObjectiveType(type) {
    const obj = objectives.find(o => o.type === type);
    if (obj && !obj.completed) {
        obj.count++;
        if (obj.count >= obj.target) obj.completed = true;
        
        let allDone = true;
        objectives.forEach(o => { if (!o.completed) allDone = false; });
        updateObjectivesHUD();
        if (allDone) completeMission();
    }
}

// Main Frame Tick Loop
let lastFrameTime = performance.now();
let footstepCooldown = 0;

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const dt = Math.min(50, now - lastFrameTime);
    lastFrameTime = now;

    if (gameState === 'PLAYING' && isPlaying) {
        if (isShooting) fireWeapon();
        updatePhysics(dt);
        updateLevelEntities(now);
        updateSoldierAI(now);
        if (typeof updateAmmoPickups === 'function') updateAmmoPickups();
        if (typeof updateMedkitPickups === 'function') updateMedkitPickups();
        if (typeof updateHealingProgress === 'function') updateHealingProgress(dt);
        if (typeof updateDroppedWeaponPickups === 'function') updateDroppedWeaponPickups();
        if (typeof updateAbilityState === 'function') updateAbilityState(dt);
        if (typeof updateGrenades === 'function') updateGrenades(dt);
        updateTracersAndParticles();
        updateCrosshairRecoil();
        updateReloadAnimation(dt);
        updateAudioTicks(dt);
    }

    renderer.render(scene, camera);
}

function updateAudioTicks(dt) {
    if (!isGrounded || velocity.lengthSq() < 0.0001) return;

    footstepCooldown -= dt;
    if (footstepCooldown <= 0) {
        window.sounds.playFootstep();
        
        if (keys.ctrl) {
            footstepCooldown = 650;
        } else if (keys.shift) {
            footstepCooldown = 500;
        } else {
            footstepCooldown = 320;
        }
    }
}

function updateReloadAnimation(dt) {
    if (!isReloading) return;

    reloadTimer += dt;
    const progress = Math.min(100, (reloadTimer / RELOAD_DURATION) * 100);
    reloadBarFill.style.width = `${progress}%`;

    const tiltOffset = Math.sin((progress / 100) * Math.PI) * 0.25;
    weaponGroup.position.y = -0.22 - tiltOffset;
    weaponGroup.rotation.x = -tiltOffset * 2.0;

    if (reloadTimer >= RELOAD_DURATION) {
        isReloading = false;
        reloadIndicator.classList.add('hidden');
        weaponGroup.position.y = -0.22;
        weaponGroup.rotation.x = 0;

        const needed = maxClip - ammoClip;
        const transfer = Math.min(needed, ammoReserve);
        ammoClip += transfer;
        ammoReserve -= transfer;
        updateHUD();
    }
}

function updateTracersAndParticles() {
    // Tracers
    for (let i = tracers.length - 1; i >= 0; i--) {
        const t = tracers[i];
        t.age++;
        t.line.material.opacity = 1 - (t.age / t.maxAge);
        if (t.age >= t.maxAge) {
            scene.remove(t.line);
            t.line.geometry.dispose();
            t.line.material.dispose();
            tracers.splice(i, 1);
        }
    }

    // Sparks
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age++;
        p.velocity.y -= 0.002; // gravity pull
        p.mesh.position.add(p.velocity);
        p.velocity.multiplyScalar(p.decay);
        
        const scale = 1 - (p.age / p.maxAge);
        p.mesh.scale.set(scale, scale, scale);

        if (p.age >= p.maxAge) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
            particles.splice(i, 1);
        }
    }

    // Laser beams
    for (let i = droneLaserBeams.length - 1; i >= 0; i--) {
        const beam = droneLaserBeams[i];
        beam.mesh.position.add(beam.velocity);

        const dist = beam.mesh.position.distanceTo(player.position);
        if (dist < 1.4) {
            damagePlayer(beam.damage || 12);
            scene.remove(beam.mesh);
            beam.mesh.geometry.dispose();
            beam.mesh.material.dispose();
            droneLaserBeams.splice(i, 1);
            continue;
        }

        const age = Date.now() - beam.spawnTime;
        if (age > 2800) {
            scene.remove(beam.mesh);
            beam.mesh.geometry.dispose();
            beam.mesh.material.dispose();
            droneLaserBeams.splice(i, 1);
        }
    }
}

function updateCrosshairRecoil() {
    recoilSpread *= RECOIL_DECAY;
    if (recoilSpread < 0.0001) recoilSpread = 0;

    const speed = new THREE.Vector2(velocity.x, velocity.z).length();
    movementSpread = speed * 0.16;

    if (!isGrounded) {
        jumpSpread = 0.04;
    } else {
        jumpSpread = 0;
    }

    let modeText = "RUNNING";
    let accText = "ACCURACY: 45%";
    
    if (!isGrounded) {
        modeText = "AIRBORNE";
        accText = "ACCURACY: 5%";
    } else if (speed < 0.01) {
        if (keys.ctrl) {
            modeText = "CROUCHED";
            accText = "ACCURACY: 100%";
        } else {
            modeText = "STANDING";
            accText = "ACCURACY: 95%";
        }
    } else {
        if (keys.ctrl) {
            modeText = "CROUCH-MOVING";
            accText = "ACCURACY: 80%";
        } else if (keys.shift) {
            modeText = "WALKING";
            accText = "ACCURACY: 90%";
        }
    }

    moveStateFeed.textContent = modeText;
    accuracyFeed.textContent = accText;

    if (accText.includes("100%") || accText.includes("95%") || accText.includes("90%")) {
        accuracyFeed.className = "accuracy-pct glow-green";
    } else {
        accuracyFeed.className = "accuracy-pct glow-magenta";
    }

    const totalSpread = baseSpread + movementSpread + recoilSpread + jumpSpread;
    const pxOffset = Math.round(totalSpread * 450) + 4;
    document.documentElement.style.setProperty('--spread-offset', `${pxOffset}px`);
}

// Collision prevention against columns/pillars
function checkSceneryCollisions(nextPos) {
    for (let i = 0; i < staticObstacles.length; i++) {
        const col = staticObstacles[i];
        const cx = col.position.x;
        const cz = col.position.z;
        const hw = col.userData.halfW;
        const hd = col.userData.halfD;

        if (nextPos.x >= cx - hw && nextPos.x <= cx + hw &&
            nextPos.z >= cz - hd && nextPos.z <= cz + hd) {
            return true; // Collision detected!
        }
    }
    return false;
}

// Movement & CS physics loops
function updatePhysics(dt) {
    const moveDirection = new THREE.Vector3();
    if (keys.w) moveDirection.z -= 1;
    if (keys.s) moveDirection.z += 1;
    if (keys.a) moveDirection.x -= 1;
    if (keys.d) moveDirection.x += 1;

    if (isMobile && joystickVector.lengthSq() > 0) {
        moveDirection.x += joystickVector.x;
        moveDirection.z += joystickVector.y;
    }

    moveDirection.normalize();

    let maxSpeed = RUN_SPEED;
    isCrouching = keys.ctrl;
    isWalking = keys.shift;

    if (isCrouching) {
        maxSpeed = CROUCH_SPEED;
    } else if (isWalking) {
        maxSpeed = WALK_SPEED;
    }

    // Crouching smooth camera transition
    const targetHeight = isCrouching ? CROUCH_HEIGHT : STANDING_HEIGHT;
    currentHeight = THREE.MathUtils.lerp(currentHeight, targetHeight, 0.18);

    // Bounding height landing checks (Floating Platforms in Mission 3, 8, etc.)
    let groundFloorY = 0;
    if (platforms && platforms.length > 0) {
        platforms.forEach(plat => {
            const px = player.position.x;
            const pz = player.position.z;
            const hw = plat.userData.halfW;
            const hd = plat.userData.halfD;
            
            // Check bounding horizontal overlaps
            if (px >= plat.position.x - hw && px <= plat.position.x + hw &&
                pz >= plat.position.z - hd && pz <= plat.position.z + hd) {
                // If landing onto platform top
                const topY = plat.position.y + plat.userData.halfH;
                if (player.position.y >= topY - 0.25) {
                    groundFloorY = Math.max(groundFloorY, topY);
                }
            }
        });
    }

    const inputDirectionWorld = moveDirection.clone().applyQuaternion(player.quaternion);

    if (moveDirection.lengthSq() > 0) {
        // Counter-strafing snappiness (dot check)
        const dot = velocity.dot(inputDirectionWorld);
        if (dot < -0.005) {
            velocity.set(0, 0, 0);
        }

        velocity.lerp(inputDirectionWorld.multiplyScalar(maxSpeed), ACCELERATION);
        isMoving = true;
    } else {
        velocity.multiplyScalar(FRICTION);
        if (velocity.lengthSq() < 0.00001) {
            velocity.set(0, 0, 0);
            isMoving = false;
        }
    }

    // Collision prediction
    const testPos = player.position.clone();
    testPos.x += velocity.x;
    if (checkSceneryCollisions(testPos)) {
        velocity.x = 0;
    }

    testPos.copy(player.position);
    testPos.z += velocity.z;
    if (checkSceneryCollisions(testPos)) {
        velocity.z = 0;
    }

    // Apply movement speeds
    player.position.x += velocity.x;
    player.position.z += velocity.z;

    // Boundary arena checks
    player.position.x = Math.max(-58.5, Math.min(58.5, player.position.x));
    player.position.z = Math.max(-58.5, Math.min(58.5, player.position.z));

    // Jump Physics
    if (keys.space && isGrounded && !isCrouching) {
        isGrounded = false;
        verticalVelocity = JUMP_FORCE;
        window.sounds.playJump();
    }

    if (!isGrounded) {
        verticalVelocity -= GRAVITY;
        player.position.y += verticalVelocity;

        if (player.position.y <= groundFloorY + currentHeight) {
            player.position.y = groundFloorY + currentHeight;
            verticalVelocity = 0;
            isGrounded = true;
        }
    } else {
        // Smoothly fall if walks off a floating ledge platform
        if (player.position.y > groundFloorY + currentHeight + 0.05) {
            isGrounded = false;
            verticalVelocity = 0;
        } else {
            player.position.y = groundFloorY + currentHeight;
        }
    }

    // Gun bobbing displacement updates
    if (isMoving && isGrounded) {
        const scale = keys.shift ? 0.07 : (keys.ctrl ? 0.04 : 0.14);
        bobTime += scale;
        
        const bobX = Math.sin(bobTime) * 0.016;
        const bobY = Math.cos(bobTime * 2) * 0.010;

        if (isScoped) {
            weaponGroup.position.x = bobX * 0.1;
            weaponGroup.position.y = -0.3 + bobY * 0.1;
        } else {
            weaponGroup.position.x = 0.25 + bobX;
            weaponGroup.position.y = -0.22 + bobY;
        }
    } else {
        if (isScoped) {
            weaponGroup.position.x = THREE.MathUtils.lerp(weaponGroup.position.x, 0.0, 0.15);
            weaponGroup.position.y = THREE.MathUtils.lerp(weaponGroup.position.y, -0.3, 0.15);
        } else {
            weaponGroup.position.x = THREE.MathUtils.lerp(weaponGroup.position.x, 0.25, 0.15);
            weaponGroup.position.y = THREE.MathUtils.lerp(weaponGroup.position.y, -0.22, 0.15);
        }
    }

    // Recoil gun kick
    if (gunKick > 0.001) {
        gunKick = THREE.MathUtils.lerp(gunKick, 0, 0.12);
        gunRotationKick = THREE.MathUtils.lerp(gunRotationKick, 0, 0.12);
    } else {
        gunKick = 0;
        gunRotationKick = 0;
    }

    if (!isReloading) {
        if (isScoped) {
            weaponGroup.position.z = -0.2 - gunKick;
            weaponGroup.rotation.x = gunRotationKick * 0.3;
        } else {
            weaponGroup.position.z = -0.45 - gunKick;
            weaponGroup.rotation.x = gunRotationKick;
        }
    }
}

// Level entity updates (Enemy AI drone tracking, turret scanning, boss attacks)
function updateLevelEntities(now) {
    const pPos = player.position.clone();

    // 1. Update general scout drones tracking
    for (let i = drones.length - 1; i >= 0; i--) {
        const drone = drones[i];
        const dPos = drone.position;
        const toPlayer = pPos.clone().sub(dPos);
        toPlayer.y = (pPos.y + 0.6) - dPos.y; // altitude drift target

        const dist = toPlayer.length();

        // Contact damage explosion
        if (dist < 1.4) {
            damagePlayer(30);
            window.sounds.playExplosion();
            spawnSparks(dPos, new THREE.Color(0xff0055), 20);

            scene.remove(drone);
            drones.splice(i, 1);

            if (currentMissionId === 1) {
                objectives[0].count++;
                if (objectives[0].count >= objectives[0].target) {
                    objectives[0].completed = true;
                    completeMission();
                }
                updateObjectivesHUD();
            }
            updateHUD();
            continue;
        }

        toPlayer.normalize();
        dPos.add(toPlayer.multiplyScalar(drone.userData.speed));

        drone.position.y += Math.sin(now * 0.003 + drone.id) * 0.006;
        drone.userData.mesh.rotation.y += 0.015;

        // Firing lasers
        if (now - drone.userData.lastFire > drone.userData.fireInterval) {
            drone.userData.lastFire = now;
            fireEnemyLaser(drone.position, drone.userData.beamColor);
        }
    }

    // 2. Update Stationary turrets (Stealth tracking check!)
    const speed = new THREE.Vector2(velocity.x, velocity.z).length();
    
    turrets.forEach(tur => {
        const dist = tur.position.distanceTo(pPos);
        
        // Aim turret head to point at player
        const core = tur.userData.coreMesh;
        const lookDir = pPos.clone().sub(tur.position).normalize();
        core.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), lookDir);

        if (dist < tur.userData.scanRadius) {
            // Turret will open fire IF the player is moving fast (not walking or crouching!)
            const isSilent = isCrouching || (isWalking && speed < WALK_SPEED + 0.01) || speed < 0.015;
            
            if (!isSilent) {
                // Running detected! Alert flash & fire
                core.material.color.setHex(0xffffff); // Flash white alert
                
                if (now - tur.userData.lastFire > 1200) {
                    tur.userData.lastFire = now;
                    fireEnemyLaser(tur.position.clone().add(new THREE.Vector3(0, 1.0, 0)), 0xff0055);
                }
            } else {
                if (core && core.material) core.material.color.setHex(0xff0055); // Reset normal glowing pink scanner
            }
        } else {
            if (core && core.material) core.material.color.setHex(0xff0055);
        }
    });

    // 3. Update Mission 3 Beacons (spinning cylinders visual effect)
    if (currentMissionId === 3) {
        beacons.forEach(b => {
            b.userData.outerMesh.rotation.y += 0.02;
            b.userData.outerMesh.position.y = Math.sin(now * 0.004 + b.id) * 0.1;
        });
    }

    // 4. Update Boss AI (All missions with bosses)
    bosses.forEach(boss => {
        boss.userData.shieldL.rotation.y += 0.012;
        boss.userData.shieldR.rotation.y += 0.012;
        boss.rotation.y += 0.005;

        if (now - boss.userData.lastAttack > boss.userData.attackInterval) {
            boss.userData.lastAttack = now;
            fireBossRingLasers(boss);
        }
    });
}

// Spawn hostile lasers heading towards player
function fireEnemyLaser(startPoint, beamColorHex) {
    if (!currentWeaponStats) currentWeaponStats = WEAPON_STATS[selectedWeapon];
    
    // Get visuals for current gun
    const gunVisuals = WEAPON_VISUALS[selectedWeapon] || { color: 0xff0055, speed: 0.45, thickness: 0.04 };
    const pellets = currentWeaponStats.pellets || 1;
    const damage = Math.max(4, Math.round(currentWeaponStats.damage * 0.2)); // Balanced bot damage: 20% of player weapon damage (min 4)
    
    const targetPoint = player.position.clone().add(new THREE.Vector3(0, -0.2, 0));
    
    for (let p = 0; p < pellets; p++) {
        let dir = targetPoint.clone().sub(startPoint).normalize();
        
        // Add spread if shotgun/multiple pellets
        if (pellets > 1) {
            const spread = 0.06;
            dir.x += (Math.random() - 0.5) * spread;
            dir.y += (Math.random() - 0.5) * spread;
            dir.z += (Math.random() - 0.5) * spread;
            dir.normalize();
        }
        
        const thick = gunVisuals.thickness;
        const beamGeo = new THREE.CylinderGeometry(thick, thick, pellets > 1 ? 0.4 : 1.0, 4);
        const beamMat = new THREE.MeshBasicMaterial({ color: gunVisuals.color });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        
        beamMesh.position.copy(startPoint);
        beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        scene.add(beamMesh);
        
        droneLaserBeams.push({
            mesh: beamMesh,
            velocity: dir.clone().multiplyScalar(gunVisuals.speed),
            damage: damage,
            spawnTime: Date.now()
        });
    }
}

// Boss circle laser wave blast
function fireBossRingLasers(boss) {
    const origin = boss.position.clone();
    
    // Shoot 8 lasers at 45 degree angle intervals
    for (let i = 0; i < 8; i++) {
        const rad = (i * Math.PI / 4);
        const dir = new THREE.Vector3(Math.cos(rad), 0, Math.sin(rad)).normalize();

        const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 4);
        const beamMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);

        beamMesh.position.copy(origin);
        beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

        scene.add(beamMesh);

        droneLaserBeams.push({
            mesh: beamMesh,
            velocity: dir.multiplyScalar(0.18), // Slightly slower blast wave but thick
            spawnTime: Date.now()
        });
    }
}

// Mission 5: Outpost Infiltration
function setupMission5() {
    objectives = [
        { type: 'turret', text: "Destroy Outpost Turrets", count: 0, target: 6, completed: false },
        { type: 'soldier', text: "Neutralize Armed Guards", count: 0, target: 6, completed: false }
    ];

    // Spawn outpost columns/walls (forms a defensive ring)
    const wallPositions = [
        [-15, -15], [-15, 15], [15, -15], [15, 15],
        [0, -20], [0, 20]
    ];
    wallPositions.forEach(([x, z]) => spawnPillar(x, z, 0x00f0ff));

    // Spawn 6 turrets guarding the outpost
    const turretPositions = [
        [-15, -10], [-15, 10], [15, -10], [15, 10],
        [0, -15], [0, 15]
    ];
    turretPositions.forEach(([tx, tz]) => {
        spawnTurret(tx, tz);
    });

    // Spawn 6 soldiers patrolling the perimeter
    for (let i = 0; i < 6; i++) {
        const x = (Math.random() - 0.5) * 50;
        const z = (Math.random() - 0.5) * 50;
        spawnSoldier(x, z);
    }
}

// Mission 6: Turret Alley
function setupMission6() {
    objectives = [
        { type: 'turret', text: "Destroy alley turrets", count: 0, target: 8, completed: false },
        { type: 'soldier', text: "Eliminate enemy soldiers", count: 0, target: 4, completed: false }
    ];

    for(let z = -30; z <= 30; z+= 15) {
        const geo = new THREE.BoxGeometry(40, 8, 4);
        const mat = new THREE.MeshStandardMaterial({ color: 0x080415, roughness: 0.1 });
        const wallL = new THREE.Mesh(geo, mat);
        wallL.position.set(-25, 4, z);
        scene.add(wallL);
        staticObstacles.push(wallL);
        wallL.userData = { halfW: 20 + 0.8, halfD: 2 + 0.8 };

        const wallR = new THREE.Mesh(geo, mat);
        wallR.position.set(25, 4, z);
        scene.add(wallR);
        staticObstacles.push(wallR);
        wallR.userData = { halfW: 20 + 0.8, halfD: 2 + 0.8 };
        
        spawnTurret(-4, z);
        spawnTurret(4, z);
    }
    for(let i=0; i<4; i++) spawnSoldier(0, (Math.random()-0.5)*50);
}

// Mission 7: Shadow Realm
function setupMission7() {
    objectives = [
        { type: 'beacon', text: "Destroy hidden beacons", count: 0, target: 5, completed: false },
    ];
    scene.fog.density = 0.05; // Dense fog
    
    for (let i=0; i<5; i++) {
        spawnBeacon((Math.random()-0.5)*40, 0.6, (Math.random()-0.5)*40, i+1);
        spawnDrone((Math.random()-0.5)*40, 3, (Math.random()-0.5)*40, 0.04, 0x39ff14, 2000);
        spawnDrone((Math.random()-0.5)*40, 3, (Math.random()-0.5)*40, 0.04, 0x39ff14, 2000);
    }
}

// Mission 8: Sky Fall
function setupMission8() {
    objectives = [
        { type: 'beacon', text: "Destroy elevated beacons", count: 0, target: 6, completed: false },
        { type: 'soldier', text: "Eliminate enemy soldiers", count: 0, target: 4, completed: false }
    ];
    
    for(let i=0; i<6; i++) {
        const y = 5 + i * 8;
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        
        const geo = new THREE.BoxGeometry(6, 0.4, 6);
        const mat = new THREE.MeshStandardMaterial({ color: 0x09041a });
        const platform = new THREE.Mesh(geo, mat);
        platform.position.set(x, y, z);
        platform.userData = { halfW: 3, halfD: 3, halfH: 0.2 };
        platforms.push(platform);
        scene.add(platform);
        
        spawnBeacon(x, y + 0.6, z, i+1);
        spawnDrone(x, y + 3, z, 0.06, 0x00f0ff, 1500);
        spawnDrone(x+5, y + 5, z, 0.06, 0x00f0ff, 1500);
    }
    for(let i=0; i<4; i++) spawnSoldier((Math.random()-0.5)*40, (Math.random()-0.5)*40);
}

// Mission 9: The Twins
function setupMission9() {
    objectives = [
        { type: 'boss', text: "Destroy Twin Cores", count: 0, target: 2, completed: false },
    ];
    
    function spawnBoss(x, z) {
        let core = new THREE.Group();
        core.position.set(x, 5, z);
        const cGeo = new THREE.DodecahedronGeometry(1.8, 0);
        const cMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });
        const mesh = new THREE.Mesh(cGeo, cMat);
        core.add(mesh);
        
        const sGeo = new THREE.BoxGeometry(0.4, 5.0, 3.0);
        const sMat = new THREE.MeshStandardMaterial({ color: 0x09031c });
        const sL = new THREE.Mesh(sGeo, sMat);
        sL.position.set(-2.5, 0, 0);
        core.add(sL);
        const sR = new THREE.Mesh(sGeo, sMat);
        sR.position.set(2.5, 0, 0);
        core.add(sR);
        
        scene.add(core);
        core.userData = { isBoss: true, health: 600, maxHealth: 600, lastAttack: Date.now(), attackInterval: 1800, shieldL: sL, shieldR: sR };
        bosses.push(core);
    }
    spawnBoss(-15, -15);
    spawnBoss(15, 15);
}

// Mission 10: Aaryav's Wrath
function setupMission10() {
    objectives = [
        { type: 'drone', text: "Survive Drone Swarm", count: 0, target: 20, completed: false },
        { type: 'turret', text: "Destroy Defense Turrets", count: 0, target: 4, completed: false },
        { type: 'boss', text: "Purge the Core", count: 0, target: 1, completed: false },
        { type: 'soldier', text: "Eliminate enemy soldiers", count: 0, target: 10, completed: false }
    ];
    
    spawnTurret(-25, -25);
    spawnTurret(-25, 25);
    spawnTurret(25, -25);
    spawnTurret(25, 25);
    
    setupMission4(); // Spawn the core
    
    for (let i = 0; i < 20; i++) {
        spawnDrone((Math.random() - 0.5) * 60, 2 + Math.random()*10, (Math.random() - 0.5) * 60, 0.05, 0xff0055, 2000);
    }
    for (let i = 0; i < 10; i++) {
    }
    for (let i = 0; i < 10; i++) {
        spawnSoldier((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50);
    }
}

// Human Soldier AI System
function spawnSoldier(x, z) {
    if (x === undefined) x = (Math.random() - 0.5) * 50;
    if (z === undefined) z = (Math.random() - 0.5) * 50;

    const soldierGroup = new THREE.Group();
    soldierGroup.position.set(x, 0, z); // Soldiers stand on the ground y=0

    // Body (Torso)
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x2b3d2b }); // Military Green
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.6;
    soldierGroup.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffccaa }); // Skin tone
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.4;
    soldierGroup.add(head);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.2, 1.0, 0.2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x2b3d2b });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.5, 1.5, 0);
    soldierGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.5, 1.5, 0.2);
    rightArm.rotation.x = -Math.PI / 4; // Arm holding gun
    soldierGroup.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.3, 1.0, 0.3);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a }); // Black pants
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.25, 0.5, 0);
    soldierGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.25, 0.5, 0);
    soldierGroup.add(rightLeg);

    // Gun
    const wKeys = Object.keys(WEAPON_STATS);
    const chosenWeapon = wKeys[Math.floor(Math.random() * wKeys.length)];
    const gunGeo = new THREE.BoxGeometry(0.1, 0.2, 1.0);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const gun = new THREE.Mesh(gunGeo, gunMat);
    gun.position.set(0.5, 1.3, -0.4);
    soldierGroup.add(gun);

    // Glowing neon stripe matching the gun type!
    const visuals = WEAPON_VISUALS[chosenWeapon] || { color: 0xffff00 };
    const gunStripGeo = new THREE.BoxGeometry(0.12, 0.05, 0.8);
    const gunStripMat = new THREE.MeshBasicMaterial({ color: visuals.color });
    const gunStrip = new THREE.Mesh(gunStripGeo, gunStripMat);
    gunStrip.position.set(0.5, 1.4, -0.4);
    soldierGroup.add(gunStrip);

    scene.add(soldierGroup);

    soldierGroup.userData = {
        isSoldier: true,
        health: 150,
        state: 'PATROL',
        targetWaypoint: new THREE.Vector3(x + (Math.random()-0.5)*10, 0, z + (Math.random()-0.5)*10),
        lastAttack: Date.now() + Math.random() * 1000,
        attackInterval: 1200 + Math.random() * 400, // Balanced soldier firing interval (1.2 - 1.6s) so they don't laser spam
        speed: 0.1,
        weaponKey: chosenWeapon,
        color: visuals.color
    };
    soldiers.push(soldierGroup);
}

function updateSoldierAI(now) {
    if (gameState !== 'PLAYING') return;

    soldiers.forEach(soldier => {
        const distToPlayer = soldier.position.distanceTo(player.position);
        const playerPosFloor = player.position.clone();
        playerPosFloor.y = soldier.position.y;

        // State Machine transitions
        if (distToPlayer > 25) {
            soldier.userData.state = 'PATROL';
        } else if (distToPlayer > 12) {
            soldier.userData.state = 'CHASE';
        } else {
            soldier.userData.state = 'SHOOT';
        }

        // State Execution
        if (soldier.userData.state === 'PATROL') {
            soldier.lookAt(soldier.userData.targetWaypoint);
            const distToWp = soldier.position.distanceTo(soldier.userData.targetWaypoint);
            if (distToWp < 1) {
                soldier.userData.targetWaypoint.set(
                    soldier.position.x + (Math.random()-0.5)*20,
                    0,
                    soldier.position.z + (Math.random()-0.5)*20
                );
            } else {
                const dir = new THREE.Vector3().subVectors(soldier.userData.targetWaypoint, soldier.position).normalize();
                soldier.position.add(dir.multiplyScalar(soldier.userData.speed * 0.5)); // Walk slow
            }
        } else if (soldier.userData.state === 'CHASE') {
            soldier.lookAt(playerPosFloor);
            const dir = new THREE.Vector3().subVectors(playerPosFloor, soldier.position).normalize();
            soldier.position.add(dir.multiplyScalar(soldier.userData.speed)); // Run
        } else if (soldier.userData.state === 'SHOOT') {
            soldier.lookAt(playerPosFloor);
            // Stop and shoot
            if (now - soldier.userData.lastAttack > soldier.userData.attackInterval) {
                soldier.userData.lastAttack = now;
                const gunTip = soldier.position.clone();
                gunTip.x += 0.5;
                gunTip.y += 1.3;
                gunTip.z -= 0.6; // Approximate gun barrel end
                fireEnemyLaser(gunTip, soldier.userData.color);
            }
        }
    });
}

function damageSoldier(soldierGroup, hitPoint, damageAmount) {
    window.sounds.playHitmarker();
    spawnSparks(hitPoint, new THREE.Color(0xff0000), 10); // Red blood/sparks

    const damage = damageAmount !== undefined ? damageAmount : currentWeaponStats.damage;
    soldierGroup.userData.health -= damage;
    if (soldierGroup.userData.health <= 0) {
        score += 300;
        window.sounds.playExplosion();
        spawnSparks(soldierGroup.position.clone().add(new THREE.Vector3(0,1,0)), new THREE.Color(0xff0000), 30);

        if (Math.random() < 0.3) {
            if (typeof spawnMedkit === 'function') spawnMedkit(soldierGroup.position.x, 0.5, soldierGroup.position.z);
        } else {
            if (typeof spawnAmmo === 'function') spawnAmmo(soldierGroup.position.x, 0.5, soldierGroup.position.z);
        }

        const wKey = soldierGroup.userData.weaponKey || 'MP5';
        if (typeof spawnDroppedWeapon === 'function') {
            spawnDroppedWeapon(soldierGroup.position.x, 0.2, soldierGroup.position.z, wKey, WEAPON_STATS[wKey].clip);
        }

        scene.remove(soldierGroup);
        const idx = soldiers.indexOf(soldierGroup);
        if (idx > -1) soldiers.splice(idx, 1);

        incrementObjectiveType('soldier');
        updateHUD();
    }
}

function findSoldierParent(mesh) {
    let parent = mesh;
    while (parent) {
        if (parent.userData && parent.userData.isSoldier) return parent;
        parent = parent.parent;
    }
    return null;
}

// Launch engine
window.addEventListener('load', () => {
    init();
});

// Ammo Pickup System
function spawnAmmo(x, y, z) {
    const ammoGeo = new THREE.BoxGeometry(0.6, 0.4, 0.3);
    const ammoMat = new THREE.MeshStandardMaterial({ 
        color: 0x00ff00, 
        emissive: 0x00ff00, 
        emissiveIntensity: 0.5 
    });
    const ammoMesh = new THREE.Mesh(ammoGeo, ammoMat);
    ammoMesh.position.set(x, y, z);
    scene.add(ammoMesh);
    ammoCrates.push({ mesh: ammoMesh, yBase: y, floatOffset: Math.random() * Math.PI * 2 });
}

function updateAmmoPickups() {
    if (gameState !== 'PLAYING') return;
    const now = performance.now();
    for (let i = ammoCrates.length - 1; i >= 0; i--) {
        const crate = ammoCrates[i];
        
        // Hover animation
        crate.mesh.position.y = crate.yBase + Math.sin(now * 0.003 + crate.floatOffset) * 0.2;
        crate.mesh.rotation.y += 0.02;

        // Distance check
        const dist = player.position.distanceTo(crate.mesh.position);
        if (dist < 2.0) {
            ammoReserve += 30; // 1 magazine
            updateHUD();
            
            // Cleanup
            scene.remove(crate.mesh);
            ammoCrates.splice(i, 1);
            
            // Pickup effect
            spawnSparks(crate.mesh.position, new THREE.Color(0x00ff00), 15);
            window.sounds.playHitmarker(); // Use hitmarker sound as a generic pickup ping
        }
    }
}

// --- Character Abilities System ---

let chronoShield = null;

function activateAbility() {
    if (!ABILITY_STATS || !selectedAbility || !ABILITY_STATS[selectedAbility]) return;
    const stats = ABILITY_STATS[selectedAbility];
    if (stats.passive) return; // Passive abilities don't activate
    if (abilityCooldownTimer > 0) return; // Still on cooldown

    // Activate!
    isAbilityActive = true;
    abilityActiveTimer = stats.duration;
    abilityCooldownTimer = stats.cooldown;
    
    // Initial activation effects
    if (selectedAbility === 'Medic') {
        window.sounds.playHitmarker(); // Temp sound
    } else if (selectedAbility === 'Guardian') {
        window.sounds.playExplosion();
        // Spawn Chrono Bubble
        const geo = new THREE.SphereGeometry(3.5, 16, 16);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x00aaff, transparent: true, opacity: 0.3, side: THREE.DoubleSide
        });
        chronoShield = new THREE.Mesh(geo, mat);
        chronoShield.position.copy(player.position);
        scene.add(chronoShield);
    } else if (selectedAbility === 'Phantom') {
        // Drop camera height slightly to simulate transforming
        player.position.y -= 0.5;
    } else if (selectedAbility === 'Striker') {
        // Instant forward wave
        window.sounds.playExplosion();
        const waveOrigin = player.position.clone();
        soldiers.forEach(s => {
            if (s.position.distanceTo(waveOrigin) < 20) {
                if (typeof damageSoldier === 'function') damageSoldier(s, s.position);
            }
        });
        drones.forEach(d => {
            if (d.position.distanceTo(waveOrigin) < 20) {
                if (typeof damageDrone === 'function') damageDrone(d, d.position);
            }
        });
        isAbilityActive = false; // Instant cast
    }
}

function updateAbilityState(dt) {
    if (gameState !== 'PLAYING') return;
    if (!ABILITY_STATS || !selectedAbility || !ABILITY_STATS[selectedAbility]) return;

    if (abilityCooldownTimer > 0) {
        abilityCooldownTimer = Math.max(0, abilityCooldownTimer - dt);
    }

    if (isAbilityActive) {
        abilityActiveTimer -= dt;
        
        // Continuous effects
        if (selectedAbility === 'Medic') {
            health = Math.min(100, health + (5 * (dt/1000))); // Heal 5 HP/s
            updateHUD();
        } else if (selectedAbility === 'Guardian') {
            if (chronoShield) {
                chronoShield.position.copy(player.position); // Bubble follows player
            }
        }
        
        if (abilityActiveTimer <= 0) {
            // Deactivate
            isAbilityActive = false;
            if (selectedAbility === 'Guardian' && chronoShield) {
                scene.remove(chronoShield);
                chronoShield = null;
            } else if (selectedAbility === 'Phantom') {
                player.position.y += 0.5; // Restore height
            }
        }
    }
    
    // Passive effects
    if (selectedAbility === 'Survivor') {
        health = Math.min(100, health + (1 * (dt/1000))); // Slow 1 HP/s heal
        updateHUD();
    }
    
    updateAbilityHUD();
}

function updateAbilityHUD() {
    const nameEl = document.getElementById('ability-name');
    const statusEl = document.getElementById('ability-status');
    if (!nameEl || !statusEl) return;
    
    nameEl.textContent = ABILITY_STATS[selectedAbility].name.toUpperCase();
    
    if (ABILITY_STATS[selectedAbility].passive) {
        statusEl.textContent = "PASSIVE";
        statusEl.className = "glow-cyan";
    } else if (abilityCooldownTimer > 0) {
        statusEl.textContent = "COOLDOWN: " + Math.ceil(abilityCooldownTimer/1000) + "s";
        statusEl.className = "glow-red";
    } else if (isAbilityActive) {
        statusEl.textContent = "ACTIVE";
        statusEl.className = "glow-magenta";
    } else {
        statusEl.textContent = "READY (PRESS 5)";
        statusEl.className = "glow-green";
    }
}


// --- Melee & Grenade Systems ---

let grenades = [];
let lastMeleeTime = 0;

function meleeAttack() {
    const now = performance.now();
    if (now - lastMeleeTime < 800) return; // 800ms cooldown
    lastMeleeTime = now;

    window.sounds.playHitmarker();
    
    // Create a quick visual slash effect (horizontal spark line)
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    const slashCenter = player.position.clone().add(forward.clone().multiplyScalar(2)).add(new THREE.Vector3(0, 1.5, 0));
    spawnSparks(slashCenter, new THREE.Color(0xffffff), 20);

    // Damage enemies in front
    const meleeRange = 4.0;
    
    soldiers.forEach(s => {
        if (s.position.distanceTo(player.position) < meleeRange) {
            if (typeof damageSoldier === 'function') damageSoldier(s, s.position);
        }
    });
    drones.forEach(d => {
        if (d.position.distanceTo(player.position) < meleeRange) {
            if (typeof damageDrone === 'function') damageDrone(d, d.position);
        }
    });
}

function throwGrenade() {
    // Only allow 1 active grenade at a time to prevent spam
    if (grenades.length > 2) return;

    const geo = new THREE.SphereGeometry(0.2, 8, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x113311, roughness: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    
    mesh.position.copy(player.position).add(new THREE.Vector3(0, 1.5, 0)).add(forward.clone().multiplyScalar(1));
    scene.add(mesh);

    const velocity = forward.clone().multiplyScalar(15).add(new THREE.Vector3(0, 5, 0));
    
    grenades.push({
        mesh: mesh,
        velocity: velocity,
        timer: 2.5 // explode in 2.5 seconds
    });
}

function updateGrenades(dt) {
    if (gameState !== 'PLAYING') return;
    const delta = dt / 1000;

    for (let i = grenades.length - 1; i >= 0; i--) {
        const g = grenades[i];
        
        // Apply gravity
        g.velocity.y -= 20 * delta;
        
        // Move
        g.mesh.position.add(g.velocity.clone().multiplyScalar(delta));
        
        // Floor bounce
        if (g.mesh.position.y < 0.2) {
            g.mesh.position.y = 0.2;
            g.velocity.y *= -0.5; // bounce
            g.velocity.x *= 0.8; // friction
            g.velocity.z *= 0.8;
        }

        g.timer -= delta;
        if (g.timer <= 0) {
            // Explode
            explodeGrenade(g.mesh.position.clone());
            scene.remove(g.mesh);
            grenades.splice(i, 1);
        }
    }
}

function explodeGrenade(pos) {
    window.sounds.playExplosion();
    spawnSparks(pos, new THREE.Color(0xff8800), 50); // Big orange explosion
    
    // Blast radius
    const blastRadius = 25.0;
    const blastDamage = 250;
    
    soldiers.forEach(s => {
        if (s.position.distanceTo(pos) < blastRadius) {
            if (typeof damageSoldier === 'function') damageSoldier(s, s.position, blastDamage);
        }
    });
    drones.forEach(d => {
        if (d.position.distanceTo(pos) < blastRadius) {
            if (typeof damageDrone === 'function') damageDrone(d, d.position, blastDamage);
        }
    });
    turrets.forEach(t => {
        if (t.position.distanceTo(pos) < blastRadius) {
            if (typeof damageTurret === 'function') damageTurret(t, t.position, blastDamage);
        }
    });
    beacons.forEach(b => {
        if (b.position.distanceTo(pos) < blastRadius) {
            if (typeof damageBeacon === 'function') damageBeacon(b, b.position, blastDamage);
        }
    });
    bosses.forEach(boss => {
        if (boss.position.distanceTo(pos) < blastRadius) {
            // Find a non-shield child or just pass the first child
            const hitMesh = boss.children[0] || boss;
            if (typeof damageBoss === 'function') damageBoss(hitMesh, boss, boss.position, blastDamage);
        }
    });
}


// --- Missing Nightmare Campaign Helpers ---
function spawnAmmoCrate() {
    spawnAmmo((Math.random() - 0.5) * 60, 0.5, (Math.random() - 0.5) * 60);
}

function spawnCore(position) {
    let core = new THREE.Group();
    core.position.copy(position);
    const cGeo = new THREE.DodecahedronGeometry(2.0, 0);
    const cMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });
    const mesh = new THREE.Mesh(cGeo, cMat);
    core.add(mesh);
    
    const edges = new THREE.EdgesGeometry(cGeo);
    const outline = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xff3333, linewidth: 2 }));
    core.add(outline);

    const sGeo = new THREE.BoxGeometry(0.4, 5.0, 3.5);
    const sMat = new THREE.MeshStandardMaterial({ color: 0x09031c, roughness: 0.1 });
    const sL = new THREE.Mesh(sGeo, sMat);
    sL.position.set(-3.0, 0, 0);
    const shieldLEdges = new THREE.EdgesGeometry(sGeo);
    const shieldLLines = new THREE.LineSegments(shieldLEdges, new THREE.LineBasicMaterial({ color: 0x00f0ff }));
    sL.add(shieldLLines);
    core.add(sL);
    
    const sR = new THREE.Mesh(sGeo, sMat);
    sR.position.set(3.0, 0, 0);
    const shieldREdges = new THREE.EdgesGeometry(sGeo);
    const shieldRLines = new THREE.LineSegments(shieldREdges, new THREE.LineBasicMaterial({ color: 0x00f0ff }));
    sR.add(shieldRLines);
    core.add(sR);
    
    scene.add(core);
    core.userData = { isBoss: true, health: 600, maxHealth: 600, lastAttack: Date.now(), attackInterval: 2000, shieldL: sL, shieldR: sR };
    bosses.push(core);
}

function updateMissionHUD() {
    updateHUD();
    updateObjectivesHUD();
}

function setupMission11() { objectives = [{ type: 'drone', text: 'Survive Drone Swarm', count: 0, target: 20, completed: false }]; for(let i=0; i<20; i++) spawnDrone(); for(let i=0; i<3; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission12() { objectives = [{ type: 'soldier', text: 'Eliminate Squads', count: 0, target: 15, completed: false }]; for(let i=0; i<15; i++) spawnSoldier(); for(let i=0; i<4; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission13() { objectives = [{ type: 'turret', text: 'Destroy Turret Grid', count: 0, target: 8, completed: false }]; for(let i=0; i<8; i++) spawnTurret(); for(let i=0; i<3; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission14() { objectives = [{ type: 'soldier', text: 'Ground War', count: 0, target: 20, completed: false }]; for(let i=0; i<20; i++) spawnSoldier(); for(let i=0; i<5; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission15() { objectives = [{ type: 'drone', text: 'Extreme Swarm', count: 0, target: 30, completed: false }]; for(let i=0; i<30; i++) spawnDrone(); for(let i=0; i<5; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission16() { objectives = [{ type: 'turret', text: 'Sentry Hell', count: 0, target: 12, completed: false }]; for(let i=0; i<12; i++) spawnTurret(); for(let i=0; i<4; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission17() { objectives = [{ type: 'drone', text: 'Kill Drones', count: 0, target: 15, completed: false }, { type: 'soldier', text: 'Kill Soldiers', count: 0, target: 15, completed: false }]; for(let i=0; i<15; i++) spawnDrone(); for(let i=0; i<15; i++) spawnSoldier(); for(let i=0; i<6; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission18() { objectives = [{ type: 'soldier', text: 'Elite Infantry', count: 0, target: 25, completed: false }]; for(let i=0; i<25; i++) spawnSoldier(); for(let i=0; i<5; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission19() { objectives = [{ type: 'turret', text: 'Fortress Breaker', count: 0, target: 15, completed: false }]; for(let i=0; i<15; i++) spawnTurret(); for(let i=0; i<6; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission20() { objectives = [{ type: 'drone', text: 'Air Superiority', count: 0, target: 40, completed: false }]; for(let i=0; i<40; i++) spawnDrone(); for(let i=0; i<6; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission21() { objectives = [{ type: 'soldier', text: 'Kill Soldiers', count: 0, target: 20, completed: false }, { type: 'turret', text: 'Kill Turrets', count: 0, target: 10, completed: false }]; for(let i=0; i<20; i++) spawnSoldier(); for(let i=0; i<10; i++) spawnTurret(); for(let i=0; i<6; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission22() { objectives = [{ type: 'boss', text: 'Destroy Cores', count: 0, target: 3, completed: false }]; spawnCore(new THREE.Vector3(0, 5, -20)); spawnCore(new THREE.Vector3(20, 5, -20)); spawnCore(new THREE.Vector3(-20, 5, -20)); for(let i=0; i<15; i++) spawnDrone(); for(let i=0; i<5; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission23() { objectives = [{ type: 'drone', text: 'Doomsday Swarm', count: 0, target: 50, completed: false }]; for(let i=0; i<50; i++) spawnDrone(); for(let i=0; i<8; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission24() { objectives = [{ type: 'soldier', text: 'Total Annihilation', count: 0, target: 40, completed: false }]; for(let i=0; i<40; i++) spawnSoldier(); for(let i=0; i<8; i++) spawnAmmoCrate(); updateMissionHUD(); }
function setupMission25() { objectives = [{ type: 'boss', text: 'Destroy Boss Cores', count: 0, target: 5, completed: false }, { type: 'soldier', text: 'Kill Guards', count: 0, target: 20, completed: false }]; spawnCore(new THREE.Vector3(0, 5, -20)); spawnCore(new THREE.Vector3(20, 5, -20)); spawnCore(new THREE.Vector3(-20, 5, -20)); spawnCore(new THREE.Vector3(20, 5, 20)); spawnCore(new THREE.Vector3(-20, 5, 20)); for(let i=0; i<20; i++) spawnSoldier(); for(let i=0; i<10; i++) spawnAmmoCrate(); updateMissionHUD(); }

function setupMobileTouchHandlers() {
    const joystickZone = document.getElementById('joystick-zone');
    const joystickBase = document.getElementById('joystick-base');
    const joystickHandle = document.getElementById('joystick-handle');

    let joystickCenterX = 0;
    let joystickCenterY = 0;
    const maxRadius = 40;

    // Helper to calculate base center
    function updateJoystickCenter() {
        const rect = joystickBase.getBoundingClientRect();
        joystickCenterX = rect.left + rect.width / 2;
        joystickCenterY = rect.top + rect.height / 2;
    }

    joystickZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        updateJoystickCenter();
        const touch = e.targetTouches[0];
        joystickTouchId = touch.identifier;
        moveJoystick(touch.clientX, touch.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (joystickTouchId !== null) {
            e.preventDefault();
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === joystickTouchId) {
                    moveJoystick(e.touches[i].clientX, e.touches[i].clientY);
                    break;
                }
            }
        }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        if (joystickTouchId !== null) {
            let found = false;
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === joystickTouchId) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                // Joystick touch ended
                joystickTouchId = null;
                joystickVector.set(0, 0);
                joystickHandle.style.transform = 'translate(0px, 0px)';
            }
        }
    });

    function moveJoystick(clientX, clientY) {
        let dx = clientX - joystickCenterX;
        let dy = clientY - joystickCenterY;
        let dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > maxRadius) {
            dx = (dx / dist) * maxRadius;
            dy = (dy / dist) * maxRadius;
            dist = maxRadius;
        }

        joystickHandle.style.transform = `translate(${dx}px, ${dy}px)`;
        joystickVector.set(dx / maxRadius, dy / maxRadius);
    }

    // Right side touch-to-look handler
    window.addEventListener('touchstart', (e) => {
        if (gameState !== 'PLAYING' || !isPlaying) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            
            // Check if touch is on right half of screen
            if (touch.clientX > window.innerWidth / 2) {
                const isBtn = touch.target.closest('#mobile-buttons-zone') || touch.target.closest('#joystick-zone');
                if (!isBtn && lookTouchId === null) {
                    lookTouchId = touch.identifier;
                    lastLookTouchX = touch.clientX;
                    lastLookTouchY = touch.clientY;
                }
            }
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (lookTouchId !== null) {
            e.preventDefault();
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                if (touch.identifier === lookTouchId) {
                    let dx = touch.clientX - lastLookTouchX;
                    let dy = touch.clientY - lastLookTouchY;
                    lastLookTouchX = touch.clientX;
                    lastLookTouchY = touch.clientY;

                    // Touch sensitivity
                    let touchSensitivity = 0.0035;
                    if (isScoped) {
                        touchSensitivity = 0.0015;
                    }

                    yaw -= dx * touchSensitivity;
                    pitch -= dy * touchSensitivity;
                    pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, pitch));

                    player.rotation.y = yaw;
                    camera.rotation.x = pitch;
                    break;
                }
            }
        }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        if (lookTouchId !== null) {
            let found = false;
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === lookTouchId) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                lookTouchId = null;
            }
        }
    });

    // Touch Buttons action triggers
    const btnPause = document.getElementById('btn-pause-mobile');
    const btnReload = document.getElementById('btn-reload-mobile');
    const btnSwap = document.getElementById('btn-swap-mobile');
    const btnCrouch = document.getElementById('btn-crouch-mobile');
    const btnMelee = document.getElementById('btn-melee-mobile');
    const btnGrenade = document.getElementById('btn-grenade-mobile');
    const btnAbility = document.getElementById('btn-ability-mobile');
    const btnScope = document.getElementById('btn-scope-mobile');
    const btnJump = document.getElementById('btn-jump-mobile');
    const btnFire = document.getElementById('btn-fire-mobile');

    const handlePause = (e) => {
        e.preventDefault();
        showMenuDashboard();
    };
    btnPause.addEventListener('touchstart', handlePause);
    btnPause.addEventListener('mousedown', handlePause);

    const handleReload = (e) => {
        e.preventDefault();
        reloadWeapon();
    };
    btnReload.addEventListener('touchstart', handleReload);
    btnReload.addEventListener('mousedown', handleReload);

    const handleSwap = (e) => {
        e.preventDefault();
        if (gameState === 'PLAYING') {
            let targetActiveSlot = activeSlot === 1 ? 2 : 1;
            if (targetActiveSlot === 1) {
                ammoClip2 = ammoClip;
                activeSlot = 1;
                selectedWeapon = primaryWeapon;
                currentWeaponStats = WEAPON_STATS[selectedWeapon];
                maxClip = currentWeaponStats.clip;
                ammoClip = ammoClip1;
                isReloading = false;
                updateHUD();
            } else {
                ammoClip1 = ammoClip;
                activeSlot = 2;
                selectedWeapon = secondaryWeapon;
                currentWeaponStats = WEAPON_STATS[selectedWeapon];
                maxClip = currentWeaponStats.clip;
                ammoClip = ammoClip2;
                isReloading = false;
                updateHUD();
            }
        }
    };
    btnSwap.addEventListener('touchstart', handleSwap);
    btnSwap.addEventListener('mousedown', handleSwap);

    const handleCrouch = (e) => {
        e.preventDefault();
        keys.ctrl = !keys.ctrl;
        if (keys.ctrl) {
            btnCrouch.classList.add('active');
        } else {
            btnCrouch.classList.remove('active');
        }
    };
    btnCrouch.addEventListener('touchstart', handleCrouch);
    btnCrouch.addEventListener('mousedown', handleCrouch);

    const handleMelee = (e) => {
        e.preventDefault();
        meleeAttack();
    };
    btnMelee.addEventListener('touchstart', handleMelee);
    btnMelee.addEventListener('mousedown', handleMelee);

    const handleGrenade = (e) => {
        e.preventDefault();
        throwGrenade();
    };
    btnGrenade.addEventListener('touchstart', handleGrenade);
    btnGrenade.addEventListener('mousedown', handleGrenade);

    const handleAbility = (e) => {
        e.preventDefault();
        activateAbility();
    };
    btnAbility.addEventListener('touchstart', handleAbility);
    btnAbility.addEventListener('mousedown', handleAbility);

    const handleScope = (e) => {
        e.preventDefault();
        toggleScope();
    };
    btnScope.addEventListener('touchstart', handleScope);
    btnScope.addEventListener('mousedown', handleScope);

    const startJump = (e) => {
        e.preventDefault();
        keys.space = true;
    };
    const endJump = (e) => {
        e.preventDefault();
        keys.space = false;
    };
    btnJump.addEventListener('touchstart', startJump);
    btnJump.addEventListener('mousedown', startJump);
    btnJump.addEventListener('touchend', endJump);
    btnJump.addEventListener('mouseup', endJump);

    const startFire = (e) => {
        e.preventDefault();
        isShooting = true;
    };
    const endFire = (e) => {
        e.preventDefault();
        isShooting = false;
    };
    btnFire.addEventListener('touchstart', startFire);
    btnFire.addEventListener('mousedown', startFire);
    btnFire.addEventListener('touchend', endFire);
    btnFire.addEventListener('mouseup', endFire);
}

// ==========================================
// SECRET DEVELOPER CONSOLE & CONFIG EDITOR
// ==========================================

// Global render function for Missions in Menu Dashboard
function renderMissions() {
    const missionGrid = document.querySelector('.mission-grid');
    if (!missionGrid) return;
    
    missionGrid.innerHTML = '';
    
    // Sort mission IDs numerically
    const missionIds = Object.keys(MISSIONS).map(Number).sort((a, b) => a - b);
    
    missionIds.forEach(id => {
        const data = MISSIONS[id];
        const isUnlocked = unlockedMissions.includes(id);
        const isSelected = (id === currentMissionId);
        
        const card = document.createElement('div');
        card.id = `card-m${id}`;
        card.className = isUnlocked 
            ? `mission-card active-card${isSelected ? ' selected' : ''}` 
            : 'mission-card locked-card';
        card.setAttribute('data-mission', id);
        
        const formattedId = id < 10 ? `0${id}` : id;
        
        card.innerHTML = `
            <div class="card-num glow-magenta">${formattedId}</div>
            <div class="card-title">${data.title}</div>
            <p class="card-desc">${data.story}</p>
            <div class="card-status ${isUnlocked ? 'glow-green' : 'glow-red'}">${isUnlocked ? 'UNLOCKED' : 'LOCKED'}</div>
        `;
        
        card.addEventListener('click', () => {
            if (unlockedMissions.includes(id)) {
                selectMission(id);
            }
        });
        
        missionGrid.appendChild(card);
    });
}

// Global render function for Weapons in Menu Dashboard
function renderWeapons() {
    const weaponGrid = document.getElementById('weapon-grid');
    if (!weaponGrid) return;
    
    weaponGrid.innerHTML = '';
    
    Object.keys(WEAPON_STATS).forEach(key => {
        const data = WEAPON_STATS[key];
        const isSelected = (key === (targetSlot === 1 ? primaryWeapon : secondaryWeapon));
        
        const card = document.createElement('div');
        card.className = `weapon-card${isSelected ? ' selected' : ''}`;
        card.setAttribute('data-weapon', key);
        card.innerHTML = `
            <div class="w-title">${data.name}</div>
            <div class="w-desc">Damage: ${data.damage} | Clip: ${data.clip} | Fire Rate: ${data.fireRate}ms</div>
        `;
        
        card.addEventListener('click', () => {
            selectWeapon(key);
        });
        
        weaponGrid.appendChild(card);
    });
}

// Global render function for Abilities in Menu Dashboard
function renderAbilities() {
    const abilityGrid = document.getElementById('ability-grid');
    if (!abilityGrid) return;
    
    abilityGrid.innerHTML = '';
    
    Object.keys(ABILITY_STATS).forEach(key => {
        const data = ABILITY_STATS[key];
        const isSelected = (key === selectedAbility);
        
        const card = document.createElement('div');
        card.className = `weapon-card${isSelected ? ' selected' : ''}`;
        card.setAttribute('data-ability', key);
        card.innerHTML = `
            <div class="w-title">${data.name}</div>
            <div class="w-desc">Cooldown: ${data.cooldown / 1000}s | Duration: ${data.duration / 1000}s ${data.passive ? '(Passive)' : ''}</div>
        `;
        
        card.addEventListener('click', () => {
            selectAbility(key);
        });
        
        abilityGrid.appendChild(card);
    });
}

// Spawner logic for custom editor levels
function setupCustomMission(mission) {
    objectives = [];
    
    // Spawn custom objective items
    if (mission.dronesCount && mission.dronesCount > 0) {
        objectives.push({ type: 'drone', text: "Eliminate scout drones", count: 0, target: parseInt(mission.dronesCount), completed: false });
        for (let i = 0; i < mission.dronesCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * 15;
            const dx = Math.cos(angle) * radius;
            const dz = Math.sin(angle) * radius;
            const dy = 2 + Math.random() * 4.0;
            spawnDrone(dx, dy, dz, 0.02, 0xff0055, 3000);
        }
    }
    
    if (mission.soldiersCount && mission.soldiersCount > 0) {
        objectives.push({ type: 'soldier', text: "Neutralize armed soldiers", count: 0, target: parseInt(mission.soldiersCount), completed: false });
        for (let i = 0; i < mission.soldiersCount; i++) {
            spawnSoldier();
        }
    }
    
    if (mission.turretsCount && mission.turretsCount > 0) {
        objectives.push({ type: 'turret', text: "Destroy defense turrets", count: 0, target: parseInt(mission.turretsCount), completed: false });
        for (let i = 0; i < mission.turretsCount; i++) {
            spawnTurret();
        }
    }
    
    if (mission.beaconsCount && mission.beaconsCount > 0) {
        objectives.push({ type: 'beacon', text: "Destroy signal beacons", count: 0, target: parseInt(mission.beaconsCount), completed: false });
        for (let i = 0; i < mission.beaconsCount; i++) {
            spawnBeacon((Math.random() - 0.5) * 40, 0.6, (Math.random() - 0.5) * 40, i + 1);
        }
    }
    
    if (mission.bossesCount && mission.bossesCount > 0) {
        objectives.push({ type: 'boss', text: "Purge singularity core", count: 0, target: parseInt(mission.bossesCount), completed: false });
        for (let i = 0; i < mission.bossesCount; i++) {
            const bx = (i - (mission.bossesCount - 1) / 2) * 20;
            spawnCore(new THREE.Vector3(bx, 5, -20));
        }
    }
    
    // Always spawn a few ammo crates
    const crates = mission.ammoCratesCount || 3;
    for (let i = 0; i < crates; i++) {
        spawnAmmoCrate();
    }
    
    updateObjectivesHUD();
}

// Dev verification modal controls
function showSecretVerificationModal() {
    // Release pointer lock just in case
    document.exitPointerLock();
    
    const modal = document.getElementById('secret-verification-modal');
    const input = document.getElementById('secret-answer-input');
    const submitBtn = document.getElementById('btn-secret-submit');
    const cancelBtn = document.getElementById('btn-secret-cancel');
    
    if (!modal) return;
    
    modal.classList.remove('hidden');
    modal.classList.add('active');
    if (input) {
        input.value = "";
        input.focus();
    }
    
    const handleClose = () => {
        modal.classList.remove('active');
        modal.classList.add('hidden');
        // Clean up listeners
        submitBtn.replaceWith(submitBtn.cloneNode(true));
        cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    };
    
    const handleSubmit = () => {
        const ans = input.value.trim().toUpperCase();
        if (ans === "6-B" || ans === "VI-B") {
            handleClose();
            showDevEditorModal();
        } else {
            // Access denied visual
            input.value = "ACCESS DENIED";
            input.style.color = "var(--red)";
            input.style.borderColor = "var(--red)";
            setTimeout(() => {
                input.style.color = "#fff";
                input.style.borderColor = "var(--cyan)";
                handleClose();
            }, 1500);
        }
    };
    
    // Bind listeners
    submitBtn.addEventListener('click', handleSubmit);
    cancelBtn.addEventListener('click', handleClose);
    
    // Bind enter key on input
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSubmit();
    });
}

// Dev configurations editor modal
function showDevEditorModal() {
    const modal = document.getElementById('dev-editor-modal');
    const closeBtn = document.getElementById('btn-dev-close');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    modal.classList.add('active');
    
    // Render current tables
    renderEditorMissions();
    renderEditorWeapons();
    renderEditorAbilities();
    
    // Setup tab button toggles
    const tabButtons = document.querySelectorAll('.dev-tab-btn');
    const tabPanes = document.querySelectorAll('.dev-tab-pane');
    
    tabButtons.forEach(btn => {
        btn.onclick = () => {
            tabButtons.forEach(b => {
                b.style.border = '1px solid rgba(255,255,255,0.1)';
                b.style.background = 'transparent';
                b.style.color = '#fff';
            });
            tabPanes.forEach(pane => pane.classList.add('hidden'));
            
            btn.style.border = '1px solid var(--cyan)';
            btn.style.background = 'rgba(0, 240, 255, 0.1)';
            btn.style.color = 'var(--cyan)';
            
            const targetPaneId = btn.id.replace('tab-btn-', 'dev-tab-');
            const targetPane = document.getElementById(targetPaneId);
            if (targetPane) targetPane.classList.remove('hidden');
        };
    });
    
    // Default select first tab
    if (tabButtons[0]) tabButtons[0].click();
    
    // Bind dev console buttons
    const applyBtn = document.getElementById('btn-dev-apply');
    const transmitBtn = document.getElementById('btn-dev-transmit');
    const exportBtn = document.getElementById('btn-dev-export');
    
    if (applyBtn) {
        applyBtn.onclick = () => {
            renderMissions();
            renderWeapons();
            renderAbilities();
            
            // Auto unlock all missions keys
            const mKeys = Object.keys(MISSIONS).map(Number);
            unlockedMissions = Array.from(new Set([...unlockedMissions, ...mKeys]));
            
            addLogToTerminal("[SUCCESS] Config applied successfully to play session.");
            addLogToTerminal("[SYS_LOG] Mission select list rebuilt.");
            addLogToTerminal("[SYS_LOG] Loadout grids rebuilt.");
            alert("Configuration applied! Your custom items/weapons/missions are now selectable in the menu.");
        };
    }
    
    if (transmitBtn) {
        transmitBtn.onclick = () => {
            addLogToTerminal("[COMPILE] Packaging configuration bundle...");
            setTimeout(() => {
                addLogToTerminal("[RESOLVE] Resolving assets and dependencies...");
            }, 500);
            setTimeout(() => {
                addLogToTerminal("[TRANSMIT] Connecting to neural link node...");
            }, 1000);
            setTimeout(() => {
                addLogToTerminal("[SEND] Sending data blocks (88.4 KB)...");
            }, 1500);
            setTimeout(() => {
                addLogToTerminal("[STATUS] WAITING FOR NEURAL APPROVAL...");
                addLogToTerminal(">>> STATUS: PENDING. Copy-paste configuration to AI to write it permanently!");
                
                // Copy to clipboard
                const config = { MISSIONS, WEAPON_STATS, ABILITY_STATS };
                const json = JSON.stringify(config, null, 2);
                navigator.clipboard.writeText(json).then(() => {
                    alert("Config bundle copied to clipboard! Share it in the chat for final approval and permanent storage.");
                }).catch(() => {
                    alert("Transmit pending approval! Use the EXPORT button to download your configuration file.");
                });
            }, 2200);
        };
    }
    
    if (exportBtn) {
        exportBtn.onclick = () => {
            const config = { MISSIONS, WEAPON_STATS, ABILITY_STATS };
            const json = JSON.stringify(config, null, 2);
            
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dev_config.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            addLogToTerminal("[EXPORT] Exported config to dev_config.json.");
        };
    }
    
    // Bind Close Editor
    closeBtn.onclick = () => {
        modal.classList.remove('active');
        modal.classList.add('hidden');
    };
    
    // Bind Add Mission
    const addMissionBtn = document.getElementById('btn-add-mission');
    if (addMissionBtn) {
        addMissionBtn.onclick = () => {
            const title = document.getElementById('add-m-title').value.trim().toUpperCase() || "CUSTOM MISSION";
            const story = document.getElementById('add-m-story').value.trim() || "Clear all rogue hostiles in the grid perimeter.";
            const xp = parseInt(document.getElementById('add-m-xp').value) || 2000;
            const drones = parseInt(document.getElementById('add-m-drones').value) || 0;
            const soldiers = parseInt(document.getElementById('add-m-soldiers').value) || 0;
            const turrets = parseInt(document.getElementById('add-m-turrets').value) || 0;
            const beacons = parseInt(document.getElementById('add-m-beacons').value) || 0;
            const bosses = parseInt(document.getElementById('add-m-bosses').value) || 0;
            
            // Find next available mission index
            const keys = Object.keys(MISSIONS).map(Number);
            const nextIndex = keys.length > 0 ? Math.max(...keys) + 1 : 1;
            
            MISSIONS[nextIndex] = {
                title: title,
                subtitle: "GRID TELEMETRY SECURED",
                story: story,
                xp: xp,
                dronesCount: drones,
                soldiersCount: soldiers,
                turretsCount: turrets,
                beaconsCount: beacons,
                bossesCount: bosses,
                ammoCratesCount: Math.max(3, drones + soldiers + turrets),
                isCustom: true
            };
            
            // Clear inputs
            document.getElementById('add-m-title').value = "";
            document.getElementById('add-m-story').value = "";
            
            renderEditorMissions();
            addLogToTerminal(`[SYS_LOG] Created custom mission: ${title} at MISSION ${nextIndex}`);
        };
    }
    
    // Bind Add Weapon
    const addWeaponBtn = document.getElementById('btn-add-weapon');
    if (addWeaponBtn) {
        addWeaponBtn.onclick = () => {
            const key = document.getElementById('add-w-key').value.trim();
            const name = document.getElementById('add-w-name').value.trim() || key;
            const fireRate = parseInt(document.getElementById('add-w-rate').value) || 100;
            const damage = parseInt(document.getElementById('add-w-damage').value) || 30;
            const clip = parseInt(document.getElementById('add-w-clip').value) || 30;
            const pellets = parseInt(document.getElementById('add-w-pellets').value) || 1;
            
            if (!key) {
                alert("Weapon ID key is required.");
                return;
            }
            
            WEAPON_STATS[key] = {
                name: name,
                fireRate: fireRate,
                baseSpread: pellets > 1 ? 0.08 : 0.02,
                recoilSpreadAdd: pellets > 1 ? 0.02 : 0.01,
                damage: damage,
                clip: clip,
                pellets: pellets
            };
            
            document.getElementById('add-w-key').value = "";
            document.getElementById('add-w-name').value = "";
            
            renderEditorWeapons();
            addLogToTerminal(`[SYS_LOG] Registered new weapon structure: ${name} (${key})`);
        };
    }
    
    // Bind Add Ability
    const addAbilityBtn = document.getElementById('btn-add-ability');
    if (addAbilityBtn) {
        addAbilityBtn.onclick = () => {
            const key = document.getElementById('add-a-key').value.trim();
            const name = document.getElementById('add-a-name').value.trim() || key;
            const cooldown = parseInt(document.getElementById('add-a-cooldown').value) || 30000;
            const duration = parseInt(document.getElementById('add-a-duration').value) || 5000;
            const passive = document.getElementById('add-a-passive').checked;
            
            if (!key) {
                alert("Ability ID key is required.");
                return;
            }
            
            ABILITY_STATS[key] = {
                name: name,
                cooldown: cooldown,
                duration: duration,
                passive: passive
            };
            
            document.getElementById('add-a-key').value = "";
            document.getElementById('add-a-name').value = "";
            document.getElementById('add-a-passive').checked = false;
            
            renderEditorAbilities();
            addLogToTerminal(`[SYS_LOG] Registered new character ability: ${name} (${key})`);
        };
    }
}

// Dev log helper
function addLogToTerminal(text) {
    const term = document.getElementById('dev-terminal');
    if (!term) return;
    const div = document.createElement('div');
    div.textContent = text;
    term.appendChild(div);
    term.scrollTop = term.scrollHeight;
}

// Dev editor missions list renderer
function renderEditorMissions() {
    const listEl = document.getElementById('dev-mission-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    
    Object.keys(MISSIONS).map(Number).sort((a, b) => a - b).forEach(id => {
        const m = MISSIONS[id];
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.background = 'rgba(255, 255, 255, 0.03)';
        row.style.border = '1px solid rgba(255, 255, 255, 0.08)';
        row.style.padding = '10px 15px';
        row.style.borderRadius = '4px';
        
        row.innerHTML = `
            <div>
                <strong class="glow-cyan" style="font-family: 'Orbitron'; font-size: 0.95rem;">MISSION ${id}: ${m.title}</strong>
                <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 3px;">
                    Drones: ${m.dronesCount || 0} | Soldiers: ${m.soldiersCount || 0} | Turrets: ${m.turretsCount || 0} | Beacons: ${m.beaconsCount || 0} | Cores: ${m.bossesCount || 0}
                </div>
            </div>
            <button class="btn glow-magenta-btn" style="padding: 4px 10px; font-size: 0.75rem; height: auto;">DELETE</button>
        `;
        
        const deleteBtn = row.querySelector('button');
        deleteBtn.addEventListener('click', () => {
            if (Object.keys(MISSIONS).length <= 1) {
                alert("Cannot delete all missions. At least one mission must remain.");
                return;
            }
            delete MISSIONS[id];
            if (currentMissionId === id) {
                currentMissionId = 1;
            }
            renderEditorMissions();
            addLogToTerminal(`Deleted mission: MISSION ${id}`);
        });
        
        listEl.appendChild(row);
    });
}

// Dev editor weapons list renderer
function renderEditorWeapons() {
    const listEl = document.getElementById('dev-weapon-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    
    Object.keys(WEAPON_STATS).forEach(key => {
        const w = WEAPON_STATS[key];
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.background = 'rgba(255, 255, 255, 0.03)';
        row.style.border = '1px solid rgba(255, 255, 255, 0.08)';
        row.style.padding = '10px 15px';
        row.style.borderRadius = '4px';
        
        row.innerHTML = `
            <div>
                <strong class="glow-cyan" style="font-family: 'Orbitron'; font-size: 0.95rem;">${w.name} (${key})</strong>
                <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 3px;">
                    Damage: ${w.damage} | Clip: ${w.clip} | Rate: ${w.fireRate}ms | Pellets: ${w.pellets || 1}
                </div>
            </div>
            <button class="btn glow-magenta-btn" style="padding: 4px 10px; font-size: 0.75rem; height: auto;">DELETE</button>
        `;
        
        const deleteBtn = row.querySelector('button');
        deleteBtn.addEventListener('click', () => {
            if (Object.keys(WEAPON_STATS).length <= 1) {
                alert("Cannot delete all weapons. At least one weapon must remain.");
                return;
            }
            delete WEAPON_STATS[key];
            if (primaryWeapon === key) primaryWeapon = Object.keys(WEAPON_STATS)[0];
            if (secondaryWeapon === key) secondaryWeapon = Object.keys(WEAPON_STATS)[0];
            renderEditorWeapons();
            addLogToTerminal(`Deleted weapon: ${key}`);
        });
        
        listEl.appendChild(row);
    });
}

// Dev editor abilities list renderer
function renderEditorAbilities() {
    const listEl = document.getElementById('dev-ability-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    
    Object.keys(ABILITY_STATS).forEach(key => {
        const a = ABILITY_STATS[key];
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.background = 'rgba(255, 255, 255, 0.03)';
        row.style.border = '1px solid rgba(255, 255, 255, 0.08)';
        row.style.padding = '10px 15px';
        row.style.borderRadius = '4px';
        
        row.innerHTML = `
            <div>
                <strong class="glow-cyan" style="font-family: 'Orbitron'; font-size: 0.95rem;">${a.name} (${key})</strong>
                <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 3px;">
                    Cooldown: ${a.cooldown / 1000}s | Duration: ${a.duration / 1000}s | Type: ${a.passive ? 'Passive' : 'Active'}
                </div>
            </div>
            <button class="btn glow-magenta-btn" style="padding: 4px 10px; font-size: 0.75rem; height: auto;">DELETE</button>
        `;
        
        const deleteBtn = row.querySelector('button');
        deleteBtn.addEventListener('click', () => {
            if (Object.keys(ABILITY_STATS).length <= 1) {
                alert("Cannot delete all abilities. At least one ability must remain.");
                return;
            }
            delete ABILITY_STATS[key];
            if (selectedAbility === key) selectedAbility = Object.keys(ABILITY_STATS)[0];
            renderEditorAbilities();
            addLogToTerminal(`Deleted ability: ${key}`);
        });
        
        listEl.appendChild(row);
    });
}

// --- Medkit Spawner & Update Systems ---
function spawnMedkit(x, y, z) {
    const medkitGroup = new THREE.Group();
    medkitGroup.position.set(x, y, z);
    
    // Green box body
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.5, 0.3);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x009933, roughness: 0.5, metalness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    medkitGroup.add(body);
    
    // White cross
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.32), crossMat);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.32), crossMat);
    crossH.position.y = 0.01;
    crossV.position.y = 0.01;
    medkitGroup.add(crossH);
    medkitGroup.add(crossV);
    
    scene.add(medkitGroup);
    medkits.push({
        mesh: medkitGroup,
        yBase: y,
        floatOffset: Math.random() * Math.PI * 2
    });
}

function updateMedkitPickups() {
    if (gameState !== 'PLAYING') return;
    const now = performance.now();
    
    const medkitValEl = document.getElementById('medkit-count-val');
    if (medkitValEl) {
        medkitValEl.textContent = medkitCount;
    }
    
    for (let i = medkits.length - 1; i >= 0; i--) {
        const item = medkits[i];
        item.mesh.position.y = item.yBase + Math.sin(now * 0.003 + item.floatOffset) * 0.15;
        item.mesh.rotation.y += 0.02;
        
        const dist = player.position.distanceTo(item.mesh.position);
        if (dist < 2.0) {
            medkitCount++;
            window.sounds.playShieldHit();
            spawnSparks(item.mesh.position, new THREE.Color(0x39ff14), 15);
            scene.remove(item.mesh);
            medkits.splice(i, 1);
            if (medkitValEl) {
                medkitValEl.textContent = medkitCount;
            }
        }
    }
}

function startHealing() {
    if (gameState !== 'PLAYING') return;
    if (medkitCount <= 0 || health >= 100 || isHealing) return;
    
    isHealing = true;
    healTimer = HEAL_DURATION;
    
    const container = document.getElementById('heal-progress-container');
    if (container) {
        container.classList.remove('hidden');
    }
}

function updateHealingProgress(dt) {
    if (gameState !== 'PLAYING') return;
    if (!isHealing) return;
    
    const speed = new THREE.Vector2(velocity.x, velocity.z).length();
    if (speed > 0.03 || !isGrounded) {
        isHealing = false;
        const container = document.getElementById('heal-progress-container');
        if (container) {
            container.classList.add('hidden');
        }
        window.sounds.playPlayerHit();
        return;
    }
    
    healTimer -= dt;
    const progressFill = document.getElementById('heal-progress-fill');
    if (progressFill) {
        const pct = ((HEAL_DURATION - healTimer) / HEAL_DURATION) * 100;
        progressFill.style.width = `${pct}%`;
    }
    
    if (healTimer <= 0) {
        isHealing = false;
        medkitCount--;
        health = Math.min(100, health + 75);
        updateHUD();
        spawnSparks(player.position.clone().add(new THREE.Vector3(0, -0.5, 0)), new THREE.Color(0x39ff14), 30);
        window.sounds.playShieldHit();
        
        const container = document.getElementById('heal-progress-container');
        if (container) {
            container.classList.add('hidden');
        }
        const medkitValEl = document.getElementById('medkit-count-val');
        if (medkitValEl) {
            medkitValEl.textContent = medkitCount;
        }
    }
}

// --- Dropped Weapon & Swapping Systems ---
function spawnDroppedWeapon(x, y, z, weaponKey, ammoClip) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    
    const gunVisuals = WEAPON_VISUALS[weaponKey] || { color: 0xff0055 };
    const bodyGeo = new THREE.BoxGeometry(0.12, 0.18, 0.85);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);
    
    const stripGeo = new THREE.BoxGeometry(0.13, 0.04, 0.6);
    const stripMat = new THREE.MeshBasicMaterial({ color: gunVisuals.color });
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.y = 0.09;
    group.add(strip);
    
    scene.add(group);
    droppedWeapons.push({
        mesh: group,
        yBase: y,
        floatOffset: Math.random() * Math.PI * 2,
        weaponKey: weaponKey,
        ammoClip: ammoClip
    });
}

function updateDroppedWeaponPickups() {
    if (gameState !== 'PLAYING') return;
    const now = performance.now();
    
    let closestWeapon = null;
    let closestDist = Infinity;
    
    for (let i = droppedWeapons.length - 1; i >= 0; i--) {
        const item = droppedWeapons[i];
        item.mesh.position.y = item.yBase + Math.sin(now * 0.003 + item.floatOffset) * 0.12;
        item.mesh.rotation.y += 0.015;
        
        const dist = player.position.distanceTo(item.mesh.position);
        if (dist < 2.5) {
            if (dist < closestDist) {
                closestDist = dist;
                closestWeapon = item;
            }
        }
    }
    
    const prompt = document.getElementById('interaction-prompt');
    if (closestWeapon) {
        if (prompt) {
            prompt.innerHTML = `PRESS <span style="background: var(--cyan); color: #000; padding: 2px 8px; border-radius: 3px; font-family: 'Orbitron'; margin: 0 6px; font-weight: bold; box-shadow: 0 0 5px var(--cyan);">F</span> TO SWAP FOR ${WEAPON_STATS[closestWeapon.weaponKey].name.toUpperCase()}`;
            prompt.classList.remove('hidden');
        }
        window.activeInteractionWeapon = closestWeapon;
    } else {
        if (prompt) {
            prompt.classList.add('hidden');
        }
        window.activeInteractionWeapon = null;
    }
}

function swapWeapon(dropped) {
    if (!dropped) return;
    
    const newWeaponKey = dropped.weaponKey;
    const newClip = dropped.ammoClip;
    window.sounds.playShieldHit();
    
    if (activeSlot === 1) {
        const oldWKey = primaryWeapon;
        const oldClip = ammoClip;
        primaryWeapon = newWeaponKey;
        selectedWeapon = primaryWeapon;
        ammoClip = newClip;
        ammoClip1 = newClip;
        spawnDroppedWeapon(player.position.x, 0.2, player.position.z, oldWKey, oldClip);
    } else {
        const oldWKey = secondaryWeapon;
        const oldClip = ammoClip;
        secondaryWeapon = newWeaponKey;
        selectedWeapon = secondaryWeapon;
        ammoClip = newClip;
        ammoClip2 = newClip;
        spawnDroppedWeapon(player.position.x, 0.2, player.position.z, oldWKey, oldClip);
    }
    
    currentWeaponStats = WEAPON_STATS[selectedWeapon];
    maxClip = currentWeaponStats.clip;
    isReloading = false;
    
    const idx = droppedWeapons.indexOf(dropped);
    if (idx > -1) {
        droppedWeapons.splice(idx, 1);
    }
    scene.remove(dropped.mesh);
    
    if (typeof updatePlayerWeaponVisuals === 'function') updatePlayerWeaponVisuals();
    updateHUD();
}

function updatePlayerWeaponVisuals() {
    if (!weaponGroup) return;
    const visuals = WEAPON_VISUALS[selectedWeapon] || { color: 0x00f0ff };
    
    weaponGroup.traverse(child => {
        if (child.isMesh && child.material) {
            if (child.material.type === 'MeshBasicMaterial' || child.material.isMeshBasicMaterial) {
                child.material.color.setHex(visuals.color);
            }
        }
    });
}

