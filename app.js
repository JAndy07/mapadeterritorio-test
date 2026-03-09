// app.js - MOTOR COMPLETO Y BLINDADO

// --- 1. MODO OSCURO ---
const btnLuna = document.getElementById('btn_modo_oscuro');
if (btnLuna) {
    if (localStorage.getItem('temaOscuro') === 'true') {
        document.body.classList.add('modo-oscuro');
        btnLuna.innerHTML = "☀️";
    }
    btnLuna.onclick = function(e) {
        e.preventDefault();
        document.body.classList.toggle('modo-oscuro');
        const estaOscuro = document.body.classList.contains('modo-oscuro');
        localStorage.setItem('temaOscuro', estaOscuro);
        btnLuna.innerHTML = estaOscuro ? "☀️" : "🌙";
        // Cambia el color de la barra del celular
            const colorBarra = estaOscuro ? '#1c1c1e' : '#007AFF';
            document.querySelector('meta[name="theme-color"]').setAttribute('content', colorBarra);
        };
}

// --- 2. CONFIGURACIÓN DEL MAPA ---
window.mapa = L.map('mi_mapa', { tap: false, zoomControl: false, renderer: L.canvas({ padding: 1 }) }).setView([-34.8510, -58.3780], 15);
L.control.zoom({ position: 'bottomright' }).addTo(window.mapa); 

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(window.mapa);

window.mapa.createPane('capa_puntos');
window.mapa.getPane('capa_puntos').style.zIndex = 600; 
const capaPuntosNoVisitar = L.layerGroup().addTo(window.mapa);

window.mapa.createPane('capa_textos');
window.mapa.getPane('capa_textos').style.zIndex = 650;
window.mapa.getPane('capa_textos').style.pointerEvents = 'none'; 
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', { maxZoom: 19, pane: 'capa_textos' }).addTo(window.mapa);

// --- 3. FOCO VISUAL Y TERRITORIOS ---
let idInterno = 0; 
const capasGuardadas = {}; 

function enfocarTerritorio(capaSeleccionada) {
    Object.values(capasGuardadas).forEach(capa => {
        if (capa === capaSeleccionada) {
            capa.setStyle({ fillOpacity: 0.6, weight: 4, color: capa.colorOriginal, fillColor: capa.colorOriginal });
            if (capa.bringToFront) capa.bringToFront();
        } else {
            capa.setStyle({ fillOpacity: 0.1, weight: 1, color: '#c7c7cc', fillColor: '#e5e5ea' });
        }
    });
}

function restaurarTerritorios() {
    Object.values(capasGuardadas).forEach(capa => {
        capa.setStyle({ fillOpacity: 0.25, weight: 2, color: capa.colorOriginal, fillColor: capa.colorOriginal });
    });
}

