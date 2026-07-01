import {useEffect, useState} from "react";
import {Modal} from "@/components/common/Modal.tsx";
import {useCrops} from "@/features/agronomy/crop";
import {useVarieties} from "@/features/agronomy/variety/queries.ts";
import {ProductionUnit} from "@/entities/spatial";
import {StartCycleRequest, startCycleSchema} from "@/entities/production/growing-cycle";
import {generateCode, generateName} from "@/utils/translate.ts";
import {dateLib} from "@/utils/date.ts";
import {useOptionHelpers, useStartCycle} from "@/features/production/growing_cycle";
import {Loader2} from "lucide-react";
import {
    getMethodBgColor,
    getMethodEmoji,
    getStageBgColor,
    getStageEmoji,
    getStatusBgColor,
    getStatusEmoji
} from "@/utils";
import {SelectionCard} from "@/components";

export const StartCycleModal = ({
                                    isOpen,
                                    onClose,
                                    unit
                                }: {
    isOpen: boolean;
    onClose: () => void;
    unit: ProductionUnit;
}) => {
    const {mutate: startCycle, isPending} = useStartCycle();
    const [startedAt, setStartedAt] = useState(dateLib.getDateString(new Date()));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const {data: helpers} = useOptionHelpers()
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
    });

    const validation = startCycleSchema.safeParse(formData);
    const isValid = validation.success;
    const {data: crops = []} = useCrops({});
    const selectedCrop = crops.find(c => c.id === formData.cropID);
    const {data: varieties = []} = useVarieties(selectedCrop?.id!);
    const availableVarieties = varieties.filter(v => v.cropId === formData.cropID);

    const setField = <K extends keyof StartCycleRequest>(field: K, value: StartCycleRequest[K]) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    const reset = () => {
        setFormData({
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
    }

    useEffect(() => {
        const crop = crops.find(c => c.id === formData.cropID)?.name ?? "";
        const variety = availableVarieties.find(v => v.id === formData.varietyID)?.name ?? "";
        setFormData(prev => ({
            ...prev,
            name: generateName(crop, variety, helpers?.methods[formData.method]!, new Date(startedAt)).trim(),
            code: generateCode(crop, variety, formData.method, new Date(startedAt)),
            allocations: [{
                ...prev.allocations[0],
                startedAt: new Date(startedAt),
            }],
        }));
    }, [formData.cropID, formData.varietyID, formData.method, startedAt]);

    const handleSubmit = () => {
        const result = startCycleSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            setErrors({
                cropID: fieldErrors.cropID?.[0] ?? "",
                name: fieldErrors.name?.[0] ?? "",
            });
            return;
        }
        startCycle(result.data, {
            onSuccess: () => {
                reset()
                onClose()
            }

        });
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Новый цикл выращивания ${unit.code}`} size="full">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">

                {/* Культура и сорт */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        {errors.cropID && <p className="text-sm text-red-500 mt-1">{errors.cropID}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Дата начала
                        </label>
                        <input
                            type="date"
                            value={startedAt}
                            onChange={(e) => setStartedAt(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pb-1">
                    <div className="col-span-2">
                        {/* Метод выращивания - карточки */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1 mt-2">
                                Метод выращивания
                            </label>
                            <div className="grid grid-cols-2 gap-3 bg-red-50 rounded-lg">
                                {helpers?.methodsOpt.map(option => (
                                    <SelectionCard
                                        key={option.value}
                                        option={{
                                            value: option.value,
                                            label: option.label,
                                            emoji: getMethodEmoji(option.value),
                                            bg: getMethodBgColor(option.value)
                                        }}
                                        isSelected={formData.method === option.value}
                                        onClick={() => setField("method", option.value)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Статус - карточки */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-2">
                                Статус
                            </label>
                            <div className="grid grid-cols-7 gap-3 bg-blue-50 rounded-lg">
                                {helpers?.statusesOpt.map(option => (

                                    <SelectionCard
                                        key={option.value}
                                        option={{
                                            value: option.value,
                                            label: option.label,
                                            emoji: getStatusEmoji(option.value),
                                            bg: getStatusBgColor(option.value)
                                        }}
                                        isSelected={formData.status === option.value}
                                        onClick={() => setField("status", option.value)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Стадия развития - карточки */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-2">
                                Стадия развития
                            </label>
                            <div className="grid grid-cols-8 gap-3 bg-yellow-50 rounded-lg">
                                {helpers?.stagesOpt.map(option => (
                                    <SelectionCard
                                        key={option.value}
                                        option={{
                                            value: option.value,
                                            label: option.label,
                                            emoji: getStageEmoji(option.value),
                                            bg: getStageBgColor(option.value)
                                        }}
                                        isSelected={formData.stage === option.value}
                                        onClick={() => setField("stage", option.value)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Автогенерация названия и кода */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="grid grid-cols-4 gap-3 text-sm">
                            <span className="font-medium text-gray-600 dark:text-gray-400">Участок:</span>
                            <span
                                className="col-span-3 font-semibold text-gray-900 dark:text-white">{unit.name ? unit.code : unit.name}</span>

                            <span className="font-medium text-gray-600 dark:text-gray-400">Название:</span>
                            <span
                                className="col-span-3 font-semibold text-gray-900 dark:text-white">{formData.name || "—"}</span>
                            <span className="font-medium text-gray-600 dark:text-gray-400">Код:</span>
                            <span
                                className="col-span-3 font-semibold text-gray-700 dark:text-gray-300">{formData.code || "—"}</span>

                            <span className="font-medium text-gray-600 dark:text-gray-400">Культура:</span>
                            <span
                                className="col-span-3 font-semibold text-gray-700 dark:text-gray-300">{selectedCrop?.name || "—"}</span>
                            <span className="font-medium text-gray-600 dark:text-gray-400">Сорт:</span>
                            <span
                                className="col-span-3 font-semibold text-gray-700 dark:text-gray-300">{availableVarieties.find(v => v.id === formData.varietyID)?.name || "—"}</span>


                            <span className="font-medium text-gray-600 dark:text-gray-400">Метод:</span>
                            <span
                                className="col-span-3 font-semibold text-gray-700 dark:text-gray-300">{helpers?.methods[formData.method] || "—"}</span>
                            <span className="font-medium text-gray-600 dark:text-gray-400">Статус:</span>
                            <span
                                className="col-span-3 font-semibold text-gray-700 dark:text-gray-300">{helpers?.statuses[formData.status] || "—"}</span>
                            <span className="font-medium text-gray-600 dark:text-gray-400">Состояние:</span>
                            <span
                                className="col-span-3 font-semibold text-gray-700 dark:text-gray-300">{helpers?.stages[formData.stage] || "—"}</span>
                        </div>
                    </div>
                </div>

            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Отмена
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!isValid || isPending}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin"/>
                            Создание...
                        </>
                    ) : (
                        "Создать"
                    )}
                </button>
            </div>
        </Modal>
    );
};