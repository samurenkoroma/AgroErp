// src/features/crop-planning/components/VarietySelector.tsx
import {useState} from 'react';
import {Clock, Leaf, Search, Sprout, TrendingUp} from 'lucide-react';
import {Variety} from "@/entities";
import {useVarieties} from "@/features/catalog/queries/useVariety.ts";

interface VarietySelectorProps {
    cropId: string;
    selectedVarietyId?: string;
    onSelect: (variety: Variety) => void;
}

export const VarietySelector = ({cropId, selectedVarietyId, onSelect}: VarietySelectorProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const {data: varieties, isLoading} = useVarieties(cropId);

    const filteredVarieties = varieties?.filter(variety =>
        variety.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"/>
            </div>
        );
    }

    if (!varieties?.length) {
        return (
            <div className="text-center py-8">
                <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
                <p className="text-gray-500">Нет доступных сортов для этой культуры</p>
            </div>
        );
    }

    return (
        <div>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input
                    type="text"
                    placeholder="Поиск сорта..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredVarieties?.map((variety) => (
                    <button
                        key={variety.id}
                        onClick={() => onSelect(variety)}
                        className={`
              w-full p-3 rounded-lg border transition-all text-left
              ${selectedVarietyId === variety.id
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                            : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                        }
            `}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Leaf className="w-4 h-4 text-green-500"/>
                                    <h3 className="font-medium text-gray-900 dark:text-white">{variety.name}</h3>
                                </div>
                                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3"/>
                      {variety.daysToMaturity} дней
                  </span>
                                    <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3"/>
                                        {variety.yieldPotential} ц/га
                  </span>
                                    <span>Высота: {variety.plantHeight} м</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 line-clamp-1">{variety.description}</p>
                            </div>
                            <div className="text-right">
                                {variety.growingTypes.includes('greenhouse') && (
                                    <span
                                        className="inline-block text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                    🌱 теплица
                  </span>
                                )}
                                {variety.growingTypes.includes('open_ground') && (
                                    <span
                                        className="inline-block text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full ml-1">
                    🌾 поле
                  </span>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};