import '../App.css'; 
import React from 'react';
import clouds from './images/clouds.jpg';

function Login() {
    function doLogin(event: any): void {
        event.preventDefault();
        alert('doIt()');
    }
    return (
        <div id="loginDiv">
            {/* <span id="inner-title">Login with Spotify</span><br />
            <input type="text" id="loginName" placeholder="Username" /><br />
            <input type="password" id="loginPassword" placeholder="Password" /><br />
            <input type="submit" id="loginButton" className="buttons" value="Do It"
                onClick={doLogin} />
            <span id="loginResult"></span> */}
            <input type="submit" id="loginButton" className="buttons" value="Login with Spotify"
                onClick={doLogin} />
        </div>
    );
};
export default Login;
