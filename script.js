let audioContext;
let analyser;

// create and edit canvas
const canvas = document.getElementById('visualizer');
canvas.width = window.innerWidth;
const canvasContext = canvas.getContext('2d');


//audio file handling
document.getElementById('audio-file').addEventListener('change', function() {
    // user interaction with audio playing
    if (!audioContext || audioContext.state === 'suspended') {
        audioContext = new (window.AudioContext)();
        audioContext.resume().then(() => {
            console.log('AudioContext resumed.');
        });
    }

    const files = this.files;
    // check if file exists
    if (files.length === 0) return; 

    const file = files[0];
    const reader = new FileReader();
    // read file and check for music file
    reader.onload = function(e) {
        const audioSrc = e.target.result;
        const audio = document.getElementById('audio-player');
        audio.src = audioSrc;

        // create an analyser node and set up audio processing
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // play audio and start visualizer function
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

    // drawBars: a simple version of the audio visualizer
    function drawBars() {
        requestAnimationFrame(drawBars);
        analyser.getByteFrequencyData(dataArray);

        // Clear the canvas and set background color
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.fillStyle = 'rgb(0, 0, 0)';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        const desiredBarCount = 600;
        const barWidth = canvas.width / desiredBarCount;
        let x = 0;

        // Colors for bars
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
            //const frequencyIndex = Math.floor(i * (bufferLength / desiredBarCount));
            const barHeight = dataArray[i]/1.5;

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
        const waveLength = canvas.width*4; // Length of the wave
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

    function draw() {
        // Define theme and shapes within the draw function
        const theme = {
            background: 'black', // Background color of the canvas
            lineColor: 'white',  // Line color for shapes
            barColor: (barHeight) => {
                // Bar color changes based on the bar's height
                if (barHeight > 200) {
                    return 'rgb(233,0,255)'; // Bright purple for high bars
                } else if (barHeight > 100) {
                    return 'rgb(245,39,137)'; // Pinkish color for medium bars
                } else {
                    return 'rgb(18,125,255)'; // Blue for lower bars
                }
            }
        };
    
        const shapes = ['circle', 'triangle', 'square', 'star', 'hexagon', 'diamond', 'oval'];
    
        // Static variables to preserve their values across calls
        let shapeCounter = draw.shapeCounter || 0;
        let lastSwitchTime = draw.lastSwitchTime || Date.now();
    
        requestAnimationFrame(draw);
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    
        // Set background
        canvasContext.fillStyle = theme.background;
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    
        analyser.getByteFrequencyData(dataArray);
    
        const averageFrequency = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        const angle = Date.now() * 0.002;
        const rotationSpeed = (averageFrequency / 255) * 0.5; // Reduced rotation speed
    
        // Switch shape every 4 seconds
        if (Date.now() - lastSwitchTime > 4000) {
            shapeCounter = (shapeCounter + 1) % shapes.length;
            lastSwitchTime = Date.now();
        }
    
        // Pass theme to drawShape
        drawShape(angle, shapes[shapeCounter], rotationSpeed, dataArray, theme);
    
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
    
        for (let i = 0; i < bufferLength; i++) {
            let barHeight = dataArray[i] * 1.5; // Increased sensitivity
            let pulse = Math.sin(Date.now() * 0.005 + i) * 10;
            barHeight += pulse;
    
            canvasContext.fillStyle = theme.barColor(barHeight);
            canvasContext.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
        }
    
        // Store static variables for next frame
        draw.shapeCounter = shapeCounter;
        draw.lastSwitchTime = lastSwitchTime;
    }
    
    // Update the drawShape function to accept the theme as a parameter
    function drawShape(angle, shapeType, rotationSpeed, dataArray, theme) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const size = 50; // Size of the shapes
    
        // Save the current context state
        canvasContext.save();     
    
        // Translate to the center of the canvas
        canvasContext.translate(centerX, centerY);
        
        // Rotate the canvas only if it's not a triangle
        if (shapeType !== 'triangle') {
            canvasContext.rotate(angle * rotationSpeed);
        }
    
        canvasContext.strokeStyle = theme.lineColor;
        canvasContext.lineWidth = 2;
    
        if (shapeType === 'circle') {
            canvasContext.beginPath();
            canvasContext.arc(0, 0, size, 0, Math.PI * 2);
            canvasContext.stroke();
        } else if (shapeType === 'triangle') {
            canvasContext.beginPath();
            canvasContext.moveTo(0, -size);
            canvasContext.lineTo(-size, size);
            canvasContext.lineTo(size, size);
            canvasContext.closePath();
            canvasContext.stroke();
        } else if (shapeType === 'square') {
            canvasContext.beginPath();
            canvasContext.rect(-size / 2, -size / 2, size, size);
            canvasContext.stroke();
        } else if (shapeType === 'pentagon') {
            canvasContext.beginPath();
            for (let i = 0; i < 5; i++) {
                const x = size * Math.cos((i * 2 * Math.PI) / 5);
                const y = size * Math.sin((i * 2 * Math.PI) / 5);
                canvasContext.lineTo(x, y);
            }
            canvasContext.closePath();
            canvasContext.stroke();
        } else if (shapeType === 'hexagon') {
            canvasContext.beginPath();
            for (let i = 0; i < 6; i++) {
                const x = size * Math.cos((i * 2 * Math.PI) / 6);
                const y = size * Math.sin((i * 2 * Math.PI) / 6);
                canvasContext.lineTo(x, y);
            }
            canvasContext.closePath();
            canvasContext.stroke();
        } else if (shapeType === 'star') {
            canvasContext.beginPath();
            for (let i = 0; i < 5; i++) {
                const outerX = size * Math.cos((i * 2 * Math.PI) / 5 - Math.PI / 2);
                const outerY = size * Math.sin((i * 2 * Math.PI) / 5 - Math.PI / 2);
                canvasContext.lineTo(outerX, outerY);
                const innerX = (size / 2) * Math.cos((i * 2 * Math.PI) / 5 + Math.PI / 5 - Math.PI / 2);
                const innerY = (size / 2) * Math.sin((i * 2 * Math.PI) / 5 + Math.PI / 5 - Math.PI / 2);
                canvasContext.lineTo(innerX, innerY);
            }
            canvasContext.closePath();
            canvasContext.stroke();
        } else if (shapeType === 'diamond') {
            canvasContext.beginPath();
            canvasContext.moveTo(0, -size);
            canvasContext.lineTo(size, 0);
            canvasContext.lineTo(0, size);
            canvasContext.lineTo(-size, 0);
            canvasContext.closePath();
            canvasContext.stroke();
        } else if (shapeType === 'oval') {
            canvasContext.beginPath();
            canvasContext.ellipse(0, 0, size, size / 2, 0, 0, Math.PI * 2);
            canvasContext.stroke();
        }
    
        // Restore the context to its original state
        canvasContext.restore();
    }
    
    
    // Update the drawShape function to accept the theme as a parameter
 

    // Start the drawing function after setting up everything
   // drawBars();
    drawBars();
}
