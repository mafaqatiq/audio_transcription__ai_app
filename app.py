from flask import Flask, request, jsonify, render_template
import whisper
from googletrans import Translator
import os

app = Flask(__name__)
model = whisper.load_model("base")
translator = Translator()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    audio_file = request.files["audio"]
    file_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
    audio_file.save(file_path)

    # Transcribe audio
    result = model.transcribe(file_path)
    transcription_text = result["text"]
    
    return jsonify({"transcription": transcription_text})

@app.route("/translate", methods=["POST"])
def translate_text():
    data = request.json
    text = data["text"]
    target_language = data["target_language"]
    
    translated = translator.translate(text, dest=target_language)
    
    return jsonify({"translated_text": translated.text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)