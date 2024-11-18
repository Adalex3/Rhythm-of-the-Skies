import React, { useEffect, useState } from 'react';
import BlueSkyBackground from '../components/backgrounds/BlueSkyBackground';
import GreySkyBackground from '../components/backgrounds/GreySkyBackground';
import NightSkyBackground from '../components/backgrounds/NightSkyBackground';
import WhiteCloudsBackground from '../components/backgrounds/WhiteCloudsBackground';
import SunBackground from '../components/backgrounds/SunBackground';
import MoonBackground from '../components/backgrounds/MoonBackground';
import RainBackground from '../components/backgrounds/RainBackground';
import ThunderBackground from '../components/backgrounds/ThunderBackground';

const MainPage: React.FC = () => {

    const [weather, setWeather] = useState<string | null>(null);

    // Fetch weather data
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                setWeather("Clear");
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchWeather();
    }, []);


    // Render sky based on time
    const skyBackground = () => {
        const isDaytime = new Date().getHours() >= 7 && new Date().getHours() < 19;
        if(isDaytime) {
            return (
                <>
                    <BlueSkyBackground />
                    <SunBackground />
                </>
            )
        } else {
            return (
                <>
                    <NightSkyBackground />
                    <MoonBackground />
                </>
            )
        }
    }

    // Render background based on weather
    const renderBackground = () => {
        switch (weather) {
            case 'Clear':
                return (
                    <>
                        {skyBackground()}
                        <WhiteCloudsBackground 
                        cloudCount={10}
                        cloudSpeed={1}
                        cloudSize={1}/>
                    </>
                );
            case 'Cloudy':
                return (
                    <>
                        {skyBackground()}
                        <WhiteCloudsBackground 
                        cloudCount={300}
                        cloudSpeed={0.2}
                        cloudSize={1.5}/>
                    </>
                );
            case 'Rain':
                return (
                    <>
                        <GreySkyBackground />
                        <RainBackground rainAmount={20} rainSpeed={2} rainAngle={89} />
                    </>
                );
            case 'Storm':
                return (
                    <>
                        <GreySkyBackground />
                        <RainBackground rainAmount={50} rainSpeed={4} rainAngle={70} />
                    </>
                )
            case 'Thunderstorm':
            return (
                <>
                    <GreySkyBackground />
                    <RainBackground rainAmount={50} rainSpeed={4} rainAngle={110} />
                    <ThunderBackground variance={5000} boltLength={500} frequency={2000} boltThickness={10}/>
                </>
            )
            default:
                return <>{skyBackground()}</>; // Fallback
        }
    };

    return (
        <div>
            {weather ? renderBackground() : <p>Loading weather data...</p>}
        </div>
    );

};

export default MainPage;