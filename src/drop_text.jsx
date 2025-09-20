import React from 'react';
import './dropping_text.css';

const DroppingText = ({ text }) => {
    // Use a regex to split by both characters and spaces, keeping the spaces
    const letters = text.split(/(?!$)/).map(char => char === ' ' ? ' ' : char);

    // Or, a simpler way:
    // const words = text.split(' ');

    return (
        <div className="text-container">
            {text.split('').map((char, index) => (
                <span
                    key={index}
                    className={`dropping-letter ${char === ' ' ? 'space' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    {char === ' ' ? '\u00A0' : char}
                    
                </span>
                
            ))}
        </div>
    );
};

export default DroppingText;