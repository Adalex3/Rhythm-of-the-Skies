import React, { useState } from 'react';
import axios from 'axios';
import sunny from '../images/pxSunny.png'
import cloudy from '../images/pxCloudy.png'
import rainy from '../images/pxRainy.png'
import snowy from '../images/pxSnowy.png'
import night from '../images/pxNight.png'
import preferences_rainbow from '../images/preferences_rainbow.png'
import { LocationContext } from '../pages/PreferencesPage';
import { useNavigate } from 'react-router-dom';

// Alex TO-DO: how do you edit this to communicate with
// your main page so the user's location selection here
// reflects on main?
interface PreferencesProps {
    location: string;
  }

const genres = [
    "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime",
    "black-metal", "bluegrass", "blues", "bossanova", "brazil", "breakbeat",
    "british", "cantopop", "chicago-house", "children", "chill", "classical",
    "club", "comedy", "country", "dance", "dancehall", "death-metal", "deep-house",
    "detroit-techno", "disco", "disney", "drum-and-bass", "dub", "dubstep", "edm",
    "electro", "electronic", "emo", "folk", "forro", "french", "funk", "garage",
    "german", "gospel", "goth", "grindcore", "groove", "grunge", "guitar", "happy",
    "hard-rock", "hardcore", "hardstyle", "heavy-metal", "hip-hop", "holidays",
    "honky-tonk", "house", "idm", "indian", "indie", "indie-pop", "industrial",
    "iranian", "j-dance", "j-idol", "j-pop", "j-rock", "jazz", "k-pop", "kids",
    "latin", "latino", "malay", "mandopop", "metal", "metal-misc", "metalcore",
    "minimal-techno", "movies", "mpb", "new-age", "new-release", "opera", "pagode",
    "party", "philippines-opm", "piano", "pop", "pop-film", "post-dubstep", "power-pop",
    "progressive-house", "psych-rock", "punk", "punk-rock", "r-n-b", "rainy-day",
    "reggae", "reggaeton", "road-trip", "rock", "rock-n-roll", "rockabilly", "romance",
    "sad", "salsa", "samba", "sertanejo", "show-tunes", "singer-songwriter", "ska",
    "sleep", "songwriter", "soul", "soundtracks", "spanish", "study", "summer",
    "swedish", "synth-pop", "tango", "techno", "trance", "trip-hop", "turkish",
    "work-out", "world-music"
];

