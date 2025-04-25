// src/components/CodeExecutionWidget.jsx
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./CodeExecutionWidget.css";

// --- Constants ---
const INITIAL_TOP_OFFSET = 20; // Pixels from top
const INITIAL_RIGHT_OFFSET = 20; // Pixels from right

function CodeExecutionWidget({ code, language, onClose }) {
  // --- Drag State ---
  const [position, setPosition] = useState(() => {
    const widgetWidth = 360; // Approximate width, adjust as needed
    const widgetHeight = 320; // Approximate height, adjust as needed
    const x = Math.max(window.innerWidth - widgetWidth - 40, 40);
    const y = Math.max(window.innerHeight - widgetHeight - 40, 40);
    return { x, y };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);

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
    if (e.target.classList.contains("code-widget-close-button")) return;
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    document.body.style.userSelect = "none";
  };

  if (!code) {
    return null;
  }

  const formattedLanguage = language
    ? language.replace("Language.", "").toLowerCase()
    : "code";

  // --- Render JSX ---
  return (
    <div
      ref={widgetRef}
      className="code-widget-container"
      style={{ left: `${position.x}px`, top: `${position.y}px`, position: "fixed", zIndex: 999 }}
      onMouseDown={handleMouseDown}
    >
      <button
        onClick={onClose}
        className="code-widget-close-button"
        aria-label="Close Code Widget"
      >
        &times;
      </button>
      <h4>Code Execution</h4>
      <pre className="code-block">
        <code className={`language-${formattedLanguage}`}>{code}</code>
      </pre>
    </div>
  );
}

// PropTypes and DefaultProps
CodeExecutionWidget.propTypes = {
  code: PropTypes.string,
  language: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
CodeExecutionWidget.defaultProps = {
  code: null,
  language: "code",
};

export default CodeExecutionWidget;
