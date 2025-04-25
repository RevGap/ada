// src/components/WeatherWidget.jsx
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./WeatherWidget.css"; // Using the updated CSS

function WeatherWidget({ weatherData }) {
  const [isVisible, setIsVisible] = useState(true);
  // Always appear at top-left, 40px from edges
  const [position, setPosition] = useState({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);

  useEffect(() => {
    if (weatherData && weatherData.location) {
      setIsVisible(true);
    }
  }, [weatherData]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = "";
    };
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset]);

  const handleMouseDown = (e) => {
    if (e.target.classList.contains("weather-widget-close-button")) return;
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    document.body.style.userSelect = "none";
  };

  const handleClose = () => setIsVisible(false);

  if (!weatherData || !weatherData.location || !isVisible) {
    return null;
  }

  return (
    <div
      ref={widgetRef}
      className="weather-widget"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={handleMouseDown}
    >
      <button
        onClick={handleClose}
        className="weather-widget-close-button"
        aria-label="Close Weather Widget"
      >
        &times;
      </button>

      <h4>Weather in {weatherData.location}</h4>
      <p>Currently: {weatherData.current_temp_f}°F</p>
      <p>Condition: {weatherData.description || "N/A"}</p>
      {weatherData.precipitation !== undefined && (
        <p>Precipitation: {weatherData.precipitation}%</p>
      )}
    </div>
  );
}

WeatherWidget.propTypes = {
  weatherData: PropTypes.shape({
    location: PropTypes.string,
    current_temp_f: PropTypes.number,
    description: PropTypes.string,
    precipitation: PropTypes.number,
  }),
};

export default WeatherWidget;