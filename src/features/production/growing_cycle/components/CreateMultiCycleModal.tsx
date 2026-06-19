// src/components/growing/CreateMultiCycleModal.tsx
import { useState, useMemo } from 'react';
import {
    X,
    Save,
    Sprout,
    Leaf,
    Package,
    Calendar,
    MapPin,
    ChevronDown,
    ChevronRight,
    Check,
    Search,
    Info,
    AlertCircle,
    Box,
    Layers,
    Flower2,
    TrendingUp,
    Clock,
    Plus,
    Trash2,
    Edit,
    Copy,
    Move,
    GripVertical,
    AlertTriangle
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { getCropIcon } from '@/utils/cropIcons';

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
    totalCapacity: number; // общее количество ячеек/мест
    usedCapacity: number; // уже использовано
    availableCapacity: number; // свободно
    cellCount?: number;
    volume?: number;
    dimensions?: string;
    unit: string;
}

interface PlantingSlot {
    id: string;
    cropId: string;
    cropName: string;
    varietyId: string;
    varietyName: string;
    quantity: number;
    cellsUsed: number; // количество занятых ячеек
    daysToMaturity: number;
    plantedAt?: string;
    notes?: string;
}

interface CyclePlanting {
    id: string;
    containerId: string;
    containerName: string;
    containerType: string;
    slots: PlantingSlot[];
    totalPlants: number;
    startDate: string;
}

// ==================== MOCK DATA ====================

const mockCrops: Crop[] = [
    { id: '1', key: 'tomato', name: 'Томат', category: 'Овощные', icon: '🍅', color: '#ef4444' },
    { id: '2', key: 'cucumber', name: 'Огурец', category: 'Овощные', icon: '🥒', color: '#22c55e' },
    { id: '3', key: 'pepper', name: 'Перец сладкий', category: 'Овощные', icon: '🫑', color: '#f97316' },
    { id: '4', key: 'eggplant', name: 'Баклажан', category: 'Овощные', icon: '🍆', color: '#8b5cf6' },
    { id: '5', key: 'strawberry', name: 'Клубника', category: 'Ягодные', icon: '🍓', color: '#ef4444' },
    { id: '6', key: 'basil', name: 'Базилик', category: 'Пряные', icon: '🌿', color: '#22c55e' }
];

const mockVarieties: Variety[] = [
    { id: 'var-1', name: 'Бычье сердце', cropId: '1', cropName: 'Томат', daysToMaturity: 120, yieldPotential: 8.5, plantHeight: 1.5, recommendedSeasons: ['spring', 'summer'], growingTypes: ['greenhouse'], description: 'Крупноплодный салатный сорт', characteristics: {} },
    { id: 'var-2', name: 'Черри красный', cropId: '1', cropName: 'Томат', daysToMaturity: 90, yieldPotential: 6.0, plantHeight: 1.8, recommendedSeasons: ['spring', 'summer'], growingTypes: ['greenhouse'], description: 'Черри-томат для теплиц', characteristics: {} },
    { id: 'var-3', name: 'Герман F1', cropId: '2', cropName: 'Огурец', daysToMaturity: 45, yieldPotential: 12.0, plantHeight: 2.0, recommendedSeasons: ['spring', 'summer'], growingTypes: ['greenhouse'], description: 'Партенокарпический гибрид', characteristics: {} },
    { id: 'var-4', name: 'Калифорнийское чудо', cropId: '3', cropName: 'Перец сладкий', daysToMaturity: 100, yieldPotential: 5.0, plantHeight: 0.7, recommendedSeasons: ['spring', 'summer'], growingTypes: ['greenhouse'], description: 'Крупноплодный сорт перца', characteristics: {} },
    { id: 'var-5', name: 'Алмаз', cropId: '4', cropName: 'Баклажан', daysToMaturity: 110, yieldPotential: 7.0, plantHeight: 0.8, recommendedSeasons: ['spring', 'summer'], growingTypes: ['greenhouse'], description: 'Классический сорт баклажана', characteristics: {} }
];

