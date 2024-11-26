import React from "react";
import "../main.css";

interface Weather {
  temp: number;
  condition: string;
  location: string;
}

interface OverviewPanelProps {
  weather: Weather;
}

const OverviewPanel: React.FC<OverviewPanelProps> = ({ weather }) => {

    const isDaytime = new Date().getHours() >= 7 && new Date().getHours() < 18;

  return (
    <div className="overview-panel">
      <h2>It's a {weather.condition} {isDaytime ? "day" : "night"} in {weather.location}!</h2>
      <p className="temp-line">
        <span className="temperature">{weather.temp}º</span> · {weather.condition}
      </p>
    </div>
  );
};

export default OverviewPanel;