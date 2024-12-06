import '../App.css'; 
import React from 'react';
import clouds from './images/clouds.jpg';

function Login() {
    function doLogin(event: any): void {
        event.preventDefault();
        
        // TODO:
        console.log("LOGGING IN WITH SPOTIFY...");
        /* NOAH CHANGES: */ 
        window.location.href=('https://rhythmoftheskies.xyz/login');
        
        // window.location.href = "http://localhost:5000/login"
    }
    return (
        <a className="login-btn" href="#" onClick={doLogin}><p>Login with Spotify</p></a>
    );
};
export default Login;