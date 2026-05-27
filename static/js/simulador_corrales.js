const vehiculo = document.getElementById("vehiculo");
const mapa = document.getElementById("mapa");
const velocidadTexto = document.getElementById("velocidad");
const aguja = document.getElementById("aguja");
const tiempoTexto = document.getElementById("tiempo");
const puntajeTexto = document.getElementById("puntaje");

const panel = document.getElementById("panelAlerta");
const animalNombre = document.getElementById("animalNombre");
const animalDescripcion = document.getElementById("animalDescripcion");
const animalPanel = document.getElementById("animalPanel");

const colisionPanel = document.getElementById("colisionPanel");
const colisionTexto = document.getElementById("colisionTexto");
const opcion1 = document.getElementById("opcion1");
const opcion2 = document.getElementById("opcion2");

const ayudaPanel = document.getElementById("ayudaPanel");
const accion1 = document.getElementById("accion1");
const accion2 = document.getElementById("accion2");
const accion3 = document.getElementById("accion3");

const animal = document.getElementById("animalMovimiento");

/* ==========================
   🌧️ CLIMA (ARREGLADO)
========================== */

const clima = localStorage.getItem("clima");

function activarLluvia() {

    const lluvia = document.getElementById("lluvia");
    if (!lluvia) return;

    lluvia.style.display = "block";

    for (let i = 0; i < 120; i++) {

        let gota = document.createElement("div");
        gota.classList.add("gota");

        gota.style.left = Math.random() * window.innerWidth + "px";
        gota.style.animationDuration = (0.4 + Math.random()) + "s";
        gota.style.opacity = Math.random();

        lluvia.appendChild(gota);
    }
}

if (clima === "lluvia") {
    activarLluvia();
}

/* ==========================
   ESTADO
========================== */

let juegoPausado = false;
let enColision = false;

/* ==========================
   ANIMAL
========================== */

let animalX = 0;
let animalY = 0;
let animalDX = 0;
let animalDY = 0;
let animalActivo = false;
let velocidadAnimal = 4;

/* ==========================
   VEHÍCULO
========================== */

let x = window.innerWidth * 0.50;
let y = window.innerHeight * 0.60;

const limiteIzquierdo = window.innerWidth * 0.39;
const limiteDerecho = window.innerWidth * 0.61;

let velocidad = 0;
let aceleracion = 0;
let mapaY = -100;

/* ==========================
   CONFIG
========================== */

const velocidadMax = 160;
const fuerzaMotor = 0.35;
const fuerzaFreno = 1.5;
const friccion = 0.05;
const sensibilidadGiro = 0.05;

/* ==========================
   TIEMPO / PUNTAJE
========================== */

let tiempoTotal = 600;
let puntaje = 0;

const teclas = {};

/* ==========================
   TECLAS
========================== */

