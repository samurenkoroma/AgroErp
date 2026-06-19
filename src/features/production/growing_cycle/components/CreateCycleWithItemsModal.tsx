// src/components/growing/CreateCycleWithItemsModal.tsx
import {useState} from 'react';
import {
    Box,
    Check,
    ChevronDown, ChevronUp,
    Edit,
    GripVertical,
    Layers,
    Package,
    Plus,
    Save,
    Sprout,
    Trash2,
    X
} from 'lucide-react';
import {Modal} from '@/components/common/Modal';

// ==================== TYPES ====================

interface Crop {
    id: string;
    key: string;
    name: string;
    category: string;
    icon: string;
    color: string;
}

interface Variety {
    id: string;
    name: string;
    cropId: string;
    cropName: string;
    daysToMaturity: number;
    yieldPotential: number;
    plantHeight: number;
    recommendedSeasons: string[];
    growingTypes: string[];
    seedingRate?: {
        type: 'seeds' | 'seedlings';
        value: number;
        unit: string;
    };
    characteristics: Record<string, string>;
    description: string;
}

interface Container {
    id: string;
    name: string;
    type: 'pot' | 'cassette' | 'tray';
    capacity: number;
    cellCount?: number;
    volume?: number;
    dimensions?: string;
    available: number;
    unit: string;
}

interface CycleItem {
    id: string;
    cropId: string;
    cropName: string;
    cropIcon: string;
    varietyId: string;
    varietyName: string;
    containerId: string;
    containerName: string;
    containerType: string;
    quantity: number;
    plantsPerContainer: number;
    totalPlants: number;
    cellStart?: number;
    cellEnd?: number;
    notes?: string;
}

interface CreateCycleWithItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
    productionUnitId?: string;
    productionUnitName?: string;
}

// ==================== MOCK DATA ====================

const mockCrops: Crop[] = [
    { id: '1', key: 'tomato', name: 'Томат', category: 'Овощные', icon: '🍅', color: '#ef4444' },
    { id: '2', key: 'cucumber', name: 'Огурец', category: 'Овощные', icon: '🥒', color: '#22c55e' },
    { id: '3', key: 'pepper', name: 'Перец сладкий', category: 'Овощные', icon: '🫑', color: '#f97316' },
    { id: '4', key: 'eggplant', name: 'Баклажан', category: 'Овощные', icon: '🍆', color: '#8b5cf6' },
    { id: '5', key: 'strawberry', name: 'Клубника', category: 'Ягодные', icon: '🍓', color: '#ef4444' },
    { id: '6', key: 'basil', name: 'Базилик', category: 'Пряные', icon: '🌿', color: '#22c55e' },
    { id: '7', key: 'lettuce', name: 'Салат', category: 'Зеленные', icon: '🥬', color: '#22c55e' }
];

const mockVarieties: Variety[] = [
    {
        id: 'var-1',
        name: 'Бычье сердце',
        cropId: '1',
        cropName: 'Томат',
        daysToMaturity: 120,
        yieldPotential: 8.5,
        plantHeight: 1.5,
        recommendedSeasons: ['spring', 'summer'],
        growingTypes: ['greenhouse', 'open_ground'],
        seedingRate: { type: 'seedlings', value: 4, unit: 'раст/м²' },
        characteristics: { fruitWeight: '300-500g', fruitColor: 'малиновый' },
        description: 'Крупноплодный салатный сорт'
    },
    {
        id: 'var-2',
        name: 'Черри красный',
        cropId: '1',
        cropName: 'Томат',
        daysToMaturity: 90,
        yieldPotential: 6.0,
        plantHeight: 1.8,
        recommendedSeasons: ['spring', 'summer', 'autumn'],
        growingTypes: ['greenhouse'],
        seedingRate: { type: 'seedlings', value: 5, unit: 'раст/м²' },
        characteristics: { fruitWeight: '15-20g', fruitColor: 'красный' },
        description: 'Черри-томат для теплиц'
    },
    {
        id: 'var-3',
        name: 'Герман F1',
        cropId: '2',
        cropName: 'Огурец',
        daysToMaturity: 45,
        yieldPotential: 12.0,
        plantHeight: 2.0,
        recommendedSeasons: ['spring', 'summer'],
        growingTypes: ['greenhouse'],
        seedingRate: { type: 'seedlings', value: 3, unit: 'раст/м²' },
        characteristics: { fruitLength: '10-12cm', fruitColor: 'темно-зеленый' },
        description: 'Партенокарпический гибрид'
    },
    {
        id: 'var-4',
        name: 'Калифорнийское чудо',
        cropId: '3',
        cropName: 'Перец сладкий',
        daysToMaturity: 100,
        yieldPotential: 5.0,
        plantHeight: 0.7,
        recommendedSeasons: ['spring', 'summer'],
        growingTypes: ['greenhouse', 'open_ground'],
        seedingRate: { type: 'seedlings', value: 5, unit: 'раст/м²' },
        characteristics: { fruitWeight: '150-200g', fruitColor: 'красный' },
        description: 'Крупноплодный сорт перца'
    },
    {
        id: 'var-5',
        name: 'Алмаз',
        cropId: '4',
        cropName: 'Баклажан',
        daysToMaturity: 110,
        yieldPotential: 4.5,
        plantHeight: 0.6,
        recommendedSeasons: ['spring', 'summer'],
        growingTypes: ['greenhouse'],
        seedingRate: { type: 'seedlings', value: 4, unit: 'раст/м²' },
        characteristics: { fruitWeight: '200-300g', fruitColor: 'фиолетовый' },
        description: 'Классический сорт баклажана'
    }
];

