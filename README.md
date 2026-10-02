# Autobuses de Catral

Web estática (sin backend) que muestra, por cada parada de autobús, los próximos
servicios según la hora actual. Pensada para escanear un código QR en la propia
parada desde el móvil.

## Requisitos

- Tener [Node.js](https://nodejs.org) instalado (cualquier versión reciente). Es lo único que hace falta, no hay librerías externas que instalar.

## Cómo rellenar tus datos reales

Todo vive en un único archivo: [`data/paradas.json`](data/paradas.json). Tiene tres partes:

### 1. `empresas`

Cada empresa de transporte que opera en Catral:

```json
{ "id": "mi-empresa", "nombre": "Nombre Empresa", "telefono": "965 000 000" }
```

- `id`: un identificador corto, sin espacios ni tildes (se usa internamente, no se ve).
- `nombre` y `telefono`: se muestran tal cual en la ficha de cada parada.

### 2. `lineas`

Cada línea de autobús:

```json
{
  "id": "l1",
  "nombre": "Línea 1",
  "empresaId": "mi-empresa",
  "color": "#2563eb",
  "recorridoTexto": "Catral (Parada A) → Catral (Parada B) → Dolores → Elche"
}
```

- `empresaId` tiene que coincidir con el `id` de una empresa de arriba.
- `color`: un color en formato hexadecimal, se usa como etiqueta de la línea.
- `recorridoTexto`: descripción en texto libre del trayecto completo.

### 3. `paradas`

Cada parada física, con su horario:

```json
{
  "id": "santa-barbara",
  "nombre": "Santa Bárbara",
  "direccion": "Calle Mayor, 12, Catral",
  "coordenadas": { "lat": 38.1601, "lng": -0.8018 },
  "avisos": "",
  "horarios": {
    "laborable": [
      { "hora": "07:30", "lineaId": "l1", "destino": "Elche" }
    ],
    "sabado": [],
    "domingo_festivo": []
  }
}
```

- `id`: se usa para la URL de la parada (`/parada/santa-barbara`). Usa minúsculas, sin espacios ni tildes (guiones en vez de espacios).
- `coordenadas`: las necesitarás para el mapa (paso siguiente). Puedes sacarlas poniendo el marcador en [Google Maps](https://maps.google.com) o [OpenStreetMap](https://www.openstreetmap.org) y copiando lat/lng.
- `avisos`: texto libre para avisar de un cambio puntual de horario (por ejemplo, "Corte de calle el 15 de octubre"). Déjalo vacío (`""`) si no hay nada que avisar.
- `horarios`: tres listas —`laborable` (lunes a viernes), `sabado` y `domingo_festivo`— cada una con los autobuses de ese tipo de día. Cada autobús es `{ "hora": "HH:MM", "lineaId": "...", "destino": "..." }`.
  - `lineaId` tiene que coincidir con el `id` de una línea de arriba.
  - Los horarios **no hace falta que estén ordenados** en el JSON, la web los ordena sola.
  - **Festivos**: de momento no hay calendario de festivos automático — un festivo entre semana se calcula como si fuera laborable. Si quieres forzarlo, cambia manualmente ese día en el futuro (lo veremos si hace falta).

Puedes añadir tantas paradas y líneas como necesites, simplemente copiando y pegando bloques con datos distintos.

## Cómo generar la web

Cada vez que cambies `data/paradas.json`, ejecuta:

```bash
npm run build
```

Esto lee el JSON y genera todas las páginas dentro de la carpeta `public/` (una por parada, más la página de inicio). No necesitas tocar nada dentro de `public/` a mano: se borra y se vuelve a crear entera cada vez.

## Cómo verla en el navegador

La forma más sencilla (porque la página pide los datos con `fetch`, que algunos navegadores bloquean si abres el archivo directamente con doble clic):

```bash
npx serve public
```

Te dará una URL tipo `http://localhost:3000` — ábrela en el navegador. También puedes verla bien en el móvil de pruebas si está en la misma wifi, usando la IP que te muestre ese comando.

## Cómo generar los códigos QR

Cada parada tiene un código QR que, al escanearlo, lleva directamente a su ficha de horarios.

1. Abre [`config.json`](config.json) y cambia `urlBase` por la dirección donde esté publicada la web (por ejemplo `https://autobusescatral.netlify.app`). Mientras no la hayas publicado, deja el valor de ejemplo — el script te avisará de que los QR aún no apuntan a ningún sitio real.
2. Ejecuta:

   ```bash
   npm run generar-qr
   ```

3. Esto crea, dentro de la carpeta `qr/`:
   - Un PNG por parada (`qr/santa-barbara.png`, `qr/ayuntamiento.png`...), listo para imprimir.
   - `qr/index.html`, una hoja con todos los QR juntos — ábrela en el navegador y usa "Imprimir" (Ctrl+P) para sacarlos todos de una vez, recórtalos y pégalos en la parada correspondiente.

**Importante**: si cambias de dominio o añades/quitas paradas, vuelve a ejecutar `npm run generar-qr` para regenerarlos todos.

## Qué falta todavía (próximos pasos)

1. **Publicación** — subir el proyecto a GitHub y desplegarlo gratis en Netlify o GitHub Pages.
2. **Valenciano** — añadir el segundo idioma.

Vamos paso a paso, así que de momento céntrate solo en rellenar `data/paradas.json` con los datos reales de Catral si quieres probarlo con información de verdad.
