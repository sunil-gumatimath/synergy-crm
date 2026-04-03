
import React from "react";
import PropTypes from "prop-types";

/**
 * Synergy Logo - "The Orbital"
 * Represents connection, 360-degree management, and dynamic flow.
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
                <linearGradient id="synergyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" /> {/* Indigo-500 */}
                    <stop offset="50%" stopColor="#8b5cf6" /> {/* Violet-500 */}
                    <stop offset="100%" stopColor="#ec4899" /> {/* Pink-500 */}
                </linearGradient>
                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Orbit Ring 1 (Top-Right to Bottom-Left) */}
            <path
                d="M32 8 C 45.25 8, 56 18.75, 56 32 C 56 45.25, 45.25 56, 32 56"
                stroke="url(#synergyGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                filter="url(#softGlow)"
            />

            {/* Orbit Ring 2 (Bottom-Left to Top-Right - Offset) */}
            <path
                d="M32 56 C 18.75 56, 8 45.25, 8 32 C 8 18.75, 18.75 8, 32 8"
                stroke="url(#synergyGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                strokeOpacity="0.6"
            />

            {/* Central Connector (The "S" Energy) */}
            <path
                d="M24 32 L40 32"
                stroke="url(#synergyGradient)"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <circle cx="32" cy="32" r="6" fill="url(#synergyGradient)" />
            <circle cx="32" cy="32" r="2" fill="white" />
        </svg>
    );
};

SynergyLogo.propTypes = {
    size: PropTypes.number,
    className: PropTypes.string,
};

export default SynergyLogo;
