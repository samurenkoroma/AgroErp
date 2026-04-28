import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helper?: string;
    rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helper, rows = 3, className = '', id, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');

        const baseStyles = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed';
        const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={textareaId} className="mb-1 block text-sm font-medium text-gray-700">
                        {label}
                        {props.required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                )}

                <textarea
                    ref={ref}
                    id={textareaId}
                    rows={rows}
                    className={`${baseStyles} ${errorStyles} ${className}`}
                    aria-invalid={!!error}
                    {...props}
                />

                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}

                {helper && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helper}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';