import {useEffect, useState} from 'react';
import {Modal} from "@/components/common/Modal.tsx";
import {Input} from "@/components/ui/input.tsx";

interface CreateObjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: {
        name: string;
        width: number;
        length: number;
        type: 'field' | 'greenhouse' | 'plot'
    }) => void;
    title: string;
    label?: string;
    placeholder?: string;
    initialData?: {
        name: string;
        width: number;
        length: number;
        type: 'field' | 'greenhouse' | 'plot';
        geometryType?: string;
    };
    confirmText?: string;
    cancelText?: string;
}

export function CreateObjectModal({
                                      isOpen,
                                      onClose,
                                      onConfirm,
                                      title,
                                      label,
                                      initialData,
                                      confirmText = 'Подтвердить',
                                      cancelText = 'Отмена',
                                  }: CreateObjectModalProps) {
    const [name, setName] = useState('');
    const [width, setWidth] = useState<number>(0);
    const [length, setLength] = useState<number>(0);
    const [typeObj, setTypeObj] = useState<'field' | 'greenhouse' | 'plot'>('field');
    const [error, setError] = useState('');

    // Инициализация при открытии модального окна
    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || '');
            setWidth(initialData.width || 0);
            setLength(initialData.length || 0);
            setTypeObj(initialData.type || 'field');
            setError('');
        }
    }, [isOpen, initialData]);

    const handleConfirm = () => {
        if (!name.trim()) {
            setError('Пожалуйста, введите название');
            return;
        }

        onConfirm({
            name: name.trim(),
            width: width,
            length: length,
            type: typeObj,
        });
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
        }
    };

    // Определяем, показывать ли выбор типа объекта (только для полигонов)
    const showTypeSelect = initialData?.geometryType === 'Polygon';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                )}

                <Input
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Введите название..."
                    autoFocus
                />

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Ширина (м)</label>
                        <Input
                            type="number"
                            step="0.1"
                            disabled={ typeObj !== 'greenhouse'  }
                            value={width || ''}
                            onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                            placeholder="Ширина"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Длина (м)</label>
                        <Input
                            type="number"
                            step="0.1"
                            disabled={ typeObj !== 'greenhouse'  }
                            value={length || ''}
                            onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                            placeholder="Длина"
                        />
                    </div>
                </div>

                {showTypeSelect && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Тип объекта</label>
                        <select
                            value={typeObj}
                            onChange={(e) => setTypeObj(e.target.value as 'field' | 'plot')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
                        >
                            <option value="field">Поле</option>
                            <option value="plot">Участок</option>
                        </select>
                    </div>
                )}

                {error && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}

                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
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