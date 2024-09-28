        //Canvas retrieves visualizer info
        let audioContext;
        let analyser;

        const canvas = document.getElementById('visualizer');
        //
        const canvasContext = canvas.getContext('2d');
        
        document.getElementById('audio-file').addEventListener('change', function() {
            // Create or resume the AudioContext
            if (!audioContext || audioContext.state === 'suspended') {
                audioContext = new (window.AudioContext)(); // Create a new AudioContext
                audioContext.resume().then(() => {
                    console.log('AudioContext resumed.'); // Here is where `then` closes
                });
            }
        
            // Continue with the rest of your code
            const files = this.files; // Use this.files instead of this.file
            if (files.length === 0) return; // Check if file is empty
        
            const file = files[0];
            const reader = new FileReader();
        
            reader.onload = function(e) {
                const audioSrc = e.target.result;
                const audio = document.getElementById('audio-player');
                audio.src = audioSrc;
        
                analyser = audioContext.createAnalyser(); // Create an analyser node
                const source = audioContext.createMediaElementSource(audio);
        
                source.connect(analyser);
                analyser.connect(audioContext.destination);
        
                // Play audio
                audio.play().catch(error => {
                    console.error("Playback failed:", error);
                });
        
                visualize();
            };
            reader.readAsDataURL(file);
        }); 
            //protypee Visualizer
        function visualize(){
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function draw(){
                requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);

                canvasContext.clearRect(0,0,canvas.width,canvas.height);
                canvasContext.fillStyle = 'rgb(0,0,0)';
                canvasContext.fillRect(0,0,canvas.width,canvas.height);

                const barWidth = (canvas.width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;

                for(let i=0;i<bufferLength;i++){
                    barHeight =dataArray[i];

                    canvasContext.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
                    canvasContext.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

                    x+= barWidth+1;
                }
            }
            draw();
        }






    


