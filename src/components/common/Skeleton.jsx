import React from "react";
import PropTypes from "prop-types";
import "./Skeleton.css";

/**
 * Base Skeleton Component - Creates a shimmering placeholder
 */
export const Skeleton = ({
    width = "100%",
    height = "16px",
    borderRadius = "4px",
    className = "",
    variant = "default",
    animation = "shimmer"
}) => {
    return (
        <div
            className={`skeleton skeleton--${variant} skeleton--${animation} ${className}`}
            style={{
                width,
                height,
                borderRadius
            }}
        />
    );
};

Skeleton.propTypes = {
    width: PropTypes.string,
    height: PropTypes.string,
    borderRadius: PropTypes.string,
    className: PropTypes.string,
    variant: PropTypes.oneOf(["default", "dark", "light"]),
    animation: PropTypes.oneOf(["shimmer", "pulse", "wave"]),
};

/**
 * Skeleton Text - For text placeholders
 */
export const SkeletonText = ({ lines = 1, gap = "8px", lastLineWidth = "60%" }) => (
    <div className="skeleton-text" style={{ gap }}>
        {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
                key={index}
                width={index === lines - 1 && lines > 1 ? lastLineWidth : "100%"}
                height="14px"
            />
        ))}
    </div>
);

SkeletonText.propTypes = {
    lines: PropTypes.number,
    gap: PropTypes.string,
    lastLineWidth: PropTypes.string,
};

/**
 * Skeleton Avatar - For circular/square avatar placeholders
 */
export const SkeletonAvatar = ({ size = "40px", shape = "circle" }) => (
    <Skeleton
        width={size}
        height={size}
        borderRadius={shape === "circle" ? "50%" : "8px"}
        className="skeleton-avatar"
    />
);

SkeletonAvatar.propTypes = {
    size: PropTypes.string,
    shape: PropTypes.oneOf(["circle", "square"]),
};

/**
 * Skeleton Button - For button placeholders
 */
export const SkeletonButton = ({ width = "100px", height = "36px" }) => (
    <Skeleton width={width} height={height} borderRadius="6px" className="skeleton-button" />
);

SkeletonButton.propTypes = {
    width: PropTypes.string,
    height: PropTypes.string,
};

/**
 * Skeleton Card - Pre-built card skeleton
 */
export const SkeletonCard = ({
    hasAvatar = false,
    hasImage = false,
    lines = 3,
    className = ""
}) => (
    <div className={`skeleton-card ${className}`}>
        {hasImage && (
            <Skeleton width="100%" height="160px" borderRadius="0" className="skeleton-card-image" />
        )}
        <div className="skeleton-card-content">
            {hasAvatar && (
                <div className="skeleton-card-header">
                    <SkeletonAvatar size="40px" />
                    <div className="skeleton-card-header-text">
                        <Skeleton width="120px" height="14px" />
                        <Skeleton width="80px" height="12px" />
                    </div>
                </div>
            )}
            <SkeletonText lines={lines} />
        </div>
    </div>
);

SkeletonCard.propTypes = {
    hasAvatar: PropTypes.bool,
    hasImage: PropTypes.bool,
    lines: PropTypes.number,
    className: PropTypes.string,
};

/**
 * Skeleton Table Row - For table row placeholders
 */
const columnWidths = ['40%', '25%', '35%', '20%', '30%', '45%', '22%', '28%', '38%', '32%'];

export const SkeletonTableRow = ({ columns = 5, hasCheckbox = false, hasAvatar = false }) => (
    <div className="skeleton-table-row">
        {hasCheckbox && <Skeleton width="20px" height="20px" borderRadius="4px" />}
        {hasAvatar && <SkeletonAvatar size="36px" />}
        {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
                key={index}
                width={index === 0 ? "40%" : columnWidths[index % columnWidths.length]}
                height="14px"
            />
        ))}
    </div>
);

SkeletonTableRow.propTypes = {
    columns: PropTypes.number,
    hasCheckbox: PropTypes.bool,
    hasAvatar: PropTypes.bool,
};

/**
 * Skeleton Table - Complete table skeleton
 */
const headerWidths = ['70px', '90px', '80px', '100px', '85px', '75px', '95px', '88px', '72px', '82px'];