const mockContainers: Container[] = [
    { id: 'pot-1', name: 'Горшок 0.5л', type: 'pot', capacity: 1, volume: 0.5, available: 500, unit: 'шт' },
    { id: 'pot-2', name: 'Горшок 1л', type: 'pot', capacity: 1, volume: 1, available: 300, unit: 'шт' },
    { id: 'pot-3', name: 'Горшок 3л', type: 'pot', capacity: 1, volume: 3, available: 150, unit: 'шт' },
    { id: 'cassette-1', name: 'Кассета 40 ячеек', type: 'cassette', capacity: 40, cellCount: 40, available: 80, unit: 'шт' },
    { id: 'cassette-2', name: 'Кассета 72 ячейки', type: 'cassette', capacity: 72, cellCount: 72, available: 50, unit: 'шт' },
    { id: 'cassette-3', name: 'Кассета 128 ячеек', type: 'cassette', capacity: 128, cellCount: 128, available: 30, unit: 'шт' },
    { id: 'tray-1', name: 'Лоток для рассады', type: 'tray', capacity: 50, available: 100, unit: 'шт' }
];

// ==================== COMPONENTS ====================

const ItemCard = ({ item, index, onEdit, onDelete, onMoveUp, onMoveDown }: {
    item: CycleItem;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
                <div className="flex items-center gap-1">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <span className="text-sm font-medium text-gray-400 w-6">{index + 1}</span>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{item.cropIcon}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{item.cropName}</span>
                        <span className="text-sm text-gray-500">• {item.varietyName}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
                {item.containerName}
            </span>
                        <span className="flex items-center gap-1">
              <Box className="w-3 h-3" />
                            {item.quantity} шт × {item.plantsPerContainer} раст.
            </span>
                        <span className="flex items-center gap-1 text-green-600">
              <Sprout className="w-3 h-3" />
              Всего: {item.totalPlants} растений
            </span>
                        {item.cellStart && item.cellEnd && (
                            <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Ячейки: {item.cellStart}-{item.cellEnd}
              </span>
                        )}
                    </div>
                    {item.notes && (
                        <p className="text-xs text-gray-400 mt-1">{item.notes}</p>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onEdit}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Редактировать"
                    >
                        <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        title="Удалить"
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                    <div className="flex flex-col ml-1">
                        <button
                            onClick={onMoveUp}
                            disabled={index === 0}
                            className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"
                        >
                            <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                            onClick={onMoveDown}
                            className="p-0.5 hover:bg-gray-100 rounded"
                        >
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddItemModal = ({ isOpen, onClose, onAdd, existingItems, containers }: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: Omit<CycleItem, 'id'>) => void;
    existingItems: CycleItem[];
    containers: Container[];
}) => {
    const [selectedCropId, setSelectedCropId] = useState('');
    const [selectedVarietyId, setSelectedVarietyId] = useState('');
    const [selectedContainerId, setSelectedContainerId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [plantsPerContainer, setPlantsPerContainer] = useState(1);
    const [cellStart, setCellStart] = useState<number>();
    const [cellEnd, setCellEnd] = useState<number>();
    const [notes, setNotes] = useState('');
    const [step, setStep] = useState(1);

    const selectedCrop = mockCrops.find(c => c.id === selectedCropId);
    const selectedVariety = mockVarieties.find(v => v.id === selectedVarietyId);
    const selectedContainer = containers.find(c => c.id === selectedContainerId);

    const varietiesForCrop = mockVarieties.filter(v => v.cropId === selectedCropId);
    const totalPlants = quantity * plantsPerContainer;

    // Расчет занятых ячеек в кассете
    const isCassette = selectedContainer?.type === 'cassette';
    const usedCells = existingItems.reduce((sum, item) => {
        if (item.cellEnd && item.cellStart) {
            return sum + (item.cellEnd - item.cellStart + 1);
        }
        return sum;
    }, 0);
    const availableCells = (selectedContainer?.capacity || 0) - usedCells;

    const handleAdd = () => {
        if (!selectedCropId || !selectedVarietyId || !selectedContainerId) return;

        onAdd({
            cropId: selectedCropId,
            cropName: selectedCrop!.name,
            cropIcon: selectedCrop!.icon,
            varietyId: selectedVarietyId,
            varietyName: selectedVariety!.name,
            containerId: selectedContainerId,
            containerName: selectedContainer!.name,
            containerType: selectedContainer!.type,
            quantity,
            plantsPerContainer,
            totalPlants,
            cellStart,
            cellEnd,
            notes
        });

        resetForm();
        onClose();
    };

    const resetForm = () => {
        setSelectedCropId('');
        setSelectedVarietyId('');
        setSelectedContainerId('');
        setQuantity(1);
        setPlantsPerContainer(1);
        setCellStart(undefined);
        setCellEnd(undefined);
        setNotes('');
        setStep(1);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full h-full overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Добавить позицию</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-80px)]">
                    {/* Культура */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Культура *</label>
                        <div className="grid grid-cols-2 gap-2">
                            {mockCrops.slice(0, 6).map((crop) => (
                                <button
                                    key={crop.id}
                                    onClick={() => {
                                        setSelectedCropId(crop.id);
                                        setSelectedVarietyId('');
                                    }}
                                    className={`p-2 rounded-lg border text-left transition-all ${
                                        selectedCropId === crop.id
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : 'border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{crop.icon}</span>
                                        <span className="text-sm font-medium">{crop.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Сорт */}
                    {selectedCropId && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Сорт *</label>
                            <select
                                value={selectedVarietyId}
                                onChange={(e) => setSelectedVarietyId(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border rounded-lg"
                            >
                                <option value="">Выберите сорт</option>
                                {varietiesForCrop.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Тара */}
                    {selectedVarietyId && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Тара *</label>
                            <div className="space-y-2">
                                {containers.map((container) => (
                                    <button
                                        key={container.id}
                                        onClick={() => setSelectedContainerId(container.id)}
                                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                                            selectedContainerId === container.id
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : 'border-gray-200 hover:border-green-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{container.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {container.type === 'pot' && `${container.volume}л • ${container.available} шт`}
                                                    {container.type === 'cassette' && `${container.cellCount} ячеек • ${container.available} шт`}
                                                    {container.type === 'tray' && `${container.available} шт`}
                                                </p>
                                            </div>
                                            {selectedContainerId === container.id && <Check className="w-4 h-4 text-green-500" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Количество тары */}
                    {selectedContainerId && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Количество {selectedContainer?.unit}
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 flex items-center justify-center border rounded-lg"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.min(selectedContainer?.available || 100, Math.max(1, parseInt(e.target.value) || 1)))}
                                    className="w-20 text-center px-2 py-1 border rounded-lg"
                                />
                                <button
                                    onClick={() => setQuantity(Math.min(selectedContainer?.available || 100, quantity + 1))}
                                    className="w-8 h-8 flex items-center justify-center border rounded-lg"
                                >
                                    +
                                </button>
                                <span className="text-sm text-gray-500">доступно: {selectedContainer?.available}</span>
                            </div>
                        </div>
                    )}

                    {/* Растений на единицу тары */}
                    {selectedContainerId && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Растений на {selectedContainer?.type === 'cassette' ? 'кассету' : 'единицу'}
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPlantsPerContainer(Math.max(1, plantsPerContainer - 1))}
                                    className="w-8 h-8 flex items-center justify-center border rounded-lg"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={plantsPerContainer}
                                    onChange={(e) => setPlantsPerContainer(Math.min(selectedContainer?.capacity || 100, Math.max(1, parseInt(e.target.value) || 1)))}
                                    className="w-20 text-center px-2 py-1 border rounded-lg"
                                />
                                <button
                                    onClick={() => setPlantsPerContainer(Math.min(selectedContainer?.capacity || 100, plantsPerContainer + 1))}
                                    className="w-8 h-8 flex items-center justify-center border rounded-lg"
                                >
                                    +
                                </button>
                                <span className="text-sm text-gray-500">макс: {selectedContainer?.capacity}</span>
                            </div>
                            <p className="text-xs text-green-600 mt-1">Всего растений: {totalPlants} шт</p>
                        </div>
                    )}

                    {/* Для кассеты - номера ячеек */}
                    {selectedContainer?.type === 'cassette' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Диапазон ячеек (опционально)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="От"
                                    value={cellStart || ''}
                                    onChange={(e) => setCellStart(parseInt(e.target.value))}
                                    className="w-24 px-2 py-1 border rounded-lg"
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="До"
                                    value={cellEnd || ''}
                                    onChange={(e) => setCellEnd(parseInt(e.target.value))}
                                    className="w-24 px-2 py-1 border rounded-lg"
                                />
                            </div>
                            {usedCells > 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                    Занято ячеек: {usedCells} / {selectedContainer.capacity}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Заметки */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Заметки</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Дополнительная информация..."
                            className="w-full px-3 py-2 bg-gray-50 border rounded-lg resize-none"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">
                        Отмена
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!selectedCropId || !selectedVarietyId || !selectedContainerId}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                    >
                        Добавить
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

export const CreateCycleWithItemsModal = ({
                                              isOpen,
                                              onClose,
                                              onSuccess,
                                              productionUnitId,
                                              productionUnitName
                                          }: CreateCycleWithItemsModalProps) => {
    const [items, setItems] = useState<CycleItem[]>([]);
    const [cycleName, setCycleName] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    const totalPlants = items.reduce((sum, item) => sum + item.totalPlants, 0);
    const estimatedHarvestDate = new Date(startDate);
    if (items.length > 0) {
        const maxDays = Math.max(...items.map(i => {
            const variety = mockVarieties.find(v => v.id === i.varietyId);
            return variety?.daysToMaturity || 0;
        }));
        estimatedHarvestDate.setDate(estimatedHarvestDate.getDate() + maxDays);
    }

    const handleAddItem = (newItem: Omit<CycleItem, 'id'>) => {
        const itemWithId = {
            ...newItem,
            id: Date.now().toString()
        };
        setItems([...items, itemWithId]);
    };

    const handleEditItem = (itemId: string) => {
        setEditingItemId(itemId);
        setIsAddItemModalOpen(true);
    };

    const handleDeleteItem = (itemId: string) => {
        setItems(items.filter(i => i.id !== itemId));
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const newItems = [...items];
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        setItems(newItems);
    };

    const handleMoveDown = (index: number) => {
        if (index === items.length - 1) return;
        const newItems = [...items];
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        setItems(newItems);
    };

    const handleSubmit = () => {
        const cycleData = {
            name: cycleName || `Смешанный цикл ${new Date().toLocaleDateString('ru')}`,
            items,
            totalPlants,
            startDate,
            expectedHarvestDate: estimatedHarvestDate.toISOString(),
            productionUnitId,
            status: 'planned'
        };
        onSuccess(cycleData);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setItems([]);
        setCycleName('');
        setStartDate(new Date().toISOString().split('T')[0]);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Создание цикла выращивания" size="full">
                <div className="space-y-5">
                    {/* Основная информация */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Название цикла
                        </label>
                        <input
                            type="text"
                            value={cycleName}
                            onChange={(e) => setCycleName(e.target.value)}
                            placeholder="Например: Смешанная посадка весна 2026"
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Дата начала
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Плановый сбор
                            </label>
                            <p className="text-lg font-semibold text-green-600">{estimatedHarvestDate.toLocaleDateString('ru')}</p>
                        </div>
                    </div>

                    {/* Список позиций */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Позиции посадки
                            </label>
                            <button
                                onClick={() => setIsAddItemModalOpen(true)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Добавить
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300">
                                <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Нет добавленных позиций</p>
                                <p className="text-xs text-gray-400 mt-1">Нажмите "Добавить" чтобы добавить культуру</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {items.map((item, idx) => (
                                    <ItemCard
                                        key={item.id}
                                        item={item}
                                        index={idx}
                                        onEdit={() => handleEditItem(item.id)}
                                        onDelete={() => handleDeleteItem(item.id)}
                                        onMoveUp={() => handleMoveUp(idx)}
                                        onMoveDown={() => handleMoveDown(idx)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Итоговая статистика */}
                    {items.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">Итог</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Всего позиций</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Всего растений</p>
                                    <p className="text-2xl font-bold text-green-600">{totalPlants.toLocaleString()} шт</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Средний срок созревания</p>
                                    <p className="text-lg font-semibold">
                                        {Math.round(items.reduce((sum, i) => {
                                            const v = mockVarieties.find(v => v.id === i.varietyId);
                                            return sum + (v?.daysToMaturity || 0);
                                        }, 0) / items.length)} дней
                                    </p>
                                </div>
                                {productionUnitName && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Объект</p>
                                        <p className="font-medium">{productionUnitName}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={items.length === 0}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Создать цикл
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add Item Modal */}
            <AddItemModal
                isOpen={isAddItemModalOpen}
                onClose={() => {
                    setIsAddItemModalOpen(false);
                    setEditingItemId(null);
                }}
                onAdd={handleAddItem}
                existingItems={items}
                containers={mockContainers}
            />
        </>
    );
};