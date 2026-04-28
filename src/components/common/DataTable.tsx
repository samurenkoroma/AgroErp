import React from 'react';

export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
}

export const DataTable = <T extends Record<string, any>>({
                                                             columns,
                                                             data,
                                                             loading = false,
                                                             emptyMessage = 'Нет данных',
                                                             onRowClick,
                                                         }: DataTableProps<T>) => {
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="py-8 text-center text-gray-500">{emptyMessage}</div>
        );
    }

    const getValue = (row: T, column: Column<T>): React.ReactNode => {
        // Если есть кастомный рендер — используем его
        if (column.render) {
            try {
                const result = column.render(row);
                // Проверяем, не возвращает ли render undefined
                if (result === undefined || result === null) {
                    return '—';
                }
                return result;
            } catch (error) {
                console.error(`❌ Error in render for column "${String(column.key)}":`, error);
                return 'Ошибка';
            }
        }

        // Иначе получаем значение по ключу
        const value = row[column.key as keyof T];

        if (value === null || value === undefined) {
            return '—';
        }

        if (typeof value === 'object') {
            if (value instanceof Date) {
                return value.toLocaleDateString();
            }
            if (Array.isArray(value)) {
                return value.length > 0 ? value.join(', ') : '—';
            }
            // Для объектов — возвращаем JSON строку для отладки
            try {
                return JSON.stringify(value);
            } catch {
                return '[Object]';
            }
        }

        return String(value);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    {columns.map((column) => (
                        <th
                            key={String(column.key)}
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                            {column.label}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((row, idx) => (
                    <tr
                        key={idx}
                        onClick={() => onRowClick?.(row)}
                        className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                    >
                        {columns.map((column) => (
                            <td key={String(column.key)} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                {getValue(row, column)}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};