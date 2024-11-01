let audio_context
let processor_node
let stream
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


document.addEventListener('DOMContentLoaded', async () => {
    
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

            Plotly.newPlot('spectrogram', trace_spectrogram, layout_spectrogram, { responsive: true, displayModeBar: true, modeBarButtons: [['zoom2d', 'pan2d', 'autoScale2d', 'toImage', 'toggleSpikelines']], locale: 'custom', locales: { custom: custom_locale } });
            Plotly.newPlot('oscilogram', trace_oscilogram, layout_oscilogram, { responsive: true, displayModeBar: true, modeBarButtons: [['zoom2d', 'pan2d', 'autoScale2d', 'toImage', 'toggleSpikelines']], locale: 'custom', locales: { custom: custom_locale } });
            Plotly.newPlot('intensity', trace_intensity, layout_intensity, { responsive: true, displayModeBar: true, modeBarButtons: [['zoom2d', 'pan2d', 'autoScale2d', 'toImage', 'toggleSpikelines']], locale: 'custom', locales: { custom: custom_locale } });

        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));

    document.getElementById('tutorial_real_time').addEventListener('click', () => tutorial_real_time(save_and_load_button))

});

function start_tour(steps) {
    // Crear una instancia de Driver
    let driver = window.driver.js.driver;

    let driverObj = driver({
        showProgress: true,
        animate: true, // Animaciones para el tour
        opacity: 0.6,  // Opacidad de fondo
        allowClose: true, // Permitir cerrar la guía
        doneBtnText: 'Finalizar', // Texto para el botón de finalización
        closeBtnText: 'Cerrar', // Texto para el botón de cierre
        nextBtnText: 'Siguiente', // Texto para el botón de siguiente
        prevBtnText: 'Anterior', // Texto para el botón de anterior
        steps: steps,
        onDestroyed: (element, step, options) => {
            document.getElementById('save_and_load_button').style.display = 'none';
        }
    });
    // Iniciar el tour
    driverObj.drive();


}
function tutorial_real_time(save_and_load_button) {
    save_and_load_button.style.display = 'inline-block';
    let steps = [
        { element: '#start_recording', popover: { title: 'Iniciar Grabación', description: 'Haga clic aquí para comenzar la grabación de audio.', side: 'bottom', align: 'center' } },
        { element: '#stop_recording', popover: { title: 'Detener y Guardar', description: 'Presione este botón para detener la grabación del audio.', side: 'bottom', align: 'center' } },
        { element: '#save_and_load_button', popover: { title: 'Guardar y Cargar', description: 'Haga clic en este botón para guardar el audio grabado y cargarlo en la aplicación.', side: 'bottom', align: 'center' } },
        { element: '.modebar-group', popover: { title: 'Controles de Gráfica', description: 'Utiliza estos controles para ajustar la visualización de la gráfica. \nPara conocer más de las funcionalidades, consulte el Manual', side: 'left', align: 'center' } },
        { element: '#formats_checkbox', popover: { title: 'Mostrar Formantes', description: 'Seleccione esta opción para mostrar los formantes en la gráfica.', side: 'right', align: 'start' } },
        { element: '.back_button_a', popover: { title: 'Regresar', description: 'Haga clic para volver a la página inicial sin guardar cambios.', side: 'bottom', align: 'center' } },
        { element: '#manual', popover: { title: 'Manual de Usuario', description: 'Para más información, consulte el Manual de Usuario', side: 'top', align: 'center' } },


    ]
    start_tour(steps)

}

