import {useNavigate, useParams} from 'react-router-dom';
import {ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, Leaf, TrendingUp} from 'lucide-react';
import Loading from "@/components/shared/Loading.tsx";
import Error from "@/components/shared/Error.tsx";
import {useCrop} from "@/features/catalog/queries/useCrop.ts";
import {useVarieties} from "@/features/catalog/queries/useVariety.ts";

const CropDetailsPage = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    // ✅ Вызов хука useCropTypes - ВСЕГДА в одном месте
    const {data: crop, error, isLoading} = useCrop(id!);
    const {data: varieties} = useVarieties(id!);

    if (isLoading) return (<Loading text="Загрузка культуры..."/>);
    if (error || !crop ) return (<Error text="Культура не найдена"/>);


    if (error && !crop) {
        return (
            <div
                className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background text-foreground h-full">
                <h2 className="text-2xl font-semibold mb-2">Культура не найдена</h2>
                <button
                    onClick={() => navigate('/crops')}
                    className="flex items-center gap-2 px-4 py-2 mt-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                    <ArrowLeft className="w-4 h-4"/>
                    Вернуться к культурам
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-background text-foreground pb-12">
            {/* Header Hero */}
            <div className="relative h-64 md:h-80 w-full bg-muted">
                <img
                    src={crop.imageUrl}
                    alt={crop.name}
                    className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto flex items-end justify-between">
                    <div>
                        <div
                            className="flex items-center gap-4 text-sm text-foreground/80 mb-4 bg-background/50 backdrop-blur-md px-3 py-1.5 rounded-lg inline-flex w-fit">
                            <button
                                onClick={() => navigate('/crops')}
                                className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
                            >
                                <ArrowLeft className="w-4 h-4"/>
                                Все культуры
                            </button>
                            <span>/</span>
                            <span className="font-semibold">{crop.name}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground drop-shadow-md">
                            {crop.name}
                        </h1>
                        <div className="flex flex-wrap gap-3 mt-4">
              <span
                  className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-semibold backdrop-blur-md">
                {crop.category}
              </span>
                            <span
                                className="px-3 py-1 bg-secondary/80 text-secondary-foreground border border-border rounded-full text-sm font-medium backdrop-blur-md">
                Семейство: {crop.family}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8 space-y-12">
                {/* Description */}
                <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Leaf className="w-6 h-6 text-primary"/>
                        Описание культуры
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {crop.name} — это важнейшая сельскохозяйственная культура, относящаяся к
                        семейству {crop.family.toLowerCase()} и категории "{crop.category.toLowerCase()}".
                    </p>
                </section>

                {/* Varieties List */}
                {varieties && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Сорта ({varieties.length})</h2>
                            <button className="text-sm font-medium text-primary hover:text-primary/80">Добавить сорт
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {varieties.map((variety) => (
                                <div key={variety.id}
                                     className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                                    <div className="h-40 overflow-hidden relative">
                                        <img src={variety.image} alt={variety.name}
                                             className="w-full h-full object-cover"/>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-foreground mb-2">{variety.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-5 flex-1">{variety.description}</p>

                                        <div className="space-y-2 text-sm mb-6">
                                            <div className="flex items-center gap-2 text-foreground">
                                                <Clock className="w-4 h-4 text-muted-foreground"/>
                                                <span
                                                    className="font-medium">{variety.daysToMaturity} дней</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-foreground">
                                                <TrendingUp className="w-4 h-4 text-muted-foreground"/>
                                                <span
                                                    className="font-medium">{variety.yieldPotential} кг/м²</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-foreground">
                                                <CalendarIcon className="w-4 h-4 text-muted-foreground"/>
                                                <span className="font-medium">10</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/crops/${crop.key}/variety/${variety.id}`)}
                                            className="w-full py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            Подробнее о сорте
                                            <ArrowRight className="w-4 h-4"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>)}
            </div>
        </div>
    );
};

export default CropDetailsPage;