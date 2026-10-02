function obtenerLineasDeParada(parada, datos) {
  const idsLineas = new Set();
  Object.values(parada.horarios).forEach((lista) => {
    lista.forEach((item) => idsLineas.add(item.lineaId));
  });
  return datos.lineas.filter((l) => idsLineas.has(l.id));
}

function generarFichaParada(parada, datos) {
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
    : `<div class="aviso aviso-vacio">No hay avisos activos.</div>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>${parada.nombre} — Autobuses Catral</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
<link rel="stylesheet" href="../../assets/css/estilos.css">
</head>
<body data-parada-id="${parada.id}" data-profundidad="2">

<header class="cabecera-parada">
  <a class="volver" href="../../index.html">← Mapa general</a>
  <h1>${parada.nombre}</h1>
  <p class="direccion">${parada.direccion}</p>
</header>

<main>
  <section class="seccion-proximos">
    <h2>Próximos autobuses</h2>
    <div id="proximos-autobuses" class="proximos-autobuses">
      <p>Cargando horarios…</p>
    </div>
  </section>

  <section class="seccion-horarios">
    <button id="boton-ver-horarios" class="boton-secundario">Ver todos los horarios</button>
    <div id="tabla-horarios" class="tabla-horarios-wrap" hidden></div>
  </section>

  <section class="seccion-recorridos">
    <h2>Líneas que paran aquí</h2>
    ${recorridosHtml}
  </section>

  <section class="seccion-mapa">
    <h2>Dónde está</h2>
    <div id="mapa-parada" class="mapa-parada"></div>
    <a class="enlace-mapa-general" href="../../index.html">Ver mapa general de todas las paradas</a>
  </section>

  <section class="seccion-contacto">
    <h2>Contacto y avisos</h2>
    ${empresasHtml}
    ${avisoHtml}
  </section>
</main>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script src="../../assets/js/mapa.js"></script>
<script src="../../assets/js/horarios.js"></script>
</body>
</html>
`;
}

module.exports = { generarFichaParada };
