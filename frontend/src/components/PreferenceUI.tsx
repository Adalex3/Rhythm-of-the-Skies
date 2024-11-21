import React, { useState } from 'react';
import sunny from '../images/Sunny.png'
import cloudy from '../images/Cloudy.png'
import rainy from '../images/rainy.png'
import snowy from '../images/Snowy.png'
// import night from './images/night.png'


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

const PreferenceUI: React.FC = () => {
    // const [searchTerm, setSearchTerm] = useState("");
    // const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    // Tracks what is typed into the search bar
    const [sunnySearchTerm, setSunnySearchTerm] = useState("");
    const [cloudySearchTerm, setCloudySearchTerm] = useState("");
    const [rainySearchTerm, setRainySearchTerm] = useState("");
    const [snowySearchTerm, setSnowySearchTerm] = useState("");

    // Stores genre that user selected into what is initially an empty array(s)
    const [sunnySelectedGenres, setSunnySelectedGenres] = useState<string[]>([]);
    const [cloudySelectedGenres, setCloudySelectedGenres] = useState<string[]>([]);
    const [rainySelectedGenres, setRainySelectedGenres] = useState<string[]>([]);
    const [snowySelectedGenres, setSnowySelectedGenres] = useState<string[]>([]);

    // Track visibility of genres
    const [sunnyActive, setSunnyActive] = useState(false);
    const [cloudyActive, setCloudyActive] = useState(false);
    const [rainyActive, setRainyActive] = useState(false);
    const [snowyActive, setSnowyActive] = useState(false);

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
        setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
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
        }
    };

    // Adds submission/save button
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // setFormData(defaltFormData);
    }

    return (
        <>
            <div
            // style={{ 
            //     backgroundColor: '#cee7f2',
            //     backgroundSize: 'contain',
            //     position: 'absolute',
            //     top: 0,
            //     left: 0,
            //     width: '100%',
            //     height: '100%',
            //     zIndex: -1 
            //   }} 
            >

                <h1>Muscial Preference</h1>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <form onSubmit={onSubmit}>                       
                        {/* Sunny day preference */}
                        
                        <div className='container' onBlur={handleBlur}>
                            <div >
                                <img style={{ width: "70%" }} src={sunny} />
                                <div>
                                    <h2 ><strong>Sunny</strong></h2>
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
                                                onClick={() =>
                                                    handleRemoveGenre(
                                                        genre,
                                                        sunnySelectedGenres,
                                                        setSunnySelectedGenres
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


                        
                        {/* Cloudy day preference */}
                        <div className='container' onBlur={handleBlur}>
                            <div >
                                <img style={{ width: "70%" }} src={cloudy} />
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
                                                onClick={() =>
                                                    handleRemoveGenre(
                                                        genre,
                                                        cloudySelectedGenres,
                                                        setCloudySelectedGenres
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




                        {/* Rainy day preference */}
                        <div className='container' onBlur={handleBlur}>
                            <div >
                                <img style={{ width: "70%" }} src={rainy} />
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
                                                onClick={() =>
                                                    handleRemoveGenre(
                                                        genre,
                                                        rainySelectedGenres,
                                                        setRainySelectedGenres
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


                        {/* Snowy day preference */}
                        <div className='container' onBlur={handleBlur}>
                            <div >
                                <img style={{ width: "70%" }} src={snowy} />
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
                                                onClick={() =>
                                                    handleRemoveGenre(
                                                        genre,
                                                        snowySelectedGenres,
                                                        setSnowySelectedGenres
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

                        <button className='pref-submit-btn' type="submit">Save</button>
                    </form>
                </div>
            </div>
        </>
    );
};

<br />

export default PreferenceUI;

