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

const fuerzaFreno = 0.45;

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
    // FRENO SOLAMENTE
    // ==================================

    if(teclas["s"]){

        // SI VA HACIA ADELANTE
        // FRENA

        if(velocidad > 0){

            aceleracion -= fuerzaFreno * 1.8;
        }

        // EVITAR REVERSA

        if(velocidad <= 0){

            velocidad = 0;
        }
    }

    // ==================================
    // FRICCIÓN
    // ==================================

    if(!teclas["w"] && !teclas["s"]){

        if(velocidad > 0){

            aceleracion -= friccion;
        }
    }

    // ==================================
    // VELOCIDAD
    // ==================================

    velocidad += aceleracion;

    // ==================================
    // LIMITES
    // ==================================

    if(velocidad > velocidadMax){

        velocidad = velocidadMax;
    }

    // NO REVERSA

    if(velocidad < 0){

        velocidad = 0;
    }

    // ==================================
    // RESET ACELERACIÓN
    // ==================================

    aceleracion = 0;

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

    let izquierda = window.innerWidth * 0.29;

    let derecha = window.innerWidth * 0.44;

    if(x < izquierda){

        x = izquierda;

        velocidad *= 0.97;
    }

    if(x > derecha){

        x = derecha;

        velocidad *= 0.97;
    }

    // ==================================
    // VEHÍCULO
    // ==================================

    vehiculo.style.left = x + "px";

    vehiculo.style.top = y + "px";

    vehiculo.style.transform =
    `translate(-50%, -50%) rotate(${angulo}deg)`;

    // ==================================
    // MOVER MAPA
    // ==================================

    mapaY += velocidad * 0.25;

    mapa.style.transform =
    `translateY(${mapaY}px)`;

    // ==================================
    // REPETIR MAPA
    // ==================================

    if(mapaY >= 0){

        mapaY = -100;
    }

    if(mapaY <= -200){

        mapaY = -100;
    }

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

    if(velocidad > 140){

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