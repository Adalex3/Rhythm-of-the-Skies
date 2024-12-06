const axios = require('axios');
const dotenv = require('dotenv'); 
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');// const mongoose = require('mongoose');
const SpotifyWebApi = require('spotify-web-api-node');
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

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

// Go ahead and connect to the database immediately
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
connectToDatabase();


// Initialize Spotify API Client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: 'http://localhost:5000/callback',
    //redirectUri: 'http://54.89.11.234:5000/callback',
});

// Spotify Login Route
app.get('/login', (req, res) => {
    // Scopes are important for permissions
    const scopes = [
        'user-read-private',
        'user-read-email',
        'playlist-modify-private',
        'playlist-modify-public'
    ];
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    res.redirect(authorizeURL);
});

// Spotify Callback Route
app.get('/callback', async (req, res) => {
    client.connect();

    const code = req.query.code;

    if (!code) {
        console.error('Authorization code missing');
        return res.status(400).send('Authorization code missing');
    }

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const accessToken = data.body['access_token'];
        const refreshToken = data.body['refresh_token'];

        // Set the access token and refresh token
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        // Check if the access token is valid by making a simple request to Spotify's "me" endpoint
        const userInfo = await spotifyApi.getMe();
        console.log("Spotify User Info: ", userInfo);

        // If we successfully get user info, the access token is valid
        const spotifyId = userInfo.body.id;
        const displayName = userInfo.body.display_name;
        const email = userInfo.body.email;

        const db = client.db('Rhythm');
        
        const usersCollection = db.collection('Users');

        // console.log("Database using Users...");

        const existingUser = await usersCollection.findOne({ spotifyId });

        if (existingUser) {
            await usersCollection.updateOne(
                { spotifyId },
                {
                    $set: {
                        spotifyAccessToken: accessToken,
                        spotifyRefreshToken: refreshToken,
                        email,
                        username: displayName,
                    },
                }
            );
            console.log('User updated in MongoDB:', spotifyId);
        } else {
            const newUser = {
                spotifyId,
                username: displayName,
                email,
                spotifyAccessToken: accessToken,
                spotifyRefreshToken: refreshToken,
                preferences: [],
                registered_at: new Date(),
            };
            await usersCollection.insertOne(newUser);
            console.log('New user added to MongoDB:', spotifyId);
        }

        // Redirect the user to the preferences page
        res.redirect('http://localhost:5173/preferences');
    } catch (error) {
        console.error('Error during Spotify authentication:', error);

        // Check if the error is from Spotify API
        if (error.body && error.body.error) {
            console.log("ERROR FROM SPOTIFY API:");
            const errorCode = error.body.error.status; // 401 for unauthorized, etc.
            const errorMessage = error.body.error.message; // Detailed error message
            console.error(`Spotify API error: ${errorMessage} (Code: ${errorCode})`);

            // Send a more specific error response
            if (errorCode === 401) {
                res.status(401).send(`Invalid access token: ${errorMessage}`);
            } else {
                res.status(500).send(`Spotify authentication error: ${errorMessage}`);
            }
        } else {
            // For other types of errors (e.g., network errors)
            console.error('Unknown error during authentication', error);
            res.status(500).send('Error during Spotify authentication');
        }
    }
});

