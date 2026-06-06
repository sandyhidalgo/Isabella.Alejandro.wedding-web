/* =============================================
   WEB BODA - Isabella & Alejandro
   main.js
   ============================================= */

/* ---- INTRO SCREEN: Sobre que se abre al tocar ---- */
(function initIntroScreen() {
  const introScreen = document.getElementById('introScreen');
  if (!introScreen) return;

  const stage      = document.getElementById('env3dStage');
  const wrapper    = document.getElementById('envelopeWrapper');
  const envelope   = document.getElementById('envelope');
  const flapWrap   = document.getElementById('envFlapWrap');
  const seal       = document.getElementById('envSeal');
  const innerGlow  = document.getElementById('envInnerGlow');
  const letterCard = document.getElementById('letterCard');
  const introHint  = document.getElementById('introHint');
  let   isOpening  = false;

  function openEnvelope() {
    if (isOpening) return;
    isOpening = true;

    // ── 1. Ocultar texto de instrucción ──────────────────────────────
    introHint.classList.add('hidden');

    // ── 2. Vibración: simula romper el lacre ─────────────────────────
    stage.classList.add('no-float');

    // ── 3. Sello: brillo final → fragmentación ───────────────────────
    setTimeout(() => seal.classList.add('breaking'), 210);

    // ── 4. Solapa abre con física de papel (lenta → rápida → reposo) ─
    //       También liberamos overflow para que la carta pueda subir
    setTimeout(() => {
      wrapper.classList.add('open');
      flapWrap.classList.add('opening');
    }, 430);

    // ── 5. Luz interior: cálida, emerge al abrirse la solapa ─────────
    setTimeout(() => innerGlow.classList.add('glowing'), 1000);

    // ── 6. Carta sube y se DESPLIEGA (rise + scaleY) ─────────────────
    setTimeout(() => letterCard.classList.add('rising'), 1140);

    // ── 7. Flash brillante → transición cinemática ───────────────────
    setTimeout(() => introScreen.classList.add('dismissing'), 3100);

    // ── 8. Eliminar del DOM, desbloquear scroll ───────────────────────
    setTimeout(() => {
      introScreen.style.display = 'none';
      document.body.style.overflow = '';
    }, 4100);
  }

  envelope.addEventListener('click', openEnvelope);
  introHint.addEventListener('click', openEnvelope);

  // Bloquear scroll durante el intro
  document.body.style.overflow = 'hidden';
})();

/* ---- AÑADIR AL CALENDARIO ---- */
function toggleCalendar(e) {
  e.stopPropagation();
  document.getElementById('calendarDropdown').classList.toggle('open');
}

document.addEventListener('click', () => {
  const dd = document.getElementById('calendarDropdown');
  if (dd) dd.classList.remove('open');
});

function addToCalendar(type) {
  const title  = 'Boda Isabella & Alejandro';
  const start  = '20270731T150000Z'; // 17:00 Madrid = 15:00 UTC
  const end    = '20270731T230000Z';
  const detail = 'Ceremonia Religiosa 17:00h — Parroquia Hispanoamericana de la Merced, Calle de Édgar Neville 23, Madrid. Recepción 19:30h — Miravalle La Cúpula & Atrio, Guadarrama.';
  const loc    = 'Parroquia Hispanoamericana de la Merced, Calle de Édgar Neville 23, Tetuán, Madrid';

  if (type === 'google') {
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(detail)}&location=${encodeURIComponent(loc)}`;
    window.open(url, '_blank');
  } else {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Isabella&Alejandro//ES',
      'BEGIN:VEVENT',
      `DTSTART:${start}`, `DTEND:${end}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${detail.replace(/,/g, '\\,')}`,
      `LOCATION:${loc}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'boda-isabella-alejandro.ics';
    a.click();
  }
  const dd = document.getElementById('calendarDropdown');
  if (dd) dd.classList.remove('open');
}