const mockContainers: Container[] = [
    { id: 'pot-1', name: 'Горшок 0.5л', type: 'pot', totalCapacity: 1, usedCapacity: 0, availableCapacity: 1, volume: 0.5, unit: 'шт' },
    { id: 'pot-2', name: 'Горшок 1л', type: 'pot', totalCapacity: 1, usedCapacity: 0, availableCapacity: 1, volume: 1, unit: 'шт' },
    { id: 'cassette-1', name: 'Кассета 40 ячеек', type: 'cassette', totalCapacity: 40, usedCapacity: 0, availableCapacity: 40, cellCount: 40, unit: 'шт' },
    { id: 'cassette-2', name: 'Кассета 72 ячейки', type: 'cassette', totalCapacity: 72, usedCapacity: 0, availableCapacity: 72, cellCount: 72, unit: 'шт' },
    { id: 'cassette-3', name: 'Кассета 128 ячеек', type: 'cassette', totalCapacity: 128, usedCapacity: 0, availableCapacity: 128, cellCount: 128, unit: 'шт' },
    { id: 'tray-1', name: 'Лоток для рассады', type: 'tray', totalCapacity: 50, usedCapacity: 0, availableCapacity: 50, unit: 'шт' }
];

// ==================== COMPONENTS ====================

const StepIndicator = ({ steps, currentStep }: { steps: string[]; currentStep: number }) => (
    <div className="flex items-center justify-between mb-6">
        {steps.map((label, idx) => (
            <div key={idx} className="flex items-center flex-1">
                <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
          ${idx + 1 === currentStep
                    ? 'bg-green-600 text-white ring-2 ring-green-500 ring-offset-2'
                    : idx + 1 < currentStep
                        ? 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                        : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                }
        `}>
                    {idx + 1}
                </div>
                {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${idx + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
            </div>
        ))}
    </div>
);

const PlantingSlotCard = ({ slot, index, onEdit, onDelete, containerType }: {
    slot: PlantingSlot;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
    containerType: string;
}) => {
    const getUsagePercentage = () => {
        return (slot.cellsUsed / (containerType === 'pot' ? 1 : 40)) * 100;
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl">
                        {getCropIcon(slot.cropName)}
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{slot.cropName}</h4>
                        <p className="text-sm text-gray-500">{slot.varietyName}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>{slot.quantity} шт</span>
                            <span>•</span>
                            <span>Занято ячеек: {slot.cellsUsed}</span>
                            <span>•</span>
                            <span>Созревание: {slot.daysToMaturity} дн.</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={onDelete} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            </div>
            {containerType === 'cassette' && (
                <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Заполнение кассеты</span>
                        <span className="text-gray-500">{getUsagePercentage().toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${getUsagePercentage()}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

export const CreateMultiCycleModal = ({
                                          isOpen,
                                          onClose,
                                          onSuccess,
                                          productionUnitId,
                                          productionUnitName
                                      }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
    productionUnitId?: string;
    productionUnitName?: string;
}) => {
    const [step, setStep] = useState(1);
    const [selectedContainerId, setSelectedContainerId] = useState<string>('');
    const [plantings, setPlantings] = useState<CyclePlanting[]>([]);
    const [currentPlanting, setCurrentPlanting] = useState<Partial<CyclePlanting>>({});

    // Состояния для добавления посадки
    const [selectedCropId, setSelectedCropId] = useState<string>('');
    const [selectedVarietyId, setSelectedVarietyId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [cellsPerPlant, setCellsPerPlant] = useState<number>(1);
    const [notes, setNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [cycleName, setCycleName] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const selectedContainer = mockContainers.find(c => c.id === selectedContainerId);
    const selectedCrop = mockCrops.find(c => c.id === selectedCropId);
    const selectedVariety = mockVarieties.find(v => v.id === selectedVarietyId);

    const varietiesForCrop = mockVarieties.filter(v => v.cropId === selectedCropId);
    const filteredVarieties = varietiesForCrop.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Расчет использованных ячеек в текущей посадке
    const cellsToUse = quantity * cellsPerPlant;
    const availableCells = selectedContainer?.availableCapacity || 0;
    const canAdd = cellsToUse <= availableCells;

    // Общая статистика по всем посадкам
    const totalStats = useMemo(() => {
        let totalPlants = 0;
        let totalCells = 0;
        plantings.forEach(planting => {
            planting.slots.forEach(slot => {
                totalPlants += slot.quantity;
                totalCells += slot.cellsUsed;
            });
        });
        return { totalPlants, totalCells };
    }, [plantings]);

    const handleAddPlanting = () => {
        if (!selectedCrop || !selectedVariety || !selectedContainer || quantity <= 0) return;

        const newSlot: PlantingSlot = {
            id: Date.now().toString(),
            cropId: selectedCrop.id,
            cropName: selectedCrop.name,
            varietyId: selectedVariety.id,
            varietyName: selectedVariety.name,
            quantity: quantity,
            cellsUsed: cellsToUse,
            daysToMaturity: selectedVariety.daysToMaturity,
            notes: notes || undefined
        };

        const existingPlantingIndex = plantings.findIndex(p => p.containerId === selectedContainer.id);

        if (existingPlantingIndex >= 0) {
            const updatedPlantings = [...plantings];
            updatedPlantings[existingPlantingIndex] = {
                ...updatedPlantings[existingPlantingIndex],
                slots: [...updatedPlantings[existingPlantingIndex].slots, newSlot],
                totalPlants: updatedPlantings[existingPlantingIndex].totalPlants + quantity,
                startDate: updatedPlantings[existingPlantingIndex].startDate
            };
            setPlantings(updatedPlantings);
        } else {
            const newPlanting: CyclePlanting = {
                id: Date.now().toString(),
                containerId: selectedContainer.id,
                containerName: selectedContainer.name,
                containerType: selectedContainer.type,
                slots: [newSlot],
                totalPlants: quantity,
                startDate: startDate
            };
            setPlantings([...plantings, newPlanting]);
        }

        // Обновляем доступную емкость контейнера
        const containerIndex = mockContainers.findIndex(c => c.id === selectedContainer.id);
        if (containerIndex >= 0) {
            mockContainers[containerIndex].usedCapacity += cellsToUse;
            mockContainers[containerIndex].availableCapacity -= cellsToUse;
        }

        // Сбрасываем форму
        setSelectedCropId('');
        setSelectedVarietyId('');
        setQuantity(1);
        setCellsPerPlant(1);
        setNotes('');
        setSearchTerm('');
    };

    const handleRemovePlanting = (plantingIndex: number, slotIndex: number) => {
        const planting = plantings[plantingIndex];
        const slot = planting.slots[slotIndex];

        // Возвращаем емкость
        const containerIndex = mockContainers.findIndex(c => c.id === planting.containerId);
        if (containerIndex >= 0) {
            mockContainers[containerIndex].usedCapacity -= slot.cellsUsed;
            mockContainers[containerIndex].availableCapacity += slot.cellsUsed;
        }

        const updatedPlantings = [...plantings];
        if (planting.slots.length === 1) {
            updatedPlantings.splice(plantingIndex, 1);
        } else {
            updatedPlantings[plantingIndex].slots = planting.slots.filter((_, idx) => idx !== slotIndex);
            updatedPlantings[plantingIndex].totalPlants -= slot.quantity;
        }
        setPlantings(updatedPlantings);
    };

    const handleSubmit = () => {
        const cycleData = {
            name: cycleName || `Сборный цикл ${new Date().toLocaleDateString('ru')}`,
            plantings,
            totalPlants: totalStats.totalPlants,
            totalCells: totalStats.totalCells,
            startDate,
            productionUnitId,
            status: 'planned'
        };
        onSuccess(cycleData);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setStep(1);
        setSelectedContainerId('');
        setPlantings([]);
        setCycleName('');
        setStartDate(new Date().toISOString().split('T')[0]);
    };

    const steps = ['Выбор тары', 'Добавление растений', 'Подтверждение'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Создание сборного цикла" size="lg">
            <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
                <StepIndicator steps={steps} currentStep={step} />

                {/* Step 1: Выбор тары */}
                {step === 1 && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Выберите тару для посадки</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {mockContainers.map((container) => (
                                <button
                                    key={container.id}
                                    onClick={() => {
                                        setSelectedContainerId(container.id);
                                        setStep(2);
                                    }}
                                    className={`
                    p-4 rounded-lg border transition-all text-left
                    ${selectedContainerId === container.id
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                    }
                  `}
                                >
                                    <div className="flex items-start gap-3">
                                        {container.type === 'pot' && <Box className="w-6 h-6 text-blue-500" />}
                                        {container.type === 'cassette' && <Layers className="w-6 h-6 text-green-500" />}
                                        {container.type === 'tray' && <Package className="w-6 h-6 text-purple-500" />}
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{container.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Вместимость: {container.totalCapacity} {container.unit === 'шт' ? 'растений' : 'ячеек'}
                                            </p>
                                            {container.type === 'cassette' && (
                                                <p className="text-xs text-gray-400">Свободно: {container.availableCapacity} ячеек</p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Добавление растений */}
                {step === 2 && selectedContainer && (
                    <div className="space-y-4">
                        {/* Список уже добавленных посадок */}
                        {plantings.filter(p => p.containerId === selectedContainer.id).map((planting, pIdx) => (
                            <div key={planting.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Package className="w-4 h-4 text-green-500" />
                                        {planting.containerName}
                                    </h4>
                                    <span className="text-sm text-gray-500">
                    Всего растений: {planting.totalPlants}
                  </span>
                                </div>
                                {planting.slots.map((slot, sIdx) => (
                                    <PlantingSlotCard
                                        key={slot.id}
                                        slot={slot}
                                        index={sIdx}
                                        containerType={selectedContainer.type}
                                        onEdit={() => {}}
                                        onDelete={() => handleRemovePlanting(pIdx, sIdx)}
                                    />
                                ))}
                            </div>
                        ))}

                        {/* Форма добавления новой посадки */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-green-600" />
                                Добавить растения
                            </h4>

                            <div className="space-y-3">
                                {/* Выбор культуры */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Культура *
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {mockCrops.map((crop) => (
                                            <button
                                                key={crop.id}
                                                onClick={() => {
                                                    setSelectedCropId(crop.id);
                                                    setSelectedVarietyId('');
                                                }}
                                                className={`
                          p-2 rounded-lg border text-left
                          ${selectedCropId === crop.id
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                                }
                        `}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{crop.icon}</span>
                                                    <span className="text-sm font-medium">{crop.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Выбор сорта */}
                                {selectedCropId && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Сорт *
                                        </label>
                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Поиск сорта..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {filteredVarieties.map((variety) => (
                                                <button
                                                    key={variety.id}
                                                    onClick={() => setSelectedVarietyId(variety.id)}
                                                    className={`
                            w-full p-2 rounded-lg border text-left
                            ${selectedVarietyId === variety.id
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                                    }
                          `}
                                                >
                                                    <p className="font-medium text-sm">{variety.name}</p>
                                                    <p className="text-xs text-gray-500">{variety.daysToMaturity} дней</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Количество и ячейки */}
                                {selectedVariety && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Количество растений
                                            </label>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Ячеек на растение
                                            </label>
                                            <input
                                                type="number"
                                                value={cellsPerPlant}
                                                onChange={(e) => setCellsPerPlant(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Информация о заполнении */}
                                {selectedVariety && selectedContainer.type === 'cassette' && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Доступно ячеек</span>
                                            <span className="font-medium">{selectedContainer.availableCapacity}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Будет занято</span>
                                            <span className={`font-medium ${canAdd ? 'text-green-600' : 'text-red-600'}`}>
                        {cellsToUse}
                      </span>
                                        </div>
                                        {!canAdd && (
                                            <p className="text-xs text-red-600 mt-2">
                                                Недостаточно свободных ячеек! Освободите место или выберите другую тару.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Заметки */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Заметки
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={2}
                                        placeholder="Дополнительная информация..."
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 rounded-lg resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleAddPlanting}
                                    disabled={!selectedCropId || !selectedVarietyId || !canAdd}
                                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Добавить в план
                                </button>
                            </div>
                        </div>

                        {/* Навигация */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Назад
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={plantings.length === 0}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                Далее ({totalStats.totalPlants} растений)
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Подтверждение */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">Итог сборного цикла</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Тара</span>
                                    <span className="font-medium">{selectedContainer?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Всего растений</span>
                                    <span className="font-bold text-green-600">{totalStats.totalPlants} шт</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Занято ячеек</span>
                                    <span className="font-medium">{totalStats.totalCells} / {selectedContainer?.totalCapacity}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Название цикла
                            </label>
                            <input
                                type="text"
                                value={cycleName}
                                onChange={(e) => setCycleName(e.target.value)}
                                placeholder={`Сборный цикл ${new Date().toLocaleDateString('ru')}`}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            />
                        </div>

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

                        {productionUnitName && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">Будет добавлен к: <strong>{productionUnitName}</strong></span>
                                </div>
                            </div>
                        )}

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Вы создаете сборный цикл с несколькими видами растений в одной таре.
                                    После создания вы сможете отслеживать прогресс каждого вида отдельно.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Назад
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Создать сборный цикл
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};