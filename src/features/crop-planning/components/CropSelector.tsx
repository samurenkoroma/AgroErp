// src/features/crop-planning/components/CropSelector.tsx
import {useState} from 'react';
import {Search, Sprout} from 'lucide-react';
import {Crop} from '../../../entities/planning/types.ts';
import {getCropIcon} from '@/utils/cropIcons';
import {useCrops} from "@/features/catalog/queries/useCrop.ts";

interface CropSelectorProps {
    selectedCropId?: string;
    onSelect: (crop: Crop) => void;
}

export const CropSelector = ({selectedCropId, onSelect}: CropSelectorProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const {data: crops, isLoading} = useCrops();

    const filteredCrops = crops?.filter(crop =>
        crop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"/>
            </div>
        );
    }

    return (
        <div>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input
                    type="text"
                    placeholder="Поиск культуры..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredCrops?.map((crop) => (
                    <button
                        key={crop.key}
                        onClick={() => onSelect(crop)}
                        className={`
              p-3 rounded-lg border transition-all text-left
              ${selectedCropId === crop.key
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                            : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                        }
            `}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{getCropIcon(crop.name)}</span>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{crop.name}</p>
                                <p className="text-xs text-gray-500">{crop.category}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {filteredCrops?.length === 0 && (
                <div className="text-center py-8">
                    <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
                    <p className="text-gray-500">Культуры не найдены</p>
                </div>
            )}
        </div>
    );
};