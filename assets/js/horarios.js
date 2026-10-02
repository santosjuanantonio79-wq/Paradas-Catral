(function () {
  function obtenerIdioma() {
    return (typeof TEXTOS !== 'undefined' && TEXTOS[document.body.dataset.idioma]) || TEXTOS.es;
  }

  function etiquetasDia(t) {
    return {
      laborable: t.diaLaborable,
      sabado: t.diaSabado,
      domingo_festivo: t.diaDomingoFestivo
    };
  }

  function obtenerTipoDeDia(fecha) {
    const diaSemana = fecha.getDay(); // 0 = domingo, 6 = sábado
    if (diaSemana === 0) return 'domingo_festivo';
    if (diaSemana === 6) return 'sabado';
    return 'laborable';
  }

  function horaAMinutos(hora) {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  function formatoMinutosRestantes(mins, t) {
    if (mins <= 0) return t.saliendoAhora;
    if (mins < 60) return t.enMin(mins);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return t.enHoraMin(h, m);
  }

  async function cargarDatos() {
    // "profundidad" indica cuántas carpetas hay que subir para llegar a la raíz.
    // Así los enlaces funcionan igual si la web vive en la raíz del dominio
    // o en una subcarpeta (como pasa con los proyectos de GitHub Pages).
    const profundidad = Number(document.body.dataset.profundidad || '0');
    const prefijo = '../'.repeat(profundidad);
    const respuesta = await fetch(`${prefijo}data/paradas.json`);
    return respuesta.json();
  }

  function lineaPorId(datos, id) {
    return datos.lineas.find((l) => l.id === id);
  }

  function empresaPorId(datos, id) {
    return datos.empresas.find((e) => e.id === id);
  }

  function renderizarProximos(contenedor, parada, datos, fecha) {
    const t = obtenerIdioma();
    const tipoDia = obtenerTipoDeDia(fecha);
    const horaActualMin = fecha.getHours() * 60 + fecha.getMinutes();

    const proximos = (parada.horarios[tipoDia] || [])
      .map((item) => ({ ...item, minutos: horaAMinutos(item.hora) }))
      .filter((item) => item.minutos >= horaActualMin)
      .sort((a, b) => a.minutos - b.minutos)
      .slice(0, 4);

    if (proximos.length === 0) {
      contenedor.innerHTML = `<p class="sin-buses">${t.sinBuses}</p>`;
      return;
    }

    contenedor.innerHTML = proximos
      .map((item) => {
        const linea = lineaPorId(datos, item.lineaId);
        const empresa = empresaPorId(datos, linea.empresaId);
        const restante = formatoMinutosRestantes(item.minutos - horaActualMin, t);
        return `
        <div class="proximo-bus">
          <div class="proximo-bus-hora">${item.hora}</div>
          <div class="proximo-bus-info">
            <span class="linea-chip" style="background:${linea.color}">${linea.nombre}</span>
            <span class="proximo-bus-destino">→ ${item.destino}</span>
            <span class="proximo-bus-empresa">${empresa.nombre}</span>
          </div>
          <div class="proximo-bus-restante">${restante}</div>
        </div>`;
      })
      .join('');
  }

  function renderizarTablaCompleta(contenedor, parada, datos) {
    const t = obtenerIdioma();
    const etiquetas = etiquetasDia(t);
    const tipos = ['laborable', 'sabado', 'domingo_festivo'];
    const tipoHoy = obtenerTipoDeDia(new Date());

    const botones = tipos
      .map((tipo) => `<button class="tab-dia ${tipo === tipoHoy ? 'activo' : ''}" data-tipo="${tipo}">${etiquetas[tipo]}</button>`)
      .join('');

    contenedor.innerHTML = `<div class="tabs-dias">${botones}</div><div class="tabla-horarios-contenido"></div>`;
    const contenido = contenedor.querySelector('.tabla-horarios-contenido');

    function pintar(tipo) {
      const filas = (parada.horarios[tipo] || [])
        .slice()
        .sort((a, b) => horaAMinutos(a.hora) - horaAMinutos(b.hora))
        .map((item) => {
          const linea = lineaPorId(datos, item.lineaId);
          const empresa = empresaPorId(datos, linea.empresaId);
          return `<tr>
            <td>${item.hora}</td>
            <td><span class="linea-chip" style="background:${linea.color}">${linea.nombre}</span></td>
            <td>${item.destino}</td>
            <td>${empresa.nombre}</td>
          </tr>`;
        })
        .join('');

      contenido.innerHTML = `
        <table class="tabla-horarios">
          <thead><tr><th>${t.colHora}</th><th>${t.colLinea}</th><th>${t.colDestino}</th><th>${t.colEmpresa}</th></tr></thead>
          <tbody>${filas || `<tr><td colspan="4">${t.sinServicioEsteDia}</td></tr>`}</tbody>
        </table>`;
    }

    contenedor.querySelectorAll('.tab-dia').forEach((btn) => {
      btn.addEventListener('click', () => {
        contenedor.querySelectorAll('.tab-dia').forEach((b) => b.classList.remove('activo'));
        btn.classList.add('activo');
        pintar(btn.dataset.tipo);
      });
    });

    pintar(tipoHoy);
  }

  async function iniciar() {
    const idParada = document.body.dataset.paradaId;
    if (!idParada) return;

    const datos = await cargarDatos();
    const parada = datos.paradas.find((p) => p.id === idParada);
    if (!parada) return;

    const contenedorProximos = document.getElementById('proximos-autobuses');
    const contenedorTabla = document.getElementById('tabla-horarios');

    function actualizar() {
      renderizarProximos(contenedorProximos, parada, datos, new Date());
    }

    actualizar();
    renderizarTablaCompleta(contenedorTabla, parada, datos);

    // Se actualiza solo cada 30s: la gente mira el móvil de pie, sin recargar.
    setInterval(actualizar, 30000);

    const t = obtenerIdioma();
    const botonVerTodos = document.getElementById('boton-ver-horarios');
    if (botonVerTodos) {
      botonVerTodos.addEventListener('click', () => {
        contenedorTabla.hidden = !contenedorTabla.hidden;
        botonVerTodos.textContent = contenedorTabla.hidden ? t.verTodosHorarios : t.ocultarHorarios;
      });
    }
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