// Cambia esta URL por la de tu Google Apps Script Web App
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw39Y_XmOAwpPXYWCPsONQsfwMoHh0wCehbtyynlRn15r7KIoeAoIRHITP1qK-qFEgU/exec';

// Estado del formulario
let selectedCompanions = 0;

/* ---- COUNTDOWN ---- */
function updateCountdown() {
  const weddingDate = new Date('2027-07-31T17:00:00');
  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    document.getElementById('countdown').innerHTML =
      '<p style="font-family:\'Cormorant Garamond\',serif;font-size:1.4rem;color:var(--gold-dark)">¡Hoy es el gran día! ♥</p>';
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('cd-days').textContent  = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-min').textContent   = String(minutes).padStart(2, '0');
  document.getElementById('cd-sec').textContent   = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ---- NAVBAR HAMBURGER ---- */
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

document.querySelectorAll('.navbar-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

/* ---- MODAL ---- */
function openModal() {
  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  goToStep(1);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ---- PASOS DEL FORMULARIO ---- */
function goToStep(n) {
  document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.step-dot').forEach(d => d.classList.remove('active'));

  document.getElementById(`step-${n}`).classList.add('active');
  const dot = document.getElementById(`dot-${n}`);
  if (dot) dot.classList.add('active');
}

function goToStep2() {
  const nombre = document.getElementById('nombre').value.trim();
  const email  = document.getElementById('email').value.trim();
  const asiste = document.querySelector('input[name="asiste"]:checked');

  if (!nombre) return alert('Por favor, introduce tu nombre.');
  if (!email || !email.includes('@')) return alert('Por favor, introduce un email válido.');
  if (!asiste) return alert('Por favor, indica si asistirás o no.');

  if (asiste.value === 'no') {
    goToStep(3); // salta al paso de comentarios
  } else {
    goToStep(2);
  }
}

function goToStep3() {
  goToStep(3);
}

function selectCompanions(n) {
  selectedCompanions = n;
  document.querySelectorAll('.companions-option').forEach((el, i) => {
    el.classList.toggle('selected', i === n);
  });
}

function toggleOtraAlergia() {
  const checked = document.getElementById('check-otra').checked;
  document.getElementById('otra-alergia').style.display = checked ? 'block' : 'none';
}

/* ---- ENVIAR FORMULARIO ---- */
async function submitForm() {
  const btn = document.getElementById('btn-enviar');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const nombre    = document.getElementById('nombre').value.trim();
  const email     = document.getElementById('email').value.trim();
  const telefono  = document.getElementById('telefono').value.trim();
  const asiste    = document.querySelector('input[name="asiste"]:checked')?.value || 'no';
  const comentarios = document.getElementById('comentarios').value.trim();

  const alergias = [...document.querySelectorAll('input[name="alergia"]:checked')]
    .map(cb => cb.value === 'otra-especificar'
      ? document.getElementById('otra-alergia').value.trim()
      : cb.value
    )
    .filter(Boolean)
    .join(', ');

  const data = {
    timestamp: new Date().toLocaleString('es-ES'),
    nombre,
    email,
    telefono,
    asiste,
    acompanantes: asiste === 'si' ? selectedCompanions : 0,
    alergias,
    comentarios,
  };

  try {
    if (APPS_SCRIPT_URL === 'REEMPLAZA_CON_TU_APPS_SCRIPT_URL') {
      // Modo demo: simula envío exitoso
      await new Promise(r => setTimeout(r, 800));
    } else {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }

    // Ocultar indicador de pasos y mostrar confirmación
    document.querySelector('.step-indicator').style.display = 'none';
    document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-confirm').classList.add('active');

  } catch (err) {
    console.error(err);
    alert('Hubo un error al enviar. Por favor, inténtalo de nuevo.');
    btn.disabled = false;
    btn.textContent = 'Enviar ♥';
  }
}

/* ---- ANIMACIONES SCROLL ---- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
