import React, { forwardRef } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, error, className = '', id, ...props }, ref) => {
        const checkboxId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="flex items-start">
                <div className="flex h-5 items-center">
                    <input
                        ref={ref}
                        type="checkbox"
                        id={checkboxId}
                        className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
                        {...props}
                    />
                </div>
                {label && (
                    <label htmlFor={checkboxId} className="ml-2 text-sm text-gray-700">
                        {label}
                    </label>
                )}
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';