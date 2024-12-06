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

const MainPage: React.FC = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    const fetchPlaylist = async (weather: Weather) => {
      try {
        const response = await axios.post('http://localhost:5000/api/playlist', {
          userId: localStorage.getItem("user_id"),
          weatherCondition: weather.condition,
        });
        setPlaylist(response.data);
      } catch (error) {
        console.error("Error fetching Spotify playlist:", error);
      }
    };
   
    const fetchWeather = async () => {
      try {
        var locationStr = localStorage.getItem("user_location") ?? "Orlando, Florida";
        if(locationStr.includes(",")) {
          locationStr = locationStr.replace(" ,",",");
          locationStr = locationStr.replace(", ",",");
          const cityName = locationStr.split(",")[0];
          const stateName = locationStr.split(",")[1] ?? "";
          const response = await axios.get('http://localhost:5000/api/coord', {
            params : {
              cityName: cityName,
              stateName: stateName,
              limit:1,
            },
          });

          const coordinates = response.data;
         
          if (coordinates.length > 0) {
            const { lat, lon } = coordinates[0];
   
            const weatherResponse = await axios.get('http://localhost:5000/api/weather', {
              params : {
                lat: lat,
                lon: lon,
              },
            });

            let weather_condition = weatherResponse.data.weather[0].main;

            const api_weather = {
              condition: weather_condition,
              location: cityName,
              temp: weatherResponse.data.main.temp,
              lat: lat,
              lon: lon
            };

            setWeather(api_weather);
            fetchPlaylist(api_weather);
          } else {
            console.error('Coordinates not found!');
          }
        } else {
          console.error('Location format is not city,state. Please set user_location properly.');
        }

      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeather();
  }, []);

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
        <ProfileDisplay username="JJWang" />
      </div>
    </div>
  );

};

export default MainPage;
