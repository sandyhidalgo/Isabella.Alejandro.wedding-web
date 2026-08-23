/* =============================================
   WEB BODA - Isabella & Alejandro
   main.js
   ============================================= */

/* ---- INTRO SCREEN: Sobre que se abre al tocar ---- */
(function initIntroScreen() {
  const introScreen = document.getElementById('introScreen');
  if (!introScreen) return;

  const envelope  = document.getElementById('envelope');
  const introHint = document.getElementById('introHint');
  let   isOpening = false;

  function revelarWeb() {
    introScreen.style.display = 'none';
    document.body.style.overflow = '';
  }

  /* Si llegamos desde otra página apuntando a una sección concreta
     (index.html#fotos, #regalo, #contacto, #asistencia...), no tiene
     sentido obligar a abrir el sobre otra vez: vamos directos.
     El sobre solo aparece al entrar por la puerta principal. */
  const destino = window.location.hash;
  if (destino && destino !== '#inicio') {
    revelarWeb();

    if (destino === '#asistencia') {
      setTimeout(() => { if (typeof openModal === 'function') openModal(); }, 150);
    } else {
      let seccion = null;
      try { seccion = document.querySelector(destino); } catch (e) { /* hash no válido */ }
      if (seccion) setTimeout(() => seccion.scrollIntoView({ block: 'start' }), 60);
    }
    return;
  }

  /* Apertura: una sola clase dispara toda la coreografía.
     Los tiempos viven en styles.css (.intro-screen.is-opening),
     en un único reloj, para que las fases no se desincronicen. */
  function openEnvelope() {
    if (isOpening) return;
    isOpening = true;

    introScreen.classList.add('is-opening');

    // El final lo marca la propia animación, no un cronómetro a ciegas.
    introScreen.addEventListener('animationend', function onEnd(e) {
      if (e.animationName !== 'introDissolve') return;
      introScreen.removeEventListener('animationend', onEnd);
      revelarWeb();
    });

    // Red de seguridad por si el navegador no emite el evento.
    setTimeout(revelarWeb, 4200);
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
  renderMenuChoices();
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
  const total = selectedCompanions + 1;
  const elegidos = Array.from({ length: total },
    (_, i) => document.querySelector(`input[name="plato-${i}"]:checked`));

  // Si nadie del grupo tiene menú especial, hay que elegir plato para todos
  if (elegidos.some(r => !r) && !tieneMenuPropio()) {
    return alert(total === 1
      ? 'Por favor, elige tu plato principal.'
      : 'Por favor, elige el plato principal de cada comensal.');
  }

  goToStep(3);
}

function selectCompanions(n) {
  selectedCompanions = n;
  document.querySelectorAll('.companions-option').forEach((el, i) => {
    el.classList.toggle('selected', i === n);
  });
  renderMenuChoices();
}

/* ---- PLATO PRINCIPAL · un selector por comensal ---- */
const PLATOS = [
  {
    nombre: 'Lingote de cordero',
    desc:   'con cous cous, picada mediterránea y toffee de ajo negro',
    corto:  'Cordero',
  },
  {
    nombre: 'Lomo de ternera',
    desc:   'con zanahorias y calabaza al curry, y patata hojaldrada',
    corto:  'Ternera',
  },
];

// Alergias que ya implican un menú propio: quien las marca no elige plato
const ALERGIAS_MENU_PROPIO = ['Vegetariano', 'Vegano', 'Menú infantil'];

// Se guarda aparte para no perder lo elegido al cambiar el nº de acompañantes
let platosElegidos = [];

function renderMenuChoices() {
  const cont = document.getElementById('menu-platos');
  if (!cont) return;

  const total = selectedCompanions + 1; // el invitado + sus acompañantes
  platosElegidos.length = total;

  cont.innerHTML = Array.from({ length: total }, (_, i) => {
    const titulo = i === 0 ? 'Tu plato' : `Acompañante ${i}`;
    const opciones = PLATOS.map(p => `
        <label class="menu-option">
          <input type="radio" name="plato-${i}" value="${p.nombre}"${platosElegidos[i] === p.nombre ? ' checked' : ''} />
          <span class="menu-option-text">
            <strong>${p.nombre}</strong>
            <em>${p.desc}</em>
          </span>
        </label>`).join('');
    return `<fieldset class="menu-person">
        <legend class="menu-person-title">${titulo}</legend>
        ${opciones}
      </fieldset>`;
  }).join('');

  cont.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      platosElegidos[Number(radio.name.split('-')[1])] = radio.value;
    });
  });
}

