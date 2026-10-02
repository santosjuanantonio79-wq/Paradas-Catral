(function () {
  const TILES_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const ATRIBUCION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  const RADIO_TIERRA_M = 6378137;
  const SEPARACION_METROS = 9;

  function calcularRumbo([lat1, lng1], [lat2, lng2]) {
    const rad = Math.PI / 180;
    const y = Math.sin((lng2 - lng1) * rad) * Math.cos(lat2 * rad);
    const x =
      Math.cos(lat1 * rad) * Math.sin(lat2 * rad) -
      Math.sin(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos((lng2 - lng1) * rad);
    return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
  }

  function desplazarPunto([lat, lng], rumboGrados, metros) {
    const rad = Math.PI / 180;
    const deltaLat = ((metros * Math.cos(rumboGrados * rad)) / RADIO_TIERRA_M) * (180 / Math.PI);
    const deltaLng =
      ((metros * Math.sin(rumboGrados * rad)) / (RADIO_TIERRA_M * Math.cos(lat * rad))) * (180 / Math.PI);
    return [lat + deltaLat, lng + deltaLng];
  }

  // Cuando dos líneas comparten el mismo tramo (p. ej. ida y vuelta), sus recorridos
  // se dibujarían exactamente uno encima del otro. Para que se distingan, desplazamos
  // cada línea un poco hacia un lado, perpendicular a su propio recorrido.
  function puntosDesplazadosDeLinea(indiceLinea, totalLineas, puntos) {
    if (puntos.length < 2) return puntos;
    const rumboBase = calcularRumbo(puntos[0], puntos[puntos.length - 1]);
    const rumboPerpendicular = rumboBase + 90;
    const offsetMetros = (indiceLinea - (totalLineas - 1) / 2) * SEPARACION_METROS;
    return puntos.map((p) => desplazarPunto(p, rumboPerpendicular, offsetMetros));
  }

  function crearIconoParada(destacado) {
    return L.divIcon({
      className: destacado ? 'icono-parada icono-parada-actual' : 'icono-parada',
      html: '<div class="icono-parada-punto"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  }

  function contenidoPopup(parada, lineas, prefijoEnlace, esActual) {
    const chips = lineas
      .filter((l) => l.paradasIds.includes(parada.id))
      .map((l) => `<span class="mini-chip" style="background:${l.color}">${l.nombre}</span>`)
      .join(' ');
    const enlace = esActual ? '' : `<br><a href="${prefijoEnlace}${parada.id}/index.html">Ver horarios →</a>`;
    return `<strong>${parada.nombre}</strong><br>${chips}${enlace}`;
  }

  // Dibuja los recorridos de `lineas` y un marcador por cada parada de `paradas`.
  // `idParadaActual` (si se indica) se resalta como "estás aquí". Devuelve los
  // elementos del mapa, listos para encuadrar la vista con fitBounds.
  function dibujarLineasYParadas(mapa, lineas, paradas, idParadaActual, prefijoEnlace) {
    const elementosParaEncuadrar = [];

    lineas.forEach((linea, indice) => {
      const puntos = linea.paradasIds
        .map((id) => paradas.find((p) => p.id === id))
        .filter(Boolean)
        .map((p) => [p.lat, p.lng]);

      if (puntos.length >= 2) {
        const puntosSeparados = puntosDesplazadosDeLinea(indice, lineas.length, puntos);
        const trazado = L.polyline(puntosSeparados, { color: linea.color, weight: 5, opacity: 0.9 })
          .addTo(mapa)
          .bindTooltip(linea.nombre, { sticky: true });
        elementosParaEncuadrar.push(trazado);
      }
    });

    paradas.forEach((parada) => {
      const esActual = parada.id === idParadaActual;
      const marcador = L.marker([parada.lat, parada.lng], { icon: crearIconoParada(esActual) })
        .addTo(mapa)
        .bindTooltip(esActual ? `${parada.nombre} (aquí)` : parada.nombre, {
          permanent: true,
          direction: 'top',
          offset: [0, -6],
          className: esActual ? 'etiqueta-parada etiqueta-parada-actual' : 'etiqueta-parada'
        })
        .bindPopup(contenidoPopup(parada, lineas, prefijoEnlace, esActual));
      elementosParaEncuadrar.push(marcador);
    });

    return elementosParaEncuadrar;
  }

  function encuadrar(mapa, elementos, centroReserva) {
    if (elementos.length) {
      mapa.fitBounds(L.featureGroup(elementos).getBounds().pad(0.25));
    } else {
      mapa.setView(centroReserva, 15);
    }
  }

  // Mapa general (index.html): todas las paradas de Catral y todos los recorridos.
  function iniciarMapaGeneral() {
    const contenedor = document.getElementById('mapa-general');
    if (!contenedor || typeof L === 'undefined' || typeof PARADAS === 'undefined') return;

    const mapa = L.map('mapa-general');
    L.tileLayer(TILES_URL, { maxZoom: 19, attribution: ATRIBUCION }).addTo(mapa);

    const elementos = dibujarLineasYParadas(mapa, LINEAS, PARADAS, null, 'parada/');
    encuadrar(mapa, elementos, [38.16, -0.8]);
  }

  // Mapa de una ficha de parada: muestra las demás paradas donde deja el autobús
  // (las de las líneas que pasan por aquí), no solo el punto de esta parada.
  async function iniciarMapaParada() {
    const contenedor = document.getElementById('mapa-parada');
    if (!contenedor || typeof L === 'undefined') return;

    const idActual = document.body.dataset.paradaId;
    const profundidad = Number(document.body.dataset.profundidad || '0');
    const prefijo = '../'.repeat(profundidad);

    const respuesta = await fetch(`${prefijo}data/paradas.json`);
    const datos = await respuesta.json();

    const paradas = datos.paradas.map((p) => ({ id: p.id, nombre: p.nombre, lat: p.coordenadas.lat, lng: p.coordenadas.lng }));
    const lineas = datos.lineas.map((l) => ({ id: l.id, nombre: l.nombre, color: l.color, paradasIds: l.paradasIds || [] }));

    const lineasDeEstaParada = lineas.filter((l) => l.paradasIds.includes(idActual));
    const idsRelevantes = new Set([idActual]);
    lineasDeEstaParada.forEach((l) => l.paradasIds.forEach((id) => idsRelevantes.add(id)));
    const paradasRelevantes = paradas.filter((p) => idsRelevantes.has(p.id));

    const mapa = L.map('mapa-parada');
    L.tileLayer(TILES_URL, { maxZoom: 19, attribution: ATRIBUCION }).addTo(mapa);

    const elementos = dibujarLineasYParadas(mapa, lineasDeEstaParada, paradasRelevantes, idActual, '../');
    const propia = paradas.find((p) => p.id === idActual);
    encuadrar(mapa, elementos, propia ? [propia.lat, propia.lng] : [38.16, -0.8]);
  }

  document.addEventListener('DOMContentLoaded', () => {
    iniciarMapaGeneral();
    iniciarMapaParada();
  });
})();
