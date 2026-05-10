// src/features/crop-planning/components/LocationSelector.tsx
import {useState} from 'react';
import {Check, Factory, Home, Layers, Leaf, MapPin, Search} from 'lucide-react';
import {Location} from '../../../entities/planning/types.ts';

interface LocationSelectorProps {
    selectedLocationId?: string;
    onSelect: (location: Location) => void;
    locations: Location[];
    isLoading?: boolean;
}

const getLocationIcon = (type: Location['type']) => {
    switch (type) {
        case 'field':
            return <Leaf className="w-5 h-5 text-green-500"/>;
        case 'greenhouse':
            return <Factory className="w-5 h-5 text-blue-500"/>;
        case 'plot':
            return <Home className="w-5 h-5 text-purple-500"/>;
        case 'bed':
            return <Layers className="w-5 h-5 text-orange-500"/>;
        default:
            return <MapPin className="w-5 h-5 text-gray-500"/>;
    }
};

const getLocationTypeText = (type: Location['type']) => {
    switch (type) {
        case 'field':
            return 'Поле';
        case 'greenhouse':
            return 'Теплица';
        case 'plot':
            return 'Участок';
        case 'bed':
            return 'Грядка';
        default:
            return 'Место';
    }
};

const formatArea = (area: number, unit: 'ha' | 'm2') => {
    if (unit === 'ha') {
        if (area < 0.01) {
            return `${(area * 10000).toFixed(0)} м²`;
        }
        return `${area.toFixed(2)} га`;
    }
    return `${area.toFixed(0)} м²`;
};

export const LocationSelector = ({selectedLocationId, onSelect, locations, isLoading}: LocationSelectorProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<Location['type'] | 'all'>('all');

    const filteredLocations = locations.filter(location => {
        const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || location.type === selectedType;
        const isAvailable = location.isAvailable;
        return matchesSearch && matchesType && isAvailable;
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"/>
            </div>
        );
    }

    return (
        <div>
            {/* Поиск и фильтры */}
            <div className="mb-4 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Поиск места посадки..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {(['all', 'field', 'greenhouse', 'plot', 'bed'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                selectedType === type
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                        >
                            {type === 'all' && 'Все'}
                            {type === 'field' && '🌾 Поля'}
                            {type === 'greenhouse' && '🌱 Теплицы'}
                            {type === 'plot' && '📍 Участки'}
                            {type === 'bed' && '📦 Грядки'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Список мест */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredLocations.map((location) => (
                    <button
                        key={location.id}
                        onClick={() => onSelect(location)}
                        className={`
              w-full p-4 rounded-lg border transition-all text-left
              ${selectedLocationId === location.id
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                            : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                        }
            `}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    {getLocationIcon(location.type)}
                                    <h3 className="font-medium text-gray-900 dark:text-white">{location.name}</h3>
                                </div>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                    <span>{getLocationTypeText(location.type)}</span>
                                    <span>•</span>
                                    <span>Площадь: {formatArea(location.area, location.areaUnit)}</span>
                                </div>
                                {location.description && (
                                    <p className="text-xs text-gray-400 mt-1">{location.description}</p>
                                )}
                            </div>
                            {selectedLocationId === location.id && (
                                <Check className="w-5 h-5 text-green-500 shrink-0"/>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {filteredLocations.length === 0 && (
                <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
                    <p className="text-gray-500">Нет доступных мест для посадки</p>
                    <p className="text-xs text-gray-400 mt-1">Проверьте фильтры или добавьте новое место</p>
                </div>
            )}
        </div>
    );
};