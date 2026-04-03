import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "../../lib/icons";
import "./pagination-styles.css";

/**
 * Reusable Pagination component for server-side paginated lists.
 *
 * @param {number} currentPage  – 1-indexed current page
 * @param {number} totalCount   – total number of rows returned by the server
 * @param {number} pageSize     – rows per page
 * @param {function} onPageChange   – (newPage: number) => void
 * @param {function} onPageSizeChange – (newSize: number) => void  (optional)
 * @param {number[]} pageSizeOptions – available page sizes (default [10, 20, 50])
 */
const Pagination = ({
    currentPage,
    totalCount,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50],
}) => {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const from = Math.min((currentPage - 1) * pageSize + 1, totalCount);
    const to = Math.min(currentPage * pageSize, totalCount);

    // Build the page-number array with ellipsis markers
    const pages = useMemo(() => {
        const items = [];
        const maxVisible = 7; // max page buttons shown (including ellipses)

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) items.push(i);
            return items;
        }

        // Always show first page
        items.push(1);

        if (currentPage > 3) items.push("...");

        // Window around current page
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) items.push(i);

        if (currentPage < totalPages - 2) items.push("...");

        // Always show last page
        items.push(totalPages);

        return items;
    }, [currentPage, totalPages]);

    if (totalCount <= 0) return null;

    return (
        <div className="pagination-container">
            {/* Left: info */}
            <div className="pagination-info">
                Showing <strong>{from}</strong>–<strong>{to}</strong> of{" "}
                <strong>{totalCount}</strong>
            </div>

            {/* Center: page buttons */}
            <div className="pagination-controls">
                <button
                    type="button"
                    className="pagination-btn nav-btn"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={16} />
                </button>

                {pages.map((page, idx) =>
                    page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                            …
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            className={`pagination-btn ${page === currentPage ? "active" : ""}`}
                            onClick={() => onPageChange(page)}
                            aria-label={`Page ${page}`}
                            aria-current={page === currentPage ? "page" : undefined}
                        >
                            {page}
                        </button>
                    ),
                )}

                <button
                    type="button"
                    className="pagination-btn nav-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    aria-label="Next page"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Right: page-size selector */}
            {onPageSizeChange && (
                <div className="pagination-page-size">
                    <label htmlFor="page-size-select">Rows</label>
                    <select
                        id="page-size-select"
                        value={pageSize}
                        onChange={(e) => {
                            onPageSizeChange(Number(e.target.value));
                            onPageChange(1); // reset to first page when size changes
                        }}
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalCount: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onPageSizeChange: PropTypes.func,
    pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
};

export default React.memo(Pagination);
