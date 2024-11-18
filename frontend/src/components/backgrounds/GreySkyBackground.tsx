import React, { useEffect } from 'react';

const GreySkyBackground: React.FC = () => {
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
        const pixelationFactor = 3; // Size of each "pixel" when scaled

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const drawGradientSky = () => {
            // Blue sky gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
            gradient.addColorStop(0, '#111111'); // dark gray
            gradient.addColorStop(1, '#222222'); // Light gray
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        };

        drawGradientSky();

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

export default GreySkyBackground;