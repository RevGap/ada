// src/components/StatusDisplay.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './StatusDisplay.css'; // Using the updated CSS
/**
 * Displays the current application status message.
 * @param {object} props - Component props.
 * @param {string} props.status - The status message to display.
 */
function StatusDisplay({ status }) {
    return (
        <div className="status-display">
            {status || '\u00A0'} {/* '\u00A0' is the unicode for &nbsp; */}
        </div>
    );
}

StatusDisplay.propTypes = {
    status: PropTypes.string.isRequired,
};

export default StatusDisplay;