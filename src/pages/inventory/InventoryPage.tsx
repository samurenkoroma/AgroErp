// pages/inventory/InventoryPage.tsx
import {useMemo, useState} from 'react';
import {
    AlertCircle,
    AlertTriangle,
    Box,
    CheckCircle,
    Clock,
    DollarSign,
    Flower2,
    Layers,
    Package,
    Plus,
    Search,
    Sprout,
    TrendingDown,
    TrendingUp,
    Warehouse,
    X
} from 'lucide-react';

// ==================== TYPES ====================

export interface InventoryItem {
    id: string;
    name: string;
    type: 'cassette' | 'pot' | 'soil' | 'fertilizer' | 'seed' | 'other';
    category: string;
    quantity: number;
    unit: string;
    minQuantity: number;
    maxQuantity?: number;
    location: string;
    supplier?: string;
    price?: number;
    lastRestocked?: string;
    expiryDate?: string;
    description?: string;
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
    specifications?: {
        size?: string;
        material?: string;
        cellsCount?: number;      // для кассет
        cellVolume?: number;      // мл, для кассет/стаканчиков
        dimensions?: string;      // для стаканчиков
        color?: string;
    };
    usage?: {
        totalUsed: number;
        currentUsage: number;
        plannedUsage: number;
    };
}

export interface InventoryTransaction {
    id: string;
    itemId: string;
    type: 'in' | 'out';
    quantity: number;
    date: string;
    reason: string;
    userId?: string;
    userName?: string;
    notes?: string;
}

// ==================== MOCK DATA ====================

const mockInventory: InventoryItem[] = [
    {
        id: '1',
        name: 'Кассета для рассады 40 ячеек',
        type: 'cassette',
        category: 'Кассеты',
        quantity: 150,
        unit: 'шт',
        minQuantity: 50,
        maxQuantity: 300,
        location: 'Склад А-1',
        supplier: 'ООО "АгроПласт"',
        price: 45,
        lastRestocked: '2025-03-15',
        description: 'Многоразовая кассета для рассады, ячейки 4x4 см',
        status: 'in_stock',
        specifications: {
            cellsCount: 40,
            cellVolume: 50,
            material: 'Полистирол',
            dimensions: '40x20x5 см',
            color: 'Черный'
        },
        usage: {
            totalUsed: 320,
            currentUsage: 120,
            plannedUsage: 200
        }
    },
    {
        id: '2',
        name: 'Кассета для рассады 72 ячейки',
        type: 'cassette',
        category: 'Кассеты',
        quantity: 80,
        unit: 'шт',
        minQuantity: 30,
        maxQuantity: 200,
        location: 'Склад А-1',
        supplier: 'ООО "АгроПласт"',
        price: 65,
        lastRestocked: '2025-03-10',
        status: 'in_stock',
        specifications: {
            cellsCount: 72,
            cellVolume: 35,
            material: 'Полистирол',
            dimensions: '54x28x5 см',
            color: 'Черный'
        },
        usage: {
            totalUsed: 180,
            currentUsage: 80,
            plannedUsage: 120
        }
    },
    {
        id: '3',
        name: 'Стаканчик пластиковый 0.5л',
        type: 'pot',
        category: 'Стаканчики',
        quantity: 2000,
        unit: 'шт',
        minQuantity: 500,
        maxQuantity: 5000,
        location: 'Склад Б-2',
        supplier: 'ООО "Сад-Огород"',
        price: 2.5,
        lastRestocked: '2025-03-20',
        status: 'in_stock',
        specifications: {
            size: '0.5л',
            material: 'Пластик',
            dimensions: '10x10x12 см',
            color: 'Прозрачный'
        },
        usage: {
            totalUsed: 3500,
            currentUsage: 2000,
            plannedUsage: 2500
        }
    },
    {
        id: '4',
        name: 'Стаканчик торфяной 0.3л',
        type: 'pot',
        category: 'Стаканчики',
        quantity: 150,
        unit: 'шт',
        minQuantity: 200,
        maxQuantity: 1000,
        location: 'Склад Б-2',
        supplier: 'ООО "Торф-Инвест"',
        price: 3.8,
        lastRestocked: '2025-02-28',
        expiryDate: '2025-12-31',
        status: 'low_stock',
        specifications: {
            size: '0.3л',
            material: 'Торф',
            dimensions: '8x8x10 см',
            color: 'Коричневый'
        },
        usage: {
            totalUsed: 850,
            currentUsage: 150,
            plannedUsage: 400
        }
    },
    {
        id: '5',
        name: 'Кассета для рассады 128 ячеек',
        type: 'cassette',
        category: 'Кассеты',
        quantity: 25,
        unit: 'шт',
        minQuantity: 40,
        maxQuantity: 150,
        location: 'Склад А-1',
        supplier: 'ООО "АгроПласт"',
        price: 95,
        lastRestocked: '2025-02-10',
        status: 'low_stock',
        specifications: {
            cellsCount: 128,
            cellVolume: 25,
            material: 'Полистирол',
            dimensions: '54x28x5 см',
            color: 'Черный'
        },
        usage: {
            totalUsed: 125,
            currentUsage: 25,
            plannedUsage: 100
        }
    }
];

