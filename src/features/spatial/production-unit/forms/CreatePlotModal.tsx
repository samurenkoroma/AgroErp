import {useEffect, useMemo, useState} from 'react';
import {Save, X} from 'lucide-react';
import {Modal} from '@/components/common/Modal.tsx';
import {
    getAvailableCapabilities,
    getAvailableChildTypes,
    getUnitIcon,
    getUnitTypeName,
    ProductionUnit,
    ProductionUnitType
} from "@/entities/spatial";
import {CreateProductionUnitRequest, Dimensions} from "@/entities/spatial/production-unit/dto.ts";
import {formatArea} from "@/utils/geometry.ts";

interface CreatePlotModalProps {
    isOpen: boolean,
    onClose: () => void,
    onSuccess: (data: CreateProductionUnitRequest) => void,
    units: ProductionUnit[],
    parent?: ProductionUnit | null
}


export const CreatePlotModal = ({
                                    isOpen,
                                    onClose,
                                    onSuccess,
                                    parent,
                                    units
                                }: CreatePlotModalProps) => {
    const [selectedType, setSelectedType] = useState<ProductionUnitType | null>(parent == null ? 'PLOT' : null);
    const [code, setCode] = useState('');
    const [dimensions, setDimensions] = useState<Dimensions>({});
    const [name, setName] = useState('');
    const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
    const [status, setStatus] = useState<'active' | 'maintenance' | 'planned'>('active');
    const [area, setArea] = useState<number | undefined>();
    const availableTypes = getAvailableChildTypes(parent ? parent.type : undefined);
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
        if (!selectedType) {
            setCode('');
            return;
        }

        const prefix =
            selectedType === 'PLOT' ? 'P' :
                selectedType === 'BED' ? 'B' :
                    selectedType === 'ROW' ? 'R' : 'U';

        const parentCode = parent ? `${parent.code}/` : '';

        const existingCodes = parent
            ? (parent.children ?? []).map(u => u.code)
            : units.map(u => u.code);

        const regex = new RegExp(`^${parentCode}${prefix}-(\\d+)$`);

        const maxNumber = existingCodes.reduce((max, code) => {
            const match = code.match(regex);

            if (!match) {
                return max;
            }

            return Math.max(max, parseInt(match[1], 10));
        }, 0);

        const nextNumber = maxNumber + 1;

        setCode(`${parentCode}${prefix}-${nextNumber.toString().padStart(2, '0')}`);
    };

    const generateName = () => {
        setName(getUnitTypeName(selectedType || 'PLOT'))
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
                setName(`${getUnitTypeName(selectedType)} ${dimensions.length && dimensions.width ? dimensions.length + "x" + dimensions.width : ''} ${dimensions.levels ? `${dimensions.levels} ур` : ''}`)
                break;
        }
    }

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
            createChild: false,
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

    // Функция для расчета площади на основе размеров
    const calculateAreaFromDimensions = () => {
        if (!selectedType) return;

        if (dimensions.length && dimensions.width) {
            const areaM2 = (dimensions.length * dimensions.width) / 10000;
            setArea(areaM2);
        }

    }
// Автоматический расчет площади при изменении размеров
    useEffect(() => {
        calculateAreaFromDimensions();
        generateName()
    }, [dimensions, selectedType]);


    useEffect(() => {
        generateCode();
    }, [selectedType, parent, units]);


    function maxLength(value: string) {
        const maxValue = parent?.properties.dimensions?.length
        if (maxValue == undefined) {
            return +value
        }
        return parseFloat(value) > maxValue ? maxValue : +value
    }

    function maxWidth(value: string) {
        const maxValue = parent?.properties.dimensions?.width
        if (maxValue == undefined) {
            return +value
        }
        return parseFloat(value) > maxValue ? maxValue : +value
    }

    // Рендер полей для размеров в зависимости от типа
    const renderDimensionFields = () => {
        if (!selectedType) return null;


        return (
            <div className="grid grid-cols-3 gap-3">
                {/* Отображение рассчитанной площади для других типов */}
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
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <p className="text-sm text-green-700 dark:text-green-300">
                        📐 Расчетная площадь: {formatArea(area)}
                    </p>
                </div>
            </div>
        )

    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Создание объекта" subtitle={code} size="full">
            <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">

                {/* Выбор типа */}
                {
                    parent != null && (
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
                    )
                }


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
