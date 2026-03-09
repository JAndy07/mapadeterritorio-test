// transporte.js - LÓGICA DE COLECTIVOS Y RECORRIDOS (Blindado)

document.addEventListener('DOMContentLoaded', () => {
    const btnTransporte = document.getElementById('btn_transporte');
    const panelTransporte = document.getElementById('panel_transporte');
    const btnCerrarTransporte = document.getElementById('btn_cerrar_transporte');
    const btnQuitarRecorrido = document.getElementById('btn_quitar_recorrido');
    const botonesLineas = document.querySelectorAll('.btn-linea');

    let capaRutaActiva = null;
    let capaParadasActiva = L.layerGroup(); 

    // ==========================================
    // 🗺️ BASE DE DATOS DE RECORRIDOS
    // ==========================================
    const recorridos = {
        "501_1_ida": { 
            color: "#005F02", 
            ruta: [
                [-34.86107, -58.38686], [-34.86180, -58.38675], [-34.86186, -58.38669],
                [-34.86190, -58.38659], [-34.86190, -58.38646], [-34.86219, -58.38649],
                [-34.86254, -58.38643], [-34.86302, -58.38609], [-34.86072, -58.38139],
                [-34.85981, -58.38210], [-34.85627, -58.37487], [-34.84901, -58.38013],
                [-34.84703, -58.37615], [-34.85238, -58.37194], [-34.85084, -58.36899],
                [-34.85148, -58.36857], [-34.85169, -58.36857], [-34.85360, -58.36712],
                [-34.85464, -58.36652], [-34.85789, -58.36403], [-34.85846, -58.36359]
            ], 
            paradas: [
                { coords: [-34.86255, -58.38507], nombre: "Parada 1" }, { coords: [-34.86201, -58.38394], nombre: "Parada 2" },
                { coords: [-34.86156, -58.38302], nombre: "Parada 3" }, { coords: [-34.86119, -58.38224], nombre: "Parada 4" },
                { coords: [-34.85949, -58.38128], nombre: "Parada 5" }, { coords: [-34.85905, -58.38038], nombre: "Parada 6" },
                { coords: [-34.85849, -58.37929], nombre: "Parada 7" }, { coords: [-34.85795, -58.37820], nombre: "Parada 8" },
                { coords: [-34.85741, -58.37708], nombre: "Parada 9" }, { coords: [-34.85687, -58.37600], nombre: "Parada 10" },
                { coords: [-34.85632, -58.37490], nombre: "Parada 11" }, { coords: [-34.85537, -58.37545], nombre: "Parada 12" },
                { coords: [-34.85447, -58.37609], nombre: "Parada 13" }, { coords: [-34.85356, -58.37676], nombre: "Parada 14" },
                { coords: [-34.85265, -58.37743], nombre: "Parada 15" }, { coords: [-34.85175, -58.37809], nombre: "Parada 16" },
                { coords: [-34.85082, -58.37873], nombre: "Parada 17" }, { coords: [-34.84992, -58.37941], nombre: "Parada 18" },
                { coords: [-34.84904, -58.38000], nombre: "Parada 19" }, { coords: [-34.84798, -58.37797], nombre: "Parada 20" },
                { coords: [-34.84712, -58.37624], nombre: "Parada 21" }, { coords: [-34.84788, -58.37557], nombre: "Parada 22" },
                { coords: [-34.84879, -58.37489], nombre: "Parada 23" }, { coords: [-34.84968, -58.37416], nombre: "Parada 24" },
                { coords: [-34.85055, -58.37347], nombre: "Parada 25" }, { coords: [-34.85145, -58.37279], nombre: "Parada 26" },
                { coords: [-34.85235, -58.37210], nombre: "Parada 27" }, { coords: [-34.85193, -58.37091], nombre: "Parada 28" },
                { coords: [-34.85141, -58.36999], nombre: "Parada 29" }, { coords: [-34.85093, -58.36903], nombre: "Parada 30" },
                { coords: [-34.85291, -58.36769], nombre: "Parada 31" }, { coords: [-34.85359, -58.36717], nombre: "Parada 32" },
                { coords: [-34.85489, -58.36645], nombre: "Parada 33" }, { coords: [-34.85845, -58.36367], nombre: "Parada 34" }
            ]
        },
        "501_1_vuelta": {
            color: "#005F02",
            ruta: [
                [-34.85842, -58.36361], [-34.85438, -58.36665], [-34.85344, -58.36718],
                [-34.85177, -58.36850], [-34.85130, -58.36860], [-34.84787, -58.37126],
                [-34.84943, -58.37412], [-34.84704, -58.37594], [-34.84703, -58.37623],
                [-34.84893, -58.38009], [-34.84916, -58.38008], [-34.85624, -58.37496],
                [-34.86155, -58.38568], [-34.86023, -58.38667], [-34.86020, -58.38687],
                [-34.86031, -58.38697], [-34.86046, -58.38695]
            ],
            paradas: [
                { coords: [-34.85730, -58.36444], nombre: "Parada 1" }, { coords: [-34.85503, -58.36615], nombre: "Parada 2" },
                { coords: [-34.85370, -58.36700], nombre: "Parada 3" }, { coords: [-34.85300, -58.36748], nombre: "Parada 4" },
                { coords: [-34.85228, -58.36802], nombre: "Parada 5" }, { coords: [-34.85087, -58.36890], nombre: "Parada 6" },
                { coords: [-34.85002, -58.36955], nombre: "Parada 7" }, { coords: [-34.84935, -58.37005], nombre: "Parada 8" },
                { coords: [-34.84869, -58.37056], nombre: "Parada 9" }, { coords: [-34.84795, -58.37117], nombre: "Parada 10" },
                { coords: [-34.84935, -58.37400], nombre: "Parada 11" }, { coords: [-34.84732, -58.37568], nombre: "Parada 12" },
                { coords: [-34.84781, -58.37786], nombre: "Parada 13" }, { coords: [-34.84921, -58.38008], nombre: "Parada 14" },
                { coords: [-34.84986, -58.37960], nombre: "Parada 15" }, { coords: [-34.85079, -58.37893], nombre: "Parada 16" },
                { coords: [-34.85172, -58.37828], nombre: "Parada 17" }, { coords: [-34.85261, -58.37760], nombre: "Parada 18" },
                { coords: [-34.85351, -58.37696], nombre: "Parada 19" }, { coords: [-34.85440, -58.37632], nombre: "Parada 20" },
                { coords: [-34.85533, -58.37566], nombre: "Parada 21" }, { coords: [-34.85623, -58.37500], nombre: "Parada 22" },
                { coords: [-34.85671, -58.37591], nombre: "Parada 23" }, { coords: [-34.85725, -58.37705], nombre: "Parada 24" },
                { coords: [-34.85779, -58.37814], nombre: "Parada 25" }, { coords: [-34.85834, -58.37922], nombre: "Parada 26" },
                { coords: [-34.85888, -58.38028], nombre: "Parada 27" }, { coords: [-34.85971, -58.38202], nombre: "Parada 28" },
                { coords: [-34.86051, -58.38361], nombre: "Parada 29" }, { coords: [-34.86093, -58.38452], nombre: "Parada 30" },
                { coords: [-34.86150, -58.38565], nombre: "Parada 31" }, { coords: [-34.86045, -58.38694], nombre: "Parada 32" }
            ]
        },
        // ESPACIOS VACÍOS PARA LOS RECORRIDOS QUE FALTAN (Con protección)
        "506_ida": { 
            color: "#D96868", 
            ruta: [
                [-34.84362, -58.37856], [-34.84700, -58.37616], [-34.85113, -58.38449],
                [-34.85124, -58.38449], [-34.85935, -58.37864], [-34.86114, -58.38227],
                [-34.86065, -58.38385], [-34.86032, -58.38485], [-34.86022, -58.38515],
                [-34.86013, -58.38529], [-34.85921, -58.38592], [-34.85962, -58.38670],
                [-34.86020, -58.38668], [-34.86027, -58.38661], [-34.86119, -58.38596],
                [-34.86249, -58.38497], [-34.86252, -58.38508], [-34.86305, -58.38608],
                [-34.86241, -58.38672], [-34.86256, -58.38782], [-34.86269, -58.38779],
                [-34.86312, -58.38872], [-34.86371, -58.38831], [-34.86369, -58.38922],
                [-34.86448, -58.38929]
            ], 
            paradas: [
                { coords: [-34.86376, -58.38920], nombre: "Parada 1" }, { coords: [-34.86271, -58.38779], nombre: "Parada 2" },
                { coords: [-34.86163, -58.38559], nombre: "Parada 3" }, { coords: [-34.85955, -58.38664], nombre: "Parada 4" },
                { coords: [-34.86069, -58.38402], nombre: "Parada 5" }, { coords: [-34.86116, -58.38203], nombre: "Parada 6" },
                { coords: [-34.86072, -58.38127], nombre: "Parada 7" }, { coords: [-34.86040, -58.38048], nombre: "Parada 8" },
                { coords: [-34.86002, -58.37972], nombre: "Parada 9" }, { coords: [-34.85949, -58.37858], nombre: "Parada 10" },
                { coords: [-34.85844, -58.37912], nombre: "Parada 11" }, { coords: [-34.85756, -58.37977], nombre: "Parada 12" },
                { coords: [-34.85666, -58.38044], nombre: "Parada 13" }, { coords: [-34.85484, -58.38173], nombre: "Parada 14" },
                { coords: [-34.85575, -58.38109], nombre: "Parada 15" }, { coords: [-34.85393, -58.38240], nombre: "Parada 16" },
                { coords: [-34.85301, -58.38305], nombre: "Parada 17" }, { coords: [-34.85211, -58.38376], nombre: "Parada 18" },
                { coords: [-34.85121, -58.38435], nombre: "Parada 19" }, { coords: [-34.85023, -58.38237], nombre: "Parada 20" },
                { coords: [-34.84914, -58.38016], nombre: "Parada 21" }, { coords: [-34.84804, -58.37793], nombre: "Parada 22" },
                { coords: [-34.84712, -58.37616], nombre: "Parada 23" }, { coords: [-34.84637, -58.37651], nombre: "Parada 24" },
                { coords: [-34.84358, -58.37848], nombre: "Parada 25" }
            ]
        },
        "506_vuelta": { 
            color: "#D96868", 
            ruta: [
                [-34.84297, -58.37908], [-34.84700, -58.37616], [-34.85113, -58.38449],
                [-34.85124, -58.38449], [-34.85935, -58.37864], [-34.86114, -58.38227],
                [-34.86065, -58.38385], [-34.86032, -58.38485], [-34.86022, -58.38515],
                [-34.86016, -58.38535], [-34.85976, -58.38672], [-34.85974, -58.38683],
                [-34.86191, -58.38655], [-34.86212, -58.38658], [-34.86232, -58.38657],
                [-34.86241, -58.38672], [-34.86270, -58.38945], [-34.86379, -58.38948]
            ], 
            paradas: [
                { coords: [-34.86380, -58.38949], nombre: "Parada 1" }, { coords: [-34.86245, -58.38748], nombre: "Parada 2" },
                { coords: [-34.85976, -58.38661], nombre: "Parada 3" }, { coords: [-34.86076, -58.38341], nombre: "Parada 4" },
                { coords: [-34.86102, -58.38213], nombre: "Parada 5" }, { coords: [-34.86063, -58.38135], nombre: "Parada 6" },
                { coords: [-34.86024, -58.38057], nombre: "Parada 7" }, { coords: [-34.85980, -58.37966], nombre: "Parada 8" },
                { coords: [-34.85926, -58.37871], nombre: "Parada 9" }, { coords: [-34.85835, -58.37938], nombre: "Parada 10" },
                { coords: [-34.85750, -58.38000], nombre: "Parada 11" }, { coords: [-34.85658, -58.38064], nombre: "Parada 12" },
                { coords: [-34.85568, -58.38129], nombre: "Parada 13" }, { coords: [-34.85477, -58.38197], nombre: "Parada 14" },
                { coords: [-34.85388, -58.38261], nombre: "Parada 15" }, { coords: [-34.85298, -58.38328], nombre: "Parada 16" },
                { coords: [-34.85208, -58.38394], nombre: "Parada 17" }, { coords: [-34.85107, -58.38443], nombre: "Parada 18" },
                { coords: [-34.85000, -58.38231], nombre: "Parada 19" }, { coords: [-34.84894, -58.38006], nombre: "Parada 20" },
                { coords: [-34.84784, -58.37785], nombre: "Parada 21" }, { coords: [-34.84636, -58.37676], nombre: "Parada 22" },
                { coords: [-34.84348, -58.37875], nombre: "Parada 23" }
            ]
        },
        "74_79_vuelta": { 
            color: "#4988C4", 
            ruta: [
                [-34.84122, -58.38029], [-34.84704, -58.37617], [-34.85274, -58.38783],
                [-34.85292, -58.38792], [-34.85579, -58.38756], [-34.85590, -58.38748],
                [-34.85848, -58.38722], [-34.85864, -58.38697], [-34.86193, -58.38661],
                [-34.86237, -58.38656], [-34.86272, -58.38953], [-34.86363, -58.38949]
            ], 
            paradas: [
                { coords: [-34.84183, -58.37987], nombre: "Parada 1" },
                { coords: [-34.84631, -58.37676], nombre: "Parada 2" },
                { coords: [-34.84781, -58.37786], nombre: "Parada 3" },
                { coords: [-34.84893, -58.38007], nombre: "Parada 4" },
                { coords: [-34.85002, -58.38229], nombre: "Parada 5" },
                { coords: [-34.85170, -58.38569], nombre: "Parada 6" },
                { coords: [-34.85273, -58.38778], nombre: "Parada 7" },
                { coords: [-34.85606, -58.38746], nombre: "Parada 8" },
                { coords: [-34.85923, -58.38690], nombre: "Parada 9" },
                { coords: [-34.86240, -58.38779], nombre: "Parada 10" },
                { coords: [-34.86363, -58.38949], nombre: "Parada 11" }
            ]
        },
        "74_79_ida": { 
            color: "#4988C4", 
            ruta: [
                [-34.86530, -58.38931], [-34.86291, -58.38927], [-34.86269, -58.38880],
                [-34.86243, -58.38666], [-34.86254, -58.38642], [-34.86299, -58.38611],
                [-34.86247, -58.38501], [-34.86024, -58.38666], [-34.86021, -58.38673],
                [-34.85836, -58.38694], [-34.85620, -58.38719], [-34.85572, -58.38745],
                [-34.85511, -58.38756], [-34.85280, -58.38782], [-34.84702, -58.37611],
                [-34.84547, -58.37728]
            ], 
            paradas: [
                { coords: [-34.86530, -58.38930], nombre: "Parada 1" },
                { coords: [-34.86256, -58.38772], nombre: "Parada 2" },
                { coords: [-34.86163, -58.38558], nombre: "Parada 3" },
                { coords: [-34.85626, -58.38717], nombre: "Parada 4" },
                { coords: [-34.85909, -58.38681], nombre: "Parada 5" },
                { coords: [-34.85286, -58.38780], nombre: "Parada 6" },
                { coords: [-34.85128, -58.38464], nombre: "Parada 7" },
                { coords: [-34.85021, -58.38239], nombre: "Parada 8" },
                { coords: [-34.84911, -58.38020], nombre: "Parada 9" },
                { coords: [-34.84797, -58.37792], nombre: "Parada 10" },
                { coords: [-34.84717, -58.37635], nombre: "Parada 11" },
                { coords: [-34.84546, -58.37721], nombre: "Parada 12" }
            ]
        },
        "501_2_ida": { 
            color: "#005F02", 
            ruta: [
                [-34.86125, -58.38684], [-34.86181, -58.38678], [-34.86190, -58.38659],
                [-34.86194, -58.38646], [-34.86234, -58.38645], [-34.86258, -58.38641],
                [-34.86301, -58.38610], [-34.86197, -58.38395], [-34.86142, -58.38284],
                [-34.86115, -58.38222], [-34.86072, -58.38135], [-34.85978, -58.38205],
                [-34.85417, -58.37058], [-34.85414, -58.37053], [-34.85437, -58.37039],
                [-34.85431, -58.37024], [-34.85408, -58.37052], [-34.85233, -58.37186],
                [-34.85137, -58.36995], [-34.85087, -58.36901], [-34.85040, -58.36815],
                [-34.85022, -58.36779], [-34.84954, -58.36654], [-34.84894, -58.36535],
                [-34.84840, -58.36426], [-34.84810, -58.36372], [-34.84721, -58.36205],
                [-34.84676, -58.36116], [-34.84637, -58.36043], [-34.84628, -58.36039]
            ], 
            paradas: [
                { coords: [-34.86260, -58.38505], nombre: "Parada 1" }, { coords: [-34.86306, -58.38602], nombre: "Parada 2" },
                { coords: [-34.86205, -58.38392], nombre: "Parada 3" }, { coords: [-34.85951, -58.38126], nombre: "Parada 4" },
                { coords: [-34.85907, -58.38038], nombre: "Parada 5" }, { coords: [-34.85795, -58.37818], nombre: "Parada 6" },
                { coords: [-34.85743, -58.37705], nombre: "Parada 7" }, { coords: [-34.85690, -58.37597], nombre: "Parada 8" },
                { coords: [-34.85633, -58.37490], nombre: "Parada 9" }, { coords: [-34.85580, -58.37381], nombre: "Parada 10" },
                { coords: [-34.85521, -58.37260], nombre: "Parada 11" }, { coords: [-34.85461, -58.37143], nombre: "Parada 12" },
                { coords: [-34.85424, -58.37048], nombre: "Parada 13" }, { coords: [-34.85246, -58.37170], nombre: "Parada 14" },
                { coords: [-34.85187, -58.37084], nombre: "Parada 15" }, { coords: [-34.85143, -58.36992], nombre: "Parada 16" },
                { coords: [-34.85094, -58.36898], nombre: "Parada 17" }, { coords: [-34.85028, -58.36774], nombre: "Parada 18" },
                { coords: [-34.84958, -58.36645], nombre: "Parada 19" }, { coords: [-34.84894, -58.36524], nombre: "Parada 20" },
                { coords: [-34.84855, -58.36444], nombre: "Parada 21" }, { coords: [-34.84810, -58.36365], nombre: "Parada 22" },
                { coords: [-34.84757, -58.36266], nombre: "Parada 23" }, { coords: [-34.84706, -58.36171], nombre: "Parada 24" },
                { coords: [-34.86152, -58.38290], nombre: "Parada 25" }, { coords: [-34.86075, -58.38133], nombre: "Parada 26" }
            ]
        },
    };

    // ==========================================
        // ⚙️ LÓGICA DE INTERFAZ Y SUB-MENÚS 
        // ==========================================

        const tarjetaSubTransporte = document.getElementById('tarjeta_sub_transporte');
        const tituloSubTransporte = document.getElementById('titulo_sub_transporte');
        const botonesSubTransporte = document.getElementById('botones_sub_transporte');
        const btnVolverTransporte = document.getElementById('btn_volver_transporte');
        // (Líneas duplicadas eliminadas para que no haya errores de sintaxis)

        function ocultarControles() { document.body.classList.add('ocultar-flotantes'); }
        function mostrarControles() { document.body.classList.remove('ocultar-flotantes'); }

        function apagarTerritorios() {
            if (window.capaTerritorios && window.mapa.hasLayer(window.capaTerritorios)) {
                window.mapa.removeLayer(window.capaTerritorios);
            }
        }
        function encenderTerritorios() {
            if (window.capaTerritorios && !window.mapa.hasLayer(window.capaTerritorios)) {
                window.capaTerritorios.addTo(window.mapa);
            }
        }

        if (btnTransporte && panelTransporte) {
            btnTransporte.addEventListener('click', () => {
                panelTransporte.classList.add('visible');
                if (tarjetaSubTransporte) tarjetaSubTransporte.classList.remove('visible');
                ocultarControles(); 
            });
            btnCerrarTransporte.addEventListener('click', () => {
                panelTransporte.classList.remove('visible');
                mostrarControles(); 
            });
        }

        // 2. DIBUJAR RECORRIDO (Sabe si debe mostrar la píldora o no)
        function dibujarRecorridoEnMapa(idRamal, usarBotonFlotante = true) {
            const datosLinea = recorridos[idRamal];
            if (!datosLinea || !window.mapa) return;

            apagarTerritorios(); 

            if (capaRutaActiva) window.mapa.removeLayer(capaRutaActiva);
            capaParadasActiva.clearLayers();

            if (datosLinea.ruta && datosLinea.ruta.length > 0) {
                capaRutaActiva = L.polyline(datosLinea.ruta, {
                    color: datosLinea.color, weight: 6, opacity: 0.9, lineJoin: 'round'
                }).addTo(window.mapa);

                if (datosLinea.paradas) {
                    datosLinea.paradas.forEach(parada => {
                        const marcador = L.circleMarker(parada.coords, {
                            radius: 8, fillColor: '#ffffff', color: datosLinea.color, weight: 4, fillOpacity: 1
                        }).bindTooltip(`🚏 ${parada.nombre}`, { direction: 'top', className: 'etiqueta-parada' });
                        capaParadasActiva.addLayer(marcador);
                    });
                    capaParadasActiva.addTo(window.mapa);
                }
                window.mapa.fitBounds(capaRutaActiva.getBounds(), { padding: [50, 50] });
            } else {
                alert("🚧 Este recorrido todavía no fue trazado.");
                encenderTerritorios();
            }

            if (btnQuitarRecorrido) {
                btnQuitarRecorrido.style.display = usarBotonFlotante ? 'block' : 'none';
            }
        }

                // 3. SELECCIÓN DE LÍNEAS
                botonesLineas.forEach(boton => {
                    boton.addEventListener('click', function() {
                        if (navigator.vibrate) navigator.vibrate(15); // Hace vibrar el celular

                        const idLinea = this.getAttribute('data-linea');
                        // ... (el resto del código sigue igual)

                if (idLinea === "506" || idLinea === "74_79") {
                    panelTransporte.classList.remove('visible'); 

                    if (idLinea === "506") {
                        tituloSubTransporte.innerText = "Línea 506";
                        botonesSubTransporte.innerHTML = `
                            <button class="btn-segmento activo" data-ramal="506_ida">San José x Bynnon</button>
                            <button class="btn-segmento" data-ramal="506_vuelta">Estación de Longchamps</button>
                        `;
                        dibujarRecorridoEnMapa("506_ida", false); 
                    } else if (idLinea === "74_79") {
                        tituloSubTransporte.innerText = "Líneas 74 / 79";
                        botonesSubTransporte.innerHTML = `
                            <button class="btn-segmento activo" data-ramal="74_79_ida">Plaza Constitución</button>
                            <button class="btn-segmento" data-ramal="74_79_vuelta">Estación de Longchamps</button>
                        `;
                        dibujarRecorridoEnMapa("74_79_ida", false); 
                    }

                    const segmentos = botonesSubTransporte.querySelectorAll('.btn-segmento');
                    segmentos.forEach(btn => {
                        btn.addEventListener('click', function() {
                            segmentos.forEach(b => b.classList.remove('activo'));
                            this.classList.add('activo');
                            dibujarRecorridoEnMapa(this.getAttribute('data-ramal'), false);
                        });
                    });

                    setTimeout(() => tarjetaSubTransporte.classList.add('visible'), 50);
                } 
                else {
                    panelTransporte.classList.remove('visible');
                    dibujarRecorridoEnMapa(idLinea, true); 
                }
            });
        });

        // 4. BOTÓN ROJO DE LA TARJETA iOS (Volver)
        if (btnVolverTransporte) {
            btnVolverTransporte.addEventListener('click', () => {
                tarjetaSubTransporte.classList.remove('visible'); 

                if (capaRutaActiva) window.mapa.removeLayer(capaRutaActiva);
                capaParadasActiva.clearLayers();
                encenderTerritorios(); 

                setTimeout(() => panelTransporte.classList.add('visible'), 300);
            });
        }

        // 5. PÍLDORA FLOTANTE (Para la línea 501)
        if (btnQuitarRecorrido) {
            btnQuitarRecorrido.addEventListener('click', () => {
                if (capaRutaActiva) window.mapa.removeLayer(capaRutaActiva);
                capaParadasActiva.clearLayers();

                encenderTerritorios(); 
                mostrarControles(); 

                btnQuitarRecorrido.style.display = 'none';
            });
        }
    });