app.get('/api/coord', async (req, res) => {
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

    const stateAbbreviations = {
        AL: "Alabama",
        AK: "Alaska",
        AZ: "Arizona",
        AR: "Arkansas",
        CA: "California",
        CO: "Colorado",
        CT: "Connecticut",
        DE: "Delaware",
        FL: "Florida",
        GA: "Georgia",
        HI: "Hawaii",
        ID: "Idaho",
        IL: "Illinois",
        IN: "Indiana",
        IA: "Iowa",
        KS: "Kansas",
        KY: "Kentucky",
        LA: "Louisiana",
        ME: "Maine",
        MD: "Maryland",
        MA: "Massachusetts",
        MI: "Michigan",
        MN: "Minnesota",
        MS: "Mississippi",
        MO: "Missouri",
        MT: "Montana",
        NE: "Nebraska",
        NV: "Nevada",
        NH: "New Hampshire",
        NJ: "New Jersey",
        NM: "New Mexico",
        NY: "New York",
        NC: "North Carolina",
        ND: "North Dakota",
        OH: "Ohio",
        OK: "Oklahoma",
        OR: "Oregon",
        PA: "Pennsylvania",
        RI: "Rhode Island",
        SC: "South Carolina",
        SD: "South Dakota",
        TN: "Tennessee",
        TX: "Texas",
        UT: "Utah",
        VT: "Vermont",
        VA: "Virginia",
        WA: "Washington",
        WV: "West Virginia",
        WI: "Wisconsin",
        WY: "Wyoming"
    };
      

    // console.log(stateName);

    let url;

    if (validStateNames.includes(stateName)) {
        // console.log("Valid State Name");
        url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)},${encodeURIComponent(stateName)}&limit=${limit}&appid=${apiKey}`;
    } else if (Object.keys(stateAbbreviations).includes(stateName)) {
        url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)},${encodeURIComponent(stateAbbreviations[stateName])}&limit=${limit}&appid=${apiKey}`;
    } else { 
        // console.log("Invalid State Name");
        url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=${limit}&appid=${apiKey}`;
    } 

    // console.log("API URL:", url);

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching coordinate data:', error); 
        res.status(500).send('Error fetching coordinate data');
    }
});

app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${encodeURIComponent(apiKey)}&units=imperial`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching weather data:', error); 
        res.status(500).send('Error fetching weather data');
    }
});

// Creation:
app.post('/api/addPreference', async (req, res, next) => {
    client.connect();
    
    let { userId, weatherCondition, genre } = req.body;

    userId = userId ? new ObjectId(String(userId)) : '';

    const weatherResponse = await axios.get('http://localhost:5000/api/getWeatherCondition', {
        params : {
            weatherName:weatherCondition,
        },
    });

    let weatherId = new ObjectId(String(weatherResponse.data));

    if (genre.length > 5) {
        return res.status(400).json({
            error: "You can only associate up to 5 genres with a single weather condition.", // Respond with an error message.
        });
    }
    const genreResponses = [];

    for (let g of genre) {
        const genreResponse = await axios.get('http://localhost:5000/api/getGenreId', {
            params : {
                genreName:g,
            },
        });

        let genre_objectId = new ObjectId(String(genreResponse.data));

        genreResponses.push(genre_objectId);
    }    

    const newPref = { user_id:userId,  weatherCondition:weatherId, associatedGenres:genreResponses};

    const db = client.db();

    try {
        const existingPreference = await db.collection('UserPreference').findOne({
            user_id: userId,
            weatherCondition: weatherId,
        });

        if (existingPreference) {
            return res.status(400).json({
                error: "Preference for this weather condition already exists. Use the update endpoint to modify it.", // Respond with an error message.
            });
        }

        const result_addpref = await db.collection('UserPreference').insertOne(newPref);
        console.log(`User Preference inserted with _id: ${result_addpref.insertedId}`);

        const result_updateuser = await db.collection('Users').updateOne(
            { _id : userId},
            { $push: { preferences : result_addpref.insertedId}}
        );

        res.status(201).json({
            message: "Preference added successfully.", // Success message.
            preferenceId: result_addpref.insertedId, // Return the new preference ID.
        });

    } catch(err) {
        console.error('Error inserting document:', err);
    }
});

