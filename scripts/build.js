const fs = require('fs');
const path = require('path');
const { generarFichaParada } = require('../templates/parada.js');
const { generarMapaGeneral } = require('../templates/mapa.js');

const RAIZ = path.join(__dirname, '..');
const CARPETA_PUBLIC = path.join(RAIZ, 'public');

// 'es' es el idioma por defecto y vive en la raíz (sin prefijo en la URL).
// 'va' y 'en' viven en su propia subcarpeta: /va/..., /en/...
const IDIOMAS = ['es', 'va', 'en'];

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

  // 1. Copiar los datos para que estén disponibles en el navegador (fetch) — un único
  //    JSON, compartido por los tres idiomas, no hace falta traducirlo.
  fs.mkdirSync(path.join(CARPETA_PUBLIC, 'data'), { recursive: true });
  fs.copyFileSync(
    path.join(RAIZ, 'data', 'paradas.json'),
    path.join(CARPETA_PUBLIC, 'data', 'paradas.json')
  );

  // 2. Copiar los recursos estáticos (css, js) — también compartidos.
  copiarCarpeta(path.join(RAIZ, 'assets'), path.join(CARPETA_PUBLIC, 'assets'));

  // 3. Generar las páginas de cada idioma.
  //    'es' en la raíz (profundidad 0 / 2), 'va' y 'en' en su subcarpeta (profundidad 1 / 3).
  for (const idioma of IDIOMAS) {
    const carpetaIdioma = idioma === 'es' ? CARPETA_PUBLIC : path.join(CARPETA_PUBLIC, idioma);
    const profundidadRaiz = idioma === 'es' ? 0 : 1;
    const profundidadParada = idioma === 'es' ? 2 : 3;

    for (const parada of datos.paradas) {
      const html = generarFichaParada(parada, datos, idioma, profundidadParada);
      const carpetaParada = path.join(carpetaIdioma, 'parada', parada.id);
      fs.mkdirSync(carpetaParada, { recursive: true });
      fs.writeFileSync(path.join(carpetaParada, 'index.html'), html);
      console.log(`✓ [${idioma}] parada/${parada.id}/index.html`);
    }

    fs.mkdirSync(carpetaIdioma, { recursive: true });
    fs.writeFileSync(
      path.join(carpetaIdioma, 'index.html'),
      generarMapaGeneral(datos, idioma, profundidadRaiz)
    );
    console.log(`✓ [${idioma}] index.html`);
  }

  console.log('\nListo. Abre public/index.html en el navegador para probar.');
}

construir();
