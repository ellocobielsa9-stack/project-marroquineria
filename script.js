// Link de tu página de Doom: pegalo acá (se usa en las 3 redes sociales)
const DOOM_URL = "https://game-doom.netlify.app/";

function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

// =========================
// TEMA CLARO / OSCURO
// =========================
const themeToggleBtn = document.getElementById("theme-toggle");
const themeToggleIcon = document.getElementById("theme-toggle-icon");
const htmlEl = document.documentElement;

function aplicarIconoTema(tema) {
    if (!themeToggleIcon) return;
    themeToggleIcon.textContent = tema === "dark" ? "light_mode" : "dark_mode";
    themeToggleBtn.setAttribute("aria-pressed", tema === "dark");
}

// El tema ya fue aplicado por el script inline en el <head>, solo sincronizamos el ícono
aplicarIconoTema(htmlEl.getAttribute("data-theme") || "light");

if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
        const temaActual = htmlEl.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const nuevoTema = temaActual === "dark" ? "light" : "dark";
        htmlEl.setAttribute("data-theme", nuevoTema);
        lsSet("tema", nuevoTema);
        aplicarIconoTema(nuevoTema);
    });
}

// =========================
// MENÚ HAMBURGUESA (MOBILE)
// =========================
const menuToggle = document.getElementById("menu-mobile-toggle");
const mobileMenu = document.getElementById("mobile-menu");

function cerrarMenuMobile() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("mobile-menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    const icon = menuToggle.querySelector(".material-symbols-outlined");
    if (icon) icon.textContent = "menu";
}

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("mobile-menu-open");
        menuToggle.setAttribute("aria-expanded", isOpen);
        const icon = menuToggle.querySelector(".material-symbols-outlined");
        icon.textContent = isOpen ? "close" : "menu";
    });

    document.getElementById("mobile-nav-carteras").addEventListener("click", (e) => {
        e.preventDefault();
        cerrarMenuMobile();
        document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
        filtrarProductos("carteras");
    });
    document.getElementById("mobile-nav-calzado").addEventListener("click", (e) => {
        e.preventDefault();
        cerrarMenuMobile();
        document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
        filtrarProductos("calzado");
    });
    document.getElementById("mobile-nav-mas").addEventListener("click", (e) => {
        e.preventDefault();
        cerrarMenuMobile();
        document.getElementById("nosotros").scrollIntoView({ behavior: "smooth" });
    });
}

// Sincronizar buscador móvil con el principal
const mobileBuscador = document.getElementById("mobile-search-input");
if (mobileBuscador) {
    mobileBuscador.addEventListener("input", () => {
        const texto = mobileBuscador.value.toLowerCase().trim();
        document.querySelectorAll(".producto-card").forEach(prod => {
            const nombre = prod.querySelector(".producto-nombre").innerText.toLowerCase();
            prod.style.display = nombre.includes(texto) ? "" : "none";
        });
        // Sincronizar con el input del desktop
        const desktopInput = document.querySelector(".nav-search input");
        if (desktopInput) desktopInput.value = mobileBuscador.value;
    });
}

// =========================
// CARRITO
// =========================
let carrito = JSON.parse(lsGet("carrito") || "[]");

// =========================
// PANEL CARRITO (HTML)
// =========================
const carritoPanel = document.createElement("div");
carritoPanel.id = "carrito-panel";
carritoPanel.innerHTML = `
  <div class="carrito-header">
    <h2>🛒 Carrito</h2>
    <button id="carrito-cerrar" aria-label="Cerrar carrito">✕</button>
  </div>
  <div id="carrito-items"></div>
  <div id="carrito-footer" class="carrito-footer"></div>
`;
document.body.appendChild(carritoPanel);

// Overlay
const overlay = document.createElement("div");
overlay.id = "carrito-overlay";
document.body.appendChild(overlay);

// =========================
// BOTÓN CARRITO NAV
// =========================
const btnCarrito = document.querySelector('[data-icon="shopping_cart"]').parentElement;
btnCarrito.style.position = "relative";

const contador = document.createElement("span");
contador.id = "carrito-contador";
btnCarrito.appendChild(contador);

// Abrir/cerrar panel
btnCarrito.addEventListener("click", () => toggleCarrito());
overlay.addEventListener("click", () => cerrarCarrito());
document.getElementById("carrito-cerrar").addEventListener("click", () => cerrarCarrito());