// ¿Hay alguna alergia marcada que ya implique un menú especial?
function tieneMenuPropio() {
  return [...document.querySelectorAll('input[name="alergia"]:checked')]
    .some(cb => ALERGIAS_MENU_PROPIO.includes(cb.value));
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

  // Plato principal: detalle por comensal + recuento para el catering
  let platos = '';
  let platosResumen = '';

  if (asiste === 'si') {
    const total = selectedCompanions + 1;
    const seleccion = Array.from({ length: total },
      (_, i) => document.querySelector(`input[name="plato-${i}"]:checked`)?.value || '');

    platos = seleccion
      .map((v, i) => `${i === 0 ? 'Invitado' : 'Acompañante ' + i}: ${v || 'menú especial'}`)
      .join(' · ');

    platosResumen = PLATOS
      .map(p => ({ corto: p.corto, n: seleccion.filter(v => v === p.nombre).length }))
      .filter(x => x.n > 0)
      .map(x => `${x.corto} ×${x.n}`)
      .join(' · ');

    const especiales = seleccion.filter(v => !v).length;
    if (especiales > 0) {
      platosResumen += `${platosResumen ? ' · ' : ''}Menú especial ×${especiales}`;
    }
  }

  const data = {
    timestamp: new Date().toLocaleString('es-ES'),
    nombre,
    email,
    telefono,
    asiste,
    acompanantes: asiste === 'si' ? selectedCompanions : 0,
    alergias,
    platos,
    platosResumen,
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

/* =============================================
   REGALO · DATOS BANCARIOS
   Los datos NO se escriben en el HTML: van codificados en base64 y
   sólo se muestran cuando el invitado pulsa "Ver datos". Así los bots
   que rastrean la web en busca de IBANs y teléfonos no los encuentran.
   Es ofuscación, no cifrado: cualquiera que mire el código puede leerlos.
   ============================================= */
const GIFT_DATA = {
  giftIban:  'RVMyMiAwMTgyIDEyMTYgMjYwMiAwMTU2IDU4OTA=',
  giftSwift: 'QkJWQUVTTU0=',
  giftBizum: 'NjkxIDc4IDEwIDY4',
};

function revealGift() {
  const details = document.getElementById('giftDetails');
  const btn     = document.getElementById('giftRevealBtn');
  if (!details) return;

  Object.keys(GIFT_DATA).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = atob(GIFT_DATA[id]);
  });

  details.hidden = false;
  requestAnimationFrame(() => details.classList.add('open'));
  if (btn) btn.style.display = 'none';
}

async function copyGift(id, btn) {
  const el = document.getElementById(id);
  if (!el) return;

  // Se copia sin espacios: es lo que esperan las apps de banco
  const value = el.textContent.replace(/\s+/g, '');
  let ok = false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch (err) { ok = false; }
  }

  if (!ok) {
    // Fallback para navegadores antiguos o http:// sin cifrar
    try {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, value.length);
      ok = document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (err) { ok = false; }
  }

  if (!btn) return;
  if (!btn.dataset.label) btn.dataset.label = btn.textContent.trim();
  btn.textContent = ok ? '¡Copiado!' : 'Selecciona y copia';
  btn.classList.toggle('copied', ok);
  setTimeout(() => {
    btn.textContent = btn.dataset.label;
    btn.classList.remove('copied');
  }, 2200);
}

/* =============================================
   CONTACTO · WHATSAPP
   Los teléfonos tampoco se escriben en el HTML: van en base64 y el
   enlace wa.me se construye al cargar la página. Los bots que rastrean
   webs buscando números no los encuentran en el código fuente.
   ============================================= */
const WA_CONTACTS = [
  { link: 'waLink1', phone: 'waPhone1', n: 'MzQ2OTE3ODEwNjg=' }, // Alejandro
  { link: 'waLink2', phone: 'waPhone2', n: 'MzQ2OTI4MTEyODk=' }, // Isabella
];

const WA_MESSAGE = 'Hola, os escribo por vuestra boda del 31 de julio.';

(function initWhatsApp() {
  WA_CONTACTS.forEach(function (c) {
    const full   = atob(c.n);                    // 34XXXXXXXXX
    const local  = full.slice(2);                // 9 dígitos
    const pretty = local.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');

    const link = document.getElementById(c.link);
    const tel  = document.getElementById(c.phone);

    if (link) link.href = 'https://wa.me/' + full + '?text=' + encodeURIComponent(WA_MESSAGE);
    if (tel)  tel.textContent = '+34 ' + pretty;
  });
})();
