import React, { useEffect } from 'react';

const SunBackground: React.FC = () => {
    useEffect(() => {
        // Create a container div
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none'; // Prevent interaction
        container.style.backgroundRepeat = 'repeat';
        container.style.backgroundSize = 'cover';

        document.body.appendChild(container);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const canvasWidth = 100; // Low resolution for pixelation
        const canvasHeight = 50;
        const pixelationFactor = 10; // Size of each "pixel" when scaled

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const drawSun = () => {
        
            // Sun in the upper left corner
            const sunX = 7.5; // X-coordinate of the sun's center
            const sunY = 7.5; // Y-coordinate of the sun's center
            const sunRadius = 10; // Radius of the sun
        
            // Radial gradient for the sun
            const sunGradient = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, sunRadius);
            sunGradient.addColorStop(0, 'rgba(255,215,0,1)'); // Bright yellow at the center
            sunGradient.addColorStop(1, 'rgba(255, 215, 0, 0)'); // Transparent yellow at the edges
        
            ctx.fillStyle = sunGradient;
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2, false);
            ctx.fill();
        };
        
        // Call the function
        drawSun();

        // Scale for pixelation
        const scaledCanvas = document.createElement('canvas');
        const scaledCtx = scaledCanvas.getContext('2d')!;
        scaledCanvas.width = canvasWidth * pixelationFactor;
        scaledCanvas.height = canvasHeight * pixelationFactor;

        // Disable smoothing for pixelation effect
        scaledCtx.imageSmoothingEnabled = false;

        // Draw the low-resolution canvas scaled up
        scaledCtx.drawImage(canvas, 0, 0, canvasWidth, canvasHeight, 0, 0, scaledCanvas.width, scaledCanvas.height);

        // Convert the scaled canvas to a data URL and apply it as the background of the div
        container.style.backgroundImage = `url(${scaledCanvas.toDataURL()})`;

        // Cleanup on component unmount
        return () => {
            document.body.removeChild(container);
        };
    }, []);

    return null; // No visible UI
};

export default SunBackground;