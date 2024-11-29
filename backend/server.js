const axios = require('axios');

// put dotenv in the top
const dotenv = require('dotenv'); 
dotenv.config(); 

// const { MongoClient } = require('mongodb');
const { MongoClient, ObjectId } = require('mongodb'); // CORA: Added MongoDB integration to access user preferences, genres, and playlists
const url = `mongodb+srv://qidiwang:${process.env.DATABASE_PASSWORD}@cluster0.4asd5.mongodb.net/Rhythm?retryWrites=true&w=majority&appName=Cluster0`
const client = new MongoClient(url);
// db_name = process.env.DB_NAME;



const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

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

    // console.log('Inside addPreference');

    // Remember, another part of this is I need to add the preference to the user in Users
    // To add it to the Users collection, essentially swap _id and user_id
    // On second thought, adding preference is updating the already existing user in Users
    
    
    client.connect();

    // Assumes that the userId passed is already and ObjectId()
    
    let { userId, weatherCondition, genre } = req.body;

    userId = userId ? new ObjectId(String(userId)) : '';

    // console.log(`userId: ${userId}`);
    // console.log(`weatherCondition: ${weatherCondition}`);
    // console.log(`genre: ${genre}`);

    const weatherResponse = await axios.get('http://localhost:5000/api/getWeatherCondition', {
        params : {
            weatherName:weatherCondition,
        },
    });

    // Now we successfully get the weather object id back
    // console.log(weatherResponse.data.resultId);

    let weatherId = new ObjectId(String(weatherResponse.data.resultId));

    // res.send('Preference added');

    const genreArray = genre.split(" ");
    // console.log(genre_array);

    const genreResponses = [];

    // Assumes genre is an array of at least one item
    for (let g of genreArray) {
        // console.log(g)
        const genreResponse = await axios.get('http://localhost:5000/api/getGenreId', {
            params : {
                genreName:g,
            },
        });

        // console.log(genreResponse.data.resultId);

        let genre_objectId = new ObjectId(String(genreResponse.data.resultId));

        // console.log(genre_objectId);

        genreResponses.push(genre_objectId);
    }

    // console.log(genreResponses);
    

    const newPref = { user_id:userId,  weatherCondition:weatherId, associatedGenres:genreResponses};

    console.log(newPref);

    const db = client.db();

    try {
        const result_addpref = await db.collection('UserPreference').insertOne(newPref);
        console.log(`User Preference inserted with _id: ${result_addpref.insertedId}`);

        const result_updateuser = await db.collection('Users').updateOne(
            { _id : userId},
            { $push: { preferences : result_addpref.insertedId}}
        );

    } catch(err) {
        console.error('Error inserting document:', err);
    }
});

app.get('/api/updatePreference', async (req, res, next) => {
    // Takes in the userId and updates the genre list with tne new genre list
    client.connect();

    // Updating the preference should change the list of genres in UserPreference
    // it might also need to change the list in Users?

    let { userId, genreList } = req.query(); 

    userId = userId ? new ObjectId(String(userId)) : '';


});

app.get('/api/getPreference', async (req, res, next) => {
    client.connect();

    // Gets the list of genres when given weather name
    const { userId, weatherCondition } = req.query;

    userId = userId ? new ObjectId(String(userId)) : '';

    const weatherResponse = await axios.get('http://localhost:5000/api/getWeatherCondition', {
        params : {
            weatherName:weatherCondition,
        },
    });

    let weatherId = new ObjectId(String(weatherResponse.data.resultId));


    const db = client.db();
    const collection = db.collection('UserPreference');

    try {
        // console.log(`About to search: ${weatherId}`);
        const result = await collection.findOne(
            { 
                "user_id" : userId,
                "weatherCondition": weatherId
            }
        );

        if (result) {
            console.log('Successfully got preferences');
        } else {
            console.log('Did not get preferences');
            console.log(userId);
        }

        let genreArray = result.associatedGenres;

        // console.log(genreArray);

        let genreNames = [];

        for (let g of genreArray) {
            const genreResponse = await axios.get('http://localhost:5000/api/getGenreName', {
                params : {
                    genreId:g,
                },
            });

            let genreName = genreResponse.data.genreName;

            genreNames.push(genreName);
        }

        // console.log(genreNames);
        res.status(200).json(genreNames);
        

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

    let weatherId = new ObjectId(String(weatherResponse.data.resultId));


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

        const result = await collection.deleteOne(
            { 
                "user_id" : userId,
                "weatherCondition" : weatherId,
            }
        );

        // console.log(result);

        const result_updateuser = await db.collection('Users').updateOne(
            { _id : userId},
            { $pull: { preferences : docToDelete._id}}
        );
        
        if (result.acknowledged && result_updateuser) {
            res.status(200);
        }


    } catch (error) {
        console.log(`Error deleting preference: ${error}`);
        res.status(404);
    }
});

