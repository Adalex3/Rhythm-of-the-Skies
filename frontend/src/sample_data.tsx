// sample_data.tsx

export interface Song {
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

export interface Playlist {
    id: string;
    user_id: string;
    genres: String[];
    weatherConditions: String[];
    songs: Song[];
    date: Date;
    spotify_url: string;
}

export const song1: Song = {
    id: "1",
    track_id: "track001",
    track_name: "Rainy Afternoon",
    artist_name: "Lofi Beats",
    artist_id: "artist001",
    album_name: "Chill Vibes",
    album_id: "album001",
    album_image_url: "https://images.pexels.com/photos/355423/pexels-photo-355423.jpeg",
    track_url: "https://example.com/track001",
    duration: 180
};

export const song2: Song = {
    id: "2",
    track_id: "track002",
    track_name: "Sunny Groove",
    artist_name: "Summer Tones",
    artist_id: "artist002",
    album_name: "Beach Days",
    album_id: "album002",
    album_image_url: "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg",
    track_url: "https://example.com/track002",
    duration: 240
};

export const song3: Song = {
    id: "3",
    track_id: "track003",
    track_name: "Cloudy Reflections",
    artist_name: "Ambient Sounds",
    artist_id: "artist003",
    album_name: "Skyline Dreams",
    album_id: "album003",
    album_image_url: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg",
    track_url: "https://example.com/track003",
    duration: 210
};

export const playlist1: Playlist = {
    id: "playlist001",
    user_id: "user123",
    genres: ["Lofi", "Chill"],
    weatherConditions: ["Rainy"],
    songs: [song1, song3, song2, song1, song1, song1, song1, song1, song1],
    date: new Date("2024-11-22"),
    spotify_url: "https://open.spotify.com/"
};

export const playlist2: Playlist = {
    id: "playlist002",
    user_id: "user456",
    genres: ["Pop", "Dance"],
    weatherConditions: ["Sunny"],
    songs: [song2],
    date: new Date("2024-11-22"),
    spotify_url: "https://open.spotify.com/"
};

export const playlist3: Playlist = {
    id: "playlist003",
    user_id: "user789",
    genres: ["Ambient"],
    weatherConditions: ["Cloudy"],
    songs: [song3],
    date: new Date("2024-11-22"),
    spotify_url: "https://open.spotify.com/"
};