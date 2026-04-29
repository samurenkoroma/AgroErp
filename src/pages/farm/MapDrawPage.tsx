import {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Feature, Polygon} from "geojson";
import {
    ArrowLeft,
    Download,
    Edit,
    Eye,
    EyeOff,
    Layers,
    Maximize2,
    RefreshCw,
    Save,
    Trash2,
    Upload,
    Wheat
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import {PolygonEditor} from '@/components/map/PolygonEditor';
import * as turf from '@turf/turf';
import {calculateDimension, formatArea} from "@/utils/geometry.ts";
import {Button} from "@/components/ui/button.tsx";
import {useUIStore} from '@/stores/uiStore'
import {v4 as uuidv4} from 'uuid';
import {CreateObjectModal} from "@/features/farm/ui/CreateObjectModal.tsx";
import {useCreateObject} from "@/features/farm/mutations/useCreateObject.ts";

interface FieldFormData {
    name: string;
    width: number;
    length: number;
}


export interface ImportedField extends Feature<Polygon> {
    area: number;
    selected: boolean;
    properties: {
        type: 'field' | 'greenhouse' | 'plot';
        name: string;
        width: number;
        length: number;
    }
    type: 'Feature'
}


// Цвета для разных полей (для неподсвеченных)
const fieldColors = [
    // '#3b82f6', // синий
    // '#ef4444', // красный
    '#f59e0b', // оранжевый
    // '#8b5cf6', // фиолетовый
    // '#ec489a', // розовый
    // '#06b6d4', // голубой
    // '#10b981', // зеленый
    // '#f97316', // оранжевый
];


const processGeometry = (geometry: any, properties: any): ImportedField => {
    if (!geometry || !geometry.coordinates) return null;

    let finalGeometry = geometry;
    if (geometry.type === 'MultiPolygon' && geometry.coordinates.length > 0) {
        finalGeometry = {
            type: 'Polygon',
            coordinates: geometry.coordinates[0]
        };
    }

    const area = turf.area(finalGeometry) / 10000;
    const {width, length} = calculateDimension(geometry)
    return {
        id: uuidv4(),
        geometry: finalGeometry,
        properties: {
            name: properties?.name || properties?.Name || properties?.field_name || 'Безымянное поле',
            width,
            length,
            type: 'field',
        },
        type: 'Feature',
        area: area,
        selected: true,
    };
};

export function MapDrawPage() {
    const navigate = useNavigate();
    const [currentGeometry, setCurrentGeometry] = useState<any>(null);
    const [importedFields, setImportedFields] = useState<ImportedField[]>([]);
    const [createdField, setCreatedField] = useState<ImportedField | null>(null);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FieldFormData>({
        name: '',
        width: 0,
        length: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'draw' | 'import'>('import');
    const [showAllFields, setShowAllFields] = useState(true);

    const createField = useCreateObject();
    const editorRef = useRef<any>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const {addNotification} = useUIStore();

    const handleConfirm = (value: string) => {
        const field = importedFields.find(f => f.id === selectedFieldId);
        if (field) {
            field.properties.name = value
            setIsModalOpen(false)
        }
    };
    // Выбор поля для редактирования
    // Центрирование карты на выбранном поле
    const centerOnField = useCallback((field: ImportedField) => {
        if (!mapRef.current || !field.geometry) return;

        const map = mapRef.current;
        const coordinates = field.geometry.coordinates[0];

        if (coordinates && coordinates.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            coordinates.forEach((value) => {
                bounds.extend([value[0], value[1]]);
            });
            map.fitBounds(bounds, {
                padding: 50,
                duration: 1000,
                essential: true
            });
        }
    }, []);
    const handleSelectField = (fieldId: string) => {
        const field = importedFields.find(f => f.id === fieldId);
        if (field) {
            if (field.id === selectedFieldId) {
                return;
            }
            setSelectedFieldId(fieldId);
            setCurrentGeometry(field.geometry);
            setFormData({
                name: field.properties.name,
                width: field.properties.width,
                length: field.properties.length,

            });
            setCalculatedArea(field.area);

            if (editorRef.current) {
                editorRef.current.setGeometry(field.geometry);
            }

            // Центрируем карту на поле
            centerOnField(field);
        }
    };

// Функция для центрирования на всех полях (использует turf)
    const centerOnAllFields = useCallback(() => {
        if (!mapRef.current || importedFields.length === 0) return;

        const map = mapRef.current;

        try {
            // Создаем FeatureCollection из всех полей
            const features = importedFields.map(field => ({
                type: 'Feature',
                geometry: field.geometry,
                properties: field.properties
            }));

            const featureCollection = turf.featureCollection(features);

            // Вычисляем bounding box всей коллекции
            const bbox = turf.bbox(featureCollection);

            // Проверяем, что bbox корректен
            if (bbox[0] === Infinity || bbox[1] === Infinity || bbox[2] === -Infinity || bbox[3] === -Infinity) {
                console.warn('Invalid bbox, cannot center');
                // Fallback: центрируем на первом поле
                if (importedFields[0]?.geometry?.coordinates?.[0]?.[0]) {
                    const firstCoord = importedFields[0].geometry.coordinates[0][0];
                    map.flyTo({
                        center: firstCoord,
                        zoom: 12,
                        duration: 1000
                    });
                }
                return;
            }

            // Центрируем карту
            map.fitBounds(
                [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] as [[number, number], [number, number]],
                {
                    padding: 50,
                    duration: 1000,
                    essential: true
                }
            );

            console.log('Centered on all fields, bbox:', bbox);
        } catch (error) {
            console.error('Error centering on all fields:', error);
        }
    }, [importedFields]);
    // Получение цвета для поля
    const getFieldColor = (fieldId: string, index: number) => {
        if (fieldId === selectedFieldId) {
            return '#22c55e'; // зеленый для выбранного
        }
        return fieldColors[index % fieldColors.length]; // цвет по индексу
    };

// Также можно добавить автоматическое сохранение при переключении вкладок
    useEffect(() => {
        return () => {
            // При уходе со страницы сохраняем текущий полигон
            if (editorRef.current && editorRef.current.hasChanges()) {
                editorRef.current.save();
            }
        };
    }, []);
// Отображение всех полей на карте
    const displayAllFieldsOnMap = useCallback(() => {
        if (!mapRef.current) {
            console.log('Map not ready yet');
            return;
        }

        if (importedFields.length === 0) {
            console.log('No fields to display');
            return;
        }

        const map = mapRef.current;

        // Проверяем, что стиль карты загружен
        if (!map.isStyleLoaded()) {
            console.log('Style not loaded yet, waiting...');
            // Ждем загрузки стиля и повторяем попытку
            map.once('style.load', () => {
                console.log('Style loaded, adding fields to map');
                displayAllFieldsOnMap();
            });
            return;
        }

        console.log('Displaying fields on map, count:', importedFields.length);

        // Удаляем старые слои
        importedFields.forEach(field => {
            const sourceId = `imported-field-${field.id}`;
            const fillLayerId = `imported-field-fill-${field.id}`;
            const outlineLayerId = `imported-field-outline-${field.id}`;

            try {
                if (map.getSource(sourceId)) {
                    if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
                    if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId);
                    map.removeSource(sourceId);
                }
            } catch (err) {
                // Игнорируем ошибки при удалении
            }
        });

        // Добавляем все поля на карту
        importedFields.forEach((field, index) => {
            const sourceId = `imported-field-${field.id}`;
            const fillLayerId = `imported-field-fill-${field.id}`;
            const outlineLayerId = `imported-field-outline-${field.id}`;
            const color = getFieldColor(field.id, index);
            const isSelected = field.id === selectedFieldId;

            try {
                console.log(`Adding field ${field.properties.name} with color ${color}`);

                // Проверяем, что источник еще не добавлен
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            geometry: field.geometry,
                            properties: {
                                id: field.id,
                                name: field.properties.name,
                                area: field.area
                            },
                        },
                    });
                }

                // Проверяем, что слои еще не добавлены
                if (!map.getLayer(fillLayerId)) {
                    map.addLayer({
                        id: fillLayerId,
                        type: 'fill',
                        source: sourceId,
                        paint: {
                            'fill-color': color,
                            'fill-opacity': isSelected ? 0.6 : 0.3,
                        },
                    });
                }

                if (!map.getLayer(outlineLayerId)) {
                    map.addLayer({
                        id: outlineLayerId,
                        type: 'line',
                        source: sourceId,
                        paint: {
                            'line-color': color,
                            'line-width': isSelected ? 4 : 2,
                            'line-opacity': 1,
                        },
                    });
                }

                // Удаляем старые обработчики, чтобы не дублировать
                map.off('click', fillLayerId);
                map.off('mouseenter', fillLayerId);
                map.off('mouseleave', fillLayerId);

                // Добавляем обработчик клика для выбора поля
                map.on('click', fillLayerId, (e) => {
                    // e.stopPropagation();
                    handleSelectField(field.id);
                });

                // Меняем курсор при наведении
                map.on('mouseenter', fillLayerId, () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', fillLayerId, () => {
                    map.getCanvas().style.cursor = '';
                });

                // Добавляем всплывающую подсказку
                const popup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false,
                    offset: 25,
                });

                map.on('mouseenter', fillLayerId, (e) => {
                    const features = map.queryRenderedFeatures(e.point, {layers: [fillLayerId]});
                    if (features.length > 0) {
                        // Получаем координаты для popup
                        const geometry = features[0].geometry;
                        let coordinates;
                        if (geometry.type === 'Polygon') {
                            coordinates = (geometry as any).coordinates[0][0];
                        } else if (geometry.type === 'Point') {
                            coordinates = (geometry as any).coordinates;
                        } else {
                            return;
                        }

                        popup.setLngLat(coordinates)
                            .setHTML(`
                            <div class="p-2">
                                <div class="font-bold text-sm">${field.properties.name}</div>
                                <div class="text-xs text-gray-600">Площадь: ${field.area.toFixed(2)} га</div>
                            </div>
                        `)
                            .addTo(map);
                    }
                });

                map.on('mouseleave', fillLayerId, () => {
                    popup.remove();
                });

            } catch (error) {
                console.error(`Error adding field ${field.properties.name}:`, error);
            }
        });

    }, [importedFields, selectedFieldId, getFieldColor, handleSelectField]);

    // Получение ссылки на карту из редактора
    useEffect(() => {
        if (editorRef.current) {
            const map = editorRef.current.getMap();
            if (map) {
                mapRef.current = map;
            }
        }
    }, [editorRef.current]);
    // Отображаем все поля на карте при изменении списка полей или выбранного поля
    useEffect(() => {
        if (mapRef.current && importedFields.length > 0) {
            displayAllFieldsOnMap();
        }
    }, [importedFields, selectedFieldId, displayAllFieldsOnMap]);
    // Центрируем карту при выборе поля
    useEffect(() => {
        if (selectedFieldId && mapRef.current) {
            const selectedField = importedFields.find(f => f.id === selectedFieldId);
            if (selectedField) {
                centerOnField(selectedField);
            }
        }
    }, [selectedFieldId, importedFields, centerOnField]);
    // Следим за изменением currentGeometry и обновляем редактор
    useEffect(() => {
        if (editorRef.current && currentGeometry) {
            editorRef.current.setGeometry(currentGeometry);
        }
    }, [currentGeometry]);
    // Парсинг GeoJSON и извлечение всех полей
    const parseGeoJSON = useCallback((data: any): ImportedField[] => {
        const fields: ImportedField[] = [];

        if (data.type === 'FeatureCollection') {
            data.features.forEach((feature: any) => {
                const field = processGeometry(feature.geometry, feature.properties);
                if (field) {
                    fields.push(field);
                }
            });
        } else if (data.type === 'Feature') {
            const field = processGeometry(data.geometry, data.properties);
            if (field) {
                fields.push(field);
            }
        } else if (data.type === 'Polygon' || data.type === 'MultiPolygon') {
            const field = processGeometry(data, {});
            if (field) {
                fields.push(field);
            }
        }

        return fields;
    }, []);
