import numpy as np
import plotly.graph_objs as go
from scipy.signal import savgol_filter
from parselmouth.praat import call
import io
import json


def draw_spectrogram_3d(spectrogram):
    X, Y = np.meshgrid(spectrogram.xs(), spectrogram.ys())
    Z = 10 * np.log10(spectrogram.values + 1e-16)

    trace_spectrogram_3d = [{
        'z': Z.tolist(),
        'x': X.tolist(),
        'y': Y.tolist(),
        'type': 'surface',  
        'colorscale': 'Hot',
        'colorbar': {
            'title': "Intensity [dB]",
            'thickness': 10,
            'titleside': 'right',
            'titlefont': {'size': 12},
            'tickmode': 'auto',
            'ticks': 'outside'
        }
    }]

    layout_spectrogram_3d= {
    'title': "3D Spectrogram",
    'scene': {
        'xaxis': {'title': "Time [s]"},
        'yaxis': {'title': "Frequency [Hz]", 'zeroline': False, 'range': [0, 8000]},
        'zaxis': {'title': "Intensity [dB]", 'range': [-120, 0]},
        'camera': {'eye': {'x': 2, 'y': -2, 'z': 1}}
    },
    'autosize': True,
    'margin': {'l': 50, 'r': 50, 't': 50, 'b': 50}
    }

    return trace_spectrogram_3d, layout_spectrogram_3d
 
def draw_spectrogram(spectrogram, pitch_values, time_pitch, formants):
    X, Y = np.meshgrid(spectrogram.xs(), spectrogram.ys())
    Z = 10 * np.log10(spectrogram.values + 1e-16)

    trace_spectrogram = [{
        'z': Z.tolist(),  
        'x': X[0].tolist(),  
        'y': Y[:, 0].tolist(),  
        'type': 'heatmap',
        'colorscale': 'Hot',
        'zmin': -120,  # Valor mínimo del rango de Z (en dB)
        'zmax': 0, 
        'name': "Espectrogram",
        'colorbar': {
            'title': "Intensity [dB]",
            'thickness': 10,  
            'titleside': 'right',  
            'titlefont': {'size': 12}, 
            'tickmode': 'auto',  
            'ticks': 'outside' 
        }
    }]

    spectrogram_data = {
        'times': spectrogram.xs().tolist(),
        'frequencies': spectrogram.ys().tolist(),
        'power_values': Z.tolist()  # Matriz de potencias
    }
    

    # Aplicar suavizado a la curva de la frecuencia fundamental
    # pitch_values = savgol_filter(pitch_values, window_length=11, polyorder=2)
   
    trace_pitch = [{
        'x': time_pitch.tolist(),  # Convertir array time_pitch a lista para JSON serializable
        'y': pitch_values.tolist(),  # Convertir array pitch_values a lista para JSON serializable
        'mode': 'lines+markers',
        'marker': {'size': 3, 'color': 'cyan'},
        'line': {'color': 'cyan'},
        'name': "Fundamental Frequency",
        'showlegend': True
    }]
    
    traces = trace_spectrogram  + trace_pitch
    formants_values = []

   
    colors = ['olivedrab', 'dodgerblue', 'lightgray'] 
    for formant_number in range(1, 4):  # Los primeros 3 formantes
        # formant_values = np.array([np.nan if np.isnan(p) else formants.get_value_at_time(formant_number, t)
        #                for p, t in zip(pitch_values, time_pitch)])
        formant_values = np.array([0 if  p==0 else formants.get_value_at_time(formant_number, t)
                        for p, t in zip(pitch_values, time_pitch)])
        formant_values = np.nan_to_num(formant_values, nan=0)
        trace_formant = [{
            'x': time_pitch.tolist(),  # Convertir array time_pitch a lista para JSON serializable
            'y': formant_values.tolist(),  # Convertir array formant_values a lista para JSON serializable
            'mode': 'lines+markers',
            'marker': {'size': 2},
            'line': {'dash': 'dash', 'color': colors[formant_number - 1] },
            'name': f"Formant {formant_number}"
        }]
        formants_values.append(formant_values)
        traces = traces + trace_formant

    layout = {
        'title': "Spectrogram with Fundamental Frequency and Formants",
        'xaxis': {'title': "Time [s]"},
        'yaxis': {'title': "Frequency [Hz]", 'range': [0, 8000]},
        'legend': {
            'x': 0.5,
            'y': -0.2,
            'xanchor': 'center',
            'yanchor': 'top',
            'orientation': 'h',
            'font': {'size': 10}
        },
        'margin': {'l': 50, 'r': 50, 't': 50, 'b': 50},  # Margin en una sola línea
        'autosize': True
    }

 
    return traces, layout, formants_values, spectrogram_data
 
