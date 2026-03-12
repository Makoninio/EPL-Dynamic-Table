import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.174.0/examples/jsm/controls/OrbitControls.js';

// -----------------------------------------------------------------------------
// UI refs
// -----------------------------------------------------------------------------
const ui = {
  mwValue: document.getElementById('mw-value'),
  slider: document.getElementById('mw-slider'),
  playButton: document.getElementById('play-btn'),
  clubName: document.getElementById('club-name'),
  clubShort: document.getElementById('club-short'),
  clubPos: document.getElementById('club-pos'),
  clubPoints: document.getElementById('club-points'),
  clubGd: document.getElementById('club-gd'),
  clubGs: document.getElementById('club-gs'),
  clubForm: document.getElementById('club-form'),
};

// -----------------------------------------------------------------------------
// Mock EPL data (replace this block with API data later)
// -----------------------------------------------------------------------------
const BASE_CLUBS = [
  { name: 'Manchester City', shortName: 'MCI', points: 91, goalDifference: 54, goalsScored: 96, form: 'WWWDW', position: 1, primaryColor: '#6CABDD' },
  { name: 'Arsenal', shortName: 'ARS', points: 88, goalDifference: 51, goalsScored: 91, form: 'WWWWW', position: 2, primaryColor: '#EF0107' },
  { name: 'Liverpool', shortName: 'LIV', points: 82, goalDifference: 45, goalsScored: 89, form: 'WWDLW', position: 3, primaryColor: '#C8102E' },
  { name: 'Aston Villa', shortName: 'AVL', points: 73, goalDifference: 18, goalsScored: 77, form: 'WDWLW', position: 4, primaryColor: '#95BFE5' },
  { name: 'Tottenham', shortName: 'TOT', points: 67, goalDifference: 13, goalsScored: 74, form: 'WLWDW', position: 5, primaryColor: '#132257' },
  { name: 'Chelsea', shortName: 'CHE', points: 65, goalDifference: 14, goalsScored: 78, form: 'WWLWW', position: 6, primaryColor: '#034694' },
  { name: 'Newcastle', shortName: 'NEW', points: 60, goalDifference: 18, goalsScored: 80, form: 'LWWDW', position: 7, primaryColor: '#241F20' },
  { name: 'Manchester United', shortName: 'MUN', points: 57, goalDifference: -1, goalsScored: 57, form: 'WLDWL', position: 8, primaryColor: '#DA291C' },
  { name: 'West Ham', shortName: 'WHU', points: 52, goalDifference: -12, goalsScored: 60, form: 'LDWLW', position: 9, primaryColor: '#7A263A' },
  { name: 'Brighton', shortName: 'BHA', points: 50, goalDifference: -8, goalsScored: 58, form: 'DDLWW', position: 10, primaryColor: '#0057B8' },
  { name: 'Bournemouth', shortName: 'BOU', points: 48, goalDifference: -9, goalsScored: 54, form: 'WLDDW', position: 11, primaryColor: '#DA291C' },
  { name: 'Crystal Palace', shortName: 'CRY', points: 46, goalDifference: -6, goalsScored: 49, form: 'WWDLD', position: 12, primaryColor: '#1B458F' },
  { name: 'Fulham', shortName: 'FUL', points: 45, goalDifference: -10, goalsScored: 52, form: 'LDWWW', position: 13, primaryColor: '#111111' },
  { name: 'Wolves', shortName: 'WOL', points: 44, goalDifference: -14, goalsScored: 50, form: 'LWDDL', position: 14, primaryColor: '#FDB913' },
  { name: 'Everton', shortName: 'EVE', points: 42, goalDifference: -16, goalsScored: 43, form: 'DWLLW', position: 15, primaryColor: '#003399' },
  { name: 'Brentford', shortName: 'BRE', points: 40, goalDifference: -12, goalsScored: 56, form: 'LWLDL', position: 16, primaryColor: '#E30613' },
  { name: 'Nottingham Forest', shortName: 'NFO', points: 37, goalDifference: -20, goalsScored: 44, form: 'DDWLL', position: 17, primaryColor: '#DD0000' },
  { name: 'Luton Town', shortName: 'LUT', points: 31, goalDifference: -28, goalsScored: 47, form: 'LDLLD', position: 18, primaryColor: '#FF5A00' },
  { name: 'Burnley', shortName: 'BUR', points: 25, goalDifference: -35, goalsScored: 41, form: 'LLDWL', position: 19, primaryColor: '#6C1D45' },
  { name: 'Sheffield United', shortName: 'SHU', points: 18, goalDifference: -52, goalsScored: 35, form: 'LLLLD', position: 20, primaryColor: '#EE2737' },
];

