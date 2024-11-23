import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

// interface Coordinate {
//     name: string;
//     local_names: Record<string, string>;
//     lat: number;
//     lon: number;
//     country: string;
// }

const MainPage: React.FC = () => {

    const [weather, setWeather] = useState<Weather | null>(null);
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [cityName, setCityName] = useState(''); 
    const [stateName, setStateName] = useState(''); 
    // const [coordinates, setCoordinates] = useState<Coordinate[]>([]);

    useEffect(() => {
        const fetchPlaylist = async (weather: Weather) => {
            // TODO: GET PLAYLIST FROM API
            const api_playlist = playlist1; // SAMPLE DATA
            setPlaylist(api_playlist);
        }
        const fetchWeather = async () => {
            try {
                // TODO: GET WEATHER FROM API
                const response = await axios.get('http://localhost:5000/api/coord', {
                    params : {
                        cityName:cityName,
                        stateName:stateName,
                        limit:1,
                    },
                });
        
                const coordinates = response.data; // Assuming coordinates is first item
        
        
                if (coordinates.length > 0) {
                    const { lat, lon } = coordinates[0];
            
                    const weatherResponse = await axios.get('http://localhost:5000/api/weather', {
                        params : {
                        lat:lat,
                        lon:lon,
                        },
                    });

                    const weather_condition = weatherResponse.data.weather[0].main;

                    if (weather_condition == 'Drizzle'){
                        weather_condition == 'Rain';
                    } else if (weather_condition == 'Atmosphere'){
                        weather_condition == 'Clouds';
                    }

                    const api_weather = {condition: weather_condition, location: cityName, temp: weatherResponse.data.main.temp};
                    setWeather(api_weather);
                    fetchPlaylist(api_weather);
                }
                else {
                    console.error('Coordinates not found!');
                }
        
                // setCoordinates(coordinates);

                
                // const api_weather = {condition: "Clear", location: "Orlanfdsfdo", temp: 70.0};
                // setWeather(api_weather);
                // fetchPlaylist(api_weather);
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        function handleSetCityName(e : any) : void
        {
            setCityName(e.target.value);
        }

        function handleSetStateName(e : any) : void
        {
            setStateName(e.target.value);
        }

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
            case 'Clouds':
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