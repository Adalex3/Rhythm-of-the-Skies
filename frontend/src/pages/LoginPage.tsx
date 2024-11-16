import React from 'react';
import PageTitle from '../components/PageTitle';
import Login from '../components/Login';

import clouds from '../images/clouds.jpg'; 

const LoginPage = () => {
    const pageStyle: React.CSSProperties = {
        backgroundImage: `url(${clouds})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center -10px',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    };

    return (
        <div style={pageStyle}>
            <PageTitle />
            <Login />
        </div>
    );
};

export default LoginPage;
