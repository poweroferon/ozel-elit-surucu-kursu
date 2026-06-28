// ============================================================
// HARÇ SAYFASI – Google Sheets Dinamik Veri
// Spreadsheet: A sütunu = değişken adı, B sütunu = değer
// ============================================================
const HARC_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/16wTVELiDxVhjhMhAaXa7i3WAx_4DDBzwz2NTajbOIss/gviz/tq?tqx=out:json';

async function harcVerisiniYukle() {
  try {
    const res = await fetch(HARC_SHEETS_URL);
    if (!res.ok) return;
    const text = await res.text();
    const jsonStr = text.replace(/^[^{]*\(/, '').replace(/\);\s*$/, '');
    const data = JSON.parse(jsonStr);
    const rows = data.table && data.table.rows;
    if (!rows) return;

    const kv = {};
    rows.forEach(row => {
      if (!row.c || !row.c[0] || !row.c[1]) return;
      const key = (row.c[0].v || row.c[0].f || '').toString().trim();
      const val = (row.c[1].v || row.c[1].f || '').toString().trim();
      if (key) kv[key] = val;
    });

    // Sayfa başlığı ve açıklama
    if (kv['Sayfa Başlığı']) {
      document.querySelectorAll('[data-harc="baslik"]').forEach(el => { el.textContent = kv['Sayfa Başlığı']; });
    }
    if (kv['Sayfa Açıklaması']) {
      document.querySelectorAll('[data-harc="aciklama"]').forEach(el => { el.textContent = kv['Sayfa Açıklaması']; });
    }

    // Fiyat kartları - data-harc-key ile eşleştir
    document.querySelectorAll('[data-harc-key]').forEach(el => {
      const key = el.getAttribute('data-harc-key');
      if (kv[key] !== undefined) {
        // Sayıyı tr-TR formatına çevirip sonuna TL ekler (Örn: 8.869,60 TL yapar)
        const numVal = parseFloat(kv[key]);
        if (!isNaN(numVal)) {
          el.textContent = numVal.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + " TL";
        } else {
          el.textContent = kv[key];
        }
        el.classList.remove('harc-loading');
      }
    });

    // Sayfa Başlığı ve Açıklamasını e-tablodan çekip günceller (Yükleniyor yazısını kaldırır)
    if (kv["Sayfa Başlığı"]) {
      document.querySelectorAll('[data-harc="baslik"]').forEach(el => el.textContent = kv["Sayfa Başlığı"]);
    }
    if (kv["Sayfa Açıklaması"]) {
      const aciklamaEl = document.querySelector('[data-harc="aciklama"]');
      if (aciklamaEl) aciklamaEl.textContent = kv["Sayfa Açıklaması"];
    }
  } catch (e) {
    // Yüklenemezse placeholder kalır
  }
}

harcVerisiniYukle();
