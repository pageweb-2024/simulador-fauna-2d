/* ==========================
   MODAL CLIMA
========================== */

function abrirModalClima() {
    document.getElementById("modalClima").style.display = "flex";
}

function cerrarModalClima() {
    document.getElementById("modalClima").style.display = "none";
}


/* ==========================
   MODAL DIFICULTAD
========================== */

function abrirModalDificultad() {
    document.getElementById("modalDificultad").style.display = "flex";
}

function cerrarModalDificultad() {
    document.getElementById("modalDificultad").style.display = "none";
}


/* ==========================
   SELECCIONAR CLIMA
========================== */

function seleccionarClima(tipo) {

    document.getElementById("climaSeleccionado").value = tipo;
    localStorage.setItem("clima", tipo);

    cerrarModalClima();

    alert("Clima seleccionado: " + tipo);
}


/* ==========================
   SELECCIONAR DIFICULTAD
========================== */

function seleccionarDificultad(tipo) {

    document.getElementById("dificultadSeleccionada").value = tipo;
    localStorage.setItem("dificultad", tipo);

    cerrarModalDificultad();

    alert("Dificultad seleccionada: " + tipo);
}


/* ==========================
   VALIDAR CONFIGURACIÓN
========================== */

function validarConfiguracion() {

    const clima = localStorage.getItem("clima");
    const dificultad = localStorage.getItem("dificultad");

    if (!clima || !dificultad) {
        alert("Debes seleccionar clima y dificultad");
        return false;
    }

    return true;
}


/* ==========================
   INICIAR SIMULADOR
========================== */

function iniciarSimulador(carretera) {

    if (!validarConfiguracion()) return;

    localStorage.setItem("carretera", carretera);

    switch (carretera) {

        case "iza":
            window.location.href = "/simulador_iza";
            break;

        case "corrales":
            window.location.href = "/simulador_corrales";
            break;

        case "tibasosa":
            window.location.href = "/simulador_tibasosa";
            break;

        default:
            alert("Simulador no encontrado");
    }
}