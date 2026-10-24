// Site Renaissance Roleplay : liens, écran d'accueil, ambiance (pluie, braises, éclairs, son).

// ---------- Liens à remplir : un lien vide = bouton « bientôt » (Discord) ou masqué (réseaux) ----------
const LIENS = {
  discord: '',
  instagram: '',
  tiktok: '',
  bd: 'https://tamalou70.github.io/heritage-38eme-parallele/',
};

const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-lien]').forEach(a => {
  const cle = a.dataset.lien;
  const url = LIENS[cle];
  if (url) {
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    const detail = a.querySelector(`[data-detail="${cle}"]`);
    if (detail) detail.textContent = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  } else if (cle === 'discord') {
    a.removeAttribute('href');
    a.classList.add('bientot');
    const detail = a.querySelector('[data-detail="discord"]');
    if (detail) detail.textContent = 'Bientôt';
    else a.textContent = 'Discord bientôt';
  } else {
    a.hidden = true;
  }
});

// ---------- Écran d'accueil ----------
// Un lien direct vers une section (ex. …/#lore) saute l'accueil ; le son se lance avec le bouton.
const accueil = document.getElementById('accueil');
function entrer() {
  accueil.classList.add('ouvert');
  document.body.classList.remove('verrouille');
}
document.getElementById('decouvrir').addEventListener('click', () => {
  entrer();
  Ambiance.demarrer();
});
if (location.hash.length > 1) {
  accueil.style.transition = 'none';
  entrer();
}

// ---------- Barre du haut : visible après le héros ----------
const barre = document.getElementById('barre');
const heros = document.querySelector('.heros');
new IntersectionObserver(([e]) => barre.classList.toggle('visible', !e.isIntersecting), { threshold: 0.15 }).observe(heros);

// ---------- Apparition au défilement ----------
const revele = new IntersectionObserver(entrees => {
  for (const e of entrees) if (e.isIntersecting) { e.target.classList.add('vu'); revele.unobserve(e.target); }
}, { threshold: 0.15 });
document.querySelectorAll('.revele').forEach(el => revele.observe(el));

// ---------- Son : pluie et orage synthétisés (aucun fichier audio) ----------
const Ambiance = (() => {
  let ctx = null, maitre = null, actif = true;
  const bouton = document.getElementById('son');

  function bruit(secondes, brun) {
    const n = ctx.sampleRate * secondes, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    let dernier = 0;
    for (let i = 0; i < n; i++) {
      const b = Math.random() * 2 - 1;
      d[i] = brun ? (dernier = (dernier + 0.02 * b) / 1.02) * 3.5 : b;
    }
    return buf;
  }

  function pluie() {
    const src = ctx.createBufferSource();
    src.buffer = bruit(4, false);
    src.loop = true;
    const passeHaut = ctx.createBiquadFilter(); passeHaut.type = 'highpass'; passeHaut.frequency.value = 600;
    const passeBas = ctx.createBiquadFilter(); passeBas.type = 'lowpass'; passeBas.frequency.value = 5200;
    const g = ctx.createGain(); g.gain.value = 0.11;
    src.connect(passeHaut).connect(passeBas).connect(g).connect(maitre);
    src.start();
  }

  function tonnerre(force) {
    if (!ctx || !actif) return;
    const src = ctx.createBufferSource();
    src.buffer = bruit(6, true);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180 + 220 * force;
    const g = ctx.createGain(), t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.9 * force, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.25 * force, t + 1.2);
    g.gain.exponentialRampToValueAtTime(0.001, t + 5.5);
    src.connect(f).connect(g).connect(maitre);
    src.start();
  }

  function demarrer() {
    if (ctx || calme) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch { return; }
    maitre = ctx.createGain();
    maitre.gain.value = 0;
    maitre.connect(ctx.destination);
    maitre.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 3);
    pluie();
  }

  bouton.addEventListener('click', () => {
    if (!ctx) { demarrer(); return; }
    actif = !actif;
    bouton.classList.toggle('coupe', !actif);
    bouton.setAttribute('aria-label', actif ? 'Couper le son' : 'Activer le son');
    bouton.title = bouton.getAttribute('aria-label');
    maitre.gain.cancelScheduledValues(ctx.currentTime);
    maitre.gain.linearRampToValueAtTime(actif ? 0.6 : 0, ctx.currentTime + 0.4);
  });
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    document.hidden ? ctx.suspend() : ctx.resume();
  });
  return { demarrer, tonnerre };
})();

