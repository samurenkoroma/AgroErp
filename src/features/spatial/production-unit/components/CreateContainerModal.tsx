import {useEffect, useMemo, useState} from 'react';
import {Save, X} from 'lucide-react';
import {Modal} from '@/components/common/Modal';
import {
    getAvailableCapabilities,
    getAvailableChildTypes,
    getUnitIcon,
    getUnitTypeName,
    ProductionUnit,
    ProductionUnitType
} from "@/entities/spatial";
import {CreateProductionUnitRequest, Dimensions} from "@/entities/spatial/production-unit/dto.ts";

interface CreateContainerModalProps {
    isOpen: boolean,
    onClose: () => void,
    onSuccess: (data: CreateProductionUnitRequest) => void,
    units: ProductionUnit[],
    parent?: ProductionUnit | null
}


export const CreateContainerModal = ({
                                         isOpen,
                                         onClose,
                                         onSuccess,
                                         units,
                                         parent
                                     }: CreateContainerModalProps) => {
    const [selectedType, setSelectedType] = useState<ProductionUnitType | null>();
    const [code, setCode] = useState('');
    const [dimensions, setDimensions] = useState<Dimensions>({});
    const [name, setName] = useState('');
    const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
    const [status, setStatus] = useState<'active' | 'maintenance' | 'planned'>('active');

    const availableTypes = getAvailableChildTypes(parent ? parent.type : 'CONTAINER');
    const availableCapabilities = useMemo(() => selectedType ? getAvailableCapabilities(selectedType) : [], [selectedType]);

    const handleTypeSelect = (type: ProductionUnitType) => {
        setSelectedType(type);
        setSelectedCapabilities(getAvailableCapabilities(type));
        // Сбрасываем размеры при смене типа
        setDimensions({});
    };

    const toggleCapability = (capability: string) => {
        setSelectedCapabilities(prev =>
            prev.includes(capability)
                ? prev.filter(c => c !== capability)
                : [...prev, capability]
        );
    };

    const generateCode = () => {
        const prefix =
            selectedType === 'RACK' ? 'R' :
                selectedType === 'POT' ? 'PT' :
                    selectedType === 'TRAY' ? 'TR' :
                        selectedType === 'DWC_TANK' ? 'DWC' :
                            selectedType === 'SLOT' ? 'S' :
                                selectedType === 'RESERVOIR' ? 'RS' : 'U';
        const existingCodes = units?.map(u => u.code);
        const parentCode = 'CNTR/'
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
        generateName()
    }, [selectedType, dimensions]);

    const handleSubmit = () => {
        if (!selectedType) return;

        const requestData: CreateProductionUnitRequest = {
            parentId: parent?.id,
            name,
            type: selectedType,
            code,
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
        setCode('');
        setDimensions({});
        setSelectedCapabilities([]);
        setStatus('active');
    };

    const generateName = () => {
        setName(getUnitTypeName(selectedType || 'CONTAINER'))
        switch (selectedType) {
            case 'TRAY':
                setName(`${getUnitTypeName(selectedType)} ${dimensions.cellCount || ''}`)
                break;
            case 'POT':
                setName(`${getUnitTypeName(selectedType)} ${dimensions.diameter || ''} ${dimensions.volume ? `(${dimensions.volume} л)` : ''}`)
                break;
            case 'RESERVOIR':
                setName(`${getUnitTypeName(selectedType)} ${dimensions.volume ? `${dimensions.volume} л` : ''}`)
                break;
            case 'RACK':
                setName(`${getUnitTypeName(selectedType)} ${dimensions.length && dimensions.width? dimensions.length +"x"+dimensions.width:''} ${dimensions.levels ? `${dimensions.levels} ур` : ''}`)
                break;


        }
    }

//    'RACK', 'POT', 'TRAY', 'RESERVOIR', 'DWC_TANK'
    // Рендер полей для размеров в зависимости от типа
    const renderDimensionFields = () => {
        if (!selectedType) return null;

        switch (selectedType) {

            case 'RACK':
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

                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={dimensions.cellVolume}
                                    onChange={(e) => setDimensions({
                                        ...dimensions,
                                        cellVolume: parseFloat(e.target.value)
                                    })}
                                    placeholder="Объем ячейки"
                                    className="w-1/2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                                <input
                                    type="number"
                                    value={dimensions.cellCount || ''}
                                    onChange={(e) => setDimensions({
                                        ...dimensions,
                                        cellCount: parseInt(e.target.value)
                                    })}
                                    placeholder="Количество ячеек"
                                    className="w-1/2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />

                            </div>
                        </div>

                    </div>
                );
            case 'DWC_TANK':
                return (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Кол-во растений (шт)
                            </label>
                            <input
                                type="number"
                                value={dimensions.cellCount || ''}
                                onChange={(e) => setDimensions({...dimensions, cellCount: parseFloat(e.target.value)})}
                                placeholder="Введите кол-во растений"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                step="1"
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
                                step="0.1"
                            />
                        </div>
                    </div>
                );
            case 'RESERVOIR':
                return (
                    <div className="grid grid-cols-2 gap-3">
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
                                step="0.1"
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Создание объекта" subtitle={code} size="full">
            <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">

                {/* Выбор типа */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Тип объекта *awd awd
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
                        {/* Основная информация */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={`Введите название `}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>

                            {/* Возможности */}
                            <div>

                                <div className="flex flex-wrap gap-2">
                                    {availableCapabilities.map((cap) => (
                                        <button
                                            key={cap}
                                            onClick={() => toggleCapability(cap)}
                                            className={`
                                            px-3 py-2 rounded-lg text-sm font-medium transition-all
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
                        </div>

                        {/* Размеры - динамические поля в зависимости от типа */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                                Размеры и параметры
                            </h3>
                            {renderDimensionFields()}
                        </div>


                        {/* Основная информация */}
                        <div className="grid grid-cols-2 gap-4">

                        </div>
                    </>
                )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => {
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