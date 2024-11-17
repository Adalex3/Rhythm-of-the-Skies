import React, { useEffect } from 'react';

const WhiteCloudsBackground: React.FC = () => {
    useEffect(() => {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.backgroundRepeat = 'repeat';
        container.style.backgroundSize = 'cover';
        container.style.opacity = '0.8';

        document.body.appendChild(container);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const canvasWidth = document.body.getBoundingClientRect().width/5;
        const canvasHeight = document.body.getBoundingClientRect().height/5;
        const pixelationFactor = 3;
        const cloudCount = 100;
        const clouds: { x: number; y: number, stretch: number, baseRadius: number, amplitude:number, lobes: number, asymmetryFactor: number, random1: number, random2: number, speed: number }[] = [];

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Generate random clouds
        for (let i = 0; i < cloudCount; i++) {
            clouds.push({
                x: Math.random() * canvasWidth * 2,
                y: Math.random() * canvasHeight,
                stretch: Math.sqrt((Math.random()*2))+0.05,
                baseRadius: Math.random()*20+4,
                amplitude: Math.random()*2+1,
                lobes: Math.random()*2+4,
                asymmetryFactor: 1,
                random1: Math.random(),
                random2: Math.random(),
                speed: i*0.001+0.01
            });
        }

        const drawClouds = () => {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear the canvas
        
            let cloudNum = 0;
            clouds.forEach((cloud) => {
                const baseRadius = cloud.baseRadius;
                const amplitude = cloud.amplitude;
                const lobes = cloud.lobes;
                const asymmetryFactor = cloud.asymmetryFactor;
                const verticalScaleTop = 0.2 * (cloud.random1 * 1 + 0.2);
                const verticalScaleBottom = 0.5 * (cloud.random2 * 1 + 0.5);
        
                // Create a radial gradient for the cloud
                const gradient = ctx.createRadialGradient(
                    cloud.x, cloud.y, baseRadius * 0.5, // Inner circle (lighter center)
                    cloud.x, cloud.y, baseRadius * 1.5  // Outer circle (darker edges)
                );
                const alpha = 1 * ((cloudNum / cloudCount) ** 2);
                gradient.addColorStop(0, 'rgba(255,255,255,' + alpha + ')');   // Light color in the center
                gradient.addColorStop(1, 'rgba(200,200,200,' + alpha + ')');   // Slightly darker color at the edges
        
                ctx.fillStyle = gradient;
        
                ctx.beginPath();
                const steps = 50;
                for (let i = 0; i <= steps; i++) {
                    const angle = (i / steps) * Math.PI * 2;
                    const r = baseRadius + amplitude * Math.sin(lobes * angle) + asymmetryFactor * (Math.sin(angle) + 1) / 2;
                    const x = cloud.x + r * Math.cos(angle) * cloud.stretch;
                    const sinAngle = Math.sin(angle);
                    const yScale = sinAngle >= 0 ? verticalScaleTop : verticalScaleBottom;
                    const y = cloud.y + r * sinAngle * yScale;
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
        
                // Add an outline
                ctx.strokeStyle = 'rgba(220, 220, 225, '+alpha*2+')'; // Outline color
                ctx.lineWidth = 0.5; // Outline width
                ctx.stroke(); // Draw the outline
        
                cloudNum++;
            });
        };

        const updateClouds = () => {
            clouds.forEach((cloud) => {
                cloud.x -= cloud.speed; // move clouds to left
                if (cloud.x < -50) {
                    cloud.x = canvasWidth + 50;
                    cloud.y = Math.random() * canvasHeight;
                }
            });
        };

        const animate = () => {
            drawClouds();
            updateClouds();

            const scaledCanvas = document.createElement('canvas');
            const scaledCtx = scaledCanvas.getContext('2d')!;
            scaledCanvas.width = canvasWidth * pixelationFactor;
            scaledCanvas.height = canvasHeight * pixelationFactor;

            scaledCtx.imageSmoothingEnabled = false;
            scaledCtx.drawImage(canvas, 0, 0, canvasWidth, canvasHeight, 0, 0, scaledCanvas.width, scaledCanvas.height);

            container.style.backgroundImage = `url(${scaledCanvas.toDataURL()})`;

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            document.body.removeChild(container);
        };
    }, []);

    return null; // No visible UI
};

export default WhiteCloudsBackground;