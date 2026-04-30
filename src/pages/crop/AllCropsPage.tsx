// pages/crops/AllCropsPage.tsx
import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Edit,
    Eye,
    Filter,
    Flower2,
    MapPin,
    Package,
    Play,
    Plus,
    Search,
    Sprout,
    Trash2,
    X
} from 'lucide-react';

// ==================== TYPES ====================

interface CropPlan {
    id: string;
    name: string;
    crop_name: string;
    variety_name: string;
    bed_id: string;
    bed_name: string;
    object_type: 'field' | 'greenhouse' | 'plot';
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    status_text: string;
    planting_date: string;
    expected_harvest_date: string;
    actual_harvest_date?: string;
    expected_yield: number;
    actual_yield: number;
    progress: number;
    area: number;
    area_unit: 'ha' | 'm2';
    is_seedling: boolean;
    seedling_status?: 'sowing' | 'growing' | 'ready' | 'planted' | 'overdue';
    created_at: string;
    updated_at: string;
    assigned_to: string;
    assigned_name: string;
    notes?: string;
    tasks_completed: number;
    tasks_total: number;
}

interface CropPlanFormData {
    name: string;
    crop_name: string;
    variety_name: string;
    bed_id: string;
    bed_name: string;
    planting_date: string;
    expected_harvest_date: string;
    expected_yield: number;
    area: number;
    is_seedling: boolean;
    assigned_to: string;
    assigned_name: string;
    notes?: string;
}

// ==================== MOCK DATA ====================

