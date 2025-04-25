// src/components/Message.jsx
import React from 'react';
import PropTypes from 'prop-types';
// Using the updated CSS from ChatBox.css

function Message({ message }) {
    const { sender, text } = message;

    // Determine the CSS class based on the sender
    const messageClass = sender === 'user' ? 'user-message' : 'ada-message';

    return (
        <div className={`message ${messageClass}`}>
            <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
        </div>
    );
}

Message.propTypes = {
    message: PropTypes.shape({
        sender: PropTypes.oneOf(['user', 'ada']).isRequired,
        text: PropTypes.string.isRequired,
    }).isRequired,
};

export default Message;