const btnIniciar =
document.getElementById("btnIniciar");

const btnInstrucciones =
document.getElementById("btnInstrucciones");

btnIniciar.addEventListener("click", () => {

    window.location.href = "/registro";

});

btnInstrucciones.addEventListener("click", () => {

    window.location.href = "/instrucciones";

});