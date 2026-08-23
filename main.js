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

// Correo ya comprobado contra la lista de invitados en esta visita
let emailVerificado = '';

// Tope absoluto del formulario. La lista de invitados puede permitir menos,
// nunca más.
const MAX_ACOMPANANTES = 6;

// Cuántos acompañantes permite la invitación de quien está rellenando
let maxAcompanantes = 0;

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
  renderCompanions();

  // Si ya comprobamos el correo en esta visita, no lo volvemos a pedir
  if (emailVerificado) goToStep(1);
  else mostrarGate();
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
  const indicador = document.querySelector('.step-indicator');
  if (indicador) indicador.style.display = '';

  document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.step-dot').forEach(d => d.classList.remove('active'));

  document.getElementById(`step-${n}`).classList.add('active');
  const dot = document.getElementById(`dot-${n}`);
  if (dot) dot.classList.add('active');
}

/* =============================================
   LISTA DE INVITADOS
   La lista vive en la hoja de cálculo, no aquí: el navegador solo
   pregunta "¿este correo está invitado?" y recibe un sí o un no.
   Así los correos de los invitados no se publican en la web.
   ============================================= */

// Petición JSONP: Apps Script no admite fetch normal entre dominios,
// así que cargamos su respuesta como si fuera un <script>.
function preguntarAlServidor(url, msEspera) {
  return new Promise((resolve, reject) => {
    const nombre = 'cbInvitado' + Math.floor(Math.random() * 1e9);
    const tag = document.createElement('script');
    let terminado = false;

    function limpiar() {
      clearTimeout(reloj);
      window[nombre] = function () {};   // por si la respuesta llega tarde
      if (tag.parentNode) tag.parentNode.removeChild(tag);
    }

    const reloj = setTimeout(() => {
      if (terminado) return;
      terminado = true;
      limpiar();
      reject(new Error('tiempo agotado'));
    }, msEspera || 10000);

    window[nombre] = function (datos) {
      if (terminado) return;
      terminado = true;
      limpiar();
      resolve(datos);
    };

    tag.onerror = function () {
      if (terminado) return;
      terminado = true;
      limpiar();
      reject(new Error('sin conexión'));
    };

    tag.src = url + (url.indexOf('?') === -1 ? '?' : '&') + 'callback=' + nombre;
    document.head.appendChild(tag);
  });
}

function mostrarGate() {
  const indicador = document.querySelector('.step-indicator');
  if (indicador) indicador.style.display = 'none';

  document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-gate').classList.add('active');

  const campo = document.getElementById('gate-email');
  if (campo && emailVerificado) campo.value = emailVerificado;
  ocultarErrorGate();
}

function volverAlGate() {
  emailVerificado = '';
  mostrarGate();
}

function mostrarErrorGate(html) {
  const caja = document.getElementById('gate-error');
  caja.innerHTML = html;
  caja.hidden = false;
}

function ocultarErrorGate() {
  const caja = document.getElementById('gate-error');
  if (caja) { caja.hidden = true; caja.innerHTML = ''; }
}

