import React, { useState } from 'react';
import axios from 'axios';

interface Coordinate {
  name: string;
  local_names: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string; // Optional field
}

function Weather() 
{ 

  const [cityName, setCityName] = useState(''); 
  const [stateName, setStateName] = useState(''); 
  // const [countryCode, setCountryCode] = useState(''); 
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [weather, setWeather] = useState('');
  const [temperature, setTemperature] = useState('');
  const [error, setError] = useState(''); 

  
  const handleSearch = async() =>
  {
    try {
      // I had to specify localhost:5000! CORS >:(
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
        // console.log(weatherResponse);
        // console.log(weatherResponse.data.weather[0].main);
        // console.log(weatherResponse.data.main.temp)
        setWeather(weatherResponse.data.weather[0].main);
        setTemperature(weatherResponse.data.main.temp);
      } else {
        setError('No coordinates found');
      }

      setCoordinates(coordinates);

    } catch (err) {

      console.error(err);

      setError('Error fetching coordinate or weather data');

    }
  }

  function handleSetCityName(e : any) : void
  {
    setCityName(e.target.value);
  }

  function handleSetStateName(e : any) : void
  {
    setStateName(e.target.value);
  }

    return( 

      <div id="weatherDiv"> 

        <span id="inner-title">Make a Weather API call:</span><br /> 

        <input type="text" id="cityName" placeholder="City Name:" 
        onChange={handleSetCityName}/><br />

        <input type="text" id="stateName" placeholder="State Name:" 
        onChange={handleSetStateName}/><br />

        <input type="submit" id="weatherCallButton" className="buttons" value = "What's the Weather?" 

          onClick={handleSearch} /> 

        <span id="weatherResult">{error}</span> 

        {coordinates.length > 0 && (
          <div>
            <p>Latitude: {coordinates[0].lat}</p>
            <p>Longitude: {coordinates[0].lon}</p>
            <p>Weather: {weather}</p>
            <p>Temperature: {temperature}</p>
          </div>
        )}

     </div> 

    ); 

}; 

 

export default Weather; 