def draw_combined_pitch_intensity_contour(pitch_values, time_pitch, intensity):
 
    # Traza de la frecuencia fundamental (Pitch)
    trace_pitch = [{
        'x': time_pitch.tolist(),  # Convertir a lista para ser serializable
        'y': pitch_values.tolist(),  # Convertir a lista para ser serializable
        'mode': 'lines+markers',
        'marker': {'size': 3, 'color': 'turquoise'},
        'line': {'color': 'turquoise'},
        'name': "Fundamental Frequency"
    }]

    # Curva de intensidad (dB)
    trace_intensity = [{
        'x': intensity.xs().tolist(),  # Convertir a lista para ser serializable
        'y': intensity.values.T.flatten().tolist(),  # Convertir a lista para ser serializable
        'mode': 'lines',
        'line': {'color': 'purple'},
        'name': "Intensity",
        'yaxis': "y2"  # Vincular al segundo eje y
    }]

    # Layout del gráfico con dos ejes y
    layout = {
        'title': "Pitch and Intensity Contour (Frequency and dB vs Time)",
        'xaxis': {'title': "Time [s]"},
        'yaxis': {'title': "Frequency [Hz]", 'range': [0, 1000]},
        'yaxis2': {'title': "Intensity [dB]", 'overlaying': 'y', 'side': 'right', 'range': [0, 120]},
        'legend': {'x': 0.5, 'y': -0.2, 'xanchor': 'center', 'yanchor': 'top', 'orientation': 'h', 'font': {'size': 10}},
        'margin': {'l': 50, 'r': 50, 't': 50, 'b': 50},
        'autosize': True
    }

    # Combinar los datos de las trazas
    traces = trace_pitch + trace_intensity
 
    return traces, layout
 
def draw_power_spectrum(frequencies, power):
    power = power.flatten()
   
    # Verificar que frequencies y power tengan la misma longitud
    if len(frequencies) != len(power):
        min_length = min(len(frequencies), len(power))
        frequencies = frequencies[:min_length]
        power = power[:min_length]
   
    valid_idx = np.isfinite(power)
    frequencies = frequencies[valid_idx]
    power = power[valid_idx]
 
    smoothed_power = savgol_filter(power, window_length=101, polyorder=2)
    trace_spectrum = [{
        'x': frequencies.tolist(),
        'y': smoothed_power.tolist(),
        'mode': 'lines',
        'line': {'color': 'blue', 'width': 3},
        'name': "Smoothed Power Spectrum"
    }]
 
    layout_spectrum = {
        'title': "Power Spectrum with Smoothed Envelope",
        'xaxis': {'title': "Frequency [Hz]", 'range': [0, 8000]},
        'yaxis': {'title': "Power [dB]"}
    }

 
    return trace_spectrum, layout_spectrum
 
def draw_waveform(time, amplitud):

    #  Datos del oscilograma
    trace_oscilogram = [{
        'x': time.tolist(),  
        'y': amplitud.tolist(),  
        'mode': 'lines',
        'line': {'color': 'black'},
        'name': 'Waveform'
    }]

    layout_oscilogram = {
        'title': "Waveform (Oscillogram)",
        'xaxis': {'title': "Time [s]"},
        'yaxis': {'title': "Amplitude",  'range': [-1, 1]},
        'legend': {'x': 0.5, 'y': -0.2, 'xanchor': 'center', 'yanchor': 'top', 'orientation': 'h'
        },
        'margin': {'l': 50, 'r': 50, 't': 50, 'b': 50},
        'autosize': True
    }
 
    return trace_oscilogram, layout_oscilogram
 
