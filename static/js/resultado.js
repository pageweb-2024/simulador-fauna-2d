document.addEventListener("DOMContentLoaded", () => {

    const boton = document.getElementById("finalizar");

    if (!boton) return;

    boton.addEventListener("click", async () => {

        const confirmar = confirm("¿Deseas finalizar la simulación?");

        if (!confirmar) return;

        // 🔥 IMPORTANTE: asegúrate de que estos IDs EXISTAN en simulador
        const data = {
            puntaje: document.getElementById("puntaje")?.innerText || 0,
            tiempo: document.getElementById("tiempo")?.innerText || 0,
            velocidad: document.getElementById("velocidad")?.innerText || 0,

            // estos deben existir en el simulador (o debes crearlos en JS)
            animales: window.animalesDetectados || 0,
            frenadas: window.frenadas || 0,
            atropellados: window.atropellados || 0,
            salvados: window.salvados || 0
        };

        try {
            await fetch("/guardar_resultado", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams(data)
            });

        } catch (err) {
            console.log("Error guardando en Flask:", err);
        }

        // 👉 IMPORTANTE: ahora sí ir a resultado
        window.location.href = "/resultado";
    });

});