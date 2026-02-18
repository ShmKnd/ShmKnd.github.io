/* ── three-bg.js ──
   Three.js twisted ribbon background animation.
   Depends on: Three.js (r128) loaded before this file.
*/
(function () {
  const container = document.getElementById('three-bg');
  const scene = new THREE.Scene();

  // ===== Tuning parameters (for quick T&E) =====
  const TUNE = {
    ribbonCount: 5,
    accelerationFactorCoeff: 0.001,
    wrinkleFrequency: 0.7,
    wrinkleAmplitude: 0.8,
    lightWiggleTimeCoeff: 1.0,
  };

  function makeBackgroundTexture() {
    const bg = document.createElement('canvas');
    bg.width = 512;
    bg.height = 512;
    const g = bg.getContext('2d');

    // Clear cool-white gradient for spatial depth
    const base = g.createLinearGradient(0, 0, 512, 512);
    base.addColorStop(0, '#ffffff');
    base.addColorStop(0.45, '#edf3fb');
    base.addColorStop(1, '#dce6f2');
    g.fillStyle = base;
    g.fillRect(0, 0, 512, 512);

    // Airy bloom in upper-right
    const bloom = g.createRadialGradient(390, 110, 20, 390, 110, 260);
    bloom.addColorStop(0, 'rgba(198,218,244,0.46)');
    bloom.addColorStop(0.45, 'rgba(198,218,244,0.22)');
    bloom.addColorStop(1, 'rgba(212,226,245,0.0)');
    g.fillStyle = bloom;
    g.fillRect(0, 0, 512, 512);

    // Cool depth from lower-left
    const depth = g.createRadialGradient(110, 430, 40, 110, 430, 310);
    depth.addColorStop(0, 'rgba(166,191,224,0.40)');
    depth.addColorStop(0.5, 'rgba(166,191,224,0.18)');
    depth.addColorStop(1, 'rgba(184,204,228,0.0)');
    g.fillStyle = depth;
    g.fillRect(0, 0, 512, 512);

    // Gentle vertical depth haze
    const haze = g.createLinearGradient(0, 0, 0, 512);
    haze.addColorStop(0, 'rgba(255,255,255,0.0)');
    haze.addColorStop(0.62, 'rgba(208,222,241,0.10)');
    haze.addColorStop(1, 'rgba(188,206,230,0.18)');
    g.fillStyle = haze;
    g.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(bg);
    tex.encoding = THREE.sRGBEncoding;
    tex.needsUpdate = true;
    return tex;
  }

  scene.background = makeBackgroundTexture();

  const isIPhone = /iPhone|iPod/.test(navigator.userAgent);
  let stableViewportWidth = Math.max(1, Math.round(document.documentElement.clientWidth || window.innerWidth));
  let stableViewportHeight = Math.max(1, Math.round((window.visualViewport && window.visualViewport.height) || window.innerHeight));

  function getViewportSize() {
    if (isIPhone) {
      return {
        // Keep iOS viewport stable during scroll to avoid UI-bar/scrollbar jitter
        width: stableViewportWidth,
        height: stableViewportHeight,
      };
    }
    return {
      width: Math.max(1, window.innerWidth),
      height: Math.max(1, window.innerHeight),
    };
  }
  let viewportSize = getViewportSize();

  const camera = new THREE.PerspectiveCamera(25, viewportSize.width / viewportSize.height, 0.1, 1000);
  camera.position.z = 12;
  camera.position.x = 0;
  camera.position.y = 0;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.setSize(viewportSize.width, viewportSize.height, false);
  const pixelRatioCap = isIPhone ? 1.25 : 1.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0xffffff, 1);
  renderer.sortObjects = true;
  container.appendChild(renderer.domElement);

  // Lightweight procedural environment cube texture (EnvLight-like source)
  function makeFace(fill, glowX, glowY, glowR) {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, fill.top);
    grad.addColorStop(1, fill.bottom);
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);

    const glow = g.createRadialGradient(glowX * 0.5, glowY * 0.5, 4, glowX * 0.5, glowY * 0.5, glowR * 0.5);
    glow.addColorStop(0, 'rgba(255,255,255,0.95)');
    glow.addColorStop(0.35, 'rgba(220,236,255,0.45)');
    glow.addColorStop(1, 'rgba(200,220,255,0.0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, 128, 128);
    return c;
  }

  const envCube = new THREE.CubeTexture([
    makeFace({ top: '#d6e1ef', bottom: '#f4f8fc' }, 96, 110, 120),   // +X
    makeFace({ top: '#d1deec', bottom: '#f2f7fc' }, 160, 96, 120),   // -X
    makeFace({ top: '#ffffff', bottom: '#e6eef8' }, 128, 128, 170),  // +Y
    makeFace({ top: '#c7d5e6', bottom: '#dbe5f2' }, 128, 150, 130),  // -Y
    makeFace({ top: '#dce7f4', bottom: '#f7fbff' }, 120, 120, 120),  // +Z
    makeFace({ top: '#cedceb', bottom: '#eff5fc' }, 148, 132, 120),  // -Z
  ]);
  envCube.needsUpdate = true;

  // Create twisted ribbon surfaces
  const ribbons = [];
  const ribbonCount = TUNE.ribbonCount;
  const ribbonGroup = new THREE.Group();
  scene.add(ribbonGroup);

  function createTwistedRibbon(width, length, twists, segments) {
    const geometry = new THREE.BufferGeometry();
    const segmentsX = segments;
    const segmentsY = Math.floor(segments * 0.4);

    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= segmentsX; i++) {
      const t = i / segmentsX;
      const x = (t - 0.5) * length;
      const angle = t * Math.PI * twists;

      for (let j = 0; j <= segmentsY; j++) {
        const s = (j / segmentsY - 0.5) * width;

        // Twisted ribbon coordinates
        const y = s * Math.cos(angle);
        const z = s * Math.sin(angle);

        vertices.push(x, y, z);

        // Normal calculation
        const nx = 0;
        const ny = -Math.sin(angle);
        const nz = Math.cos(angle);
        normals.push(nx, ny, nz);

        uvs.push(t, j / segmentsY);
      }
    }

    for (let i = 0; i < segmentsX; i++) {
      for (let j = 0; j < segmentsY; j++) {
        const a = i * (segmentsY + 1) + j;
        const b = a + segmentsY + 1;
        const c = a + 1;
        const d = b + 1;

        indices.push(a, b, c);
        indices.push(c, b, d);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    return geometry;
  }

  // Shader for twisted fabric
  const vertexShader = `
    uniform float uTime;
    uniform float uOffset;
    uniform float uTwistSpeed;
    uniform float uWaveAmp;
    uniform float uRandomSeed;
    uniform float uMouseVelocity;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying float vDepth;

    // Simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vec3 pos = position;

      // Dynamic twist animation with randomized speed
      float twistPhase = uTime * uTwistSpeed * uRandomSeed + uOffset;
      float twistAmount = sin(pos.x * 0.3 * uRandomSeed + twistPhase) * 0.6;

      // Apply additional twist
      float angle = twistAmount;
      float cosA = cos(angle);
      float sinA = sin(angle);
      vec3 twisted = vec3(
        pos.x,
        pos.y * cosA - pos.z * sinA,
        pos.y * sinA + pos.z * cosA
      );

      // Wind amount controlled by mouse velocity
      float windStrength = 1.0 + uMouseVelocity * 4.0;

      // Wave deformation with wind-controlled amplitude (smoothed)
      float wave1 = snoise(vec3(twisted.x * 0.15 * uRandomSeed, twisted.y * 0.25, uTime * 0.12 * uRandomSeed + uOffset)) * uWaveAmp * windStrength;
      float wave2 = snoise(vec3(twisted.x * 0.25, twisted.z * 0.18, uTime * 0.08 * uRandomSeed + uOffset + 50.0)) * uWaveAmp * 0.6 * windStrength;
      float wave3 = snoise(vec3(twisted.y * 0.3, twisted.x * 0.12, uTime * 0.06 + uOffset * uRandomSeed)) * uWaveAmp * 0.3 * windStrength;

      // Soft wrinkles: sin() rounds off sharp noise peaks into smooth folds
      float rawW1 = snoise(vec3(twisted.x * ${1.25 * TUNE.wrinkleFrequency} + uOffset, twisted.y * ${2.2 * TUNE.wrinkleFrequency} * uRandomSeed, uTime * 0.18 + 140.0));
      float rawW2 = snoise(vec3(twisted.x * ${1.8 * TUNE.wrinkleFrequency} * uRandomSeed, twisted.z * ${2.8 * TUNE.wrinkleFrequency} + uOffset, uTime * 0.22 + 280.0));
      float wrinkle1 = sin(rawW1 * 3.14159) * uWaveAmp * ${0.16 * TUNE.wrinkleAmplitude} * windStrength;
      float wrinkle2 = sin(rawW2 * 3.14159) * uWaveAmp * ${0.11 * TUNE.wrinkleAmplitude} * windStrength;

      twisted.y += wave1 + wave3 + wrinkle1;
      twisted.z += wave2 + wrinkle2;

      // Subtle flowing motion (not affected by mouse)
      twisted.x += sin(uTime * 0.08 * uRandomSeed + uOffset) * 0.2;
      twisted.y += cos(uTime * 0.05 * uRandomSeed + uOffset * 0.5) * 0.1;

      vUv = uv;
      vNormal = normalMatrix * normal;
      vPosition = twisted;
      vDepth = (modelViewMatrix * vec4(twisted, 1.0)).z;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(twisted, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColorDeep;
    uniform vec3 uColorMid;
    uniform vec3 uColorHighlight;
    uniform float uOpacity;
    uniform samplerCube uEnvMap;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying float vDepth;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(cameraPosition - vPosition);

      // Determine if front or back face using gl_FrontFacing
      float faceDot = dot(viewDir, normal);
      bool isFrontFace = gl_FrontFacing;

      // Flip normal for back face
      if (!isFrontFace) {
        normal = -normal;
      }

      // Fresnel effect
      float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 2.5);

      // Base facing calculation
      float facing = max(dot(normal, viewDir), 0.0);

      vec3 baseColor;
      float alpha;

      if (isFrontFace) {
        // Front face: stronger glossy response
        float lw1 = sin(uTime * ${0.47 * TUNE.lightWiggleTimeCoeff} + vUv.x * 4.0) * 0.07;
        float lw2 = cos(uTime * ${0.39 * TUNE.lightWiggleTimeCoeff} + vUv.y * 3.0) * 0.06;
        vec3 lightDir1 = normalize(vec3(0.2 + lw1, 0.2 + lw2, 1.0));
        vec3 lightDir2 = normalize(vec3(-0.25 + lw2 * 0.8, 0.85 + lw1 * 0.7, 0.55));
        vec3 halfDir1 = normalize(lightDir1 + viewDir);
        vec3 halfDir2 = normalize(lightDir2 + viewDir);

        // Multi-lobe specular (broad + sharp)
        float specBroad = pow(max(dot(normal, halfDir1), 0.0), 36.0);
        float specSharp = pow(max(dot(normal, halfDir2), 0.0), 160.0);

        // Fake environment reflection term
        vec3 reflDir = reflect(-viewDir, normal);
        float env = pow(1.0 - abs(reflDir.y), 1.8);
        vec3 envColor = textureCube(uEnvMap, normalize(reflDir)).rgb;

        // Slightly darker base to improve highlight contrast on white bg
        baseColor = mix(uColorMid, uColorHighlight, facing * 0.5);
        baseColor *= 0.82;

        // Subtle color shift iridescence (apply to base only)
        float irid = sin(vUv.x * 40.0 + vUv.y * 20.0 + uTime * 0.3) * 0.05 + 0.95;
        baseColor *= irid;

        // Strong glossy highlights + reflection tint
        vec3 specColor = vec3(1.0) * (specBroad * 0.86 + specSharp * 1.82);
        specColor += mix(uColorHighlight, vec3(1.0), 0.7) * env * 0.62;
        specColor += envColor * 0.42;
        baseColor += specColor;

        // Fresnel rim with highlight color
        baseColor += mix(uColorHighlight, vec3(1.0), 0.35) * fresnel * 1.02;

        alpha = uOpacity * (0.85 + facing * 0.15);
      } else {
        // Back face: Matte diffuse - clearly different appearance
        float blw = sin(uTime * ${0.33 * TUNE.lightWiggleTimeCoeff} + vUv.x * 2.5 + vUv.y * 1.2) * 0.06;
        vec3 lightDir = normalize(vec3(0.0 + blw, 0.5 + blw * 0.6, 1.0));
        float diffuse = max(dot(normal, lightDir), 0.0) * 0.4 + 0.4;

        // Darker, desaturated colors for matte side
        baseColor = uColorDeep * 0.5 + uColorMid * 0.3 * diffuse;

        // Very subtle ambient only
        baseColor += vec3(0.03, 0.05, 0.08);

        // No specular, no fresnel - pure matte
        alpha = uOpacity * 0.9;
      }

      // Depth-based fade
      float depthFade = smoothstep(-20.0, -3.0, vDepth);
      alpha *= depthFade;

      // Fade only ribbon tips (longitudinal direction)
      float tipFade = smoothstep(0.0, 0.14, vUv.x) * smoothstep(0.0, 0.14, 1.0 - vUv.x);
      alpha *= tipFade;

      gl_FragColor = vec4(baseColor, alpha);
    }
  `;

  // Create multiple twisted ribbons - diagonal composition (bottom-left -> top-right)
  const configs = [
    // near end (bottom-left): shallower depth blur side
    { width: 2.6, length: 20, twists: 3.6, x: -5.0, y: -2.4, z: -3.8, rotY: -0.58, rotZ: 0.55, color: 0, seed: 1.0 },
    { width: 2.1, length: 17, twists: 3.2, x: -3.9, y: -1.7, z: -4.8, rotY: -0.46, rotZ: 0.48, color: 1, seed: 1.3 },
    // mid (focus area)
    { width: 2.8, length: 22, twists: 4.0, x: -2.1, y: -0.8, z: -6.4, rotY: -0.42, rotZ: 0.4, color: 2, seed: 0.8 },
    { width: 2.0, length: 15, twists: 2.8, x: -0.6, y: 0.0, z: -7.3, rotY: -0.36, rotZ: 0.34, color: 3, seed: 1.5 },
    { width: 2.3, length: 18, twists: 3.4, x: 1.0, y: 0.8, z: -8.2, rotY: -0.3, rotZ: 0.3, color: 4, seed: 0.7 },
    // far end (top-right): farther depth blur side
    { width: 1.8, length: 14, twists: 2.9, x: 2.6, y: 1.7, z: -9.8, rotY: -0.24, rotZ: 0.24, color: 1, seed: 1.2 },
    { width: 2.5, length: 20, twists: 3.9, x: 4.4, y: 2.6, z: -11.2, rotY: -0.2, rotZ: 0.2, color: 2, seed: 0.9 },
  ];

  // Color palettes - deep blue, teal tones for white background
  const palettes = [
    { deep: [0.02, 0.08, 0.18], mid: [0.08, 0.25, 0.4], highlight: [0.3, 0.5, 0.65] },
    { deep: [0.03, 0.12, 0.22], mid: [0.1, 0.3, 0.45], highlight: [0.35, 0.55, 0.7] },
    { deep: [0.02, 0.1, 0.2], mid: [0.12, 0.28, 0.42], highlight: [0.32, 0.52, 0.68] },
    { deep: [0.04, 0.1, 0.18], mid: [0.08, 0.22, 0.38], highlight: [0.28, 0.48, 0.62] },
    { deep: [0.03, 0.1, 0.2], mid: [0.15, 0.32, 0.48], highlight: [0.38, 0.58, 0.72] },
  ];

  const activeConfigs = configs.slice(0, Math.max(1, Math.min(ribbonCount, configs.length)));

  activeConfigs.forEach((cfg, i) => {
    const geometry = createTwistedRibbon(cfg.width, cfg.length, cfg.twists, 240);
    const palette = palettes[cfg.color];

    const baseUniforms = {
      uTime: { value: 0 },
      uOffset: { value: i * 40 + Math.random() * 20 },
      uTwistSpeed: { value: 0.1 + Math.random() * 0.15 },
      uWaveAmp: { value: 0.4 + Math.random() * 0.3 },
      uRandomSeed: { value: cfg.seed || (0.7 + Math.random() * 0.6) },
      uMouseVelocity: { value: 0 },
      uEnvMap: { value: envCube },
      uColorDeep: { value: new THREE.Vector3(...palette.deep) },
      uColorMid: { value: new THREE.Vector3(...palette.mid) },
      uColorHighlight: { value: new THREE.Vector3(...palette.highlight) },
      uOpacity: { value: 0.9 - i * 0.02 }
    };

    const backMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: THREE.UniformsUtils.clone(baseUniforms),
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      alphaTest: 0.02,
      blending: THREE.NormalBlending
    });

    const frontMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: THREE.UniformsUtils.clone(baseUniforms),
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: true,
      alphaTest: 0.02,
      blending: THREE.NormalBlending
    });

    const backMesh = new THREE.Mesh(geometry, backMaterial);
    backMesh.position.set(cfg.x, cfg.y, cfg.z);
    backMesh.rotation.y = cfg.rotY;
    backMesh.rotation.z = cfg.rotZ || 0;
    backMesh.rotation.x = 0.15 + Math.random() * 0.1;
    backMesh.renderOrder = i * 2;

    const frontMesh = new THREE.Mesh(geometry, frontMaterial);
    frontMesh.position.copy(backMesh.position);
    frontMesh.rotation.copy(backMesh.rotation);
    frontMesh.renderOrder = i * 2 + 1;

    ribbonGroup.add(backMesh);
    ribbonGroup.add(frontMesh);
    ribbons.push({ meshes: [backMesh, frontMesh], materials: [backMaterial, frontMaterial], config: cfg });
  });

  // Keep deliberate diagonal composition
  ribbonGroup.position.set(0, 0, 0);
  ribbonGroup.rotation.z = -0.08;

  // Mouse interaction with proper acceleration (derivative of velocity)
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  // Physics-based velocity and acceleration
  let velocity = 0;           // Current velocity magnitude
  let delayedVelocity = 0;    // Slightly delayed velocity for lagged top-speed response
  let prevVelocity = 0;       // Previous frame velocity
  let acceleration = 0;       // dv/dt
  let windStrength = 0;
  let lastTime = performance.now();
  let lastMousePosX = 0;
  let lastMousePosY = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  function updatePointerTarget(clientX, clientY) {
    const vw = Math.max(1, viewportSize.width);
    const vh = Math.max(1, viewportSize.height);
    targetMouseX = (clientX / vw - 0.5) * 2;
    targetMouseY = (clientY / vh - 0.5) * 2;
  }

  document.addEventListener('mousemove', (e) => {
    updatePointerTarget(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - touchStartX);
    const dy = Math.abs(t.clientY - touchStartY);
    // Ignore mostly-vertical scroll gestures to prevent accidental horizontal wobble
    if (dy > dx * 1.2) return;
    updatePointerTarget(t.clientX, t.clientY);
  }, { passive: true });

  // Animation
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const dt = (now - lastTime) / 1000; // Delta time in seconds
    const safeDt = Math.max(dt, 1 / 120);
    const physicsDt = Math.min(safeDt, 1 / 20);
    lastTime = now;
    time += 0.016;

    mouseX += (targetMouseX - mouseX) * 0.1;
    mouseY += (targetMouseY - mouseY) * 0.1;

    // Calculate velocity: distance moved per frame
    const dx = mouseX - lastMousePosX;
    const dy = mouseY - lastMousePosY;
    const currentVelocity = Math.sqrt(dx * dx + dy * dy) / physicsDt;

    // Smooth velocity
    velocity += (currentVelocity - velocity) * 0.22;

    // Delayed velocity (intentional lag for top-speed timing)
    delayedVelocity += (velocity - delayedVelocity) * 0.08;

    // Calculate acceleration: dv/dt (change in velocity over time)
    const rawAcceleration = (velocity - prevVelocity) / physicsDt;
    acceleration += (rawAcceleration - acceleration) * 0.2;
    if (Math.abs(acceleration) < 0.02) acceleration = 0;
    prevVelocity = velocity;

    // Store position for next frame
    lastMousePosX = mouseX;
    lastMousePosY = mouseY;

    // Wind strength based on velocity and acceleration
    // acceleration > 0 means speeding up (more wind)
    // acceleration < 0 means slowing down (wind dies down)
    const velocityFactor = delayedVelocity * 0.72;
    const positiveAcceleration = Math.min(40, Math.max(0, acceleration));
    const accelerationFactor = Math.min(0.22, positiveAcceleration * TUNE.accelerationFactorCoeff);

    const targetWind = Math.min(0.82, velocityFactor + accelerationFactor);

    // Smooth wind transitions - faster response to acceleration
    if (acceleration > 0) {
      windStrength += (targetWind - windStrength) * 0.15;
    } else {
      windStrength += (targetWind - windStrength) * 0.03;
    }

    // Natural decay when mouse stops
    if (delayedVelocity < 0.01) {
      windStrength *= 0.97;
    }

    ribbons.forEach((ribbon) => {
      ribbon.materials.forEach((mat) => {
        mat.uniforms.uTime.value = time;
        mat.uniforms.uMouseVelocity.value = windStrength;
      });
    });

    // Camera framing for diagonal composition
    camera.position.x = mouseX * 0.1;
    camera.position.y = mouseY * 0.08;
    camera.lookAt(-0.4, 0.1, -7.2);

    renderer.render(scene, camera);
  }

  let resizeDebounceTimer = null;
  function applyViewportResize(force = false) {
    if (isIPhone && force) {
      stableViewportWidth = Math.max(1, Math.round(document.documentElement.clientWidth || window.innerWidth));
      stableViewportHeight = Math.max(1, Math.round((window.visualViewport && window.visualViewport.height) || window.innerHeight));
    }
    if (isIPhone && !force) {
      // Keep fully stable during scroll on iPhone; resize only on forced events
      return;
    }
    const next = getViewportSize();
    if (!force) {
      const heightDiff = Math.abs(next.height - viewportSize.height);
      const widthDiff = Math.abs(next.width - viewportSize.width);
      if (widthDiff < 2 && heightDiff < 2) return;
    }

    viewportSize = next;
    camera.aspect = viewportSize.width / viewportSize.height;
    camera.updateProjectionMatrix();
    renderer.setSize(viewportSize.width, viewportSize.height, false);
  }

  function scheduleViewportResize() {
    if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => applyViewportResize(), isIPhone ? 120 : 0);
  }

  window.addEventListener('resize', scheduleViewportResize, { passive: true });
  if (window.visualViewport) {
    if (!isIPhone) {
      window.visualViewport.addEventListener('resize', scheduleViewportResize, { passive: true });
      window.visualViewport.addEventListener('scroll', scheduleViewportResize, { passive: true });
    }
  }
  window.addEventListener('orientationchange', () => {
    setTimeout(() => applyViewportResize(true), 220);
  }, { passive: true });

  animate();
})();
