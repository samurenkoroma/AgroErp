import {useEffect, useMemo, useState} from 'react';
import {Save, X} from 'lucide-react';
import {Modal} from '@/components/common/Modal';
import {
    getAvailableCapabilities,
    getAvailableChildTypes,
    getUnitIcon,
    getUnitTypeName,
    ProductionUnit,
    ProductionUnitType,
    RootUnits
} from "@/entities/spatial";
import {CreateProductionUnitRequest, Dimensions} from "@/entities/spatial/production-unit/dto.ts";
import {formatArea} from "@/utils/geometry.ts";

interface CreateProductionUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: CreateProductionUnitRequest) => void;
    parentUnit?: ProductionUnit | null;
    unitType: RootUnits | null;
}


export const CreateProductionUnitModal = ({
                                              isOpen,
                                              onClose,
                                              onSuccess,
                                              parentUnit,
                                              unitType = null
                                          }: CreateProductionUnitModalProps) => {
    const [selectedType, setSelectedType] = useState<ProductionUnitType | null>(unitType);
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [dimensions, setDimensions] = useState<Dimensions>({});
    const [area, setArea] = useState<number | undefined>();
    const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'active' | 'maintenance' | 'planned'>('active');

    const availableTypes = useMemo(() => getAvailableChildTypes(parentUnit?.type), [parentUnit]);
    const availableCapabilities = useMemo(() => selectedType ? getAvailableCapabilities(selectedType) : [], [selectedType]);

    const handleTypeSelect = (type: ProductionUnitType) => {
        setSelectedType(type);
        setSelectedCapabilities(getAvailableCapabilities(type));
        // Сбрасываем размеры при смене типа
        setDimensions({});
        setArea(undefined);
    };

    const toggleCapability = (capability: string) => {
        setSelectedCapabilities(prev =>
            prev.includes(capability)
                ? prev.filter(c => c !== capability)
                : [...prev, capability]
        );
    };

    const generateCode = () => {
        const prefix = selectedType === 'FIELD' ? 'F' :
            selectedType === 'PLOT' ? 'P' :
                selectedType === 'GREENHOUSE' ? 'GH' :
                    selectedType === 'CONTAINER' ? 'C' :
                        selectedType === 'BED' ? 'B' :
                            selectedType === 'BLOCK' ? 'BK' :
                                selectedType === 'RACK' ? 'R' :
                                    selectedType === 'SHELF' ? 'SH' :
                                        selectedType === 'SLOT' ? 'S' :
                                            selectedType === 'POT' ? 'PT' :
                                                selectedType === 'TRAY' ? 'TR' :
                                                    selectedType === 'NFT_CHANNEL' ? 'NFT' :
                                                        selectedType === 'DWC_TANK' ? 'DWC' :
                                                            selectedType === 'AEROPONIC_CHAMBER' ? 'AERO' :
                                                                selectedType === 'VERTICAL_TOWER' ? 'VT' : 'U';
        const existingCodes = parentUnit?.children?.map(u => u.code);
        const parentCode = parentUnit ? parentUnit.code + '/' : ''
        let counter = 1;
        let newCode = `${parentCode}${prefix}-${counter.toString().padStart(2, '0')}`;
        while (existingCodes?.includes(newCode)) {
            counter++;
            newCode = `${parentCode}${prefix}-${counter.toString().padStart(2, '0')}`;
        }
        setCode(newCode);
    };

    useEffect(() => {
        generateCode();
    }, [selectedType]);

    // Функция для расчета площади на основе размеров
    const calculateAreaFromDimensions = () => {
        if (!selectedType) return;

        switch (selectedType) {
            case 'BED':
                if (dimensions.length && dimensions.width) {
                    const areaM2 = (dimensions.length * dimensions.width) / 10000;
                    setArea(areaM2);
                }
                break;
            case 'ROW':
                if (dimensions.length) {
                    const areaM2 = dimensions.length / 10000;
                    setArea(areaM2);
                }
                break;
            case 'RACK':
            case 'SHELF':
                if (dimensions.length && dimensions.width) {
                    const shelfArea = (dimensions.length * dimensions.width) / 10000;
                    const totalArea = shelfArea * (dimensions.levels || 1);
                    setArea(totalArea);
                }
                break;
            case 'CONTAINER':
                if (dimensions.length && dimensions.width) {
                    const areaM2 = dimensions.length * dimensions.width / 10000;
                    setArea(areaM2);
                }
                break;
            case 'GREENHOUSE':
                if (dimensions.length && dimensions.width) {
                    const areaM2 = dimensions.length * dimensions.width;
                    setArea(areaM2);
                }
                break;
            case 'NFT_CHANNEL':
                if (dimensions.length && dimensions.width) {
                    const areaM2 = dimensions.length * dimensions.width;
                    setArea(areaM2);
                }
                break;
            case 'DWC_TANK':
                if (dimensions.length && dimensions.width) {
                    const areaM2 = dimensions.length * dimensions.width;
                    setArea(areaM2);
                }
                break;
        }
    };

    // Автоматический расчет площади при изменении размеров
    useEffect(() => {
        calculateAreaFromDimensions();
    }, [dimensions, selectedType]);


    function maxLength(value: string) {
        const maxValue = parentUnit?.properties.dimensions?.length
        if (maxValue == undefined) {
            return value
        }
        return parseFloat(value) > maxValue ? maxValue : value
    }

    function maxWidth(value: string) {
        return Math.max(parseFloat(value), parentUnit?.properties.dimensions?.width || 0)
    }
    // Рендер полей для размеров в зависимости от типа
    const renderDimensionFields = () => {
        if (!selectedType) return null;

        switch (selectedType) {
            case 'FIELD':
            case 'PLOT':
            case 'GREENHOUSE':
            case 'CONTAINER':
                return (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Длина (м)
                            </label>
                            <input
                                type="number"
                                value={dimensions.length || ''}
                                onChange={(e) => setDimensions({...dimensions, length: parseFloat(e.target.value)})}
                                placeholder="Введите длину"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ширина (м)
                            </label>
                            <input
                                type="number"
                                value={dimensions.width || ''}
                                onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value)})}
                                placeholder="Введите ширину"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                step="0.1"
                            />
                        </div>
                    </div>
                );

            case 'BED':
                return (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Длина (м)
                            </label>
                            <input
                                type="number"
                                value={dimensions.length || ''}
                                onChange={(e) => setDimensions({...dimensions, length: maxLength(e.target.value)})}
                                placeholder="Введите длину"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ширина (м)
                            </label>
                            <input
                                type="number"
                                value={dimensions.width || ''}
                                onChange={(e) => setDimensions({...dimensions, width: maxWidth(e.target.value)})}
                                placeholder="Введите ширину"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                step="0.1"
                            />
                        </div>
                    </div>
                );

            case 'ROW':
                return (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Длина ряда (м)
                            </label>
                            <input
                                type="number"
                                value={dimensions.length || ''}
                                onChange={(e) => setDimensions({...dimensions, length: maxLength(e.target.value)})}
                                placeholder="Введите длину"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Количество растений
                            </label>
                            <input
                                type="number"
                                value={dimensions.capacity || ''}
                                onChange={(e) => setDimensions({...dimensions, capacity: parseInt(e.target.value)})}
                                placeholder="Количество"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                    </div>
                );

            case 'RACK':
            case 'SHELF':
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Длина (м)
                                </label>
                                <input
                                    type="number"
                                    value={dimensions.length || ''}
                                    onChange={(e) => setDimensions({...dimensions, length: parseFloat(e.target.value)})}
                                    placeholder="Введите длину"
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Ширина (м)
                                </label>
                                <input
                                    type="number"
                                    value={dimensions.width || ''}
                                    onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value)})}
                                    placeholder="Введите ширину"
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    step="0.1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Уровней
                                </label>
                                <input
                                    type="number"
                                    value={dimensions.levels || ''}
                                    onChange={(e) => setDimensions({...dimensions, levels: parseInt(e.target.value)})}
                                    placeholder="Количество уровней"
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'VERTICAL_TOWER':
                return (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Высота (м)
                            </label>
                            <input
                                type="number"
                                value={dimensions.height || ''}
                                onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value)})}
                                placeholder="Введите высоту"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Растений/ярус
                            </label>
                            <input
                                type="number"
                                value={dimensions.capacity || ''}
                                onChange={(e) => setDimensions({...dimensions, capacity: parseInt(e.target.value)})}
                                placeholder="Количество растений"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                    </div>
                );

            case 'POT':
                return (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Диаметр (см)
                            </label>
                            <input
                                type="number"
                                value={dimensions.diameter || ''}
                                onChange={(e) => setDimensions({...dimensions, diameter: parseFloat(e.target.value)})}
                                placeholder="Введите диаметр"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                step="0.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Объем (л)
                            </label>
                            <input
                                type="number"
                                value={dimensions.volume || ''}
                                onChange={(e) => setDimensions({...dimensions, volume: parseFloat(e.target.value)})}
                                placeholder="Введите объем"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                step="0.5"
                            />
                        </div>
                    </div>
                );

            case 'TRAY':
                return (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Размер (см)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={dimensions.length || ''}
                                    onChange={(e) => setDimensions({...dimensions, length: parseFloat(e.target.value)})}
                                    placeholder="Длина"
                                    className="w-1/2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    step="0.5"
                                />
                                <input
                                    type="number"
                                    value={dimensions.width || ''}
                                    onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value)})}
                                    placeholder="Ширина"
                                    className="w-1/2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    step="0.5"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Количество ячеек
                            </label>
                            <input
                                type="number"
                                value={dimensions.cellCount || ''}
                                onChange={(e) => setDimensions({...dimensions, cellCount: parseInt(e.target.value)})}
                                placeholder="Ячеек"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                    </div>
                );

            case 'NFT_CHANNEL':
            case 'DWC_TANK':
            case 'AEROPONIC_CHAMBER':
                return (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Длина (м)
                            </label>
                            <input
                                type="number"
                                value={dimensions.length || ''}
                                onChange={(e) => setDimensions({...dimensions, length: parseFloat(e.target.value)})}
                                placeholder="Введите длину"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ширина (м)
                            </label>
                            <input
                                type="number"
                                value={dimensions.width || ''}
                                onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value)})}
                                placeholder="Введите ширину"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                step="0.1"
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const handleSubmit = () => {
        if (!selectedType) return;

        const requestData: CreateProductionUnitRequest = {
            parentId: parentUnit?.id,
            type: selectedType,
            code,
            name,
            description,
            status,
            dimensions,
            capabilities: selectedCapabilities,
        };

        onSuccess(requestData);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setSelectedType(null);
        setName('');
        setCode('');
        setDimensions({});
        setArea(undefined);
        setSelectedCapabilities([]);
        setDescription('');
        setStatus('active');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Создание объекта" size="full">
            <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
                {/* Родительский объект */}
                {parentUnit && (
                    <div
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{getUnitIcon(parentUnit.type)}</span>
                            <div>
                                <p className="text-sm text-gray-500">Родительский объект</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{parentUnit.name}</p>
                                <p className="text-xs text-gray-500">{getUnitTypeName(parentUnit.type)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Выбор типа */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Тип объекта *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {availableTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => handleTypeSelect(type)}
                                className={`
                                    p-3 rounded-lg border transition-all text-left
                                    ${selectedType === type
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                }
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{getUnitIcon(type)}</span>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{getUnitTypeName(type)}</p>
                                        <p className="text-xs text-gray-500">{type.toLowerCase()}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {selectedType && (
                    <>
                        {/* Размеры - динамические поля в зависимости от типа */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                                Размеры и параметры
                            </h3>
                            {renderDimensionFields()}
                        </div>

                        {/* Площадь (авторасчет или ручной ввод) */}
                        {(selectedType === 'FIELD' || selectedType === 'PLOT') && (
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Площадь
                                    </label>
                                    <input
                                        type="number"
                                        value={area || ''}
                                        onChange={(e) => setArea(parseFloat(e.target.value))}
                                        placeholder="Введите площадь"
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Отображение рассчитанной площади для других типов */}
                        {area !== undefined && selectedType !== 'FIELD' && selectedType !== 'PLOT' && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    📐 Расчетная площадь: {formatArea(area)}
                                </p>
                            </div>
                        )}

                        {/* Возможности */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Возможности
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {availableCapabilities.map((cap) => (
                                    <button
                                        key={cap}
                                        onClick={() => toggleCapability(cap)}
                                        className={`
                                            px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                            ${selectedCapabilities.includes(cap)
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                                        }
                                        `}
                                    >
                                        {cap === 'SOIL' && '🪴 Грунт'}
                                        {cap === 'IRRIGATION' && '💧 Полив'}
                                        {cap === 'FERTIGATION' && '🧪 Фертигация'}
                                        {cap === 'DRAINAGE' && '🚰 Дренаж'}
                                        {cap === 'HYDROPONIC' && '💧 Гидропоника'}
                                        {cap === 'AEROPONIC' && '💨 Аэропоника'}
                                        {cap === 'NUTRIENT_CONTROL' && '⚗️ Контроль питания'}
                                        {cap === 'LIGHTING' && '💡 Досветка'}
                                        {cap === 'CLIMATE_CONTROL' && '🌡️ Климат-контроль'}
                                        {cap === 'SENSOR_SUPPORT' && '📡 Датчики'}
                                        {cap === 'AUTOMATION' && '🤖 Автоматизация'}
                                        {cap === 'SLOT_BASED' && '🔲 Слотовая система'}
                                        {cap === 'MOBILE' && '🚚 Мобильный'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Статус */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Статус
                            </label>
                            <div className="flex gap-3">
                                {[
                                    {value: 'active', label: 'Активен', icon: '🟢'},
                                    {value: 'maintenance', label: 'Обслуживание', icon: '🟡'},
                                    {value: 'planned', label: 'Планируется', icon: '🔵'}
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setStatus(option.value as any)}
                                        className={`
                                            flex-1 py-2 rounded-lg border transition-all
                                            ${status === option.value
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                        }
                                        `}
                                    >
                                        <span className="mr-1">{option.icon}</span>
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Основная информация */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Код
                                </label>
                                <input
                                    type="text"
                                    disabled={true}
                                    value={code}
                                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Название *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={`Введите название ${getUnitTypeName(selectedType).toLowerCase()}`}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Описание */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Описание
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Дополнительная информация об объекте..."
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none"
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => {
                        resetForm();
                        onClose();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    <X className="w-4 h-4"/>
                    Отмена
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!selectedType}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4"/>
                    Создать
                </button>
            </div>
        </Modal>
    );
};