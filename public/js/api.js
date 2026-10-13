// Közös segédfüggvények a frontendhez.
// A backend a public/api/ mappában lévő PHP fájlokon keresztül érhető el, JSON-t ad vissza.
const API_BASE = 'api/';

/**
 * Kérés a backend felé.
 * Hiba esetén (nem 2xx válasz) Error-t dob, aminek van .status mezője,
 * az üzenete pedig a backend által küldött {"error": "..."} szöveg.
 */
async function api(path, { method = 'GET', body } = {}) {
  const options = { method, credentials: 'same-origin', headers: { Accept: 'application/json' } };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(API_BASE + path, options);
  } catch {
    const err = new Error('Nem sikerült elérni a szervert. Ellenőrizd az internetkapcsolatot!');
    err.status = 0;
    throw err;
  }

  let data = null;
  try { data = await res.json(); } catch { /* üres vagy nem JSON válasz */ }

  if (!res.ok) {
    const err = new Error((data && data.error) || `Váratlan hiba történt (${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// HTML-be írt felhasználói adatok kiszűrése (XSS ellen)
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// A MySQL a boolean-t 0/1-ként (néha "0"/"1" szövegként) adja vissza
function bool(value) {
  return value === true || value == 1;
}
