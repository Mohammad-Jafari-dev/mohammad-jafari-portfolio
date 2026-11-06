const translations = window.translations;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const langSelect = document.querySelector('#language-select');
const nav = document.querySelector('#floating-nav');
const menuToggle = document.querySelector('#menu-toggle');
const sections = [...document.querySelectorAll('main section[id]')];

function applyLanguage(lang) {
  const data = translations[lang] || translations.en;
  document.documentElement.lang = lang;
  document.documentElement.dir = ['fa','ar'].includes(lang) ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (data[key]) el.textContent = data[key];
  });
  langSelect.value = lang;
  try { localStorage.setItem('mj-language', lang); } catch {}
}
const browserLang = (navigator.language || 'en').slice(0,2);
let initialLang = 'en';
try { initialLang = localStorage.getItem('mj-language') || (translations[browserLang] ? browserLang : 'en'); } catch {}
applyLanguage(initialLang);
langSelect.addEventListener('change', e => applyLanguage(e.target.value));

menuToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', nav.classList.contains('open'));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
document.addEventListener('keydown', e => { if (e.key === 'Escape') nav.classList.remove('open'); });

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = reduceMotion ? '0ms' : `${(i % 4) * 100}ms`;
  revealObserver.observe(el);
});

const navLinks = [...document.querySelectorAll('.nav-link')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach(s => sectionObserver.observe(s));

const titleEl = document.querySelector('#rotating-title');
const titles = ['AI Engineer', 'Machine Learning', 'Practical AI Tools', 'Intelligent Automation'];
if (!reduceMotion) {
  let titleIndex = 0, charIndex = titles[0].length, deleting = true;
  function typeLoop() {
    const current = titles[titleIndex];
    if (deleting) {
      charIndex--;
      titleEl.textContent = current.slice(0, Math.max(0, charIndex));
      if (charIndex <= 0) { deleting = false; titleIndex = (titleIndex + 1) % titles.length; }
      setTimeout(typeLoop, 48);
    } else {
      const next = titles[titleIndex];
      charIndex++;
      titleEl.textContent = next.slice(0, charIndex);
      if (charIndex >= next.length) { deleting = true; setTimeout(typeLoop, 1800); }
      else setTimeout(typeLoop, 78);
    }
  }
  setTimeout(typeLoop, 2200);
}

const backTop = document.querySelector('#back-to-top');
window.addEventListener('scroll', () => backTop.classList.toggle('visible', window.scrollY > 500), { passive: true });
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
document.querySelector('#year').textContent = new Date().getFullYear();

const canvas = document.querySelector('#forest-canvas');
const ctx = canvas.getContext('2d');
const toggle = document.querySelector('#forest-toggle');
let width = 0, height = 0, particles = [], running = true, raf = 0, lastFrame = 0;
const isMobile = matchMedia('(max-width: 650px)').matches;
const fpsLimit = isMobile ? 30 : 50;
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  width = window.innerWidth; height = window.innerHeight;
  canvas.width = width * dpr; canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = Array.from({length: isMobile ? 24 : 48}, () => ({
    x: Math.random()*width, y: Math.random()*height,
    r: Math.random()*1.7+.5, speed: Math.random()*.22+.06,
    alpha: Math.random()*.5+.12, phase: Math.random()*Math.PI*2
  }));
}
function draw(time=0) {
  if (!running || document.hidden) return;
  if (time-lastFrame < 1000/fpsLimit) { raf = requestAnimationFrame(draw); return; }
  lastFrame = time;
  ctx.clearRect(0,0,width,height);
  const glow = ctx.createRadialGradient(width*.55,height*.55,0,width*.55,height*.55,Math.max(width,height)*.72);
  glow.addColorStop(0,'rgba(26,100,57,.11)'); glow.addColorStop(1,'rgba(3,12,7,0)');
  ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  particles.forEach(p=>{
    p.y -= p.speed; p.x += Math.sin(time*.00025+p.phase)*.12;
    if(p.y < -5){p.y=height+5;p.x=Math.random()*width;}
    const a=p.alpha*(.65+.35*Math.sin(time*.001+p.phase));
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(132,235,158,${a})`;ctx.shadowBlur=9;ctx.shadowColor='rgba(80,220,130,.55)';ctx.fill();
  });
  ctx.shadowBlur=0;
  raf=requestAnimationFrame(draw);
}
function start(){if(reduceMotion)return;running=true;cancelAnimationFrame(raf);raf=requestAnimationFrame(draw);toggle.setAttribute('aria-pressed','true');}
function stop(){running=false;cancelAnimationFrame(raf);ctx.clearRect(0,0,width,height);toggle.setAttribute('aria-pressed','false');}
resize();start();
window.addEventListener('resize',resize);
toggle.addEventListener('click',()=>running?stop():start());
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else if(running)raf=requestAnimationFrame(draw);});
if(reduceMotion){toggle.disabled=true;toggle.title='Motion effects are disabled by your system preference';}
