import React from "react";
    import "../main.css";

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

interface PlaylistDisplayProps {
  playlist: Playlist;
}

const PlaylistDisplay: React.FC<PlaylistDisplayProps> = ({ playlist }) => {

    const isDaytime = new Date().getHours() >= 7 && new Date().getHours() < 18;

    const getGenreText = (genres: String[]) => {
        if (genres.length === 1) {
            return genres[0];
        } else if (genres.length === 2) {
            return `${genres[0]} & ${genres[1]}`;
        } else {
            const lastGenre = genres.pop();
            return `${genres.join(", ")}, & ${lastGenre}`;
        }
    };

  return (
    <div className="playlist-display">
        <div className="top-content">
            <div className="image-side">
                <img src={playlist.songs[0].album_image_url}></img>
            </div>
            <div className="songs-side">
                <h3 className="vibe-title">{isDaytime ? "Today's vibes are:" : "Tonight's vibes are:"}</h3>
                <p className="vibe">{getGenreText(playlist.genres)}</p>
                <div className="song-list">
                    {playlist.songs.map((song, index) => (
                    <div className="song" key={index}>
                        <div className="title-artist">
                        <p className="title">{song.track_name}</p>
                        <p className="artist">{song.artist_name}</p>
                        </div>
                        <p className="duration">{song.duration}</p>
                    </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="bottom-content">
            <button className="spotify-button">Play on Spotify</button>
            <button className="preferences-button">Edit preferences</button>
        </div>
    </div>
  );
};

export default PlaylistDisplay;