app.post('/api/updatePreference', async (req, res, next) => {
    client.connect();

    let { userId, weatherCondition, genre } = req.body;

    userId = userId ? new ObjectId(String(userId)) : '';

    const weatherResponse = await axios.get('http://localhost:5000/api/getWeatherCondition', {
        params : {
            weatherName:weatherCondition,
        },
    });

    let weatherId = new ObjectId(String(weatherResponse.data));

    if (genre.length > 5) {
        return res.status(400).json({
            error: "You can only associate up to 5 genres with a single weather condition.", // Respond with an error message.
        });
    }

    const genreResponses = [];

    for (let g of genre) {
        const genreResponse = await axios.get('http://localhost:5000/api/getGenreId', {
            params : {
                genreName:g,
            },
        });

        let genre_objectId = new ObjectId(String(genreResponse.data));

        genreResponses.push(genre_objectId);
    }    

    const newPref = { user_id:userId,  weatherCondition:weatherId, associatedGenres:genreResponses};

    console.log(newPref);

    const db = client.db();

    try {
        const result_updatepref = await db.collection('UserPreference').updateOne(
            { user_id: userId, weatherCondition:weatherId },
            { $set: { associatedGenres :  genreResponses } }
        );

        if (result_updatepref.acknowledged) {
            res.status(201).json({
                message: "Preference updated successfully.", // Success message.
                preference_ack: result_updatepref.acknowledged, // Return the updated preference acknowledgement.
            });
        } else {
            res.status(404).json({
                message: "Preference did not update successfully.", // Success message.
                preference_ack: result_updatepref.acknowledged, // Return the updated preference acknowledgement.
            });
        }
        
    } catch(err) {
        console.error('Error updating document:', err);
    }
});

app.get('/api/getPreference', async (req, res, next) => {
    client.connect();

    let { userId, weatherCondition } = req.query;

    userId = userId ? new ObjectId(String(userId)) : '';

    const atmosphere_list = ["Mist", "Smoke", "Haze", "Dust", "Fog", "Sand", "Dust", "Ash", "Squall", "Tornado"];

    if (weatherCondition == 'Drizzle' || weatherCondition == 'Thunderstorm' || weatherCondition == 'Rain'){
        weatherCondition = 'rainy';
    } else if (weatherCondition == 'Snow') {
        weatherCondition = 'snowy';
    } else if (weatherCondition == 'Clouds' || atmosphere_list.includes(weatherCondition)){
        weatherCondition = 'cloudy';
    } else if (weatherCondition == 'Clear') {
        weatherCondition = 'sunny';
    }

    const weatherResponse = await axios.get('http://localhost:5000/api/getWeatherCondition', {
        params : {
            weatherName:weatherCondition,
        },
    });

    let weatherId = new ObjectId(String(weatherResponse.data));

    const db = client.db();
    const collection = db.collection('UserPreference');

    try {
        console.log(`About to search: ${weatherId}`);
        const result = await collection.findOne(
            { 
                "user_id" : userId,
                "weatherCondition": weatherId
            }
        );

        if (result) {
            let genreArray = result.associatedGenres;

            let genreNames = [];

            for (let g of genreArray) {
                const genreResponse = await axios.get('http://localhost:5000/api/getGenreName', {
                    params : {
                        genreId:g,
                    },
                });

                let genreName = genreResponse.data;

                genreNames.push(genreName);
            }

            res.status(200).json(genreNames);
        } else { 
            console.log('Did not get preferences');
            res.status(200).json(false);
        }
    } catch(err) {
        console.error('Error getting preferences:', err);
        res.status(404);
    }
});

app.get('/api/getPreferenceGenreIds', async (req, res, next) => {
    client.connect();

    let { userId, weatherCondition } = req.query;

    userId = userId ? new ObjectId(String(userId)) : '';

    const atmosphere_list = ["Mist", "Smoke", "Haze", "Dust", "Fog", "Sand", "Dust", "Ash", "Squall", "Tornado"];

    if (weatherCondition == 'Drizzle' || weatherCondition == 'Thunderstorm' || weatherCondition == 'Rain'){
        weatherCondition = 'rainy';
    } else if (weatherCondition == 'Snow') {
        weatherCondition = 'snowy';
    } else if (weatherCondition == 'Clouds' || atmosphere_list.includes(weatherCondition)){
        weatherCondition = 'cloudy';
    } else if (weatherCondition == 'Clear') {
        weatherCondition = 'sunny';
    }

    const weatherResponse = await axios.get('http://localhost:5000/api/getWeatherCondition', {
        params : {
            weatherName:weatherCondition,
        },
    });

    let weatherId = new ObjectId(String(weatherResponse.data));

    const db = client.db();
    const collection = db.collection('UserPreference');

    try {
        const result = await collection.findOne(
            { 
                "user_id" : userId,
                "weatherCondition": weatherId
            }
        );

        if (result) {
            let genreArray = result.associatedGenres;

            for (let i = 0; i < genreArray.length; i++) {
                // Check if the genre is already a valid ObjectId
                if (!ObjectId.isValid(genreArray[i])) {
                  // If not valid, convert the genre to an ObjectId
                  genreArray[i] = new ObjectId(String(genreArray[i]));
                }
              }

            res.status(200).json(genreArray);
        } else { 
            console.log('Did not get preferences');
            res.status(200).json(false);
        }
    } catch(err) {
        console.error('Error getting preferences:', err);
        res.status(404);
    }
});

