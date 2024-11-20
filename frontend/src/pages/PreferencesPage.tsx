import React from 'react';
import LoggedInName from '../components/LoggedInName';
import BlueSkyBackground from '../components/backgrounds/BlueSkyBackground';
import WhiteCloudsBackground from '../components/backgrounds/WhiteCloudsBackground';
import SunBackground from '../components/backgrounds/SunBackground';
import PreferenceUI from  '../components/PreferenceUI.tsx'

const PreferencesPage: React.FC = () => {
    return (
        <>
            {/* <BlueSkyBackground />
            <SunBackground />
            <WhiteCloudsBackground 
                        cloudCount={10}
                        cloudSpeed={1}
                        cloudSize={1}/>   */}
            <LoggedInName />
            <PreferenceUI />
        </>
    );
};

export default PreferencesPage;