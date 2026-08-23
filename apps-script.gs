// =============================================
// GOOGLE APPS SCRIPT · Web de Boda Isabella & Alejandro
// =============================================
// INSTRUCCIONES:
// 1. Abre tu Google Sheet
// 2. Ve a Extensiones → Apps Script
// 3. Pega TODO este código (borra el que hay)
// 4. Guarda (Cmd+S)
// 5. Deploy → Manage deployments → lápiz (editar el despliegue que ya existe)
//    → Version: New version → Deploy
//    OJO: guardar NO basta. Mientras no cambies la versión del despliegue,
//    Google sigue ejecutando el código viejo.
//    Y si creas un despliegue NUEVO, la URL cambia y hay que actualizarla
//    también en main.js (APPS_SCRIPT_URL).
// =============================================
// LAS TRES PESTAÑAS
// - Hoja de respuestas: una fila por confirmación. Las columnas nuevas se
//   añaden siempre AL FINAL, para no descuadrar las respuestas ya guardadas.
// - "Invitados": la lista de correos autorizados. LA RELLENAS TÚ.
//   Un correo por fila en la columna A, desde la fila 2.
//   Si está vacía, el formulario deja pasar a todo el mundo (así no bloqueas
//   la web sin querer antes de tener la lista).
// - "Resumen": los totales para el catering. Son fórmulas: se actualizan
//   solas. No escribas nada ahí, el script la rehace.
// =============================================

const RESUMEN_NOMBRE   = 'Resumen';
const INVITADOS_NOMBRE = 'Invitados';
const HOJAS_AUXILIARES = [RESUMEN_NOMBRE, INVITADOS_NOMBRE];

const HEADERS = [
  'Fecha y Hora',
  'Nombre',
  'Email',
  'Teléfono',
  '¿Asiste?',
  'Acompañantes',
  'Alergias / Intolerancias',
  'Comentarios',
  'Plato principal (por comensal)',
  'Resumen platos',
  'Comensales',
  'Cordero',
  'Ternera',
  'Menú especial',
  'Comprobación'
];

// Columnas numéricas, para las fórmulas del resumen (1 = A)
const COL_COMENSALES = 11; // K
const COL_CORDERO    = 12; // L
const COL_TERNERA    = 13; // M
const COL_ESPECIAL   = 14; // N

