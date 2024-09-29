// Canvas retrieves visualizer info
let audioContext;
let analyser;

const canvas = document.getElementById('visualizer');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const canvasContext = canvas.getContext('2d');

// Define themes
const theme = {
    background: '#2b2b2b',
    barColor: (value) => `rgb(${value / 2 + 128}, 0, ${255 - value})`,
    lineColor: 'rgba(255, 215, 0, 0.7)',
};

document.getElementById('audio-file').addEventListener('change', function () {
    if (!audioContext || audioContext.state === 'suspended') {
        audioContext = new (window.AudioContext)();
        audioContext.resume().then(() => {
            console.log('AudioContext resumed.');
        });
    }

    const files = this.files; 
    if (files.length === 0) return; 

    const file = files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const audioSrc = e.target.result;
        const audio = document.getElementById('audio-player');
        audio.src = audioSrc;

        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        audio.play().catch(error => {
            console.error("Playback failed:", error);
        });

        visualize();
    };
    reader.readAsDataURL(file);
});

// Visualizer function
function visualize() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const shapes = ['circle', 'triangle', 'square', 'pentagon', 'hexagon', 'star', 'diamond', 'oval'];
    let shapeCounter = 0;
    let lastSwitchTime = Date.now();

    // Drawing function
    function draw () {
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

        // Draw the current shape
        drawShape(angle, shapes[shapeCounter], rotationSpeed, dataArray);

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
    };

    draw();
}

// Function to draw shapes
const drawShape = (angle, shapeType, rotationSpeed) => {
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
};
