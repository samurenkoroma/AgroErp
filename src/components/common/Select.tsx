// src/components/ui/Select.tsx
import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
    description?: string;
    color?: string;
}

interface SelectProps {
    value?: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

const sizeClasses = {
    sm: 'py-1.5 text-sm',
    md: 'py-2 text-base',
    lg: 'py-2.5 text-lg'
};

const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
};

export const Select = ({
                           value,
                           onChange,
                           options,
                           placeholder = 'Выберите...',
                           label,
                           error,
                           required,
                           disabled = false,
                           searchable = false,
                           clearable = false,
                           className = '',
                           size = 'md',
                           fullWidth = true
                       }: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Фильтрация опций при поиске
    const filteredOptions = searchable && searchTerm
        ? options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : options;

    // Закрытие при клике вне
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Фокус на поиск при открытии
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen, searchable]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSearchTerm('');
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <div ref={containerRef} className={`${widthClass} ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {/* Trigger button */}
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
            ${sizeClasses[size]}
            ${widthClass}
            px-3 pr-8
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            rounded-lg
            text-left
            flex items-center justify-between
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : 'hover:border-green-400 focus:ring-2 focus:ring-green-500 focus:border-green-500'}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
                >
                    <div className="flex items-center gap-2 truncate">
                        {selectedOption?.icon && (
                            <span className="shrink-0">{selectedOption.icon}</span>
                        )}
                        <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
              {selectedOption?.label || placeholder}
            </span>
                        {selectedOption?.description && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                {selectedOption.description}
              </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {clearable && value && !disabled && (
                            <button
                                onClick={handleClear}
                                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X className={`${iconSizeClasses[size]} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`} />
                            </button>
                        )}
                        <ChevronDown
                            className={`
                ${iconSizeClasses[size]} 
                text-gray-400 
                transition-transform duration-200
                ${isOpen ? 'rotate-180' : ''}
              `}
                        />
                    </div>
                </button>

                {/* Dropdown menu */}
                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                        {/* Search input */}
                        {searchable && (
                            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Поиск..."
                                        className="w-full pl-8 pr-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Options list */}
                        <div className="max-h-60 overflow-y-auto">
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                    Ничего не найдено
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSelect(option.value)}
                                        disabled={option.disabled}
                                        className={`
                      w-full px-3 py-2.5
                      flex items-center justify-between
                      text-left
                      transition-colors duration-150
                      ${option.disabled
                                            ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }
                      ${value === option.value ? 'bg-green-50 dark:bg-green-900/20' : ''}
                    `}
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {option.icon && <span className="shrink-0">{option.icon}</span>}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${
                              value === option.value
                                  ? 'text-green-700 dark:text-green-400'
                                  : 'text-gray-900 dark:text-white'
                          }`}>
                            {option.label}
                          </span>
                                                    {option.color && (
                                                        <span
                                                            className="w-2 h-2 rounded-full shrink-0"
                                                            style={{ backgroundColor: option.color }}
                                                        />
                                                    )}
                                                </div>
                                                {option.description && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {option.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {value === option.value && (
                                            <Check className="w-4 h-4 text-green-500 shrink-0 ml-2" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

// Вариант с группировкой
export interface GroupedSelectOption {
    label: string;
    options: SelectOption[];
}

interface GroupedSelectProps extends Omit<SelectProps, 'options'> {
    groupedOptions: GroupedSelectOption[];
}

export const GroupedSelect = ({
                                  groupedOptions,
                                  value,
                                  onChange,
                                  placeholder,
                                  label,
                                  error,
                                  required,
                                  disabled,
                                  searchable = false,
                                  className = '',
                                  size = 'md',
                                  fullWidth = true
                              }: GroupedSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Все опции для поиска
    const allOptions = groupedOptions.flatMap(group => group.options);
    const selectedOption = allOptions.find(opt => opt.value === value);

    // Фильтрация групп при поиске
    const filteredGroups = searchable && searchTerm
        ? groupedOptions
            .map(group => ({
                ...group,
                options: group.options.filter(opt =>
                    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
                )
            }))
            .filter(group => group.options.length > 0)
        : groupedOptions;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen, searchable]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <div ref={containerRef} className={`${widthClass} ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
            ${sizeClasses[size]}
            ${widthClass}
            px-3 pr-8
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            rounded-lg
            text-left
            flex items-center justify-between
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : 'hover:border-green-400 focus:ring-2 focus:ring-green-500 focus:border-green-500'}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
                >
                    <div className="flex items-center gap-2 truncate">
                        {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
                        <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
              {selectedOption?.label || placeholder}
            </span>
                    </div>
                    <ChevronDown
                        className={`
              ${iconSizeClasses[size]} 
              text-gray-400 
              transition-transform duration-200
              ${isOpen ? 'rotate-180' : ''}
            `}
                    />
                </button>

                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                        {searchable && (
                            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Поиск..."
                                        className="w-full pl-8 pr-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="max-h-60 overflow-y-auto">
                            {filteredGroups.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                    Ничего не найдено
                                </div>
                            ) : (
                                filteredGroups.map((group, groupIdx) => (
                                    <div key={groupIdx}>
                                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/50">
                                            {group.label}
                                        </div>
                                        {group.options.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleSelect(option.value)}
                                                disabled={option.disabled}
                                                className={`
                          w-full px-3 py-2
                          flex items-center justify-between
                          text-left
                          transition-colors duration-150
                          ${option.disabled
                                                    ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }
                          ${value === option.value ? 'bg-green-50 dark:bg-green-900/20' : ''}
                        `}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {option.icon && <span>{option.icon}</span>}
                                                    <span className={`text-sm ${
                                                        value === option.value
                                                            ? 'text-green-700 dark:text-green-400 font-medium'
                                                            : 'text-gray-900 dark:text-white'
                                                    }`}>
                            {option.label}
                          </span>
                                                </div>
                                                {value === option.value && (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};