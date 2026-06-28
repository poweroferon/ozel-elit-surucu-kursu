// ============================================================
// DİNAMİK FİYAT SİSTEMİ – Google Sheets
// Spreadsheet: A sütunu = sınıf adı, B sütunu = fiyat
// ============================================================
const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1DeR4mCVe4FtHDLaIBJi4rX6HjQPtyGHiyT9VjSfWtjI/gviz/tq?tqx=out:json';

const SINIF_ID_MAP = {
  'a': 'a', 'a sinifi': 'a', 'a sinifi ehliyet': 'a',
  'b': 'b', 'b sinifi': 'b', 'b sinifi ehliyet': 'b',
  'a1': 'a1', 'a1 sinifi': 'a1', 'a1 sinifi ehliyet': 'a1',
  'a2': 'a2', 'a2 sinifi': 'a2', 'a2 sinifi ehliyet': 'a2',
  'c': 'c', 'c sinifi': 'c', 'c sinifi ehliyet': 'c',
  'ce': 'ce', 'ce sinifi': 'ce', 'ce sinifi ehliyet': 'ce',
  'a2 otomatik': 'a2-otomatik', 'a2 otomatik sinifi': 'a2-otomatik',
  'a2 otomatik ehliyet': 'a2-otomatik', 'a2otomatik': 'a2-otomatik'
};

function normalizeSinif(text) {
  if (!text) return '';
  return text.toString().toLowerCase()
    .replace(/ı/g, 'i').replace(/ğ/g, 'g')
    .replace(/ş/g, 's').replace(/ç/g, 'c')
    .replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/\s+/g, ' ').trim();
}

function populatePriceElements(id, fiyat) {
  const fiyatStr = fiyat ? String(fiyat).trim() : '';
  document.querySelectorAll('.ehliyet-fiyat[data-id="' + id + '"]').forEach(el => {
    el.textContent = fiyatStr ? fiyatStr + ' ₺' : '';
  });
  document.querySelectorAll('.ehliyet-fiyat-label[data-id="' + id + '"]').forEach(el => {
    el.textContent = fiyatStr ? 'kurs ücreti' : 'Fiyat için arayın';
  });
}

async function sheetstenFiyatlariYukle() {
  try {
    console.log("1. Google Sheets'ten veri çekme işlemi başlatıldı...");
    const res = await fetch(SHEETS_URL);
    console.log("2. Yanıt Durumu (Status):", res.status, "Ok mi?:", res.ok);

    if (!res.ok) {
      console.error("Hata: Google Sheets bağlantısı başarısız oldu (ok değil)!");
      return;
    }

    const text = await res.text();
    console.log("3. Ham metin başarıyla çekildi.");

    const jsonStr = text.replace(/^[^{]*\(/, '').replace(/\); \s*$/, '');
    const data = JSON.parse(jsonStr);
    const rows = data.table && data.table.rows;
    console.log("4. Satırlar ayrıştırıldı. Toplam satır sayısı:", rows ? rows.length : 0);

    if (!rows) {
      console.error("Hata: Tablonun içinde veri satırı bulunamadı!");
      return;
    }

    rows.forEach(row => {
      if (!row.c || !row.c[0]) return;
      const sinifRaw = row.c[0].v || row.c[0].f || '';
      const fiyatRaw = row.c[1] ? (row.c[1].v || row.c[1].f || '') : '';
      const normalized = normalizeSinif(sinifRaw);
      const id = SINIF_ID_MAP[normalized];
      console.log(`Eşleşme Kontrolü -> Tablodaki: "${sinifRaw}" | Kodda Aranan ID: "${id}" | Fiyat: ${fiyatRaw}`);
      if (id) populatePriceElements(id, fiyatRaw);
    });
    console.log("5. Tüm fiyatlar başarıyla arayüze basıldı!");
  } catch (e) {
    console.error("Sheets Bağlantı Hatası:", e);
  }
}

sheetstenFiyatlariYukle();

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
  entries.forEach(entry => {
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
