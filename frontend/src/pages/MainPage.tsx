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
    lat: number;
    lon: number;
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
    spotify_url: string;
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
        // CORA: Fetch Spotify playlist based on weather
        const fetchPlaylist = async (weather: Weather) => {
            try {
                const response = await axios.post('http://localhost:5000/api/playlist', {
                    userId: "USER_ID", // Replace with actual user ID
                    // lat: weather.lat, // Assuming weather API returns lat/lon
                    // lon: weather.lon,
                    weatherCondition: weather.condition,
                });
                setPlaylist(response.data); // CORA: Update state with playlist data from backend.
            } catch (error) {
                console.error("Error fetching Spotify playlist:", error);
            }
        };
        
        const fetchWeather = async () => {
            try {
                // TODO: GET WEATHER FROM API (JOANNE)

                var locationStr = localStorage.getItem("user_location") ?? "NO LOCATION"; // TODO: Add support for no location

                // Process location string
                // We are going to be compatible with three different options:
                // 1: City Name ("Orlando")
                // 2: City Name + State Abb. ("Orlando, FL")
                // 3: City Name + Full State Name ("Orlando, Florida")

                var cityName = "";
                var stateName = "";

                // First filter extraneous spaces around the comma
                if(locationStr.includes(",")) {
                    locationStr = locationStr.replace(" ,",",");
                    locationStr = locationStr.replace(", ",",");

                    // Has city + state (somehow)
                    cityName = locationStr.split(",")[0];
                    stateName = locationStr.split(",")[1] ?? "";
                } else {
                    // Only city name
                    cityName = locationStr;
                }

                // Now we should have a cityName that adheres to the requirements, and a stateName that does

                const response = await axios.get('http://localhost:5000/api/coord', {
                    params : {
                        cityName:cityName,
                        stateName:stateName,
                        limit:1,
                    },
                });
        
                const coordinates = response.data; // Assuming coordinates is first item
                console.log(response);
        
        
                if (coordinates.length > 0) {
                    const { lat, lon } = coordinates[0];
            
                    const weatherResponse = await axios.get('http://localhost:5000/api/weather', {
                        params : {
                        lat:lat,
                        lon:lon,
                        },
                    });

                    const weather_condition = weatherResponse.data.weather[0].main;
                    const atmosphere_list = ["Mist", "Smoke", "Haze", "Dust", "Fog", "Sand", "Dust", "Ash", "Squall", "Tornado"];

                    if (weather_condition == 'Drizzle'){
                        weather_condition == 'Rain';
                    } else if (atmosphere_list.includes(weather_condition)){
                        weather_condition == 'Clouds';
                    }

                    const api_weather = {condition: weather_condition, location: cityName, temp: weatherResponse.data.main.temp};
                    setWeather(api_weather);
                    fetchPlaylist(api_weather);
                }
                else {
                    console.error('Coordinates not found!');
                }
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
            document.body.classList.toggle("white-text",true);
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
                document.body.classList.toggle("white-text",false);
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
                document.body.classList.toggle("white-text",false);
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
                document.body.classList.toggle("white-text",true);
                return (
                    <>
                        <GreySkyBackground />
                        <RainBackground rainAmount={20} rainSpeed={2} rainAngle={89} />
                    </>
                );
            case 'Storm':
                document.body.classList.toggle("white-text",true);
                return (
                    <>
                        <GreySkyBackground />
                        <RainBackground rainAmount={50} rainSpeed={4} rainAngle={70} />
                    </>
                )
            case 'Thunderstorm':
                document.body.classList.toggle("white-text",true);
                return (
                    <>
                        <GreySkyBackground />
                        <RainBackground rainAmount={50} rainSpeed={4} rainAngle={110} />
                        <ThunderBackground variance={5000} boltLength={500} frequency={2000} boltThickness={10}/>
                    </>
                )
            case 'Snow':
                document.body.classList.toggle("white-text",false);
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