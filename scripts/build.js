const fs = require('fs');
const path = require('path');
const { generarFichaParada } = require('../templates/parada.js');
const { generarMapaGeneral } = require('../templates/mapa.js');

const RAIZ = path.join(__dirname, '..');
const CARPETA_PUBLIC = path.join(RAIZ, 'public');

function limpiarCarpeta(carpeta) {
  if (fs.existsSync(carpeta)) fs.rmSync(carpeta, { recursive: true });
  fs.mkdirSync(carpeta, { recursive: true });
}

function copiarCarpeta(origen, destino) {
  fs.mkdirSync(destino, { recursive: true });
  for (const archivo of fs.readdirSync(origen)) {
    const origenArchivo = path.join(origen, archivo);
    const destinoArchivo = path.join(destino, archivo);
    if (fs.statSync(origenArchivo).isDirectory()) {
      copiarCarpeta(origenArchivo, destinoArchivo);
    } else {
      fs.copyFileSync(origenArchivo, destinoArchivo);
    }
  }
}

function construir() {
  const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', 'paradas.json'), 'utf8'));

  limpiarCarpeta(CARPETA_PUBLIC);

  // 1. Copiar los datos para que estén disponibles en el navegador (fetch)
  fs.mkdirSync(path.join(CARPETA_PUBLIC, 'data'), { recursive: true });
  fs.copyFileSync(
    path.join(RAIZ, 'data', 'paradas.json'),
    path.join(CARPETA_PUBLIC, 'data', 'paradas.json')
  );

  // 2. Copiar los recursos estáticos (css, js)
  copiarCarpeta(path.join(RAIZ, 'assets'), path.join(CARPETA_PUBLIC, 'assets'));

  // 3. Generar una página por cada parada
  for (const parada of datos.paradas) {
    const html = generarFichaParada(parada, datos);
    const carpetaParada = path.join(CARPETA_PUBLIC, 'parada', parada.id);
    fs.mkdirSync(carpetaParada, { recursive: true });
    fs.writeFileSync(path.join(carpetaParada, 'index.html'), html);
    console.log(`✓ Generada: parada/${parada.id}/index.html`);
  }

  // 4. Página de inicio: mapa general con todas las paradas y recorridos
  fs.writeFileSync(path.join(CARPETA_PUBLIC, 'index.html'), generarMapaGeneral(datos));

  console.log('\nListo. Abre public/index.html en el navegador para probar.');
}

construir();
