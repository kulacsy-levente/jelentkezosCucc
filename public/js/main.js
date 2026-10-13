// Jelentkezési űrlap (index.html)

const form = document.getElementById('regForm');
const specList = document.getElementById('specList');
const formError = document.getElementById('formError');
const submitBtn = document.getElementById('submitBtn');
const successView = document.getElementById('successView');
const successTitle = document.getElementById('successTitle');
const countdownEl = document.getElementById('countdown');
const newBtn = document.getElementById('newBtn');

// Ennyi másodperc után a sikeres oldal magától visszaáll üres űrlapra
// (a nyílt napon egy tableten egymás után többen is kitöltik)
const RESET_AFTER = 20;
let countdownTimer = null;

const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const ALERT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>';

/* ---------- Szakok betöltése ---------- */
async function loadSpecializations() {
  try {
    const specs = await api('specializations');
    if (!specs || specs.length === 0) {
      specList.innerHTML = '<p class="hint">Jelenleg nincs meghirdetett szak.</p>';
      return;
    }
    specList.innerHTML = specs.map(s => `
      <label class="spec">
        <input type="checkbox" name="specIds" value="${esc(s.id)}">
        <span class="spec-body">
          <span class="spec-check" aria-hidden="true">${CHECK_ICON}</span>
          <span class="spec-text">
            <span class="spec-name">${esc(s.specName)}</span>
            ${s.years ? `<span class="spec-years">${esc(s.years)} éves képzés</span>` : ''}
          </span>
        </span>
      </label>`).join('');
  } catch (err) {
    specList.innerHTML = `
      <div class="alert" style="grid-column: 1 / -1">${ALERT_ICON}
        <span>Nem sikerült betölteni a szakokat. <button type="button" class="link-btn" id="retrySpecs">Újrapróbálom</button></span>
      </div>`;
    document.getElementById('retrySpecs').addEventListener('click', loadSpecializations);
  }
}

/* ---------- Ellenőrzés ---------- */
function setError(name, message) {
  const box = form.querySelector(`[data-field="${name}"]`);
  if (!box) return;
  box.classList.toggle('invalid', Boolean(message));
  const msg = box.querySelector(':scope > .error-msg');
  if (msg) msg.innerHTML = message ? ALERT_ICON.replace('<svg', '<svg width="16" height="16"') + esc(message) : '';
}

function readForm() {
  const radio = name => form.querySelector(`input[name="${name}"]:checked`)?.value;
  return {
    fullname: form.fullname.value.trim().replace(/\s+/g, ' '),
    school: form.school.value.trim().replace(/\s+/g, ' '),
    specIds: [...form.querySelectorAll('input[name="specIds"]:checked')].map(i => Number(i.value)),
    isDorm: radio('isDorm'),
    isLastYear: radio('isLastYear'),
  };
}

function validate(data) {
  const errors = {};
  if (!data.fullname) errors.fullname = 'Kérjük, add meg a teljes neved.';
  else if (data.fullname.split(' ').length < 2) errors.fullname = 'Kérjük, a vezeték- és keresztneved is írd be.';
  if (!data.school) errors.school = 'Kérjük, add meg, melyik iskolából érkezel.';
  if (data.specIds.length === 0) errors.specIds = 'Válassz legalább egy szakot.';
  if (data.isDorm === undefined) errors.isDorm = 'Kérjük, válassz a két lehetőség közül.';
  if (data.isLastYear === undefined) errors.isLastYear = 'Kérjük, válassz a két lehetőség közül.';

  ['fullname', 'school', 'specIds', 'isDorm', 'isLastYear'].forEach(f => setError(f, errors[f]));
  return errors;
}

// Ha a felhasználó javít egy mezőt, a hibaüzenet eltűnik
form.addEventListener('input', e => {
  const box = e.target.closest('[data-field]');
  if (box && box.classList.contains('invalid')) setError(box.dataset.field, null);
});
form.addEventListener('change', e => {
  const box = e.target.closest('[data-field]');
  if (box && box.classList.contains('invalid')) setError(box.dataset.field, null);
});

/* ---------- Beküldés ---------- */
function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.querySelector('.btn-text').textContent = loading ? 'Küldés…' : 'Jelentkezem';
  const icon = submitBtn.querySelector('svg, .spinner');
  if (loading) icon.outerHTML = '<span class="spinner" aria-hidden="true"></span>';
  else if (icon.classList.contains('spinner')) icon.outerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  formError.hidden = true;

  const data = readForm();
  const errors = validate(data);
  const firstError = Object.keys(errors)[0];
  if (firstError) {
    const box = form.querySelector(`[data-field="${firstError}"]`);
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    box.querySelector('input')?.focus({ preventScroll: true });
    return;
  }

  setLoading(true);
  try {
    await api('applicants', {
      method: 'POST',
      body: {
        fullname: data.fullname,
        school: data.school,
        specIds: data.specIds,
        isDorm: data.isDorm === '1',
        isLastYear: data.isLastYear === '1',
      },
    });
    showSuccess(data.fullname);
  } catch (err) {
    formError.innerHTML = ALERT_ICON + `<span>${esc(err.message)}</span>`;
    formError.hidden = false;
    formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } finally {
    setLoading(false);
  }
});

/* ---------- Siker / új jelentkezés ---------- */
function showSuccess(fullname) {
  // Magyar névsorrend: a keresztnév a második szó
  const firstName = fullname.split(' ')[1] || fullname;
  successTitle.textContent = `Köszönjük, ${firstName}!`;
  form.hidden = true;
  successView.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  let left = RESET_AFTER;
  const tick = () => { countdownEl.textContent = `Az űrlap ${left} másodperc múlva újra elérhető.`; };
  tick();
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    left--;
    if (left <= 0) resetForm();
    else tick();
  }, 1000);
}

function resetForm() {
  clearInterval(countdownTimer);
  form.reset();
  form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  formError.hidden = true;
  successView.hidden = true;
  form.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

newBtn.addEventListener('click', resetForm);

loadSpecializations();
