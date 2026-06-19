// src/components/growing/CreateMultipleCyclesModal.tsx
import {useEffect, useState} from 'react';
import {Calendar, CheckCircle, Copy, Edit, MapPin, Package, Play, Plus, Save, Trash2, X} from 'lucide-react';
import {Modal} from '@/components/common/Modal';
import {useCrops} from "@/features/agronomy/crop";
import {useVarieties} from "@/features/agronomy/variety/queries.ts";
import {dateLib} from "@/utils";
import {getCropIcon} from "@/utils/cropIcons.ts";

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
    available: number;
    unit: string;
}

interface Cycle {
    id: string;
    name: string;
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
    startDate: string;
    expectedHarvestDate: string;
    status: 'draft' | 'planned' | 'active' | 'completed';
    notes?: string;
}

interface CreateMultipleCyclesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (cycles: Cycle[]) => void;
    productionUnitId?: string;
    productionUnitName?: string;
}


const mockContainers: Container[] = [
    {id: 'pot-1', name: 'Горшок 0.5л', type: 'pot', capacity: 1, volume: 0.5, available: 500, unit: 'шт'},
    {id: 'pot-2', name: 'Горшок 1л', type: 'pot', capacity: 1, volume: 1, available: 300, unit: 'шт'},
    {id: 'pot-3', name: 'Горшок 3л', type: 'pot', capacity: 1, volume: 3, available: 150, unit: 'шт'},
    {
        id: 'cassette-1',
        name: 'Кассета 40 ячеек',
        type: 'cassette',
        capacity: 40,
        cellCount: 40,
        available: 80,
        unit: 'шт'
    },
    {
        id: 'cassette-2',
        name: 'Кассета 72 ячейки',
        type: 'cassette',
        capacity: 72,
        cellCount: 72,
        available: 50,
        unit: 'шт'
    },
    {
        id: 'cassette-3',
        name: 'Кассета 128 ячеек',
        type: 'cassette',
        capacity: 128,
        cellCount: 128,
        available: 30,
        unit: 'шт'
    }
];

// ==================== CYCLE CARD COMPONENT ====================

