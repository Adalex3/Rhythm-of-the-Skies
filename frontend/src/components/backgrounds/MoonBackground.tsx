import React, { useEffect } from 'react';

const MoonBackground: React.FC = () => {
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

        const drawMoon = () => {
            // Moon in the upper left corner
            const moonX = 10; // X-coordinate of the moon's center
            const moonY = 10; // Y-coordinate of the moon's center
            const moonRadius = 7; // Radius of the moon

            // Radial gradient for the moon
            const moonGradient = ctx.createRadialGradient(moonX, moonY, 5, moonX, moonY, moonRadius);
            moonGradient.addColorStop(0, 'rgba(240,240,240,1)'); // Bright white/gray at the center
            moonGradient.addColorStop(1, 'rgba(240,240,240,0)'); // Transparent at the edges

            ctx.fillStyle = moonGradient;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2, false);
            ctx.fill();

            // Adding craters (optional for realism)
            ctx.fillStyle = 'rgba(100, 100, 100, 1.0)'; // Dim gray for craters
            ctx.beginPath();
            ctx.arc(moonX - 3, moonY - 2, 2, 0, Math.PI * 2, false); // Crater 1
            ctx.arc(moonX + 2, moonY + 3, 1.5, 0, Math.PI * 2, false); // Crater 2
            ctx.arc(moonX + 4, moonY - 1, 1, 0, Math.PI * 2, false); // Crater 3
            ctx.fill();
        };

        // Call the function
        drawMoon();

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

export default MoonBackground;