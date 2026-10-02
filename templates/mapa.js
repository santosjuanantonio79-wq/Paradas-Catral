function generarMapaGeneral(datos) {
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
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Autobuses Catral — Mapa de paradas</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
<link rel="stylesheet" href="assets/css/estilos.css">
</head>
<body>
<header class="cabecera-parada">
  <h1>Autobuses de Catral</h1>
  <p>Toca una parada en el mapa para ver sus horarios.</p>
</header>

<div id="mapa-general" class="mapa-general"></div>

<main>
  <section class="seccion-leyenda">
    <h2>Líneas</h2>
    ${leyendaHtml}
  </section>

  <section class="seccion-lista-paradas">
    <h2>Todas las paradas</h2>
    <ul class="lista-paradas-temporal">
      ${listaParadasHtml}
    </ul>
  </section>
</main>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
  const PARADAS = ${paradasJs};
  const LINEAS = ${lineasJs};
</script>
<script src="assets/js/mapa.js"></script>
</body>
</html>
`;
}

module.exports = { generarMapaGeneral };
