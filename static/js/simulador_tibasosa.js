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

panel.classList.add("oculto");

/* ===========================
   ANIMAL
=========================== */

const animal = document.getElementById("animalMovimiento");

let animalX = -120;
let animalActivo = false;
let velocidadAnimal = 3;

/* ===========================
   VEHÍCULO
=========================== */

let x = window.innerWidth * 0.50;
let y = window.innerHeight * 0.60;

const limiteIzquierdo = window.innerWidth * 0.39;
const limiteDerecho = window.innerWidth * 0.61;

let velocidad = 0;
let aceleracion = 0;
let giro = 0;
let angulo = 0;

let mapaY = -100;

/* ===========================
   CONFIG
=========================== */

const velocidadMax = 160;
const fuerzaMotor = 0.35;
const fuerzaFreno = 0.45;
const friccion = 0.05;
const sensibilidadGiro = 0.05;

/* ===========================
   TIEMPO
=========================== */

let tiempoTotal = 900; // 15:00
let puntaje = 0;

const teclas = {};

document.addEventListener("keydown", e => {
    teclas[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", e => {
    teclas[e.key.toLowerCase()] = false;
});

/* ===========================
   TIEMPO
=========================== */

function actualizarTiempo(){

    if(tiempoTotal <= 0){
        finalizarSimulacion();
        return;
    }

    let minutos = Math.floor(tiempoTotal / 60);
    let segundos = tiempoTotal % 60;

    tiempoTexto.innerText =
        `${String(minutos).padStart(2,"0")}:${String(segundos).padStart(2,"0")}`;

    tiempoTotal--;
}

/* ===========================
   PUNTAJE
=========================== */

function actualizarPuntaje(){

    if(velocidad > 40 && velocidad < 100){
        puntaje += 2;
    }

    if(velocidad > 140){
        puntaje -= 1;
    }

    if(puntaje < 0){
        puntaje = 0;
    }

    puntajeTexto.innerText = puntaje;
}

/* ===========================
   ANIMALES
=========================== */

function generarAnimal(){

    if(animalActivo || !animalesFirebase.length) return;

    animalActivo = true;
    animalX = -120;

    const animalRandom =
        animalesFirebase[
            Math.floor(Math.random() * animalesFirebase.length)
        ];

    animal.src = `/static/img/${animalRandom.imagen}.png`;
    animalPanel.src = `/static/img/${animalRandom.imagen}.png`;

    animalNombre.innerText = animalRandom.nombre;
    animalDescripcion.innerText = animalRandom.descripcion;

    animal.style.display = "block";

    const posiciones = ["40%","45%","50%","55%"];

    animal.style.top =
        posiciones[Math.floor(Math.random() * posiciones.length)];

    panel.classList.remove("oculto");
    panel.classList.add("visible");
}

function moverAnimal(){

    if(!animalActivo) return;

    animalX += velocidadAnimal;
    animal.style.left = animalX + "px";

    if(animalX > window.innerWidth){

        animalActivo = false;
        animal.style.display = "none";

        panel.classList.remove("visible");
        panel.classList.add("oculto");
    }
}

/* ===========================
   FINALIZAR
=========================== */

function finalizarSimulacion(){

    alert("SIMULACIÓN FINALIZADA\nPUNTAJE: " + puntaje);
    location.reload();
}

/* ===========================
   LOOP
=========================== */

function actualizar(){

    if(teclas["w"]){
        aceleracion += fuerzaMotor;
    }

    if(teclas["s"] && velocidad > 0){
        aceleracion -= fuerzaFreno * 1.8;
    }

    if(!teclas["w"] && !teclas["s"] && velocidad > 0){
        aceleracion -= friccion;
    }

    velocidad += aceleracion;

    if(velocidad > velocidadMax){
        velocidad = velocidadMax;
    }

    if(velocidad < 0){
        velocidad = 0;
    }

    aceleracion = 0;

    /* mover izquierda */
    if(teclas["a"]){
        x -= 3 + (velocidad * sensibilidadGiro);
        giro = -18;
    }

    /* mover derecha */
    if(teclas["d"]){
        x += 3 + (velocidad * sensibilidadGiro);
        giro = 18;
    }

    /* limitar carretera */
    if(x < limiteIzquierdo){
        x = limiteIzquierdo;
    }

    if(x > limiteDerecho){
        x = limiteDerecho;
    }

    if(!teclas["a"] && !teclas["d"]){
        giro *= 0.85;
    }

    angulo += (giro - angulo) * 0.1;

    vehiculo.style.left = x + "px";
    vehiculo.style.top = y + "px";

    vehiculo.style.transform =
        `translate(-50%, -50%) rotate(${angulo}deg)`;

    mapaY += velocidad * 0.12;

    mapa.style.transform = `translateY(${mapaY}px)`;

    if(mapaY >= 0){
        mapaY = -100;
    }

    velocidadTexto.innerText = Math.floor(velocidad);

    let rotacionAguja =
        -130 + (velocidad / velocidadMax) * 260;

    aguja.style.transform =
        `translateX(-50%) rotate(${rotacionAguja}deg)`;

    moverAnimal();

    requestAnimationFrame(actualizar);
}

/* ===========================
   BOTÓN FINALIZAR
=========================== */

document.querySelector(".btn-finalizar")
.addEventListener("click", finalizarSimulacion);

/* ===========================
   INICIO
=========================== */

actualizarTiempo();

setInterval(generarAnimal, 8000);
setInterval(actualizarTiempo, 1000);
setInterval(actualizarPuntaje, 1000);

actualizar();