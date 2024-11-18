import React, { useEffect } from 'react';

interface LightningBackgroundProps {
    boltLength?: number;
    boltThickness?: number;
    flashOpacity?: number;
    frequency?: number;
    variance?: number;
}

const LightningBackground: React.FC<LightningBackgroundProps> = ({
    boltLength = 100,
    boltThickness = 2,
    flashOpacity = 0.5,
    frequency = 5000,
    variance = 2000,
}) => {
    useEffect(() => {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '1000';
        container.style.backgroundColor = 'transparent';

        document.body.appendChild(container);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!; // Get the rendererr
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);

        // magical pixelate function!
        const updateBackgroundImage = () => {
            const scaledCanvas = document.createElement('canvas');
            const scaledCtx = scaledCanvas.getContext('2d')!;
            scaledCanvas.width = canvas.width;
            scaledCanvas.height = canvas.height;

            scaledCtx.drawImage(canvas, 0, 0);

            container.style.backgroundImage = `url(${scaledCanvas.toDataURL()})`;
        };

        // Function to generate a lightning bolt
        const drawLightningBolt = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // flash
            container.style.backgroundColor = `rgba(255, 255, 255, ${flashOpacity})`;

            ctx.strokeStyle = 'white';
            ctx.lineWidth = boltThickness;
            ctx.beginPath();

            let x = Math.random() * canvas.width;
            let y = 0;

            ctx.moveTo(x, y);

            const segmentHeight = boltLength / 10;

            while (y < canvas.height && y < boltLength) {
                x += (Math.random() - 0.5) * 50;
                y += Math.random() * segmentHeight;

                ctx.lineTo(x, y);
            }

            ctx.stroke();

            updateBackgroundImage();

            // fade out flash!
            setTimeout(() => {
                container.style.backgroundColor = 'transparent';
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                updateBackgroundImage();
            }, 100);
        };

        const scheduleNextBolt = () => {
            const minInterval = Math.max(frequency - variance, 500); // always at least 500ms
            const maxInterval = frequency + variance;
            const nextInterval = Math.random() * (maxInterval - minInterval) + minInterval;
            setTimeout(() => {
                drawLightningBolt();
                scheduleNextBolt();
            }, nextInterval);
        };


        scheduleNextBolt();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            document.body.removeChild(container);
        };
    }, [boltLength, boltThickness, flashOpacity, frequency, variance]);

    return null; // No visible UI
};

export default LightningBackground;