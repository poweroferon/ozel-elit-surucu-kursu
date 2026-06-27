// ============================================================
// DİNAMİK FİYAT SİSTEMİ – fiyatlar.json
// ============================================================
async function fiyatlariYukle() {
  try {
    const res = await fetch('fiyatlar.json');
    if (!res.ok) return;
    const data = await res.json();

    data.ehliyetler.forEach(ehliyet => {
      // Fiyat göster
      document.querySelectorAll('.ehliyet-fiyat[data-id="' + ehliyet.id + '"]').forEach(el => {
        el.textContent = ehliyet.fiyat ? ehliyet.fiyat + ' ₺' : '';
      });
      // Fiyat etiketi
      document.querySelectorAll('.ehliyet-fiyat-label[data-id="' + ehliyet.id + '"]').forEach(el => {
        el.textContent = ehliyet.fiyat_label || '';
      });
      // Açıklama
      document.querySelectorAll('.ehliyet-aciklama[data-id="' + ehliyet.id + '"]').forEach(el => {
        el.textContent = ehliyet.aciklama;
      });
    });
  } catch (e) {
    // JSON yoksa veya hata varsa sessizce geç
  }
}
fiyatlariYukle();

// ============================================================
// NAVBAR SCROLL EFFECT
// ============================================================
const navbar = document.getElementById('navbar');
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
  if (backToTopBtn) backToTopBtn.classList.toggle('visible', window.scrollY > 400);
});

// ============================================================
// MOBILE MENU
// ============================================================
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    // Hamburger → X animasyonu
    navToggle.classList.toggle('is-active', open);
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      navToggle.classList.remove('is-active');
    });
  });
}

// ============================================================
// HERO SLIDER
// ============================================================
const slides = document.querySelectorAll('.hero__slide');
const dots = document.querySelectorAll('.hero__dot');
let current = 0;
let autoplay;

if (slides.length > 0) {
  function goTo(index) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function startAutoplay() {
    autoplay = setInterval(() => goTo(current + 1), 5500);
  }

  const heroNext = document.getElementById('heroNext');
  const heroPrev = document.getElementById('heroPrev');

  if (heroNext) heroNext.addEventListener('click', () => { clearInterval(autoplay); goTo(current + 1); startAutoplay(); });
  if (heroPrev) heroPrev.addEventListener('click', () => { clearInterval(autoplay); goTo(current - 1); startAutoplay(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(autoplay);
      goTo(+dot.dataset.index);
      startAutoplay();
    });
  });

  // Touch/swipe desteği
  let touchStartX = 0;
  const sliderEl = document.querySelector('.hero__slider');
  if (sliderEl) {
    sliderEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    sliderEl.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        clearInterval(autoplay);
        goTo(diff > 0 ? current + 1 : current - 1);
        startAutoplay();
      }
    }, { passive: true });
  }

  startAutoplay();
}

// ============================================================
// BACK TO TOP
// ============================================================
if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================================
// CONTACT FORM
// ============================================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Gönderildi!';
    btn.style.background = '#22c55e';
    btn.style.color = '#fff';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
      e.target.reset();
    }, 3500);
  });
}

// ============================================================
// SCROLL FADE-IN (IntersectionObserver)
// ============================================================
const observerOptions = { threshold: 0.08, rootMargin: '0px 0px -40px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('is-visible');
      }, (entry.target.dataset.delay || 0));
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(
  '.license-card, .info-card, .branch-card, .gallery__item, .review-card, .iletisim-sube-card, .psy-card'
).forEach((el, i) => {
  el.classList.add('fade-up');
  el.dataset.delay = (i % 4) * 80;
  observer.observe(el);
});
