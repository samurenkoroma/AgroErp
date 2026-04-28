import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'blue-600' }) => {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className="flex justify-center items-center">
            <div
                className={`${sizes[size]} animate-spin rounded-full border-4 border-gray-200 border-t-${color}`}
            />
        </div>
    );
};