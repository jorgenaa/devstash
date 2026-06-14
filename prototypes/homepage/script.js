/* ═══════════════════════════════════════════
   CHAOS ICON DEFINITIONS
═══════════════════════════════════════════ */
const CHAOS_ICONS = [
  {
    name: 'Notion',
    bg: '#191919',
    svg: `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933z"/>
    </svg>`
  },
  {
    name: 'GitHub',
    bg: '#24292e',
    svg: `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>`
  },
  {
    name: 'Slack',
    bg: '#4A154B',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
    </svg>`
  },
  {
    name: 'VS Code',
    bg: '#0078d4',
    svg: `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"/>
    </svg>`
  },
  {
    name: 'Browser',
    bg: '#1565c0',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="18" rx="2.5"/>
      <line x1="2" y1="9" x2="22" y2="9"/>
      <circle cx="5.5" cy="6" r="1" fill="white" stroke="none"/>
      <circle cx="8.5" cy="6" r="1" fill="white" stroke="none"/>
      <circle cx="11.5" cy="6" r="1" fill="white" stroke="none"/>
    </svg>`
  },
  {
    name: 'Terminal',
    bg: '#141414',
    border: '1px solid #2a2a2a',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="4 9 9 12 4 15" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="12" y1="15" x2="20" y2="15" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    name: 'Text File',
    bg: '#374151',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v16.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5Z"/>
      <polyline points="15 2 15 7 20 7"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="8" y1="16" x2="13" y2="16"/>
    </svg>`
  },
  {
    name: 'Bookmark',
    bg: '#b45309',
    svg: `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
    </svg>`
  }
];

/* ═══════════════════════════════════════════
   CHAOS ANIMATION
═══════════════════════════════════════════ */
class ChaosIcon {
  constructor(el, maxW, maxH) {
    this.el = el;
    this.size = 48;
    this.x = Math.random() * (maxW - this.size);
    this.y = Math.random() * (maxH - this.size);
    this.vx = (Math.random() - 0.5) * 1.4;
    this.vy = (Math.random() - 0.5) * 1.4;
    this.rot = Math.random() * 360;
    this.rotSpeed = (Math.random() - 0.5) * 1.2;
    this.maxW = maxW;
    this.maxH = maxH;
    this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  update(mouseX, mouseY) {
    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;
    const dx = cx - mouseX;
    const dy = cy - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 80 && dist > 0) {
      const force = ((80 - dist) / 80) * 0.9;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
    }

    // Speed limit
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 2.2) {
      this.vx = (this.vx / speed) * 2.2;
      this.vy = (this.vy / speed) * 2.2;
    }

    // Minimum drift
    if (speed < 0.4) {
      this.vx += (Math.random() - 0.5) * 0.3;
      this.vy += (Math.random() - 0.5) * 0.3;
    }

    // Damping
    this.vx *= 0.975;
    this.vy *= 0.975;

    this.x += this.vx;
    this.y += this.vy;
    this.rot += this.rotSpeed;

    // Bounce
    if (this.x <= 0) { this.x = 0; this.vx = Math.abs(this.vx); }
    if (this.x >= this.maxW - this.size) { this.x = this.maxW - this.size; this.vx = -Math.abs(this.vx); }
    if (this.y <= 0) { this.y = 0; this.vy = Math.abs(this.vy); }
    if (this.y >= this.maxH - this.size) { this.y = this.maxH - this.size; this.vy = -Math.abs(this.vy); }

    this.el.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rot}deg)`;
  }

  resize(maxW, maxH) {
    this.maxW = maxW;
    this.maxH = maxH;
    if (this.x > maxW - this.size) this.x = maxW - this.size;
    if (this.y > maxH - this.size) this.y = maxH - this.size;
  }
}

function initChaos() {
  const area = document.getElementById('chaosArea');
  if (!area) return;

  const getSize = () => ({
    w: area.clientWidth,
    h: area.clientHeight
  });

  let { w, h } = getSize();
  let mouseX = w / 2;
  let mouseY = h / 2;
  let animFrame;

  // Inject icon elements
  const icons = CHAOS_ICONS.map(def => {
    const el = document.createElement('div');
    el.className = 'chaos-icon';
    el.style.background = def.bg;
    if (def.border) el.style.border = def.border;
    el.innerHTML = def.svg;
    el.title = def.name;
    area.appendChild(el);
    return new ChaosIcon(el, w, h);
  });

  // Track mouse relative to chaos area
  area.addEventListener('mousemove', e => {
    const rect = area.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  area.addEventListener('mouseleave', () => {
    mouseX = w / 2;
    mouseY = h / 2;
  });

  function tick() {
    icons.forEach(icon => icon.update(mouseX, mouseY));
    animFrame = requestAnimationFrame(tick);
  }

  tick();

  // Resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const size = getSize();
      w = size.w;
      h = size.h;
      mouseX = w / 2;
      mouseY = h / 2;
      icons.forEach(icon => icon.resize(w, h));
    }, 150);
  });
}

/* ═══════════════════════════════════════════
   NAVBAR SCROLL OPACITY
═══════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile toggle
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('navMobile');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  // Close mobile menu on link click
  const mobileLinks = mobileMenu?.querySelectorAll('a');
  mobileLinks?.forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

/* ═══════════════════════════════════════════
   SCROLL FADE-IN
═══════════════════════════════════════════ */
function initScrollFade() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════
   PRICING TOGGLE
═══════════════════════════════════════════ */
function initPricing() {
  const toggle = document.getElementById('billingToggle');
  const proPrice = document.getElementById('proPrice');
  const pricePeriod = document.getElementById('pricePeriod');
  const priceBilled = document.getElementById('priceBilled');
  const labelMonthly = document.getElementById('labelMonthly');
  const labelYearly = document.getElementById('labelYearly');

  if (!toggle) return;

  let yearly = false;

  toggle.addEventListener('click', () => {
    yearly = !yearly;
    toggle.setAttribute('aria-checked', String(yearly));

    if (yearly) {
      proPrice.textContent = '$6';
      pricePeriod.textContent = '/ month';
      priceBilled.textContent = '$72 billed annually';
      labelMonthly.classList.remove('active');
      labelYearly.classList.add('active');
    } else {
      proPrice.textContent = '$8';
      pricePeriod.textContent = '/ month';
      priceBilled.textContent = '';
      labelMonthly.classList.add('active');
      labelYearly.classList.remove('active');
    }
  });

  // Set initial active label
  labelMonthly.classList.add('active');
}

/* ═══════════════════════════════════════════
   FOOTER YEAR
═══════════════════════════════════════════ */
function initFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initChaos();
  initNavbar();
  initScrollFade();
  initPricing();
  initFooterYear();
});
