/* =============================================
   PÉTALOS DE ROSA BEIGE CAYENDO
   Fondo animado global. Se auto-inyecta al cargar
   cualquier página que incluya este script.
   Estilos en styles.css (.petals-layer / .petal)
   ============================================= */
(function () {
  'use strict';

  var CONFIG = {
    count: 9,               // densidad sutil: pocos pétalos, pero grandes
    sizeMin: 28,            // px — pétalos grandes
    sizeMax: 52,
    fallMin: 19,            // segundos de caída (lento = más calmado)
    fallMax: 32,
    swayTimeMin: 3.4,       // segundos por ciclo de vaivén
    swayTimeMax: 6.8,
    swayMin: 35,            // amplitud lateral en px
    swayMax: 95,
    opacityMin: 0.22,       // muy translúcidos: al ser grandes, cualquier
    opacityMax: 0.38,       // exceso de opacidad compite con los titulares
    // Tonos beige de la propia paleta (--gold-light, --border, --gold)
    palette: [
      ['#F1E4CE', '#E3CDAB'],
      ['#E8D5B7', '#D4B896'],
      ['#DFCBA9', '#CBAE7C']
    ]
  };

  /* Silueta de pétalo de rosa: base estrecha abajo, borde superior
     ancho y acopado con la muesca central. Va como máscara SVG,
     así el color lo pone el degradado del CSS. */
  var SHAPE =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M50,99 C28,87 10,71 5,51 C0,31 12,11 32,4 C40,1 45,3 50,6 C55,3 60,1 68,4 C88,11 100,31 95,51 C90,71 72,87 50,99 Z' fill='%23000'/%3E%3C/svg%3E\")";

  // Respeta la preferencia del sistema: sin movimiento, sin nodos.
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce && reduce.matches) return;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function build() {
    if (document.querySelector('.petals-layer')) return;

    var layer = document.createElement('div');
    layer.className = 'petals-layer';
    layer.setAttribute('aria-hidden', 'true');

    var frag = document.createDocumentFragment();

    for (var i = 0; i < CONFIG.count; i++) {
      var petal = document.createElement('span');
      petal.className = 'petal';

      var tone = CONFIG.palette[i % CONFIG.palette.length];
      // Reparte por el ancho de pantalla para que no se agrupen
      var slot = (100 / CONFIG.count) * i;
      var left = slot + rand(0, 100 / CONFIG.count);
      var fall = rand(CONFIG.fallMin, CONFIG.fallMax);

      petal.style.setProperty('--x', left.toFixed(2) + '%');
      petal.style.setProperty('--size', rand(CONFIG.sizeMin, CONFIG.sizeMax).toFixed(1) + 'px');
      petal.style.setProperty('--fall', fall.toFixed(2) + 's');
      // Delay negativo: al abrir la web ya hay pétalos a media caída,
      // en vez de que todos entren de golpe por arriba.
      petal.style.setProperty('--delay', (-rand(0, fall)).toFixed(2) + 's');
      petal.style.setProperty('--sway', rand(CONFIG.swayMin, CONFIG.swayMax).toFixed(0) + 'px');
      petal.style.setProperty('--sway-time', rand(CONFIG.swayTimeMin, CONFIG.swayTimeMax).toFixed(2) + 's');
      petal.style.setProperty('--op', rand(CONFIG.opacityMin, CONFIG.opacityMax).toFixed(2));
      petal.style.setProperty('--c1', tone[0]);
      petal.style.setProperty('--c2', tone[1]);
      petal.style.setProperty('--petal-shape', SHAPE);

      petal.appendChild(document.createElement('i'));
      frag.appendChild(petal);
    }

    layer.appendChild(frag);
    document.body.appendChild(layer);

    // Pausa la animación si la pestaña no está visible (ahorra batería en móvil)
    document.addEventListener('visibilitychange', function () {
      layer.classList.toggle('is-paused', document.hidden);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
