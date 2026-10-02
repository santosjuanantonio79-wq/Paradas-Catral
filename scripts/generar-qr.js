const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { generarCartel } = require('../templates/cartel.js');

const RAIZ = path.join(__dirname, '..');
const CARPETA_QR = path.join(RAIZ, 'qr');

function generarHojaImpresion(datos, urlBase) {
  const tarjetas = datos.paradas
    .map(
      (parada) => `
      <div class="tarjeta-qr">
        <img src="${parada.id}.png" alt="QR ${parada.nombre}">
        <p class="tarjeta-qr-nombre">${parada.nombre}</p>
        <p class="tarjeta-qr-url">${urlBase.replace(/\/$/, '')}/parada/${parada.id}/</p>
        <a class="tarjeta-qr-cartel" href="cartel-${parada.id}.html">Ver cartel para imprimir →</a>
      </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Códigos QR — Autobuses Catral</title>
<style>
  body { font-family: Arial, sans-serif; margin: 24px; }
  h1 { font-size: 1.2rem; }
  .hoja { display: flex; flex-wrap: wrap; gap: 24px; }
  .tarjeta-qr {
    width: 220px; text-align: center; border: 1px dashed #999;
    border-radius: 8px; padding: 16px; page-break-inside: avoid;
  }
  .tarjeta-qr img { width: 100%; height: auto; }
  .tarjeta-qr-nombre { font-weight: bold; margin: 8px 0 2px; }
  .tarjeta-qr-url { font-size: 0.75rem; color: #555; word-break: break-all; }
  .tarjeta-qr-cartel { display: block; margin-top: 8px; font-size: 0.8rem; }
  @media print {
    body { margin: 0; }
  }
</style>
</head>
<body>
<h1>Códigos QR de las paradas de Catral — recorta y pega cada uno en su parada</h1>
<div class="hoja">${tarjetas}</div>
</body>
</html>
`;
}

async function generar() {
  const config = JSON.parse(fs.readFileSync(path.join(RAIZ, 'config.json'), 'utf8'));
  const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', 'paradas.json'), 'utf8'));

  if (config.urlBase.includes('CAMBIA-ESTO')) {
    console.log(
      'Aviso: todavia no has puesto tu dominio real en config.json (campo "urlBase").\n' +
        'Los QR de esta vez apuntaran a una URL de ejemplo que no funciona.\n' +
        'Cuando publiques la web (siguiente paso), actualiza config.json y vuelve a ejecutar "npm run generar-qr".\n'
    );
  }

  if (fs.existsSync(CARPETA_QR)) fs.rmSync(CARPETA_QR, { recursive: true });
  fs.mkdirSync(CARPETA_QR, { recursive: true });

  for (const parada of datos.paradas) {
    const url = `${config.urlBase.replace(/\/$/, '')}/parada/${parada.id}/`;
    const archivo = path.join(CARPETA_QR, `${parada.id}.png`);
    await QRCode.toFile(archivo, url, { width: 800, margin: 2 });
    console.log(`✓ qr/${parada.id}.png  →  ${url}`);

    const cartel = generarCartel(parada, config.urlBase);
    fs.writeFileSync(path.join(CARPETA_QR, `cartel-${parada.id}.html`), cartel);
    console.log(`✓ qr/cartel-${parada.id}.html`);
  }

  fs.writeFileSync(path.join(CARPETA_QR, 'index.html'), generarHojaImpresion(datos, config.urlBase));

  console.log('\nListo. Abre qr/index.html en el navegador para ver e imprimir todos los QR juntos.');
}

generar();