app.get('/api/deletePreference', async (req, res, next) => {
    client.connect();

    let { userId, weatherCondition } = req.query;

    userId = userId ? new ObjectId(String(userId)) : '';

    const weatherResponse = await axios.get('http://localhost:5000/api/getWeatherCondition', {
        params : {
            weatherName:weatherCondition,
        },
    });

    let weatherId = new ObjectId(String(weatherResponse.data));

    const db = client.db();
    const collection = db.collection('UserPreference');

    try {
        const docToDelete = await collection.findOne(
            { 
                "user_id" : userId,
                "weatherCondition" : weatherId,
            }
        );

        const result = await collection.deleteOne(
            { 
                "user_id" : userId,
                "weatherCondition" : weatherId,
            }
        );

        const result_updateuser = await db.collection('Users').updateOne(
            { _id : userId},
            { $pull: { preferences : docToDelete._id}}
        );
        
        if (result.acknowledged && result_updateuser) {
            console.log("Return status 200");
            res.status(200).json(true);
        }
    } catch (error) {
        console.log(`Error deleting preference: ${error}`);
        res.status(404).json(false);
    }
});

app.get('/api/getWeatherCondition', async (req, res, next) => {
    client.connect();

    var error = '';

    let { weatherName } = req.query;

    console.log("inside getWeatherCondition");
    console.log(weatherName);

    const atmosphere_list = ["Mist", "Smoke", "Haze", "Dust", "Fog", "Sand", "Dust", "Ash", "Squall", "Tornado"];

    if (weatherName == 'Drizzle' || weatherName == 'Thunderstorm' || weatherName == 'Rain'){
        weatherName = 'rainy';
    } else if (weatherName == 'Snow') {
        weatherName = 'snowy';
    } else if (weatherName == 'Clouds' || atmosphere_list.includes(weatherName)){
        weatherName = 'cloudy';
    } else if (weatherName == 'Clear') {
        weatherName = 'sunny';
    }

    const db = client.db();

    try {
        const result = await db.collection('WeatherConditions')
                .findOne(
                    { "condition_name": weatherName});
                
        if (result) {
            res.status(200).json(result._id);
        } else {
            res.status(200).json('');
        }
     
    } catch (error) {
        console.log('Error occurred during query:', error);
        res.status(404).json('');
    }

});

app.get('/api/getGenreId', async (req, res, next) => {
    client.connect();

    var error = '';

    let { genreName } = req.query;

    genreName = genreName ? String(genreName).trim() : '';

    const db = client.db();

    const result = await db.collection('Genre')
                    .findOne({ "genre_id": genreName});

    if (result) {
        res.status(200).json(result._id);
    } else {
        res.status(404).json('')
    }
});

app.get('/api/getGenreName', async (req, res, next) => {    
    client.connect();

    var error = '';
    
    let genreId = req.query.genreId;

    genreId = genreId ? new ObjectId(String(genreId)) : '';

    const db = client.db();

    const result = await db.collection('Genre')
                    .findOne({ "_id": genreId});

    if (result) {
        res.status(200).json(result.genre_id);
    } else {
        res.status(404).json('')
    }
});

app.get('/api/getUser', async (req, res, next) => {
    client.connect();
    
    let userId = req.query.userId;

    userId = userId ? new ObjectId(String(userId)) : '';

    const db = client.db();

    const result = await db.collection('Users')
                    .findOne({ "_id": userId});

    if (result) {
        res.status(200).json(result);
    } else {
        res.status(404).json(result)
    }
});

