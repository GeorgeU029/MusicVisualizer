   // initialize important variables
let audioContext;
let analyser;

// create and edit canvas
const canvas = document.getElementById('visualizer');
canvas.width = window.innerWidth; 
const canvasContext = canvas.getContext('2d');

//audio file handiling
document.getElementById('audio-file').addEventListener('change', function() {
    // user interaction with audio playing
    if (!audioContext || audioContext.state === 'suspended') {
        audioContext = new (window.AudioContext)();
        audioContext.resume().then(() => {
            console.log('AudioContext resumed.');
        });
    }

    const files = this.files;
   //check if file exist
    if (files.length === 0) return; 

    const file = files[0];
    const reader = new FileReader();
    //read file and check for music file
    reader.onload = function(e) {
        const audioSrc = e.target.result;
        const audio = document.getElementById('audio-player');
        audio.src = audioSrc;

        // create an analyser node and set up audio processing
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // play audio and start visualizatizer function
        audio.play().catch(error => {
            console.error("Playback failed:", error);
        });

        visualize();
    };
    reader.readAsDataURL(file);
});

// Visualization function
function visualize() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // drawBars a simple version of the audio visualizer
    function drawBars() {
        requestAnimationFrame(drawBars);
        analyser.getByteFrequencyData(dataArray);

        // Clear the canvas and set background color
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.fillStyle = 'rgb(0, 0, 0)';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        const desiredBarCount = 800;
        const barWidth = canvas.width / desiredBarCount;
        let x = 0;

        //colors for bars
        const colors = [
            'rgb(250,235,44)',
            'rgb(245,39,137)',
            'rgb(233,0,255)',
            'rgb(18,125,255)',
            'rgb(22,133,248)',
            'rgb(61,20,76)',
            
        ];
        // creation of music bars
        for (let i = 0; i < desiredBarCount; i++) {
            const frequencyIndex = Math.floor(i * (bufferLength / desiredBarCount));
            const barHeight = dataArray[i]/2;

            canvasContext.fillStyle = colors[i % colors.length];
            canvasContext.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth; // Move x position for the next bar
        }
    }

    function drawWave() {
        requestAnimationFrame(drawWave);
        analyser.getByteFrequencyData(dataArray);
    
        // Clear the canvas
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerY = canvas.height / 2; // Center y position
        const waveLength = canvas.width*2; // Length of the wave
        const waveHeight = 50; // Height of the wave
        const waveFrequency = 1; // Frequency of the wave
        
        // Start drawing the wave
        canvasContext.beginPath();
        
        // Loop through the wave length
        for (let i = 0; i < waveLength; i++) {

            // Calculate the angle based on the position
            const angle = i * waveFrequency + performance.now() * 0.1; // Dynamic wave effect
            const frequencyIndex = Math.floor((i / waveLength) * bufferLength); // Normalize index based on wave length
            const frequencyValue = dataArray[frequencyIndex] / 255; // Normalize frequency value
    
            // Calculate the y position of the wave
            const y = centerY + Math.sin(angle) * waveHeight * frequencyValue;
    
            // Move to the starting point
            if (i === 0) {
                canvasContext.moveTo(i, y);
            } else {
                canvasContext.lineTo(i, y); // Draw the wave
            }
        }
    
        // Draw the bottom line of the wave
        canvasContext.lineTo(waveLength, centerY);
        canvasContext.lineTo(0, centerY);
        canvasContext.closePath();
    
        // Fill the wave
        canvasContext.fillStyle = 'rgba(0, 0, 255, 0.5)'; // Wave color
        canvasContext.fill();
    }
    
    // Make sure to define bufferLength and dataArray correctly

    
    // Start the drawing function after setting up everything
    //drawBars();
    drawWave();
