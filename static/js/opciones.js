function abrirModalClima(){

    document.getElementById("modalClima").style.display = "flex";
}

function cerrarModalClima(){

    document.getElementById("modalClima").style.display = "none";
}

function abrirModalDificultad(){

    document.getElementById("modalDificultad").style.display = "flex";
}

function cerrarModalDificultad(){

    document.getElementById("modalDificultad").style.display = "none";
}

function seleccionarClima(tipo){

    document.getElementById("climaSeleccionado").value = tipo;

    cerrarModalClima();

    alert("Clima seleccionado: " + tipo);
}

function seleccionarDificultad(tipo){

    document.getElementById("dificultadSeleccionada").value = tipo;

    cerrarModalDificultad();

    alert("Dificultad seleccionada: " + tipo);
}
