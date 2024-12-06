import React, { useEffect, useState } from 'react';
import ProfileDisplay from '../components/ProfileDisplay.tsx';
import PreferenceUI from '../components/PreferenceUI.tsx';

const PreferencesPage: React.FC = () => {
  // State to store values from localStorage
  const [spotifyUsername, setSpotifyUsername] = useState<string>(localStorage.getItem("spotifyUsername") || '');
  const [userId, setUserId] = useState<string>(localStorage.getItem("user_id") || '');
  const [userLocation, setUserLocation] = useState<string>(localStorage.getItem("user_location") || 'Unknown Location');

  // useEffect to update localStorage when the component first renders or values change
  useEffect(() => {
    // Optionally, watch for updates in localStorage here or when certain conditions trigger a change
    setSpotifyUsername(localStorage.getItem("spotifyUsername") || '');
    setUserId(localStorage.getItem("user_id") || '');
    setUserLocation(localStorage.getItem("user_location") || 'Unknown Location');
  }, []);  // Empty array means this runs once, when the component mounts

  // Handle case where `PreferenceUI` could modify `localStorage` and need to trigger state update
  const handleUpdateLocalStorage = (newUsername: string, newUserId: string, newLocation: string) => {
    localStorage.setItem("spotifyUsername", newUsername);
    localStorage.setItem("user_id", newUserId);
    localStorage.setItem("user_location", newLocation);

    setSpotifyUsername(newUsername);  // Update the state to reflect the change
    setUserId(newUserId);
    setUserLocation(newLocation);
  };

  return (
    <>
      {/* Pass the handler to PreferenceUI to update localStorage when needed */}
      <PreferenceUI location={userLocation} onUpdate={handleUpdateLocalStorage} />
      <ProfileDisplay username={spotifyUsername} />
    </>
  );
};

export default PreferencesPage;
