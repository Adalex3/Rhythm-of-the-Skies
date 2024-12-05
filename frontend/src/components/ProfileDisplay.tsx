import React from "react";
import "../main.css";

interface ProfileDisplayProps {
  username: string;
}

function doLogout(event: any): void {
  event.preventDefault();
  location.href = '/';
  localStorage.setItem("user_id","");
};

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ username }) => {
  return (
    <div className="profile-display">
      <img src="../src/assets/person.png"></img>
      <div className="">
        <p>{username}</p>
        <button onClick={doLogout}>Sign out</button>
      </div>
    </div>
  );
};

export default ProfileDisplay;