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
    spotify_url: string;
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

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
                        <p className="duration">{formatDuration(song.duration)}</p>
                    </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="bottom-content">
            <button className="spotify-button" onClick={() => {
                window.location.href = playlist.spotify_url;
            }}
            >Play on Spotify</button>
            <button className="preferences-button" onClick={() => {
                window.location.href = "/preferences";
            }}>Edit preferences</button>
        </div>
    </div>
  );
};

export default PlaylistDisplay;