const CycleCard = ({cycle, onEdit, onDelete, onCopy}: {
    cycle: Cycle;
    onEdit: () => void;
    onDelete: () => void;
    onCopy: () => void;
}) => {
    const statusConfig = {
        draft: {label: 'Черновик', icon: <Edit className="w-3 h-3"/>, color: 'bg-gray-100 text-gray-700'},
        planned: {label: 'Запланирован', icon: <Calendar className="w-3 h-3"/>, color: 'bg-blue-100 text-blue-700'},
        active: {label: 'Активен', icon: <Play className="w-3 h-3"/>, color: 'bg-green-100 text-green-700'},
        completed: {label: 'Завершен', icon: <CheckCircle className="w-3 h-3"/>, color: 'bg-purple-100 text-purple-700'}
    };
    const status = statusConfig[cycle.status];

    return (
        <div
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-2 hover:shadow-md transition-all cursor-pointer"
            onClick={onEdit}>
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-base">{cycle.cropIcon}</span>
                        <span
                            className="text-sm font-medium text-gray-900 dark:text-white truncate">{cycle.cropName}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 truncate">{cycle.varietyName}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>{cycle.containerName}</span>
                        <span>×{cycle.quantity}</span>
                        <span className="text-green-600 font-medium">{cycle.totalPlants} шт</span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
            <span
                className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
              {status.icon}
                {status.label}
            </span>
                        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                            <button onClick={onCopy} className="p-0.5 hover:bg-gray-100 rounded" title="Копировать">
                                <Copy className="w-3 h-3 text-gray-500"/>
                            </button>
                            <button onClick={onDelete} className="p-0.5 hover:bg-red-100 rounded" title="Удалить">
                                <Trash2 className="w-3 h-3 text-red-500"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== CYCLE FORM (левая колонка) ====================

const CycleForm = ({onSave, editingCycle, containers, onCancel}: {
    onSave: (data: Omit<Cycle, 'id'>) => void;
    editingCycle?: Cycle | null;
    containers: Container[];
    onCancel: () => void;
}) => {
    const [formData, setFormData] = useState({
        name: '',
        cropId: '',
        varietyId: '',
        containerId: '',
        quantity: 1,
        plantsPerContainer: 1,
        startDate: dateLib.getDateString(new Date()),
        notes: ''
    });

    // 🔥 Синхронизация формы с editingCycle
    useEffect(() => {
        if (editingCycle) {
            setFormData({
                name: editingCycle.name || '',
                cropId: editingCycle.cropId,
                varietyId: editingCycle.varietyId,
                containerId: editingCycle.containerId,
                quantity: editingCycle.quantity,
                plantsPerContainer: editingCycle.plantsPerContainer,
                startDate: editingCycle.startDate,
                notes: editingCycle.notes || ''
            });
        } else {
            // Сброс формы при очистке editingCycle
            setFormData({
                name: '',
                cropId: '',
                varietyId: '',
                containerId: '',
                quantity: 1,
                plantsPerContainer: 1,
                startDate: new Date().toISOString().split('T')[0],
                notes: ''
            });
        }
    }, [editingCycle]);

    const {data: crops = []} = useCrops({categories: ["овощные", "клубнеплоды"]});
    const selectedCrop = crops.find(c => c.id === formData.cropId);
    const {data: varieties = []} = useVarieties(selectedCrop?.id!);
    const selectedVariety = varieties.find(v => v.id === formData.varietyId);
    const selectedContainer = containers.find(c => c.id === formData.containerId);

    const totalPlants = formData.quantity * formData.plantsPerContainer;

    const expectedHarvestDate = new Date(formData.startDate);
    if (selectedVariety) {
        expectedHarvestDate.setDate(expectedHarvestDate.getDate() + selectedVariety.daysToMaturity);
    }

    const handleSubmit = () => {
        if (!formData.cropId || !formData.varietyId || !formData.containerId) return;

        onSave({
            name: formData.name || `${selectedCrop?.name} ${selectedVariety?.name} ${new Date().toLocaleDateString('ru')}`,
            cropId: formData.cropId,
            cropName: selectedCrop!.name,
            cropIcon: selectedCrop!.icon,
            varietyId: formData.varietyId,
            varietyName: selectedVariety!.name,
            containerId: formData.containerId,
            containerName: selectedContainer!.name,
            containerType: selectedContainer!.type,
            quantity: formData.quantity,
            plantsPerContainer: formData.plantsPerContainer,
            totalPlants,
            startDate: formData.startDate,
            expectedHarvestDate: dateLib.getDateString(expectedHarvestDate),
            status: 'draft',
            notes: formData.notes
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingCycle ? 'Редактирование цикла' : 'Новый цикл'}
                </h3>
                {editingCycle && (
                    <button
                        onClick={onCancel}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                        <X className="w-4 h-4"/>
                        Отменить редактирование
                    </button>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Название цикла
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Автоматическое"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm"
                />
            </div>

            {/* Культура - сетка */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Культура *
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {crops.map((crop) => (
                        <button
                            key={crop.id}
                            onClick={() => setFormData({...formData, cropId: crop.id, varietyId: ''})}
                            className={`p-2 rounded-lg border text-center transition-all ${
                                formData.cropId === crop.id
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                            }`}
                        >
                            <span className="text-xl">{getCropIcon(crop.name)}</span>
                            <p className="text-xs mt-0.5">{crop.name}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Сорт + Тара */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Сорт *
                    </label>
                    <select
                        value={formData.varietyId}
                        onChange={(e) => setFormData({...formData, varietyId: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm"
                        disabled={!formData.cropId}
                    >
                        <option value="">Выберите сорт</option>
                        {varieties.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Тара *
                    </label>
                    <select
                        value={formData.containerId}
                        onChange={(e) => setFormData({...formData, containerId: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm"
                        disabled={!formData.varietyId}
                    >
                        <option value="">Выберите тару</option>
                        {containers.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.available} {c.unit})</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Количество + Растений на ед. */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Кол-во тары
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({
                                ...formData,
                                quantity: Math.max(1, parseInt(e.target.value) || 1)
                            })}
                            className="w-16 text-center px-2 py-1 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                            onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                            +
                        </button>
                        <span className="text-sm text-gray-500">{selectedContainer?.unit || 'шт'}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Раст./ед.
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFormData({
                                ...formData,
                                plantsPerContainer: Math.max(1, formData.plantsPerContainer - 1)
                            })}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            value={formData.plantsPerContainer}
                            onChange={(e) => setFormData({
                                ...formData,
                                plantsPerContainer: Math.min(selectedContainer?.capacity || 100, Math.max(1, parseInt(e.target.value) || 1))
                            })}
                            className="w-16 text-center px-2 py-1 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                            onClick={() => setFormData({
                                ...formData,
                                plantsPerContainer: Math.min(selectedContainer?.capacity || 100, formData.plantsPerContainer + 1)
                            })}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                            +
                        </button>
                        <span
                            className="text-sm text-gray-500">раст./{selectedContainer?.unit === 'шт' ? 'шт' : 'ед'}</span>
                    </div>
                </div>
            </div>

            {/* Итого растений */}
            {totalPlants > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Всего растений</p>
                    <p className="text-xl font-bold text-green-600">{totalPlants.toLocaleString()} шт</p>
                </div>
            )}

            {/* Дата начала */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Дата начала
                </label>
                <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm"
                />
                {selectedVariety && (
                    <p className="text-xs text-gray-400 mt-1">
                        Плановый сбор: {expectedHarvestDate.toLocaleDateString('ru')}
                    </p>
                )}
            </div>

            {/* Заметки */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Заметки
                </label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={2}
                    placeholder="Дополнительная информация..."
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg resize-none text-sm"
                />
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                    Очистить
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!formData.cropId || !formData.varietyId || !formData.containerId}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4"/>
                    {editingCycle ? 'Сохранить изменения' : 'Добавить цикл'}
                </button>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

export const CreateMultipleCyclesModal = ({
                                              isOpen,
                                              onClose,
                                              onSuccess,
                                              productionUnitId,
                                              productionUnitName
                                          }: CreateMultipleCyclesModalProps) => {
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);

    const stats = {
        total: cycles.length,
        totalPlants: cycles.reduce((sum, c) => sum + c.totalPlants, 0),
        planned: cycles.filter(c => c.status === 'planned').length
    };

    const handleAddCycle = (cycleData: Omit<Cycle, 'id'>) => {
        const newCycle: Cycle = {
            ...cycleData,
            id: Date.now().toString()
        };
        setCycles([...cycles, newCycle]);
        setEditingCycle(null);
    };

    const handleUpdateCycle = (cycleData: Omit<Cycle, 'id'>) => {
        if (editingCycle) {
            setCycles(cycles.map(c => c.id === editingCycle.id ? {...cycleData, id: c.id} : c));
            setEditingCycle(null);
        }
    };

    const handleEditCycle = (cycle: Cycle) => {
        setEditingCycle(cycle);
    };

    const handleDeleteCycle = (cycleId: string) => {
        setCycles(cycles.filter(c => c.id !== cycleId));
        if (editingCycle?.id === cycleId) {
            setEditingCycle(null);
        }
    };

    const handleCopyCycle = (cycle: Cycle) => {
        const newCycle: Cycle = {
            ...cycle,
            id: Date.now().toString(),
            name: `${cycle.name} (копия)`,
            status: 'draft'
        };
        setCycles([...cycles, newCycle]);
    };

    const handleSubmit = () => {
        console.log(cycles);
        onSuccess(cycles);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setCycles([]);
        setEditingCycle(null);
    };

    const handleCancelEdit = () => {
        setEditingCycle(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={resetForm} title="Создание циклов выращивания" size="full">
            <div className="flex gap-6">
                {/* Левая колонка - форма (2/3) */}
                <div className="w-2/3">
                    <CycleForm
                        onSave={editingCycle ? handleUpdateCycle : handleAddCycle}
                        editingCycle={editingCycle}
                        containers={mockContainers}
                        onCancel={handleCancelEdit}
                    />
                </div>

                {/* Правая колонка - список циклов (1/3) */}
                <div className="w-1/3 border-l border-gray-200 dark:border-gray-700 pl-6">
                    <div className="sticky top-0">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Добавленные циклы
                            </h3>
                            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {cycles.length}
              </span>
                        </div>

                        {/* Статистика */}
                        {cycles.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                                    <p className="text-lg font-bold text-blue-600">{stats.total}</p>
                                    <p className="text-xs text-gray-500">циклов</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                                    <p className="text-lg font-bold text-green-600">{stats.totalPlants.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">растений</p>
                                </div>
                            </div>
                        )}

                        {/* Список циклов */}
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                            {cycles.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Package className="w-8 h-8 text-gray-400 mx-auto mb-2"/>
                                    <p className="text-sm text-gray-500">Нет добавленных циклов</p>
                                    <p className="text-xs text-gray-400">Заполните форму слева</p>
                                </div>
                            ) : (
                                cycles.map((cycle) => (
                                    <CycleCard
                                        key={cycle.id}
                                        cycle={cycle}
                                        onEdit={() => handleEditCycle(cycle)}
                                        onDelete={() => handleDeleteCycle(cycle.id)}
                                        onCopy={() => handleCopyCycle(cycle)}
                                    />
                                ))
                            )}
                        </div>

                        {productionUnitName && (
                            <div className="mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3"/>
                                    <span>Будет добавлено к: <strong>{productionUnitName}</strong></span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    Отмена
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={cycles.length === 0}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4"/>
                    Сохранить все ({cycles.length})
                </button>
            </div>
        </Modal>
    );
};
