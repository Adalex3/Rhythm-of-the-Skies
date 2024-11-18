import React from 'react';
import BlueSkyBackground from '../components/backgrounds/BlueSkyBackground';
import WhiteCloudsBackground from '../components/backgrounds/WhiteCloudsBackground';
import SunBackground from '../components/backgrounds/SunBackground';

const PreferencesPage: React.FC = () => {
    return (
        <>
            <BlueSkyBackground />
            <SunBackground />
            <WhiteCloudsBackground 
                        cloudCount={10}
                        cloudSpeed={1}
                        cloudSize={1}/>
        </>
    );
};

export default PreferencesPage;