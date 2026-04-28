import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helper?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helper, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

        const baseStyles = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed';

        const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

        const iconStyles = {
            left: 'pl-10',
            right: 'pr-10',
        };

        let iconClasses = '';
        if (leftIcon) iconClasses += iconStyles.left;
        if (rightIcon) iconClasses += iconStyles.right;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
                        {label}
                        {props.required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={`${baseStyles} ${errorStyles} ${iconClasses} ${className}`}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {helper && !error && (
                    <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
                        {helper}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';