app.post('/api/playlist', async (req, res) => {
    const db = client.db('Rhythm');

    let { userId, weatherCondition} = req.body; // New endpoint for generating Spotify playlists
    
    userId = userId ? new ObjectId(String(userId)) : '';

    try {    
        const atmosphere_list = ["Mist", "Smoke", "Haze", "Dust", "Fog", "Sand", "Dust", "Ash", "Squall", "Tornado"];

        if (weatherCondition == 'Drizzle' || weatherCondition == 'Thunderstorm' || weatherCondition == 'Rain'){
            weatherCondition = 'rainy';
        } else if (weatherCondition == 'Snow') {
            weatherCondition = 'snowy';
        } else if (weatherCondition == 'Clouds' || atmosphere_list.includes(weatherCondition)){
            weatherCondition = 'cloudy';
        } else if (weatherCondition == 'Clear') {
            weatherCondition = 'sunny';
        }

        try {
            const response = await axios.get('http://localhost:5000/api/getPreference', {
                params:{
                    userId:userId,
                    weatherCondition:weatherCondition,
                },
            });

            // console.log("Just got preference in playlist api: ", response.data);

            const genreNames = response.data;

            if (genreNames.length === 0) {
                console.log("Line 943");
                return res.status(404).send('No genres associated with the current weather condition.'); // Return if no genres found
            }

            // Generate Spotify playlist using user's preferences            
            try {
                // console.log("Now trying to get user...");
                const user = await axios.get('http://localhost:5000/api/getUser', {
                    params:{
                        userId:userId,
                    },
                });

                // console.log("Result from getUser: ", user.data);

                try {
                    let refreshToken = user.data.spotifyRefreshToken;
                    let clientId = process.env.SPOTIFY_CLIENT_ID;
                    let clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

                    // console.log("Refresh Token:", refreshToken);
                    // console.log("ClientId: ", clientId);
                    // console.log("ClientSecret:", clientSecret);

                    // console.log('Trying to get new access token...');

                    // New technique to keep getting new access tokens - Joanne
                    try {
                        const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
                        // console.log('Base64 Encoded Credentials:', base64Credentials);
                        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
                            grant_type: 'refresh_token',  // Correct grant_type
                            refresh_token: refreshToken   // Your existing refresh token
                        }), {
                            headers: {
                                'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
                                'Content-Type': 'application/x-www-form-urlencoded' // Ensure content type is correctly set
                            }
                        });
                        // console.log('Token response:', tokenResponse.data);  // Inspect the response
                    
                        const spotifyToken = tokenResponse.data.access_token;

                        // console.log("New Access Token:", spotifyToken);

                        let userProfile = '';

                        try {
                            const userProf = await axios.get('https://api.spotify.com/v1/me', {
                                headers: {
                                    Authorization: `Bearer ${spotifyToken}`
                                }
                            });
                            userProfile = userProf;
                            console.log('USER PROFILE:', userProf.data);
                        } catch (apiError) {
                            console.error('Error using the new token:', apiError.response ? apiError.response.data : apiError.message);
                        }

                        if (!spotifyToken) {
                            console.log("!spotifyToken triggered");
                            return res.status(401).send('Spotify token missing or invalid. Please reauthenticate.'); // Check for valid Spotify token
                        }

                        // console.log("About to make spotify API call...");
                        // console.log("GENRENAMES::", genreNames);
                        // console.log("seed_genres: ", genreNames.join(','));

                        try {
                            const encodedGenres = encodeURIComponent(genreNames.join(','));

                            const search_url = `https://api.spotify.com/v1/search?q=genre:${encodedGenres}&type=track&limit=10`;

                            try {
                                const response = await fetch(search_url, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `Bearer ${spotifyToken}`,
                                        'Content-Type': 'application/json'
                                    }
                                });
                                const data = await response.json();  // Convert response to JSON
                                                
                                // Process and return the tracks
                                const tracks = data.tracks.items;

                                // Create an array to hold the song objects
                                const songs = [];

                                // console.log(tracks);

                                const trackUrls = tracks.map((track) => track.external_urls.spotify);

                                // Convert URLs to Spotify URIs
                                const trackURIs = trackUrls.map(url => {
                                const trackId = url.split('/track/')[1];  // Extract the track ID from the URL
                                return `spotify:track:${trackId}`;  // Return the formatted URI
                                });
                                
                                console.log(trackURIs);
                                  
                                // Create a Spotify playlist
                                try {
                                    // console.log("About to try making playlist... user id:", userProfile.data.id);
                                    const playlistResponse = await axios.post(
                                        `https://api.spotify.com/v1/users/${userProfile.data.id}/playlists`,
                                        {
                                            name: `Weather-based Playlist (${weatherCondition})`,
                                            description: `A playlist based on the current weather: ${weatherCondition}`, // Playlist description includes weather condition
                                            public: false,
                                        },
                                        {
                                            headers: { Authorization: `Bearer ${spotifyToken}` },
                                        }
                                    );

                                    const playlistId = playlistResponse.data.id; // Get created playlist ID
                                    const spotify_url = playlistResponse.data.external_urls.spotify;

                                    console.log("Playlist id: ", playlistId);

                                    try {
                                        // Add tracks to the playlist
                                        await axios.post(
                                            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                                            { uris: trackURIs }, // Add recommended tracks to the playlist
                                            { headers: { Authorization: `Bearer ${spotifyToken}` } }
                                        );
                                        console.log("Tracks Added");

                                        let songs_ids = [];

                                        for (item of tracks) {
                                            // Assume that each item is from tracks
                                            const songEntry = {
                                                track_id: item.id,
                                                track_name: item.name, 
                                                artist_name: item.artists[0].name, 
                                                artist_id: item.artists[0].id, 
                                                album_name: item.album.name, 
                                                album_id: item.album.id, 
                                                album_image_url: item.album.images[0].url,
                                                track_url: item.external_urls.spotify,
                                                duration: item.duration_ms
                                            };

                                            songs.push(songEntry);

                                            // console.log("Song Entry:");
                                            // console.log(songEntry);

                                            try {
                                                const existingSong = await db.collection('Song').findOne({ track_id: songEntry.track_id });

                                                if (!existingSong) {
                                                    try {
                                                        const song_insert_result = await db.collection('Song').insertOne(songEntry);
                                                    
                                                        if (song_insert_result.acknowledged) {
                                                            console.log('Song inserted with id:', song_insert_result.insertedId);
                                                            songs_ids.push(song_insert_result.insertedId)
                                                        } else {
                                                            console.log('Song was not successfully added');
                                                        }
                                                    } catch (err) {
                                                        if (error.code === 11000) {
                                                            console.log('Duplicate entry: A song with this _id already exists.');
                                                        } else {
                                                            console.error('Error inserting song:', error);
                                                        }
                                                    }                                            
                                                } else {
                                                    console.log("Song already in database");
                                                    songs_ids.push(existingSong._id)
                                                }
            
                                            } catch (error) {
                                                console.log("Error finding song in database", error);
                                            }
                                        }

                                        const weatherResponse = await axios.get('http://localhost:5000/api/getWeatherCondition', {
                                            params : {
                                                weatherName:weatherCondition,
                                            },
                                        });

                                        const genre_id_response = await axios.get('http://localhost:5000/api/getPreferenceGenreIds', {
                                            params:{
                                                userId:userId,
                                                weatherCondition:weatherCondition,
                                            },
                                        });

                                        let genreIds = genre_id_response.data;
                                        let genreObjectIds = [];

                                        for (g of genreIds) {
                                            genreObjectIds.push(new ObjectId(String(g)));
                                        }

                                        // Save playlist to database
                                        const playlistDbEntry = {
                                            user_id: userId,
                                            genres: genreObjectIds, // Genres associated with the playlist
                                            weatherConditions: new ObjectId(String(weatherResponse.data)), // Weather condition associated with the playlist
                                            songs: songs_ids,
                                            date: new Date(), // Timestamp of playlist creation
                                        };

                                        console.log(playlistDbEntry);

                                        try {
                                            const existingPlaylist = await db.collection('Playlist').findOne({ 
                                                user_id: userId,
                                                genres: genreObjectIds, 
                                                weatherConditions: new ObjectId(String(weatherResponse.data)),
                                                songs: songs_ids,
                                            });

                                            if (!existingPlaylist) {
                                                try {
                                                    const playlist_insert_result = await db.collection('Playlist').insertOne(playlistDbEntry);
                                                
                                                    if (playlist_insert_result.acknowledged) {
                                                        console.log('Playlist inserted with id:', playlist_insert_result.insertedId);
                                                        // Process the successful response here (e.g., display the recommendations)
                                                        res.json({
                                                            id: playlist_insert_result.insertedId.toString(),
                                                            user_id: userId.toString(),
                                                            genres: genreNames,
                                                            weatherConditions: [weatherCondition],
                                                            songs: songs,
                                                            date: new Date(),
                                                            spotify_url: spotify_url
                                                        });
                                                    } else {
                                                        console.log('Playlist was not successfully added');
                                                    }
                                                } catch (err) {
                                                    if (error.code === 11000) {
                                                        console.log('Duplicate entry: A playlist with this _id already exists.');
                                                    } else {
                                                        console.error('Error inserting playlist:', error);
                                                    }
                                                }                                            
                                            } else {
                                                console.log("Playlist already in database");
                                                // Process the successful response here (e.g., display the recommendations)
                                                res.json({
                                                    id: existingPlaylist._id.toString(),
                                                    user_id: userId.toString(),
                                                    genres: genreNames,
                                                    weatherConditions: [weatherCondition],
                                                    songs: songs,
                                                    date: new Date(),
                                                    spotify_url: spotify_url
                                                });
                                            }

                                        } catch (error) {
                                            console.log("Error finding song in database", error);
                                        }

                                    } catch(err) {
                                        console.log("Error adding tracks to playlist", err);
                                    }
                                } catch (err) {
                                    console.log("Error making Spotify Playlist", err);
                                }

                            } catch (error) {
                                console.error('SEARCH ERROR:', error);
                            }
                        
                            
                        } catch (error) {

                            console.log("Line 1099");
                            // Display the error message
                            if (error.response) {
                                console.log("Line 1102");
                                // If the server responded with a status other than 2xx
                                console.log('Error Response:', error.response);
                                console.log('Status:', error.response.status);
                                console.log('Headers:', error.response.headers);

                                console.log("Line 1108");
                                
                                // Safely access error message
                                if (error.response.data && error.response.data.error && error.response.data.error.message) {
                                    console.log("Line 1112");
                                    console.log(`Error: ${error.response.data.error.message}`);
                                } else {
                                    console.log("Line 1115");
                                    console.log('Error: Unexpected response structure or missing message.');
                                }
                            } else if (error.request) {
                                console.log("Line 1119");
                                // If no response was received
                                console.log('Error Request:', error.request);
                                console.log('Error: No response received from the server.');
                                console.log("Line 1123");
                            } else {
                                console.log("Line 1125");
                                // If an error occurred while setting up the request
                                console.log('Error Message:', error.message);
                                console.log(`Error: ${error.message}`);
                            }
                        }
                        
                        console.log("Line 1132");

                        

                    } catch (error) {
                        console.log("Line 1137");
                        if (error.response && error.response.data.error === 'invalid_grant') {
                            console.log("Line 1139");
                            console.error('Refresh token has expired or is invalid.');
                            // You may need to request the user to authenticate again
                        } else {
                            console.log("Line 1143");
                            console.error('Error refreshing token:', error.response ? error.response.data : error.message);
                        }                   
                    
                    }

                    console.log("Line 1149");

                } catch(err) {
                    console.log("Line 1152");
                    return res.status(404).send('Playlist Response from Spotify error'); 
                }

                console.log("Line 1156");
                
                
            } catch (error) {
                console.log("Line 1160");
                return res.status(404).send('No user with userId found'); 
            }
            console.log("Line 1163");
        } catch (error) {
            console.log("Line 1165");
            return res.status(404).send('No preferences found for the current weather condition.'); // Return if no preferences are set for the weather condition
        }
        console.log("Line 1168");
    } catch (error) {
        console.log("Line 1170");
        console.error('Error generating Spotify playlist:', error.message); // Log errors
        res.status(500).send('Error generating Spotify playlist'); // Send error response
        console.log("Line 1173");
    }
});

app.listen(5000,'0.0.0.0', () => {
    console.log('Server running on port 5000 and listening on all interfaces');
});