function toggleCarrito() {
    const abierto = carritoPanel.classList.toggle("carrito-abierto");
    overlay.classList.toggle("carrito-overlay-visible", abierto);
}
function cerrarCarrito() {
    carritoPanel.classList.remove("carrito-abierto");
    overlay.classList.remove("carrito-overlay-visible");
}

// =========================
// ACTUALIZAR CONTADOR
// =========================
function actualizarContador() {
    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    contador.textContent = total;
    contador.style.display = total === 0 ? "none" : "flex";
}

// =========================
// PARSEAR PRECIO
// =========================
function parsearPrecio(str) {
    return parseInt(str.replace(/\./g, "").replace("$", "").trim(), 10) || 0;
}

function formatearPrecio(num) {
    return "$" + num.toLocaleString("es-AR");
}

// =========================
// RENDER CARRITO
// =========================
function renderCarrito() {
    const itemsEl = document.getElementById("carrito-items");
    const footerEl = document.getElementById("carrito-footer");

    if (carrito.length === 0) {
        itemsEl.innerHTML = `<p class="carrito-vacio">Tu carrito está vacío.</p>`;
        footerEl.innerHTML = "";
        return;
    }

    itemsEl.innerHTML = carrito.map((item, i) => `
      <div class="carrito-item">
        <div class="carrito-item-info">
          <p class="carrito-item-nombre">${item.nombre}</p>
          <p class="carrito-item-precio">${formatearPrecio(item.precioNum)} c/u</p>
        </div>
        <div class="carrito-item-controles">
          <button onclick="cambiarCantidad(${i}, -1)" class="carrito-qty-btn">−</button>
          <span class="carrito-qty">${item.cantidad}</span>
          <button onclick="cambiarCantidad(${i}, 1)" class="carrito-qty-btn">+</button>
          <button onclick="eliminarProducto(${i})" class="carrito-eliminar" aria-label="Eliminar">✕</button>
        </div>
      </div>
    `).join("");

    const total = carrito.reduce((acc, item) => acc + item.precioNum * item.cantidad, 0);

    footerEl.innerHTML = `
      <div class="carrito-total">
        <span>Total</span>
        <strong>${formatearPrecio(total)}</strong>
      </div>
      <button class="carrito-btn-comprar">Finalizar compra</button>
      <button onclick="vaciarCarrito()" class="carrito-btn-vaciar">Vaciar carrito</button>
    `;
}

// =========================
// AGREGAR PRODUCTO
// =========================
document.querySelectorAll(".btn-carrito").forEach(btn => {
    btn.addEventListener("click", () => {
        const card = btn.closest(".producto-card");
        const nombre = card.querySelector(".producto-nombre").innerText.trim();
        const precioStr = card.querySelector(".producto-precio").innerText.trim();
        const precioNum = parsearPrecio(precioStr);

        const existente = carrito.find(i => i.nombre === nombre);
        if (existente) {
            existente.cantidad++;
        } else {
            carrito.push({ nombre, precioStr, precioNum, cantidad: 1 });
        }

        guardarCarrito();
        renderCarrito();
        actualizarContador();
        mostrarNotificacion(`${nombre} agregado 🛒`);
    });
});

// =========================
// CAMBIAR CANTIDAD
// =========================
function cambiarCantidad(index, delta) {
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    guardarCarrito();
    renderCarrito();
    actualizarContador();
}

// =========================
// ELIMINAR
// =========================
function eliminarProducto(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    renderCarrito();
    actualizarContador();
}

// =========================
// VACIAR
// =========================
function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    renderCarrito();
    actualizarContador();
}

// =========================
// GUARDAR
// =========================
function guardarCarrito() {
    lsSet("carrito", JSON.stringify(carrito));
}

// =========================
// NOTIFICACIÓN
// =========================
function mostrarNotificacion(texto) {
    const notif = document.createElement("div");
    notif.className = "notificacion";
    notif.innerText = texto;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add("notificacion-visible"), 10);
    setTimeout(() => {
        notif.classList.remove("notificacion-visible");
        setTimeout(() => notif.remove(), 300);
    }, 2200);
}

// =========================
// BUSCADOR
// =========================
const buscador = document.querySelector("input[placeholder='Buscar productos...']");
const productos = document.querySelectorAll(".producto-card");

buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase().trim();
    productos.forEach(prod => {
        const nombre = prod.querySelector(".producto-nombre").innerText.toLowerCase();
        prod.style.display = nombre.includes(texto) ? "" : "none";
    });
});

