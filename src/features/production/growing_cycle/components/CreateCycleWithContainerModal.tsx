// src/components/growing/CreateCycleWithContainerModal.tsx
import {useState} from 'react';
import {
    AlertCircle,
    Box,
    Check,
    Clock,
    Info,
    Layers,
    Leaf,
    MapPin,
    Package,
    Save,
    Search,
    TrendingUp
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
    capacity: number; // количество растений
    cellCount?: number; // для кассет - количество ячеек
    volume?: number; // объем в литрах (для горшков)
    dimensions?: string;
    available: number; // доступное количество
    unit: string;
}

interface CreateCycleWithContainerModalProps {
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

const StepIndicator = ({ currentStep, totalSteps, label }: { currentStep: number; totalSteps: number; label: string }) => (
    <div className="flex items-center gap-2">
        <div className="flex items-center">
            {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                    key={idx}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        idx + 1 === currentStep
                            ? 'bg-green-600 text-white ring-2 ring-green-500 ring-offset-2'
                            : idx + 1 < currentStep
                                ? 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                                : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                    }`}
                >
                    {idx + 1}
                </div>
            ))}
        </div>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
);

const CropCard = ({ crop, isSelected, onClick }: { crop: Crop; isSelected: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`
      p-3 rounded-lg border transition-all text-left w-full
      ${isSelected
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
            : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
        }
    `}
    >
        <div className="flex items-center gap-2">
            <span className="text-2xl">{crop.icon}</span>
            <div>
                <p className="font-medium text-gray-900 dark:text-white">{crop.name}</p>
                <p className="text-xs text-gray-500">{crop.category}</p>
            </div>
            {isSelected && <Check className="w-4 h-4 text-green-500 ml-auto" />}
        </div>
    </button>
);

const VarietyCard = ({ variety, isSelected, onClick }: { variety: Variety; isSelected: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`
      w-full p-3 rounded-lg border transition-all text-left
      ${isSelected
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
            : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
        }
    `}
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="font-medium text-gray-900 dark:text-white">{variety.name}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
              {variety.daysToMaturity} дней
          </span>
                    <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
                        {variety.yieldPotential} кг/м²
          </span>
                    <span>Высота: {variety.plantHeight} м</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{variety.description}</p>
            </div>
            {isSelected && <Check className="w-4 h-4 text-green-500 shrink-0" />}
        </div>
    </button>
);

const ContainerCard = ({ container, isSelected, onClick, quantity, onQuantityChange }: {
    container: Container;
    isSelected: boolean;
    onClick: () => void;
    quantity: number;
    onQuantityChange: (value: number) => void;
}) => {
    const maxAvailable = container.available;
    const maxCapacity = container.capacity;
    const totalPlants = quantity * container.capacity;

    return (
        <div
            className={`
        rounded-lg border transition-all
        ${isSelected
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
            }
      `}
        >
            <button onClick={onClick} className="w-full p-3 text-left">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        {container.type === 'pot' && <Box className="w-5 h-5 text-blue-500" />}
                        {container.type === 'cassette' && <Layers className="w-5 h-5 text-green-500" />}
                        {container.type === 'tray' && <Package className="w-5 h-5 text-purple-500" />}
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{container.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {container.type === 'pot' && `${container.volume}л • ${container.available} шт`}
                                {container.type === 'cassette' && `${container.cellCount} ячеек • ${container.available} шт`}
                                {container.type === 'tray' && `${container.available} шт`}
                            </p>
                        </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-green-500" />}
                </div>
            </button>

            {isSelected && (
                <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Количество {container.unit}
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => onQuantityChange(Math.min(maxAvailable, Math.max(1, parseInt(e.target.value) || 1)))}
                                    className="w-20 text-center px-2 py-1 border rounded-lg"
                                />
                                <button
                                    onClick={() => onQuantityChange(Math.min(maxAvailable, quantity + 1))}
                                    className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                                >
                                    +
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Доступно: {maxAvailable} {container.unit}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Всего растений</p>
                            <p className="text-xl font-bold text-green-600">{totalPlants.toLocaleString()} шт</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

export const CreateCycleWithContainerModal = ({
                                                  isOpen,
                                                  onClose,
                                                  onSuccess,
                                                  productionUnitId,
                                                  productionUnitName
                                              }: CreateCycleWithContainerModalProps) => {
    const [step, setStep] = useState(1);
    const [selectedCropId, setSelectedCropId] = useState<string>('');
    const [selectedVarietyId, setSelectedVarietyId] = useState<string>('');
    const [selectedContainerId, setSelectedContainerId] = useState<string>('');
    const [containerQuantity, setContainerQuantity] = useState(1);
    const [cycleName, setCycleName] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedCrop = mockCrops.find(c => c.id === selectedCropId);
    const selectedVariety = mockVarieties.find(v => v.id === selectedVarietyId);
    const selectedContainer = mockContainers.find(c => c.id === selectedContainerId);

    const varietiesForCrop = mockVarieties.filter(v => v.cropId === selectedCropId);
    const filteredVarieties = varietiesForCrop.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPlants = (selectedContainer?.capacity || 0) * containerQuantity;
    const estimatedHarvestDate = new Date(startDate);
    if (selectedVariety) {
        estimatedHarvestDate.setDate(estimatedHarvestDate.getDate() + selectedVariety.daysToMaturity);
    }

    const handleNext = () => {
        if (step === 1 && selectedCropId) setStep(2);
        else if (step === 2 && selectedVarietyId) setStep(3);
        else if (step === 3 && selectedContainerId) {
            if (!cycleName) {
                setCycleName(`${selectedCrop?.name} ${selectedVariety?.name} - ${new Date().toLocaleDateString('ru')}`);
            }
            setStep(4);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = () => {
        const cycleData = {
            name: cycleName,
            cropId: selectedCropId,
            varietyId: selectedVarietyId,
            containerId: selectedContainerId,
            containerQuantity,
            totalPlants,
            startDate,
            expectedHarvestDate: estimatedHarvestDate.toISOString(),
            productionUnitId,
            status: 'planned'
        };
        console.log(cycleData);
        onSuccess(cycleData);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setStep(1);
        setSelectedCropId('');
        setSelectedVarietyId('');
        setSelectedContainerId('');
        setContainerQuantity(1);
        setCycleName('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setSearchTerm('');
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Выберите культуру';
            case 2: return 'Выберите сорт';
            case 3: return 'Выберите тару';
            case 4: return 'Подтверждение';
            default: return '';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Новый цикл выращивания" size="lg">
            <div className="space-y-5">
                {/* Step Indicator */}
                <StepIndicator currentStep={step} totalSteps={4} label={getStepTitle()} />

                {/* Step 1: Crop Selection */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                            {mockCrops.map((crop) => (
                                <CropCard
                                    key={crop.id}
                                    crop={crop}
                                    isSelected={selectedCropId === crop.id}
                                    onClick={() => setSelectedCropId(crop.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Variety Selection */}
                {step === 2 && selectedCrop && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск сорта..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            />
                        </div>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {filteredVarieties.map((variety) => (
                                <VarietyCard
                                    key={variety.id}
                                    variety={variety}
                                    isSelected={selectedVarietyId === variety.id}
                                    onClick={() => setSelectedVarietyId(variety.id)}
                                />
                            ))}
                            {filteredVarieties.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Leaf className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>Сорта не найдены</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Container Selection */}
                {step === 3 && selectedVariety && (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                            <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Выбрано</p>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">
                                        {selectedCrop?.name} • {selectedVariety.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {mockContainers.map((container) => (
                            <ContainerCard
                                key={container.id}
                                container={container}
                                isSelected={selectedContainerId === container.id}
                                onClick={() => setSelectedContainerId(container.id)}
                                quantity={containerQuantity}
                                onQuantityChange={setContainerQuantity}
                            />
                        ))}
                    </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && selectedCrop && selectedVariety && selectedContainer && (
                    <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">Детали цикла</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Культура</span>
                                    <span className="font-medium">{selectedCrop.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Сорт</span>
                                    <span className="font-medium">{selectedVariety.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Тара</span>
                                    <span className="font-medium">{selectedContainer.name} × {containerQuantity} шт</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Всего растений</span>
                                    <span className="font-bold text-green-600">{totalPlants.toLocaleString()} шт</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Срок созревания</span>
                                    <span className="font-medium">{selectedVariety.daysToMaturity} дней</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Плановый сбор</span>
                                    <span className="font-medium">{estimatedHarvestDate.toLocaleDateString('ru')}</span>
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
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                    Будет добавлен к объекту: <strong>{productionUnitName}</strong>
                  </span>
                                </div>
                            </div>
                        )}

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    После создания цикла вы сможете отслеживать его прогресс, добавлять задачи и фиксировать операции.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {step > 1 && (
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Назад
                        </button>
                    )}
                    <button
                        onClick={step === 4 ? handleSubmit : handleNext}
                        disabled={
                            (step === 1 && !selectedCropId) ||
                            (step === 2 && !selectedVarietyId) ||
                            (step === 3 && !selectedContainerId)
                        }
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {step === 4 ? 'Создать цикл' : 'Далее'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};