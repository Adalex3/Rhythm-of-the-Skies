import '../App.css'; 
import React from 'react';
import clouds from './images/clouds.jpg';

function Login() {
    function doLogin(event: any): void {
        event.preventDefault();
        
        // TODO: Ayesha add Spotify API!
        console.log("LOGGING IN WITH SPOTIFY...");

        // const spotify_id = '67412fc6e0c5e59a30c1e534'; // temp value, replace with USER ID


        const spotify_id = '674fb1dd8a3a97bbd4650df8'; //Joanne's spotify id
        // Once Spotify is logged in...
        localStorage.setItem("user_id",String(spotify_id));

        // Now we can use localStorage.getItem("user_id") to get it
        window.location.href = "http://localhost:5000/login"
    }
    return (
        <a className="login-btn" href="#" onClick={doLogin}><p>Login with Spotify</p></a>
    );
};
export default Login;