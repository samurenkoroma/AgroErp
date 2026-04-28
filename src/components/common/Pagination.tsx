import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingsCount?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
                                                          currentPage,
                                                          totalPages,
                                                          onPageChange,
                                                          siblingsCount = 1,
                                                      }) => {
    const range = (start: number, end: number) => {
        const length = end - start + 1;
        return Array.from({ length }, (_, i) => start + i);
    };

    const getPageNumbers = () => {
        const totalNumbers = siblingsCount * 2 + 3;
        const totalBlocks = totalNumbers + 2;

        if (totalPages <= totalBlocks) {
            return range(1, totalPages);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingsCount, totalPages);

        const showLeftDots = leftSiblingIndex > 2;
        const showRightDots = rightSiblingIndex < totalPages - 1;

        if (!showLeftDots && showRightDots) {
            const leftRange = range(1, totalNumbers - 2);
            return [...leftRange, '...', totalPages];
        }

        if (showLeftDots && !showRightDots) {
            const rightRange = range(totalPages - (totalNumbers - 2) + 1, totalPages);
            return [1, '...', ...rightRange];
        }

        if (showLeftDots && showRightDots) {
            const middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [1, '...', ...middleRange, '...', totalPages];
        }

        return [];
    };

    const pageNumbers = getPageNumbers();

    if (totalPages <= 1) return null;

    return (
        <nav className="flex items-center justify-center gap-1 py-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                ←
            </button>

            {pageNumbers.map((page, idx) => (
                <button
                    key={idx}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                    className={`rounded-md border px-3 py-2 text-sm font-medium ${
                        page === currentPage
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 hover:bg-gray-50'
                    } ${page === '...' ? 'cursor-default border-transparent' : ''}`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                →
            </button>
        </nav>
    );
};