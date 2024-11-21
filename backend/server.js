const express = require('express');

const bodyParser = require('body-parser');

const cors = require('cors');

const axios = require('axios');
const dotenv = require('dotenv'); 
dotenv.config(); 



const app = express();

app.use(cors());

app.use(bodyParser.json());



app.use((req, res, next) => {

    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader(

        'Access-Control-Allow-Headers',

        'Origin, X-Requested-With, Content-Type, Accept, Authorization'

    );

    res.setHeader(

        'Access-Control-Allow-Methods',

        'GET, POST, PATCH, DELETE, OPTIONS'

    );

    next();

});


app.get('/api/coord', async (req, res) => {
    // console.log("Received request:", req.query);

    const { cityName, stateName, limit } = req.query;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;

    const validStateNames = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California",
        "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
        "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
        "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
        "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
        "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
        "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
        "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
        "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
        "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
      ];

    // console.log(stateName);

    let url;

    if (validStateNames.includes(stateName)) { 
        // console.log("Valid State Name");
        url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)},${encodeURIComponent(stateName)}&limit=${limit}&appid=${apiKey}`;
    } else { 
        // console.log("Invalid State Name");
        url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=${limit}&appid=${apiKey}`;
    } 

    console.log("API URL:", url);

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching coordinate data:', error); 
        res.status(500).send('Error fetching coordinate data');
    }

});

app.get('/api/weather', async (req, res) => {
    // console.log("Received request:", req.query);

    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${encodeURIComponent(apiKey)}`;

    // console.log("Constructed URL:", url);

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching weather data:', error); 
        res.status(500).send('Error fetching weather data');
    }

});



app.listen(5000); // start Node + Express server on port 5000 