const mockCropPlans: CropPlan[] = [
    {
        id: 'plan-1',
        name: 'Пшеница озимая 2025',
        crop_name: 'Пшеница озимая',
        variety_name: 'Мироновская 65',
        bed_id: 'field-1',
        bed_name: 'Поле Северное',
        object_type: 'field',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2024-09-15',
        expected_harvest_date: '2025-07-20',
        expected_yield: 4250,
        actual_yield: 3100,
        progress: 72,
        area: 50,
        area_unit: 'ha',
        is_seedling: false,
        created_at: '2024-08-01T10:00:00Z',
        updated_at: '2025-04-15T14:30:00Z',
        assigned_to: 'user-1',
        assigned_name: 'Иван Иванов',
        tasks_completed: 12,
        tasks_total: 18,
        notes: 'Хорошая перезимовка'
    },
    {
        id: 'plan-2',
        name: 'Томаты ранние 2025',
        crop_name: 'Томат',
        variety_name: 'Бычье сердце',
        bed_id: 'greenhouse-1-bed1',
        bed_name: 'Теплица №1 / Грядка 1',
        object_type: 'greenhouse',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2025-04-20',
        expected_harvest_date: '2025-07-20',
        expected_yield: 1750,
        actual_yield: 450,
        progress: 25,
        area: 0.25,
        area_unit: 'm2',
        is_seedling: true,
        seedling_status: 'growing',
        created_at: '2025-02-15T10:00:00Z',
        updated_at: '2025-04-20T08:00:00Z',
        assigned_to: 'user-1',
        assigned_name: 'Иван Иванов',
        tasks_completed: 8,
        tasks_total: 32,
        notes: 'Рассада крепкая'
    },
    {
        id: 'plan-3',
        name: 'Кукуруза 2025',
        crop_name: 'Кукуруза',
        variety_name: 'Днепровский 247',
        bed_id: 'field-2',
        bed_name: 'Поле Восточное',
        object_type: 'field',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2025-04-25',
        expected_harvest_date: '2025-09-10',
        expected_yield: 5250,
        actual_yield: 3750,
        progress: 71,
        area: 75,
        area_unit: 'ha',
        is_seedling: false,
        created_at: '2025-02-01T10:00:00Z',
        updated_at: '2025-04-25T14:30:00Z',
        assigned_to: 'user-2',
        assigned_name: 'Петр Петров',
        tasks_completed: 15,
        tasks_total: 21,
        notes: 'Всходы дружные'
    },
    {
        id: 'plan-4',
        name: 'Огурцы весенние 2025',
        crop_name: 'Огурец',
        variety_name: 'Герман F1',
        bed_id: 'greenhouse-1-bed2',
        bed_name: 'Теплица №1 / Грядка 2',
        object_type: 'greenhouse',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2025-05-01',
        expected_harvest_date: '2025-07-15',
        expected_yield: 600,
        actual_yield: 320,
        progress: 53,
        area: 0.25,
        area_unit: 'm2',
        is_seedling: true,
        seedling_status: 'planted',
        created_at: '2025-03-01T10:00:00Z',
        updated_at: '2025-05-01T09:00:00Z',
        assigned_to: 'user-3',
        assigned_name: 'Мария Сидорова',
        tasks_completed: 14,
        tasks_total: 26,
        notes: 'Хороший урожай'
    },
    {
        id: 'plan-5',
        name: 'Соя 2025',
        crop_name: 'Соя',
        variety_name: 'Аннушка',
        bed_id: 'field-3',
        bed_name: 'Поле Западное',
        object_type: 'field',
        status: 'draft',
        status_text: 'Черновик',
        planting_date: '2025-05-10',
        expected_harvest_date: '2025-08-20',
        expected_yield: 2300,
        actual_yield: 0,
        progress: 0,
        area: 33,
        area_unit: 'ha',
        is_seedling: false,
        created_at: '2025-04-10T10:00:00Z',
        updated_at: '2025-04-10T10:00:00Z',
        assigned_to: 'user-1',
        assigned_name: 'Иван Иванов',
        tasks_completed: 0,
        tasks_total: 15,
        notes: 'План в разработке'
    },
    {
        id: 'plan-6',
        name: 'Перец сладкий 2025',
        crop_name: 'Перец сладкий',
        variety_name: 'Калифорнийское чудо',
        bed_id: 'greenhouse-2-bed1',
        bed_name: 'Теплица №2 / Грядка 1',
        object_type: 'greenhouse',
        status: 'planned',
        status_text: 'Запланирован',
        planting_date: '2025-05-25',
        expected_harvest_date: '2025-08-25',
        expected_yield: 800,
        actual_yield: 0,
        progress: 0,
        area: 0.2,
        area_unit: 'm2',
        is_seedling: true,
        seedling_status: 'sowing',
        created_at: '2025-04-15T10:00:00Z',
        updated_at: '2025-04-15T10:00:00Z',
        assigned_to: 'user-1',
        assigned_name: 'Иван Иванов',
        tasks_completed: 2,
        tasks_total: 28,
        notes: 'Семена заказаны'
    },
    {
        id: 'plan-7',
        name: 'Картофель 2025',
        crop_name: 'Картофель',
        variety_name: 'Невский',
        bed_id: 'plot-1-bed1',
        bed_name: 'Участок Приусадебный / Грядка 1',
        object_type: 'plot',
        status: 'completed',
        status_text: 'Завершен',
        planting_date: '2025-04-01',
        expected_harvest_date: '2025-07-01',
        expected_yield: 500,
        actual_yield: 520,
        progress: 100,
        area: 0.04,
        area_unit: 'm2',
        is_seedling: false,
        created_at: '2025-03-01T10:00:00Z',
        updated_at: '2025-07-01T16:00:00Z',
        assigned_to: 'user-3',
        assigned_name: 'Мария Сидорова',
        tasks_completed: 18,
        tasks_total: 18,
        notes: 'Урожай отличный!'
    }
];

// ==================== COMPONENTS ====================

const StatusBadge = ({ status }: { status: CropPlan['status'] }) => {
    const config = {
        active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Активен', icon: <Play className="w-3 h-3" /> },
        completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Завершен', icon: <CheckCircle className="w-3 h-3" /> },
        draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', label: 'Черновик', icon: <Edit className="w-3 h-3" /> },
        cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Отменен', icon: <X className="w-3 h-3" /> },
        planned: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Запланирован', icon: <Calendar className="w-3 h-3" /> }
    };
    const style = config[status] || config.draft;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
            {style.label}
    </span>
    );
};

const SeedlingBadge = ({ status }: { status?: string }) => {
    const config: Record<string, { bg: string; text: string; label: string; icon: JSX.Element }> = {
        sowing: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Посев', icon: <Sprout className="w-3 h-3" /> },
        growing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Растет', icon: <Flower2 className="w-3 h-3" /> },
        ready: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Готова', icon: <CheckCircle className="w-3 h-3" /> },
        planted: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Высажена', icon: <MapPin className="w-3 h-3" /> },
        overdue: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Переросла', icon: <AlertTriangle className="w-3 h-3" /> }
    };

    if (!status || !config[status]) return null;
    const style = config[status];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
            {style.label}
    </span>
    );
};