// -----------------------------------------------------------------------------
// Core setup
// -----------------------------------------------------------------------------
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#090615');
scene.fog = new THREE.FogExp2('#0b0917', 0.0064);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 900);
camera.position.set(84, 66, 96);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 12, 0);
controls.minDistance = 32;
controls.maxDistance = 190;
controls.maxPolarAngle = Math.PI * 0.48;

// Bloom hook (optional later): add EffectComposer + UnrealBloomPass after renderer setup.

// -----------------------------------------------------------------------------
// Lighting
// -----------------------------------------------------------------------------
scene.add(new THREE.AmbientLight('#7b74cc', 0.65));

const moonLight = new THREE.DirectionalLight('#8bbdff', 1.0);
moonLight.position.set(58, 88, 28);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(2048, 2048);
moonLight.shadow.camera.near = 10;
moonLight.shadow.camera.far = 260;
moonLight.shadow.camera.left = -110;
moonLight.shadow.camera.right = 110;
moonLight.shadow.camera.top = 110;
moonLight.shadow.camera.bottom = -110;
scene.add(moonLight);

const magentaFill = new THREE.PointLight('#ff4cd7', 0.75, 280, 2);
magentaFill.position.set(-42, 24, -20);
scene.add(magentaFill);

const cyanFill = new THREE.PointLight('#48ddff', 0.85, 290, 2);
cyanFill.position.set(62, 20, 34);
scene.add(cyanFill);

// -----------------------------------------------------------------------------
// Environment
// -----------------------------------------------------------------------------
function createGround() {
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(124, 134, 6, 40),
    new THREE.MeshStandardMaterial({
      color: '#100a22',
      roughness: 0.9,
      metalness: 0.07,
      emissive: '#120f24',
      emissiveIntensity: 0.35,
    }),
  );
  base.position.y = -3;
  base.receiveShadow = true;
  scene.add(base);

  const ringGroup = new THREE.Group();
  scene.add(ringGroup);

  [24, 42, 62, 84].forEach((r, idx) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(r - 0.34, r + 0.34, 128),
      new THREE.MeshBasicMaterial({
        color: idx === 0 ? '#7af0ff' : '#7f78b8',
        transparent: true,
        opacity: idx === 0 ? 0.34 : 0.17,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03 + idx * 0.01;
    ringGroup.add(ring);
  });

  const lane = new THREE.Mesh(
    new THREE.RingGeometry(92, 93.2, 96),
    new THREE.MeshBasicMaterial({ color: '#ff4dd4', transparent: true, opacity: 0.17, side: THREE.DoubleSide }),
  );
  lane.rotation.x = -Math.PI / 2;
  lane.position.y = 0.01;
  ringGroup.add(lane);
}

function createEnergyCore() {
  const core = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.IcosahedronGeometry(7, 1),
    new THREE.MeshStandardMaterial({
      color: '#1e0f39',
      emissive: '#49deff',
      emissiveIntensity: 0.54,
      roughness: 0.25,
      metalness: 0.42,
    }),
  );
  body.position.y = 8;
  core.add(body);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(11, 0.36, 16, 100),
    new THREE.MeshBasicMaterial({ color: '#7be9ff', transparent: true, opacity: 0.5 }),
  );
  halo.position.y = 7.7;
  halo.rotation.x = Math.PI / 2;
  core.add(halo);

  const glow = new THREE.PointLight('#64eeff', 1.15, 76, 2);
  glow.position.set(0, 8, 0);
  core.add(glow);

  core.userData = { body, halo };
  scene.add(core);
  return core;
}

function createDistantSkyline() {
  const skyline = new THREE.Group();
  const rng = mulberry32(39);

  for (let i = 0; i < 180; i += 1) {
    const angle = rng() * Math.PI * 2;
    const radius = 118 + rng() * 110;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const h = 8 + rng() * 44;
    const w = 2.2 + rng() * 5;

    const b = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, w),
      new THREE.MeshStandardMaterial({
        color: '#110e23',
        emissive: '#1a1f45',
        emissiveIntensity: 0.24 + rng() * 0.18,
        roughness: 0.88,
        metalness: 0.05,
      }),
    );
    b.position.set(x, h / 2 - 0.3, z);
    skyline.add(b);
  }

  scene.add(skyline);
}

