import {GrowingCycle} from "@/entities/production";
import {useEffect, useState} from "react";
import {Modal} from "@/components/common/Modal.tsx";
import {useCrops} from "@/features/agronomy/crop";
import {useVarieties} from "@/features/agronomy/variety/queries.ts";
import {ProductionUnit} from "@/entities/spatial";
import {CreateCycleRequest} from "@/entities/production/growing-cycle/dto.ts";

export const CycleModal = ({
                               isOpen,
                               onClose,
                               onSave,
                               initialData,
                               unit
                           }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateCycleRequest) => void;
    unit: ProductionUnit;
    initialData?: GrowingCycle;
}) => {
    const [name, setName] = useState<string>(initialData?.name || "");
    const [formData, setFormData] = useState({
        productionUnitID: unit.id,
        area: unit.area,
        name: name,
        cropID: initialData?.cropId || '',
        code: initialData?.code || '',
        varietyId: initialData?.varietyId || '',
        method: initialData?.method || 'direct',
    });

    const {data: crops = [],} = useCrops({})
    const selectedCrop = crops.find(c => c.id === formData.cropID);
    const {data: varieties = [],} = useVarieties(selectedCrop?.id)
    const availableVarieties = varieties.filter(v => v.cropId === formData.cropID);

    const handleSubmit = () => {
        formData.code = generateCode()
        formData.name = name
        onSave(formData);
        onClose();
    };

    const generateCode = (): string => {
        return `${unit.code}:${selectedCrop?.key.slice(0, 3).toUpperCase()}/${(new Date()).getFullYear()}`
    }

    useEffect(() => {
        const temp = `${crops.find(c => c.id === formData.cropID)?.name || ''}_${availableVarieties.find(c => c.id === formData.varietyId)?.name || ''}_${formData.method}`
        setName(temp)
    }, [formData]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Редактировать цикл' : `Новый цикл выращивания ${unit.code}`}
               size="lg">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Название *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Введите название цикла"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Культура *
                        </label>
                        <select
                            value={formData.cropID}
                            onChange={(e) => setFormData({
                                ...formData,
                                cropID: e.target.value,
                                method: 'direct',
                                varietyId: '',
                            })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        >
                            <option value="">Выберите культуру</option>
                            {crops.map(crop => (
                                <option key={crop.id} value={crop.id}>{crop.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Сорт (опционально)
                        </label>
                        <select
                            value={formData.varietyId}
                            onChange={(e) => setFormData({
                                ...formData,
                                varietyId: e.target.value,
                            })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            disabled={!formData.cropID}
                        >
                            <option value="">Не выбран</option>
                            {availableVarieties.map(variety => (
                                <option key={variety.id} value={variety.id}>
                                    {variety.name} ({variety.daysToMaturity} дн.)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Метод выращивания
                        </label>
                        <select
                            value={formData.method}
                            onChange={(e) => setFormData({
                                ...formData,
                                method: e.target.value as 'seedling' | 'direct' | 'hydroponic'
                            })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        >
                            <option value="seedling">Рассадный</option>
                            <option value="direct">Прямой посев</option>
                            <option value="hydroponic">Гидропоника</option>
                        </select>
                    </div>
                </div>

            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={onClose}
                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                    Отмена
                </button>
                <button onClick={handleSubmit}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    {initialData ? 'Сохранить' : 'Создать'}
                </button>
            </div>
        </Modal>
    );
};

