// =============================================
// GOOGLE APPS SCRIPT · Web de Boda Isabella & Alejandro
// =============================================
// INSTRUCCIONES:
// 1. Abre tu Google Sheet
// 2. Ve a Extensions → Apps Script
// 3. Pega TODO este código (borra el que hay)
// 4. Guarda (Ctrl+S)
// 5. Deploy → New deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Copia la URL y pégala en js/main.js donde dice APPS_SCRIPT_URL
// =============================================

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Añadir cabeceras si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Fecha y Hora',
        'Nombre',
        'Email',
        'Teléfono',
        '¿Asiste?',
        'Acompañantes',
        'Alergias / Intolerancias',
        'Comentarios'
      ]);

      // Formato de cabecera
      const header = sheet.getRange(1, 1, 1, 8);
      header.setBackground('#3D2B1F');
      header.setFontColor('#FFFFFF');
      header.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Parsear datos del formulario
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp    || new Date().toLocaleString('es-ES'),
      data.nombre       || '',
      data.email        || '',
      data.telefono     || '',
      data.asiste === 'si' ? '✅ Sí' : '❌ No',
      data.acompanantes || 0,
      data.alergias     || '—',
      data.comentarios  || '—',
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

// Permite pruebas con GET (opcional)
function doGet() {
  return ContentService
    .createTextOutput('Web App de Isabella & Alejandro activa ♥')
    .setMimeType(ContentService.MimeType.TEXT);
}