// ---------- Pluie (dans le héros) ----------
(() => {
  if (calme) return;
  const c = document.getElementById('pluie'), g = c.getContext('2d');
  let gouttes = [], visible = true, w = 0, h = 0;
  function taille() {
    const r = Math.min(devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight;
    c.width = w * r; c.height = h * r; g.setTransform(r, 0, 0, r, 0, 0);
    const n = Math.round(w * h / 9000);
    gouttes = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, v: 9 + Math.random() * 10, l: 10 + Math.random() * 18, a: 0.08 + Math.random() * 0.22 }));
  }
  addEventListener('resize', taille);
  taille();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(c);
  (function boucle() {
    requestAnimationFrame(boucle);
    if (!visible || document.hidden) return;
    g.clearRect(0, 0, w, h);
    g.lineWidth = 1;
    for (const d of gouttes) {
      g.strokeStyle = `rgba(205, 180, 255, ${d.a})`;
      g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(d.x - d.l * 0.18, d.y + d.l); g.stroke();
      d.y += d.v; d.x -= d.v * 0.18;
      if (d.y > h) { d.y = -d.l; d.x = Math.random() * (w + 100); }
    }
  })();
})();

// ---------- Éclairs ----------
(() => {
  if (calme) return;
  const svg = document.getElementById('eclair'), flash = document.getElementById('flash');
  const NS = 'http://www.w3.org/2000/svg';
  function trace(x, y, longueur, angle, epaisseur, profondeur) {
    let d = `M${x},${y}`;
    const pas = 14;
    for (let i = 0; i < longueur / pas; i++) {
      angle += (Math.random() - 0.5) * 0.9;
      angle = Math.max(Math.PI * 0.3, Math.min(Math.PI * 0.7, angle));
      x += Math.cos(angle) * pas; y += Math.sin(angle) * pas;
      d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
      if (profondeur < 2 && Math.random() < 0.06) trace(x, y, longueur * 0.4, angle + (Math.random() < 0.5 ? -0.7 : 0.7), epaisseur * 0.5, profondeur + 1);
    }
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', '#f4ecff');
    p.setAttribute('stroke-width', epaisseur);
    p.setAttribute('stroke-linejoin', 'round');
    p.style.filter = 'drop-shadow(0 0 6px #b77bff) drop-shadow(0 0 16px #8d3dff)';
    svg.appendChild(p);
  }
  function coup() {
    const w = svg.clientWidth, h = svg.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.textContent = '';
    const x = w * (Math.random() < 0.5 ? 0.08 + Math.random() * 0.22 : 0.7 + Math.random() * 0.22);
    trace(x, -10, h * (0.35 + Math.random() * 0.25), Math.PI / 2, 2.4, 0);
    const anim = [{ opacity: 0 }, { opacity: 1, offset: 0.05 }, { opacity: 0.2, offset: 0.15 }, { opacity: 0.9, offset: 0.22 }, { opacity: 0 }];
    svg.animate(anim, { duration: 650, easing: 'ease-out' });
    flash.animate(anim, { duration: 750, easing: 'ease-out' });
    setTimeout(() => Ambiance.tonnerre(0.5 + Math.random() * 0.5), 300 + Math.random() * 900);
    setTimeout(coup, 7000 + Math.random() * 9000);
  }
  setTimeout(coup, 3500);
})();

// ---------- Braises violettes et dorées (toute la page) ----------
(() => {
  if (calme) return;
  const c = document.getElementById('braises'), g = c.getContext('2d');
  const sprite = (couleur) => {
    const s = document.createElement('canvas'); s.width = s.height = 32;
    const x = s.getContext('2d'), r = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    r.addColorStop(0, '#fff'); r.addColorStop(0.25, couleur); r.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = r; x.fillRect(0, 0, 32, 32);
    return s;
  };
  const sprites = [sprite('rgba(170, 100, 255, .9)'), sprite('rgba(200, 130, 255, .9)'), sprite('rgba(243, 198, 107, .9)')];
  let w = 0, h = 0, pts = [];
  function nouvelle(bas) {
    return { x: Math.random() * w, y: bas ? h + 10 : Math.random() * h, v: 0.25 + Math.random() * 0.7, t: 3 + Math.random() * 7,
             o: Math.random() * Math.PI * 2, s: sprites[Math.random() < 0.25 ? 2 : Math.random() < 0.5 ? 0 : 1] };
  }
  function taille() {
    const r = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    c.width = w * r; c.height = h * r; g.setTransform(r, 0, 0, r, 0, 0);
    pts = Array.from({ length: Math.round(Math.min(70, w / 22)) }, () => nouvelle(false));
  }
  addEventListener('resize', taille);
  taille();
  (function boucle(t) {
    requestAnimationFrame(boucle);
    if (document.hidden) return;
    g.clearRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter';
    for (const p of pts) {
      p.y -= p.v; p.x += Math.sin(t / 1400 + p.o) * 0.35;
      const a = 0.35 + 0.35 * Math.sin(t / 500 + p.o);
      g.globalAlpha = Math.max(0, a);
      g.drawImage(p.s, p.x - p.t, p.y - p.t, p.t * 2, p.t * 2);
      if (p.y < -20) Object.assign(p, nouvelle(true));
    }
    g.globalAlpha = 1;
  })(0);
})();
