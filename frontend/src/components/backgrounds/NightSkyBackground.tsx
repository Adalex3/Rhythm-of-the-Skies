import React, { useEffect } from 'react';

const NightSkyBackground: React.FC = () => {
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
        const canvasWidth = 450; // Low resolution for pixelation
        const canvasHeight = 450/2;
        const pixelationFactor = 3; // Size of each "pixel" when scaled

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const drawGradientSky = () => {
            // Gray night sky gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
            gradient.addColorStop(0, '#111111'); // Dark gray
            gradient.addColorStop(1, '#000000'); // Black
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        };

        const drawStars = () => {
            const starCount = 100; // Number of stars to draw
            for (let i = 0; i < starCount; i++) {
                const x = Math.random() * canvasWidth;
                const y = Math.random() * canvasHeight;
                const starSize = Math.random() * 0.75 + 0.25; // Random size for stars
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(x, y, starSize, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        drawGradientSky();
        drawStars();

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

export default NightSkyBackground;