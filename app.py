from flask import Flask, render_template, session, send_file
from flask_socketio import SocketIO
import redis
import uuid
import numpy as np
import parselmouth
from audio_analysis import analyze_audio
import io
from scipy.io import wavfile


redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)
app = Flask(__name__)
app.secret_key = 'trabajo_de_grado_12601907'  # Cambia esto a una clave segura
socket_io = SocketIO(app)


@app.route('/')
def index():
    user_id = session.get('user_id')
    key_processed_audio_data = f'{user_id}_processed_audio_data'
    key_audio_data = f'{user_id}_audio_data'
    key_data_queue = f'{user_id}_data_queue'
    if redis_client.exists(key_audio_data):
        redis_client.delete(key_audio_data)
        redis_client.delete(key_data_queue)
        redis_client.delete(key_processed_audio_data)

    return render_template('index.html')

@app.route('/index.html')
def index2():
    user_id = session.get('user_id')
    key_processed_audio_data = f'{user_id}_processed_audio_data'
    key_audio_data = f'{user_id}_audio_data'
    key_data_queue = f'{user_id}_data_queue'
    if redis_client.exists(key_audio_data):
        redis_client.delete(key_audio_data)
        redis_client.delete(key_data_queue)
        redis_client.delete(key_processed_audio_data)

    return render_template('index.html')

@app.route('/real_time_analysis.html')
def real_timeAnalysis():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
        print(f"User connected with ID: {session['user_id']}")
    return render_template('real_time_analysis.html')

@app.route('/wav_analysis.html')
def wav_Analysis():
    return render_template('wav_analysis.html')


@socket_io.on('start_recording')
def handle_start_recording():
    user_id = session.get('user_id')
    key_audio_data = f'{user_id}_audio_data'
    if redis_client.exists(key_audio_data):
        redis_client.delete(key_audio_data)
    socket_io.emit('handle_complete', {'message': 'Clave procesada'})
   

@socket_io.on('audio_data')
def handle_audio_data(data):
    user_id = session.get('user_id')
    if not user_id:
        return
    redis_client.rpush(f'{user_id}_audio_data', data)
    redis_client.rpush(f'{user_id}_data_queue', data)
    # Limitar el tamaño de la cola (buffersize)
    buffer_size = 5
    data_queue_length = redis_client.llen(f'{user_id}_data_queue')
    if data_queue_length > buffer_size:
        redis_client.ltrim(f'{user_id}_data_queue', data_queue_length - buffer_size, -1)

    key_data_queue = f'{user_id}_data_queue'
    audio_data_queue = redis_client.lrange(key_data_queue, 0, -1)  # Obtener todos los elementos de `data_queue`
    if len(audio_data_queue) > 0:
        # Convertir los datos de audio en un array de numpy
        # combined_audio = np.concatenate([(np.clip(np.frombuffer(chunk, dtype=np.float32) * 32767, -32768, 32767).astype(np.int16)) for chunk in audio_data])
        combined_audio_queue = np.concatenate([(np.frombuffer(chunk, dtype=np.float32)) for chunk in audio_data_queue])
        sound_real_time = parselmouth.Sound(combined_audio_queue, sampling_frequency=16000)
        data_to_send_real_time= analyze_audio(sound_real_time, True)
        socket_io.emit('plot_data_real_time', data_to_send_real_time)

@socket_io.on('process_wav')
def handle_process_wav(data):
    audio_file = io.BytesIO(data)
    sample_rate, audio_data_wav = wavfile.read(audio_file)

    # Asegurarse de que los datos sean unidimensionales y estén en float64
    if len(audio_data_wav.shape) > 1:
        audio_data_wav = audio_data_wav.mean(axis=1)  # Convertir a mono si es estéreo

    if np.issubdtype(audio_data_wav.dtype, np.integer):
        max_val = np.iinfo(audio_data_wav.dtype).max
        audio_data_wav = audio_data_wav / max_val
        
    if audio_data_wav.dtype != np.float32:
        audio_data_wav = audio_data_wav.astype(np.float32)


    sound_wav = parselmouth.Sound(values=audio_data_wav, sampling_frequency=float(sample_rate))
    data_to_send_wav  = analyze_audio(sound_wav, False)
    socket_io.emit('plot_data_wav', data_to_send_wav)

@socket_io.on('save_data')
def handle_process_real_time():
    user_id = session.get('user_id')
    key_audio_data = f'{user_id}_audio_data'
    if redis_client.exists(key_audio_data):
        audio_data = redis_client.lrange(key_audio_data, 0, -1) 
        combined_audio = np.concatenate([(np.frombuffer(chunk, dtype=np.float32)) for chunk in audio_data])
        sound_save_audio = parselmouth.Sound(combined_audio, sampling_frequency=16000)
        data_to_send_save_audio= analyze_audio(sound_save_audio, False)
        data_to_send_save_audio= data_to_send_save_audio.encode('utf-8')
        redis_client.set(f'{user_id}_processed_audio_data', data_to_send_save_audio)
        socket_io.emit('handle_complete', {'message': 'Audio procesado'})
    else:
        socket_io.emit('handle_complete')

@socket_io.on('get_processed_audio')
def handle_get_processed_audio():
    user_id = session.get('user_id')
    key_processed_audio_data = f'{user_id}_processed_audio_data'
    key_audio_data = f'{user_id}_audio_data'
    key_data_queue = f'{user_id}_data_queue'

    if redis_client.exists(key_processed_audio_data):
        socket_io.emit('loading')
        processed_data = redis_client.get(key_processed_audio_data).decode('utf-8')
        if redis_client.exists(key_audio_data):
            audio_data = redis_client.lrange(key_audio_data, 0, -1) 
            combined_audio = np.concatenate([(np.frombuffer(chunk, dtype=np.float32)) for chunk in audio_data])
            audio_file = io.BytesIO()
            wavfile.write(audio_file, 16000, combined_audio)
            audio_file.seek(0)
            data_to_send_auido_data = {
                'plot_data': processed_data,  # O el resto de los datos que quieras enviar
                'audio': audio_file.read()  # Lee los datos del archivo
            }
            redis_client.delete(key_audio_data)
            redis_client.delete(key_data_queue)
            redis_client.delete(key_processed_audio_data)
            socket_io.emit('plot_save_audio', data_to_send_auido_data)


if __name__ == '__main__':
    socket_io.run(app, debug=True)