const PreferenceUI: React.FC<PreferencesProps> = ({ location }) => {
    // const [searchTerm, setSearchTerm] = useState("");
    // const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    // Tracks what is typed into the search bar
    const [sunnySearchTerm, setSunnySearchTerm] = useState("");
    const [cloudySearchTerm, setCloudySearchTerm] = useState("");
    const [rainySearchTerm, setRainySearchTerm] = useState("");
    const [snowySearchTerm, setSnowySearchTerm] = useState("");
    const [nightSearchTerm, setNightSearchTerm] = useState("");


    // Stores genre that user selected into what is initially an empty array(s)
    const [sunnySelectedGenres, setSunnySelectedGenres] = useState<string[]>([]);
    const [cloudySelectedGenres, setCloudySelectedGenres] = useState<string[]>([]);
    const [rainySelectedGenres, setRainySelectedGenres] = useState<string[]>([]);
    const [snowySelectedGenres, setSnowySelectedGenres] = useState<string[]>([]);
    const [nightSelectedGenres, setNightSelectedGenres] = useState<string[]>([]);


    // Track visibility of genres
    const [sunnyActive, setSunnyActive] = useState(false);
    const [cloudyActive, setCloudyActive] = useState(false);
    const [rainyActive, setRainyActive] = useState(false);
    const [snowyActive, setSnowyActive] = useState(false);
    const [nightActive, setNightActive] = useState(false);

    // Tracks location information
    const [cityName, setCityName] = useState(''); 
    const [stateName, setStateName] = useState(''); 

    // Location search term
    const [locationSearchTerm, setLocationSearchTerm] = useState("");
    const [locationDisplay, setLocationDisplay] = useState(location);

    // Visibility of locations
    const [locationActive, setLocationActive] = useState(false);


    // The behavior of the checkbox list
    const handleCheckboxChange = (
        genre: string,
        selectedGenres: String[],
        setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setSelectedGenres((prevSelected) =>
            prevSelected.includes(genre)
                // Uncheck: removes the genre from the array if it was already in it's respective "selectedGenres"
                ? prevSelected.filter((g) => g !== genre)
                // Check: adds the genre to the respective "selectedGenres" array if it was not only in
                : [...prevSelected, genre]
        );
    };

    // Handles the removal of a genre when the user clicks it's "x" button
    const handleRemoveGenre = (
        genre: string,
        selectedGenres: string[],
        setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>,
        event: React.FormEvent | React.MouseEvent
    ) => {
        event.preventDefault();
        setSelectedGenres((prevSelected) =>
            prevSelected.filter((g) => g !== genre)
        );
    };

    // Filters the array based on the search term with lack of case-sensitivity 
    const filteredGenres = (genre: string[], searchTerm: string) =>
        genres.filter((genre) =>
            genre.toLowerCase().includes(searchTerm.toLowerCase())
        );


    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        // Hide the list when clicking outside
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setSunnyActive(false);
            setCloudyActive(false);
            setRainyActive(false);
            setSnowyActive(false);
            setNightActive(false);
        }
    };

    const navigate = useNavigate();
    const handleSubmit = async () => {
        const data = {
            userLocation: location,
            sunnyGenres: sunnySelectedGenres,
            cloudyGenres: cloudySelectedGenres,
            rainyGenres: rainySelectedGenres,
            snowyGenres: snowySelectedGenres,
            nightGenres: nightSelectedGenres
        };

        // Joanne TODO: location and weather preference data are submitted to the "url"  

        try {
            // First do get to see if the user has any preferences connected to them
            // if so, do update
            // if not, then add

            let userId = localStorage.getItem("user_id")
            // console.log(userId);

            let weatherConditions = ["sunny", "night", "cloudy", "rainy", "snowy"];
            let weatherGenres = [data.sunnyGenres, data.nightGenres, data.cloudyGenres, data.rainyGenres, data.snowyGenres];

            // let weatherConditions = ["sunny"];
            // let weatherGenres = [data.sunnyGenres];

            for (let i = 0; i < weatherConditions.length; i++) {
                let wC = weatherConditions[i]
                
                console.log("Currently on: ", wC);
                console.log(weatherGenres[i]);


                let check_exist = await axios.get('http://localhost:5000/api/getPreference', {
                    params:{
                        userId:userId,
                        weatherCondition:wC,
                    },
                })

                

                let exists = false;

                if (check_exist.data != false) {
                    exists = true;
                }

                console.log("Existence: ", exists);
                console.log("Weather genre list: ", weatherGenres[i].length);

                if (exists && weatherGenres[i].length > 0) {
                    console.log(wC, " exists and we update");
                    // Update if exists and new preference is a list of genres
                    try {
                        let update_pref = await axios.post('http://localhost:5000/api/updatePreference', {
                            userId:userId,
                            weatherCondition:wC,
                            genre:weatherGenres[i],
                        });

                        // if (update_pref.status == 201) {
                        //     console.log("Update successful for ", wC);
                        // } else {
                        //     console.log("Update unsuccessful for ", wC);
                        // }

                        console.log("Update successful for ", wC);
                    } catch (error) {
                        console.log("Update unsuccessful for ", wC);
                        alert(error);
                    }
                } else if ((!exists) && weatherGenres[i].length > 0) {
                    console.log(wC," does not exist and we add");
                    // Add if entry does not exist and new preference is a list with genres
                    try {

                        // console.log("Passing the following to add preference:");
                        // console.log(wC);
                        // console.log(weatherGenres[i]);



                        let add_pref = await axios.post('http://localhost:5000/api/addPreference', {
                            userId:userId,
                            weatherCondition:wC,
                            genre:weatherGenres[i],
                        });

                        console.log("Add successful for ", wC);
                    } catch (error) {
                        console.log("Add unsuccessful for ", wC);
                        alert(error);
                    }
                } else if (exists && weatherGenres[i].length == 0) {
                    // Delete if the entry exists but the newPreference has no genres
                    console.log(wC," exists and we delete");

                    try {
                        let delete_pref = await axios.get('http://localhost:5000/api/deletePreference', {
                            params : {
                                userId:userId,
                                weatherCondition:wC,
                            },
                        });

                        if (delete_pref) {
                            console.log("Delete successful for ", wC);
                        } else {
                            console.log("Delete unsuccessful for ", wC);
                        }
                            
                    } catch (error) {
                        console.log("Delete unsuccessful for ", wC);
                        alert(error);
                    }
                }
            }

            
        } catch (error) {
            console.error("Error saving ", error);
            alert("Error connecting to the server");
        }
        navigate('../main');
    }

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocationSearchTerm(e.target.value); // Update the search bar value
    };

    const handleLocationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('Enter pressed:', locationSearchTerm);

        if(locationSearchTerm != "") {
            // Set the localStorage location to be the search field value
            const textFieldStr = locationSearchTerm;
            localStorage.setItem("user_location",textFieldStr);

            setLocationDisplay(textFieldStr);
        } else {
            
        }
    };

    return (
        <>
            <div className="background"></div>

            <div className="header">
                <header id="pref_title">Rhythm of the Skies</header> 
            </div>
            
            {/* Location container */}
            <div className='location_container'>
                <form onSubmit={handleLocationSubmit}>
                <div className='container' onBlur={handleBlur}>
                        <div style={{ width: "100%" }}>
                            <location_heading>Selected Location: </location_heading>
                            <location_text><strong>{locationDisplay}</strong></location_text>

                        </div>
                        <div style={{ width: "115%" }}>
                            <locationSearchHead>Change Location:</locationSearchHead>
                            {/* Search Bar */}
                            {/* Joanne and Cora To-Do thingy:
                                this is the location search bar.
                                The "Save" button below should save the new location" */}
                            <input className="location-gen-search"
                                type="text"
                                placeholder="Search city/state..."
                                value={locationSearchTerm}
                                onChange={handleLocationChange}
                            />

                            <p className='example-text'>Ex: Orlando, FL</p>

                        </div>
                    </div>
                </form>
            </div>

            <h1>Musical Preferences</h1>
            
            <div className="outline">
                <form onSubmit={handleSubmit}>                       
                    {/* Sunny day preference */}
                    
                    <div className='container' onBlur={handleBlur}>
                        <div >
                            <img style={{ width: "60%" }} src={sunny} />
                            <div>
                                <h2><strong>Sunny</strong></h2>
                             </div>
                        </div>
                        <div style={{ width: "200%" }}>
                            <h3>I want to hear...</h3>
                            {/* Search Bar */}
                            <input className="pref-gen-search"
                                type="text"
                                placeholder="Search genres..."
                                value={sunnySearchTerm}
                                onFocus={() => setSunnyActive(true)} // Show the list on focus
                                onChange={(e) => setSunnySearchTerm(e.target.value)}
                            />

                            {/* Genre Checkboxes */}
                            {sunnyActive && (
                                <div className="pref-gen-check">
                                    {filteredGenres(genres, sunnySearchTerm).map((genre, index) => (
                                        <label key={index}>
                                            <input
                                                type="checkbox"
                                                value={genre}
                                                checked={sunnySelectedGenres.includes(genre)}
                                                onChange={() =>
                                                    handleCheckboxChange(
                                                        genre,
                                                        sunnySelectedGenres,
                                                        setSunnySelectedGenres
                                                    )
                                                }
                                            />
                                            {genre}
                                        </label>
                                    ))}
                                </div>
                            )}
                            {/* Selected Genres */}
                            <div className="pref-gen-sel">
                                {sunnySelectedGenres.map((genre, index) => (
                                    <div key={index} className="pref-gen-sel2">
                                        {genre}
                                        {/* x button removes the genre when clicked */}
                                        <button
                                            className='pref-x-btn'
                                            onClick={(e) =>
                                                handleRemoveGenre(
                                                    genre,
                                                    sunnySelectedGenres,
                                                    setSunnySelectedGenres,
                                                    e
                                                )
                                            }
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <hr className="centered-hr" />

                    {/* Night preference */}
                    
                    <div className='container' onBlur={handleBlur}>
                        <div >
                            <img style={{ width: "60%" }} src={night} />
                            <div>
                                <h2><strong>Night</strong></h2>
                            </div>
                        </div>
                        <div style={{ width: "200%" }}>
                            <h3>I want to hear...</h3>
                            {/* Search Bar */}
                            <input className="pref-gen-search"
                                type="text"
                                placeholder="Search genres..."
                                value={nightSearchTerm}
                                onFocus={() => setNightActive(true)} // Show the list on focus
                                onChange={(e) => setNightSearchTerm(e.target.value)}
                            />

                            {/* Genre Checkboxes */}
                            {nightActive && (
                                <div className="pref-gen-check">
                                    {filteredGenres(genres, nightSearchTerm).map((genre, index) => (
                                        <label key={index}>
                                            <input
                                                type="checkbox"
                                                value={genre}
                                                checked={nightSelectedGenres.includes(genre)}
                                                onChange={() =>
                                                    handleCheckboxChange(
                                                        genre,
                                                        nightSelectedGenres,
                                                        setNightSelectedGenres
                                                    )
                                                }
                                            />
                                            {genre}
                                        </label>
                                    ))}
                                </div>
                            )}
                            {/* Selected Genres */}
                            <div className="pref-gen-sel">
                                {nightSelectedGenres.map((genre, index) => (
                                    <div key={index} className="pref-gen-sel2">
                                        {genre}
                                        {/* x button removes the genre when clicked */}
                                        <button
                                            className='pref-x-btn'
                                            onClick={(e) =>
                                                handleRemoveGenre(
                                                    genre,
                                                    nightSelectedGenres,
                                                    setNightSelectedGenres,
                                                    e
                                                )
                                            }
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <hr className="centered-hr" />
                    {/* Cloudy day preference */}
                    <div className='container' onBlur={handleBlur}>
                        <div >
                            <img style={{ width: "60%" }} src={cloudy} />
                            <div>
                                <h2 ><strong>Cloudy</strong></h2>
                            </div>
                        </div>
                        <div style={{ width: "200%" }}>
                            <h3>I want to hear...</h3>
                            {/* Search Bar */}
                            <input className="pref-gen-search"
                                type="text"
                                placeholder="Search genres..."
                                value={cloudySearchTerm}
                                onFocus={() => setCloudyActive(true)} // Show the list on focus
                                onChange={(e) => setCloudySearchTerm(e.target.value)}
                            />

                            {/* Genre Checkboxes */}
                            {cloudyActive && (
                                <div className="pref-gen-check">
                                    {filteredGenres(genres, cloudySearchTerm).map((genre, index) => (
                                        <label key={index}>
                                            <input
                                                type="checkbox"
                                                value={genre}
                                                checked={cloudySelectedGenres.includes(genre)}
                                                onChange={() =>
                                                    handleCheckboxChange(
                                                        genre,
                                                        cloudySelectedGenres,
                                                        setCloudySelectedGenres
                                                    )
                                                }
                                            />
                                            {genre}
                                        </label>
                                    ))}
                                </div>
                            )}
                            {/* Selected Genres */}
                            <div className="pref-gen-sel">
                                {cloudySelectedGenres.map((genre, index) => (
                                    <div key={index} className="pref-gen-sel2">
                                        {genre}
                                        {/* x button removes the genre when clicked */}
                                        <button
                                            className='pref-x-btn'
                                            onClick={(e) =>
                                                handleRemoveGenre(
                                                    genre,
                                                    cloudySelectedGenres,
                                                    setCloudySelectedGenres,
                                                    e
                                                )
                                            }
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <hr className="centered-hr" />

                    {/* Rainy day preference */}
                    <div className='container' onBlur={handleBlur}>
                        <div >
                            <img style={{ width: "60%" }} src={rainy} />
                            <div>
                                <h2 ><strong>Rainy</strong></h2>
                            </div>
                        </div>
                        <div style={{ width: "200%" }}>
                            <h3>I want to hear...</h3>
                            {/* Search Bar */}
                            <input className="pref-gen-search"
                                type="text"
                                placeholder="Search genres..."
                                value={rainySearchTerm}
                                onFocus={() => setRainyActive(true)} // Show the list on focus
                                onChange={(e) => setRainySearchTerm(e.target.value)}
                            />

                            {/* Genre Checkboxes */}
                            {rainyActive && (
                                <div className="pref-gen-check">
                                    {filteredGenres(genres, rainySearchTerm).map((genre, index) => (
                                        <label key={index}>
                                            <input
                                                type="checkbox"
                                                value={genre}
                                                checked={rainySelectedGenres.includes(genre)}
                                                onChange={() =>
                                                    handleCheckboxChange(
                                                        genre,
                                                        rainySelectedGenres,
                                                        setRainySelectedGenres
                                                    )
                                                }
                                            />
                                            {genre}
                                        </label>
                                    ))}
                                </div>
                            )}
                            {/* Selected Genres */}
                            <div className="pref-gen-sel">
                                {rainySelectedGenres.map((genre, index) => (
                                    <div key={index} className="pref-gen-sel2">
                                        {genre}
                                        {/* x button removes the genre when clicked */}
                                        <button
                                            className='pref-x-btn'
                                            onClick={(e) =>
                                                handleRemoveGenre(
                                                    genre,
                                                    rainySelectedGenres,
                                                    setRainySelectedGenres,
                                                    e
                                                )
                                            }
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <hr className="centered-hr" />

                    {/* Snowy day preference */}
                    <div className='container' onBlur={handleBlur}>
                        <div >
                            <img style={{ width: "60%" }} src={snowy} />
                            <div>
                                <h2 ><strong>Snowy</strong></h2>
                            </div>
                        </div>
                        <div style={{ width: "200%" }}>
                            <h3>I want to hear...</h3>
                            {/* Search Bar */}
                            <input className="pref-gen-search"
                                type="text"
                                placeholder="Search genres..."
                                value={snowySearchTerm}
                                onFocus={() => setSnowyActive(true)} // Show the list on focus
                                onChange={(e) => setSnowySearchTerm(e.target.value)}
                            />

                            {/* Genre Checkboxes */}
                            {snowyActive && (
                                <div className="pref-gen-check">
                                    {filteredGenres(genres, snowySearchTerm).map((genre, index) => (
                                        <label key={index}>
                                            <input
                                                type="checkbox"
                                                value={genre}
                                                checked={snowySelectedGenres.includes(genre)}
                                                onChange={() =>
                                                    handleCheckboxChange(
                                                        genre,
                                                        snowySelectedGenres,
                                                        setSnowySelectedGenres
                                                    )
                                                }
                                            />
                                            {genre}
                                        </label>
                                    ))}
                                </div>
                            )}
                            {/* Selected Genres */}
                            <div className="pref-gen-sel">
                                {/* <h3>Selected Genres:</h3> */}
                                {snowySelectedGenres.map((genre, index) => (
                                    <div key={index} className="pref-gen-sel2">
                                        {genre}
                                        <button
                                            className='pref-x-btn'
                                            onClick={(e) =>
                                                handleRemoveGenre(
                                                    genre,
                                                    snowySelectedGenres,
                                                    setSnowySelectedGenres,
                                                    e
                                                )
                                            }
                                        >
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <button className='pref-submit-btn' type="submit" onClick={handleSubmit}>Save</button>
        </>
    );
};

<br />

export default PreferenceUI;