function createStars() {
  const count = 1400;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const c1 = new THREE.Color('#b3c5ff');
  const c2 = new THREE.Color('#8cf0ff');
  const rng = mulberry32(123);

  for (let i = 0; i < count; i += 1) {
    const r = 220 + rng() * 280;
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(1 - 2 * rng()) * 0.58;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = Math.abs(r * Math.cos(phi)) + 20;
    const z = r * Math.sin(phi) * Math.sin(theta);

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const col = c1.clone().lerp(c2, rng());
    colors[i * 3 + 0] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.9,
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const stars = new THREE.Points(geo, mat);
  scene.add(stars);
}

function createParticles() {
  const count = 230;
  const positions = new Float32Array(count * 3);
  const rng = mulberry32(88);

  for (let i = 0; i < count; i += 1) {
    const radius = 12 + rng() * 86;
    const angle = rng() * Math.PI * 2;
    positions[i * 3 + 0] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = 3 + rng() * 22;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: '#90eeff',
    size: 0.2,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  points.userData = { basePositions: positions.slice() };
  scene.add(points);
  return points;
}

// -----------------------------------------------------------------------------
// District layout
// -----------------------------------------------------------------------------
function districtForPosition(pos) {
  if (pos <= 4) return 'title';
  if (pos <= 8) return 'europe';
  if (pos <= 17) return 'mid';
  return 'relegation';
}

function districtPosition(club) {
  const pos = club.position;

  if (pos <= 4) {
    const idx = pos - 1;
    const angles = [0.2, 1.8, 3.4, 5.0];
    const r = 18;
    return { x: Math.cos(angles[idx]) * r, z: Math.sin(angles[idx]) * r };
  }

  if (pos <= 8) {
    const idx = pos - 5;
    const angle = -0.5 + idx * (Math.PI / 2.1);
    const r = 34;
    return { x: Math.cos(angle) * r, z: Math.sin(angle) * r };
  }

  if (pos <= 17) {
    const idx = pos - 9;
    const ringCount = 9;
    const angle = -1.2 + (idx / ringCount) * Math.PI * 1.8;
    const r = 52 + ((idx % 2) * 4 - 2);
    return { x: Math.cos(angle) * r, z: Math.sin(angle) * r };
  }

  const idx = pos - 18;
  const angles = [2.6, 3.1, 3.6];
  const r = 76;
  return { x: Math.cos(angles[idx]) * r, z: Math.sin(angles[idx]) * r };
}

// -----------------------------------------------------------------------------
// Tower generation
// -----------------------------------------------------------------------------
const towers = [];
const towerGroup = new THREE.Group();
scene.add(towerGroup);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredTower = null;
let selectedTower = null;

const focusState = {
  current: controls.target.clone(),
  destination: controls.target.clone(),
  velocity: new THREE.Vector3(),
  active: false,
};

BASE_CLUBS.slice()
  .sort((a, b) => a.position - b.position)
  .forEach((club, index) => {
    const pos = districtPosition(club);
    const district = districtForPosition(club.position);
    const accent = new THREE.Color(club.primaryColor);
    const baseScale = mapGoalDiffToFootprint(club.goalDifference);
    const silhouetteType = index % 4;

    const group = new THREE.Group();
    group.position.set(pos.x, 0, pos.z);

    const podium = new THREE.Mesh(
      new THREE.CylinderGeometry(baseScale * 0.92, baseScale * 1.08, 2.8, 6),
      new THREE.MeshStandardMaterial({
        color: '#1a1433',
        emissive: accent.clone().multiplyScalar(0.16),
        emissiveIntensity: district === 'relegation' ? 0.2 : 0.34,
        roughness: 0.72,
        metalness: 0.25,
      }),
    );
    podium.position.y = 1.4;
    podium.castShadow = true;
    podium.receiveShadow = true;
    group.add(podium);

    const towerMat = new THREE.MeshStandardMaterial({
      color: '#1b1634',
      emissive: accent.clone().multiplyScalar(0.2),
      emissiveIntensity: 0.38,
      roughness: 0.54,
      metalness: 0.42,
    });

    const towerMesh = createTowerBody(silhouetteType, baseScale, towerMat);
    towerMesh.position.y = 3.2;
    towerMesh.castShadow = true;
    towerMesh.receiveShadow = true;
    group.add(towerMesh);

    const windowBand = new THREE.Mesh(
      new THREE.BoxGeometry(baseScale * 1.08, 0.45, baseScale * 1.08),
      new THREE.MeshStandardMaterial({
        color: '#243255',
        emissive: accent.clone().lerp(new THREE.Color('#5ee7ff'), 0.5),
        emissiveIntensity: 0.68,
        roughness: 0.24,
        metalness: 0.42,
      }),
    );
    windowBand.position.y = 8;
    group.add(windowBand);

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 8, 8),
      new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 1.5,
        roughness: 0.1,
        metalness: 0.9,
      }),
    );
    beacon.position.y = 12;
    group.add(beacon);

    const beaconLight = new THREE.PointLight(accent, 0.8, 34, 2);
    beaconLight.position.copy(beacon.position);
    group.add(beaconLight);

    const plate = new THREE.Mesh(
      new THREE.RingGeometry(baseScale * 1.1, baseScale * 1.24, 36),
      new THREE.MeshBasicMaterial({
        color: accent.clone().lerp(new THREE.Color('#5ee7ff'), 0.35),
        transparent: true,
        opacity: 0.36,
        side: THREE.DoubleSide,
      }),
    );
    plate.rotation.x = -Math.PI / 2;
    plate.position.y = 0.08;
    group.add(plate);

    if (club.position <= 6) {
      const label = createLabelSprite(`#${club.position} ${club.shortName}`, accent.getStyle());
      label.position.set(0, 14, 0);
      group.add(label);
      group.userData.label = label;
    }

    group.userData = {
      ...group.userData,
      club,
      district,
      accent,
      baseScale,
      towerMesh,
      towerMat,
      beacon,
      beaconLight,
      windowBand,
      plate,
      currentHeight: 10,
      targetHeight: 10,
      currentGlow: 0.8,
      targetGlow: 0.8,
      pulsePhase: index * 0.45,
      pulseSpeed: formToPulseSpeed(club.form),
    };

    towerGroup.add(group);
    towers.push(group);
  });

