/* ═══════════════════════════════════════════════════════════════
   PFLX STAGE 3D — shared three.js scene helper for Arena cartridges.
   Requires vendor/three.min.js + vendor/GLTFLoader.js (r128).
   Models live in /assets/models (CC0 Kenney packs — see LICENSES.md).
   API:
     var st = PFLXStage.create(containerEl, { ground:true, accent:0x00e5ff, cam:{...} });
     st.load('space/craft_racer.glb', { scale:3, x:0, z:0, rotY:0 }, function(holder){});
     st.spin(holder, speed) · st.bob(holder) · st.lunge(holder, dx, cb)
     st.hitFlash(holder) · st.shake() · st.burst(x,y,z,color)
     st.onFrame(fn) · st.dispose()
     PFLXStage.hero(screenEl, 'space/alien.glb', { accent:0xb388ff, height:150 })
   Degrades silently: every entry point no-ops if THREE is missing.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var HAS3D = typeof THREE !== 'undefined';
  var BASE = /\/games\//.test(location.pathname) ? '../assets/models/' : 'assets/models/';
  var loader = (HAS3D && typeof THREE.GLTFLoader === 'function') ? new THREE.GLTFLoader() : null;
  var cache = {};   // path -> { scene } master
  var pending = {}; // path -> [cb]

  function loadMaster(path, cb) {
    if (cache[path]) { cb(cache[path]); return; }
    if (pending[path]) { pending[path].push(cb); return; }
    pending[path] = [cb];
    if (!loader) { pending[path] = null; return; }
    loader.load(BASE + path, function (gltf) {
      cache[path] = gltf.scene;
      var q = pending[path] || []; pending[path] = null;
      q.forEach(function (f) { try { f(gltf.scene); } catch (e) {} });
    }, undefined, function () { pending[path] = null; });
  }

  function instantiate(master) {
    var inst = master.clone(true);
    inst.traverse(function (n) { if (n.isMesh && n.material) { n.material = n.material.clone(); n.castShadow = false; } });
    return inst;
  }

  function fitTo(g, size) {
    var bb = new THREE.Box3().setFromObject(g);
    var s3 = bb.getSize(new THREE.Vector3());
    var m = Math.max(s3.x, s3.y, s3.z) || 1;
    g.scale.multiplyScalar(size / m);
    bb.setFromObject(g);
    g.position.y -= bb.min.y;
  }

  function create(container, opts) {
    if (!HAS3D || !container) return null;
    opts = opts || {};
    var accent = opts.accent || 0x00e5ff;
    var W = container.clientWidth || 300, H = container.clientHeight || 200;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camOpts = opts.cam || {};
    var camera = new THREE.PerspectiveCamera(camOpts.fov || 42, W / H, 0.1, 200);
    camera.position.set(camOpts.x !== undefined ? camOpts.x : 0, camOpts.y !== undefined ? camOpts.y : 4.2, camOpts.z !== undefined ? camOpts.z : 9);
    var lookY = camOpts.lookY !== undefined ? camOpts.lookY : 1.2;
    camera.lookAt(0, lookY, 0);

    scene.add(new THREE.HemisphereLight(0xbfd9ff, 0x0a1020, 0.95));
    var key = new THREE.DirectionalLight(0xffffff, 0.85); key.position.set(4, 8, 6); scene.add(key);
    var rim = new THREE.PointLight(accent, 1.1, 30); rim.position.set(-5, 3, -4); scene.add(rim);

    if (opts.ground) {
      var disc = new THREE.Mesh(new THREE.CylinderGeometry(opts.groundR || 7, (opts.groundR || 7) * 1.06, 0.28, 48),
        new THREE.MeshStandardMaterial({ color: 0x0d1b30, emissive: accent, emissiveIntensity: 0.06, roughness: 0.6, metalness: 0.5 }));
      disc.position.y = -0.14; scene.add(disc);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(opts.groundR || 7, 0.06, 8, 64),
        new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.9 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.02; scene.add(ring);
    }

    var frames = [], tweens = [], disposed = false, shakeT = 0;
    var clock = new THREE.Clock();

    function tick() {
      if (disposed) return;
      requestAnimationFrame(tick);
      var dt = Math.min(clock.getDelta(), 0.06), t = clock.elapsedTime;
      for (var i = tweens.length - 1; i >= 0; i--) {
        var tw = tweens[i]; tw.t += dt;
        var k = Math.min(tw.t / tw.dur, 1);
        tw.step(tw.ease ? (1 - Math.pow(1 - k, 3)) : k);
        if (k >= 1) { tweens.splice(i, 1); tw.done && tw.done(); }
      }
      frames.forEach(function (f) { try { f(dt, t) } catch (e) {} });
      if (shakeT > 0) {
        shakeT -= dt;
        camera.position.x += (Math.random() - 0.5) * 0.14;
        camera.position.y += (Math.random() - 0.5) * 0.14;
      }
      renderer.render(scene, camera);
    }
    tick();

    function onResize() {
      if (disposed) return;
      var w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);
    if (typeof ResizeObserver === 'function') { var ro = new ResizeObserver(onResize); ro.observe(container); }

    var st = {
      scene: scene, camera: camera, renderer: renderer, THREE: THREE, accent: accent,
      onFrame: function (f) { frames.push(f); },
      tween: function (dur, step, done) { tweens.push({ t: 0, dur: dur, step: step, done: done, ease: true }); },
      load: function (path, o, cb) {
        o = o || {};
        var holder = new THREE.Group();
        holder.position.set(o.x || 0, o.y || 0, o.z || 0);
        holder.rotation.y = o.rotY || 0;
        scene.add(holder);
        loadMaster(path, function (master) {
          if (disposed) return;
          var inst = instantiate(master);
          fitTo(inst, o.scale || 3);
          holder.add(inst);
          cb && cb(holder, inst);
        });
        return holder;
      },
      clearOf: function (holder) { while (holder.children.length) holder.remove(holder.children[0]); },
      remove: function (holder) { scene.remove(holder); },
      spin: function (obj, speed) { frames.push(function (dt) { obj.rotation.y += (speed || 0.6) * dt; }); },
      bob: function (obj, amp, rate) {
        var y0 = obj.position.y, ph = Math.random() * 6;
        frames.push(function (dt, t) { obj.position.y = y0 + Math.sin(t * (rate || 1.6) + ph) * (amp || 0.22); });
      },
      lunge: function (obj, dx, cb) {
        var x0 = obj.position.x;
        st.tween(0.16, function (k) { obj.position.x = x0 + dx * k; }, function () {
          st.tween(0.22, function (k) { obj.position.x = x0 + dx * (1 - k); }, cb);
        });
      },
      hitFlash: function (obj, color) {
        obj.traverse(function (n) {
          if (n.isMesh && n.material && n.material.emissive) {
            if (n.userData._e0 === undefined) n.userData._e0 = n.material.emissiveIntensity || 0;
            n.material.emissive.setHex(color || 0xff4d6d);
            n.material.emissiveIntensity = 1.0;
          }
        });
        st.tween(0.35, function () {}, function () {
          obj.traverse(function (n) {
            if (n.isMesh && n.material && n.userData._e0 !== undefined) n.material.emissiveIntensity = n.userData._e0;
          });
        });
      },
      shake: function (sec) { shakeT = Math.max(shakeT, sec || 0.3); },
      burst: function (x, y, z, color) {
        var group = new THREE.Group(); group.position.set(x, y, z); scene.add(group);
        for (var i = 0; i < 10; i++) {
          var p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6),
            new THREE.MeshBasicMaterial({ color: color || accent }));
          p.userData.v = new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 3.5, (Math.random() - 0.5) * 4);
          group.add(p);
        }
        var life = 0;
        frames.push(function step(dt) {
          life += dt;
          group.children.forEach(function (p) {
            p.position.addScaledVector(p.userData.v, dt);
            p.userData.v.y -= 7 * dt;
            p.scale.multiplyScalar(0.94);
          });
          if (life > 0.9) { scene.remove(group); frames.splice(frames.indexOf(step), 1); }
        });
      },
      dispose: function () {
        disposed = true;
        window.removeEventListener('resize', onResize);
        try { renderer.dispose(); container.removeChild(renderer.domElement); } catch (e) {}
      }
    };
    return st;
  }

  function hero(screenEl, path, opts) {
    if (!HAS3D || !screenEl) return null;
    opts = opts || {};
    var box = document.createElement('div');
    box.style.cssText = 'width:min(320px,80vw);height:' + (opts.height || 150) + 'px;margin:2px auto 8px;pointer-events:none;';
    var anchor = screenEl.querySelector('.brief') || screenEl.querySelector('.sub');
    if (anchor) screenEl.insertBefore(box, anchor); else screenEl.appendChild(box);
    var st = create(box, { accent: opts.accent, ground: opts.ground !== false, groundR: 2.6, cam: { y: 2.6, z: 5.2, lookY: 1.0, fov: 40 } });
    if (!st) { box.remove(); return null; }
    st.load(path, { scale: opts.scale || 2.6 }, function (holder) {
      st.spin(holder, opts.speed || 0.55);
      st.bob(holder, 0.1, 1.2);
    });
    return st;
  }

  window.PFLXStage = { create: create, hero: hero, base: BASE, has3D: HAS3D };
})();