export const SkeletonTable = ({ rows = 5, columns = 5, hasCheckbox = false, hasAvatar = false }) => (
    <div className="skeleton-table">
        <div className="skeleton-table-header">
            {hasCheckbox && <Skeleton width="20px" height="20px" borderRadius="4px" />}
            {Array.from({ length: columns }).map((_, index) => (
                <Skeleton key={index} width={headerWidths[index % headerWidths.length]} height="12px" />
            ))}
        </div>
        <div className="skeleton-table-body">
            {Array.from({ length: rows }).map((_, index) => (
                <SkeletonTableRow
                    key={index}
                    columns={columns}
                    hasCheckbox={hasCheckbox}
                    hasAvatar={hasAvatar}
                />
            ))}
        </div>
    </div>
);

SkeletonTable.propTypes = {
    rows: PropTypes.number,
    columns: PropTypes.number,
    hasCheckbox: PropTypes.bool,
    hasAvatar: PropTypes.bool,
};

/**
 * Skeleton Stat Card - For dashboard stat cards
 */
export const SkeletonStatCard = ({ hasIcon = true }) => (
    <div className="skeleton-stat-card">
        {hasIcon && <Skeleton width="48px" height="48px" borderRadius="12px" />}
        <div className="skeleton-stat-content">
            <Skeleton width="80px" height="12px" />
            <Skeleton width="60px" height="24px" />
        </div>
    </div>
);

SkeletonStatCard.propTypes = {
    hasIcon: PropTypes.bool,
};

/**
 * Skeleton Chart - For chart placeholders
 */
export const SkeletonChart = ({ height = "300px", hasTitle = true }) => (
    <div className="skeleton-chart">
        {hasTitle && <Skeleton width="150px" height="18px" className="skeleton-chart-title" />}
        <Skeleton width="100%" height={height} borderRadius="8px" />
    </div>
);

SkeletonChart.propTypes = {
    height: PropTypes.string,
    hasTitle: PropTypes.bool,
};

/**
 * Skeleton List Item - For list items with optional avatar
 */
export const SkeletonListItem = ({ hasAvatar = true, hasAction = false }) => (
    <div className="skeleton-list-item">
        {hasAvatar && <SkeletonAvatar size="40px" />}
        <div className="skeleton-list-item-content">
            <Skeleton width="70%" height="14px" />
            <Skeleton width="40%" height="12px" />
        </div>
        {hasAction && <Skeleton width="32px" height="32px" borderRadius="6px" />}
    </div>
);

SkeletonListItem.propTypes = {
    hasAvatar: PropTypes.bool,
    hasAction: PropTypes.bool,
};

/**
 * Skeleton Employee Card - For employee grid/list items
 */
export const SkeletonEmployeeCard = () => (
    <div className="skeleton-employee-card">
        <div className="skeleton-employee-header">
            <SkeletonAvatar size="64px" />
            <div className="skeleton-employee-actions">
                <Skeleton width="28px" height="28px" borderRadius="6px" />
                <Skeleton width="28px" height="28px" borderRadius="6px" />
            </div>
        </div>
        <div className="skeleton-employee-info">
            <Skeleton width="70%" height="16px" />
            <Skeleton width="50%" height="12px" />
            <Skeleton width="80px" height="22px" borderRadius="11px" />
        </div>
        <div className="skeleton-employee-details">
            <Skeleton width="100%" height="12px" />
            <Skeleton width="100%" height="12px" />
            <Skeleton width="60%" height="12px" />
        </div>
    </div>
);

/**
 * Skeleton Task Card - For task items
 */
export const SkeletonTaskCard = () => (
    <div className="skeleton-task-card">
        <div className="skeleton-task-header">
            <Skeleton width="60px" height="20px" borderRadius="10px" />
            <Skeleton width="24px" height="24px" borderRadius="6px" />
        </div>
        <Skeleton width="85%" height="16px" />
        <Skeleton width="60%" height="12px" />
        <div className="skeleton-task-footer">
            <SkeletonAvatar size="24px" />
            <Skeleton width="80px" height="12px" />
        </div>
    </div>
);

/**
 * Skeleton Event Card - For calendar events
 */
export const SkeletonEventCard = () => (
    <div className="skeleton-event-card">
        <Skeleton width="48px" height="48px" borderRadius="8px" />
        <div className="skeleton-event-content">
            <Skeleton width="70%" height="14px" />
            <Skeleton width="50%" height="12px" />
        </div>
    </div>
);

/**
 * Skeleton Page Header - For page title and actions
 */
export const SkeletonPageHeader = ({ hasActions = true }) => (
    <div className="skeleton-page-header">
        <div className="skeleton-page-title">
            <Skeleton width="200px" height="28px" />
            <Skeleton width="300px" height="14px" />
        </div>
        {hasActions && (
            <div className="skeleton-page-actions">
                <SkeletonButton width="100px" />
                <SkeletonButton width="120px" />
            </div>
        )}
    </div>
);

