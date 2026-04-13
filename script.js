/* ── Helpers ── */
const $ = id => document.getElementById(id);
const has = id => Boolean($(id));
const state = { dark:true, fontSize:'normal', contrast:false, noAnim:false };

/* ── Navigation ── */
const PAGES = {
  accueil:'page-accueil', apropos:'page-accueil',
  projets:'page-projets', competences:'page-accueil',
  contact:'page-contact'
};

function navigate(target, e) {
  if(e && e.preventDefault) e.preventDefault();
  
  // Update bottom nav
  document.querySelectorAll('.bottom-nav-btn').forEach(btn => btn.classList.remove('active'));
  if(e && e.target && e.target.closest('.bottom-nav-btn')) {
    e.target.closest('.bottom-nav-btn').classList.add('active');
  }
  
  // Update top nav
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.remove('active');
    const txt = l.textContent.toLowerCase();
    if((target==='accueil' && txt.includes('accueil')) ||
       (target==='apropos' && txt.includes('propos')) ||
       (target==='projets' && txt.includes('projets')) ||
       (target==='competences' && txt.includes('compétences')) ||
       (target==='contact' && txt.includes('contact'))) {
      l.classList.add('active');
    }
  });
  
  // Update sidebar
  document.querySelectorAll('.nav-btn-sidebar').forEach(btn => {
    btn.classList.remove('active');
    const tooltip = btn.querySelector('.tooltip');
    if(tooltip) {
      const tip = tooltip.textContent.toLowerCase();
      if((target==='accueil' && tip.includes('accueil')) ||
         (target==='apropos' && tip.includes('propos')) ||
         (target==='projets' && tip.includes('projets')) ||
         (target==='competences' && tip.includes('compétences')) ||
         (target==='contact' && tip.includes('contact'))) {
        btn.classList.add('active');
      }
    }
  });
  
  const pageId = PAGES[target] || 'page-accueil';
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
  
  if(pageId==='page-accueil' && target!=='accueil') {
    setTimeout(() => {
      const sec = document.getElementById(target) || document.getElementById(target+'-apercu');
      if(sec) sec.scrollIntoView({behavior:'smooth', block:'start'});
    }, 50);
  }
  
  $('navMobile').classList.remove('open');
  $('menuToggle').classList.remove('active');
  
  initAOS();
  if(pageId==='page-projets') initFilters();
}

/* ── Mobile Menu ── */
if (has('menuToggle') && has('navMobile')) {
  $('menuToggle').addEventListener('click', () => {
    $('menuToggle').classList.toggle('active');
    $('navMobile').classList.toggle('open');
  });
}

/* ── Scroll Animations ── */
function initAOS() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('in'); });
  }, {threshold:0.1, rootMargin:'0px 0px -30px 0px'});
  document.querySelectorAll('.aos:not(.in)').forEach(el => obs.observe(el));
}
initAOS();

/* ── Accessibility Panel ── */
if (has('a11y-btn') && has('a11y-panel')) {
  $('a11y-btn').addEventListener('click', e => {
    e.stopPropagation();
    const expanded = $('a11y-panel').classList.toggle('visible');
    $('a11y-btn').setAttribute('aria-expanded', String(expanded));
  });

  document.addEventListener('click', e => {
    if (!$('a11y-panel').contains(e.target) && e.target !== $('a11y-btn')) {
      $('a11y-panel').classList.remove('visible');
      $('a11y-btn').setAttribute('aria-expanded', 'false');
    }
  });
}

function setDark(on) {
  state.dark = on;
  document.body.classList.toggle('light-theme', !on);
  if (has('dark-toggle')) $('dark-toggle').setAttribute('aria-checked', on);
}
function setFontSize(size) {
  state.fontSize = size;
  document.body.classList.remove('text-large','text-xlarge');
  if(size==='large') document.body.classList.add('text-large');
  if(size==='xlarge') document.body.classList.add('text-xlarge');
  document.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('active', b.dataset.size===size));
}
function setContrast(on) {
  state.contrast = on;
  document.body.classList.toggle('high-contrast', on);
  if (has('contrast-toggle')) $('contrast-toggle').setAttribute('aria-checked', on);
}
function setAnim(disabled) {
  state.noAnim = disabled;
  document.body.classList.toggle('no-animations', disabled);
  if (has('anim-toggle')) $('anim-toggle').setAttribute('aria-checked', disabled);
}

