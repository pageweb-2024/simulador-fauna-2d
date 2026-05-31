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

/* ==========================
   SONIDOS
========================== */

const sonidoAcelerar = new Audio("/static/audio/aceleracion.mp3");
const sonidoFrenar = new Audio("/static/audio/frenado.mp3");
const sonidoChoque = new Audio("/static/audio/colicion.mp3");

sonidoAcelerar.loop = true;
sonidoFrenar.loop = true;

sonidoAcelerar.volume = 0.5;
sonidoFrenar.volume = 0.6;
sonidoChoque.volume = 1;

/* ==========================
   CONFIGURAR DIFICULTAD
========================== */

document.addEventListener("DOMContentLoaded", () => {

    const dificultad = localStorage.getItem("dificultad");

    if (dificultad === "dificil") {
        localStorage.setItem("tiempoAparicion", "10000");
    } else {
        localStorage.setItem("tiempoAparicion", "20000");
    }
});

/* ===========================
   CONTADORES
=========================== */

let animalesDetectados = 0;
let frenadas = 0;
let atropellados = 0;
let salvados = 0;

/* ===========================
   ESTADO
=========================== */

vehiculo.style.position = "absolute";
vehiculo.style.zIndex = "20000";
vehiculo.style.left = "50%";
vehiculo.style.top = "48%";

mapa.style.position = "absolute";

animal.style.position = "absolute";
animal.style.zIndex = "9999";

/* ===========================
   VARIABLES
=========================== */

let juegoPausado = false;
let enColision = false;
let tiempoTotal = 300;
let puntaje = 0;

let x = window.innerWidth * 0.5;
let y = window.innerHeight * 0.48;

const limiteIzq = window.innerWidth * 0.39;
const limiteDer = window.innerWidth * 0.61;

let velocidad = 0;
let aceleracion = 0;
let mapaY = -100;

const velocidadMax = 160;
const fuerzaMotor = 0.35;
const fuerzaFreno = 1.5;
const friccion = 0.05;
const sensibilidad = 0.08;

/* ===========================
   ANIMAL
=========================== */

let animalX = 0;
let animalY = 0;
let animalDX = 0;
let animalActivo = false;

let velocidadAnimal = 4;

let intervaloAnimal = parseInt(localStorage.getItem("tiempoAparicion")) || 20000;

/* ===========================
   TECLAS
=========================== */

const teclas = {};

