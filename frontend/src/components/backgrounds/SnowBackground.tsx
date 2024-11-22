import React, { useEffect } from 'react';

interface SnowBackgroundProps {
    snowAmount: number;
    snowSpeed: number;
}

const SnowBackground: React.FC<SnowBackgroundProps> = ({
    snowAmount,
    snowSpeed,
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
        const pixelationFactor = 5;
        const snowflakes: {
            x: number;
            y: number;
            radius: number;
            speed: number;
            drift: number;
            opacity: number;
        }[] = [];

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Generate random snowflakes
        for (let i = 0; i < snowAmount; i++) {
            snowflakes.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                radius: Math.random() * 1 + 0.05, // Snowflake size
                speed: Math.random() * snowSpeed + snowSpeed*0.5, // Fall speed
                drift: Math.random() * snowSpeed - snowSpeed*0.5, // Side-to-side drift
                opacity: Math.random() * 0.5 + 0.5,
            });
        }


        const drawGradientSky = () => {
            // Blue sky gradient
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
            const isDaytime = new Date().getHours() >= 7 && new Date().getHours() < 19;
            gradient.addColorStop(0, '#FFFFFF00'); // Light Blue
            gradient.addColorStop(1, isDaytime ? '#FFFFFFBB' : '#FFFFFF33'); // Darker Blue
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        };

        const drawSnowflakes = () => {
            snowflakes.forEach((snowflake) => {
                ctx.beginPath();
                ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${snowflake.opacity})`;
                ctx.fill();
            });
        };

        const updateSnowflakes = () => {
            snowflakes.forEach((snowflake) => {
                snowflake.y += snowflake.speed;
                snowflake.x += snowflake.drift;

                // Reset snowflake when it goes out of bounds
                if (snowflake.y > canvasHeight) {
                    snowflake.y = -10;
                    snowflake.x = Math.random() * canvasWidth;
                }
                if (snowflake.x < 0 || snowflake.x > canvasWidth) {
                    snowflake.x = Math.random() * canvasWidth;
                }
            });
        };

        const animate = () => {
            drawGradientSky();
            drawSnowflakes();
            updateSnowflakes();

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

export default SnowBackground;