// Импорт из GeoJSON
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                console.log('Imported data:', data);

                const fields = parseGeoJSON(data);

                if (fields.length === 0) {
                    throw new Error('Не найдено ни одного полигона в файле');
                }
                var allFields = [...importedFields, ...fields];
                setImportedFields(allFields);

                // Создаем FeatureCollection из всех полей
                const features = fields.map(field => ({
                    type: 'Feature',
                    geometry: field.geometry,
                    properties: field.properties
                }));

                const featureCollection = turf.featureCollection(features);

                // Вычисляем bounding box всей коллекции с помощью turf
                const bbox = turf.bbox(featureCollection);

                // Проверяем валидность bbox
                if (bbox[0] !== Infinity && bbox[1] !== Infinity && bbox[2] !== -Infinity && bbox[3] !== -Infinity) {
                    // Центрируем карту на всей коллекции
                    if (mapRef.current) {
                        mapRef.current.fitBounds(
                            [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] as [[number, number], [number, number]],
                            {
                                padding: 50,
                                duration: 1000,
                                essential: true
                            }
                        );
                        console.log('Centered on all fields, bbox:', bbox);
                    }
                } else {
                    console.warn('Invalid bbox, using fallback center');
                    if (mapRef.current && fields[0]?.geometry?.coordinates?.[0]?.[0]) {
                        const firstCoord = fields[0].geometry.coordinates[0][0];
                        mapRef.current.flyTo({
                            center: firstCoord,
                            zoom: 12,
                            duration: 1000
                        });
                    }
                }
                centerOnAllFields()

                setActiveTab('import');
                addNotification({
                    type: 'success',
                    message: `Успешно импортировано ${fields.length} полей`
                })

            } catch (err) {
                addNotification({
                    type: 'success',
                    message: `Ошибка при загрузке GeoJSON файла: ${err instanceof Error ? err.message : 'Неверный формат файла'}`
                })
            }
        };
        reader.onerror = () => {
            addNotification({
                type: 'success',
                message: 'Ошибка чтения файла'
            })
        };
        reader.readAsText(file);

        event.target.value = '';
    };

    // Удаление поля
    const handleDeleteField = (fieldId: string) => {
        setImportedFields(prev => prev.filter(f => f.id !== fieldId));
        if (selectedFieldId === fieldId) {
            setSelectedFieldId(null);
            setCurrentGeometry(null);
            setFormData({name: '', width: 0, length: 0});
            setCalculatedArea(null);
            if (editorRef.current) {
                editorRef.current.setGeometry(null);
            }
        }
        addNotification({
            type: 'success',
            message: 'Поле удалено'
        });
    };
    // Сохранение всех полей
    const handleSaveAll = async () => {
        if (importedFields.length === 0) {
            addNotification({
                type: 'error',
                message: 'Нет полей для сохранения'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            for (const field of importedFields) {

                const objData = {
                    name: field.properties.name,
                    type: field.properties.type,
                    geometry: field.geometry,
                    attributes: {
                        width: field.properties.width,
                        length: field.properties.length,
                    }

                };

                await createField.mutateAsync(objData);
            }
            handleReset()
            addNotification({
                type: 'success',
                message: `Успешно сохранено ${importedFields.length} полей!`
            });

        } catch (err) {
            addNotification({
                type: 'error',
                message: '`Ошибка при сохранении полей. Попробуйте еще раз.'
            });
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    // Сброс всех данных
    const handleReset = () => {
        setCurrentGeometry(null);
        setImportedFields([]);
        setSelectedFieldId(null);
        setCalculatedArea(null);
        setFormData({
            name: '',
            length: 0,
            width: 0
        });
        setActiveTab('draw');
        if (editorRef.current) {
            editorRef.current.setGeometry(null);
        }
    };
    // Создание примера GeoJSON
    const handleCreateExample = () => {
        const exampleGeoJSON = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [[
                            [30.05, 45.90],
                            [30.06, 45.90],
                            [30.06, 45.91],
                            [30.05, 45.91],
                            [30.05, 45.90]
                        ]]
                    },
                    properties: {
                        name: "Поле Северное",
                        soilType: "Чернозем",
                        description: "Основное поле для зерновых"
                    }
                },
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [[
                            [30.07, 45.89],
                            [30.08, 45.89],
                            [30.08, 45.90],
                            [30.07, 45.90],
                            [30.07, 45.89]
                        ]]
                    },
                    properties: {
                        name: "Поле Южное",
                        soilType: "Суглинок",
                        description: "Поле для технических культур"
                    }
                }
            ]
        };

        const dataStr = JSON.stringify(exampleGeoJSON, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'example_fields.geojson');
        linkElement.click();

        addNotification({
            type: 'success',
            message: 'Пример GeoJSON файла создан'
        });
    };

    const handleMapLoad = useCallback((map: mapboxgl.Map) => {
        console.log('Map loaded in MapDrawPage');
        mapRef.current = map;

        // Проверяем, что стиль загружен
        if (map.isStyleLoaded()) {
            if (importedFields.length > 0) {
                displayAllFieldsOnMap();
                centerOnAllFields();
            }
        } else {
            map.once('style.load', () => {
                if (importedFields.length > 0) {
                    displayAllFieldsOnMap();
                    centerOnAllFields();
                }
            });
        }
    }, [importedFields, displayAllFieldsOnMap, centerOnAllFields]);

    const addPolygonWithoutReload = useCallback((newGeometry: any, name: string, width: number, length: number) => {
        const area = turf.area(newGeometry) / 10000;
        const newId = uuidv4();

        // Создаем новый объект
        const newField: ImportedField = {
            id: newId,
            type: 'Feature',
            geometry: newGeometry,
            area: area,
            selected: false,
            properties: {
                type: newGeometry.type == 'Polygon' ? 'field' : 'greenhouse',
                name: name || `Новое объект `,
                width,
                length
            }
        };
        setCreatedField(newField)
        setIsModalOpen(true)


        // Обновляем состояние без перерисовки карты
        setImportedFields(prev => [...prev, newField]);
        setSelectedFieldId(newId);
        setCurrentGeometry(newGeometry);
        setCalculatedArea(area);
        setFormData({
            name: newField.properties.name,
            width,
            length,
        });

        // Добавляем слой на карту напрямую, без вызова displayAllFieldsOnMap
        if (mapRef.current && mapRef.current.isStyleLoaded()) {
            const sourceId = `imported-field-${newId}`;
            const fillLayerId = `imported-field-fill-${newId}`;
            const outlineLayerId = `imported-field-outline-${newId}`;
            const color = getFieldColor(newId, importedFields.length);

            try {
                // Проверяем, не существует ли уже источник
                if (!mapRef.current.getSource(sourceId)) {
                    mapRef.current.addSource(sourceId, {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            geometry: newGeometry,
                            properties: {id: newId, name: newField.properties.name, area: area},
                        },
                    });
                }

                // Добавляем слой заливки
                if (!mapRef.current.getLayer(fillLayerId)) {
                    mapRef.current.addLayer({
                        id: fillLayerId,
                        type: 'fill',
                        source: sourceId,
                        paint: {'fill-color': color, 'fill-opacity': 0.3},
                    });
                }

                // Добавляем слой обводки
                if (!mapRef.current.getLayer(outlineLayerId)) {
                    mapRef.current.addLayer({
                        id: outlineLayerId,
                        type: 'line',
                        source: sourceId,
                        paint: {'line-color': color, 'line-width': 2, 'line-opacity': 1},
                    });
                }

                // Добавляем обработчики событий
                mapRef.current.on('click', fillLayerId, () => handleSelectField(newId));
                mapRef.current.on('mouseenter', fillLayerId, () => mapRef.current!.getCanvas().style.cursor = 'pointer');
                mapRef.current.on('mouseleave', fillLayerId, () => mapRef.current!.getCanvas().style.cursor = '');

            } catch (error) {
                console.error('Error adding new field layer:', error);
            }
        }
    }, [importedFields.length, getFieldColor, handleSelectField, addNotification]);

    const handleGeometrySave = useCallback((newGeometry: any) => {
        if (selectedFieldId) {
            // Обновляем существующее поле
            const area = turf.area(newGeometry) / 10000;
            setImportedFields(prev => prev.map(field =>
                field.id === selectedFieldId
                    ? {...field, geometry: newGeometry, area: area}
                    : field
            ));
            setCurrentGeometry(newGeometry);
            setCalculatedArea(area);
            // Обновляем слой на карте
            if (mapRef.current && mapRef.current.isStyleLoaded()) {
                const sourceId = `imported-field-${selectedFieldId}`;
                if (mapRef.current.getSource(sourceId)) {
                    (mapRef.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
                        type: 'Feature',
                        geometry: newGeometry,
                        properties: {}
                    });
                }
            }

            addNotification({type: 'success', message: 'Геометрия поля обновлена'});
        } else {
            // Создаем новое поле без перерисовки
            const {width, length} = calculateDimension(newGeometry);
            addPolygonWithoutReload(newGeometry, formData.name, width, length);
        }
    }, [selectedFieldId, formData, addPolygonWithoutReload, addNotification]);

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/farm')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="Вернуться к объектам"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Wheat className="w-6 h-6 text-green-600"/>
                                Создание полей
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Нарисуйте поля на карте или импортируйте GeoJSON файл
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => editorRef.current?.save()}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Save className="w-4 h-4 mr-1"/>
                            Сохранить полигон
                        </button>
                        <button
                            onClick={() => editorRef.current?.save()}
                            disabled={!editorRef.current?.hasChanges()}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Save className="w-4 h-4 mr-1"/>
                            Сохранить изменения
                        </button>
                        <button
                            onClick={centerOnAllFields}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium"
                            title="Показать все поля"
                        >
                            <Maximize2 className="w-4 h-4"/>
                            Все поля
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <RefreshCw className="w-4 h-4"/>
                            Сбросить
                        </button>

                        <button
                            onClick={handleSaveAll}
                            disabled={isSubmitting || importedFields.length === 0}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div
                                        className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Сохранение...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4"/>
                                    Сохранить все ({importedFields.length})
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4">
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('draw')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'draw'
                                ? 'text-green-600 border-b-2 border-green-600'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                    >
                        Рисование
                    </button>
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'import'
                                ? 'text-green-600 border-b-2 border-green-600'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                    >
                        Импорт ({importedFields.length})
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden p-6">
                <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Левая колонка - форма и информация */}
                    <div className="lg:col-span-1 space-y-6 overflow-y-auto">
                        {activeTab === 'draw' ? (
                            <>
                                что-то будет
                            </>
                        ) : (
                            <>
                                <div
                                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Layers className="w-5 h-5 text-blue-600"/>
                                            Импортированные поля ({importedFields.length})
                                        </h2>
                                        <button
                                            onClick={() => setShowAllFields(!showAllFields)}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            title={showAllFields ? "Скрыть все поля" : "Показать все поля"}
                                        >
                                            {showAllFields ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                        </button>
                                    </div>

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                        {importedFields.map((field) => (
                                            <div
                                                key={field.id}
                                                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                                                    selectedFieldId === field.id
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:shadow-sm'
                                                }`}
                                                onClick={() => handleSelectField(field.id)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between  gap-2">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                                {field.properties.name}
                                                            </h3>
                                                            <Button variant='outline' size="icon" onClick={() => {
                                                                setIsModalOpen(true)
                                                            }
                                                            }><Edit/></Button>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {field.properties.type} • {field.properties.type == 'greenhouse' ? `${field.properties.length}x${field.properties.width}` : formatArea(field.area)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteField(field.id);
                                                        }}
                                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-500 opacity-0 group-hover:opacity-100"
                                                        title="Удалить поле"
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Импорт/Экспорт */}
                        {activeTab === 'import' && (
                            <div
                                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-blue-600"/>
                                    Импорт/Экспорт
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Импорт GeoJSON
                                        </label>
                                        <input
                                            type="file"
                                            accept=".geojson,.json"
                                            onChange={handleImport}
                                            className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/20 dark:file:text-green-400"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            Поддерживаются FeatureCollection с несколькими полями
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleCreateExample}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <Download className="w-4 h-4"/>
                                        Скачать пример GeoJSON
                                    </button>
                                </div>
                            </div>)
                        }
                    </div>

                    {/* Правая колонка - редактор полигонов */}
                    <div
                        className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <PolygonEditor
                            onGeometryChange={handleGeometrySave}
                            onMapLoad={handleMapLoad}
                        />
                    </div>
                </div>
                <CreateObjectModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                    }}
                    onConfirm={(data) => {
                        // Обновляем поле с новыми данными
                        setImportedFields(prev => prev.map(f =>
                            createdField && f.id === createdField.id
                                ? {
                                    ...f,
                                    properties: {
                                        ...f.properties,
                                        name: data.name,
                                        width: data.width,
                                        length: data.length,
                                        type: data.type,
                                    }
                                }
                                : f
                        ));
                        setFormData({
                            name: data.name,
                            width: data.width,
                            length: data.length,
                        });
                        setIsModalOpen(false);
                    }}
                    title="Редактирование объекта"
                    label="Название"
                    initialData={{
                        name: createdField?.properties?.name || '',
                        width: createdField?.properties?.width || 0,
                        length: createdField?.properties?.length || 0,
                        type: createdField?.properties?.type || 'field',
                        geometryType: createdField?.geometry?.type,
                    }}
                    confirmText="Сохранить"
                    cancelText="Отмена"
                />
            </div>
        </div>
    );
}