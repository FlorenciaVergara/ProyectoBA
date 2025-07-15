const API_URL = "http://localhost:8080/api/articulos";
const PEDIDO_API_URL = "http://localhost:8080/api/pedidos";

const buscarInput = document.getElementById("buscar");
const listaArticulos = document.getElementById("listaArticulos");
const btnAgregar = document.getElementById("btnAgregar");
const formArticulo = document.getElementById("formArticulo");
const articuloId = document.getElementById("articuloId");
const nombreInput = document.getElementById("nombre");
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precio");
const btnCancelar = document.getElementById("btnCancelar");

let pedido = [];
let stockDisponible = {};

// Botones para abrir y cerrar formulario
btnAgregar.addEventListener("click", () => {
  articuloId.value = "";
  nombreInput.value = "";
  cantidadInput.value = "";
  precioInput.value = "";
  formArticulo.classList.add("visible");
  nombreInput.focus();
});

btnCancelar.addEventListener("click", () => {
  formArticulo.classList.remove("visible");
});

// Guardar o actualizar artículo
formArticulo.addEventListener("submit", async (e) => {
  e.preventDefault();

  const articulo = {
    nombre: nombreInput.value.trim(),
    cantidad: parseInt(cantidadInput.value),
    precio: parseFloat(precioInput.value),
  };

  const id = articuloId.value;
  const metodo = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/${id}` : API_URL;

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(articulo),
    });

    if (!res.ok) throw new Error("Error en la petición");

    formArticulo.classList.remove("visible");
    cargarArticulos(buscarInput.value.trim());
  } catch (error) {
    alert("Error al guardar artículo");
    console.error(error);
  }
});

// Buscar artículos en la lista
buscarInput.addEventListener("input", () => {
  cargarArticulos(buscarInput.value.trim());
});

// Cargar artículos desde backend y actualizar stockDisponible
async function cargarArticulos(nombre = "") {
  let url = API_URL;
  if (nombre) url += `?nombre=${encodeURIComponent(nombre)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener artículos");
    const articulos = await res.json();

    // Guardar stock actual
    articulos.forEach(art => {
      stockDisponible[art.id] = art.cantidad;
    });

    mostrarArticulos(articulos);
  } catch (error) {
    alert("Error al cargar artículos");
    console.error(error);
  }
}

// Mostrar lista de artículos
function mostrarArticulos(articulos) {
  listaArticulos.innerHTML = "";
  if (articulos.length === 0) {
    listaArticulos.innerHTML = "<li>No hay artículos</li>";
    return;
  }

  articulos.forEach((art) => {
    const li = document.createElement("div");
    li.innerHTML = `
      <div class="card" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">${art.nombre}</h5>
          <h6 class="card-subtitle mb-2 text-body-secondary">
            ${stockDisponible[art.id] > 0 ? 'Stock: ' + stockDisponible[art.id] : '<span class="text-danger">Sin stock</span>'}
          </h6>
          <p class="card-text">Precio unidad: $${art.precio.toFixed(2)}</p>
          <button class="btn btn-outline-info btn-sm" onclick="editarArticulo(${art.id})">Modificar</button>
          <button class="btn btn-outline-danger btn-sm" onclick="eliminarArticulo(${art.id})">Eliminar</button>
          <button class="btn btn-outline-primary btn-sm agregar-btn" data-id="${art.id}" ${stockDisponible[art.id] === 0 ? 'disabled' : ''}>
            <i class="bi bi-cart-plus"></i>
          </button>
        </div>
      </div>
    `;

    listaArticulos.appendChild(li);
  });

  // Agregar eventos a los botones "Agregar al pedido"
  document.querySelectorAll(".agregar-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      agregarAlPedido(id);
    });
  });
}

// Editar artículo
window.editarArticulo = async function(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Artículo no encontrado");
    const art = await res.json();
    articuloId.value = art.id;
    nombreInput.value = art.nombre;
    cantidadInput.value = art.cantidad;
    precioInput.value = art.precio;
    formArticulo.classList.add("visible");
    nombreInput.focus();
  } catch (error) {
    alert("Error al cargar artículo");
    console.error(error);
  }
};

// Eliminar artículo
window.eliminarArticulo = async function(id) {
  if (!confirm("¿Querés eliminar este artículo?")) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
    cargarArticulos(buscarInput.value.trim());
  } catch (error) {
    alert("Error al eliminar artículo");
    console.error(error);
  }
};

// Función para descontar stock en backend antes de agregar al pedido
async function descontarStockEnBackend(id, cantidadADescontar = 1) {
  // Obtener artículo actual
  const resArticulo = await fetch(`${API_URL}/${id}`);
  if (!resArticulo.ok) throw new Error("No se pudo obtener el artículo para descontar stock");
  const articulo = await resArticulo.json();

  const nuevoStock = articulo.cantidad - cantidadADescontar;
  if (nuevoStock < 0) throw new Error("Stock insuficiente");

  // Actualizar artículo con nuevo stock
  const resActualizar = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...articulo, cantidad: nuevoStock })
  });

  if (!resActualizar.ok) throw new Error("Error al actualizar stock en backend");
}

