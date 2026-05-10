import {useNavigate, useParams} from 'react-router-dom';
import {
    AlertCircle,
    ArrowLeft,
    Beaker,
    Calendar as CalendarIcon,
    Clock,
    Droplets,
    Info,
    MapPin,
    Sun,
    TrendingUp
} from 'lucide-react';
import {useVariety} from "@/features/catalog/queries/useVariety.ts";

const VarietyDetailsPage = () => {
    const navigate = useNavigate();
    const {id, varId} = useParams<{ id:string, varId: string }>();
    const {data: variety} = useVariety(varId!);

    if (variety === null) {
        return (
            <div
                className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background text-foreground h-full">
                <h2 className="text-2xl font-semibold mb-2">Сорт не найден</h2>
                <button
                    onClick={() => navigate(`/crops/${id}`)}
                    className="flex items-center gap-2 px-4 py-2 mt-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                    <ArrowLeft className="w-4 h-4"/>
                    Вернуться к культуре
                </button>
            </div>
        );
    }


    // Photo gallery mock
    const gallery = [
        "https://images.unsplash.com/photo-1589923188900-85dae523342b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1542994740-3061a3455ae6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1702896781096-1149fed1115f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-background text-foreground pb-12">
            <div className="w-full mx-auto px-6 py-8">
                {/* Breadcrumbs */}
                <div
                    className="flex items-center gap-2 text-sm text-muted-foreground mb-6 bg-card px-4 py-2 rounded-lg border border-border">
                    <button
                        onClick={() => navigate('/crops')}
                        className="hover:text-primary transition-colors font-medium"
                    >
                        Культуры
                    </button>
                    <span>/</span>
                    <button
                        onClick={() => navigate(`/crops/${id}`)}
                        className="hover:text-primary transition-colors font-medium"
                    >
                        {variety?.speciesName}
                    </button>
                    <span>/</span>
                    <span className="font-semibold text-foreground">{variety?.name}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                            <h1 className="text-3xl font-bold text-foreground mb-4">{variety?.name}</h1>
                            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                                {variety?.description}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                <div
                                    className="flex items-center gap-4 bg-background p-4 rounded-xl border border-border">
                                    <div
                                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Clock className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Время выращивания</p>
                                        <p className="font-semibold text-foreground">{variety?.daysToMaturity} дней</p>
                                    </div>
                                </div>
                                <div
                                    className="flex items-center gap-4 bg-background p-4 rounded-xl border border-border">
                                    <div
                                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <TrendingUp className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Примерная урожайность</p>
                                        <p className="font-semibold text-foreground">{variety?.yieldPotential} кг/м²</p>
                                    </div>
                                </div>
                                <div
                                    className="flex items-center gap-4 bg-background p-4 rounded-xl border border-border">
                                    <div
                                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <CalendarIcon className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Рекомендуемое время посадки</p>
                                        <p className="font-semibold text-foreground">{variety?.recommendedSeasons.join(" ")}</p>
                                    </div>
                                </div>
                                <div
                                    className="flex items-center gap-4 bg-background p-4 rounded-xl border border-border">
                                    <div
                                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Beaker className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Кислотность почвы (pH)</p>
                                        <p className="font-semibold text-foreground">6.0 - 7.0</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                        {/* Требования к поливу */}
                        {variety?.waterRequirement && (
                            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Droplets className="w-5 h-5 text-blue-500"/>
                                    Требования к поливу
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-background p-4 rounded-xl">
                                        <p className="text-sm text-muted-foreground mb-1">Суточная норма (мин.)</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {variety?.waterRequirement.daily_need_min} <span
                                            className="text-sm font-normal">л/м²/день</span>
                                        </p>
                                    </div>
                                    <div className="bg-background p-4 rounded-xl">
                                        <p className="text-sm text-muted-foreground mb-1">Суточная норма (оптимум)</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {variety?.waterRequirement.daily_need_opt} <span
                                            className="text-sm font-normal">л/м²/день</span>
                                        </p>
                                    </div>
                                </div>

                                {variety?.waterRequirement.critical_phases?.length > 0 && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5"/>
                                            <div>
                                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                                    Критические фазы для полива
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {variety?.waterRequirement.critical_phases.map((phase: string) => (
                                                        <span key={phase}
                                                              className="px-2 py-1 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-lg text-xs">
                                    {phase}
                                </span>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                                                    В эти фазы особенно важен регулярный полив для формирования урожая
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Требования к освещению */}
                        {variety?.lightRequirement && (
                            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Sun className="w-5 h-5 text-amber-500"/>
                                    Требования к освещению
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-background p-4 rounded-xl">
                                        <p className="text-sm text-muted-foreground mb-1">PPFD (мин.)</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {variety.lightRequirement.ppfd_min} <span
                                            className="text-sm font-normal">μmol/m²/s</span>
                                        </p>
                                    </div>
                                    <div className="bg-background p-4 rounded-xl">
                                        <p className="text-sm text-muted-foreground mb-1">PPFD (оптимум)</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {variety.lightRequirement.ppfd_opt} <span
                                            className="text-sm font-normal">μmol/m²/s</span>
                                        </p>
                                    </div>
                                    <div className="bg-background p-4 rounded-xl">
                                        <p className="text-sm text-muted-foreground mb-1">Световой день (мин.)</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {variety.lightRequirement.day_length_min} <span
                                            className="text-sm font-normal">часов</span>
                                        </p>
                                    </div>
                                    <div className="bg-background p-4 rounded-xl">
                                        <p className="text-sm text-muted-foreground mb-1">Световой день (оптимум)</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {variety.lightRequirement.day_length_opt} <span
                                            className="text-sm font-normal">часов</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Тип фотопериода */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Info className="w-4 h-4 text-blue-600"/>
                                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Тип фотопериода:
                </span>
                                        <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    {variety.lightRequirement.photoperiod_type === 'short_day' && 'Короткодневное растение'}
                                            {variety.lightRequirement.photoperiod_type === 'long_day' && 'Длиннодневное растение'}
                                            {variety.lightRequirement.photoperiod_type === 'day_neutral' && 'Нейтральное растение'}
                </span>
                                    </div>
                                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                                        {variety.lightRequirement.photoperiod_type === 'short_day' && 'Цветет при коротком световом дне (<12 часов)'}
                                        {variety.lightRequirement.photoperiod_type === 'long_day' && 'Цветет при длинном световом дне (>14 часов)'}
                                        {variety.lightRequirement.photoperiod_type === 'day_neutral' && 'Цветение не зависит от длины светового дня'}
                                    </p>
                                </div>

                                {variety.lightRequirement.critical_phases?.length > 0 && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5"/>
                                            <div>
                                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                                    Критические фазы для освещения
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {variety.lightRequirement.critical_phases.map((phase: string) => (
                                                        <span key={phase}
                                                              className="px-2 py-1 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-lg text-xs">
                                    {phase}
                                </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Photo Gallery */}
                        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Фотогалерея сорта</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {gallery.map((img, i) => (
                                    <div key={i}
                                         className="aspect-square rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow cursor-pointer relative group">
                                        <img src={img} alt={`Галерея ${i}`}
                                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                        <div
                                            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="w-full lg:w-80 space-y-6">
                        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="h-48 relative">
                                <img src={variety?.image} alt={variety?.name} className="w-full h-full object-cover"/>
                                <div className="absolute top-4 left-4">
                  <span
                      className="px-3 py-1 bg-background/90 text-foreground text-xs font-semibold rounded-md border border-border shadow-sm backdrop-blur-sm">
                    Сертифицировано
                  </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold mb-4">Требования к уходу</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <Droplets className="w-5 h-5 text-blue-500 shrink-0 mt-0.5"/>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Полив</p>
                                            <p className="text-xs text-muted-foreground">Умеренный, 2-3 раза в
                                                неделю</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Sun className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"/>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Освещение</p>
                                            <p className="text-xs text-muted-foreground">Полное солнце, 6-8
                                                часов/день</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-green-500 shrink-0 mt-0.5"/>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Глубина посева</p>
                                            <p className="text-xs text-muted-foreground">3-5 см от поверхности</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-green-500 shrink-0 mt-0.5"/>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Цвет плода</p>
                                            <p className="text-xs text-muted-foreground">{variety?.characteristics.fruitColor}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-green-500 shrink-0 mt-0.5"/>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Вес плода</p>
                                            <p className="text-xs text-muted-foreground">{variety?.characteristics.fruitWeight}</p>
                                        </div>
                                    </li>
                                </ul>

                                <button
                                    className="mt-8 w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                                    Добавить в план посева
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
export default VarietyDetailsPage;