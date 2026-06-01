# 💍 Web de Boda · Isabella & Alejandro · 31.07.2027

Sitio web completo de boda, listo para subir a **GitHub Pages** (gratis).

---

## 📁 Estructura

```
wedding-web/
├── index.html              ← Página principal
├── css/styles.css          ← Estilos globales
├── js/main.js              ← Countdown, modal RSVP, envío formulario
├── pages/
│   └── vestimenta.html     ← Código de vestimenta completo
├── invitation/
│   └── invite.html         ← Invitación digital imprimible con QR
├── assets/img/             ← Carpeta para tus fotos
├── apps-script.gs          ← Código para Google Apps Script (RSVP → Sheets)
└── README.md               ← Este archivo
```

---

## 🚀 Cómo subir a GitHub Pages (paso a paso)

### Paso 1 — Crea un repositorio en GitHub
1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en **New repository**
3. Nombre: `wedding-web` (o el que prefieras)
4. Ponlo en **Public**
5. Haz clic en **Create repository**

### Paso 2 — Sube los archivos
**Opción A — Sin instalar nada (desde el navegador):**
1. En tu repositorio vacío, haz clic en **uploading an existing file**
2. Arrastra toda la carpeta `wedding-web` o selecciona todos los archivos
3. Haz clic en **Commit changes**

**Opción B — Con Git (terminal):**
```bash
cd ruta/a/wedding-web
git init
git add .
git commit -m "Web de boda Isabella & Alejandro"
git remote add origin https://github.com/TU-USUARIO/wedding-web.git
git push -u origin main
```

### Paso 3 — Activa GitHub Pages
1. En tu repositorio, ve a **Settings** → **Pages** (barra lateral)
2. En "Branch", selecciona `main` y carpeta `/ (root)`
3. Haz clic en **Save**
4. En 1-2 minutos tu web estará en: `https://TU-USUARIO.github.io/wedding-web/`

---

## 📋 Conectar el formulario RSVP con Google Sheets

### Paso 1 — Crea el Google Sheet
1. Abre [sheets.google.com](https://sheets.google.com) y crea una hoja nueva
2. Ponle nombre: `Invitados Isabella & Alejandro`
3. (Las cabeceras se crean automáticamente con el primer envío)

### Paso 2 — Configura Apps Script
1. En el Sheet, ve a **Extensions → Apps Script**
2. Borra todo el código que aparece
3. Copia y pega el contenido de `apps-script.gs`
4. Guarda con **Ctrl+S** (o ⌘+S en Mac)

### Paso 3 — Despliega como Web App
1. Haz clic en **Deploy → New deployment**
2. Tipo: **Web App**
3. Configuración:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
4. Haz clic en **Deploy**
5. **Copia la URL** que aparece (empieza por `https://script.google.com/macros/s/...`)

### Paso 4 — Pega la URL en el código
Abre `js/main.js` y en la línea 5, reemplaza:
```js
const APPS_SCRIPT_URL = 'REEMPLAZA_CON_TU_APPS_SCRIPT_URL';
```
por:
```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TU_ID/exec';
```
Guarda el archivo y vuelve a subirlo a GitHub.

---

## 📸 Cambiar los links de fotos

En `index.html`, busca estas dos líneas y reemplaza con tus links reales:

```html
<a href="REEMPLAZA_CON_TU_LINK_WEUPLOADER" ...>Subir Fotos</a>
<a href="REEMPLAZA_CON_TU_LINK_GALERIA" ...>Ver Galería</a>
```

---

## 🖼 Añadir tus fotos al apartado de fotos

Guarda tus fotos en `assets/img/` y en `index.html` reemplaza los bloques:
```html
<div class="photo-placeholder">📷</div>
```
por:
```html
<div class="photo-placeholder"><img src="assets/img/foto1.jpg" alt="Boda" /></div>
```

---

## 🔗 Actualizar la URL del QR en la invitación

Una vez tengas tu URL de GitHub Pages, abre `invitation/invite.html` y en el script del QR cambia la URL:

```js
text: 'https://TU-USUARIO.github.io/wedding-web/',
```

---

## ✉️ Cambiar el email de contacto

En `index.html`, busca y reemplaza:
```
isabellayalejandro2027@gmail.com
```
por vuestro email real.

---

## 💌 Páginas del sitio

| Página | URL |
|--------|-----|
| Inicio + RSVP | `tu-url/index.html` |
| Código de Vestimenta | `tu-url/pages/vestimenta.html` |
| Invitación con QR | `tu-url/invitation/invite.html` |

---

*Hecho con ♥ para Isabella & Alejandro · 31 de Julio de 2027*
