import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    Droplet,
    Droplets,
    FlaskConical,
    MapPin,
    Play,
    Plus,
    Sprout,
    Sun,
    ThermometerIcon,
    Tractor
} from 'lucide-react';
import {CreateSeasonDTO, Season, seasonLib} from "@/entities/season";
import SeasonCard from "@/features/season/ui/SeasonCard.tsx";
import CreateSeasonForm from "@/features/season/ui/CreateSeasonForm.tsx";
import Loading from "@/components/shared/Loading.tsx";
import Error from "@/components/shared/Error.tsx";
import {useSeasons} from "@/features/season/queries/useSeasons.ts";
import {useSeasonUIStore} from "@/features/season/store/useSeasonUIStore.ts";
import {useCreateSeason} from "@/features/season/mutations/useCreateSeason.ts";

// ==================== MAIN COMPONENT ====================

const SeasonsPage = () => {
    const navigate = useNavigate();
    const {data: seasons, refetch, error, isLoading} = useSeasons()
    const {selectedSeasonId, setSelectedSeasonId} = useSeasonUIStore();
    const {mutateAsync} = useCreateSeason()

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingSeason, setEditingSeason] = useState<Season | null>(null);
    const [expandedCrops, setExpandedCrops] = useState<Set<string>>(new Set());

    // Выбранный сезон
    const selectedSeason = useMemo(() => {
        return seasons?.find(s => s.id === selectedSeasonId);
    }, [seasons, selectedSeasonId]);

    // Группировка сезонов по типу
    const groupedSeasons = useMemo(() => {
        return {
            current: seasons?.find(s => s.status === 'current'),
            planning: seasons?.filter(s => s.status === 'planning'),
            past: seasons?.filter(s => s.status === 'completed')
        };
    }, [seasons]);

    // Создание нового сезона
    const handleCreateSeason = (season: CreateSeasonDTO) => {
        mutateAsync({
            name: season.name,
            startDate: season.startDate,
            endDate: season.endDate,
            status: season.status
        });
        setIsCreateModalOpen(false);
    };

    const toggleCropExpand = (cropName: string) => {
        setExpandedCrops(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cropName)) {
                newSet.delete(cropName);
            } else {
                newSet.add(cropName);
            }
            return newSet;
        });
    };

    // Активация сезона
    const handleActivateSeason = (seasonId: string) => {
        // setSeasons(prev => prev.map(season => {
        //     if (season.id === seasonId) {
        //         return {...season, status: 'active', type: 'current'};
        //     }
        //     if (season.type === 'current') {
        //         return {...season, type: 'past', status: 'completed'};
        //     }
        //     return season;
        // }));
    };

    // Удаление сезона
    const handleDeleteSeason = (seasonId: string) => {
        refetch()
        if (selectedSeasonId === seasonId) {
            setSelectedSeasonId(seasons?.find(s => s.id !== seasonId)?.id || '');
        }
    };

    if (isLoading) return (<Loading text="Загрузка теплицы..."/>);
    if (error) return (<Error text="Сезон не найдена"/>);
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="w-full mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar className="w-6 h-6 text-green-600"/>
                                Управление сезонами
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Просмотр и управление сезонами выращивания
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4"/>
                            Создать сезон
                        </button>
                    </div>
                </div>
            </div>
            {seasons.length > 0 ? (
                <div className="w-full mx-auto px-6 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Левая колонка - список сезонов */}
                        <div className="space-y-6">
                            {/* Текущий сезон */}
                            {groupedSeasons?.current && (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Play className="w-4 h-4 text-green-600"/>
                                        Текущий сезон
                                    </h2>
                                    <SeasonCard
                                        season={groupedSeasons.current}
                                        isSelected={selectedSeasonId === groupedSeasons.current.id}
                                        onClick={() => setSelectedSeasonId(groupedSeasons.current!.id)}
                                        onEdit={() => setEditingSeason(groupedSeasons.current!)}
                                        onDelete={() => handleDeleteSeason(groupedSeasons.current!.id)}
                                    />
                                </div>
                            )}

                            {/* Планируемые сезоны */}
                            {groupedSeasons?.planning && groupedSeasons.planning.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-600"/>
                                        Планируемые сезоны
                                    </h2>
                                    <div className="space-y-3">
                                        {groupedSeasons.planning.map(season => (
                                            <SeasonCard
                                                key={season.id}
                                                season={season}
                                                isSelected={selectedSeasonId === season.id}
                                                onClick={() => setSelectedSeasonId(season.id)}
                                                onEdit={() => setEditingSeason(season)}
                                                onDelete={() => handleDeleteSeason(season.id)}
                                                onActivate={() => handleActivateSeason(season.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Прошедшие сезоны */}
                            {groupedSeasons?.past && groupedSeasons.past.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-gray-500"/>
                                        Прошедшие сезоны
                                    </h2>
                                    <div className="space-y-3">
                                        {groupedSeasons.past.map(season => (
                                            <SeasonCard
                                                key={season.id}
                                                season={season}
                                                isSelected={selectedSeasonId === season.id}
                                                onClick={() => setSelectedSeasonId(season.id)}
                                                onEdit={() => setEditingSeason(season)}
                                                onDelete={() => handleDeleteSeason(season.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Правая колонка - детали выбранного сезона */}
                        <div className="lg:col-span-2">
                            {selectedSeason ? (
                                <div
                                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                    {/* Заголовок деталей */}
                                    <div
                                        className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {selectedSeason.name}
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(selectedSeason.startDate).toLocaleDateString('ru')} — {new Date(selectedSeason.endDate).toLocaleDateString('ru')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {seasonLib.isPlanning(selectedSeason) && (
                                                    <button
                                                        onClick={() => handleActivateSeason(selectedSeason.id)}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <Play className="w-4 h-4"/>
                                                        Активировать сезон
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/planning?season=${selectedSeason.id}`)}
                                                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    Перейти к планам
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Статистика */}
                                    <div className="p-6">
                                        {/* Ключевые метрики */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {selectedSeason.statistics.totalPlans}
                                                </p>
                                                <p className="text-xs text-gray-500">Всего планов</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {selectedSeason.statistics.activePlans}
                                                </p>
                                                <p className="text-xs text-gray-500">Активных</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {selectedSeason.statistics.completedPlans}
                                                </p>
                                                <p className="text-xs text-gray-500">Завершено</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                    {selectedSeason.statistics.totalHarvest > 0
                                                        ? `${(selectedSeason.statistics.totalHarvest / 1000).toFixed(1)}т`
                                                        : '—'}
                                                </p>
                                                <p className="text-xs text-gray-500">Собрано урожая</p>
                                            </div>
                                        </div>

                                        {/* Прогресс бар */}
                                        {selectedSeason.statistics.totalPlans > 0 && (
                                            <div className="mb-6">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-500">Прогресс сезона</span>
                                                    <span className="font-medium">
                          {Math.round((selectedSeason.statistics.completedPlans / selectedSeason.statistics.totalPlans) * 100)}%
                        </span>
                                                </div>
                                                <div
                                                    className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full transition-all"
                                                        style={{width: `${(selectedSeason.statistics.completedPlans / selectedSeason.statistics.totalPlans) * 100}%`}}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Топ культур */}

                                        {selectedSeason.statistics.crops.length > 0 && (
                                            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    <Sprout className="w-5 h-5 text-green-600"/>
                                                    Основные культуры
                                                </h3>
                                                <div className="space-y-3">
                                                    {selectedSeason.statistics.crops.map((crop, idx) => {
                                                        const isExpanded = expandedCrops.has(crop.name);
                                                        // Находим все места посадки для этой культуры
                                                        const locations = selectedSeason.plantingArea?.filter(
                                                            loc => loc.cropName === crop.name
                                                        ) || [];

                                                        return (
                                                            <div key={idx}
                                                                 className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                                                {/* Заголовок культуры - кликабельный */}
                                                                <button
                                                                    onClick={() => toggleCropExpand(crop.name)}
                                                                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors flex items-center justify-between"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <span
                                                                            className="text-2xl">{crop.icon || '🌱'}</span>
                                                                        <div className="text-left">
                                                                            <h4 className="font-semibold text-gray-900 dark:text-white">{crop.name}</h4>
                                                                            <p className="text-sm text-gray-500">
                                                                                {crop.area.toFixed(1)} га
                                                                                • {crop.yield > 0 ? `${(crop.yield / 1000).toFixed(1)} т` : 'урожай не собран'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        {crop.yieldPerHa && (
                                                                            <span
                                                                                className="text-sm font-medium text-green-600">
                                    {crop.yieldPerHa.toFixed(0)} ц/га
                                  </span>
                                                                        )}
                                                                        {isExpanded ? (
                                                                            <ChevronDown
                                                                                className="w-5 h-5 text-gray-400"/>
                                                                        ) : (
                                                                            <ChevronRight
                                                                                className="w-5 h-5 text-gray-400"/>
                                                                        )}
                                                                    </div>
                                                                </button>

                                                                {/* Выпадающий список грядок/участков */}
                                                                {isExpanded && locations.length > 0 && (
                                                                    <div
                                                                        className="divide-y divide-gray-200 dark:divide-gray-700">
                                                                        {locations.map((location) => (
                                                                            <div key={location.id}
                                                                                 className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                                                <div
                                                                                    className="flex items-start justify-between flex-wrap gap-3">
                                                                                    <div className="flex-1">
                                                                                        <div
                                                                                            className="flex items-center gap-2 mb-2">
                                          <span className="text-lg">
                                            {location.type === 'field' ? '🌾' : location.type === 'greenhouse' ? '🌱' : '📍'}
                                          </span>
                                                                                            <span
                                                                                                className="font-medium text-gray-900 dark:text-white">{location.name}</span>
                                                                                            <span
                                                                                                className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                                            {location.varietyName}
                                          </span>
                                                                                        </div>

                                                                                        <div
                                                                                            className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                                                            <div
                                                                                                className="flex items-center gap-1 text-gray-500">
                                                                                                <MapPin
                                                                                                    className="w-3 h-3"/>
                                                                                                <span>{location.area.toFixed(2)} {location.type === 'field' ? 'га' : 'м²'}</span>
                                                                                            </div>
                                                                                            <div
                                                                                                className="flex items-center gap-1 text-gray-500">
                                                                                                <Droplet
                                                                                                    className="w-3 h-3 text-blue-500"/>
                                                                                                <span>{(location.resources.waterUsed / 1000).toFixed(0)} м³</span>
                                                                                            </div>
                                                                                            <div
                                                                                                className="flex items-center gap-1 text-gray-500">
                                                                                                <FlaskConical
                                                                                                    className="w-3 h-3 text-green-500"/>
                                                                                                <span>{location.resources.fertilizerUsed.reduce((sum, f) => sum + f.amount, 0).toFixed(0)} кг</span>
                                                                                            </div>
                                                                                            <div
                                                                                                className="flex items-center gap-1 text-gray-500">
                                                                                                <Tractor
                                                                                                    className="w-3 h-3 text-amber-500"/>
                                                                                                <span>{location.resources.fuelUsed.toFixed(0)} л</span>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Дополнительная информация */}
                                                                                        <div
                                                                                            className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                                                            {location.plantedDate && (
                                                                                                <span>Посадка: {new Date(location.plantedDate).toLocaleDateString('ru')}</span>
                                                                                            )}
                                                                                            {location.harvestDate && (
                                                                                                <span>Сбор: {new Date(location.harvestDate).toLocaleDateString('ru')}</span>
                                                                                            )}
                                                                                            <span
                                                                                                className="flex items-center gap-1">
                                            <Clock className="w-3 h-3"/>
                                                                                                {location.resources.laborHours.toLocaleString()} чел-ч
                                          </span>
                                                                                        </div>

                                                                                        {/* Процент выполнения */}
                                                                                        <div className="mt-3">
                                                                                            <div
                                                                                                className="flex justify-between text-xs mb-1">
                                                                                            <span
                                                                                                className="text-gray-500">Выполнение плана</span>
                                                                                                <span
                                                                                                    className="font-medium text-gray-700 dark:text-gray-300">{location.yieldEfficiency.toFixed(0)}%</span>
                                                                                            </div>
                                                                                            <div
                                                                                                className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                                                <div
                                                                                                    className={`h-full rounded-full ${
                                                                                                        location.yieldEfficiency >= 80 ? 'bg-green-500' :
                                                                                                            location.yieldEfficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                                                                    }`}
                                                                                                    style={{width: `${location.yieldEfficiency}%`}}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Если нет мест посадки */}
                                                                {isExpanded && locations.length === 0 && (
                                                                    <div className="p-6 text-center text-gray-500">
                                                                        <Sprout
                                                                            className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                                                                        <p className="text-sm">Нет данных о местах
                                                                            посадки</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}


                                        {/* Погода (для прошедших сезонов) */}
                                        {selectedSeason.weather && (
                                            <div className="mb-6">
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Sun className="w-4 h-4 text-amber-500"/>
                                                    Погодные условия
                                                </h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div
                                                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                                                        <ThermometerIcon className="w-5 h-5 text-red-500 mx-auto mb-1"/>
                                                        <p className="text-lg font-bold">{selectedSeason.weather.avgTemp}°C</p>
                                                        <p className="text-xs text-gray-500">Средняя темп.</p>
                                                    </div>
                                                    <div
                                                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                                                        <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1"/>
                                                        <p className="text-lg font-bold">{selectedSeason.weather.totalPrecipitation} мм</p>
                                                        <p className="text-xs text-gray-500">Осадков</p>
                                                    </div>
                                                    <div
                                                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                                                        <Sun className="w-5 h-5 text-amber-500 mx-auto mb-1"/>
                                                        <p className="text-lg font-bold">{selectedSeason.weather.sunnyDays}</p>
                                                        <p className="text-xs text-gray-500">Солнечных дней</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Заметки */}
                                        {selectedSeason.notes && (
                                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                                                <p className="text-sm text-amber-800 dark:text-amber-300">{selectedSeason.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4"/>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                        Выберите сезон
                                    </h3>
                                    <p className="text-gray-500">
                                        Нажмите на сезон слева, чтобы увидеть детали
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>) : (
                <div
                    className=" p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        Добавьте сезон для начала работы
                    </h3>
                    <div className="text-center py-5">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Создать сезон
                        </button>
                    </div>
                </div>
            )}

            <CreateSeasonForm
                season={editingSeason ? editingSeason : seasonLib.New()}
                isEdit={!!editingSeason}
                isOpen={isCreateModalOpen}
                onConfirm={(season: CreateSeasonDTO) => handleCreateSeason(season)}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default SeasonsPage;