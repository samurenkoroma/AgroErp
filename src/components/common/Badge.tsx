import React from 'react';

// Определяем допустимые варианты
export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    rounded?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
                                                children,
                                                variant = 'default',
                                                size = 'md',
                                                rounded = false,
                                            }) => {
    const variants: Record<BadgeVariant, string> = {
        success: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        default: 'bg-gray-100 text-gray-800',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
    };

    const roundedClass = rounded ? 'rounded-full' : 'rounded-md';

    return (
        <span
            className={`inline-flex items-center font-medium ${variants[variant]} ${sizes[size]} ${roundedClass}`}
        >
      {children}
    </span>
    );
};