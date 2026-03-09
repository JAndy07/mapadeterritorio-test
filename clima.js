// clima.js - WIDGET DE CLIMA Y PRONÓSTICO 24HS DESLIZABLE

// Función auxiliar para no repetir código de emojis
function obtenerEmoji(codigo) {
    if (codigo === 1 || codigo === 2 || codigo === 3) return "⛅"; 
    if (codigo >= 45 && codigo <= 48) return "🌫️"; 
    if (codigo >= 51 && codigo <= 67) return "🌧️"; 
    if (codigo >= 71 && codigo <= 77) return "❄️"; 
    if (codigo >= 80 && codigo <= 82) return "🌦️"; 
    if (codigo >= 95) return "⛈️"; 
    return "☀️"; // Despejado
}

async function iniciarClima() {
    const widgetClima = document.getElementById('widget_clima');
    const contenedorHoras = document.getElementById('pronostico_horas');

    if (!widgetClima || !contenedorHoras) return;

    // Coordenadas exactas
    const lat = -34.8510;
    const lng = -58.3780;

    // Le pedimos clima actual + pronóstico por hora + Zona Horaria de Argentina
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,weathercode&timezone=America/Argentina/Buenos_Aires&forecast_days=2`;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos && datos.current_weather) {

            // 1. CARGAMOS EL MINI WIDGET PRINCIPAL
            const climaActual = datos.current_weather;
            const tempActual = Math.round(climaActual.temperature);
            const emojiActual = obtenerEmoji(climaActual.weathercode);
            widgetClima.innerHTML = `${emojiActual} ${tempActual}°C`;

            // 2. CARGAMOS LA TARJETA DESLIZABLE (24 HORAS)
            const horaActualString = climaActual.time; // Ej: "2026-03-07T11:48"

            // MAGIA ACÁ: Cortamos los minutos para buscar solo la hora (Ej: "2026-03-07T11")
            const prefijoHora = horaActualString.substring(0, 13); 

            // Buscamos la posición exacta en la lista
            let indiceActual = datos.hourly.time.findIndex(hora => hora.startsWith(prefijoHora));

            // Si por algún motivo la API falla, usamos la hora de tu celular/PC como backup
            if (indiceActual === -1) {
                indiceActual = new Date().getHours(); 
            }

            let htmlPronostico = '';

            // Recorremos las próximas 24 horas saltando de a 2 horas
            // (y le ponemos un límite para que no se pase del array de datos)
            for (let i = indiceActual; i <= indiceActual + 24 && i < datos.hourly.time.length; i += 2) {
                const horaRaw = datos.hourly.time[i]; // Ej: "2026-03-07T14:00"
                const horaLimpia = horaRaw.substring(11, 16); // Extraemos solo el "14:00"
                const temp = Math.round(datos.hourly.temperature_2m[i]);
                const emoji = obtenerEmoji(datos.hourly.weathercode[i]);

                // Le ponemos "Ahora" al primer recuadro
                const etiquetaHora = (i === indiceActual) ? "Ahora" : horaLimpia;

                htmlPronostico += `
                    <div class="hora-clima">
                        <span class="hora">${etiquetaHora}</span>
                        <span class="emoji">${emoji}</span>
                        <span class="temp">${temp}°</span>
                    </div>
                `;
            }
            contenedorHoras.innerHTML = htmlPronostico;
        }
    } catch (error) {
        console.error("Error al obtener el clima:", error);
        widgetClima.innerHTML = "☁️ Error"; 
    }
}

// Controlamos los botones de abrir y cerrar
document.addEventListener('DOMContentLoaded', () => {
    const widgetClima = document.getElementById('widget_clima');
    const tarjetaClima = document.getElementById('tarjeta_clima');
    const btnCerrarClima = document.getElementById('btn_cerrar_clima');

    if (widgetClima && tarjetaClima) {
        // Al tocar el cuadrito del clima, mostramos la tarjeta grande
        widgetClima.addEventListener('click', () => {
            tarjetaClima.classList.add('visible');
        });

        // Al tocar la cruz de la tarjeta, la cerramos
        if (btnCerrarClima) {
            btnCerrarClima.addEventListener('click', () => {
                tarjetaClima.classList.remove('visible');
            });
        }
    }
});

// Ejecutamos por primera vez y programamos actualización cada 30 min
iniciarClima();
setInterval(iniciarClima, 1800000);