// =============================================
// 1. GUARDAR UNA CONFIRMACIÓN
// =============================================
function doPost(e) {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = hojaRespuestas_(ss);

    asegurarCabeceras_(sheet);
    asegurarInvitados_(ss);

    const data   = JSON.parse(e.postData.contents);
    const asiste = data.asiste === 'si';

    // Se vuelve a comprobar aquí, no solo en la web: si alguien enviara datos
    // saltándose el formulario, la fila queda marcada en vez de colarse limpia.
    const check = estaInvitado_(ss, data.email);
    let comprobacion = '✅ En la lista';
    if (check.listaVacia)      comprobacion = '➖ Lista de invitados vacía';
    else if (!check.invitado)  comprobacion = '⚠️ NO estaba en la lista';

    sheet.appendRow([
      data.timestamp     || new Date().toLocaleString('es-ES'),
      data.nombre        || '',
      data.email         || '',
      data.telefono      || '',
      asiste ? '✅ Sí' : '❌ No',
      data.acompanantes  || 0,
      data.alergias      || '—',
      data.comentarios   || '—',
      data.platos        || '—',
      data.platosResumen || '—',
      num_(data.comensales),
      num_(data.nCordero),
      num_(data.nTernera),
      num_(data.nEspecial),
      comprobacion,
    ]);

    asegurarResumen_(ss, sheet);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================
// 2. COMPROBAR SI UN CORREO ESTÁ INVITADO
// La web llama a esta URL con ?email=...&callback=...
// Solo devuelve un sí o un no: la lista nunca sale de aquí.
// =============================================
function doGet(e) {
  const p  = (e && e.parameter) ? e.parameter : {};
  const cb = p.callback;

  // Sin callback es una visita normal a la URL (prueba manual)
  if (!cb) {
    return ContentService
      .createTextOutput('Web App de Isabella & Alejandro activa ♥')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  // El nombre de la función lo pone la web: se limpia antes de escribirlo
  if (!/^[A-Za-z0-9_]{1,64}$/.test(cb)) {
    return ContentService
      .createTextOutput('callback no válido')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  let res;
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    asegurarInvitados_(ss);
    res = estaInvitado_(ss, p.email);
  } catch (err) {
    res = { error: err.message };
  }

  return ContentService
    .createTextOutput(cb + '(' + JSON.stringify(res) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// =============================================
// LISTA DE INVITADOS
// =============================================
function normalizarEmail_(v) {
  return String(v == null ? '' : v).trim().toLowerCase();
}

/**
 * Devuelve { invitado, listaVacia }.
 * Con la lista vacía damos permiso a todos: es la forma de que la web siga
 * funcionando mientras Sandy no haya metido los correos.
 */
function estaInvitado_(ss, email) {
  const hoja = ss.getSheetByName(INVITADOS_NOMBRE);
  if (!hoja || hoja.getLastRow() < 2) {
    return { invitado: true, listaVacia: true };
  }

  const lista = hoja.getRange(2, 1, hoja.getLastRow() - 1, 1)
    .getValues()
    .map(fila => normalizarEmail_(fila[0]))
    .filter(String);

  if (lista.length === 0) return { invitado: true, listaVacia: true };

  return { invitado: lista.indexOf(normalizarEmail_(email)) !== -1, listaVacia: false };
}

function asegurarInvitados_(ss) {
  let hoja = ss.getSheetByName(INVITADOS_NOMBRE);
  if (hoja) return hoja;

  hoja = ss.insertSheet(INVITADOS_NOMBRE);
  hoja.getRange('A1:C1').setValues([['Correo del invitado', 'Nombre (opcional)', 'Notas (opcional)']]);
  hoja.getRange('A1:C1')
    .setBackground('#3D2B1F')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');
  hoja.setFrozenRows(1);
  hoja.setColumnWidth(1, 280);
  hoja.setColumnWidth(2, 200);
  hoja.setColumnWidth(3, 260);
  hoja.getRange('E2').setValue(
    'Un correo por fila en la columna A, desde la fila 2. ' +
    'No importan mayúsculas ni espacios. ' +
    'Mientras esta lista esté vacía, el formulario deja pasar a todo el mundo.'
  );
  hoja.getRange('E2').setFontColor('#999999').setFontSize(9);
  return hoja;
}

// =============================================
// HOJA DE RESPUESTAS
// =============================================
/**
 * La hoja de respuestas es la primera pestaña que no sea auxiliar.
 * No usamos getActiveSheet(): devolvería la pestaña que esté abierta en ese
 * momento, y podría escribir las respuestas dentro del resumen.
 */
function hojaRespuestas_(ss) {
  const hojas = ss.getSheets().filter(h => HOJAS_AUXILIARES.indexOf(h.getName()) === -1);
  return hojas[0] || ss.getSheets()[0];
}

function num_(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

/**
 * Escribe la fila de cabeceras si la hoja está vacía y, si ya tenía datos,
 * completa las cabeceras nuevas que falten sin tocar las respuestas.
 */
function asegurarCabeceras_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    formatoCabecera_(sheet);
    sheet.setFrozenRows(1);
    return;
  }

  const ancho = Math.max(sheet.getLastColumn(), HEADERS.length);
  const actuales = sheet.getRange(1, 1, 1, ancho).getValues()[0];
  let cambios = false;

  HEADERS.forEach((titulo, i) => {
    if (!actuales[i]) {
      actuales[i] = titulo;
      cambios = true;
    }
  });

  if (cambios) {
    sheet.getRange(1, 1, 1, ancho).setValues([actuales]);
    formatoCabecera_(sheet);
  }
}

function formatoCabecera_(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setBackground('#3D2B1F')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');
}

// =============================================
// HOJA RESUMEN
// =============================================
/**
 * Crea (o rehace) la hoja "Resumen" con los totales para el catering.
 * Son fórmulas sobre las columnas numéricas, así que se actualizan solas
 * en cuanto llega una respuesta nueva o si corriges una fila a mano.
 * Quien dice que no asiste suma 0 comensales, así que no hace falta filtrar.
 */
function asegurarResumen_(ss, hojaDatos) {
  let r = ss.getSheetByName(RESUMEN_NOMBRE);
  if (!r) r = ss.insertSheet(RESUMEN_NOMBRE);

  const n = "'" + hojaDatos.getName().replace(/'/g, "''") + "'!";
  const col = i => n + columnaLetra_(i) + ':' + columnaLetra_(i);

  r.getRange('A1:B12').clearContent();

  r.getRange('A1').setValue('Resumen para el catering');
  r.getRange('A2').setValue('Se actualiza solo. No escribas nada en esta hoja: el formulario la rehace.');

  const filas = [
    ['Invitados confirmados',         '=SUM(' + col(COL_COMENSALES) + ')'],
    ['Lingote de cordero',            '=SUM(' + col(COL_CORDERO)    + ')'],
    ['Lomo de ternera',               '=SUM(' + col(COL_TERNERA)    + ')'],
    ['Menú especial (veg./infantil)', '=SUM(' + col(COL_ESPECIAL)   + ')'],
  ];
  r.getRange(4, 1, filas.length, 2).setValues(filas);

  r.getRange('A9').setValue('Respuestas recibidas');
  r.getRange('B9').setFormula('=COUNTA(' + n + 'B2:B)');
  r.getRange('A10').setValue('Han dicho que no vienen');
  r.getRange('B10').setFormula('=COUNTIF(' + col(5) + ',"*No*")');
  r.getRange('A11').setValue('Confirmaciones a revisar (no estaban en la lista)');
  r.getRange('B11').setFormula('=COUNTIF(' + col(15) + ',"*NO estaba*")');

  // Formato
  r.getRange('A1').setFontSize(14).setFontWeight('bold').setFontColor('#3D2B1F');
  r.getRange('A2').setFontSize(9).setFontColor('#999999');
  r.getRange('A4:A7').setFontWeight('bold');
  r.getRange('B4:B7').setFontSize(14).setFontWeight('bold').setFontColor('#3D2B1F');
  r.getRange('A4:B7').setBackground('#F7F3EE');
  r.setColumnWidth(1, 300);
  r.setColumnWidth(2, 90);
}

function columnaLetra_(n) {
  let s = '';
  while (n > 0) {
    const resto = (n - 1) % 26;
    s = String.fromCharCode(65 + resto) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// =============================================
// UTILIDAD
// Ejecútala a mano desde el editor (botón Ejecutar) para crear las pestañas
// "Invitados" y "Resumen" sin esperar a la siguiente confirmación.
// =============================================
function prepararHojas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = hojaRespuestas_(ss);
  asegurarCabeceras_(hoja);
  asegurarInvitados_(ss);
  asegurarResumen_(ss, hoja);
}
