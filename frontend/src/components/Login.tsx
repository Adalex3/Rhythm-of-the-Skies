import '../App.css'; 
import React from 'react';
import clouds from './images/clouds.jpg';

function Login() {
    function doLogin(event: any): void {
        event.preventDefault();
        alert('doIt()');
    }
    return (
        <a className="login-btn"><p>Login with Spotify</p></a>
    );
};
export default Login;