window.capaTerritorios = L.geoJSON(datosTerritorios, {
    style: function () {
        const color = paletaColores[idInterno % paletaColores.length];
        return { color: color, weight: 2, fillColor: color, fillOpacity: 0.25 }; 
    },
    onEachFeature: function (feature, layer) {
        const numeroTerritorioReal = traductorTerritorios[idInterno] || "X";
        layer.colorOriginal = paletaColores[idInterno % paletaColores.length];
        idInterno++; 
        capasGuardadas[numeroTerritorioReal] = layer;

        if (numeroTerritorioReal !== "X") {
            layer.bindTooltip(numeroTerritorioReal, { permanent: true, direction: "center", className: "etiqueta-territorio" }).openTooltip();
        }

        layer.on('click', function(e) {
            L.DomEvent.stopPropagation(e);
            capaPuntosNoVisitar.clearLayers();
            enfocarTerritorio(layer);

            const casas = direccionesNoVisitar[numeroTerritorioReal] || direccionesNoVisitar[parseInt(numeroTerritorioReal, 10)];
            let contenidoHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 class="titulo-tarjeta">Territorio ${numeroTerritorioReal}</h2>
                    <button id="btn_compartir_terr" style="background:none; border:none; font-size:20px; cursor:pointer;">📤</button>
                </div>
            `;

            let textoParaCompartir = `Territorio ${numeroTerritorioReal} - Disponible completo ✅`;

            if (casas && casas.length > 0) {
                let listaCasas = '';
                let listaTextoPlano = [];
                casas.forEach(casa => { 
                    const dir = typeof casa === 'object' ? casa.direccion : casa;
                    listaCasas += `<li>${dir}</li>`; 
                    listaTextoPlano.push(`- ${dir}`);
                    if (typeof casa === 'object' && casa.lat && casa.lng) {
                        L.circleMarker([casa.lat, casa.lng], { pane: 'capa_puntos', color: '#fff', weight: 3, fillColor: '#FF0000', fillOpacity: 1, radius: 9 })
                        .bindTooltip(dir, { direction: 'top' }).addTo(capaPuntosNoVisitar);
                    }
                });
                contenidoHTML += `<div class="alerta-no-visitar"><div class="alerta-header">🚫 Direcciones No Visitar:</div><ul class="lista-direcciones">${listaCasas}</ul></div>`;
                textoParaCompartir = `🚫 *No Visitar - Territorio ${numeroTerritorioReal}*\n${listaTextoPlano.join('\n')}`;
            } else {
                contenidoHTML += `<div class="alerta-disponible">✅ Todo el territorio disponible</div>`;
            }

            document.getElementById('contenido_tarjeta').innerHTML = contenidoHTML;

            // Lógica del botón de compartir
            document.getElementById('btn_compartir_terr').addEventListener('click', () => {
                if (navigator.vibrate) navigator.vibrate(15);
                if (navigator.share) {
                    navigator.share({ title: `Territorio ${numeroTerritorioReal}`, text: textoParaCompartir });
                } else {
                    alert("Tu navegador no soporta esta función.");
                }
            });

            setTimeout(() => document.getElementById('tarjeta_info').classList.add('tarjeta-visible'), 10);

            document.getElementById('contenido_tarjeta').innerHTML = contenidoHTML;
            setTimeout(() => document.getElementById('tarjeta_info').classList.add('tarjeta-visible'), 10);
        });
    }
}).addTo(window.mapa);

// --- 4. CERRAR TARJETAS ---
function cerrarTarjeta() {
    const tarjeta = document.getElementById('tarjeta_info');
    if(tarjeta) tarjeta.classList.remove('tarjeta-visible');
    capaPuntosNoVisitar.clearLayers();
    restaurarTerritorios(); 
}
window.mapa.on('click', cerrarTarjeta);
document.querySelector('.tarjeta-handle')?.addEventListener('click', cerrarTarjeta);
document.getElementById('btn_cerrar_tarjeta')?.addEventListener('click', cerrarTarjeta);

// --- 5. BUSCADOR ---
function ejecutarBusqueda() {
    const inputEl = document.getElementById('buscador_input');
    if (!inputEl) return;
    const texto = inputEl.value.toLowerCase().trim();
    if(!texto) return;

    if (capasGuardadas[texto]) {
        const capa = capasGuardadas[texto];
        window.mapa.fitBounds(capa.getBounds(), { padding: [50, 50] }); 
        setTimeout(() => capa.fire('click'), 400); 
        return;
    }

    let encontrado = false;
    for (const [numero, casas] of Object.entries(direccionesNoVisitar)) {
        if (casas.some(casa => {
            const nombre = typeof casa === 'object' ? casa.direccion : casa;
            return nombre.toLowerCase().includes(texto);
        })) {
            const capa = capasGuardadas[numero];
            if(capa) {
                window.mapa.fitBounds(capa.getBounds(), { padding: [50, 50] });
                setTimeout(() => capa.fire('click'), 400);
                encontrado = true;
                break; 
            }
        }
    }
    if(!encontrado) alert("No se encontró ese territorio o calle.");
}

const btnBuscador = document.getElementById('buscador_btn');
const inputBuscador = document.getElementById('buscador_input');
if (btnBuscador) btnBuscador.addEventListener('click', ejecutarBusqueda);
if (inputBuscador) inputBuscador.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') ejecutarBusqueda();
});

// --- 6. LISTA NO VISITAR ---
const btnLista = document.getElementById('btn_lista_no_visitar');
const panelLista = document.getElementById('panel_lista');
const btnCerrarLista = document.getElementById('btn_cerrar_lista');
const contenedorLista = document.getElementById('contenido_lista');

function generarListaCompleta() {
    let html = '';
    const territorios = Object.keys(direccionesNoVisitar).map(Number).sort((a, b) => a - b);

    territorios.forEach(terr => {
        const casas = direccionesNoVisitar[terr];
        if (casas && casas.length > 0) {
            html += `<div class="grupo-territorio"><div class="titulo-territorio"><h3>Territorio ${terr}</h3><button class="btn-ir-territorio" onclick="irAlTerritorioDesdeLista('${terr}')">📍 Ver mapa</button></div><ul>`;
            casas.forEach(casa => {
                const nombreCalle = typeof casa === 'object' ? casa.direccion : casa;
                html += `<li>${nombreCalle}</li>`;
            });
            html += `</ul></div>`;
        }
    });
    if(contenedorLista) contenedorLista.innerHTML = html;
}

window.irAlTerritorioDesdeLista = function(numeroTerritorio) {
    if(panelLista) panelLista.classList.remove('panel-visible');
    if(inputBuscador && btnBuscador) {
        inputBuscador.value = numeroTerritorio;
        btnBuscador.click();
    }
};

if (btnLista && panelLista) {
    btnLista.addEventListener('click', function() {
        generarListaCompleta(); 
        panelLista.classList.add('panel-visible');
    });
    if(btnCerrarLista) btnCerrarLista.addEventListener('click', () => panelLista.classList.remove('panel-visible'));
}

// --- 7. GPS Y RUTAS ---
let marcadorUbicacion, circuloPrecision;
window.mapa.locate({ watch: true, setView: false, enableHighAccuracy: true, timeout: 15000 });

window.mapa.on('locationfound', function(e) {
    window.miUbicacionActual = e.latlng;
    const radio = e.accuracy / 2;
    if (marcadorUbicacion) {
        marcadorUbicacion.setLatLng(e.latlng);
        circuloPrecision.setLatLng(e.latlng);
        circuloPrecision.setRadius(radio);
    } else {
        circuloPrecision = L.circle(e.latlng, {radius: radio, color: '#007AFF', fillOpacity: 0.15}).addTo(window.mapa);
        marcadorUbicacion = L.circleMarker(e.latlng, {radius: 8, fillColor: '#007AFF', color: '#fff', weight: 2, fillOpacity: 1}).addTo(window.mapa);
    }
});

let controlRuta = null;
window.mapa.on('contextmenu', function(e) {
    if (!window.miUbicacionActual) return alert("📍 Esperando GPS...");
    try {
        if (controlRuta) window.mapa.removeControl(controlRuta);
    } catch(err) {}

    const cartelRuta = document.getElementById('cartel_ruta');
    const textoRuta = document.getElementById('texto_ruta');
    if (cartelRuta) cartelRuta.classList.add('visible');
    if (textoRuta) textoRuta.innerHTML = "⏳ Calculando...";

    controlRuta = L.Routing.control({
        waypoints: [ L.latLng(window.miUbicacionActual.lat, window.miUbicacionActual.lng), e.latlng ],
        router: new L.Routing.OSRMv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: 'foot', useHints: false, computeAlternativeRoutes: false }),
        lineOptions: { styles: [{ color: '#007AFF', opacity: 0.8, weight: 6 }] },
        createMarker: () => null, 
        fitSelectedRoutes: true, show: false 
    }).addTo(window.mapa);

    controlRuta.on('routesfound', function(e) {
        const dist = e.routes[0].summary.totalDistance;
        let textoDist = dist > 1000 ? (dist/1000).toFixed(1) + ' km' : Math.round(dist) + ' m';
        let mins = Math.max(1, Math.round(dist / 83)); 
        if (textoRuta) textoRuta.innerHTML = `🚶‍♂️ ${mins} min (${textoDist})`;
    });
});

const btnCerrarRuta = document.getElementById('btn_cerrar_ruta');
if (btnCerrarRuta) {
    btnCerrarRuta.addEventListener('click', function() {
        try {
            if (controlRuta) { window.mapa.removeControl(controlRuta); controlRuta = null; }
        } catch(error) {}
        const cartel = document.getElementById('cartel_ruta');
        if(cartel) cartel.classList.remove('visible');
    });
}