// -----------------------------------------------------------------------------
// Data-to-visual mapping + matchweek progression
// -----------------------------------------------------------------------------
let currentMatchweek = 1;
let playMode = false;
let weekAccumulator = 0;

function computeWeekStats(club, week) {
  // Replace this function with real per-matchweek API values later.
  const t = (week - 1) / 37;
  const momentum = (21 - club.position) / 20;
  const baseSwing = Math.sin(t * Math.PI * 2 + club.position * 0.55) * 0.11;
  const surge = Math.sin((t * Math.PI * 4 + club.points * 0.02) * 0.9) * 0.06;

  const points = Math.max(10, club.points * (0.52 + t * 0.48) + (momentum - 0.5) * 4 + (baseSwing + surge) * 6);
  const gd = club.goalDifference * (0.55 + t * 0.45) + baseSwing * 5;
  const goals = club.goalsScored * (0.57 + t * 0.43) + Math.max(0, surge * 10);

  return {
    points,
    goalDifference: gd,
    goalsScored: goals,
    form: mockFormForWeek(club.form, week, club.position),
  };
}

function applyMatchweek(week) {
  currentMatchweek = week;
  ui.mwValue.textContent = String(week);

  towers.forEach((tower) => {
    const { club } = tower.userData;
    const weekStats = computeWeekStats(club, week);

    tower.userData.weekStats = weekStats;
    tower.userData.targetHeight = mapPointsToHeight(weekStats.points);
    tower.userData.targetGlow = mapGoalsToGlow(weekStats.goalsScored);
    tower.userData.targetScale = mapGoalDiffToFootprint(weekStats.goalDifference);
    tower.userData.pulseSpeed = formToPulseSpeed(weekStats.form);
  });

  if (selectedTower) updateClubCard(selectedTower.userData.club, selectedTower.userData.weekStats);
}

applyMatchweek(1);

// -----------------------------------------------------------------------------
// Interaction
// -----------------------------------------------------------------------------
renderer.domElement.addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

renderer.domElement.addEventListener('click', () => {
  const picked = pickTower();
  if (!picked) return;

  selectedTower = picked;
  updateClubCard(picked.userData.club, picked.userData.weekStats);
  focusClub(picked);
});

ui.slider.addEventListener('input', (event) => {
  const week = Number(event.target.value);
  playMode = false;
  ui.playButton.textContent = 'Play Season';
  applyMatchweek(week);
});

ui.playButton.addEventListener('click', () => {
  playMode = !playMode;
  ui.playButton.textContent = playMode ? 'Pause' : 'Play Season';
});

