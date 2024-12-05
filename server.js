const axios = require('axios');

// put dotenv in the top
const dotenv = require('dotenv'); 
dotenv.config();

// const { MongoClient } = require('mongodb');
// const { MongoClient, ObjectId } = require('mongodb'); // CORA: Added MongoDB integration to access user preferences, genres, and playlists
// const url = `mongodb+srv://qidiwang:${process.env.DATABASE_PASSWORD}@cluster0.4asd5.mongodb.net/Rhythm?retryWrites=true&w=majority&appName=Cluster0`
// const client = new MongoClient(url);
// db_name = process.env.DB_NAME;



const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
// const axios = require('axios')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');// const mongoose = require('mongoose');
// const { ObjectId } = mongoose.Types;
const SpotifyWebApi = require('spotify-web-api-node');
app.use(cors());
// Allow CORS for all origins (or specify your frontend origin)

// app.use(cors({
//     origin: 'http://localhost:5173',  // Update this with your frontend URL
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],  // Customize as needed
//   }));

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

// const uri = "mongodb+srv://ayeshamalik6312:15Q7Ppq14HvqBrVF@rhythmcluster.azwsf.mongodb.net/?retryWrites=true&w=majority&appName=RhythmCluster";

const uri = `mongodb+srv://qidiwang:${process.env.DATABASE_PASSWORD}@cluster0.4asd5.mongodb.net/Rhythm?retryWrites=true&w=majority&appName=Cluster0`
const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
connectToDatabase();


// Check if the access token is expired, and refresh it if necessary
async function getAccessToken(userId) {

    userId = userId ? new ObjectId(String(userId)) : '';

    const db = client.db('Rhythm');
    const usersCollection = db.collection('Users');

    const user = await usersCollection.findOne({ _id: userId });
    if (!user) {
        throw new Error('User not found');
    }

    const { spotifyAccessToken, spotifyRefreshToken, accessTokenExpiration } = user;

    // Check if the access token is expired
    if (Date.now() > accessTokenExpiration) {
        console.log('Access token expired, refreshing token...');

        // If expired, refresh the access token using the refresh token
        try {
            const data = await spotifyApi.refreshAccessToken();
            const newAccessToken = data.body['access_token'];
            spotifyApi.setAccessToken(newAccessToken);

            // Update the new access token and expiration time in the database
            const expiresIn = data.body['expires_in'];
            await usersCollection.updateOne(
                { _id: userId },
                {
                    $set: {
                        spotifyAccessToken: newAccessToken,
                        accessTokenExpiration: Date.now() + expiresIn * 1000,
                    },
                }
            );

            console.log('Access token refreshed');
            return newAccessToken;
        } catch (error) {
            console.error('Error refreshing access token:', error);
            throw new Error('Error refreshing access token');
        }
    }

    // If the token is still valid, return the current access token
    return spotifyAccessToken;
}


// Initialize Spotify API Client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: 'http://localhost:5000/callback',
    //redirectUri: 'http://54.89.11.234:5000/callback',
});

console.log("Spotify Client ID:", process.env.SPOTIFY_CLIENT_ID);
console.log("Spotify Client Secret:", process.env.SPOTIFY_CLIENT_SECRET);


app.use(bodyParser.json());

// Spotify Login Route
app.get('/login', (req, res) => {
    const scopes = ['user-read-private', 'user-read-email'];
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    res.redirect(authorizeURL);
});

