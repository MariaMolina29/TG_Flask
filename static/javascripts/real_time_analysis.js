let audio_context
let processor_node
let stream
let socket

document.addEventListener('DOMContentLoaded', () => {
    // socket = io();
    // socket.on('connect', () => {
    //     console.log("Conectado al servidor Flask-SocketIO");
    // });
    // socket.on("disconnect", function () {
    //     console.log("Desconectado del servidor Flask-SocketIO");
    // });
    // let start_recording_button = document.getElementById('start_recording');
    // let stop_recording_button = document.getElementById('stop_recording');
    // let save_and_load_button = document.getElementById('save_and_load_button');
    // let formats_checkbox = document.getElementById('formats_checkbox');
    fetch('static/data.json')
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
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));

    // Plotly.newPlot('oscilogram', [], {title: "Esperando Datos..."}, {responsive: true})
    // Plotly.newPlot('spectrogram', [], {title: "Esperando Datos..."}, {responsive: true});  
    // Plotly.newPlot('intensity', [], {title: "Esperando Datos..."}, {responsive: true});  


    // start_recording_button.addEventListener('click', () => start_recording(start_recording_button, stop_recording_button, save_and_load_button))
    // stop_recording_button.addEventListener('click', () => stop_recording(start_recording_button, stop_recording_button, save_and_load_button, formats_checkbox))
    // save_and_load_button.addEventListener('click', () => save_and_load())

    // socket.on("plot_data_real_time", (plot_data) =>{update_graphs(plot_data, formats_checkbox)});

});

async function start_recording(start_recording_button, stop_recording_button, save_and_load_button) {
    start_recording_button.disabled = true;
    stop_recording_button.disabled = true;
    save_and_load_button.style.display = 'none';
    try {
        let response = await emit_message('start_recording');
        console.log(response)

        // 1. Solicitar acceso al micrófono del usuario
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // 2. Crear el contexto de audio
        audio_context = new AudioContext({ sampleRate: 16000 });
        console.log("Frecuencia de muestreo:", audio_context.sampleRate);

        // 3. Cargar el Worklet (archivo `processor.js`) al contexto de audio
        await audio_context.audioWorklet.addModule("/static/javascripts/processor.js");

        // 4. Crear una fuente de audio a partir del micrófono
        let source = audio_context.createMediaStreamSource(stream);

        // 5. Crear un nodo del Worklet que utilice el procesador definido en `processor.js`
        let processor_node = new AudioWorkletNode(audio_context, "audio-processor");

        // 6. Conectar la fuente al nodo del procesador y luego al destino (altavoces)
        source.connect(processor_node);
        processor_node.connect(audio_context.destination);

        // 7. Enviar datos desde el procesador al servidor Flask-SocketIO
        let buffer = [];
        let buffer_size = 25
        stop_recording_button.disabled = false;
        processor_node.port.onmessage = (event) => {
            let audio_data = event.data;
            let float_array = new Float32Array(audio_data);

            // Acumular los datos en el buffer temporal
            buffer.push(...float_array);
            // Verificar si el buffer ha alcanzado un tamaño específico antes de enviarlo
            if (buffer.length >= buffer_size * 128) {
                // Enviar los datos de audio acumulados al servidor Flask-SocketIO
                socket.emit("audio_data", new Float32Array(buffer).buffer);
                // Vaciar el buffer después de enviar los datos
                buffer = [];
            }
        };
    } catch (err) {
        console.log("Error al acceder al micrófono:", err);
        start_recording_button.disabled = false;
    }
}

function stop_recording(start_recording_button, stop_recording_button, save_and_load_button, formats_checkbox) {
    start_recording_button.disabled = true;
    stop_recording_button.disabled = true;
    let graphDiv = document.getElementById('spectrogram');

    formats_checkbox.addEventListener('change', function (event) {
        formats_checkbox.disabled = true;
        graphDiv.data.forEach((trace, index) => {
            if (trace.name && trace.name.includes('Formant')) {
                Plotly.restyle(graphDiv, { visible: formats_checkbox.checked ? true : false }, [index]);
            }
        });
        formats_checkbox.disabled = false;
    })

    if (processor_node) {
        // Desconectar el procesador de audio
        processor_node.onaudioprocess = null;
        processor_node.disconnect();
        processor_node = null
    }
    if (audio_context) {
        // Cerrar el contexto de audio
        audio_context.close();
        audio_context = null
    }
    if (stream) {
        // Detener todos los tracks del flujo de audio
        stream.getTracks().forEach((track) => track.stop());
        stream = null
    }
    start_recording_button.disabled = false; // Habilitar botón de iniciar
    save_and_load_button.style.display = 'inline-block';

    console.log("Grabación detenida.");
}

function update_graphs(plot_data, formats_checkbox) {
    let parsed_data = JSON.parse(plot_data);
    // Actualizar el oscilograma y la intensidad
    Plotly.react('oscilogram', parsed_data.trace_oscilogram, parsed_data.layout_oscilogram);
    Plotly.react('intensity', parsed_data.trace_intensity, parsed_data.layout_intensity);

    // Filtrar los formantes si el checkbox no está marcado
    if (!formats_checkbox.checked) {
        parsed_data.trace_spectrogram = parsed_data.trace_spectrogram.filter(trace => !trace.name.startsWith('Formant'));
    }
    // Actualizar el espectrograma
    Plotly.react('spectrogram', parsed_data.trace_spectrogram, parsed_data.layout_spectrogram);
}
async function save_and_load() {
    sweet_alert("Guardando...", `Los datos se estan guardando por favor espere.`, "warning", "", undefined, false, true);
    try {
        // let response = await emit_message("save_data");
        await esperar(3000);
        Swal.close();
        window.location.href = 'wav_analysis.html';
        // Aquí puedes hacer lo que quieras con la respuesta
    } catch (error) {
        sweet_alert("Grabación vacia", "Por favor, realice una grabación", "error", "OK", undefined, true, false)
    }

}
function emit_message(message) {
    return new Promise((resolve, reject) => {
        socket.emit(message)
        socket.on('handle_complete', (response) => {
            console.log('yaaa')
            if (response) {
                resolve(response);
            } else {
                reject("Error al iniciar la grabación");
            }
        });
    });
}
function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function sweet_alert(title, text, icon, confirmButtonText, timer, showConfirmButton, loading) {
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
    Swal.fire(options);
}