document.addEventListener("keydown", e => {
    teclas[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", e => {
    teclas[e.key.toLowerCase()] = false;
});

/* ==========================
   TIEMPO
========================== */

function actualizarTiempo() {

    if (juegoPausado) return;

    if (tiempoTotal <= 0) {
        finalizarSimulacion();
        return;
    }

    let m = Math.floor(tiempoTotal / 60);
    let s = tiempoTotal % 60;

    tiempoTexto.innerText =
        `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

    tiempoTotal--;
}

/* ==========================
   PUNTAJE
========================== */

function actualizarPuntaje() {
    puntajeTexto.innerText = puntaje;
}

/* ==========================
   GENERAR ANIMAL
========================== */

function generarAnimal() {

    if (juegoPausado || animalActivo) return;
    if (!animalesFirebase || !animalesFirebase.length) return;

    animalActivo = true;

    const a = animalesFirebase[
        Math.floor(Math.random() * animalesFirebase.length)
    ];

    let rutaImagen = a.Imagen;

    animal.src = `/static/img/imgcorrales/${rutaImagen}`;
    animalPanel.src = `/static/img/imgcorrales/${rutaImagen}`;

    animalNombre.innerText = a.Animal || "FAUNA";
    animalDescripcion.innerText = a["Información"] || "Reduce la velocidad";

    animal.style.display = "block";

    const lado = Math.floor(Math.random() * 4);

    switch (lado) {

        case 0:
            animalX = window.innerWidth * 0.15;
            animalY = window.innerHeight * (0.25 + Math.random() * 0.5);
            animalDX = velocidadAnimal;
            animalDY = (Math.random() - 0.5) * 2;
            break;

        case 1:
            animalX = window.innerWidth * 0.85;
            animalY = window.innerHeight * (0.25 + Math.random() * 0.5);
            animalDX = -velocidadAnimal;
            animalDY = (Math.random() - 0.5) * 2;
            break;

        case 2:
            animalX = window.innerWidth * 0.20;
            animalY = window.innerHeight * 0.15;
            animalDX = velocidadAnimal;
            animalDY = velocidadAnimal * 0.5;
            break;

        case 3:
            animalX = window.innerWidth * 0.80;
            animalY = window.innerHeight * 0.15;
            animalDX = -velocidadAnimal;
            animalDY = velocidadAnimal * 0.5;
            break;
    }

    animal.style.left = animalX + "px";
    animal.style.top = animalY + "px";

    panel.classList.remove("oculto");
    panel.classList.add("visible");
}

/* ==========================
   MOVER ANIMAL
========================== */

function moverAnimal() {

    if (juegoPausado || !animalActivo) return;

    animalX += animalDX;
    animalY += animalDY;

    animal.style.left = animalX + "px";
    animal.style.top = animalY + "px";

    if (
        animalX < -150 ||
        animalX > window.innerWidth + 150 ||
        animalY < -150 ||
        animalY > window.innerHeight + 150
    ) {
        animalActivo = false;
        animal.style.display = "none";

        panel.classList.add("oculto");
        panel.classList.remove("visible");
    }
}

/* ==========================
   COLISIÓN
========================== */

function detectarColision() {

    if (juegoPausado || !animalActivo || animal.style.display === "none") return;

    const r1 = vehiculo.getBoundingClientRect();
    const r2 = animal.getBoundingClientRect();

    const choque =
        r1.left < r2.right &&
        r1.right > r2.left &&
        r1.top < r2.bottom &&
        r1.bottom > r2.top;

    if (choque && !enColision && velocidad > 20) {

        enColision = true;
        animalActivo = false;
        animal.style.display = "none";

        mostrarColision();
    }
}

/* ==========================
   COLISIÓN PANEL
========================== */

function mostrarColision() {

    juegoPausado = true;

    colisionTexto.innerText = "Atropellaste un animal. ¿Qué haces?";

    opcion1.innerText = "Ayudar";
    opcion2.innerText = "Huir";

    colisionPanel.classList.remove("oculto");
}

opcion1.onclick = () => {
    colisionPanel.classList.add("oculto");
    ayudaPanel.classList.remove("oculto");
};

opcion2.onclick = () => {
    puntaje -= 20;
    cerrarColision();
};

/* ==========================
   AYUDA
========================== */

accion1.onclick = () => {
    puntaje += 10;
    alert("🛑 Has señalizado la vía.");
    cerrarAyuda();
};

accion2.onclick = () => {
    puntaje += 15;
    alert("📞 Llamaste a autoridades.");
    cerrarAyuda();
};

accion3.onclick = () => {
    puntaje += 20;
    alert("🚑 Ayuda veterinaria solicitada.");
    cerrarAyuda();
};

function cerrarAyuda() {
    ayudaPanel.classList.add("oculto");
    enColision = false;
    juegoPausado = false;
    actualizarPuntaje();
}

function cerrarColision() {
    colisionPanel.classList.add("oculto");
    enColision = false;
    juegoPausado = false;

    if (puntaje < 0) puntaje = 0;

    actualizarPuntaje();
}

/* ==========================
   FINAL
========================== */

function finalizarSimulacion() {
    alert("SIMULACIÓN FINALIZADA\n\nPUNTAJE: " + puntaje);
    location.reload();
}

function activarLluvia() {

    const lluvia = document.getElementById("lluvia");
    if (!lluvia) return;

    lluvia.innerHTML = ""; // limpiar

    for (let i = 0; i < 150; i++) {

        const gota = document.createElement("div");
        gota.classList.add("gota");

        // posición inicial REAL
        gota.style.left = Math.random() * window.innerWidth + "px";
        gota.style.top = Math.random() * window.innerHeight + "px";

        // duración distinta
        const duracion = 0.6 + Math.random() * 0.8;
        gota.style.animationDuration = duracion + "s";

        // tamaño variable
        const altura = 10 + Math.random() * 15;
        gota.style.height = altura + "px";

        lluvia.appendChild(gota);
    }

    // 🔁 lluvia continua
    setInterval(() => {
        const gota = document.createElement("div");
        gota.classList.add("gota");

        gota.style.left = Math.random() * window.innerWidth + "px";
        gota.style.top = "-20px";
        gota.style.animationDuration = (0.6 + Math.random()) + "s";

        lluvia.appendChild(gota);

        // eliminar gotas viejas
        setTimeout(() => gota.remove(), 2000);

    }, 120);
}

/* ==========================
   LOOP
========================== */

function actualizar() {

    requestAnimationFrame(actualizar);

    if (juegoPausado) return;

    if (teclas["w"]) aceleracion += fuerzaMotor;
    if (teclas["s"] && velocidad > 0) aceleracion -= fuerzaFreno;
    if (!teclas["w"] && !teclas["s"] && velocidad > 0) aceleracion -= friccion;

    velocidad += aceleracion;

    if (velocidad > velocidadMax) velocidad = velocidadMax;
    if (velocidad < 0) velocidad = 0;

    aceleracion = 0;

    let direccion = 0;

    if (teclas["a"]) direccion = -1;
    if (teclas["d"]) direccion = 1;

    x += direccion * (3 + velocidad * sensibilidadGiro);

    let angulo = direccion * (10 + velocidad * 0.08);

    let inclinacionFreno = 0;

    if (teclas["s"] && velocidad > 0) {
        inclinacionFreno = -6;
    }

    vehiculo.style.transform =
        `translate(-50%, -50%) rotate(${angulo}deg) skewY(${inclinacionFreno}deg)`;

    if (x < limiteIzquierdo) x = limiteIzquierdo;
    if (x > limiteDerecho) x = limiteDerecho;

    vehiculo.style.left = x + "px";
    vehiculo.style.top = y + "px";

    mapaY += velocidad * 0.12;
    mapa.style.transform = `translateY(${mapaY}px)`;

    if (mapaY >= 0) mapaY = -100;

    velocidadTexto.innerText = Math.floor(velocidad);

    aguja.style.transform =
        `translateX(-50%) rotate(${-130 + (velocidad / velocidadMax) * 260}deg)`;

    moverAnimal();
    detectarColision();
}

/* ==========================
   EVENTOS
========================== */

document.getElementById("finalizar").addEventListener("click", function () {
    window.location.href = "/resultado";
});

document.addEventListener("DOMContentLoaded", () => {

    const boton = document.getElementById("finalizar");

    if (!boton) return;

    boton.addEventListener("click", async () => {

        const confirmar = confirm("¿Finalizar simulación?");

        if (!confirmar) return;

        const data = {
            puntaje: document.getElementById("puntaje")?.innerText || 0,
            tiempo: document.getElementById("tiempo")?.innerText || 0,
            velocidad: document.getElementById("velocidad")?.innerText || 0,

            animales: window.animalesDetectados || 0,
            frenadas: window.frenadas || 0,
            atropellados: window.atropellados || 0,
            salvados: window.salvados || 0
        };

        // 🔥 1. primero guardar en Flask
        await fetch("/guardar_resultado", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(data)
        });

        // 🔥 2. luego ir a resultado
        window.location.href = "/resultado";
    });

});

/* ==========================
   INICIO
========================== */

actualizarTiempo();
actualizarPuntaje();

setInterval(generarAnimal, 8000);
setInterval(actualizarTiempo, 1000);

actualizar();