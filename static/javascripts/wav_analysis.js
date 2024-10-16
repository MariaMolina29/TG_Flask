let socket
document.addEventListener('DOMContentLoaded', () => {
    // socket = io();
    main()
});

function main() {
    Swal.fire({
        title: 'Subir y cargar archivo',
        html: `
            <div class="custom-content">
                <label for="upload_wav" class="custom-label">Seleccionar archivo .wav</label>
                <div class="custom-file-area" id="fileArea">
                    <input type="file" id="upload_wav" class="custom-file-input" accept=".wav">
                </div>
                <div class="container_buttons">  
                    <div class="back-section">
                        <a href="index.html" class="custom-link">
                            <i class="fa-solid fa-arrow-left"></i> Regresar
                        </a>
                    </div>
                    <div>
                        <button id="load_wav" class="custom-button">Cargar<i class="fa-solid fa-chart-line"></i></button>
                    </div>
                </div>
            </div>
        `,
        showConfirmButton: false,  // Puedes ocultar el botón de confirmación para manejarlo manualmente
        // allowOutsideClick: false,
        allowOutsideClick: true,
        iconHtml: '<i class="fa-solid fa-upload fa-beat"></i>',  // Ícono de subida de archivo con rebote
        customClass: {
            popup: '.custom_swal_popup',
        },
        didOpen: () => {
            // socket.emit('get_processed_audio');
            // socket.on('loading', () => {
            //     sweet_alert("Datos guardados correctamente", `los datos se han  subido correctamente espere para el procesamiento.`, "success", "", undefined, false, true, null);
            // });

            // let upload_wav = document.getElementById('upload_wav');
            // let load_wav_button = document.getElementById('load_wav');
            // let formats_checkbox = document.getElementById('formats_checkbox');
            // let audio_player = document.getElementById('audio_player');
            // let download_txt = document.getElementById('download_txt');
            // let download_wav = document.getElementById('download_wav');
            fetch('../static/data.json')
            
                .then(response => response.json())
                .then(data => {
                    // Aquí es donde asignas los datos a variables
                    const trace_oscilogram = data.trace_oscilogram;
                    const layout_oscilogram = data.layout_oscilogram;
                    const trace_spectrogram = data.trace_spectrogram;
                    const layout_spectrogram = data.layout_spectrogram;
                    const trace_intensity = data.trace_intensity;
                    const layout_intensity = data.layout_intensity;
                    const trace_spectrogram_3d = data.trace_spectrogram_3d;
                    const layout_spectrogram_3d = data.layout_spectrogram_3d;
                    const trace_spectrum = data.trace_spectrum;
                    const layout_spectrum = data.layout_spectrum;

                    Plotly.newPlot('oscilogram', trace_oscilogram, layout_oscilogram, { responsive: true })
                    Plotly.newPlot('spectrogram', trace_spectrogram, layout_spectrogram, { responsive: true });
                    Plotly.newPlot('intensity', trace_intensity, layout_intensity, { responsive: true });
                    Plotly.newPlot('spectrogram_3d', trace_spectrogram_3d, layout_spectrogram_3d, { responsive: true });
                    Plotly.newPlot('spectrum', trace_spectrum, layout_spectrum, { responsive: true });
                })
                .catch(error => console.error('Error al cargar el archivo JSON:', error));

            // Plotly.newPlot('spectrogram', [], { title: "Esperando Datos..." }, { responsive: true })
            // Plotly.newPlot('spectrum', [], { title: "Esperando Datos..." }, { responsive: true });
            // Plotly.newPlot('spectrogram_3d', [], { title: "Esperando Datos..." }, { responsive: true });
            // Plotly.newPlot('oscilogram', [], { title: "Esperando Datos..." }, { responsive: true });
            // Plotly.newPlot('intensity', [], { title: "Esperando Datos..." }, { responsive: true });

            // load_wav_button.addEventListener('click', () => load_wav(upload_wav))
            // upload_wav.addEventListener('change', () => change_upload(upload_wav))

            // socket.on("plot_data_wav", (plot_data) => {
            //     let parsed_data = JSON.parse(plot_data);
            //     update_graphs(parsed_data, formats_checkbox)
            //     update_elements(parsed_data, upload_wav, audio_player, download_wav, download_txt, NaN)
            //     Swal.close();
            //     cursor(audio_player)
            //     syncLineOnClick(parsed_data.spectrogram_data)
            //     in_out_formants()
            // });
            // socket.on('plot_save_audio', (data) => {
            //     let parsed_data = JSON.parse(data.plot_data);
            //     update_graphs(parsed_data, formats_checkbox);
            //     update_elements(parsed_data, upload_wav, audio_player, download_wav, download_txt, data.audio)
            //     Swal.close();
            //     cursor(audio_player)
            //     syncLineOnClick(parsed_data.spectrogram_data)
            //     in_out_formants()
            // });
        }
    });

}
function change_upload(upload_wav) {
    let fileArea = document.getElementById('fileArea');
    let fileName = upload_wav.files[0] ? upload_wav.files[0].name : 'Haz clic para seleccionar un archivo';

    fileArea.setAttribute('data-file-name', fileName);

    if (fileName !== 'Haz clic para seleccionar un archivo') {
        fileArea.classList.add('has-file');
    } else {
        fileArea.classList.remove('has-file');
    }
}
function load_wav(upload_wav) {
    // Verificar si se seleccionó un archivo
    if (upload_wav.files.length === 0) {
        sweet_alert("Archivo no subido", "Debe subir un archivo .wav antes de continuar.", "error", "OK", undefined, true, false, main);
        return;  // Salir de la función si no hay archivo
    }
    // Obtener el archivo subido
    let file = upload_wav.files[0];

    // Verificar si el archivo es un archivo .wav 
    if (file.type !== "audio/wav") {
        sweet_alert("Formato incorrecto", "Por favor, seleccione un archivo .wav válido.", "error", "OK", undefined, true, false, main);
        return;
    }


    // Leer el archivo como ArrayBuffer (lo más eficiente para enviar datos binarios)
    let reader = new FileReader();
    reader.onload = function (event) {
        let arrayBuffer = event.target.result;  // Obtener el contenido del archivo como ArrayBuffer

        // Enviar el archivo al servidor usando Socket.IO
        socket.emit('process_wav', arrayBuffer);

        sweet_alert("Archivo enviado", `El archivo "${file.name}" ha sido subido correctamente espere para el procesamiento.`, "success", "", undefined, false, true, null);
    };

    // Leer el archivo como ArrayBuffer
    reader.readAsArrayBuffer(file);
}
function update_graphs(parsed_data, formats_checkbox) {
    // Actualizar el oscilograma y la intensidad
    Plotly.react('spectrum', parsed_data.trace_spectrum, parsed_data.layout_spectrum);
    Plotly.react('spectrogram_3d', parsed_data.trace_spectrogram_3d, parsed_data.layout_spectrogram_3d);
    Plotly.react('oscilogram', parsed_data.trace_oscilogram, parsed_data.layout_oscilogram);
    Plotly.react('intensity', parsed_data.trace_intensity, parsed_data.layout_intensity);
    // Filtrar los formantes si el checkbox no está marcado
    if (!formats_checkbox.checked) {
        parsed_data.trace_spectrogram = parsed_data.trace_spectrogram.filter(trace => !trace.name.startsWith('Formant'));
    }
    // Actualizar el espectrograma
    Plotly.react('spectrogram', parsed_data.trace_spectrogram, parsed_data.layout_spectrogram)
}
function update_elements(parsed_data, upload_wav, audio_player, download_wav, download_txt, audio) {
    document.getElementById('download_pdf').addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        let doc = new jsPDF('landscape');

        let plots = document.querySelectorAll('.js-plotly-plot');  // Todas las gráficas de Plotly en la página
        let promises = [];

        // Capturamos cada gráfica como una imagen en base64
        plots.forEach((plot, index) => {
            promises.push(Plotly.toImage(plot, { format: 'png', height: 400, width: 600 })
                .then(function (dataUrl) {
                    if (index > 0) {
                        doc.addPage();  // Agregar una nueva página para cada gráfica, excepto la primera
                    }
                    doc.addImage(dataUrl, 'PNG', 10, 10, 270, 150);  // Insertar la imagen en el PDF (ajustar dimensiones según sea necesario)
                }));
        });

        // Cuando todas las imágenes están listas, generamos el PDF
        Promise.all(promises).then(() => {
            doc.save('figures.pdf');
        });
    });

    let file = upload_wav.files[0];
    if (file) {
        // Crear un URL del archivo seleccionado
        let audio_URL = URL.createObjectURL(file);

        // Asignar el URL como la fuente del reproductor de audio
        audio_player.src = audio_URL;

        download_wav.href = audio_URL;
    } else {
        let audioBlob = new Blob([audio], { type: 'audio/wav' });
        let audio_URL = URL.createObjectURL(audioBlob);

        audio_player.src = audio_URL;

        download_wav.href = audio_URL;


    }
    let blob_text_plain = new Blob([parsed_data.text_content], { type: 'text/plain' });

    // Crear un objeto URL para el blob
    let text_url = URL.createObjectURL(blob_text_plain);

    // Actualizar el href del enlace de descarga
    download_txt.href = text_url;
}
function in_out_formants() {
    let spectrogram = document.getElementById('spectrogram');
    formats_checkbox.addEventListener('change', function (event) {
        show_spinner()
        setTimeout(() => {
            formats_checkbox.disabled = true;

            spectrogram.data.forEach((trace, index) => {
                if (trace.name && trace.name.includes('Formant')) {
                    Plotly.restyle(spectrogram, { visible: formats_checkbox.checked ? true : false }, [index]);
                }
            });

            formats_checkbox.disabled = false;

            hide_spinner()
        }, 100);
    })
}
function cursor(audio_player) {
    if (audio_player) {
        audio_player.addEventListener("timeupdate", function () {
            let current_time = audio_player.currentTime;
            // Selecciona las gráficas y actualiza la posición de la línea
            let figures2d = document.querySelectorAll(".cursor2d");
            figures2d.forEach((fig) => {
                if (fig) {
                    try {
                        Plotly.relayout(fig, { shapes: [{ type: "line", x0: current_time, x1: current_time, y0: 0, y1: 1, xref: "x", yref: "paper", line: { color: "red", width: 2, } }] });

                    } catch (err) {
                        console.error("Error updating plot:", err);
                    }
                } else {
                    console.error(
                        `Element with ID ${fig.id} is not initialized as a Plotly graph.`
                    );
                }
            });

        });
    }
}
function syncLineOnClick(spectrogram_data) {

    let figures2d = document.querySelectorAll(".cursor2d");
    let spectrumFigure = document.querySelector(".cursorEspectro");
    let spectrogram3DFigure = document.querySelector(".cursor3d")
    let oscilogramFigure = document.getElementById("oscilogram")
    let zoom_slider = document.getElementById("zoom_slider")
    let zoom_value = document.getElementById("zoom_value");


    addZoomWindow(oscilogramFigure, 0, 10, false);

    let clicked_time = 0

    zoom_slider.addEventListener("input", function () {
        zoom_value.textContent = zoom_slider.value;
    });
    zoom_slider.addEventListener("change", function () {
        show_spinner()
        setTimeout(() => {
            if (oscilogramFigure) {
                let zoom_value = zoom_slider.value;
                addZoomWindow(oscilogramFigure, clicked_time, parseFloat(zoom_value), false);
            }
            hide_spinner()
        }, 100)

    });

    figures2d.forEach((fig) => {
        if (fig) {
            fig.on('plotly_click', function (data) {

                if (data.event && data.event.button === 0 || data.event && !data.event.button) {
                    if (data.points && data.points.length > 0) {

                        show_spinner()
                        setTimeout(() => {
                            clicked_time = data.points[0].x;

                            // Actualizar todas las gráficas con la nueva línea
                            figures2d.forEach((fig) => {
                                if (fig) {
                                    if (fig.id === 'oscilogram') {
                                        let zoom_value = zoom_slider.value
                                        let result = addZoomWindow(fig, clicked_time, parseFloat(zoom_value), true);
                                        result.layoutUpdate.shapes = [{ type: 'line', x0: clicked_time, x1: clicked_time, y0: 0, y1: 1, xref: 'x', yref: 'paper', line: { color: 'blue', width: 2, dash: 'dash' } }]
                                        Plotly.addTraces(fig, [result.rectTrace, result.zoomTrace]);
                                        Plotly.relayout(fig, result.layoutUpdate);
                                    }
                                    Plotly.relayout(fig, {
                                        shapes: [{ type: 'line', x0: clicked_time, x1: clicked_time, y0: 0, y1: 1, xref: 'x', yref: 'paper', line: { color: 'blue', width: 2, dash: 'dash' } }]
                                    });
                                }
                            });

                            // Actualizar la gráfica de espectro
                            if (spectrumFigure) {
                                updateSpectrumInTime(spectrumFigure, clicked_time, spectrogram_data);

                            }
                            // Actualizar el espectrograma 3D con un plano en el tiempo seleccionado
                            if (spectrogram3DFigure) {
                                // update3DSpectrogramWithPlane(spectrogram3DFigure, clicked_time);
                            }
                            hide_spinner()

                        }, 100)


                    }
                }
            });
        }
    });

}
function updateSpectrumInTime(spectrumFigure, clicked_time, spectrogram_data) {
    // Extrae los datos del espectrograma
    let times = spectrogram_data.times;
    let frequencies = spectrogram_data.frequencies;
    let powerValues = spectrogram_data.power_values;  // Matriz de potencias/intensidades

    // Encuentra el índice del tiempo más cercano al tiempo de clic
    let closestTimeIndex = 0;
    let minTimeDiff = Math.abs(times[0] - clicked_time);
    for (let i = 1; i < times.length; i++) {
        let timeDiff = Math.abs(times[i] - clicked_time);
        if (timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            closestTimeIndex = i;
        }
    }

    // Extraer la columna de potencias correspondiente al tiempo seleccionado
    let selectedPower = powerValues.map(row => row[closestTimeIndex]);

    // Verificar que el contenedor de Plotly está inicializado
    if (spectrumFigure) {
        // Actualizar la gráfica del espectro con los datos filtrados
        Plotly.restyle(spectrumFigure, {
            x: [frequencies],  // Todas las frecuencias
            y: [selectedPower]  // Potencias para el tiempo seleccionado
        });
    } else {
        console.error("Plotly container is not initialized or not found.");
    }
}
function update3DSpectrogramWithPlane(spectrogram3DFigure, clicked_time) {
    let maxFrequency = 8000;
    let minFrequency = 0;
    let minIntensity = -120;
    let maxIntensity = 0;

    // Obtener los datos originales del gráfico 3D (filtrando para no incluir planos antiguos)
    // const originalData = plotlyContainer.data.filter(trace => trace.name !== 'Selected Time Plane');

    let planeData = {
        type: 'surface',
        x: [[clicked_time, clicked_time], [clicked_time, clicked_time]],
        y: [[minFrequency, maxFrequency], [minFrequency, maxFrequency]],
        z: [[minIntensity, minIntensity], [maxIntensity, maxIntensity]],
        colorscale: [[0, 'blue'], [1, 'blue']],
        opacity: 0.3,
        showscale: false,
        name: 'Selected Time Plane'
    };

    let existingPlaneIndex = spectrogram3DFigure.data.findIndex(trace => trace.name === 'Selected Time Plane');

    if (existingPlaneIndex !== -1) {
        // Si ya existe, mover el plano existente
        Plotly.update(spectrogram3DFigure, {
            x: [[[clicked_time, clicked_time], [clicked_time, clicked_time]]],
            y: [[[minFrequency, maxFrequency], [minFrequency, maxFrequency]]],
            z: [[[minIntensity, minIntensity], [maxIntensity, maxIntensity]]]
        }, {}, [existingPlaneIndex]);
    } else {
        // Si no existe, agregar el plano nuevo
        Plotly.addTraces(spectrogram3DFigure, [planeData]);
    }

}
function addZoomWindow(oscilogramFigure, clicked_time, zoomWindowDuration, clicked) {

    zoomWindowDuration = zoomWindowDuration / 1000
    let zoomStart = clicked_time - zoomWindowDuration / 2
    let zoomEnd = clicked_time + zoomWindowDuration / 2


    // Obtener los datos actuales del gráfico
    let currentData = oscilogramFigure.data[0] // Asumiendo que es la primera traza del gráfico
    let xValues = currentData.x
    let yValues = currentData.y

    // Filtrar los datos para el zoom
    let zoomX = [];
    let zoomY = [];
    for (let i = 0; i < xValues.length; i++) {
        if (xValues[i] >= zoomStart && xValues[i] <= zoomEnd) {
            zoomX.push(xValues[i]);
            zoomY.push(yValues[i]);
        }
    }

    // Eliminar cualquier traza de zoom anterior (esto evitará la superposición)
    let zoomTraceIndex = oscilogramFigure.data.findIndex(trace => trace.name === "Zoomed Waveform");
    let rectTraceIndex = oscilogramFigure.data.findIndex(trace => trace.name === "Zoom Area Background");

    if (zoomTraceIndex !== -1) {
        Plotly.deleteTraces(oscilogramFigure, zoomTraceIndex);  // Eliminar la traza existente
    }

    if (rectTraceIndex !== -1) {
        Plotly.deleteTraces(oscilogramFigure, rectTraceIndex);  // Eliminar la traza existente
    }

    // Trazo del rectángulo como fondo
    let rectTrace = {
        x: [Math.min(...zoomX), Math.max(...zoomX), Math.max(...zoomX), Math.min(...zoomX), Math.min(...zoomX)],  // Definir las coordenadas X del rectángulo
        y: [Math.min(...zoomY), Math.min(...zoomY), Math.max(...zoomY), Math.max(...zoomY), Math.min(...zoomY)],  // Definir las coordenadas Y del rectángulo
        fill: 'toself',  // Llenar el área del rectángulo
        fillcolor: 'rgba(0, 0, 0, 0.3)',  // Color de fondo con transparencia
        line: {
            color: 'rgba(0, 0, 0, 0.8)',  // Color del borde del rectángulo
            width: 1  // Grosor del borde
        },
        name: "Zoom Area Background",  // Nombre de la traza
        xaxis: 'x2',  // Usar el segundo eje X
        yaxis: 'y2',  // Usar el segundo eje Y
        mode: 'lines',  // Modo de líneas para los bordes del rectángulo
        showlegend: false
    };


    // Crear un gráfico superpuesto en la esquina superior derecha
    let zoomTrace = {
        x: zoomX,
        y: zoomY,
        mode: 'lines',
        line: { color: 'red' },
        name: "Zoomed Waveform",  // Nombre para identificar la traza de zoom
        xaxis: 'x2',  // Usar un segundo eje x
        yaxis: 'y2',  // Usar un segundo eje y

    };

    let layoutUpdate = {
        xaxis2: {
            domain: [0.75, 1],  // Ajusta la posición en la esquina superior derecha
            anchor: 'y2',
            side: 'top',
            showgrid: true,
            zeroline: false,
            gridcolor: 'rgba(211, 211, 211, 0.7)',  // Cuadrícula negra
            tickvals: [Math.min(...zoomX), Math.max(...zoomX)],  // Mostrar solo el primer y el último valor del zoom
            ticktext: [Math.min(...zoomX).toFixed(3), Math.max(...zoomX).toFixed(3)],  // Etiquetas correspondientes a los valores
            tickangle: 0,
            tickfont: {
                size: 10,  // Tamaño de la fuente para las etiquetas de los valores del eje X
                color: 'black',  // Color de la fuente para las etiquetas de los valores del eje X (opcional)
            },
            title: {
                text: 'Tiempo [s]',  // Texto del título del eje X
                font: {
                    size: 10,  // Tamaño de la fuente para el título (ajústalo según lo necesario)
                },
                standoff: 0  // Reducir la distancia del título con respecto a los valores del eje
            }

        },
        yaxis2: {
            domain: [0.75, 1],
            anchor: 'x2',
            side: 'right',
            showgrid: true,
            zeroline: true,
            gridcolor: 'rgba(211, 211, 211, 0.7)',  // Cuadrícula negra
            zerolinecolor: 'rgba(211, 211, 211, 0.7)',
            tickvals: [Math.min(...zoomY), 0, Math.max(...zoomY)],  // Mostrar solo el primer y el último valor del zoom
            ticktext: [Math.min(...zoomY).toFixed(3), 0, Math.max(...zoomY).toFixed(3)],  // Etiquetas correspondientes a los valores
            tickangle: 0,
            tickfont: {
                size: 10,  // Tamaño de la fuente para las etiquetas de los valores del eje X
                color: 'black',  // Color de la fuente para las etiquetas de los valores del eje X (opcional)
            },
            title: {
                text: 'Amplitud',  // Texto del título del eje Y
                font: {
                    size: 10,  // Tamaño de la fuente para el título
                },
                standoff: 0
            }

        },
        margin: {
            l: 50,
            r: 50,
            t: 50,  // Reducir el margen superior para acercar el título al eje X
            b: 50,
        }
    }

    // Agregar el nuevo zoom al gráfico
    if (clicked) {
        return { rectTrace, zoomTrace, layoutUpdate }
    } else {
        Plotly.addTraces(oscilogramFigure, [rectTrace, zoomTrace]);
        Plotly.relayout(oscilogramFigure, layoutUpdate);
    }
}
function sweet_alert(title, text, icon, confirmButtonText, timer, showConfirmButton, loading, callback) {
    let options = {
        title,
        text,
        icon,
        confirmButtonText,
        timer,
        showConfirmButton,
        allowOutsideClick: false,
    };

    if (loading) {
        options.didOpen = () => {
            Swal.showLoading();
        };
    }

    Swal.fire(options).then((result) => {
        if (result.isConfirmed && callback) {
            callback();  // Ejecuta el callback si se confirma y si el callback fue proporcionado
        }
    });
}
function show_spinner() {
    document.getElementById('spinner_container').classList.add('visible');  // Mostrar el spinner con opacidad
    document.getElementById('spinner').classList.add('spin_active');  // Iniciar la animación del spinner
    document.getElementById('main_content').classList.add('blur');  // Aplicar desenfoque con transición
}
function hide_spinner() {
    document.getElementById('spinner_container').classList.remove('visible');  // Ocultar el spinner
    document.getElementById('spinner').classList.remove('spin_active');  // Detener la animación del spinner
    document.getElementById('main_content').classList.remove('blur');  // Remover el desenfoque
}