if (has('dark-toggle')) $('dark-toggle').addEventListener('click', () => setDark(!state.dark));
if (has('contrast-toggle')) $('contrast-toggle').addEventListener('click', () => setContrast(!state.contrast));
if (has('anim-toggle')) $('anim-toggle').addEventListener('click', () => setAnim(!state.noAnim));
if (has('btn-normal')) $('btn-normal').addEventListener('click', () => setFontSize('normal'));
if (has('btn-large')) $('btn-large').addEventListener('click', () => setFontSize('large'));
if (has('btn-xlarge')) $('btn-xlarge').addEventListener('click', () => setFontSize('xlarge'));
if (has('dark-toggle')) setDark(true);
if (has('reset-btn')) {
  $('reset-btn').addEventListener('click', () => {
    setDark(true); setFontSize('normal'); setContrast(false); setAnim(false);
  });
}

/* ── Project Filters ── */
function initFilters() {
  const filterBar = $('filter-bar');
  const searchInput = $('tag-search');
  const noResults = $('no-results');
  const cards = document.querySelectorAll('#projects-grid .project-card[data-tags]');

  const allTags = new Set();
  cards.forEach(c => c.dataset.tags.split(',').forEach(t => allTags.add(t.trim())));
  const sortedTags = Array.from(allTags).sort();
  
  filterBar.innerHTML = '<button class="filter-btn active" data-tag="all">Tous</button>';
  sortedTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.tag = tag;
    btn.textContent = tag;
    filterBar.appendChild(btn);
  });

  function filterProjects() {
    const activeTag = filterBar.querySelector('.filter-btn.active')?.dataset.tag || 'all';
    const searchTerm = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    cards.forEach(card => {
      const tags = card.dataset.tags.split(',').map(t => t.trim().toLowerCase());
      const matchesTag = activeTag === 'all' || tags.includes(activeTag.toLowerCase());
      const matchesSearch = !searchTerm || tags.some(t => t.includes(searchTerm)) || card.textContent.toLowerCase().includes(searchTerm);
      
      if(matchesTag && matchesSearch) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });
    
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  filterBar.addEventListener('click', e => {
    if(e.target.classList.contains('filter-btn')) {
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      filterProjects();
    }
  });

  searchInput.addEventListener('input', filterProjects);
}

if (has('page-projets') && $('page-projets').classList.contains('active')) initFilters();

/* ── Contact Form ── */
const contactForm = $('contact-form');
if(contactForm) {
  const messageField = $('message');
  const charCount = $('char-count');
  
  messageField.addEventListener('input', () => {
    charCount.textContent = `${messageField.value.length} / 1000`;
  });

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    
    document.querySelectorAll('.field-error').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.form-input, .form-textarea').forEach(el => el.classList.remove('error'));
    $('form-success').classList.remove('visible');
    $('form-error').classList.remove('visible');
    
    let valid = true;
    if(!$('firstname').value.trim()) { $('firstname-error').classList.add('visible'); $('firstname').classList.add('error'); valid = false; }
    if(!$('name').value.trim()) { $('name-error').classList.add('visible'); $('name').classList.add('error'); valid = false; }
    if(!$('email').value.trim() || !$('email').value.includes('@')) { $('email-error').classList.add('visible'); $('email').classList.add('error'); valid = false; }
    if(!$('message').value.trim() || $('message').value.length < 10) { $('message-error').classList.add('visible'); $('message').classList.add('error'); valid = false; }
    
    if(!valid) return;
    
    $('submit-btn').disabled = true;
    $('spinner').classList.add('visible');
    
    await new Promise(r => setTimeout(r, 1500));
    
    $('spinner').classList.remove('visible');
    $('submit-btn').disabled = false;
    $('form-success').classList.add('visible');
    contactForm.reset();
    charCount.textContent = '0 / 1000';
    
    const toast = $('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  });
}

/* ── Particles (Desktop only) ── */
(function() {
  if(window.matchMedia('(pointer: coarse)').matches) return;
  
  const canvas = document.getElementById('particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for(let i = 0; i < 35; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.5 - 0.15,
      alpha: Math.random(),
      alphaDir: Math.random() > 0.5 ? 1 : -1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.alpha += p.alphaDir * 0.006;
      if(p.alpha >= 0.45) p.alphaDir = -1;
      if(p.alpha <= 0) { p.alpha = 0; p.alphaDir = 1; }
      if(p.x < 0) p.x = W;
      if(p.x > W) p.x = 0;
      if(p.y < 0) p.y = H;
      if(p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(170,68,238,${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();
