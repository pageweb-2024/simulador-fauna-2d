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
const lluvia = document.getElementById("lluvia");

console.log("Animales Firebase:", animalesFirebase);

panel.classList.add("oculto");
colisionPanel.classList.add("oculto");
ayudaPanel.classList.add("oculto");

/* ===========================
   OPCIONES DESDE LOCALSTORAGE
=========================== */

const clima = localStorage.getItem("clima") || "sol";
const dificultad = localStorage.getItem("dificultad") || "normal";

document.getElementById("climaMostrado").innerText = clima;
document.getElementById("dificultadMostrada").innerText = dificultad;

/* LLUVIA */
if (clima === "lluvia") {
    lluvia.style.display = "block";
} else {
    lluvia.style.display = "none";
}

/* ===========================
   ESTADO
=========================== */

let juegoPausado = false;
let enColision = false;

/* ===========================
   ANIMAL
=========================== */

let animalX = 0;
let animalY = 0;
let animalDX = 0;
let animalDY = 0;
let animalActivo = false;

/* DIFICULTAD */

let velocidadAnimal;
let intervaloAnimal;

if (dificultad === "dificil") {
    velocidadAnimal = 7;
    intervaloAnimal = 10000;
} else {
    velocidadAnimal = 4;
    intervaloAnimal = 20000;
}

/* ===========================
   VEHÍCULO
=========================== */

let x = window.innerWidth * 0.50;
let y = window.innerHeight * 0.60;

const limiteIzquierdo = window.innerWidth * 0.39;
const limiteDerecho = window.innerWidth * 0.61;

let velocidad = 0;
let aceleracion = 0;
let mapaY = -100;

/* ===========================
   CONFIG
=========================== */

const velocidadMax = 160;
const fuerzaMotor = 0.35;
const fuerzaFreno = 1.5;
const friccion = 0.05;
const sensibilidadGiro = 0.05;

/* ===========================
   TIEMPO / PUNTAJE
=========================== */

let tiempoTotal = 600;
let puntaje = 0;

const teclas = {};

/* ===========================
   TECLAS
=========================== */

document.addEventListener("keydown", e => {
    teclas[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", e => {
    teclas[e.key.toLowerCase()] = false;
});

/* ===========================
   TIEMPO
=========================== */

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

/* ===========================
   PUNTAJE
=========================== */

function actualizarPuntaje() {
    puntajeTexto.innerText = puntaje;
}

/* ===========================
   GENERAR ANIMAL
=========================== */

function generarAnimal() {

    if (juegoPausado || animalActivo) return;
    if (!animalesFirebase || !animalesFirebase.length) return;

    animalActivo = true;

    const a = animalesFirebase[
        Math.floor(Math.random() * animalesFirebase.length)
    ];

    let rutaImagen = a.Imagen;

    animal.src = `/static/img/imgtibasosa/${rutaImagen}`;
    animalPanel.src = `/static/img/imgtibasosa/${rutaImagen}`;

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

/* ===========================
   MOVER ANIMAL
=========================== */

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

/* ===========================
   COLISIÓN
=========================== */

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

/* ===========================
   PANEL COLISIÓN
=========================== */

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

/* ===========================
   ACCIONES DE AYUDA
=========================== */

accion1.onclick = () => {
    puntaje += 10;
    cerrarAyuda();
};

accion2.onclick = () => {
    puntaje += 15;
    cerrarAyuda();
};

accion3.onclick = () => {
    puntaje += 20;
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

/* ===========================
   FINAL
=========================== */

function finalizarSimulacion() {
    alert("SIMULACIÓN FINALIZADA\n\nPUNTAJE: " + puntaje);
    location.reload();
}

/* ===========================
   LOOP PRINCIPAL
=========================== */

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

    vehiculo.style.transform =
        `translate(-50%, -50%) rotate(${angulo}deg)`;

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

/* ===========================
   EVENTOS
=========================== */

document.getElementById("finalizar").addEventListener("click", function () {
    window.location.href = "/resultado";
});

/* ===========================
   INICIO
=========================== */

actualizarTiempo();
actualizarPuntaje();

setInterval(generarAnimal, intervaloAnimal);
setInterval(actualizarTiempo, 1000);

actualizar();