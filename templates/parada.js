const TEXTOS = require('../assets/js/textos.js');

function obtenerLineasDeParada(parada, datos) {
  const idsLineas = new Set();
  Object.values(parada.horarios).forEach((lista) => {
    lista.forEach((item) => idsLineas.add(item.lineaId));
  });
  return datos.lineas.filter((l) => idsLineas.has(l.id));
}

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

function generarFichaParada(parada, datos, idioma, profundidad) {
  const t = TEXTOS[idioma];
  const raiz = '../'.repeat(profundidad);
  const rutaDentroDelIdioma = `parada/${parada.id}/index.html`;

  const lineas = obtenerLineasDeParada(parada, datos);
  const idsEmpresas = new Set(lineas.map((l) => l.empresaId));
  const empresas = datos.empresas.filter((e) => idsEmpresas.has(e.id));

  const recorridosHtml = lineas
    .map(
      (l) => `
    <div class="recorrido-linea">
      <span class="linea-chip" style="background:${l.color}">${l.nombre}</span>
      <p>${l.recorridoTexto}</p>
    </div>`
    )
    .join('');

  const empresasHtml = empresas
    .map(
      (e) => `
    <div class="contacto-empresa">
      <strong>${e.nombre}</strong>
      <a href="tel:${e.telefono.replace(/\s+/g, '')}">${e.telefono}</a>
    </div>`
    )
    .join('');

  const avisoHtml = parada.avisos
    ? `<div class="aviso">${parada.avisos}</div>`
    : `<div class="aviso aviso-vacio">${t.sinAvisos}</div>`;

  return `<!DOCTYPE html>
<html lang="${idioma}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>${t.tituloFicha(parada.nombre)}</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
<link rel="stylesheet" href="${raiz}assets/css/estilos.css">
</head>
<body data-parada-id="${parada.id}" data-profundidad="${profundidad}" data-idioma="${idioma}">

<header class="cabecera-parada">
  ${generarSelectorIdioma(idioma, raiz, rutaDentroDelIdioma)}
  <a class="volver" href="${raiz}index.html">${t.volverMapa}</a>
  <h1>${parada.nombre}</h1>
  <p class="direccion">${parada.direccion}</p>
</header>

<main>
  <section class="seccion-proximos">
    <h2>${t.proximosAutobuses}</h2>
    <div id="proximos-autobuses" class="proximos-autobuses">
      <p>${t.cargandoHorarios}</p>
    </div>
  </section>

  <section class="seccion-horarios">
    <button id="boton-ver-horarios" class="boton-secundario">${t.verTodosHorarios}</button>
    <div id="tabla-horarios" class="tabla-horarios-wrap" hidden></div>
  </section>

  <section class="seccion-recorridos">
    <h2>${t.lineasQueParanAqui}</h2>
    ${recorridosHtml}
  </section>

  <section class="seccion-mapa">
    <h2>${t.dondeEsta}</h2>
    <div id="mapa-parada" class="mapa-parada"></div>
    <a class="enlace-mapa-general" href="${raiz}index.html">${t.verMapaGeneral}</a>
  </section>

  <section class="seccion-contacto">
    <h2>${t.contactoYAvisos}</h2>
    ${empresasHtml}
    ${avisoHtml}
  </section>
</main>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script src="${raiz}assets/js/textos.js"></script>
<script src="${raiz}assets/js/mapa.js"></script>
<script src="${raiz}assets/js/horarios.js"></script>
</body>
</html>
`;
}

module.exports = { generarFichaParada };
