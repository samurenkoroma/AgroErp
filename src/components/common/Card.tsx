import React from 'react';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    footer?: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
                                              children,
                                              title,
                                              subtitle,
                                              footer,
                                              className = '',
                                              onClick,
                                              hoverable = false,
                                          }) => {
    const baseStyles = 'bg-white rounded-lg shadow-md overflow-hidden';
    const hoverStyles = hoverable ? 'transition-shadow hover:shadow-lg cursor-pointer' : '';

    return (
        <div
            className={`${baseStyles} ${hoverStyles} ${className}`}
            onClick={onClick}
        >
            {(title || subtitle) && (
                <div className="border-b border-gray-200 p-4">
                    {title && <h3 className="text-lg font-semibold">{title}</h3>}
                    {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
                </div>
            )}

            <div className="p-4">{children}</div>

            {footer && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">{footer}</div>
            )}
        </div>
    );
};