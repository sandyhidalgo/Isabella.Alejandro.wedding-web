// =============================================
// GOOGLE APPS SCRIPT · Web de Boda Isabella & Alejandro
// =============================================
// INSTRUCCIONES:
// 1. Abre tu Google Sheet
// 2. Ve a Extensions → Apps Script
// 3. Pega TODO este código (borra el que hay)
// 4. Guarda (Ctrl+S)
// 5. Deploy → Manage deployments → editar el despliegue existente
//    → Version: New version → Deploy
//    (Si creas un despliegue nuevo, la URL cambia y hay que actualizarla
//     también en main.js, en APPS_SCRIPT_URL)
// =============================================
// NOTA sobre las columnas de plato principal:
// Se añaden AL FINAL, después de "Comentarios", a propósito. Si se
// insertaran en medio, las respuestas ya guardadas quedarían descuadradas.
// El script rellena las cabeceras que falten aunque la hoja ya tenga datos.
// =============================================

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
  'Resumen platos'
];

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    asegurarCabeceras_(sheet);

    // Parsear datos del formulario
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp     || new Date().toLocaleString('es-ES'),
      data.nombre        || '',
      data.email         || '',
      data.telefono      || '',
      data.asiste === 'si' ? '✅ Sí' : '❌ No',
      data.acompanantes  || 0,
      data.alergias      || '—',
      data.comentarios   || '—',
      data.platos        || '—',
      data.platosResumen || '—',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Escribe la fila de cabeceras si la hoja está vacía y, si ya tenía datos,
 * completa las cabeceras nuevas que falten sin tocar las respuestas.
 */
function asegurarCabeceras_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const header = sheet.getRange(1, 1, 1, HEADERS.length);
    header.setBackground('#3D2B1F');
    header.setFontColor('#FFFFFF');
    header.setFontWeight('bold');
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
    const header = sheet.getRange(1, 1, 1, HEADERS.length);
    header.setBackground('#3D2B1F');
    header.setFontColor('#FFFFFF');
    header.setFontWeight('bold');
  }
}

// Permite pruebas con GET (opcional)
function doGet() {
  return ContentService
    .createTextOutput('Web App de Isabella & Alejandro activa ♥')
    .setMimeType(ContentService.MimeType.TEXT);
}