const mockTransactions: InventoryTransaction[] = [
    {
        id: 't1',
        itemId: '1',
        type: 'in',
        quantity: 100,
        date: '2025-03-15',
        reason: 'Поставка от поставщика',
        userName: 'Иван Иванов',
        notes: 'Плановое пополнение склада'
    },
    {
        id: 't2',
        itemId: '1',
        type: 'out',
        quantity: 50,
        date: '2025-03-18',
        reason: 'Выдача для посева томатов',
        userName: 'Петр Петров',
        notes: 'Для теплицы №1'
    },
    {
        id: 't3',
        itemId: '3',
        type: 'out',
        quantity: 500,
        date: '2025-03-20',
        reason: 'Выдача для рассады',
        userName: 'Мария Сидорова',
        notes: 'Для участка Приусадебный'
    }
];

// ==================== COMPONENTS ====================

const StatCard = ({ title, value, unit, icon: Icon, color, trend }: any) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
                <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
            <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
);

const InventoryPage = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
    const [transactions] = useState<InventoryTransaction[]>(mockTransactions);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // Фильтрация
    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = selectedType === 'all' || item.type === selectedType;
            const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [inventory, searchTerm, selectedType, selectedStatus]);

    // Статистика
    const stats = useMemo(() => {
        const totalItems = inventory.length;
        const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
        const lowStockItems = inventory.filter(item => item.status === 'low_stock').length;
        const outOfStockItems = inventory.filter(item => item.status === 'out_of_stock').length;
        const totalValue = inventory.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

        return { totalItems, totalQuantity, lowStockItems, outOfStockItems, totalValue };
    }, [inventory]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'in_stock':
                return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'В наличии', icon: <CheckCircle className="w-3 h-3" /> };
            case 'low_stock':
                return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Мало', icon: <AlertCircle className="w-3 h-3" /> };
            case 'out_of_stock':
                return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Нет', icon: <AlertTriangle className="w-3 h-3" /> };
            case 'expired':
                return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', label: 'Просрочен', icon: <Clock className="w-3 h-3" /> };
            default:
                return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', label: status, icon: null };
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'cassette': return <Layers className="w-4 h-4" />;
            case 'pot': return <Box className="w-4 h-4" />;
            case 'soil': return <Sprout className="w-4 h-4" />;
            case 'fertilizer': return <Flower2 className="w-4 h-4" />;
            case 'seed': return <Sprout className="w-4 h-4" />;
            default: return <Package className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Package className="w-6 h-6 text-green-600" />
                                Инвентарь для рассады
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Управление кассетами, стаканчиками и материалами для рассады
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Добавить материал
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard title="Всего позиций" value={stats.totalItems} unit="" icon={Package} color="blue" />
                    <StatCard title="Общее количество" value={stats.totalQuantity} unit="шт" icon={Box} color="green" />
                    <StatCard title="Мало на складе" value={stats.lowStockItems} unit="" icon={AlertCircle} color="yellow" />
                    <StatCard title="Нет в наличии" value={stats.outOfStockItems} unit="" icon={AlertTriangle} color="red" />
                    <StatCard title="Общая стоимость" value={(stats.totalValue / 1000).toFixed(1)} unit="тыс ₽" icon={DollarSign} color="purple" />
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск по названию или категории..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                            <option value="all">Все типы</option>
                            <option value="cassette">Кассеты</option>
                            <option value="pot">Стаканчики</option>
                            <option value="soil">Грунт</option>
                            <option value="fertilizer">Удобрения</option>
                            <option value="seed">Семена</option>
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                            <option value="all">Все статусы</option>
                            <option value="in_stock">В наличии</option>
                            <option value="low_stock">Мало</option>
                            <option value="out_of_stock">Нет</option>
                        </select>
                    </div>
                </div>

                {/* Inventory Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInventory.map((item) => {
                        const statusBadge = getStatusBadge(item.status);
                        const isLowStock = item.quantity <= item.minQuantity && item.quantity > 0;
                        const isOutOfStock = item.quantity === 0;

                        return (
                            <div
                                key={item.id}
                                className={`bg-white dark:bg-gray-900 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                                    isLowStock ? 'border-yellow-300 dark:border-yellow-800' :
                                        isOutOfStock ? 'border-red-300 dark:border-red-800' :
                                            'border-gray-200 dark:border-gray-800'
                                }`}
                                onClick={() => setSelectedItem(item)}
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                                {getTypeIcon(item.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                                                <p className="text-xs text-gray-500">{item.category}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                      {statusBadge.icon}
                                            {statusBadge.label}
                    </span>
                                    </div>

                                    {/* Характеристики */}
                                    <div className="space-y-2 mb-4">
                                        {item.specifications?.cellsCount && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Ячеек:</span>
                                                <span className="font-medium">{item.specifications.cellsCount}</span>
                                            </div>
                                        )}
                                        {item.specifications?.cellVolume && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Объем ячейки:</span>
                                                <span className="font-medium">{item.specifications.cellVolume} мл</span>
                                            </div>
                                        )}
                                        {item.specifications?.size && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Объем:</span>
                                                <span className="font-medium">{item.specifications.size}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Количество:</span>
                                            <span className={`font-bold ${isLowStock ? 'text-yellow-600' : isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                        {item.quantity} {item.unit}
                      </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Мин. запас:</span>
                                            <span className="font-medium">{item.minQuantity} {item.unit}</span>
                                        </div>
                                        {item.price && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Цена:</span>
                                                <span className="font-medium">{item.price} ₽/{item.unit}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Прогресс запаса */}
                                    {item.maxQuantity && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500">Заполненность склада</span>
                                                <span className="text-gray-500">{Math.round((item.quantity / item.maxQuantity) * 100)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        item.quantity <= item.minQuantity ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                                    style={{ width: `${Math.min(100, (item.quantity / (item.maxQuantity || item.quantity)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Местоположение */}
                                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                                        <Warehouse className="w-3 h-3" />
                                        <span>{item.location}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredInventory.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            Материалы не найдены
                        </h3>
                        <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
                    </div>
                )}
            </div>

            {/* Модалка деталей */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedItem.name}</h2>
                                <p className="text-sm text-gray-500">{selectedItem.category}</p>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Детали */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                    <p className="text-sm text-gray-500">Количество</p>
                                    <p className={`text-2xl font-bold ${selectedItem.quantity <= selectedItem.minQuantity ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {selectedItem.quantity} {selectedItem.unit}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                    <p className="text-sm text-gray-500">Минимальный запас</p>
                                    <p className="text-2xl font-bold">{selectedItem.minQuantity} {selectedItem.unit}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                    <p className="text-sm text-gray-500">Местоположение</p>
                                    <p className="font-semibold">{selectedItem.location}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                    <p className="text-sm text-gray-500">Поставщик</p>
                                    <p className="font-semibold">{selectedItem.supplier || '—'}</p>
                                </div>
                            </div>

                            {/* Характеристики */}
                            {selectedItem.specifications && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Характеристики</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {Object.entries(selectedItem.specifications).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                        <span className="text-gray-500">
                          {key === 'cellsCount' ? 'Количество ячеек' :
                              key === 'cellVolume' ? 'Объем ячейки' :
                                  key === 'dimensions' ? 'Размеры' :
                                      key === 'material' ? 'Материал' :
                                          key === 'color' ? 'Цвет' : key}
                        </span>
                                                <span className="font-medium">
                          {typeof value === 'number' && key === 'cellVolume' ? `${value} мл` : value}
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Использование */}
                            {selectedItem.usage && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Статистика использования</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <p className="text-lg font-bold">{selectedItem.usage.totalUsed}</p>
                                            <p className="text-xs text-gray-500">Всего использовано</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <p className="text-lg font-bold">{selectedItem.usage.currentUsage}</p>
                                            <p className="text-xs text-gray-500">В текущем сезоне</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <p className="text-lg font-bold">{selectedItem.usage.plannedUsage}</p>
                                            <p className="text-xs text-gray-500">Запланировано</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Транзакции */}
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Последние операции</h3>
                                <div className="space-y-2">
                                    {transactions.filter(t => t.itemId === selectedItem.id).slice(0, 5).map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1 rounded-full ${t.type === 'in' ? 'bg-green-100' : 'bg-red-100'}`}>
                                                    {t.type === 'in' ? <TrendingUp className="w-3 h-3 text-green-600" /> : <TrendingDown className="w-3 h-3 text-red-600" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {t.type === 'in' ? '+' : '-'}{t.quantity} {selectedItem.unit}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{t.reason}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('ru')}</p>
                                                <p className="text-xs text-gray-400">{t.userName}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedItem(null);
                                    setIsTransactionModalOpen(true);
                                }}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Списать/Оприходовать
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedItem(null);
                                    setIsEditModalOpen(true);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Редактировать
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модалка добавления/редактирования */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-xl">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {isAddModalOpen ? 'Добавить материал' : 'Редактировать материал'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тип</label>
                                    <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg">
                                        <option value="cassette">Кассета</option>
                                        <option value="pot">Стаканчик</option>
                                        <option value="soil">Грунт</option>
                                        <option value="fertilizer">Удобрение</option>
                                        <option value="seed">Семена</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
                                    <input type="text" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Количество</label>
                                    <input type="number" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Мин. запас</label>
                                    <input type="number" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Местоположение</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Поставщик</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setIsEditModalOpen(false);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Отмена
                            </button>
                            <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                {isAddModalOpen ? 'Добавить' : 'Сохранить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;