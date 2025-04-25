// src/components/ChatBox.jsx
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Message from './Message'; // Import the Message component
import './ChatBox.css'; // Using the updated CSS

function ChatBox({ messages }) {
    const chatboxRef = useRef(null);

    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTo({
                top: chatboxRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    return (
        <div className="chatbox" ref={chatboxRef}>
            {messages.map((msg, index) => (
                <Message
                    key={index}
                    message={msg}
                />
            ))}
        </div>
    );
}

ChatBox.propTypes = {
    messages: PropTypes.arrayOf(PropTypes.shape({
        sender: PropTypes.oneOf(['user', 'ada']).isRequired,
        text: PropTypes.string.isRequired,
    })).isRequired,
};

export default ChatBox;