document.addEventListener("DOMContentLoaded", () => {

    const boton = document.getElementById("reiniciar");

    boton.addEventListener("click", () => {

        const confirmar = confirm("¿Deseas volver al inicio del simulador?");

        if (confirmar) {
            window.location.href = "/";
        }

    });

});