// Модалка создания/редактирования
const CropPlanModal = ({
                           isOpen,
                           onClose,
                           onSave,
                           initialData,
                           title
                       }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CropPlanFormData) => void;
    initialData?: CropPlan;
    title: string;
}) => {
    const [formData, setFormData] = useState<CropPlanFormData>({
        name: '',
        crop_name: '',
        variety_name: '',
        bed_id: '',
        bed_name: '',
        planting_date: new Date().toISOString().split('T')[0],
        expected_harvest_date: '',
        expected_yield: 0,
        area: 0,
        is_seedling: false,
        assigned_to: 'user-1',
        assigned_name: 'Иван Иванов',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                crop_name: initialData.crop_name,
                variety_name: initialData.variety_name,
                bed_id: initialData.bed_id,
                bed_name: initialData.bed_name,
                planting_date: initialData.planting_date,
                expected_harvest_date: initialData.expected_harvest_date,
                expected_yield: initialData.expected_yield,
                area: initialData.area,
                is_seedling: initialData.is_seedling,
                assigned_to: initialData.assigned_to,
                assigned_name: initialData.assigned_name,
                notes: initialData.notes || ''
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Культура *</label>
                            <input
                                type="text"
                                value={formData.crop_name}
                                onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                                required
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Сорт</label>
                            <input
                                type="text"
                                value={formData.variety_name}
                                onChange={(e) => setFormData({ ...formData, variety_name: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Место посадки *</label>
                            <input
                                type="text"
                                value={formData.bed_name}
                                onChange={(e) => setFormData({ ...formData, bed_name: e.target.value })}
                                required
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата посадки *</label>
                            <input
                                type="date"
                                value={formData.planting_date}
                                onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                                required
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ожидаемый сбор</label>
                            <input
                                type="date"
                                value={formData.expected_harvest_date}
                                onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ожидаемая урожайность *</label>
                            <input
                                type="number"
                                value={formData.expected_yield}
                                onChange={(e) => setFormData({ ...formData, expected_yield: parseFloat(e.target.value) })}
                                required
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Площадь *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                                required
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_seedling}
                                onChange={(e) => setFormData({ ...formData, is_seedling: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Рассадный метод</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ответственный</label>
                        <input
                            type="text"
                            value={formData.assigned_name}
                            onChange={(e) => setFormData({ ...formData, assigned_name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Заметки</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Отмена
                        </button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Модалка подтверждения удаления
const DeleteConfirmModal = ({
                                isOpen,
                                onClose,
                                onConfirm,
                                planName
                            }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    planName: string;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full">
                <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Удаление плана</h2>
                </div>
                <div className="p-5">
                    <p className="text-gray-600 dark:text-gray-400">
                        Вы уверены, что хотите удалить план "{planName}"? Это действие нельзя отменить.
                    </p>
                </div>
                <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Отмена
                    </button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
};

// Карточка плана (для grid-режима)
const PlanCard = ({ plan, onEdit, onDelete, onClick }: {
    plan: CropPlan;
    onEdit: () => void;
    onDelete: () => void;
    onClick: () => void;
}) => {
    const getCropIcon = () => {
        const icons: Record<string, string> = {
            'Пшеница озимая': '🌾',
            'Томат': '🍅',
            'Кукуруза': '🌽',
            'Огурец': '🥒',
            'Соя': '🫘',
            'Перец сладкий': '🫑',
            'Картофель': '🥔'
        };
        return icons[plan.crop_name] || '🌱';
    };

    const getProgressColor = () => {
        if (plan.progress >= 80) return 'bg-green-500';
        if (plan.progress >= 50) return 'bg-blue-500';
        if (plan.progress >= 25) return 'bg-yellow-500';
        return 'bg-gray-500';
    };

    const getAreaDisplay = () => {
        return `${plan.area} ${plan.area_unit === 'ha' ? 'га' : 'м²'}`;
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all group">
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">{getCropIcon()}</span>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{plan.crop_name}</h3>
                            <p className="text-xs text-gray-500">{plan.variety_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <StatusBadge status={plan.status} />
                        {plan.is_seedling && <SeedlingBadge status={plan.seedling_status} />}
                    </div>
                </div>

                <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {plan.bed_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{getAreaDisplay()}</p>
                </div>

                <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Прогресс</span>
                        <span className="font-medium">{plan.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${getProgressColor()}`}
                            style={{ width: `${plan.progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
              {new Date(plan.planting_date).toLocaleDateString('ru')}
          </span>
                    <span className="flex items-center gap-1">
            <Package className="w-3 h-3" />
                        {plan.actual_yield}/{plan.expected_yield} кг
          </span>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={(e) => { e.stopPropagation(); onClick(); }}
                        className="flex-1 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    >
                        Детали
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Строка плана (для list-режима)
const PlanRow = ({ plan, onEdit, onDelete, onClick }: {
    plan: CropPlan;
    onEdit: () => void;
    onDelete: () => void;
    onClick: () => void;
}) => {
    const getCropIcon = () => {
        const icons: Record<string, string> = {
            'Пшеница озимая': '🌾',
            'Томат': '🍅',
            'Кукуруза': '🌽',
            'Огурец': '🥒',
            'Соя': '🫘',
            'Перец сладкий': '🫑',
            'Картофель': '🥔'
        };
        return icons[plan.crop_name] || '🌱';
    };

    const getProgressColor = () => {
        if (plan.progress >= 80) return 'bg-green-500';
        if (plan.progress >= 50) return 'bg-blue-500';
        if (plan.progress >= 25) return 'bg-yellow-500';
        return 'bg-gray-500';
    };

    const getAreaDisplay = () => {
        return `${plan.area} ${plan.area_unit === 'ha' ? 'га' : 'м²'}`;
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
                <span className="text-2xl">{getCropIcon()}</span>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{plan.crop_name}</h3>
                        <span className="text-xs text-gray-500">• {plan.variety_name}</span>
                        <StatusBadge status={plan.status} />
                        {plan.is_seedling && <SeedlingBadge status={plan.seedling_status} />}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
                {plan.bed_name}
            </span>
                        <span>{getAreaDisplay()}</span>
                        <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
                            {new Date(plan.planting_date).toLocaleDateString('ru')}
            </span>
                        <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
                            {plan.actual_yield}/{plan.expected_yield} кг
            </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1">
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${getProgressColor()}`}
                                    style={{ width: `${plan.progress}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{plan.progress}%</span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onClick()}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Детали"
                    >
                        <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                        onClick={() => onEdit()}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Редактировать"
                    >
                        <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                        onClick={() => onDelete()}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Удалить"
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

const AllCropsPage = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<CropPlan[]>(mockCropPlans);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<CropPlan | null>(null);
    const [deletingPlan, setDeletingPlan] = useState<CropPlan | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Фильтрация
    const filteredPlans = useMemo(() => {
        let filtered = plans;

        if (searchTerm) {
            filtered = filtered.filter(plan =>
                plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                plan.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                plan.variety_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                plan.bed_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(plan => plan.status === statusFilter);
        }

        if (typeFilter !== 'all') {
            filtered = filtered.filter(plan => plan.object_type === typeFilter);
        }

        return filtered;
    }, [plans, searchTerm, statusFilter, typeFilter]);

    // Статистика
    const stats = useMemo(() => {
        const active = plans.filter(p => p.status === 'active').length;
        const completed = plans.filter(p => p.status === 'completed').length;
        const draft = plans.filter(p => p.status === 'draft').length;
        const planned = plans.filter(p => p.status === 'planned').length;
        const totalYield = plans.reduce((sum, p) => sum + p.actual_yield, 0);
        const totalExpected = plans.reduce((sum, p) => sum + p.expected_yield, 0);
        const avgProgress = plans.reduce((sum, p) => sum + p.progress, 0) / (plans.length || 1);

        return { active, completed, draft, planned, totalYield, totalExpected, avgProgress };
    }, [plans]);

    const handleSave = (data: CropPlanFormData) => {
        if (editingPlan) {
            // Обновление
            setPlans(prev => prev.map(p =>
                p.id === editingPlan.id
                    ? { ...p, ...data, updated_at: new Date().toISOString() }
                    : p
            ));
        } else {
            // Создание нового
            const newPlan: CropPlan = {
                id: `plan-${Date.now()}`,
                ...data,
                object_type: 'field',
                status: 'draft',
                status_text: 'Черновик',
                actual_yield: 0,
                progress: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                tasks_completed: 0,
                tasks_total: 0
            };
            setPlans(prev => [newPlan, ...prev]);
        }
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const handleDelete = () => {
        if (deletingPlan) {
            setPlans(prev => prev.filter(p => p.id !== deletingPlan.id));
            setDeletingPlan(null);
        }
    };

    const handleViewDetails = (planId: string) => {
        navigate(`/plan/${planId}`);
    };

    const getStatusCount = (status: string) => {
        switch (status) {
            case 'active': return stats.active;
            case 'completed': return stats.completed;
            case 'draft': return stats.draft;
            case 'planned': return stats.planned;
            default: return 0;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Sprout className="w-6 h-6 text-green-600" />
                                Все посевы
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Управление всеми планами посева
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingPlan(null);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Новый посев
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        <p className="text-xs text-gray-500">Активных</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                        <p className="text-xs text-gray-500">Завершено</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.planned}</p>
                        <p className="text-xs text-gray-500">Запланировано</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                        <p className="text-xs text-gray-500">Черновики</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-2xl font-bold text-amber-600">{stats.totalYield.toFixed(0)}</p>
                        <p className="text-xs text-gray-500">Собрано (кг)</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-2xl font-bold text-gray-600">{stats.avgProgress.toFixed(0)}%</p>
                        <p className="text-xs text-gray-500">Ср. прогресс</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск по названию, культуре, сорту или месту..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                                showFilters
                                    ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400'
                                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            Фильтры
                            {(statusFilter !== 'all' || typeFilter !== 'all') && (
                                <span className="ml-1 w-5 h-5 bg-green-500 text-white rounded-full text-xs flex items-center justify-center">
                  {(statusFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0)}
                </span>
                            )}
                        </button>
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-white dark:bg-gray-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                📱 Сетка
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-white dark:bg-gray-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                📋 Список
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Статус</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                >
                                    <option value="all">Все статусы</option>
                                    <option value="active">Активные ({getStatusCount('active')})</option>
                                    <option value="completed">Завершенные ({getStatusCount('completed')})</option>
                                    <option value="planned">Запланированные ({getStatusCount('planned')})</option>
                                    <option value="draft">Черновики ({getStatusCount('draft')})</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тип объекта</label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                >
                                    <option value="all">Все типы</option>
                                    <option value="field">🌾 Поля</option>
                                    <option value="greenhouse">🌱 Теплицы</option>
                                    <option value="plot">📍 Участки</option>
                                </select>
                            </div>
                            {(statusFilter !== 'all' || typeFilter !== 'all') && (
                                <button
                                    onClick={() => {
                                        setStatusFilter('all');
                                        setTypeFilter('all');
                                    }}
                                    className="text-sm text-red-500 hover:text-red-600 mt-auto mb-1"
                                >
                                    Сбросить фильтры
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Crops List */}
                {filteredPlans.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                        <Sprout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Нет посевов
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                ? 'Попробуйте изменить параметры поиска'
                                : 'Создайте свой первый план посева'}
                        </p>
                        {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                            <button
                                onClick={() => {
                                    setEditingPlan(null);
                                    setIsModalOpen(true);
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Создать план
                            </button>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPlans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onEdit={() => {
                                    setEditingPlan(plan);
                                    setIsModalOpen(true);
                                }}
                                onDelete={() => setDeletingPlan(plan)}
                                onClick={() => handleViewDetails(plan.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredPlans.map((plan) => (
                            <PlanRow
                                key={plan.id}
                                plan={plan}
                                onEdit={() => {
                                    setEditingPlan(plan);
                                    setIsModalOpen(true);
                                }}
                                onDelete={() => setDeletingPlan(plan)}
                                onClick={() => handleViewDetails(plan.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CropPlanModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPlan(null);
                }}
                onSave={handleSave}
                initialData={editingPlan || undefined}
                title={editingPlan ? 'Редактировать план' : 'Новый план посева'}
            />

            <DeleteConfirmModal
                isOpen={!!deletingPlan}
                onClose={() => setDeletingPlan(null)}
                onConfirm={handleDelete}
                planName={deletingPlan?.name || ''}
            />
        </div>
    );
};

export default AllCropsPage;