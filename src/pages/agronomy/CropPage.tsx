import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ArrowRight, MapPin, Search, Sprout} from 'lucide-react';
import {useCreateCrop, useCrops} from "@/features/agronomy/crop";
import {usePageActions} from "@/hooks/usePageActions.ts";
import {CreateCropModal} from "@/features/agronomy/crop/components/CreateCropModal.tsx";
import {CreateCropRequest} from "@/entities/agronomy/crop/dto.ts";

const CropsPage = () => {
    const navigate = useNavigate();
    const [isOpenCreateCrop, setIsOpenCreateCrop] = useState(false)
    const {mutate: createCrop} = useCreateCrop()
    // Подключаем действия к плавающей кнопке
    usePageActions({
        actions:  [
            {
                id: 'add-crop',
                label: 'Добавить культуру ',
                icon: <MapPin className="w-5 h-5"/>,
                onClick: () => setIsOpenCreateCrop(true),
                color: 'bg-green-500'
            },

        ],
    });
    // ✅ ВСЕ ХУКИ В НАЧАЛЕ (без условий!)
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Все');
    const [selectedFamily, setSelectedFamily] = useState('Все');

    const {data: crops, isLoading, error} = useCrops({});

    // ✅ Фильтрация данных (useMemo должен быть после всех useState и useQuery)
    const filteredCrops = useMemo(() => {
        if (!crops) return [];

        return crops.filter(crop => {
            const matchesSearch = searchTerm === '' ||
                crop.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'Все' ||
                crop.category === selectedCategory;
            const matchesFamily = selectedFamily === 'Все' ||
                crop.family === selectedFamily;

            return matchesSearch && matchesCategory && matchesFamily;
        });
    }, [crops, searchTerm, selectedCategory, selectedFamily]);

    // ✅ Уникальные категории для фильтра
    const categories = useMemo(() => {
        if (!crops) return ['Все'];
        const cats = new Set(crops.map(c => c.category));
        return ['Все', ...Array.from(cats)];
    }, [crops]);

    // ✅ Уникальные семейства для фильтра
    const families = useMemo(() => {
        if (!crops) return ['Все'];
        const fams = new Set(crops.map(c => c.family));
        return ['Все', ...Array.from(fams)];
    }, [crops]);

    // ✅ Условные возвраты ТОЛЬКО ПОСЛЕ ВСЕХ ХУКОВ
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-600 text-center">
                    <p className="text-lg font-semibold">Ошибка загрузки</p>
                    <p>{error.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    if (!crops || crops.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
                    <p className="text-gray-500">Нет данных о культурах</p>
                </div>
            </div>
        );
    }

    // ✅ Рендер компонента
    return (
        <div className="p-4 mx-auto w-full space-y-8">

            {/* Filters */}
            <div
                className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Поиск по названию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <select
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat === 'all' ? 'Все категории' : cat}
                        </option>
                    ))}
                </select>

                <select
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={selectedFamily}
                    onChange={(e) => setSelectedFamily(e.target.value)}
                >
                    {families.map(fam => (
                        <option key={fam} value={fam}>
                            {fam === 'all' ? 'Все семейства' : fam}
                        </option>
                    ))}
                </select>
            </div>

            {/* Crops Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

                {filteredCrops.map((crop) => (
                    <div
                        key={crop.id}
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                        onClick={() => navigate(`/crops/${crop.id}`)}
                    >

                        <div className="h-48 overflow-hidden relative">
                            <img
                                src={crop.imageUrl || ''}
                                alt={crop.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                    // Заглушка при ошибке загрузки изображения
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
                                }}
                            />
                            <div className="absolute top-3 left-3">
                                <span
                                    className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-semibold rounded-md">
                                    {crop.category?.split('(')[0]?.trim() || crop.category}
                                </span>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                        {crop.name}
                                    </h3>
                                    <p className="text-sm text-gray-950 dark:text-gray-800 mb-4">
                                        Семейство: {crop.family}
                                    </p>
                                    <button
                                        className="mt-5 w-full py-2 bg-gray-50 dark:bg-gray-800 hover:bg-green-600 dark:hover:bg-green-600 text-gray-700 dark:text-gray-300 hover:text-white rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors">
                                        Подробнее
                                        <ArrowRight className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        </div>


                    </div>
                ))}
            </div>

            {filteredCrops.length === 0 && (
                <div
                    className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        Культуры не найдены
                    </h3>
                    <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
                </div>
            )}

            {
                <CreateCropModal
                    isOpen={isOpenCreateCrop}
                    onClose={() => {
                        setIsOpenCreateCrop(false);
                    }}
                    onSuccess={(data: CreateCropRequest) => createCrop(data)}
                ></CreateCropModal>
            }
        </div>
    );
}
export default CropsPage;