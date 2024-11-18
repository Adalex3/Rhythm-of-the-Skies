import React from 'react';
import BlueSkyBackground from '../components/backgrounds/BlueSkyBackground';
import WhiteCloudsBackground from '../components/backgrounds/WhiteCloudsBackground';
import PageTitle from '../components/PageTitle';
import SunBackground from '../components/backgrounds/SunBackground';
import Login from '../components/Login';

const LoginPage: React.FC = () => {
    return (
        <>
            <BlueSkyBackground />
            <SunBackground />
            <WhiteCloudsBackground 
                        cloudCount={100}
                        cloudSpeed={0.5}
                        cloudSize={2}/>
            <PageTitle/>
            <Login/>
        </>
    );
};

export default LoginPage;