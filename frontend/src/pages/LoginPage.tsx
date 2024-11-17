import React from 'react';
import BlueSkyBackground from '../components/backgrounds/BlueSkyBackground';
import WhiteCloudsBackground from '../components/backgrounds/WhiteCloudsBackground';
import PageTitle from '../components/PageTitle';
import SunBackground from '../components/backgrounds/SunBackground';
import Login from '../components/Login';

const CanvasBackground: React.FC = () => {
    return (
        <>
            <BlueSkyBackground />
            <SunBackground />
            <WhiteCloudsBackground />
            <PageTitle/>
            <Login/>
        </>
    );
};

export default CanvasBackground;