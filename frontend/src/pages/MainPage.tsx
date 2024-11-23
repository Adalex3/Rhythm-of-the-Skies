import React, { useEffect, useState } from 'react';
import BlueSkyBackground from '../components/backgrounds/BlueSkyBackground';
import GreySkyBackground from '../components/backgrounds/GreySkyBackground';
import NightSkyBackground from '../components/backgrounds/NightSkyBackground';
import WhiteCloudsBackground from '../components/backgrounds/WhiteCloudsBackground';
import SunBackground from '../components/backgrounds/SunBackground';
import MoonBackground from '../components/backgrounds/MoonBackground';
import RainBackground from '../components/backgrounds/RainBackground';
import SnowBackground from '../components/backgrounds/SnowBackground';
import ThunderBackground from '../components/backgrounds/ThunderBackground';
import OverviewPanel from '../components/OverviewPanel';
import PlaylistDisplay from '../components/PlaylistDisplay';
import ProfileDisplay from '../components/ProfileDisplay';

// TEMP
import { playlist1, playlist2, playlist3 } from "../sample_data";


interface Weather {
    temp: number;
    condition: string;
    location: string;
  }
  
interface Song {
    id: string;
    track_id: string;
    track_name: string;
    artist_name: string;
    artist_id: string;
    album_name: string;
    album_id: string;
    album_image_url: string;
    track_url: string;
    duration: number;
}

interface Playlist {
    id: string;
    user_id: string;
    genres: String[];
    weatherConditions: String[];
    songs: Song[];
    date: Date;
}

const MainPage: React.FC = () => {

    const [weather, setWeather] = useState<Weather | null>(null);
    const [playlist, setPlaylist] = useState<Playlist | null>(null);

    useEffect(() => {
        const fetchPlaylist = async (weather: Weather) => {
            // TODO: GET PLAYLIST FROM API
            const api_playlist = playlist1; // SAMPLE DATA
            setPlaylist(api_playlist);
        }
        const fetchWeather = async () => {
            try {
                // TODO: GET WEATHER FROM API
                const api_weather = {condition: "Clear", location: "Orlanfdsfdo", temp: 70.0};
                setWeather(api_weather);
                fetchPlaylist(api_weather);
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchWeather();
    }, []);


    // Render sky based on time
    const skyBackground = () => {
        const isDaytime = new Date().getHours() >= 7 && new Date().getHours() < 18;
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
        switch (weather?.condition) {
            case 'Clear':
                return (
                    <>
                        {skyBackground()}
                        <WhiteCloudsBackground 
                        cloudCount={10}
                        cloudSpeed={30}
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
            case 'Snow':
            return (
                <>
                    {skyBackground()}
                    <SnowBackground snowAmount={1000} snowSpeed={0.4}/>
                </>
            )
            default:
                return <>{skyBackground()}</>; // Fallback
        }
    };

    return (
        <div className="app">
          {renderBackground()}
          <div className="content">
            {weather ? (
              <OverviewPanel weather={weather} />
            ) : (
              <p>Loading weather data...</p>
            )}
            {playlist ? (
              <PlaylistDisplay playlist={playlist} />
            ) : (
              <p>Loading playlist...</p>
            )}
            <ProfileDisplay username="Alex Hynds" />
          </div>
        </div>
      );

};

export default MainPage;