async function comprobarInvitado() {
  const btn   = document.getElementById('btn-gate');
  const campo = document.getElementById('gate-email');
  const email = campo.value.trim().toLowerCase();

  ocultarErrorGate();

  if (!email || email.indexOf('@') === -1 || email.indexOf('.') === -1) {
    return mostrarErrorGate('Escribe un correo electrónico válido.');
  }

  btn.disabled = true;
  btn.textContent = 'Comprobando...';

  try {
    const url = APPS_SCRIPT_URL + '?email=' + encodeURIComponent(email);
    const res = await preguntarAlServidor(url, 10000);

    if (res && res.error) throw new Error(res.error);

    if (res && res.invitado) {
      emailVerificado = email;

      // Cuántos acompañantes permite esta invitación.
      // Si el servidor no manda el dato (script antiguo todavía desplegado),
      // no restringimos: peor que se cuele un acompañante de más es que
      // todos los invitados vean "invitación individual" por error.
      const permitidos = res.maxAcompanantes;
      if (permitidos === undefined || permitidos === null) {
        maxAcompanantes = MAX_ACOMPANANTES;
      } else {
        const n = Number(permitidos);
        maxAcompanantes = isNaN(n) ? 0 : n;
      }
      selectedCompanions = 0;
      renderCompanions();

      const destino = document.getElementById('email');
      destino.value = email;
      destino.readOnly = true;
      const cambiar = document.getElementById('gate-change');
      if (cambiar) cambiar.hidden = false;
      goToStep(1);
    } else {
      mostrarErrorGate(
        '<strong>Este correo no aparece en la lista de invitados.</strong>' +
        '<span>Revisa que esté bien escrito. Si crees que es un error, ' +
        '<a href="#contacto" onclick="closeModal()">escríbenos</a> y lo miramos.</span>'
      );
    }
  } catch (err) {
    // Preferimos bloquear antes que dejar pasar sin comprobar
    mostrarErrorGate(
      '<strong>No hemos podido comprobarlo ahora mismo.</strong>' +
      '<span>Puede ser un problema de conexión. Vuelve a intentarlo en unos minutos ' +
      'o <a href="#contacto" onclick="closeModal()">escríbenos</a> y confirmamos por ti.</span>'
    );
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Continuar &nbsp;→';
  }
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

  // Ahora los menús especiales son opciones de plato: todos eligen uno
  if (elegidos.some(r => !r)) {
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

/**
 * Dibuja las casillas de acompañantes según lo que permita la invitación.
 * Si no permite ninguno, se esconde el bloque entero y se dice por qué:
 * enseñar un "0" sin más parece un error del formulario.
 */
function renderCompanions() {
  const grupo   = document.getElementById('grupo-acompanantes');
  const caja    = document.getElementById('companions-options');
  const nota    = document.getElementById('acompanantes-nota');
  const solo    = document.getElementById('invitacion-individual');
  if (!caja) return;

  const tope = Math.min(Math.max(maxAcompanantes, 0), MAX_ACOMPANANTES);

  if (tope === 0) {
    selectedCompanions = 0;
    if (grupo) grupo.hidden = true;
    if (solo)  solo.hidden = false;
    renderMenuChoices();
    return;
  }

  if (grupo) grupo.hidden = false;
  if (solo)  solo.hidden = true;

  if (selectedCompanions > tope) selectedCompanions = 0;

  caja.innerHTML = Array.from({ length: tope + 1 }, (_, i) =>
    `<div class="companions-option${i === selectedCompanions ? ' selected' : ''}" data-n="${i}">${i}</div>`
  ).join('');

  caja.querySelectorAll('.companions-option').forEach(el => {
    el.addEventListener('click', () => selectCompanions(Number(el.dataset.n)));
  });

  if (nota) {
    nota.textContent = tope === 1
      ? 'Tu invitación incluye un acompañante.'
      : `Tu invitación incluye hasta ${tope} acompañantes.`;
  }

  renderMenuChoices();
}

/* ---- PLATO PRINCIPAL · un selector por comensal ---- */
// Los menús especiales son OPCIONES DE PLATO, no alergias: así cada comensal
// elige uno y solo uno, y los totales del catering salen exactos.
const PLATOS = [
  {
    campo:  'nCordero',
    nombre: 'Lingote de cordero',
    desc:   'con cous cous, picada mediterránea y toffee de ajo negro',
    corto:  'Cordero',
  },
  {
    campo:  'nTernera',
    nombre: 'Lomo de ternera',
    desc:   'con zanahorias y calabaza al curry, y patata hojaldrada',
    corto:  'Ternera',
  },
  {
    campo:  'nVegetariano',
    nombre: 'Menú vegetariano',
    desc:   'sin carne ni pescado',
    corto:  'Vegetariano',
    especial: true,
  },
  {
    campo:  'nVegano',
    nombre: 'Menú vegano',
    desc:   'sin ningún ingrediente de origen animal',
    corto:  'Vegano',
    especial: true,
  },
  {
    campo:  'nInfantil',
    nombre: 'Menú infantil',
    desc:   'para los más pequeños',
    corto:  'Infantil',
    especial: true,
  },
];

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

  // El texto libre va también en su propia columna, para poder listarlo
  // en el resumen sin tener que adivinarlo dentro de la lista de alergias.
  const otraAlergia = document.getElementById('check-otra').checked
    ? document.getElementById('otra-alergia').value.trim()
    : '';

  const alergias = [...document.querySelectorAll('input[name="alergia"]:checked')]
    .map(cb => cb.value === 'otra-especificar' ? otraAlergia : cb.value)
    .filter(Boolean)
    .join(', ');

  // Plato principal: detalle por comensal + recuento para el catering.
  // Los números van aparte, en campos propios, para poder sumarlos en la hoja:
  // "Cordero ×2" es texto y no se suma.
  let platos = '';
  let platosResumen = '';
  let comensales = 0;

  // Un contador por plato: nCordero, nTernera, nVegetariano, nVegano, nInfantil
  const conteo = {};
  PLATOS.forEach(p => { conteo[p.campo] = 0; });

  if (asiste === 'si') {
    comensales = selectedCompanions + 1;

    const seleccion = Array.from({ length: comensales },
      (_, i) => document.querySelector(`input[name="plato-${i}"]:checked`)?.value || '');

    platos = seleccion
      .map((v, i) => `${i === 0 ? 'Invitado' : 'Acompañante ' + i}: ${v || 'sin elegir'}`)
      .join(' · ');

    PLATOS.forEach(p => {
      conteo[p.campo] = seleccion.filter(v => v === p.nombre).length;
    });

    platosResumen = PLATOS
      .filter(p => conteo[p.campo] > 0)
      .map(p => `${p.corto} ×${conteo[p.campo]}`)
      .join(' · ');
  }

  // Total de menús especiales (vegetariano + vegano + infantil)
  const nEspecial = PLATOS
    .filter(p => p.especial)
    .reduce((suma, p) => suma + conteo[p.campo], 0);

  const data = {
    timestamp: new Date().toLocaleString('es-ES'),
    nombre,
    email,
    telefono,
    asiste,
    acompanantes: asiste === 'si' ? selectedCompanions : 0,
    alergias,
    otraAlergia,
    platos,
    platosResumen,
    comensales,
    nEspecial,
    comentarios,
    ...conteo,
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
