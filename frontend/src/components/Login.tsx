import '../App.css'; 
import React from 'react';
import clouds from './images/clouds.jpg';

function Login() {
    function doLogin(event: any): void {
        event.preventDefault();
        
        // TODO: Ayesha add Spotify API!
        console.log("LOGGING IN WITH SPOTIFY...");

        window.location.href = "http://localhost:5000/login"
    }
    return (
        <a className="login-btn" href="#" onClick={doLogin}><p>Login with Spotify</p></a>
    );
};
export default Login;