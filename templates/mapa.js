const TEXTOS = require('../assets/js/textos.js');

function rutaConPrefijo(idioma) {
  return idioma === 'es' ? '' : `${idioma}/`;
}

function generarSelectorIdioma(idioma, raizRelativa, rutaDentroDelIdioma) {
  const enlaces = TEXTOS.idiomas
    .map((codigo) => {
      const t = TEXTOS[codigo];
      if (codigo === idioma) {
        return `<span class="idioma-actual">${t.bandera}${t.etiquetaIdioma}</span>`;
      }
      const href = `${raizRelativa}${rutaConPrefijo(codigo)}${rutaDentroDelIdioma}`;
      return `<a href="${href}">${t.bandera}${t.etiquetaIdioma}</a>`;
    })
    .join('');
  return `<nav class="selector-idioma">${enlaces}</nav>`;
}

function generarMapaGeneral(datos, idioma, profundidad) {
  const t = TEXTOS[idioma];
  const raiz = '../'.repeat(profundidad);

  const paradasJs = JSON.stringify(
    datos.paradas.map((p) => ({ id: p.id, nombre: p.nombre, lat: p.coordenadas.lat, lng: p.coordenadas.lng }))
  );
  const lineasJs = JSON.stringify(
    datos.lineas.map((l) => ({ id: l.id, nombre: l.nombre, color: l.color, paradasIds: l.paradasIds || [] }))
  );

  const leyendaHtml = datos.lineas
    .map(
      (l) => `
    <div class="leyenda-item">
      <span class="leyenda-color" style="background:${l.color}"></span>
      <span>${l.nombre}</span>
    </div>`
    )
    .join('');

  const listaParadasHtml = datos.paradas
    .map((p) => `<li><a href="parada/${p.id}/index.html">${p.nombre}</a></li>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="${idioma}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.tituloMapaGeneral}</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
<link rel="stylesheet" href="${raiz}assets/css/estilos.css">
</head>
<body data-idioma="${idioma}">
<header class="cabecera-parada">
  ${generarSelectorIdioma(idioma, raiz, 'index.html')}
  <h1>${t.h1MapaGeneral}</h1>
  <p>${t.subtituloMapaGeneral}</p>
</header>

<div id="mapa-general" class="mapa-general"></div>

<main>
  <section class="seccion-leyenda">
    <h2>${t.lineas}</h2>
    ${leyendaHtml}
  </section>

  <section class="seccion-lista-paradas">
    <h2>${t.todasLasParadas}</h2>
    <ul class="lista-paradas-temporal">
      ${listaParadasHtml}
    </ul>
  </section>
</main>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script src="${raiz}assets/js/textos.js"></script>
<script>
  const PARADAS = ${paradasJs};
  const LINEAS = ${lineasJs};
</script>
<script src="${raiz}assets/js/mapa.js"></script>
</body>
</html>
`;
}

module.exports = { generarMapaGeneral };
