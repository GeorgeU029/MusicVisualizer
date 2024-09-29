let audioContext;
let analyser;
let selectedTemplate = "drawBars";

// create and edit canvas
const canvas = document.getElementById('visualizer');
canvas.width = window.innerWidth;
const canvasContext = canvas.getContext('2d');

document.getElementById('templates').addEventListener('change', function() {
    selectedTemplate = this.value;
    console.log("Selected template: " + selectedTemplate);
});

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

// main visulizer function
function visualize() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    document.getElementById('close-visualizer').style.display = 'block';
    document.getElementById('close-visualizer').addEventListener('click', function() {
        window.location.reload(); // Reload the page to reset everything
    });
    // drawBars: first ediiton able to change colors and amount of bars
    function drawBars() {
        requestAnimationFrame(drawBars);
        analyser.getByteFrequencyData(dataArray);

        //start canvas state
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.fillStyle = 'rgb(0, 0, 0)';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        const desiredBarCount = 700;
        const barWidth = canvas.width / desiredBarCount;
        let x = 0;

        //color for bars in this order
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
            const barHeight = dataArray[i]/1.2;
            canvasContext.fillStyle = colors[i % colors.length];
            canvasContext.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth; 
        }
    }
    function drawWave() {
        requestAnimationFrame(drawWave);
        analyser.getByteFrequencyData(dataArray);
    
        // create canvas state
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.fillStyle = 'rgb(0, 0, 0)';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerY = canvas.height / 2; 
        const waveLength = canvas.width*4; 
        const waveHeight = 50;
        const waveFrequency = 1; 
        
        //  drawing the wave
        canvasContext.beginPath();
        
        // loop through the wave length
        for (let i = 0; i < waveLength; i++) {

            // MATH!!!! the angle based on the position
            const angle = i * waveFrequency + performance.now() * 0.1; // Dynamic wave effect
            const frequencyIndex = Math.floor((i / waveLength) * bufferLength); // Normalize index based on wave length
            const frequencyValue = dataArray[frequencyIndex] / 255; // Normalize frequency value
    
            // MATH!!! the y position of the wave
            const y = centerY + Math.sin(angle) * waveHeight * frequencyValue;
    
            // Move to the starting point
            if (i === 0) {
                canvasContext.moveTo(i, y);
            } else {
                canvasContext.lineTo(i, y); // Draw the wave
            }
        }
    
        //bottom line of the wave
        canvasContext.lineTo(waveLength, centerY);
        canvasContext.lineTo(0, centerY);
        canvasContext.closePath();
    
        // wave fill
        canvasContext.fillStyle = 'rgba(0, 0, 255, 0.5)'; // Wave color
        canvasContext.fill();
    }
    function matrix() {
        const columnCount = 30; // Number of vertical lines
        const columnWidth = canvas.width / columnCount; // Width of each line
        const waveHeight = 50; // Maximum wave amplitude
        const lineSpeed = 0.02; // Speed of wave oscillation
    
        requestAnimationFrame(matrix);
    
        // Clear the canvas for new frame
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    
        // Black background
        canvasContext.fillStyle = 'rgba(0, 0, 0, 1)'; 
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    
        // Get audio data
        analyser.getByteFrequencyData(dataArray);
    
        // Draw each vertical vibrating line
        for (let i = 0; i < columnCount; i++) {
            const frequencyIndex = Math.floor(i * (bufferLength / columnCount));
            const frequencyValue = dataArray[frequencyIndex] / 255; // Normalize frequency value
    
            // Positioning of each vertical line
            const x = i * columnWidth + columnWidth / 2; // Center each line in its column
            const yStart = 0; // Start at the top of the canvas
            const yEnd = canvas.height; // Go to the bottom of the canvas
    
            // Line's oscillation based on frequency
            const oscillation = Math.sin(Date.now() * lineSpeed + i) * waveHeight * frequencyValue;
    
            // Color based on frequency value (HSL for smooth transitions)
            canvasContext.strokeStyle = `rgb(57, 255, 20)`;
            canvasContext.lineWidth = columnWidth / 100; // Very thin line
    
            // Begin drawing the line
            canvasContext.beginPath();
            canvasContext.moveTo(x + oscillation, yStart);
    
            // Vibrating line from top to bottom
            for (let y = yStart; y < yEnd; y += 10) { // Move down the line in increments
                const wave = Math.sin((y / 50) + Date.now() * lineSpeed) * waveHeight * frequencyValue;
                canvasContext.lineTo(x + wave, y);
            }
    
            // Finalize the line
            canvasContext.stroke();
        }
    }
    
    function draw() {
  

    
        const shapes = ['circle', 'triangle', 'square', 'star', 'hexagon', 'diamond', 'oval'];
    
        //  variables to preserve their values across everywher
        let shapeCounter = draw.shapeCounter || 0;
        let lastSwitchTime = draw.lastSwitchTime || Date.now();
    
        requestAnimationFrame(draw);
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    
        //  background
        canvasContext.fillStyle = 'rgb(16, 24, 32)';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    
        analyser.getByteFrequencyData(dataArray);
    
        const averageFrequency = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        const angle = Date.now() * 0.002;
        const rotationSpeed = (averageFrequency / 255) * 0.5; 
    
        //  shape every 4 seconds can be changed
        if (Date.now() - lastSwitchTime > 4000) {
            shapeCounter = (shapeCounter + 1) % shapes.length;
            lastSwitchTime = Date.now();
        }
    
        drawShape(angle, shapes[shapeCounter], rotationSpeed, dataArray );
    
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
    
        for (let i = 0; i < bufferLength; i++) {
            let barHeight = dataArray[i] * 0.9; 
            let pulse = Math.sin(Date.now() * 0.005 + i) * 10;
            barHeight += pulse;
    
            canvasContext.fillStyle = 'rgb(24,202,230)';
            canvasContext.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
        }
    
        //store variable
        draw.shapeCounter = shapeCounter;
        draw.lastSwitchTime = lastSwitchTime;
    }
    
//drawShape function used along the drawfunction for cool effect!
    function drawShape(angle, shapeType, rotationSpeed, dataArray) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const size = 30; 
    
       
        canvasContext.save();     
    
        
        canvasContext.translate(centerX, centerY);
        
        // rotation of shapes triangle not included
        if (shapeType !== 'triangle') {
            canvasContext.rotate(angle * rotationSpeed);
        }
    
        canvasContext.strokeStyle = 'rgb(24,202,230)';
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
    
        // restart canvas
        canvasContext.restore();
    }
    // close button
document.getElementById('close-visualizer').addEventListener('click', function() {
    // refresh page
    window.location.reload();
});

    
   
 

    //drop down menu selection for funtion to run
   if (selectedTemplate === 'drawBars') {
    requestAnimationFrame(drawBars);
} else if (selectedTemplate === 'drawWave') {
    requestAnimationFrame(drawWave);
} else if (selectedTemplate === 'draw') {
    requestAnimationFrame(draw);
}else if(selectedTemplate === 'matrix'){
requestAnimationFrame(matrix);
}

}

