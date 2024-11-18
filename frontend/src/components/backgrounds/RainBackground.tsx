import React, { useEffect } from 'react';

interface RainBackgroundProps {
    rainAmount: number;
    rainSpeed: number;
    rainAngle: number;
}

const RainBackground: React.FC<RainBackgroundProps> = ({
    rainAmount,
    rainSpeed,
    rainAngle,
}) => {
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
        const canvasWidth = document.body.getBoundingClientRect().width / 5;
        const canvasHeight = document.body.getBoundingClientRect().height / 5;
        const pixelationFactor = 3;
        const raindrops: {
            x: number;
            y: number;
            length: number;
            speed: number;
            opacity: number;
        }[] = [];

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const angleRadians = (rainAngle * Math.PI) / 180;
        const sinAngle = Math.sin(angleRadians);
        const cosAngle = Math.cos(angleRadians);

        // MAKE RANDOM RAINDROPS
        for (let i = 0; i < rainAmount; i++) {
            raindrops.push({
                x: Math.random() * canvasWidth*2 + ((rainAngle - 90) / 90) * (canvasWidth), //offset based on rain angle so it start in righ spot
                y: Math.random() * canvasHeight - canvasHeight,
                length: Math.random() * 10 + 20,
                speed: Math.random() * 2 + rainSpeed,
                opacity: Math.random() * 0.5 + 0.3,
            });
        }


        const drawRaindrops = () => {
            var rainCount = 0
            ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear the canvas

            ctx.lineCap = 'round';

            raindrops.forEach((raindrop) => {
                ctx.lineWidth = (rainCount/rainAmount)+0.5;
                ctx.strokeStyle = `rgba(174,194,224,${raindrop.opacity})`;
                ctx.beginPath();
                ctx.moveTo(raindrop.x, raindrop.y);
                ctx.lineTo(
                    raindrop.x - raindrop.length * cosAngle,
                    raindrop.y - raindrop.length * sinAngle
                );
                ctx.stroke();
                rainCount++;
            });

        };

        const updateRaindrops = () => {
            raindrops.forEach((raindrop) => {
                raindrop.x += raindrop.speed * cosAngle;
                raindrop.y += raindrop.speed * sinAngle;

                // make sure it doesnt go out of bounds
                if (
                    raindrop.y > canvasHeight + 20 ||
                    raindrop.x < -20 ||
                    raindrop.x > canvasWidth + 20
                ) {
                    raindrop.x = Math.random() * canvasWidth*2 + ((rainAngle - 90) / 90) * (canvasWidth), //offset based on rain angle so it start in righ spot
                    raindrop.y = -20;
                }
            });
        };

        const animate = () => {
            drawRaindrops();
            updateRaindrops();

            const scaledCanvas = document.createElement('canvas');
            const scaledCtx = scaledCanvas.getContext('2d')!;
            scaledCanvas.width = canvasWidth * pixelationFactor;
            scaledCanvas.height = canvasHeight * pixelationFactor;

            scaledCtx.imageSmoothingEnabled = false;
            scaledCtx.drawImage(
                canvas,
                0,
                0,
                canvasWidth,
                canvasHeight,
                0,
                0,
                scaledCanvas.width,
                scaledCanvas.height
            );

            container.style.backgroundImage = `url(${scaledCanvas.toDataURL()})`;

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            document.body.removeChild(container);
        };
    }, []);

    return null;
};

export default RainBackground;