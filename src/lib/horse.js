import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// The horse is built like the real thing: planks, ribs, a cart and a hatch.
// It is a single shared scene; views move it around with `setPose`.

const TIMBER = '#c99a5b';

function woodTexture(seed, base = TIMBER, dark = '#8a5a2b') {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 512, 128);
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 46; i++) {
    const y = rnd() * 128;
    g.strokeStyle = dark; g.globalAlpha = 0.07 + rnd() * 0.16; g.lineWidth = 0.6 + rnd() * 1.8;
    g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= 512; x += 64) g.lineTo(x, y + Math.sin(x * 0.02 + rnd() * 3) * (2 + rnd() * 3));
    g.stroke();
  }
  g.globalAlpha = 0.18; g.fillStyle = dark;
  for (let i = 0; i < 2; i++) { // knots
    const kx = rnd() * 512, ky = 20 + rnd() * 88;
    g.beginPath(); g.ellipse(kx, ky, 10 + rnd() * 8, 4 + rnd() * 3, 0, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function meanderTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#1f4fe0'; g.fillRect(0, 0, 512, 128);
  g.strokeStyle = '#eef2ee'; g.lineWidth = 7; g.lineCap = 'square'; g.lineJoin = 'miter';
  const u = 16;
  for (let x = 0; x < 512; x += u * 4) { // Greek key
    g.beginPath();
    g.moveTo(x, 104); g.lineTo(x, 24); g.lineTo(x + u * 3, 24); g.lineTo(x + u * 3, 80);
    g.lineTo(x + u * 1, 80); g.lineTo(x + u * 1, 52); g.lineTo(x + u * 2, 52);
    g.stroke();
  }
  g.fillStyle = '#eef2ee'; g.fillRect(0, 112, 512, 6); g.fillRect(0, 10, 512, 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export function createHorse(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 4.2, 17);
  camera.lookAt(0, 2.7, 0);

  // Light
  scene.add(new THREE.HemisphereLight('#f4f8ff', '#b9c4b8', 1.15));
  const sun = new THREE.DirectionalLight('#fff3de', 2.6);
  sun.position.set(6, 11, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 });
  sun.shadow.bias = -0.0004; sun.shadow.radius = 5;
  scene.add(sun);
  const rim = new THREE.DirectionalLight('#6f94ff', 1.7);
  rim.position.set(-8, 5, -9);
  scene.add(rim);
  const hatchLight = new THREE.PointLight('#ff5a36', 0, 7, 1.6);
  hatchLight.position.set(0, 3.1, 0);
  scene.add(hatchLight);

  // Materials
  const woods = [1, 2, 3, 4].map((i) => {
    const t = woodTexture(i);
    t.repeat.set(0.9, 1);
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.82, metalness: 0 });
  });
  const wood = (i = 0) => woods[i % woods.length];
  const darkWood = new THREE.MeshStandardMaterial({ map: woodTexture(9, '#7b4e25', '#3f230c'), roughness: 0.9 });
  const mane = new THREE.MeshStandardMaterial({ color: '#0a1f3d', roughness: 0.7 });
  const blanketTex = meanderTexture();
  const blanket = new THREE.MeshStandardMaterial({ map: blanketTex, roughness: 0.8 });
  const blanketPlain = new THREE.MeshStandardMaterial({ color: '#1f4fe0', roughness: 0.8 });
  const bronze = new THREE.MeshStandardMaterial({ color: '#d9a441', roughness: 0.35, metalness: 0.75 });
  const glow = new THREE.MeshBasicMaterial({ color: '#ff7a4d' });
  const glowDeep = new THREE.MeshBasicMaterial({ color: '#7a1d08' });

  const rig = new THREE.Group(); // positioned by views
  const spin = new THREE.Group(); // rotates around Y
  const bob = new THREE.Group(); // idle bob / knock
  rig.add(spin); spin.add(bob);
  scene.add(rig);

  const box = (w, h, d, mat, r = 0.05) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.2, h / 2.2, d / 2.2)), mat);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  };
  const put = (parent, mesh, x, y, z, rx = 0, ry = 0, rz = 0) => {
    mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz); parent.add(mesh); return mesh;
  };

  // Cart
  const cart = new THREE.Group(); bob.add(cart);
  put(cart, box(4.6, 0.22, 2.0, darkWood, 0.06), 0, 0.74, 0);
  [-0.8, 0.8].forEach((z) => put(cart, box(4.7, 0.18, 0.16, darkWood, 0.05), 0, 0.58, z));
  const wheels = [];
  [[-1.5, 1.08], [1.5, 1.08], [-1.5, -1.08], [1.5, -1.08]].forEach(([x, z]) => {
    const w = new THREE.Group();
    const rimM = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.09, 10, 28), darkWood);
    rimM.castShadow = true; w.add(rimM);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 14), bronze);
    hub.rotation.x = Math.PI / 2; w.add(hub);
    for (let i = 0; i < 6; i++) {
      const sp = box(0.07, 0.86, 0.07, wood(i), 0.02);
      sp.rotation.z = (i / 6) * Math.PI; w.add(sp);
    }
    w.position.set(x, 0.5, z);
    cart.add(w); wheels.push(w);
  });
  [-1.5, 1.5].forEach((x) => {
    const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.3, 8), darkWood);
    ax.rotation.x = Math.PI / 2; ax.position.set(x, 0.5, 0); cart.add(ax);
  });

  // Legs: two segments each, set a little off-vertical so the stance reads as a horse
  const legs = new THREE.Group(); bob.add(legs);
  const leg = (x, z, lean, i) => {
    const g = new THREE.Group(); g.position.set(x, 0.85, z); g.rotation.z = lean;
    put(g, box(0.34, 1.05, 0.34, wood(i), 0.06), 0, 0.52, 0);
    put(g, box(0.22, 0.95, 0.22, wood(i + 1), 0.05), lean * -0.4, 1.4, 0);
    put(g, box(0.36, 0.16, 0.4, darkWood, 0.05), 0, 0.08, 0);
    legs.add(g);
  };
  leg(1.25, 0.46, -0.04, 0); leg(1.25, -0.46, -0.04, 1);
  leg(-1.2, 0.46, 0.06, 2); leg(-1.2, -0.46, 0.06, 3);

  // Body: stacked planks with a slight belly taper
  const body = new THREE.Group(); body.position.set(0, 3.25, 0); bob.add(body);
  const planks = 5, ph = 0.26;
  for (let i = 0; i < planks; i++) {
    const y = (i - (planks - 1) / 2) * (ph + 0.015);
    const taper = i === 0 ? 0.92 : i === planks - 1 ? 0.96 : 1;
    const p = box(3.3 * taper, ph, 1.16 * taper, wood(i), 0.05);
    put(body, p, (i % 2 ? 0.05 : -0.03), y, 0);
  }
  // ribs on both sides
  [-1.3, -0.65, 0, 0.65, 1.3].forEach((x, i) => {
    [0.6, -0.6].forEach((z) => put(body, box(0.12, 1.3, 0.07, darkWood, 0.02), x, 0, z));
  });
  // blanket over the back with meander on both flanks
  put(body, box(1.5, 0.08, 1.3, blanketPlain, 0.03), -0.15, 0.68, 0);
  [0.64, -0.64].forEach((z) => {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.3), blanket);
    f.position.set(-0.15, 0.5, z + (z > 0 ? 0.0 : 0)); f.rotation.y = z > 0 ? 0 : Math.PI;
    body.add(f);
  });

  // Chest + neck + head
  put(bob, box(1.0, 1.55, 1.1, wood(1), 0.08), 1.45, 3.45, 0);
  const neck = new THREE.Group(); neck.position.set(1.85, 4.1, 0); bob.add(neck);
  put(neck, box(0.78, 1.7, 0.7, wood(2), 0.1), 0.2, 0.55, 0, 0, 0, -0.42);
  for (let i = 0; i < 9; i++) { // mane runs down the back edge of the neck
    const t = i / 8;
    put(neck, box(0.2, 0.34, 0.14, mane, 0.04), 0.19 - 0.69 * t - 0.16 - (i % 2) * 0.05, 1.49 - 1.56 * t, 0, 0, 0, -0.42 + (i % 2 ? 0.14 : -0.08));
  }
  const head = new THREE.Group(); head.position.set(0.55, 1.3, 0); neck.add(head);
  head.rotation.z = -0.62;
  put(head, box(1.3, 0.62, 0.62, wood(3), 0.1), 0.55, 0, 0);
  put(head, box(0.62, 0.5, 0.5, wood(0), 0.09), 1.2, -0.06, 0);
  put(head, box(0.1, 0.16, 0.5, bronze, 0.03), 0.85, 0.0, 0); // bridle
  [0.34, -0.34].forEach((z) => {
    put(head, new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), new THREE.MeshStandardMaterial({ color: '#0a1f3d', roughness: 0.3 })), 0.75, 0.12, z);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.46, 4), wood(1)); ear.castShadow = true;
    put(head, ear, 0.1, 0.5, z * 0.7, 0, 0, 0.1);
    put(head, new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), mane), 1.46, 0.0, z * 0.45);
  });

  // Tail
  const tail = new THREE.Group(); tail.position.set(-1.7, 3.55, 0); bob.add(tail);
  for (let i = 0; i < 4; i++) put(tail, box(0.2, 0.62, 0.12, i % 2 ? mane : darkWood, 0.03), -0.08 * i - 0.08, -0.25 * i, 0, 0, 0, 0.35 + i * 0.12);

  // Hatch: a door on each flank, hinged at the top, hiding a glowing opening
  const hatches = [];
  [1, -1].forEach((side) => {
    const z = 0.6 * side;
    const frame = box(0.98, 1.02, 0.06, darkWood, 0.02);
    put(body, frame, 0.55, -0.12, z + 0.03 * side);
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.86), glowDeep);
    inner.position.set(0.55, -0.12, z + 0.065 * side); inner.rotation.y = side > 0 ? 0 : Math.PI;
    body.add(inner);
    const lit = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.86), glow);
    lit.position.set(0.55, -0.12, z + 0.068 * side); lit.rotation.y = side > 0 ? 0 : Math.PI;
    lit.material = new THREE.MeshBasicMaterial({ color: '#ff4a1c', transparent: true, opacity: 0, toneMapped: false });
    body.add(lit);
    const pivot = new THREE.Group(); pivot.position.set(0.55, 0.36, z + 0.1 * side);
    const door = box(0.84, 0.88, 0.07, wood(2), 0.03); door.position.set(0, -0.44, 0);
    const handle = box(0.12, 0.05, 0.05, bronze, 0.02); handle.position.set(0, -0.72, 0.05 * side);
    pivot.add(door, handle); body.add(pivot);
    hatches.push({ pivot, lit, side });
  });

  // Ground shadow catcher
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.22 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  rig.add(ground);

  // ─── State ───
  const pose = { x: 0, y: 0, s: 1, speed: 0.38, hatch: 0, tilt: 0 };
  const cur = { x: 0, y: 0, s: 1, hatch: 0, tilt: 0 };
  let angle = -0.7, vel = 0, dragging = false, lastX = 0, running = true, knock = 0, raf = 0, last = performance.now();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouse = { x: 0, y: 0 };

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the horse framed on tall/narrow screens
    camera.fov = w / h < 0.9 ? 42 : 30;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX / window.innerWidth - 0.5; mouse.y = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const k = 1 - Math.pow(0.0015, dt); // frame-rate independent ease
    for (const key of ['x', 'y', 's', 'hatch', 'tilt']) cur[key] += (pose[key] - cur[key]) * k;

    const base = reduced ? 0.0 : pose.speed;
    if (dragging) { vel *= 0.6; } else { vel += (base - vel) * (1 - Math.pow(0.12, dt)); }
    angle += vel * dt;
    spin.rotation.y = angle;
    wheels.forEach((w) => { w.rotation.z = -angle * 0.0; });

    knock = Math.max(0, knock - dt * 2.4);
    bob.position.y = Math.sin(now * 0.0015) * 0.04 + Math.sin(knock * Math.PI) * 0.12;
    bob.rotation.z = Math.sin(knock * Math.PI * 3) * 0.015 * knock;
    tail.rotation.z = Math.sin(now * 0.002) * 0.12;

    rig.position.set(cur.x, cur.y, 0);
    rig.scale.setScalar(cur.s);
    rig.rotation.x = cur.tilt + mouse.y * 0.06;
    rig.rotation.y = mouse.x * 0.18;

    const open = cur.hatch;
    hatches.forEach((h) => {
      h.pivot.rotation.x = -h.side * open * 1.35;
      h.lit.material.opacity = Math.min(1, open * 1.6);
    });
    hatchLight.intensity = open * 14;
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  return {
    setPose(p) { Object.assign(pose, p); },
    jump(p) { Object.assign(pose, p); Object.assign(cur, p); },
    pause() { running = false; },
    resume() { running = true; last = performance.now(); },
    drag: {
      start(x) { dragging = true; lastX = x; },
      move(x) { if (!dragging) return; const d = x - lastX; lastX = x; angle += d * 0.011; vel = d * 0.011 * 60; },
      end() { dragging = false; },
    },
    knock() { knock = 1; },
    get angle() { return angle; },
    dispose() { cancelAnimationFrame(raf); renderer.dispose(); },
  };
}