// =========================
// FILTROS
// =========================
const filtros = document.querySelectorAll(".filtro-btn");

function filtrarProductos(filtro) {
    filtros.forEach(b => b.classList.remove("filtro-activo"));
    const btnActivo = document.querySelector(`[data-filtro="${filtro}"]`);
    if (btnActivo) btnActivo.classList.add("filtro-activo");

    productos.forEach(prod => {
        const cat = prod.dataset.categoria;
        prod.style.display = (filtro === "todo" || filtro === cat) ? "" : "none";
    });
}

filtros.forEach(btn => {
    btn.addEventListener("click", () => {
        filtrarProductos(btn.dataset.filtro);
    });
});

// =========================
// BOTONES HERO
// =========================
document.getElementById("btn-explorar").addEventListener("click", () => {
    document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("btn-color").addEventListener("click", () => {
    document.getElementById("nosotros").scrollIntoView({ behavior: "smooth" });
});

// =========================
// NAVBAR → SCROLL + FILTRO
// =========================
document.getElementById("nav-carteras").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
    filtrarProductos("carteras");
});

document.getElementById("nav-calzado").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
    filtrarProductos("calzado");
});

document.getElementById("nav-mas").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("nosotros").scrollIntoView({ behavior: "smooth" });
});

// =========================
// INIT
// =========================
actualizarContador();
renderCarrito();


// =========================
// REDES SOCIALES → DOOM
// =========================
function irADoom(e) {
    if (e) e.preventDefault();
    if (DOOM_URL.includes("PEGA_AQUI")) { mostrarNotificacion("Falta pegar el link de Doom en script.js 👾"); return; }
    window.open(DOOM_URL, "_blank", "noopener");
}
document.querySelectorAll(".red-doom").forEach(a => a.addEventListener("click", irADoom));

// Truco secreto: escribir "doom" en cualquier parte de la página
let teclas = "";
document.addEventListener("keydown", (e) => {
    if (/input|textarea/i.test(e.target.tagName)) return;
    teclas = (teclas + e.key.toLowerCase()).slice(-4);
    if (teclas === "doom") { teclas = ""; irADoom(); }
});

// =========================
// CARTA DE PRODUCTO (al tocar la imagen)
// =========================
const carta = document.createElement("dialog");
carta.id = "carta";
document.body.appendChild(carta);

function abrirCarta(card) {
    const nombre = card.querySelector(".producto-nombre").innerText;
    const desc = card.querySelector(".producto-desc").innerText;
    const precio = card.querySelector(".producto-precio").innerText;
    const cat = card.dataset.etiqueta || "";
    const color = card.querySelector(".producto-img").style.getPropertyValue("--c");
    carta.innerHTML = `
      <div class="carta-box" style="--c:${color}">
        <div class="carta-img">${card.querySelector(".producto-img svg").outerHTML}</div>
        <div class="carta-txt">
          <small>${cat} · Cuero vacuno</small>
          <h3>${nombre}</h3>
          <p>${desc}</p>
          <div class="carta-row">
            <strong>${precio}</strong>
            <div class="carta-btns">
              <button class="carta-add">Agregar 🛒</button>
              <button class="carta-x">Cerrar</button>
            </div>
          </div>
        </div>
      </div>`;
    carta.querySelector(".carta-x").onclick = () => carta.close();
    carta.querySelector(".carta-add").onclick = () => { card.querySelector(".btn-carrito").click(); carta.close(); };
    carta.showModal();
}
carta.addEventListener("click", (e) => { if (e.target === carta) carta.close(); });
document.querySelectorAll(".producto-img").forEach(img => {
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    img.addEventListener("click", () => abrirCarta(img.closest(".producto-card")));
    img.addEventListener("keydown", (e) => { if (e.key === "Enter") abrirCarta(img.closest(".producto-card")); });
});

// =========================
// FINALIZAR COMPRA (demo)
// =========================
document.getElementById("carrito-footer").addEventListener("click", (e) => {
    if (e.target.classList.contains("carrito-btn-comprar")) {
        vaciarCarrito();
        cerrarCarrito();
        mostrarNotificacion("¡Gracias por tu compra! (demo) 🎉");
    }
});

// =========================
// ANIMACIÓN AL HACER SCROLL
// =========================
if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => {
        ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".producto-card, .feature-item, .local").forEach(el => { el.classList.add("rv"); io.observe(el); });
}
