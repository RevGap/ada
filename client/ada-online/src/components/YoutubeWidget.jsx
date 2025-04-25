// src/components/YouTubeWidget.jsx (Revised for Backend Search)
import React, { useState, useEffect, useRef } from "react"; 
import YouTube from "react-youtube";
import PropTypes from "prop-types";
import "./YoutubeWidget.css";

// --- REMOVED --- Backend API Key and URL are no longer needed here
// const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY';
// const YOUTUBE_API_URL = 'https://www.youtube.com/watch?v=QY8dhl1EQfI2';

// <<< ADDED: Need socket prop >>>
function YouTubeWidget({ isVisible, onClose, socket }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Always appear at center-left, 40px from left and vertically centered
  const [position, setPosition] = useState(() => {
    const widgetHeight = 360;
    const y = Math.floor(window.innerHeight / 2 - widgetHeight / 2);
    return { x: 40, y };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!socket?.current) return;
    const sock = socket.current;
    const handleResults = (data) => {
      setSearchResults(data.results || []);
      setError(null);
    };
    const handleError = (err) => {
      setError(err.message || "Unknown error");
    };
    sock.on("youtube_results", handleResults);
    sock.on("youtube_error", handleError);
    return () => {
      sock.off("youtube_results", handleResults);
      sock.off("youtube_error", handleError);
    };
  }, [socket]);

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

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter") {
      requestSearchFromBackend(); // Request search from backend
    }
  };

  const handleSearchButtonClick = () => {
    requestSearchFromBackend(); // Request search from backend
  };

  const handleVideoSelect = (videoId) => {
    setSelectedVideoId(videoId);
  };

  const requestSearchFromBackend = () => {
    if (!searchQuery.trim()) return;
    if (!socket?.current?.connected) {
      setError("Cannot search: Not connected to backend.");
      return;
    }

    console.log(`Requesting Youtube for: '${searchQuery}'`);
    setIsLoading(true);
    setError(null);
    setSearchResults([]); // Clear previous results while loading new ones
    setSelectedVideoId(null); // Clear selected video

    // Emit event to backend
    socket.current.emit("perform_Youtube", { search_query: searchQuery });
  };

  const handleMouseDown = (e) => {
    if (
      e.target.classList.contains("youtube-widget-close-button") ||
      e.target.tagName === "INPUT" ||
      e.target.tagName === "A"
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

  const playerOptions = {
    height: "300",
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: 1,
    },
  };

  const onPlayerReady = () => {
    console.log("Player is ready");
  };

  const onPlayerError = (event) => {
    console.error("YouTube Player Error:", event.data);
    setError(
      `Player Error: Code ${event.data}. Video might be unavailable or restricted.`
    );
    setSelectedVideoId(null);
  };

  if (!isVisible) {
    return null;
  }

  // --- JSX Structure (Mostly Unchanged) ---
  return (
    <div
      ref={widgetRef}
      className="youtube-widget"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: "fixed",
        zIndex: 999,
      }}
      onMouseDown={handleMouseDown}
    >
      <button
        onClick={onClose}
        className="youtube-widget-close-button"
        aria-label="Close YouTube Widget"
      >
        ×
      </button>
      <h4>Youtube & Play</h4>

      {/* Search Area - Uses requestSearchFromBackend now */}
      <div className="Youtube-area">
        <input
          type="text"
          className="Youtube-input"
          placeholder="Search YouTube..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
          disabled={isLoading}
        />
        <button
          className="Youtube-button"
          onClick={handleSearchButtonClick} // Use new handler
          disabled={isLoading || !searchQuery.trim()}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Error Display */}
      {error && <p className="youtube-error-message">{error}</p>}

      {/* Loading Indicator */}
      {isLoading && (
        <p className="youtube-loading-message">Loading results...</p>
      )}

      {/* Results and Player Area */}
      <div className="youtube-content-area">
        {/* Player */}
        {selectedVideoId && (
          <div className="youtube-player-wrapper">
            <YouTube
              videoId={selectedVideoId}
              opts={playerOptions}
              onReady={onPlayerReady}
              onError={onPlayerError}
              className="youtube-iframe"
            />
          </div>
        )}

        {/* Search Results */}
        {!isLoading && searchResults.length > 0 && (
          <div
            className={`youtube-results-list ${
              selectedVideoId ? "has-player" : ""
            }`}
          >
            <h5>Results:</h5>
            <ul>
              {searchResults.map(
                (item) =>
                  // Ensure item and snippet exist before accessing nested properties
                  item?.id?.videoId && item?.snippet ? (
                    <li
                      key={item.id.videoId}
                      onClick={() => handleVideoSelect(item.id.videoId)}
                      className={
                        selectedVideoId === item.id.videoId ? "selected" : ""
                      }
                    >
                      <img
                        src={item.snippet.thumbnails?.default?.url} // Safer access
                        alt={item.snippet.title || "Video thumbnail"} // Fallback alt text
                        width={
                          item.snippet.thumbnails?.default?.width
                            ? item.snippet.thumbnails.default.width / 1.5
                            : 80
                        } // Safer access with fallback size
                        height={
                          item.snippet.thumbnails?.default?.height
                            ? item.snippet.thumbnails.default.height / 1.5
                            : 45
                        }
                      />
                      <span title={item.snippet.title || ""}>
                        {item.snippet.title || "Untitled Video"}
                      </span>
                    </li>
                  ) : null // Skip rendering if essential data is missing
              )}
            </ul>
          </div>
        )}
        {!isLoading &&
          !error &&
          searchResults.length === 0 &&
          searchQuery && <p>No results found for "{searchQuery}".</p>}
      </div>
    </div>
  );
}

YouTubeWidget.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  socket: PropTypes.object, // <<< ADDED: socket prop is now needed
  initialQuery: PropTypes.string, // <<< ADDED: Optional initial query prop
};

// <<< ADDED: Default prop for initialQuery >>>
YouTubeWidget.defaultProps = {
  initialQuery: "",
};

export default YouTubeWidget;