// Spotify Callback Route
// Spotify Callback Route
// Spotify Callback Route
app.get('/callback', async (req, res) => {
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

        // If we successfully get user info, the access token is valid
        const spotifyId = userInfo.body.id;
        const displayName = userInfo.body.display_name;
        const email = userInfo.body.email;

        const db = client.db('Rhythm');
        const usersCollection = db.collection('Users');

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
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${encodeURIComponent(apiKey)}&units=imperial`;

    // console.log("Constructed URL:", url);

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
    // Assumes that the function calling this function checked if a preference for
    // this weather condition exists or not. If does not exist, call this function
    // if it does exist, call updatePreference instead
    
    // assumes an array of genres of size at least 1 is passed for one weatherCondition for one user
    // userId is an objectId. weatherCondition should be used to get objectId. Same with genre

    console.log('Inside addPreference');

    // Remember, another part of this is I need to add the preference to the user in Users
    // To add it to the Users collection, essentially swap _id and user_id
    // On second thought, adding preference is updating the already existing user in Users
        
    client.connect();

    // Assumes that the userId passed is already and ObjectId()
    
    let { userId, weatherCondition, genre } = req.body;

    userId = userId ? new ObjectId(String(userId)) : '';

    console.log('The following are the inputs to addPreference');
    console.log(`userId: ${userId}`);
    console.log(`weatherCondition: ${weatherCondition}`);
    console.log(`genre: ${genre}`);

    const weatherResponse = await axios.get('http://localhost:5000/api/getWeatherCondition', {
        params : {
            weatherName:weatherCondition,
        },
    });

    // Now we successfully get the weather object id back
    // console.log("Weather response:");
    // console.log(weatherResponse.data);

    let weatherId = new ObjectId(String(weatherResponse.data));

    // res.send('Preference added');

    // const genreArray = genre.split(" ");
    // console.log(genre_array);

    // CORA: Added a check to ensure no more than 5 genres are submitted.
    if (genre.length > 5) {
        return res.status(400).json({
            error: "You can only associate up to 5 genres with a single weather condition.", // Respond with an error message.
        });
    }

    // console.log("genre array: ", genre);

    const genreResponses = [];

    // Assumes genre is an array of at least one item
    for (let g of genre) {
        // console.log(g)
        const genreResponse = await axios.get('http://localhost:5000/api/getGenreId', {
            params : {
                genreName:g,
            },
        });

        console.log(genreResponse.data);

        let genre_objectId = new ObjectId(String(genreResponse.data));

        // console.log("Genre object id", genre_objectId);

        genreResponses.push(genre_objectId);
    }

    console.log("While in add preference, got the genreResponses:",genreResponses);
    

    const newPref = { user_id:userId,  weatherCondition:weatherId, associatedGenres:genreResponses};

    console.log("New preference to add: ", newPref);

    const db = client.db();

    try {

        console.log("About to check if preference exists...");

        // CORA: Check if a preference for this weather condition already exists for the user.
        const existingPreference = await db.collection('UserPreference').findOne({
            user_id: userId,
            weatherCondition: weatherId,
        });

        if (existingPreference) {
            return res.status(400).json({
                error: "Preference for this weather condition already exists. Use the update endpoint to modify it.", // Respond with an error message.
            });
        }

        console.log("Just confirmed preference does not exist...");

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
    // Takes in the userId and updates the genre list with tne new genre list
    client.connect();

    // Updating the preference should change the list of genres in UserPreference
    // it might also need to change the list in Users?

    let { userId, weatherCondition, genre } = req.body;

    userId = userId ? new ObjectId(String(userId)) : '';

    const weatherResponse = await axios.get('http://localhost:5000/api/getWeatherCondition', {
        params : {
            weatherName:weatherCondition,
        },
    });

    // Now we successfully get the weather object id back

    let weatherId = new ObjectId(String(weatherResponse.data));

    // res.send('Preference added');

    // const genreArray = genre.split(" ");
    // console.log(genre_array);

    // CORA: Added a check to ensure no more than 5 genres are submitted.
    if (genre.length > 5) {
        return res.status(400).json({
            error: "You can only associate up to 5 genres with a single weather condition.", // Respond with an error message.
        });
    }

    const genreResponses = [];

    // Assumes genre is an array of at least one item
    for (let g of genre) {
        // console.log(g)
        const genreResponse = await axios.get('http://localhost:5000/api/getGenreId', {
            params : {
                genreName:g,
            },
        });


        let genre_objectId = new ObjectId(String(genreResponse.data));

        // console.log(genre_objectId);

        genreResponses.push(genre_objectId);
    }

    // console.log(genreResponses);
    

    const newPref = { user_id:userId,  weatherCondition:weatherId, associatedGenres:genreResponses};

    console.log(newPref);

    const db = client.db();

    try {
        // $set replaces the old value with the new one
        const result_updatepref = await db.collection('UserPreference').updateOne(
            { user_id: userId, weatherCondition:weatherId },
            { $set: { associatedGenres :  genreResponses } }
        );

        // Since it exists already, the inserted id should already be in Users so don't need to call this
        // const result_updateuser = await db.collection('Users').updateOne(
        //     { _id : userId},
        //     { $push: { preferences : result_addpref.insertedId}}
        // );
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

    console.log("Inside getPreference");

    console.log(req);

    // Gets the list of genres when given weather name
    let { userId, weatherCondition } = req.query;

    console.log("userId:", userId);
    console.log("weatherCondition", weatherCondition)

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

    console.log("weatherResponse:", weatherResponse.data);

    let weatherId = new ObjectId(String(weatherResponse.data));
    // console.log("weatherId gained from search: ", weatherId);


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

        // console.log("weatherId: ", weatherId);
        // console.log(result);

        if (result) {
            console.log('Successfully got preferences');

            let genreArray = result.associatedGenres;

            console.log("passed associated genres: ", genreArray);

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

            console.log(genreNames);

            // console.log(genreNames);
            res.status(200).json(genreNames);
        } else { 
            console.log('Did not get preferences');
            res.status(200).json(false);
            // console.log(userId);
        }
    } catch(err) {
        console.error('Error getting preferences:', err);
        res.status(404);
    }
});

app.get('/api/deletePreference', async (req, res, next) => {
    // The following API endpoint deletes the entire document,
    // in other words, it deletes all of the preferences tied to a specific weather pattern
    // If the user wants to delete genres from their preference, they should use update instead

    // Input should be the name of the weatherCondition and the ObjectId of the user's id
    // Delete is done, Add is also done. Get doesn't need to refer to Users. Just need to work on Update.

    client.connect();


    let { userId, weatherCondition } = req.query;

    userId = userId ? new ObjectId(String(userId)) : '';

    const weatherResponse = await axios.get('http://localhost:5000/api/getWeatherCondition', {
        params : {
            weatherName:weatherCondition,
        },
    });

    let weatherId = new ObjectId(String(weatherResponse.data));

    // console.log("Inside delete preference");
    // console.log(userId);
    // console.log(weatherId);


    const db = client.db();
    const collection = db.collection('UserPreference');

    try {
        // console.log(`User Id: ${userId}, weatherCondition: ${weatherId}`);

        const docToDelete = await collection.findOne(
            { 
                "user_id" : userId,
                "weatherCondition" : weatherId,
            }
        );

        // console.log("doc to delete:");
        // console.log(docToDelete)

        const result = await collection.deleteOne(
            { 
                "user_id" : userId,
                "weatherCondition" : weatherId,
            }
        );

        // console.log("Result from deletion");
        // console.log(result);

        const result_updateuser = await db.collection('Users').updateOne(
            { _id : userId},
            { $pull: { preferences : docToDelete._id}}
        );

        // console.log("Update user result");
        // console.log(result_updateuser);

        // console.log("Acknowledged:");
        // console.log(result.acknowledged);
        
        if (result.acknowledged && result_updateuser) {
            console.log("Return status 200");
            // have to add a value to return via json
            res.status(200).json(true);
        }

        // console.log("Outside if statement");
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

    // weatherName = weatherName ? String(weatherName).trim() : '';

    // console.log("Searching id of: ", weatherName);

    // if statement to string together weather api response to database names

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

    // console.log("After Conversion", weatherName);

    const db = client.db();

    try {
        const result = await db.collection('WeatherConditions')
                .findOne(
                    { "condition_name": weatherName});
                

        // console.log(result);

        if (result) {
            // var ret = { resultId:result._id, error:error };
            // console.log(ret)
            // res.status(200).json(ret);
            res.status(200).json(result._id);
        } else {
            // error = '_id of weather condition is null';
            // var ret = { resultId:result, error:error };
            // // console.log(ret)
            // res.status(404).json(ret)
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

    // console.log("genreName: ", genreName);

    const db = client.db();

    const result = await db.collection('Genre')
                    .findOne({ "genre_id": genreName});

    // console.log(result);

    if (result) {
        // var ret = { resultId:result._id, error:error };
        res.status(200).json(result._id);
    } else {
        // error = '_id of genre is null';
        // var ret = { resultId:result, error:error };
        res.status(404).json('')
    }
});

app.get('/api/getGenreName', async (req, res, next) => {    
    client.connect();

    var error = '';
    
    // Since req.query.genreId is just one value, no need for {} to do destructuring
    let genreId = req.query.genreId;

    genreId = genreId ? new ObjectId(String(genreId)) : '';

    // console.log(`Genre Id: ${genreId}`);



    const db = client.db();

    const result = await db.collection('Genre')
                    .findOne({ "_id": genreId});

    console.log("Result that it found:", result);

    if (result) {
        // var ret = { genreName:result.genre_name, error:error };
        // console.log(ret);
        res.status(200).json(result.genre_id);
    } else {
        // error = '_id of genre is null';
        // var ret = { genreName:result, error:error };
        res.status(404).json('')
    }
});

app.get('/api/getUser', async (req, res, next) => {
    client.connect();
    
    // Since req.query.genreId is just one value, no need for {} to do destructuring
    let userId = req.query.userId;

    userId = userId ? new ObjectId(String(userId)) : '';

    const db = client.db();

    const result = await db.collection('Users')
                    .findOne({ "_id": userId});

    // console.log(result);

    if (result) {
        res.status(200).json(result);
    } else {
        res.status(404).json(result)
    }
});

// CORA: Spotify playlist generation
app.post('/api/playlist', async (req, res) => {
    // const { userId, lat, lon , weatherCondition} = req.body; // New endpoint for generating Spotify playlists
    let { userId, weatherCondition} = req.body; // New endpoint for generating Spotify playlists
    
    console.log("Inside playlist endpoint with parameters: ", userId, weatherCondition);


    try {
        // Fetch weather data for the user's location
        // const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${process.env.OPENWEATHERMAP_API_KEY}`);
        // const weatherData = weatherResponse.data;

        // const weatherCondition = weatherData.weather[0].main.toLowerCase(); // Extract weather condition (e.g., "rainy")
        // console.log(`Current weather condition: ${weatherCondition}`);

        // const userPreferences = await db.collection('UserPreference').findOne({ user_id: new ObjectId(userId), weatherCondition });
        // if (!userPreferences) {
        //     return res.status(404).send('No preferences found for the current weather condition.'); // Return if no preferences are set for the weather condition
        // }

        // const genreIds = userPreferences.associatedGenres; // Fetch genres associated with this weather condition
        // const genreNames = [];
        // for (let genreId of genreIds) {
        //     const genre = await db.collection('Genre').findOne({ _id: new ObjectId(genreId) }); // Retrieve genre names from Genre collection
        //     if (genre) genreNames.push(genre.genre_name);
        // }
            
        const atmosphere_list = ["Mist", "Smoke", "Haze", "Dust", "Fog", "Sand", "Dust", "Ash", "Squall", "Tornado"];

        console.log("Line 903");

        if (weatherCondition == 'Drizzle' || weatherCondition == 'Thunderstorm' || weatherCondition == 'Rain'){
            weatherCondition = 'rainy';
        } else if (weatherCondition == 'Snow') {
            weatherCondition = 'snowy';
        } else if (weatherCondition == 'Clouds' || atmosphere_list.includes(weatherCondition)){
            weatherCondition = 'cloudy';
        } else if (weatherCondition == 'Clear') {
            weatherCondition = 'sunny';
        }

        console.log("Line 915");


        console.log("After Conversion", weatherCondition);

        console.log("Line 920");

        // Retrieve user preferences for the current weather condition

        try {
            console.log("Line 925");
            // getPreference handles getting the genre ids returns an array of the corresponding names of those genres
            const response = await axios.get('http://localhost:5000/api/getPreference', {
                params:{
                    userId:userId,
                    weatherCondition:weatherCondition,
                },
            });

            console.log("Line 934");

            console.log("Just got preference in playlist api: ", response.data);

            const genreNames = response.data;

            console.log("Line 940");

            if (genreNames.length === 0) {
                console.log("Line 943");
                return res.status(404).send('No genres associated with the current weather condition.'); // Return if no genres found
            }

            console.log("Line 947");

            // Generate Spotify playlist using user's preferences
            // const user = await db.collection('User').findOne({ _id: new ObjectId(userId) }); // Retrieve user data for Spotify integration
            
            try {
                console.log("Line 953");
                console.log("Now trying to get user...");
                const user = await axios.get('http://localhost:5000/api/getUser', {
                    params:{
                        userId:userId,
                    },
                });

                console.log("Line 961");

                // console.log("Result from getUser: ", user.data);

                try {
                    console.log("Line 966");
                    let refreshToken = user.data.spotifyRefreshToken;
                    let clientId = process.env.SPOTIFY_CLIENT_ID;
                    let clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

                    console.log("Line 971");

                    console.log("Refresh Token:", refreshToken);
                    console.log("ClientId: ", clientId);
                    console.log("ClientSecret:", clientSecret);

                    console.log('Trying to get new access token...');

                    // New technique to keep getting new access tokens - Joanne
                    try {
                        console.log("Line 981");
                        const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
                        console.log("Line 983");
                        console.log('Base64 Encoded Credentials:', base64Credentials);
                        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
                            grant_type: 'refresh_token',  // Correct grant_type
                            refresh_token: refreshToken   // Your existing refresh token
                        }), {
                            headers: {
                                'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
                                'Content-Type': 'application/x-www-form-urlencoded' // Ensure content type is correctly set
                            }
                        });
                        console.log("Line 994");
                        console.log('Token response:', tokenResponse.data);  // Inspect the response
                    
                        const spotifyToken = tokenResponse.data.access_token;

                        console.log("Line 999");

                        console.log("New Access Token:", spotifyToken);

                        if (!spotifyToken) {
                            console.log("Line 1004");
                            console.log("!spotifyToken triggered");
                            return res.status(401).send('Spotify token missing or invalid. Please reauthenticate.'); // Check for valid Spotify token
                        }

                        console.log("Line 1009");

                        console.log("About to make spotify API call...");
                        console.log("seed_genres: ", genreNames.join(','));

                        console.log("Line 1014");
                        try {
                            console.log("Line 1016");
                            const spotifyResponse = await axios.get('https://api.spotify.com/v1/recommendations', {
                                headers: { Authorization: `Bearer ${spotifyToken}` },
                                params: {
                                    seed_genres: genreNames.join(','), // Use genres as seed parameters
                                    limit: 20,
                                },
                            });

                            console.log("Line 1025");


                            console.log("Spotify Response:");
                            console.log(spotifyResponse.data);

                            console.log("Line 1031");

                            const tracks = spotifyResponse.data.tracks; // Fetch recommended tracks
                            console.log("Line 1034");
                            const trackUris = tracks.map((track) => track.uri); // Extract track URIs

                            console.log("Line 1037");

                            // Create a Spotify playlist
                            const playlistResponse = await axios.post(
                                `https://api.spotify.com/v1/users/${user.spotifyId}/playlists`,
                                {
                                    name: `Weather-based Playlist (${weatherCondition})`,
                                    description: `A playlist based on the current weather: ${weatherCondition}`, // Playlist description includes weather condition
                                    public: false,
                                },
                                {
                                    headers: { Authorization: `Bearer ${spotifyToken}` },
                                }
                            );
                            console.log("Line 1051");

                            const playlistId = playlistResponse.data.id; // Get created playlist ID

                            console.log("Line 1055");

                            try {
                                console.log("Line 1058");
                                // Add tracks to the playlist
                                await axios.post(
                                    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                                    { uris: trackUris }, // Add recommended tracks to the playlist
                                    { headers: { Authorization: `Bearer ${spotifyToken}` } }
                                );
                                console.log("Line 1065");

                                // Save playlist to database
                                const playlistDbEntry = {
                                    user_id: userId,
                                    genres: genreIds, // Genres associated with the playlist
                                    weatherConditions: weatherCondition, // Weather condition associated with the playlist
                                    songs: tracks.map((track) => ({
                                        track_id: track.id,
                                        track_name: track.name,
                                        artist_name: track.artists[0].name, // Save song metadata
                                    })),
                                    date: new Date(), // Timestamp of playlist creation
                                };

                                console.log("Line 1080");

                                const result = await db.collection('Playlist').insertOne(playlistDbEntry); // Save playlist data to Playlist collection

                                console.log("Line 1084");

                                res.json({ success: true, playlistId, dbId: result.insertedId }); // Respond with success and playlist details

                                console.log("Line 1088");
                            } catch(err) {
                                console.log("Line 1090");
                                return res.status(404).send('Error adding tracks to playlist'); 
                            }

                            console.log("Line 1094");
                        
                            // Process the successful response here (e.g., display the recommendations)
                        } catch (error) {

                            console.log("Line 1099");
                            // Display the error message
                            if (error.response) {
                                console.log("Line 1102");
                                // If the server responded with a status other than 2xx
                                console.log('Error Response:', error.response.data);
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




