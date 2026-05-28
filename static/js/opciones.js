
/* ==========================
   SELECCIÓN VISUAL
========================== */

document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".card-configuracion");

    cards.forEach(card => {

        card.addEventListener("click", function () {

            // quitar selección anterior
            cards.forEach(c => c.classList.remove("seleccionado"));

            // activar actual
            this.classList.add("seleccionado");

            // marcar radio
            const input = this.querySelector("input");
            if (input) input.checked = true;

            // guardar opcional
            localStorage.setItem("dificultad", input.value);
        });

    });

});


/* ==========================
   VALIDACIÓN
========================== */

function validarFormulario() {

    const seleccionado = document.querySelector('input[name="dificultad"]:checked');

    if (!seleccionado) {
        alert("Selecciona una dificultad");
        return false;
    }

    return true;
}