document.addEventListener("keydown", e => {
    teclas[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", e => {
    teclas[e.key.toLowerCase()] = false;
});

/* ===========================
   UI
=========================== */

panel.classList.add("oculto");
colisionPanel.classList.add("oculto");
ayudaPanel.classList.add("oculto");

/* ===========================
   TIEMPO
=========================== */

function actualizarTiempo() {
    if (juegoPausado) return;

    if (tiempoTotal <= 0) {
        finalizar();
        return;
    }

    let m = Math.floor(tiempoTotal / 60);
    let s = tiempoTotal % 60;

    tiempoTexto.innerText =
        `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

    tiempoTotal--;
}

function actualizarPuntaje() {
    puntajeTexto.innerText = puntaje;
}

/* ===========================
   ANIMAL
=========================== */

function generarAnimal() {
    if (juegoPausado || animalActivo) return;
    if (!animalesFirebase?.length) return;

    animalActivo = true;
    animalesDetectados++;

    const a = animalesFirebase[
        Math.floor(Math.random() * animalesFirebase.length)
    ];

    animal.src = `/static/img/imgiza/${a.Imagen}`;
    animalPanel.src = `/static/img/imgiza/${a.Imagen}`;

    animalNombre.innerText = a.Animal || "FAUNA";
    animalDescripcion.innerText = a["Información"] || "";

    animal.style.display = "block";

    const desdeIzquierda = Math.random() > 0.5;

    animalX = desdeIzquierda ? -150 : window.innerWidth + 150;
    animalY = window.innerHeight * 0.42;

    animalDX = desdeIzquierda ? velocidadAnimal : -velocidadAnimal;

    panel.classList.remove("oculto");
}

/* ===========================
   MOVIMIENTO ANIMAL
=========================== */

function moverAnimal() {
    if (!animalActivo || juegoPausado) return;

    animalX += animalDX;

    animal.style.left = animalX + "px";
    animal.style.top = animalY + "px";

    if (animalX < -200 || animalX > window.innerWidth + 200) {
        salvados++;
        animalActivo = false;
        animal.style.display = "none";
        panel.classList.add("oculto");
    }
}

/* ===========================
   COLISIÓN
=========================== */

function detectarColision() {
    if (!animalActivo) return;

    const r1 = vehiculo.getBoundingClientRect();
    const r2 = animal.getBoundingClientRect();

    const choque =
        r1.left < r2.right &&
        r1.right > r2.left &&
        r1.top < r2.bottom &&
        r1.bottom > r2.top;

    if (choque && velocidad > 20 && !enColision) {
        sonidoChoque.play();

        atropellados++;
        enColision = true;
        animalActivo = false;
        animal.style.display = "none";
        mostrarColision();
    }
}

/* ===========================
   COLISIÓN UI
=========================== */

function mostrarColision() {
    juegoPausado = true;
    colisionPanel.classList.remove("oculto");
}

function cerrarTodo() {
    juegoPausado = false;
    enColision = false;
    colisionPanel.classList.add("oculto");
    ayudaPanel.classList.add("oculto");
    actualizarPuntaje();
}

opcion1.onclick = () => {
    frenadas++;
    colisionPanel.classList.add("oculto");
    ayudaPanel.classList.remove("oculto");
};

opcion2.onclick = () => {
    frenadas++;
    puntaje -= 20;
    cerrarTodo();
};

accion1.onclick = () => { puntaje += 10; cerrarTodo(); };
accion2.onclick = () => { puntaje += 15; cerrarTodo(); };
accion3.onclick = () => { puntaje += 20; cerrarTodo(); };

/* ===========================
   FINAL
=========================== */

async function finalizar() {

    const data = {
        puntaje: puntaje,
        tiempo: document.getElementById("tiempo")?.innerText || 0,
        velocidad: velocidad,
        animales: animalesDetectados,
        frenadas: frenadas,
        atropellados: atropellados,
        salvados: salvados
    };

    try {
        await fetch("/guardar_resultado", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(data)
        });

        window.location.href = "/resultado";

    } catch (error) {
        console.log("Error:", error);
        window.location.href = "/resultado";
    }
}

/* ===========================
   BOTÓN FINALIZAR
=========================== */

document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("finalizar");

    if (!btn) return;

    btn.addEventListener("click", () => {
        finalizar();
    });

});

/* ===========================
   LOOP
=========================== */

function loop() {
    requestAnimationFrame(loop);

    if (juegoPausado) return;

    if (teclas["w"]) {
        aceleracion += fuerzaMotor;

        if (sonidoAcelerar.paused) {
            sonidoAcelerar.play();
        }
    } else {
        sonidoAcelerar.pause();
        sonidoAcelerar.currentTime = 0;
    }

    if (teclas["s"]) {
        aceleracion -= fuerzaFreno;

        if (sonidoFrenar.paused) {
            sonidoFrenar.play();
        }
    } else {
        sonidoFrenar.pause();
        sonidoFrenar.currentTime = 0;
    }

    if (!teclas["w"] && !teclas["s"]) {
        aceleracion -= friccion;
    }

    velocidad += aceleracion;

    if (velocidad < 0) velocidad = 0;
    if (velocidad > velocidadMax) velocidad = velocidadMax;

    aceleracion = 0;

    let dir = 0;

    if (teclas["a"]) dir = -1;
    if (teclas["d"]) dir = 1;

    x += dir * (2 + velocidad * sensibilidad);

    if (x < limiteIzq) x = limiteIzq;
    if (x > limiteDer) x = limiteDer;

    let ang = dir * (8 + velocidad * 0.05);

    vehiculo.style.transform =
        `translate(-50%, -50%) translate(${x - window.innerWidth * 0.5}px, ${y - window.innerHeight * 0.48}px) rotate(${ang}deg)`;

    mapaY += velocidad * 0.18;

    if (mapaY >= 0) mapaY = -100;

    mapa.style.transform = `translateY(${mapaY}px)`;

    velocidadTexto.innerText = Math.floor(velocidad);

    aguja.style.transform =
        `translateX(-50%) rotate(${-130 + (velocidad / velocidadMax) * 260}deg)`;

    moverAnimal();
    detectarColision();
}

/* ===========================
   INICIO
=========================== */

setInterval(actualizarTiempo, 1000);
setInterval(generarAnimal, intervaloAnimal);

actualizarPuntaje();
actualizarTiempo();
loop();