// src/components/InputArea.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './InputArea.css'; // Using the updated CSS

function InputArea({
    onSendText,
    isMuted,
    isListening,
    onToggleMute,
    micSupported,
    isWebcamVisible,
    onToggleWebcam
}) {
    const [inputValue, setInputValue] = useState('');

    // Handle changes in the text input field
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    // Handle sending text (button click or Enter key)
    const handleSend = () => {
        const trimmedInput = inputValue.trim();
        if (trimmedInput) {
            onSendText(trimmedInput);
            setInputValue('');
        }
    };

    // Handle Enter key press in the input field
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSend();
        }
    };

    // Determine Mute button text and appearance
    let muteButtonText = 'Mic N/A';
    let muteButtonClass = 'mute-button';
    let isMuteButtonDisabled = true;

    if (micSupported) {
        isMuteButtonDisabled = false;
        if (isMuted) {
            muteButtonText = 'Unmute';
            muteButtonClass += ' muted';
        } else {
            // Use isListening to show "Listening..." when active
            muteButtonText = isListening ? 'Listening...' : 'Mute';
        }
    }

    // Determine webcam button text/style
    const webcamButtonText = isWebcamVisible ? 'Hide Cam' : 'Show Cam';
    const webcamButtonClass = `webcam-button ${isWebcamVisible ? 'active' : ''}`;

    return (
        <div className="input-area">
            <input
                type="text"
                id="message-input"
                className="message-input"
                placeholder="Type your message or use the mic..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                aria-label="Message Input"
            />
            <button
                className="send-button"
                onClick={handleSend}
                aria-label="Send Message"
            >
                Send
            </button>
            <button
                className={muteButtonClass}
                onClick={onToggleMute}
                disabled={isMuteButtonDisabled}
                aria-label={muteButtonText}
            >
                {muteButtonText}
            </button>
            <button
                className={webcamButtonClass}
                onClick={onToggleWebcam}
                aria-label={webcamButtonText}
            >
                {webcamButtonText}
            </button>
        </div>
    );
}

InputArea.propTypes = {
    onSendText: PropTypes.func.isRequired,
    isMuted: PropTypes.bool.isRequired,
    isListening: PropTypes.bool.isRequired,
    onToggleMute: PropTypes.func.isRequired,
    micSupported: PropTypes.bool.isRequired,
    isWebcamVisible: PropTypes.bool.isRequired,
    onToggleWebcam: PropTypes.func.isRequired,
};

export default InputArea;