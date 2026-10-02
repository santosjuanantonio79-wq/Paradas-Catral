function generarCartel(parada, urlBase) {
  const url = `${urlBase.replace(/\/$/, '')}/parada/${parada.id}/`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Cartel QR — ${parada.nombre}</title>
<style>
  @page { size: A5; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    width: 148mm;
    min-height: 210mm;
    padding: 10mm 12mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    color: #111827;
  }
  h1 {
    font-size: 25px;
    text-align: center;
    line-height: 1.2;
    margin: 4mm 0 1mm;
  }
  .subtitulo {
    font-size: 14px;
    text-align: center;
    color: #555;
    margin: 0 0 8mm;
    font-style: italic;
  }
  .ilustracion {
    width: 68mm;
    height: auto;
    margin-bottom: 8mm;
  }
  .qr-caja {
    border: 3px solid #1d4ed8;
    border-radius: 12px;
    padding: 6mm;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .qr-caja img {
    width: 55mm;
    height: 55mm;
    display: block;
  }
  .parada-nombre {
    font-size: 21px;
    font-weight: 700;
    margin-top: 8mm;
    text-align: center;
  }
  .parada-direccion {
    font-size: 13px;
    color: #555;
    margin-top: 1mm;
    text-align: center;
  }
  .pie {
    margin-top: auto;
    padding-top: 8mm;
    font-size: 11px;
    color: #999;
    text-align: center;
    word-break: break-all;
  }
  @media print {
    body { width: auto; min-height: auto; }
  }
</style>
</head>
<body>
  <h1>Escanea y consulta<br>los horarios de tu autobús</h1>
  <p class="subtitulo">Escaneja i consulta els horaris del teu autobús</p>

  <svg class="ilustracion" viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(10,10)">
      <rect x="0" y="0" width="130" height="130" rx="8" fill="#fff" stroke="#1d4ed8" stroke-width="4"/>
      <g fill="#1d4ed8">
        <rect x="10" y="10" width="28" height="28"/>
        <rect x="92" y="10" width="28" height="28"/>
        <rect x="10" y="92" width="28" height="28"/>
      </g>
      <g fill="#fff">
        <rect x="16" y="16" width="16" height="16"/>
        <rect x="98" y="16" width="16" height="16"/>
        <rect x="16" y="98" width="16" height="16"/>
      </g>
      <g fill="#1d4ed8">
        <rect x="21" y="21" width="6" height="6"/>
        <rect x="103" y="21" width="6" height="6"/>
        <rect x="21" y="103" width="6" height="6"/>
      </g>
      <g fill="#1d4ed8">
        <rect x="50" y="14" width="8" height="8"/>
        <rect x="66" y="14" width="8" height="8"/>
        <rect x="50" y="30" width="8" height="8"/>
        <rect x="70" y="40" width="8" height="8"/>
        <rect x="86" y="50" width="8" height="8"/>
        <rect x="50" y="55" width="8" height="8"/>
        <rect x="60" y="70" width="8" height="8"/>
        <rect x="40" y="70" width="8" height="8"/>
        <rect x="94" y="70" width="8" height="8"/>
        <rect x="50" y="90" width="8" height="8"/>
        <rect x="66" y="94" width="8" height="8"/>
        <rect x="82" y="100" width="8" height="8"/>
        <rect x="100" y="90" width="8" height="8"/>
        <rect x="40" y="110" width="8" height="8"/>
        <rect x="60" y="112" width="8" height="8"/>
        <rect x="94" y="110" width="8" height="8"/>
      </g>
    </g>

    <g stroke="#16a34a" stroke-width="5" fill="none" stroke-linecap="round">
      <path d="M4 26 V8 H22"/>
      <path d="M118 8 H136 V26"/>
      <path d="M136 114 V132 H118"/>
      <path d="M22 132 H4 V114"/>
    </g>

    <g transform="translate(130,106) rotate(18)">
      <rect x="0" y="0" width="60" height="96" rx="12" fill="#111827"/>
      <rect x="5" y="8" width="50" height="74" rx="3" fill="#e5edff"/>
      <circle cx="30" cy="90" r="4" fill="#4b5563"/>
    </g>
  </svg>

  <div class="qr-caja">
    <img src="${parada.id}.png" alt="Código QR de ${parada.nombre}">
  </div>

  <p class="parada-nombre">${parada.nombre}</p>
  <p class="parada-direccion">${parada.direccion}</p>

  <p class="pie">${url}</p>
</body>
</html>
`;
}

module.exports = { generarCartel };