app.get('/api/getWeatherCondition', async (req, res, next) => {
    client.connect();

    var error = '';

    let { weatherName } = req.body;

    weatherName = weatherName ? String(weatherName).trim() : '';

    // console.log(weatherName);


    const db = client.db();

    try {
        const result = await db.collection('WeatherConditions')
                .findOne(
                    { "condition_name": { $regex: weatherName, $options: 'i'}});
                

        // console.log(result);

        if (result) {
            var ret = { resultId:result._id, error:error };
            // console.log(ret)
            res.status(200).json(ret);
        } else {
            error = '_id of weather condition is null';
            var ret = { resultId:result, error:error };
            // console.log(ret)
            res.status(404).json(ret)
        }
     
    } catch (error) {
        console.log('Error occurred during query:', error);
    }

});

app.get('/api/getGenreId', async (req, res, next) => {
    client.connect();

    var error = '';

    let { genreName } = req.body;

    genreName = genreName ? String(genreName).trim() : '';

    const db = client.db();

    const result = await db.collection('Genre')
                    .findOne({ "genre_name": { $regex: genreName, $options: 'i'}});

    if (result) {
        var ret = { resultId:result._id, error:error };
        res.status(200).json(ret);
    } else {
        error = '_id of genre is null';
        var ret = { resultId:result, error:error };
        res.status(404).json(ret)
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

    // console.log(result);

    if (result) {
        var ret = { genreName:result.genre_name, error:error };
        console.log(ret);
        res.status(200).json(ret);
    } else {
        error = '_id of genre is null';
        var ret = { genreName:result, error:error };
        res.status(404).json(ret)
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
    const { userId, weatherCondition} = req.body; // New endpoint for generating Spotify playlists
    
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



        // Retrieve user preferences for the current weather condition

        try {
            // getPreference handles getting the genre ids returns an array of the corresponding names of those genres
            const response = await axios.get('http://localhost:5000/api/getPreference', {
                params:{
                    userId:userId,
                    weatherCondition:weatherCondition,
                },
            });

            const genreNames = response.data;

            if (genreNames.length === 0) {
                return res.status(404).send('No genres associated with the current weather condition.'); // Return if no genres found
            }

            // Generate Spotify playlist using user's preferences
            // const user = await db.collection('User').findOne({ _id: new ObjectId(userId) }); // Retrieve user data for Spotify integration
            
            try {
                const user = await axios.get('http://localhost:5000/api/getUser', {
                    params:{
                        userId:userId,
                    },
                });
                
                let spotifyToken = user.spotifyAccessToken;

                if (!spotifyToken) {
                    return res.status(401).send('Spotify token missing or invalid. Please reauthenticate.'); // Check for valid Spotify token
                }

                const spotifyResponse = await axios.get('https://api.spotify.com/v1/recommendations', {
                    headers: { Authorization: `Bearer ${spotifyToken}` },
                    params: {
                        seed_genres: genreNames.join(','), // Use genres as seed parameters
                        limit: 20,
                    },
                });

                const tracks = spotifyResponse.data.tracks; // Fetch recommended tracks
                const trackUris = tracks.map((track) => track.uri); // Extract track URIs

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

                const playlistId = playlistResponse.data.id; // Get created playlist ID

                // Add tracks to the playlist
                await axios.post(
                    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                    { uris: trackUris }, // Add recommended tracks to the playlist
                    { headers: { Authorization: `Bearer ${spotifyToken}` } }
                );

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

                const result = await db.collection('Playlist').insertOne(playlistDbEntry); // Save playlist data to Playlist collection

                res.json({ success: true, playlistId, dbId: result.insertedId }); // Respond with success and playlist details
            } catch (error) {
                return res.status(404).send('No user with userId found'); 
            }
        } catch (error) {
            return res.status(404).send('No preferences found for the current weather condition.'); // Return if no preferences are set for the weather condition
        }
    } catch (error) {
        console.error('Error generating Spotify playlist:', error.message); // Log errors
        res.status(500).send('Error generating Spotify playlist'); // Send error response
    }
});

app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
  });