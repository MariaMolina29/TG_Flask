let socket
let custom_locale = {
    dictionary: {
        'Zoom': 'Acercar',
        'Pan': 'Desplazar',
        'Autoscale': 'Restablecer',
        'Toggle Spike Lines': 'Guías de Eje',
        'Turntable rotation': 'Rotación',
        'Reset camera to last save': 'Restablecer cámara',
        'Download plot as a png': 'Descargar gráfico como PNG',
        'Produced with Plotly': 'Producido con Plotly'
    }
}

document.addEventListener('DOMContentLoaded', () => {
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
                        <a href="index.html" class="back_button_a_alert ">
                            <i class="fa-solid fa-arrow-left"></i> Regresar
                        </a>
                    </div>
                    <div>
                        <button id="load_wav" class="custom-button">Cargar<i class="fa-solid fa-chart-line"></i></button>
                    </div>
                </div>
                <div >
            </div>
            </div>
        `,
        showConfirmButton: false,  // Puedes ocultar el botón de confirmación para manejarlo manualmente
        allowOutsideClick: false,
        iconHtml: '<i class="fa-solid fa-upload fa-beat"></i>',  // Ícono de subida de archivo con rebote
        customClass: {
            icon: 'custom-icon'
        },
        footer: `
            <div >
                <button  id="tutorial_alert" class="custom-button tutorial">
                    Ayuda<i class="fa-solid fa-question-circle"></i> 
                </button>
            </div>
        `,
        didOpen: () => {
            document.getElementById('tutorial_alert').addEventListener('click', () => tutorial_alert())
            document.getElementById('tutorial_wav').addEventListener('click', () => tutorial_wav())
            
            document.getElementById("load_wav").addEventListener("click", function (event) {
                Swal.close();
            });

            fetch('static/javascripts/data.json')

                .then(response => response.json())
                .then(data => {
                    // Aquí es donde asignas los datos a variables
                    let trace_oscilogram = data.trace_oscilogram;
                    let layout_oscilogram = data.layout_oscilogram;
                    let trace_spectrogram = data.trace_spectrogram;
                    let layout_spectrogram = data.layout_spectrogram;
                    let trace_intensity = data.trace_intensity;
                    let layout_intensity = data.layout_intensity;
                    let trace_spectrogram_3d = data.trace_spectrogram_3d;
                    let layout_spectrogram_3d = data.layout_spectrogram_3d;
                    let trace_spectrum = data.trace_spectrum;
                    let layout_spectrum = data.layout_spectrum;

                    Plotly.newPlot('spectrogram', trace_spectrogram, layout_spectrogram, { responsive: true, displayModeBar: true, doubleClick: false, showTips: false, modeBarButtons: [['zoom2d', 'pan2d', 'autoScale2d', 'toImage', 'toggleSpikelines']], locale: 'custom', locales: { custom: custom_locale } });
                    Plotly.newPlot('spectrum', trace_spectrum, layout_spectrum, { responsive: true, displayModeBar: true, doubleClick: false, showTips: false, modeBarButtons: [['zoom2d', 'pan2d', 'autoScale2d', 'toImage', 'toggleSpikelines']], locale: 'custom', locales: { custom: custom_locale } });
                    Plotly.newPlot('spectrogram_3d', trace_spectrogram_3d, layout_spectrogram_3d, { responsive: true, displayModeBar: true, doubleClick: false, showTips: false, modeBarButtonsToRemove: ['pan3d', 'orbitRotation', 'resetCameraDefault3d', 'hoverClosest3d'], locale: 'custom', locales: { custom: custom_locale } });
                    Plotly.newPlot('oscilogram', trace_oscilogram, layout_oscilogram, { responsive: true, displayModeBar: true, doubleClick: false, showTips: false, modeBarButtons: [['zoom2d', 'pan2d', 'autoScale2d', 'toImage', 'toggleSpikelines']], locale: 'custom', locales: { custom: custom_locale } });
                    Plotly.newPlot('intensity', trace_intensity, layout_intensity, { responsive: true, displayModeBar: true, doubleClick: false, showTips: false, modeBarButtons: [['zoom2d', 'pan2d', 'autoScale2d', 'toImage', 'toggleSpikelines']], locale: 'custom', locales: { custom: custom_locale } });

                })
                .catch(error => console.error('Error al cargar el archivo JSON:', error));
        }
    });

}

function start_tour(steps) {
    // Crear una instancia de Driver
    let driver = window.driver.js.driver;

    const driverObj = driver({
        showProgress: true,
        animate: true, // Animaciones para el tour
        opacity: 0.6,  // Opacidad de fondo
        allowClose: true, // Permitir cerrar la guía
        doneBtnText: 'Finalizar', // Texto para el botón de finalización
        closeBtnText: 'Cerrar', // Texto para el botón de cierre
        nextBtnText: 'Siguiente', // Texto para el botón de siguiente
        prevBtnText: 'Anterior', // Texto para el botón de anterior
        steps: steps
    });
    // Iniciar el tour
    driverObj.drive();
}
function tutorial_alert() {
    let steps = [
        { element: '#upload_wav', popover: { title: 'Subir Archivo', description: 'Haga clic aquí para seleccionar un archivo .wav para subir.', side: 'left', align: 'center' } },
        { element: '#load_wav', popover: { title: 'Guardar y Cargar', description: 'Haga clic aquí para guardar y cargar el archivo seleccionado.', side: 'bottom', align: 'center' } },
        { element: '.back_button_a_alert', popover: { title: 'Regresar', description: 'Haga clic aquí para volver a la página inicial sin guardar cambios.', side: 'bottom', align: 'center' } }
    ]
    start_tour(steps)
}

function tutorial_wav() {
    let steps = [
        
        { element: '#audio_player', popover: { title: 'Reproducir Audio', description: 'Haga clic aquí para reproducir el archivo de audio cargado.', side: 'bottom', align: 'center' } },
        { element: '#download_txt', popover: { title: 'Descargar Texto', description: 'Haga clic aquí para descargar el contenido en formato de texto.', side: 'bottom', align: 'center' } },
        { element: '#download_wav', popover: { title: 'Descargar WAV', description: 'Haga clic aquí para descargar el archivo de audio en formato .wav.', side: 'bottom', align: 'center' } },
        { element: '#download_pdf', popover: { title: 'Descargar PDF', description: 'Haga clic aquí para descargar las gráficas en formato PDF.', side: 'bottom', align: 'center' } },
        { element: '#formats_checkbox', popover: { title: 'Mostrar Formantes', description: 'Seleccione esta opción para mostrar los formantes en la gráfica.', side: 'bottom', align: 'center' } },
        { element: '.modebar-group', popover: { title: 'Controles de Gráfica', description: 'Utilice estos controles para ajustar la visualización de la gráfica. \nPara conocer más de las funcionalidades, consulte el Manual', side: 'left', align: 'center' } },
        { element: '.slider-container', popover: { title: 'Ajustar Zoom', description: 'Utilice la barra de escala para ajustar el nivel de zoom en la gráfica.', side: 'bottom', align: 'center' } },
        { element: '.back_button_a', popover: { title: 'Regresar', description: 'Haga clic aquípara volver a la página inicial sin guardar cambios.', side: 'bottom', align: 'center' } },
        { element: '#manual', popover: { title: 'Manual de Usuario', description: 'Para más información, consulte el Manual de Usuario', side: 'top', align: 'center' } },

    ];
    start_tour(steps)
}