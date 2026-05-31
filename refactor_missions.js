const fs = require('fs');

let gameCode = fs.readFileSync('game.js', 'utf8');

// 1. Objectives type updates
gameCode = gameCode.replace(/{ text: "Eliminate scout drones"/, "{ type: 'drone', text: \"Eliminate scout drones\"");
gameCode = gameCode.replace(/{ text: "Infiltrate and destroy firewall nodes"/, "{ type: 'turret', text: \"Infiltrate and destroy firewall nodes\"");
gameCode = gameCode.replace(/{ text: "Destroy signal beacons"/, "{ type: 'beacon', text: \"Destroy signal beacons\"");
gameCode = gameCode.replace(/{ text: "Destroy Corrupted AI Core"/, "{ type: 'boss', text: \"Destroy Corrupted AI Core\"");

// 2. Add incrementObjectiveType function
const incFunc = `
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
`;
gameCode = gameCode.replace(/\/\/ Main Frame Tick Loop/, incFunc + '\n// Main Frame Tick Loop');

// 3. Update damage handlers to use incrementObjectiveType
const droneDamageTarget = `        // Check Mission 1 target progress
        if (currentMissionId === 1) {
            objectives[0].count++;
            if (objectives[0].count >= objectives[0].target) {
                objectives[0].completed = true;
                completeMission();
            }
            updateObjectivesHUD();
        }
        updateHUD();`;
gameCode = gameCode.replace(droneDamageTarget, `        incrementObjectiveType('drone');\n        updateHUD();`);

const turretDamageTarget = `        // Mission 2 progress checks
        if (currentMissionId === 2) {
            objectives[0].count++;
            if (objectives[0].count >= objectives[0].target) {
                objectives[0].completed = true;
                completeMission();
            }
            updateObjectivesHUD();
        }
        updateHUD();`;
gameCode = gameCode.replace(turretDamageTarget, `        incrementObjectiveType('turret');\n        updateHUD();`);

const beaconDamageTarget = `        // Mission 3 progress checks
        if (currentMissionId === 3) {
            objectives[0].count++;
            if (objectives[0].count >= objectives[0].target) {
                objectives[0].completed = true;
                completeMission();
            }
            updateObjectivesHUD();
        }
        updateHUD();`;
gameCode = gameCode.replace(beaconDamageTarget, `        incrementObjectiveType('beacon');\n        updateHUD();`);

const bossDamageTarget = `        // Mission 4 complete
        if (currentMissionId === 4) {
            objectives[0].count = 1;
            objectives[0].completed = true;
            completeMission();
            updateObjectivesHUD();
        }
        updateHUD();`;
gameCode = gameCode.replace(bossDamageTarget, `        incrementObjectiveType('boss');\n        updateHUD();`);

// 4. Refactor bossCore to bossCores array
gameCode = gameCode.replace(/let bossCore = null;/g, 'let bossCores = [];');

// clearActiveLevel
gameCode = gameCode.replace(/if \(bossCore\) {[\s\S]*?bossCore = null;\n    }/, `bossCores.forEach(b => scene.remove(b));\n    bossCores = [];`);

// setupMission4
gameCode = gameCode.replace(/bossCore = new THREE\.Group\(\);/, 'let bossCore = new THREE.Group();\n    bossCores.push(bossCore);');

// fireWeapon
gameCode = gameCode.replace(/if \(bossCore\) {[\s\S]*?}\n/, `bossCores.forEach(b => b.traverse(child => { if (child.isMesh) targetables.push(child); }));\n`);

// updateLevelEntities
gameCode = gameCode.replace(/if \(bossCore\) {/g, `bossCores.forEach(bossCore => {`);

// damageBoss removal
gameCode = gameCode.replace(/scene\.remove\(bossGroup\);\n        bossCore = null;/, `scene.remove(bossGroup);\n        const idx = bossCores.indexOf(bossGroup);\n        if (idx > -1) bossCores.splice(idx, 1);`);


// 5. Append missions 5-10
const missionsCode = \`
// Mission 5: Laser Grid
function setupMission5() {
    objectives = [
        { type: 'drone', text: "Eliminate agile scout drones", count: 0, target: 12, completed: false }
    ];

    const columnSpots = [];
    for(let x=-20; x<=20; x+=10) {
        for(let z=-20; z<=20; z+=10) {
            if (x===0 && z===0) continue;
            columnSpots.push([x, z]);
        }
    }
    columnSpots.forEach(([x, z]) => spawnPillar(x, z, 0x00f0ff));

    for (let i = 0; i < 12; i++) {
        const x = (Math.random() - 0.5) * 50;
        const z = (Math.random() - 0.5) * 50;
        spawnDrone(x, 2 + Math.random()*3, z, 0.05, 0xff0055, 2500);
    }
}

// Mission 6: Turret Alley
function setupMission6() {
    objectives = [
        { type: 'turret', text: "Destroy alley turrets", count: 0, target: 8, completed: false }
    ];

    for(let z = -30; z <= 30; z+= 15) {
        const geo = new THREE.BoxGeometry(40, 8, 4);
        const mat = new THREE.MeshStandardMaterial({ color: 0x080415, roughness: 0.1 });
        const wallL = new THREE.Mesh(geo, mat);
        wallL.position.set(-25, 4, z);
        scene.add(wallL);
        
        const edgesL = new THREE.EdgesGeometry(geo);
        const lineL = new THREE.LineSegments(edgesL, new THREE.LineBasicMaterial({ color: 0x5a00b8 }));
        wallL.add(lineL);
        staticObstacles.push(wallL);
        wallL.userData = { halfW: 20 + 0.8, halfD: 2 + 0.8 };

        const wallR = new THREE.Mesh(geo, mat);
        wallR.position.set(25, 4, z);
        scene.add(wallR);
        const edgesR = new THREE.EdgesGeometry(geo);
        const lineR = new THREE.LineSegments(edgesR, new THREE.LineBasicMaterial({ color: 0x5a00b8 }));
        wallR.add(lineR);
        staticObstacles.push(wallR);
        wallR.userData = { halfW: 20 + 0.8, halfD: 2 + 0.8 };
        
        spawnTurret(-4, z);
        spawnTurret(4, z);
    }
}

// Mission 7: Shadow Realm
function setupMission7() {
    objectives = [
        { type: 'beacon', text: "Destroy hidden beacons", count: 0, target: 5, completed: false }
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
        { type: 'beacon', text: "Destroy elevated beacons", count: 0, target: 6, completed: false }
    ];
    
    for(let i=0; i<6; i++) {
        const y = 5 + i * 8;
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        
        const geo = new THREE.BoxGeometry(6, 0.4, 6);
        const mat = new THREE.MeshStandardMaterial({ color: 0x09041a, roughness: 0.2 });
        const platform = new THREE.Mesh(geo, mat);
        platform.position.set(x, y, z);
        
        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x39ff14 }));
        platform.add(line);
        scene.add(platform);
        
        platform.userData = { halfW: 3, halfD: 3, halfH: 0.2 };
        platforms.push(platform);
        
        spawnBeacon(x, y + 0.6, z, i+1);
        spawnDrone(x, y + 3, z, 0.06, 0x00f0ff, 1500);
        spawnDrone(x+5, y + 5, z, 0.06, 0x00f0ff, 1500);
    }
}

// Mission 9: The Twins
function setupMission9() {
    objectives = [
        { type: 'boss', text: "Destroy Twin Cores", count: 0, target: 2, completed: false }
    ];
    
    function spawnBoss(x, z) {
        let core = new THREE.Group();
        core.position.set(x, 5, z);
        const cGeo = new THREE.DodecahedronGeometry(2.3, 0);
        const cMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });
        const mesh = new THREE.Mesh(cGeo, cMat);
        core.add(mesh);
        
        const edges = new THREE.EdgesGeometry(cGeo);
        const outline = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xff3333, linewidth: 2 }));
        core.add(outline);

        const sGeo = new THREE.BoxGeometry(0.4, 6.0, 4.0);
        const sMat = new THREE.MeshStandardMaterial({ color: 0x09031c, roughness: 0.1 });
        const sL = new THREE.Mesh(sGeo, sMat);
        sL.position.set(-3.5, 0, 0);
        const shieldLEdges = new THREE.EdgesGeometry(sGeo);
        const shieldLLines = new THREE.LineSegments(shieldLEdges, new THREE.LineBasicMaterial({ color: 0x00f0ff }));
        sL.add(shieldLLines);
        core.add(sL);
        
        const sR = new THREE.Mesh(sGeo, sMat);
        sR.position.set(3.5, 0, 0);
        const shieldREdges = new THREE.EdgesGeometry(sGeo);
        const shieldRLines = new THREE.LineSegments(shieldREdges, new THREE.LineBasicMaterial({ color: 0x00f0ff }));
        sR.add(shieldRLines);
        core.add(sR);
        
        scene.add(core);
        core.userData = { isBoss: true, health: 500, maxHealth: 500, lastAttack: Date.now(), attackInterval: 1800, shieldL: sL, shieldR: sR };
        bossCores.push(core);
    }
    spawnBoss(-15, -15);
    spawnBoss(15, 15);
}

// Mission 10: Aaryavaa's Wrath
function setupMission10() {
    objectives = [
        { type: 'drone', text: "Survive Drone Swarm", count: 0, target: 20, completed: false },
        { type: 'turret', text: "Destroy Defense Turrets", count: 0, target: 4, completed: false },
        { type: 'boss', text: "Purge the Core", count: 0, target: 1, completed: false }
    ];
    
    spawnTurret(-25, -25);
    spawnTurret(-25, 25);
    spawnTurret(25, -25);
    spawnTurret(25, 25);
    
    // Spawn one big core
    let core = new THREE.Group();
    core.position.set(0, 5, 0);
    const cGeo = new THREE.DodecahedronGeometry(3.5, 0);
    const cMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });
    const mesh = new THREE.Mesh(cGeo, cMat);
    core.add(mesh);
    
    const edges = new THREE.EdgesGeometry(cGeo);
    const outline = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xff3333, linewidth: 2 }));
    core.add(outline);

    const sGeo = new THREE.BoxGeometry(0.6, 8.0, 6.0);
    const sMat = new THREE.MeshStandardMaterial({ color: 0x09031c, roughness: 0.1 });
    const sL = new THREE.Mesh(sGeo, sMat);
    sL.position.set(-5.0, 0, 0);
    const shieldLEdges = new THREE.EdgesGeometry(sGeo);
    const shieldLLines = new THREE.LineSegments(shieldLEdges, new THREE.LineBasicMaterial({ color: 0x00f0ff }));
    sL.add(shieldLLines);
    core.add(sL);
    
    const sR = new THREE.Mesh(sGeo, sMat);
    sR.position.set(5.0, 0, 0);
    const shieldREdges = new THREE.EdgesGeometry(sGeo);
    const shieldRLines = new THREE.LineSegments(shieldREdges, new THREE.LineBasicMaterial({ color: 0x00f0ff }));
    sR.add(shieldRLines);
    core.add(sR);
    
    scene.add(core);
    core.userData = { isBoss: true, health: 1200, maxHealth: 1200, lastAttack: Date.now(), attackInterval: 1200, shieldL: sL, shieldR: sR };
    bossCores.push(core);
    
    for (let i = 0; i < 20; i++) {
        spawnDrone((Math.random() - 0.5) * 60, 2 + Math.random()*10, (Math.random() - 0.5) * 60, 0.05, 0xff0055, 2000);
    }
}
\`

// Note: Replace the closing \`});\` for load listener to place missions right before it
gameCode = gameCode.replace(/\\/\\/ Launch engine/, missionsCode + '\\n\\n// Launch engine');

fs.writeFileSync('game.js', gameCode);
