import React from "react";
import "../main.css";

interface ProfileDisplayProps {
  username: string;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ username }) => {
  return (
    <div className="profile-display">
      <p>{username}</p>
      <button>Sign out</button>
    </div>
  );
};

export default ProfileDisplay;