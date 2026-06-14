import {useEffect, useState} from "react";
import {Modal} from "@/components/common/Modal.tsx";
import {useCrops} from "@/features/agronomy/crop";
import {useVarieties} from "@/features/agronomy/variety/queries.ts";
import {ProductionUnit} from "@/entities/spatial";
import {useOptionHelpers} from "@/features/production/growing_cycle/queries.ts";
import {StartCycleRequest, startCycleSchema} from "@/entities/production/growing-cycle";
import {generateCode, generateName} from "@/utils/translate.ts";
import {dateLib} from "@/utils/date.ts";
import {useStartCycle} from "@/features/production/growing_cycle";

export const StartCycleModal = ({
                                    isOpen,
                                    onClose,
                                    unit
                                }: {
    isOpen: boolean;
    onClose: () => void;
    unit: ProductionUnit;
}) => {
    const {mutate: startCycle} = useStartCycle()
    const [startedAt, setStartedAt] = useState(dateLib.getDateString(new Date()));
    const {data: helpers} = useOptionHelpers()
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState<StartCycleRequest>({
        name: "",
        code: "",
        cropID: "",

        varietyID: undefined,
        protocolID: undefined,

        status: "",
        stage: "",
        method: "",

        allocations: [{
            productionUnitID: unit.id,
            area: unit.area,
            startedAt: new Date(startedAt),
        }],
        plantings: []
    })
    const validation = startCycleSchema.safeParse(formData)
    const isValid = validation.success
    const {data: crops = [],} = useCrops({})
    const selectedCrop = crops.find(c => c.id === formData.cropID);
    const {data: varieties = [],} = useVarieties(selectedCrop?.id!)
    const availableVarieties = varieties.filter(v => v.cropId === formData.cropID);

    const setField = <K extends keyof StartCycleRequest>(field: K, value: StartCycleRequest[K]) => {
        setFormData(prev => ({...prev, [field]: value}))
    }

    useEffect(() => {
        const crop = crops.find(c => c.id === formData.cropID)?.name ?? ""
        const variety = availableVarieties.find(v => v.id === formData.varietyID)?.name ?? ""

        setFormData(prev => ({
            ...prev,
            name: generateName(crop, variety, helpers?.methods[formData.method] ?? "").trim(),
            code: generateCode(crop, variety, formData.method)
        }))

    }, [
        formData.cropID,
        formData.varietyID,
        formData.method
    ])
    const handleSubmit = () => {
        const result = startCycleSchema.safeParse(formData)
        console.log(formData)
        console.log(result)
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors
            setErrors({
                cropID: fieldErrors.cropID?.[0] ?? "",
                name: fieldErrors.name?.[0] ?? "",
            })
            return
        }

        startCycle(result.data)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}
               title={`Новый цикл выращивания ${unit.code}`}
               size="lg">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Начало
                        </label>
                        <input
                            type="date"
                            value={startedAt}
                            onChange={(e) => setStartedAt(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Культура *
                        </label>
                        <select
                            value={formData.cropID}
                            onChange={(e) => setField("cropID", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        >
                            <option value="">Выберите культуру</option>
                            {crops.map(crop => (
                                <option key={crop.id} value={crop.id}>{crop.name}</option>
                            ))}
                        </select>
                        {errors.cropID && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.cropID}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Сорт (опционально)
                        </label>
                        <select
                            value={formData.varietyID}
                            onChange={(e) => setField("varietyID", e.target.value)}
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

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Метод выращивания
                        </label>
                        <select
                            value={formData.method}
                            onChange={(e) => setField("method", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        >
                            <option value="">Выберите метод посадки</option>
                            {helpers?.methodsOpt.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Статус</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setField("status", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        >
                            <option value="">Статус посадки</option>
                            {helpers?.statusesOpt.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Состояние
                        </label>
                        <select
                            value={formData.stage}
                            onChange={(e) => setField("stage", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        >
                            <option value="">Состояние посадки</option>
                            {helpers?.stagesOpt.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                </div>

                <div className="grid grid-cols-4 gap-4">
                    <span className="text-sm font-medium pr-2 text-gray-700 dark:text-gray-300">Название:</span>
                    <span
                        className="text-lg col-span-3 font-bold text-gray-700 dark:text-gray-300">{formData.name}</span>
                    <span
                        className="text-sm font-medium pr-2 text-gray-700 dark:text-gray-300">Кодовое название:</span>
                    <span
                        className="text-lg col-span-3  font-bold text-gray-700 dark:text-gray-300">{formData.code}</span>
                </div>

            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={onClose}
                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                    Отмена
                </button>
                <button onClick={handleSubmit}
                        disabled={!isValid}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors  disabled:opacity-50 disabled:cursor-not-allowed">
                    Создать
                </button>
            </div>
        </Modal>
    );
};

