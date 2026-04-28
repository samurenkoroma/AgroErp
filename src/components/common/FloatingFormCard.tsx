import React from 'react';
import { Card } from './Card';

interface FloatingFormCardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const FloatingFormCard: React.FC<FloatingFormCardProps> = ({
                                                                      title,
                                                                      children,
                                                                      className = '',
                                                                  }) => {
    return (
        <div className={`bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gray-200 ${className}`}>
            {title && <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">{title}</h3>}
            {children}
        </div>
    );
};