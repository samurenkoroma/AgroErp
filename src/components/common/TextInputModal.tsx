import { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface TextInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    title: string;
    label?: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
    required?: boolean;
    multiline?: boolean;
    rows?: number;
}

export function TextInputModal({
                                   isOpen,
                                   onClose,
                                   onConfirm,
                                   title,
                                   label,
                                   placeholder = 'Введите значение...',
                                   defaultValue = '',
                                   confirmText = 'Подтвердить',
                                   cancelText = 'Отмена',
                                   required = false,
                                   multiline = false,
                                   rows = 3,
                               }: TextInputModalProps) {
    const [value, setValue] = useState(defaultValue);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
            setError('');
        }
    }, [isOpen, defaultValue]);

    const handleConfirm = () => {
        if (required && !value.trim()) {
            setError('Это поле обязательно для заполнения');
            return;
        }
        onConfirm(value);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            handleConfirm();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                {multiline ? (
                    <textarea
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder={placeholder}
                        rows={rows}
                        className={`
                            w-full px-4 py-2 
                            border rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-green-500 
                            bg-white dark:bg-gray-800 
                            text-gray-900 dark:text-white 
                            placeholder:text-gray-400 dark:placeholder:text-gray-500
                            resize-none
                            transition-colors
                            ${error
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-gray-300 dark:border-gray-700'
                        }
                        `}
                        autoFocus
                    />
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            if (error) setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={`
                            w-full px-4 py-2 
                            border rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-green-500 
                            bg-white dark:bg-gray-800 
                            text-gray-900 dark:text-white 
                            placeholder:text-gray-400 dark:placeholder:text-gray-500
                            transition-colors
                            ${error
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-gray-300 dark:border-gray-700'
                        }
                        `}
                        autoFocus
                    />
                )}

                {error && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}

                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}