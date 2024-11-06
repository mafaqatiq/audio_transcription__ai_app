let mediaRecorder;
let audioChunks = [];
let audioBlob;

function loadAudio() {
    const audioFile = document.getElementById("audioFile").files[0];
    const audioURL = URL.createObjectURL(audioFile);
    const uploadedAudio = document.getElementById("uploadedAudio");
    const audioSource = document.getElementById("audioSource");
    uploadedAudio.style.display = 'block';  // Show the audio controls
    audioSource.src = audioURL;
    uploadedAudio.load();
}

function transcribeAudio(source) {
    const formData = new FormData();
    let audioFile;
    const transcriptionResult = source === 'record' 
        ? document.getElementById("transcriptionResult2") 
        : document.getElementById("transcriptionResult");
    
    // Set "Processing..." message with animation
    transcriptionResult.innerText = "Processing...";
    transcriptionResult.style.color = "yellow";
    transcriptionResult.style.animation = "pulse 1s infinite"; // Adding pulse animation
    transcriptionResult.style.display = "flex";
    transcriptionResult.style.alignItems = "center";
    transcriptionResult.style.justifyContent = "center";

    if (source === 'record') {
        audioFile = audioBlob; 
    } else {
        audioFile = document.getElementById("audioFile").files[0]; 
    }

    if (!audioFile) {
        showModal('Audio file missing. Please try again.');
        transcriptionResult.style.display = "none"; // Hide "Processing..." if no file
        return;
    }

    formData.append("audio", audioFile);

    fetch("/transcribe", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Check if transcription result is empty or null
        if (!data.transcription || data.transcription.trim() === "") {
            transcriptionResult.innerText = "Error!";
            transcriptionResult.style.color = "red";
            transcriptionResult.style.animation = ""; // Stop the pulse animation
        } else {
            transcriptionResult.innerText = data.transcription;
            transcriptionResult.style.color = ""; // Reset color for valid text
            transcriptionResult.style.animation = ""; // Stop the pulse animation
        }
    })
    .catch(error => {
        console.error("Error:", error);
        transcriptionResult.innerText = "Error!";
        transcriptionResult.style.color = "red";
        transcriptionResult.style.animation = ""; // Stop the pulse animation
    })
}

let mediaStream; // Declare a variable to store the stream

function startRecording() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                audioChunks = [];
                mediaStream = stream; // Store the stream
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = () => {
                    audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const recordedAudio = document.getElementById("recordedAudio");
                    recordedAudio.style.display = 'block'; // Show the recorded audio
                    recordedAudio.src = URL.createObjectURL(audioBlob);

                    // Stop all tracks to release the microphone
                    mediaStream.getTracks().forEach(track => track.stop());
                };
                mediaRecorder.start();
                document.getElementById("stopBtn").disabled = false;
                document.getElementById("recordBtn").disabled = true;
            })
            .catch(error => {
                showModal('Error: Unable to access the microphone.');
            });
    }
}


function stopRecording() {
    mediaRecorder.stop();
    document.getElementById("stopBtn").disabled = true;
    document.getElementById("recordBtn").disabled = false;
}

function validateAndTranscribe(source) {
    if (source === 'file') {
        const audioFile = document.getElementById("audioFile").files[0];
        if (!audioFile) {
            showModal('Please upload an audio file first.');
            return;
        }
        transcribeAudio('file');
    } else if (source === 'record') {
        if (!audioBlob) {
            showModal('Please record some audio first.');
            return;
        }
        transcribeAudio('record');
    }
}


function validateAndTranslate() {
    const translationText = document.getElementById("textToTranslate").value.trim();
    if (translationText === "") {
        showModal('Please enter some text to translate.');
        return;
    }

    // Proceed with translation
    translateText();
}


function translateText() {
    const text = document.getElementById("textToTranslate").value;
    const targetLanguage = document.getElementById("targetLanguage").value;
    const translationResult = document.getElementById("translationResult");

    // Set "Processing..." message with animation
    translationResult.innerText = "Processing...";
    translationResult.style.color = "yellow";
    translationResult.style.animation = "pulse 1s infinite"; // Adding pulse animation
    translationResult.style.display = "flex";
    translationResult.style.alignItems = "center";
    translationResult.style.justifyContent = "center";

    fetch("/translate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text, target_language: targetLanguage })
    })
    .then(response => response.json())
    .then(data => {
        // Check if translation result exists
        if (!data.translated_text || data.translated_text.trim() === "") {
            translationResult.innerText = "Error!";
            translationResult.style.color = "red";
            translationResult.style.animation = ""; // Stop the pulse animation
        } else {
            translationResult.innerText = data.translated_text;
            translationResult.style.color = ""; // Reset color for valid text
            translationResult.style.animation = ""; // Stop the pulse animation
        }
    })
    .catch(error => {
        console.error("Error:", error);
        translationResult.innerText = "Error!";
        translationResult.style.color = "red";
        translationResult.style.animation = ""; // Stop the pulse animation
    }) 
}

function showModal(message) {
    const modal = document.getElementById("messageModal");
    const modalMessage = document.getElementById("modalMessage");
    modalMessage.textContent = message;
    modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById("messageModal");
    modal.style.display = "none";
}

function handleSave() {
    // Handle save action
    closeModal();
}

function openTab(event, tabName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    event.currentTarget.classList.add("active");
}

