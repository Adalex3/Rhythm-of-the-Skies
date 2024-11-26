import React from "react";
import "../main.css";

interface ProfileDisplayProps {
  username: string;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ username }) => {
  return (
    <div className="profile-display">
      <img src="../src/assets/person.png"></img>
      <div className="">
        <p>{username}</p>
        <button>Sign out</button>
      </div>
    </div>
  );
};

export default ProfileDisplay;