def generate_text_file(time_pitch, pitch_values, intensity, formants_values, spectrogram_data):
    """
    Genera un archivo de texto con los datos de pitch, intensidad y formantes,
    alineandos en tiempo.
    """
    output = io.StringIO()
    output.write("{:<10}/\t{:<15}\t/\t{:<15}\t/\t{:<15}\t/\t{:<15}\t/\t{:<15}\n".format(
        "Time [s]", "Frequency [Hz]", "Intensity [dB]", "Formant1 [Hz]", "Formant2 [Hz]", "Formant3 [Hz]"))

     # Los tiempos del análisis de pitch
    pitch_frequencies = pitch_values
    
    # Extraer los tiempos e intensidades
    times_intensity = intensity.xs()
    intensity_values = intensity.values.T.flatten()

    # Interpolar la intensidad para que coincida con los tiempos de pitch
    intensity_interpolated = np.interp(time_pitch, times_intensity, intensity_values)

    # Crear listas para los formantes
    formant1 = formants_values[0]
    formant2 =formants_values [1]
    formant3 = formants_values[2]


    # Asegurarnos de que todos los datos tengan el mismo tamaño

    min_length = min(len(time_pitch), len(pitch_frequencies), len(intensity_interpolated), len(formant1), len(formant2), len(formant3))

    # Escribir los datos alineados al archivo
    for i in range(min_length):
        output.write("{:<10.4f}/\t{:<15.2f}\t/\t{:<15.2f}\t/\t{:<15.2f}\t/\t{:<15.2f}\t/\t{:<15.2f}\n".format(
            time_pitch[i], pitch_frequencies[i], intensity_interpolated[i], 
            formant1[i], formant2[i], formant3[i]))


    text_content = output.getvalue()
    output.close()
   
    return text_content
    #  Crear el buffer de StringIO para escribir los datos en memoria
    # output = io.StringIO()

    # # Escribir el encabezado
    # output.write("{:<10}/\t{:<15}\t/\t{:<15}\n".format(
    #     "Time [s]","Frequency [Hz]", "Power [dB]"))
    
    # times = spectrogram_data['times']
    # frequencies = spectrogram_data['frequencies']
    # power_values = spectrogram_data['power_values']  # Matriz Z

    # # Iterar sobre los tiempos y frecuencias para escribir los valores en el buffer
    # for i, time in enumerate(times):
    #     for j, freq in enumerate(frequencies):
    #         # Escribir tiempo, frecuencia y potencia correspondientes en el buffer
    #         output.write("{:<10.4f}/\t{:<15.2f}\t/\t{:<15.2f}\n".format(
    #             time, freq, power_values[j][i]))

    # # Obtener el contenido de texto del StringIO
    # text_content = output.getvalue()

    # # Cerrar el buffer
    # output.close()

    # # Devolver el contenido de texto para guardarlo o manipularlo
    # return text_content


def analyze_audio(snd, live):
    # sound = snd.copy()
    # max_amplitude = np.max(np.abs(snd.values))  # Obtener el valor máximo de la señal
    # max_amplitude = 32767
    # normalized_values = snd.values / max_amplitude  # Normalizar la señal para que su amplitud máxima sea 1
    # sound.values = normalized_values  # Asignar la señal normalizada de nuevo al objeto Parselmouth Sound
    # sound.values = snd.values *  max_val

    # Generar el oscilograma con Plotly
    time = snd.xs()
    amplitud = snd.values.flatten()
    trace_oscilogram, layout_oscilogram = draw_waveform(time, amplitud)

    # Análisis de Pitch (frecuencia fundamental)
    pitch = snd.to_pitch()
    pitch_values = pitch.selected_array['frequency']
    # pitch_values[pitch_values == 0] = np.nan 
    time_pitch = pitch.xs() # Reemplazar partes no sonoras con NaN
    # Análisis de Formantes usando LPC (método Burg)
    formants = snd.to_formant_burg()

    # Generar el espectrograma 2D con Plotly
    trace_spectrogram, layout_spectrogram, formants_values, spectrogram_data  = draw_spectrogram(snd.to_spectrogram(window_length=0.1, maximum_frequency=8000), pitch_values, time_pitch, formants)

    # Análisis de Intensidad
    intensity = snd.to_intensity()

    # Generar la gráfica combinada de pitch e intensidad
    trace_intensity, layout_intensity = draw_combined_pitch_intensity_contour(pitch_values, time_pitch, intensity)


    if not live:
        mean_pitch = call(pitch, "Get mean", 0, 0, "Hertz")
 
        # Generar el espectrograma 3D con Plotly
        trace_spectrogram_3d, layout_spectrogram_3d = draw_spectrogram_3d(snd.to_spectrogram(window_length=0.1, maximum_frequency=8000))
 
        # Generar el espectro de potencia con Plotly
        spectrum = snd.to_spectrum()
        frequencies = spectrum.xs()
        power = np.where(spectrum.values.T > 0, 10 * np.log10(spectrum.values.T), np.nan)
        trace_spectrum, layout_spectrum = draw_power_spectrum(frequencies, power)
 
        # Generar el archivo de texto con los datos
        text_content = generate_text_file(time_pitch, pitch_values, intensity, formants_values, spectrogram_data)
        data_to_send = json.dumps({
            'trace_oscilogram': trace_oscilogram,
            'layout_oscilogram': layout_oscilogram,
            'trace_spectrogram': trace_spectrogram,
            'layout_spectrogram': layout_spectrogram,
            'trace_intensity': trace_intensity,
            'layout_intensity': layout_intensity,
            'trace_spectrogram_3d': trace_spectrogram_3d,
            'layout_spectrogram_3d': layout_spectrogram_3d,
            'trace_spectrum': trace_spectrum,
            'layout_spectrum': layout_spectrum,
            'text_content': text_content,
            'spectrogram_data': spectrogram_data

        })
        return data_to_send
    else:
        data_to_send = json.dumps({
            'trace_oscilogram': trace_oscilogram,
            'layout_oscilogram': layout_oscilogram,
            'trace_spectrogram': trace_spectrogram,
            'layout_spectrogram': layout_spectrogram,
            'trace_intensity': trace_intensity,
            'layout_intensity': layout_intensity
        })
        return data_to_send


