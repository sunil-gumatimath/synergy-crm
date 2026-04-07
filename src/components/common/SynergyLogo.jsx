import React from "react";
import PropTypes from "prop-types";

/**
 * Synergy Logo - "The Infinity Ribbon"
 * Represents seamless connection, continuous growth, and infinite potential.
 */
const SynergyLogo = ({ size = 32, className = "" }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="Synergy Logo"
        >
            <defs>
                <linearGradient id="syn-grad-1" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" /> {/* Violet */}
                    <stop offset="100%" stopColor="#4f46e5" /> {/* Indigo */}
                </linearGradient>
                <linearGradient id="syn-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" /> {/* Pink */}
                    <stop offset="100%" stopColor="#8b5cf6" /> {/* Violet */}
                </linearGradient>
                <filter id="ribbon-shadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Left Ribbon (Bottom Left -> Top Left -> Bottom Right) */}
            <path
                d="M 22 44 C 4 44, 4 20, 22 20 C 32 20, 32 44, 42 44"
                stroke="url(#syn-grad-1)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            
            {/* Right Ribbon (Bottom Right -> Top Right -> Bottom Left) with shadow drop */}
            <path
                d="M 42 44 C 60 44, 60 20, 42 20 C 32 20, 32 44, 22 44"
                stroke="url(#syn-grad-2)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#ribbon-shadow)"
            />

            {/* Accent Spark */}
            <circle cx="32" cy="32" r="3" fill="#ffffff" opacity="0.9" />
        </svg>
    );
};

SynergyLogo.propTypes = {
    size: PropTypes.number,
    className: PropTypes.string,
};

export default SynergyLogo;
