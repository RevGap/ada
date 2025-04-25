// src/components/SearchResultsWidget.jsx
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./SearchResultsWidget.css";

function SearchResultsWidget({ searchData, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  // Always appear at bottom-left, 40px from left and bottom
  const [position, setPosition] = useState({ x: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);

  // Ensure widget becomes visible when new data arrives
  useEffect(() => {
    if (searchData?.results?.length > 0) {
      setIsVisible(true);
    }
  }, [searchData]);

  // --- Classic Dragging Logic ---
  const handleMouseDown = (e) => {
    if (e.target.classList.contains("search-widget-close-button")) return;
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

  // Use the onClose prop directly for the close button
  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  // If no data or not visible, don't render
  if (!searchData?.results || !isVisible) {
    return null;
  }

  const results = searchData.results;
  const query = searchData.query || "Search";

  return (
    <div
      ref={widgetRef}
      className="search-widget-container"
      style={{
        left: `${position.x}px`,
        bottom: `40px`,
        position: "fixed",
        zIndex: 999,
      }}
      onMouseDown={handleMouseDown}
    >
      <button
        onClick={handleCloseClick}
        className="search-widget-close-button"
        aria-label="Close Search Results Widget"
      >
        &times;
      </button>
      <h4>Sources for "{query}"</h4>
      <ul className="search-widget-list">
        {results.length > 0 ? (
          results.map((result, index) => (
            <li key={index}>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                title={result.url}
              >
                {result.title || result.url}
              </a>
              {result.meta_snippet && <p>{result.meta_snippet}</p>}
            </li>
          ))
        ) : (
          <li>No results found.</li>
        )}
      </ul>
    </div>
  );
}

SearchResultsWidget.propTypes = {
  searchData: PropTypes.shape({
    query: PropTypes.string,
    results: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        title: PropTypes.string,
        meta_snippet: PropTypes.string,
        page_content_summary: PropTypes.string,
      })
    ),
  }),
  onClose: PropTypes.func.isRequired,
};

export default SearchResultsWidget;