// Agregar artículo al pedido descontando stock en backend
window.agregarAlPedido = function(id) {
  if (pedido.find(item => item.id === id)?.cantidadPedido >= stockDisponible[id]) {
    alert("No hay más stock disponible para este artículo");
    return;
  }

  fetch(`${API_URL}/${id}`)
    .then(res => {
      if (!res.ok) throw new Error("Artículo no encontrado");
      return res.json();
    })
    .then(art => {
      const index = pedido.findIndex(item => item.id === art.id);
      if (index >= 0) {
        pedido[index].cantidadPedido++;
      } else {
        pedido.push({ ...art, cantidadPedido: 1 });
      }
      mostrarPedido();
    })
    .catch(error => {
      alert("Error al agregar al pedido");
      console.error(error);
    });
};

// Mostrar pedido actual
function mostrarPedido() {
  const contenedor = document.getElementById("pedidoLista");
  const totalContenedor = document.getElementById("pedidoTotal");
  contenedor.innerHTML = "";

  if (pedido.length === 0) {
    contenedor.innerHTML = "<p>No hay artículos en el pedido.</p>";
    totalContenedor.textContent = "";
    return;
  }

  pedido.forEach(item => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.marginBottom = "8px";

    div.innerHTML = `
      <span>${item.nombre} (x${item.cantidadPedido})</span>
      <div>
        <button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad(${item.id}, -1)">-</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad(${item.id}, 1)">+</button>
        <button class="btn btn-sm btn-outline-danger" onclick="quitarDelPedido(${item.id})">&times;</button>
      </div>
    `;

    contenedor.appendChild(div);
  });

  const total = pedido.reduce((acc, item) => acc + item.precio * item.cantidadPedido, 0);
  totalContenedor.textContent = `Total: $${total.toFixed(2)}`;
}

// Cambiar cantidad en pedido (más/menos) y actualizar stock local y backend
window.cambiarCantidad = function(id, delta) {
  const index = pedido.findIndex(item => item.id === id);
  if (index < 0) return;

  const nuevaCantidad = pedido[index].cantidadPedido + delta;

  if (delta === 1 && nuevaCantidad > stockDisponible[id]) {
    alert("No hay más stock disponible");
    return;
  }

  if (nuevaCantidad <= 0) {
    pedido.splice(index, 1);
  } else {
    pedido[index].cantidadPedido = nuevaCantidad;
  }

  mostrarPedido();
};

// Quitar artículo del pedido (solo local)
window.quitarDelPedido = function(id) {
  const index = pedido.findIndex(item => item.id === id);
  if (index >= 0) {
    pedido.splice(index, 1);
    mostrarPedido();
  }
};

// Quitar artículo del pedido y devolver stock al backend y local
window.quitarDelPedido = async function(id) {
  const index = pedido.findIndex(item => item.id === id);
  if (index >= 0) {
    try {
      // Obtener artículo actual
      const resArticulo = await fetch(`${API_URL}/${id}`);
      if (!resArticulo.ok) throw new Error("No se pudo obtener artículo para actualizar stock");
      const articulo = await resArticulo.json();

      const cantidadADevolver = pedido[index].cantidadPedido;
      const nuevoStockBackend = articulo.cantidad + cantidadADevolver;

      // Actualizar backend
      const resActualizar = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...articulo, cantidad: nuevoStockBackend })
      });

      if (!resActualizar.ok) throw new Error("Error al actualizar stock en backend");

      // Actualizar stock local y pedido
      stockDisponible[id] += cantidadADevolver;
      pedido.splice(index, 1);
      mostrarPedido();
      cargarArticulos(buscarInput.value.trim());
    } catch (error) {
      alert("Error al quitar del pedido: " + error.message);
      console.error(error);
    }
  }
};

// Confirmar pedido (enviar al backend)
document.getElementById("btnConfirmarPedido").addEventListener("click", async () => {
  if (pedido.length === 0) {
    alert("No hay artículos en el pedido");
    return;
  }

  const pedidoBody = {
    detalles: pedido.map(item => ({
      cantidad: item.cantidadPedido,
      articulo: { id: item.id }
    }))
  };

  try {
    const res = await fetch(PEDIDO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedidoBody)
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Error al guardar el pedido");
    }

    alert("Pedido enviado correctamente");
    pedido = [];
    mostrarPedido();
    cargarArticulos();
  } catch (error) {
    alert("Error al confirmar el pedido: " + error.message);
    console.error(error);
  }
});

// Carga inicial de artículos
cargarArticulos();
