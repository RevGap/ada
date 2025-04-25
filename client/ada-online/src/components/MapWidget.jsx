// src/components/MapWidget.jsx
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./MapWidget.css"; // Using the updated CSS

// Placeholder for map rendering - replace with your chosen library (e.g., Google Maps Embed API, react-google-maps, Leaflet)
const MapDisplay = ({ routeData }) => {
  if (!routeData || !routeData.destination) {
    return <p className="text-white/70">Waiting for route data...</p>;
  }

  // --- Example using Google Maps Embed API (Requires an API Key) ---
  // Make sure to URL-encode the destination and origin
  // Read API key from Vite environment variables
  const apiKey = import.meta.env.VITE_MAPS_API_KEY;
  const origin = routeData.origin
    ? encodeURIComponent(routeData.origin)
    : "current+location"; // Default to current location if no origin
  const destination = encodeURIComponent(routeData.destination);

  // Check if API key is available
  if (!apiKey) {
    console.error("VITE_MAPS_API_KEY is not defined. Map widget cannot load.");
    return (
      <p className="text-white/70">
        Map API Key is missing. Please configure VITE_MAPS_API_KEY.
      </p>
    );
  }

  const mapSrc = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${destination}`;

  return (
    <iframe
      width="100%"
      height="100%"
      style={{ border: 0, borderRadius: "8px" }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={mapSrc}
    ></iframe>
  );
};

MapDisplay.propTypes = {
  routeData: PropTypes.shape({
    origin: PropTypes.string,
    destination: PropTypes.string.isRequired,
  }),
};

function MapWidget({ mapData }) {
  const [isVisible, setIsVisible] = useState(true); // Start visible when data arrives
  // Always appear at top-right, 40px from right and top
  const [position, setPosition] = useState({ y: 40 }); // Initial position
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);

  // Reset visibility when mapData changes (new route requested)
  useEffect(() => {
    if (mapData) {
      setIsVisible(true);
    } else {
      setIsVisible(false); // Hide if no map data
    }
  }, [mapData]);

  // --- Classic Dragging Logic ---
  const handleMouseDown = (e) => {
    if (
      e.target.classList.contains("map-widget-close-button") ||
      e.target.tagName === "IFRAME"
    ) {
      return;
    }
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    document.body.style.userSelect = "none";
  };

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

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!mapData || !isVisible) {
    return null;
  }

  return (
    <div
      ref={widgetRef}
      className="map-widget"
      style={{
        right: `40px`,
        top: `${position.y}px`,
        position: "fixed",
        zIndex: 999,
      }}
      onMouseDown={handleMouseDown}
    >
      <button
        onClick={handleClose}
        className="map-widget-close-button"
        aria-label="Close Map Widget"
      >
        &times;
      </button>
      <h4>Route to {mapData.destination}</h4>
      <div className="map-display-area">
        <MapDisplay routeData={mapData} />
      </div>
    </div>
  );
}

MapWidget.propTypes = {
  mapData: PropTypes.shape({
    origin: PropTypes.string,
    destination: PropTypes.string.isRequired,
  }),
};

export default MapWidget;