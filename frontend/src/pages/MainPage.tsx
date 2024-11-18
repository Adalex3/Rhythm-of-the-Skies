import React from 'react';
import BlueSkyBackground from '../components/backgrounds/BlueSkyBackground';
import WhiteCloudsBackground from '../components/backgrounds/WhiteCloudsBackground';
import SunBackground from '../components/backgrounds/SunBackground';

const MainPage: React.FC = () => {
    return (
        <>
            <BlueSkyBackground />
            <SunBackground />
            <WhiteCloudsBackground />
        </>
    );
};

export default MainPage;