function pickTower() {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(towers, true);
  if (!intersects.length) return null;

  let node = intersects[0].object;
  while (node && !towers.includes(node)) node = node.parent;
  return node || null;
}

function focusClub(tower) {
  focusState.destination.copy(tower.position).setY(8);
  focusState.active = true;
}

function setHoveredTower(nextHover) {
  if (hoveredTower === nextHover) return;

  if (hoveredTower && hoveredTower !== selectedTower) {
    hoveredTower.userData.towerMat.emissiveIntensity = 0.38;
  }

  hoveredTower = nextHover;

  if (hoveredTower && hoveredTower !== selectedTower) {
    hoveredTower.userData.towerMat.emissiveIntensity = 0.7;
  }
}

function updateClubCard(club, weekStats) {
  ui.clubName.textContent = club.name;
  ui.clubShort.textContent = club.shortName;
  ui.clubPos.textContent = `Pos ${club.position}`;
  ui.clubPoints.textContent = Math.round(weekStats.points).toString();
  ui.clubGd.textContent = Math.round(weekStats.goalDifference).toString();
  ui.clubGs.textContent = Math.round(weekStats.goalsScored).toString();
  ui.clubForm.textContent = weekStats.form;
}

// -----------------------------------------------------------------------------
// Animation
// -----------------------------------------------------------------------------
const clock = new THREE.Clock();
const energyCore = createEnergyCore();
const particles = createParticles();
createGround();
createDistantSkyline();
createStars();

function animate() {
  const dt = Math.min(0.05, clock.getDelta());
  const elapsed = clock.elapsedTime;

  requestAnimationFrame(animate);

  if (playMode) {
    weekAccumulator += dt;
    if (weekAccumulator > 1.1) {
      weekAccumulator = 0;
      const nextWeek = currentMatchweek >= 38 ? 1 : currentMatchweek + 1;
      ui.slider.value = String(nextWeek);
      applyMatchweek(nextWeek);
    }
  }

  const picked = pickTower();
  setHoveredTower(picked);

  towers.forEach((tower) => {
    const d = tower.userData;

    d.currentHeight = THREE.MathUtils.lerp(d.currentHeight, d.targetHeight, 0.08);
    d.currentGlow = THREE.MathUtils.lerp(d.currentGlow, d.targetGlow, 0.08);
    d.baseScale = THREE.MathUtils.lerp(d.baseScale, d.targetScale || d.baseScale, 0.07);

    const pulse = Math.sin(elapsed * d.pulseSpeed + d.pulsePhase) * 0.5 + 0.5;

    d.towerMesh.scale.y = Math.max(0.2, d.currentHeight / 12);
    d.towerMesh.scale.x = d.baseScale;
    d.towerMesh.scale.z = d.baseScale;

    d.windowBand.position.y = d.currentHeight * 0.62;
    d.beacon.position.y = d.currentHeight + 2.1;
    d.beaconLight.position.y = d.currentHeight + 2.1;

    const selectedBoost = selectedTower === tower ? 0.42 : hoveredTower === tower ? 0.22 : 0;
    d.towerMat.emissiveIntensity = d.currentGlow * (0.35 + pulse * 0.22) + selectedBoost;

    d.beacon.material.emissiveIntensity = d.currentGlow * 1.5 + pulse * 0.6 + selectedBoost;
    d.beaconLight.intensity = d.currentGlow * 0.8 + pulse * 0.3 + selectedBoost;
    d.windowBand.material.emissiveIntensity = 0.45 + pulse * 0.35 + selectedBoost;

    d.plate.material.opacity = 0.2 + pulse * 0.2 + selectedBoost * 0.25;

    if (d.label) d.label.position.y = d.currentHeight + 4;
  });

  animateFocus(dt);
  animateCore(energyCore, elapsed);
  animateParticles(particles, elapsed);

  controls.update();
  renderer.render(scene, camera);
}

animate();

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------
function animateFocus(dt) {
  if (!focusState.active) return;

  focusState.current.lerp(focusState.destination, 1 - Math.exp(-8 * dt));
  controls.target.copy(focusState.current);

  if (focusState.current.distanceTo(focusState.destination) < 0.08) {
    controls.target.copy(focusState.destination);
    focusState.active = false;
  }
}

