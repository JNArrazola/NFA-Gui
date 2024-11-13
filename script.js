// script.js

const svg = d3.select("#afnd-svg");

let estados = [];
let transiciones = [];

const accionesDisponiblesContainer = document.getElementById('acciones-disponibles');
const colaAcciones = document.getElementById('cola-acciones');

let accionesDisponibles = [];

function actualizarAccionesDisponibles() {
  accionesDisponiblesContainer.innerHTML = '<h2>Acciones Disponibles</h2>';

  accionesDisponibles.forEach(accion => {
    const accionElemento = document.createElement('div');
    accionElemento.classList.add('accion');
    accionElemento.setAttribute('draggable', 'true');
    accionElemento.innerText = accion;
    accionElemento.addEventListener('dragstart', dragStart);
    accionesDisponiblesContainer.appendChild(accionElemento);
  });
}

function agregarEstado(x, y, etiqueta) {
  const estado = { x, y, etiqueta, esAceptacion: false, esInicial: false };
  estados.push(estado);

  const estadoGrupo = svg.append("g")
    .on("click", function() {
      seleccionarEstado(estado);
      d3.event.stopPropagation(); 
    })
    .on("contextmenu", function() {
      d3.event.preventDefault(); 
      const opcion = prompt(
        `Seleccione una opción para el estado "${estado.etiqueta}":\n` +
        `1. Establecer como estado inicial\n` +
        `2. Establecer como estado de aceptación\n` +
        `3. Quitar estado inicial\n` +
        `4. Quitar estado de aceptación`
      );

      switch (opcion) {
        case '1':
          estados.forEach(e => e.esInicial = false); 
          estado.esInicial = true;
          actualizarVisualEstado(estado, circulo);
          break;
        case '2':
          estado.esAceptacion = true;
          actualizarVisualEstado(estado, circulo);
          break;
        case '3':
          estado.esInicial = false;
          actualizarVisualEstado(estado, circulo);
          break;
        case '4':
          estado.esAceptacion = false;
          actualizarVisualEstado(estado, circulo);
          break;
        default:
          break;
      }
    });

  const circulo = estadoGrupo.append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", 30)
    .attr("fill", "white")
    .attr("stroke", "black");

  estadoGrupo.append("text")
    .attr("x", x)
    .attr("y", y + 5)
    .attr("text-anchor", "middle")
    .text(etiqueta);

  actualizarVisualEstado(estado, circulo);
}

function actualizarVisualEstado(estado, circulo) {
  let strokeColor = "black";
  let strokeDasharray = null;

  if (estado.esInicial && estado.esAceptacion) {
    strokeColor = "purple"; 
    strokeDasharray = "5,5"; 
  } else if (estado.esInicial) {
    strokeColor = "blue"; 
  } else if (estado.esAceptacion) {
    strokeColor = "green"; 
    strokeDasharray = "5,5"; 
  }

  circulo
    .attr("stroke", strokeColor)
    .attr("stroke-dasharray", strokeDasharray);
}

svg.on("click", function() {
  const coords = d3.mouse(this);
  const etiqueta = prompt("Ingrese el nombre del estado:");
  if (etiqueta) {
    agregarEstado(coords[0], coords[1], etiqueta);
  }
});

let estadoSeleccionado = null;

function seleccionarEstado(estado) {
  if (!estadoSeleccionado) {
    estadoSeleccionado = estado;
  } else {
    const accion = prompt(`Ingrese la acción para la transición de "${estadoSeleccionado.etiqueta}" a "${estado.etiqueta}":`);
    if (accion) {
      agregarTransicion(estadoSeleccionado, estado, accion);
      if (!accionesDisponibles.includes(accion)) {
        accionesDisponibles.push(accion);
        actualizarAccionesDisponibles();
      }
    }
    estadoSeleccionado = null;
  }
}

function agregarTransicion(estadoOrigen, estadoDestino, accion) {
  const transicion = { estadoOrigen, estadoDestino, accion };
  transiciones.push(transicion);

  svg.append("line")
    .attr("x1", estadoOrigen.x)
    .attr("y1", estadoOrigen.y)
    .attr("x2", estadoDestino.x)
    .attr("y2", estadoDestino.y)
    .attr("stroke", "black")
    .attr("marker-end", "url(#arrow)"); // Agrega la punta de flecha

  svg.append("text")
    .attr("x", (estadoOrigen.x + estadoDestino.x) / 2)
    .attr("y", (estadoOrigen.y + estadoDestino.y) / 2)
    .attr("text-anchor", "middle")
    .text(accion);
}

function dragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.innerText);
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  const accion = e.dataTransfer.getData('text/plain');
  const nuevoElemento = document.createElement('div');
  nuevoElemento.classList.add('accion');
  nuevoElemento.innerText = accion;
  nuevoElemento.setAttribute('draggable', 'true');
  nuevoElemento.addEventListener('dragstart', dragStart);

  nuevoElemento.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    if (confirm("¿Eliminar esta acción de la secuencia?")) {
      nuevoElemento.remove();
    }
  });

  colaAcciones.appendChild(nuevoElemento);
}

colaAcciones.addEventListener('dragover', dragOver);
colaAcciones.addEventListener('drop', drop);

function simularAFND() {
  const secuencia = Array.from(colaAcciones.querySelectorAll('.accion'))
    .map(accion => accion.innerText);

  let estadosActuales = estados.filter(e => e.esInicial);
  if (estadosActuales.length === 0) {
    alert("No hay un estado inicial definido.");
    return;
  }

  secuencia.forEach(accion => {
    let nuevosEstados = [];
    estadosActuales.forEach(estado => {
      transiciones.forEach(transicion => {
        if (transicion.estadoOrigen === estado && transicion.accion === accion) {
          nuevosEstados.push(transicion.estadoDestino);
        }
      });
    });
    estadosActuales = nuevosEstados;
  });

  const aceptado = estadosActuales.some(estado => estado.esAceptacion);

  if (aceptado) {
    alert("¡Secuencia aceptada!");
  } else {
    alert("Secuencia no aceptada.");
  }
}

const botonSimular = document.createElement('button');

// <button class="button-89" role="button">Button 89</button>

botonSimular.classList.add('button-89');
botonSimular.setAttribute('role', 'button');
botonSimular.innerText = 'Simular AFND';
botonSimular.addEventListener('click', simularAFND);
document.body.appendChild(botonSimular);

// botonSimular.classList.add('button');
// botonSimular.innerText = 'Simular AFND';
// botonSimular.addEventListener('click', simularAFND);
// document.body.appendChild(botonSimular);
