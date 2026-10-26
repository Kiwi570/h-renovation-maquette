/* H-Renovation — pluie sur la vitre d'une fenêtre de toit (WebGL, OGL), puis éclaircie au défilement. */
(function () {
  'use strict';
  var HR = (window.HR = window.HR || {});

  var VERT = [
    'attribute vec2 uv;',
    'attribute vec2 position;',
    'varying vec2 vUv;',
    'void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }',
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'uniform sampler2D tMap;',
    'uniform sampler2D tWipe;',
    'uniform float uTime;',
    'uniform float uRain;',
    'uniform float uClear;',
    'uniform vec2 uRes;',
    'uniform vec2 uImg;',
    'varying vec2 vUv;',

    'float h21(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }',
    'float h11(float p){ return fract(sin(p * 127.1) * 43758.5453); }',

    'vec2 cover(vec2 uv){',
    '  float rs = uRes.x / uRes.y; float ri = uImg.x / uImg.y;',
    '  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);',
    '  return (uv - 0.5) * s + 0.5;',
    '}',

    // gouttelettes posées sur la vitre (buée qui perle)
    'vec3 posees(vec2 st, float t, float dens){',
    '  vec2 g = st * dens; vec2 id = floor(g); vec2 f = fract(g) - 0.5;',
    '  float r1 = h21(id); float r2 = h21(id + 17.3); float r3 = h21(id + 41.7);',
    '  vec2 c = (vec2(r1, r2) - 0.5) * 0.6;',
    '  float rad = mix(0.08, 0.27, r3 * r3);',
    '  vec2 d = f - c;',
    '  float life = fract(t * 0.05 + r1 * 7.0);',
    '  float vis = smoothstep(0.0, 0.08, life) * smoothstep(1.0, 0.7, life);',
    '  float present = step(r2, uRain * 0.65 + 0.04);',
    '  float m = smoothstep(rad, rad * 0.5, length(d)) * vis * present;',
    '  return vec3(d / rad, m);',
    '}',

    // gouttes qui ruissellent en laissant une traînée claire
    'vec4 ruisselle(vec2 st, float t, float cols, float seed){',
    '  float cx = st.x * cols; float id = floor(cx);',
    '  float r1 = h11(id * 1.37 + seed); float r2 = h11(id * 2.91 + seed * 3.1); float r3 = h11(id * 5.17 + seed * 7.3);',
    '  float active = step(r1, uRain * 0.8);',
    '  float speed = mix(0.05, 0.14, r2);',
    '  float ph = fract(t * speed + r3);',
    '  float y = 1.15 - (ph + 0.035 * sin(ph * 31.0 + r1 * 6.0)) * 1.4;',
    '  float lx = fract(cx) - 0.5;',
    '  float wob = 0.10 * sin(st.y * 9.0 + r1 * 20.0) + 0.05 * sin(st.y * 23.0 + r2 * 13.0);',
    '  float xx = (lx - (r2 - 0.5) * 0.4 - wob) / cols;',
    '  float dy = st.y - y;',
    '  float rad = mix(0.009, 0.019, r3);',
    '  vec2 dv = vec2(xx, dy * 0.72);',
    '  float head = smoothstep(rad, rad * 0.45, length(dv)) * active;',
    '  float tl = mix(0.12, 0.34, r1);',
    '  float above = smoothstep(0.0, 0.012, dy) * smoothstep(tl, 0.0, dy);',
    '  float tw = rad * 0.6 * (1.0 - clamp(dy / tl, 0.0, 1.0)) + 0.0005;',
    '  float trail = smoothstep(tw, tw * 0.25, abs(xx)) * above * active;',
    '  float k = fract(st.y * 48.0 + r1) - 0.5;',
    '  float small = smoothstep(rad * 0.42, rad * 0.12, length(vec2(xx, k / 48.0))) * above * active * step(0.4, fract(st.y * 9.0 + r3));',
    '  return vec4(dv / rad, clamp(head + small, 0.0, 1.0), trail);',
    '}',

    'void main(){',
    '  vec2 uv = vUv; float asp = uRes.x / uRes.y; vec2 st = vec2(uv.x * asp, uv.y); float t = uTime;',
    '  vec3 s1 = posees(st, t, 34.0);',
    '  vec3 s2 = posees(st * 1.7 + 3.1, t + 11.0, 34.0);',
    '  vec4 a = ruisselle(st, t, 7.0 * asp, 1.0);',
    '  vec4 b = ruisselle(st + vec2(0.37, 0.0), t * 1.1 + 4.0, 12.0 * asp, 7.0);',
    '  float dropM = clamp(max(max(s1.z, s2.z * 0.8), max(a.z, b.z)), 0.0, 1.0);',
    '  vec2 n = s1.xy * s1.z + s2.xy * s2.z * 0.7 + a.xy * a.z + b.xy * b.z;',
    '  float trail = max(a.w, b.w);',
    '  float wipe = texture2D(tWipe, uv).r;',
    '  float clearM = clamp(max(max(dropM, trail * 0.85), max(wipe, uClear)), 0.0, 1.0);',
    '  vec2 base = cover(uv);',
    '  vec3 sharp = texture2D(tMap, base - n * 0.02 * dropM).rgb;',
    '  vec3 fog = texture2D(tMap, base, mix(5.5, 0.0, uClear)).rgb;',
    '  fog = mix(fog, vec3(dot(fog, vec3(0.299, 0.587, 0.114))), 0.3) * 0.8 + vec3(0.035, 0.045, 0.06);',
    '  vec3 col = mix(fog, sharp, clearM);',
    '  col += vec3(0.16, 0.18, 0.2) * smoothstep(0.45, 1.0, dropM) * clamp(n.y * 0.6 + 0.2, 0.0, 1.0);',
    '  col -= 0.07 * smoothstep(0.2, 0.6, dropM) * clamp(-n.y, 0.0, 1.0);',
    '  vec2 q = uv - 0.5; col *= 1.0 - dot(q, q) * 0.55;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}',
  ].join('\n');

  HR.pluie = function (canvas, img, opts) {
    opts = opts || {};
    if (!window.OGL) return null;
    var O = window.OGL, renderer, gl;
    try {
      var petit = window.innerWidth < 900;
      renderer = new O.Renderer({ canvas: canvas, dpr: Math.min(window.devicePixelRatio || 1, petit ? 1 : 1.25), alpha: false, antialias: false, powerPreference: 'high-performance' });
      gl = renderer.gl;
    } catch (e) { return null; }
    if (!gl) return null;

    var pot = document.createElement('canvas');
    pot.width = 2048; pot.height = 1024;
    var tex = new O.Texture(gl, { generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR });

    var wipe = document.createElement('canvas');
    wipe.width = 160; wipe.height = 160;
    var wc = wipe.getContext('2d');
    wc.fillStyle = '#000'; wc.fillRect(0, 0, 160, 160);
    var wtex = new O.Texture(gl, { image: wipe, generateMipmaps: false });

    var program = new O.Program(gl, {
      vertex: VERT, fragment: FRAG,
      uniforms: {
        tMap: { value: tex }, tWipe: { value: wtex }, uTime: { value: 0 },
        uRain: { value: opts.rain != null ? opts.rain : 1 }, uClear: { value: opts.clear || 0 },
        uRes: { value: [1, 1] }, uImg: { value: [16, 9] },
      },
    });
    var mesh = new O.Mesh(gl, { geometry: new O.Triangle(gl), program: program });

    function setImage(source) {
      var w = source.naturalWidth || source.videoWidth, h = source.naturalHeight || source.videoHeight;
      if (!w || !h) return;
      try {
        pot.getContext('2d').drawImage(source, 0, 0, pot.width, pot.height);
        tex.image = pot; tex.needsUpdate = true;
        program.uniforms.uImg.value = [w, h];
      } catch (e) { /* image non lisible */ }
    }
    setImage(img);

    var boite = canvas.parentElement;
    function resize() {
      var r = boite.getBoundingClientRect();
      renderer.setSize(Math.max(1, r.width), Math.max(1, r.height));
      canvas.style.width = '100%'; canvas.style.height = '100%';
      program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
    }
    resize();
    window.addEventListener('resize', resize);

    // essuyer la buée du bout du doigt
    var section = opts.section || canvas.parentElement;
    var px = -1, py = -1;
    function wipeAt(e) {
      var r = boite.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width * 160, y = (e.clientY - r.top) / r.height * 160;
      wc.globalCompositeOperation = 'lighter';
      var steps = px < 0 ? 1 : Math.min(12, Math.ceil(Math.hypot(x - px, y - py) / 3));
      for (var i = 0; i < steps; i++) {
        var k = steps === 1 ? 1 : i / (steps - 1);
        var cx = px < 0 ? x : px + (x - px) * k, cy = py < 0 ? y : py + (y - py) * k;
        var g = wc.createRadialGradient(cx, cy, 0, cx, cy, 11);
        g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        wc.fillStyle = g;
        wc.save(); wc.translate(cx, cy); wc.scale(r.height / r.width, 1); wc.translate(-cx, -cy);
        wc.beginPath(); wc.arc(cx, cy, 11, 0, Math.PI * 2); wc.fill(); wc.restore();
      }
      px = x; py = y;
    }
    section.addEventListener('pointermove', wipeAt, { passive: true });
    section.addEventListener('pointerleave', function () { px = py = -1; });

    var visible = true, raf = 0, last = performance.now(), t = Math.random() * 20;
    var pas = window.innerWidth < 900 ? 1000 / 30 : 0, dernierRendu = 0; // 30 images/s sur téléphone
    var io = new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    });
    io.observe(canvas);

    function loop(now) {
      raf = 0;
      if (!visible) return;
      if (pas && now - dernierRendu < pas - 2) { raf = requestAnimationFrame(loop); return; }
      dernierRendu = now;
      var dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      wc.globalCompositeOperation = 'source-over';
      wc.fillStyle = 'rgba(0,0,0,0.012)'; wc.fillRect(0, 0, 160, 160);
      wtex.needsUpdate = true;
      program.uniforms.uTime.value = t;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return {
      set: function (rain, clear) { program.uniforms.uRain.value = rain; program.uniforms.uClear.value = clear; },
      setImage: setImage,
      destroy: function () { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', resize); },
    };
  };

  // Ouverture du hero commune à l'accueil et à la page Toiture.
  HR.initHero = function (hero, opts) {
    opts = opts || {};
    if (!hero) return;
    var calme = HR.calme, hasG = typeof gsap !== 'undefined';
    var canvas = hero.querySelector('[data-hero-gl]'), img = hero.querySelector('[data-hero-img]');
    var pluie = null;
    var rainMax = opts.doux ? 0.6 : 1, clear0 = opts.doux ? 0.32 : 0.14;

    function demarrerPluie() {
      if (calme || !HR.pluie || !canvas) { hero.classList.add('sans-gl'); return; }
      pluie = HR.pluie(canvas, img, { section: hero, rain: rainMax, clear: clear0 });
      if (pluie) hero.classList.add('gl-pret'); else hero.classList.add('sans-gl');
    }
    // la pluie démarre quand le navigateur est disponible, pour ne pas gêner le chargement
    var plusTard = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 300); })(demarrerPluie, { timeout: 1500 }); };
    if (img && img.complete && img.naturalWidth) plusTard();
    else if (img) img.addEventListener('load', plusTard, { once: true });
    else hero.classList.add('sans-gl');

    if (!hasG || calme) return;

    // l'éclaircie : la pluie se raréfie et la buée disparaît au défilement
    ScrollTrigger.create({
      trigger: hero, start: 'top top', end: 'bottom top', scrub: true,
      onUpdate: function (self) {
        var p = self.progress, e = p * p * (3 - 2 * p);
        if (pluie) pluie.set(rainMax * (1 - 0.92 * e), clear0 + (1 - clear0) * Math.min(1, e * 1.25));
      },
    });
    gsap.to(hero.querySelector('.wrap'), { yPercent: -14, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(hero.querySelector('.hero__media'), { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

    var lignes = hero.querySelectorAll('.hero__titre .l');
    var intro = gsap.timeline({ paused: true });
    intro.fromTo(hero.querySelector('.hero__media'), { scale: 1.14 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0)
      .from(hero.querySelectorAll('.hero__h1 .eyebrow, .fil'), { opacity: 0, x: -24, duration: 0.8, ease: 'power3.out' }, 0.15)
      .fromTo(lignes, { clipPath: 'inset(0 0 100% 0)', y: 60 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, clearProps: 'clipPath' }, 0.2)
      .from(hero.querySelectorAll('[data-hero-fade]'), { opacity: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 0.65);
    if (opts.attendre) document.addEventListener('hr:ouvert', function () { intro.play(); }, { once: true });
    else intro.play();
  };
})();