function animateCore(core, elapsed) {
  core.rotation.y += 0.0025;
  core.userData.body.position.y = 8 + Math.sin(elapsed * 1.2) * 0.9;
  core.userData.halo.rotation.z = elapsed * 0.25;
}

function animateParticles(points, elapsed) {
  const posAttr = points.geometry.getAttribute('position');
  const base = points.userData.basePositions;

  for (let i = 0; i < posAttr.count; i += 1) {
    const ix = i * 3;
    const bx = base[ix + 0];
    const by = base[ix + 1];
    const bz = base[ix + 2];

    const wave = Math.sin(elapsed * 0.4 + i * 0.2) * 0.6;
    posAttr.array[ix + 0] = bx + Math.cos(elapsed * 0.2 + i) * 0.18;
    posAttr.array[ix + 1] = by + wave;
    posAttr.array[ix + 2] = bz + Math.sin(elapsed * 0.15 + i * 0.7) * 0.16;
  }

  posAttr.needsUpdate = true;
}

function createTowerBody(type, scale, material) {
  const group = new THREE.Group();

  if (type === 0) {
    const a = new THREE.Mesh(new THREE.BoxGeometry(1.5 * scale, 8.8, 1.5 * scale), material);
    a.position.y = 4.4;
    group.add(a);

    const b = new THREE.Mesh(new THREE.BoxGeometry(1.0 * scale, 4.2, 1.0 * scale), material);
    b.position.y = 9.8;
    group.add(b);
  } else if (type === 1) {
    const a = new THREE.Mesh(new THREE.CylinderGeometry(0.95 * scale, 1.34 * scale, 8.2, 6), material);
    a.position.y = 4.1;
    group.add(a);

    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.58 * scale, 0.9 * scale, 4.6, 6), material);
    b.position.y = 9.8;
    group.add(b);
  } else if (type === 2) {
    const a = new THREE.Mesh(new THREE.BoxGeometry(1.7 * scale, 7.2, 1.1 * scale), material);
    a.position.y = 3.6;
    group.add(a);

    const b = new THREE.Mesh(new THREE.BoxGeometry(1.1 * scale, 5, 1.6 * scale), material);
    b.position.y = 8.9;
    group.add(b);
  } else {
    const a = new THREE.Mesh(new THREE.OctahedronGeometry(1.15 * scale, 0), material);
    a.position.y = 4.4;
    a.scale.y = 4;
    group.add(a);

    const b = new THREE.Mesh(new THREE.BoxGeometry(0.95 * scale, 4.1, 0.95 * scale), material);
    b.position.y = 9.6;
    group.add(b);
  }

  return group;
}

function createLabelSprite(text, accent) {
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = 'rgba(7,9,21,0.72)';
  roundRect(ctx, 64, 200, 384, 122, 28);
  ctx.fill();

  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  roundRect(ctx, 64, 200, 384, 122, 28);
  ctx.stroke();

  ctx.font = '700 58px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f4f8ff';
  ctx.fillText(text, size / 2, 260);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(9.5, 3.6, 1);
  return sprite;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function formToPulseSpeed(form) {
  const score = form
    .split('')
    .reduce((acc, ch) => acc + (ch === 'W' ? 1 : ch === 'D' ? 0.35 : -0.25), 0);
  return 0.8 + THREE.MathUtils.clamp(score, -1.8, 3.8) * 0.22;
}

function mapPointsToHeight(points) {
  return THREE.MathUtils.mapLinear(points, 12, 98, 8, 46);
}

function mapGoalDiffToFootprint(gd) {
  return THREE.MathUtils.clamp(0.8 + (gd + 35) / 120, 0.7, 1.95);
}

function mapGoalsToGlow(goals) {
  return THREE.MathUtils.mapLinear(goals, 32, 100, 0.55, 1.4);
}

function mockFormForWeek(baseForm, week, position) {
  const symbols = ['W', 'D', 'L'];
  const bias = (21 - position) / 20;
  let out = '';

  for (let i = 0; i < 5; i += 1) {
    const seeded = pseudoRand(position * 17 + week * 7 + i * 3);
    const roll = seeded + bias * 0.18;
    if (roll > 0.62) out += symbols[0];
    else if (roll > 0.37) out += symbols[1];
    else out += symbols[2];
  }

  if (week < 4) return baseForm;
  return out;
}

function pseudoRand(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

function mulberry32(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let a = t;
    a = Math.imul(a ^ (a >>> 15), a | 1);
    a ^= a + Math.imul(a ^ (a >>> 7), a | 61);
    return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
  };
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
