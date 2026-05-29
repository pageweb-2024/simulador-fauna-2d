document.addEventListener("DOMContentLoaded", () => {

    const boton = document.getElementById("finalizar");

    if (!boton) return;

    boton.addEventListener("click", async () => {

        const confirmar = confirm("¿Deseas finalizar la simulación?");
        if (!confirmar) return;

        const data = {
            puntaje: document.getElementById("puntaje")?.innerText || 0,
            tiempo: document.getElementById("tiempo")?.innerText || 0,
            velocidad: document.getElementById("velocidad")?.innerText || 0,

            // 🔥 IMPORTANTE: estos nombres deben coincidir con Flask
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
            console.log("Error guardando:", err);
        }

        window.location.href = "/resultado";
    });

});