SkeletonPageHeader.propTypes = {
    hasActions: PropTypes.bool,
};

/**
 * Skeleton Filter Bar - For filter/search bars
 */
export const SkeletonFilterBar = ({ hasSearch = true, filterCount = 3 }) => (
    <div className="skeleton-filter-bar">
        {hasSearch && <Skeleton width="280px" height="40px" borderRadius="8px" />}
        <div className="skeleton-filters">
            {Array.from({ length: filterCount }).map((_, index) => (
                <Skeleton key={index} width="100px" height="36px" borderRadius="6px" />
            ))}
        </div>
    </div>
);

SkeletonFilterBar.propTypes = {
    hasSearch: PropTypes.bool,
    filterCount: PropTypes.number,
};

/**
 * Skeleton Leave Card - For leave balance cards
 */
export const SkeletonLeaveCard = () => (
    <div className="skeleton-leave-card">
        <div className="skeleton-leave-icon">
            <Skeleton width="40px" height="40px" borderRadius="10px" />
        </div>
        <div className="skeleton-leave-info">
            <Skeleton width="80px" height="12px" />
            <Skeleton width="40px" height="24px" />
            <Skeleton width="60px" height="10px" />
        </div>
    </div>
);

/**
 * Skeleton Settings Section - For settings page sections
 */
export const SkeletonSettingsSection = ({ rows = 4 }) => (
    <div className="skeleton-settings-section">
        <Skeleton width="120px" height="20px" className="skeleton-section-title" />
        <div className="skeleton-settings-items">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="skeleton-settings-item">
                    <div className="skeleton-settings-label">
                        <Skeleton width="140px" height="14px" />
                        <Skeleton width="200px" height="12px" />
                    </div>
                    <Skeleton width="100px" height="36px" borderRadius="6px" />
                </div>
            ))}
        </div>
    </div>
);

SkeletonSettingsSection.propTypes = {
    rows: PropTypes.number,
};

/**
 * Skeleton Calendar - For calendar view
 */
export const SkeletonCalendar = () => (
    <div className="skeleton-calendar">
        <div className="skeleton-calendar-header">
            <Skeleton width="32px" height="32px" borderRadius="6px" />
            <Skeleton width="150px" height="20px" />
            <Skeleton width="32px" height="32px" borderRadius="6px" />
        </div>
        <div className="skeleton-calendar-weekdays">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((_, index) => (
                <Skeleton key={index} width="30px" height="14px" />
            ))}
        </div>
        <div className="skeleton-calendar-grid">
            {Array.from({ length: 35 }).map((_, index) => (
                <Skeleton key={index} width="100%" height="80px" borderRadius="4px" />
            ))}
        </div>
    </div>
);

/**
 * Skeleton Time Entry - For time tracking entries
 */
export const SkeletonTimeEntry = () => (
    <div className="skeleton-time-entry">
        <Skeleton width="60px" height="60px" borderRadius="8px" />
        <div className="skeleton-time-entry-content">
            <Skeleton width="150px" height="14px" />
            <Skeleton width="100px" height="12px" />
        </div>
        <div className="skeleton-time-entry-hours">
            <Skeleton width="50px" height="20px" />
        </div>
    </div>
);

/**
 * Skeleton Report Card - For report items
 */
export const SkeletonReportCard = () => (
    <div className="skeleton-report-card">
        <Skeleton width="48px" height="48px" borderRadius="12px" />
        <div className="skeleton-report-info">
            <Skeleton width="100px" height="14px" />
            <Skeleton width="150px" height="12px" />
        </div>
        <Skeleton width="32px" height="32px" borderRadius="6px" />
    </div>
);

// Default export with all skeleton components
const SkeletonComponents = {
    Skeleton,
    SkeletonText,
    SkeletonAvatar,
    SkeletonButton,
    SkeletonCard,
    SkeletonTableRow,
    SkeletonTable,
    SkeletonStatCard,
    SkeletonChart,
    SkeletonListItem,
    SkeletonEmployeeCard,
    SkeletonTaskCard,
    SkeletonEventCard,
    SkeletonPageHeader,
    SkeletonFilterBar,
    SkeletonLeaveCard,
    SkeletonSettingsSection,
    SkeletonCalendar,
    SkeletonTimeEntry,
    SkeletonReportCard,
};

export default SkeletonComponents;
