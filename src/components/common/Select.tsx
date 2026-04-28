import React, { forwardRef } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
    helper?: string;
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, error, helper, placeholder, className = '', id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

        const baseStyles = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed';
        const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-gray-700">
                        {label}
                        {props.required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                )}

                <select
                    ref={ref}
                    id={selectId}
                    className={`${baseStyles} ${errorStyles} ${className}`}
                    aria-invalid={!!error}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

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

Select.displayName = 'Select';