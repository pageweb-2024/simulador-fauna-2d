const vehiculo = document.getElementById("vehiculo");

const mapa = document.getElementById("mapa");

const velocidadTexto = document.getElementById("velocidad");

const aguja = document.getElementById("aguja");

// ======================================
// POSICIÓN VEHÍCULO
// ======================================

let x = window.innerWidth * 0.37;

let y = window.innerHeight * 0.60;

// ======================================
// FÍSICAS
// ======================================

let velocidad = 0;

let aceleracion = 0;

let giro = 0;

let angulo = 0;

// ======================================
// MAPA
// ======================================

let mapaY = -100;

// ======================================
// CONFIGURACIÓN
// ======================================

const velocidadMax = 220;

const fuerzaMotor = 0.35;

const fuerzaFreno = 0.40;

const friccion = 0.05;

const sensibilidadGiro = 0.05;

// ======================================
// TECLAS
// ======================================

const teclas = {};

document.addEventListener("keydown", (e)=>{

    teclas[e.key.toLowerCase()] = true;

});

document.addEventListener("keyup", (e)=>{

    teclas[e.key.toLowerCase()] = false;

});

// ======================================
// LOOP PRINCIPAL
// ======================================

function actualizar(){

    // ==================================
    // ACELERAR
    // ==================================

    if(teclas["w"]){

        aceleracion += fuerzaMotor;
    }

    // ==================================
    // FRENAR
    // ==================================

    if(teclas["s"]){

        aceleracion -= fuerzaFreno;
    }

    // ==================================
    // FRICCIÓN
    // ==================================

    if(!teclas["w"] && !teclas["s"]){

        if(velocidad > 0){

            aceleracion -= friccion;
        }

        if(velocidad < 0){

            aceleracion += friccion;
        }
    }

    // ==================================
    // VELOCIDAD
    // ==================================

    velocidad += aceleracion;

    // ==================================
    // SIN REVERSA
    // ==================================

    if(velocidad < 0){

        velocidad = 0;
    }

    // ==================================
    // LIMITE VELOCIDAD
    // ==================================

    if(velocidad > velocidadMax){

        velocidad = velocidadMax;
    }

    // ==================================
    // RESET ACELERACIÓN
    // ==================================

    aceleracion = 0;

    // ==================================
    // MOVER MAPA MÁS LENTO
    // ==================================

    mapaY += velocidad * 0.08;

    mapa.style.transform =
    `translateY(${mapaY}px)`;

    // ==================================
    // REPETIR MAPA
    // ==================================

    if(mapaY >= 0){

        mapaY = -2100;
    }

    // ==================================
    // CURVAS SUAVES CARRETERA
    // ==================================

    let izquierda;

    let derecha;

    // ==================================
    // RECTA INICIAL
    // ==================================

    if(mapaY > -400){

        izquierda = window.innerWidth * 0.29;

        derecha = window.innerWidth * 0.44;
    }

    // ==================================
    // ENTRANDO CURVA IZQUIERDA
    // ==================================

    else if(mapaY > -700){

        let progreso =
        (mapaY + 400) / -300;

        izquierda =
        window.innerWidth *
        (0.29 - (0.05 * progreso));

        derecha =
        window.innerWidth *
        (0.44 - (0.05 * progreso));
    }

    // ==================================
    // CURVA IZQUIERDA
    // ==================================

    else if(mapaY > -1000){

        izquierda = window.innerWidth * 0.24;

        derecha = window.innerWidth * 0.39;
    }

    // ==================================
    // VOLVIENDO AL CENTRO
    // ==================================

    else if(mapaY > -1300){

        let progreso =
        (mapaY + 1000) / -300;

        izquierda =
        window.innerWidth *
        (0.24 + (0.10 * progreso));

        derecha =
        window.innerWidth *
        (0.39 + (0.10 * progreso));
    }

    // ==================================
    // CURVA DERECHA
    // ==================================

    else if(mapaY > -1700){

        izquierda = window.innerWidth * 0.34;

        derecha = window.innerWidth * 0.49;
    }

    // ==================================
    // SALIENDO CURVA DERECHA
    // ==================================

    else if(mapaY > -2100){

        let progreso =
        (mapaY + 1700) / -400;

        izquierda =
        window.innerWidth *
        (0.34 - (0.05 * progreso));

        derecha =
        window.innerWidth *
        (0.49 - (0.05 * progreso));
    }

    // ==================================
    // RECTA FINAL
    // ==================================

    else{

        izquierda = window.innerWidth * 0.29;

        derecha = window.innerWidth * 0.44;
    }

    // ==================================
    // GIRAR IZQUIERDA
    // ==================================

    if(teclas["a"]){

        x -= 3 + (velocidad * sensibilidadGiro);

        giro = -18;
    }

    // ==================================
    // GIRAR DERECHA
    // ==================================

    if(teclas["d"]){

        x += 3 + (velocidad * sensibilidadGiro);

        giro = 18;
    }

    // ==================================
    // ENDEREZAR
    // ==================================

    if(!teclas["a"] && !teclas["d"]){

        giro *= 0.85;
    }

    // ==================================
    // ROTACIÓN SUAVE
    // ==================================

    angulo += (giro - angulo) * 0.1;

    // ==================================
    // LIMITES CARRETERA
    // ==================================

    if(x < izquierda){

        x = izquierda;

        velocidad *= 0.98;
    }

    if(x > derecha){

        x = derecha;

        velocidad *= 0.98;
    }

    // ==================================
    // VEHÍCULO
    // ==================================

    vehiculo.style.left = x + "px";

    vehiculo.style.top = y + "px";

    vehiculo.style.transform =
    `translate(-50%, -50%) rotate(${angulo}deg)`;

    // ==================================
    // TACÓMETRO DIGITAL
    // ==================================

    velocidadTexto.innerText =
    Math.floor(velocidad);

    // ==================================
    // AGUJA TACÓMETRO
    // ==================================

    let rotacionAguja =
    -130 + (velocidad / velocidadMax) * 260;

    aguja.style.transform =
    `translateX(-50%) rotate(${rotacionAguja}deg)`;

    // ==================================
    // EFECTO VELOCIDAD
    // ==================================

    if(velocidad > 150){

        mapa.style.filter = "blur(1.5px)";
    }

    else{

        mapa.style.filter = "blur(0px)";
    }

    // ==================================
    // LOOP
    // ==================================

    requestAnimationFrame(actualizar);
}

// ======================================
// INICIAR
// ======================================

actualizar();