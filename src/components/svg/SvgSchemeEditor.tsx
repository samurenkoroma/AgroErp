// src/components/svg/SvgSchemeEditor.tsx
import {useCallback, useEffect, useRef, useState} from 'react';
import {AlertCircle, Copy, Edit2, Grid, Plus, Trash2} from 'lucide-react';
import {v4 as uuidv4} from 'uuid';
import {Element} from "@/entities/spatial";
import {formatArea} from "@/utils/geometry.ts";
// ==================== TYPES ====================

const getColorElement = (type: string) => {
    switch (type) {
        case 'BED':
            return '#3b82f6';
        case 'label':
            return '#3b82f6';
        case 'path':
            return '#3b82f6';
        default:
            return '#3b82f6';
    }
}


interface SvgSchemeEditorProps {
    width: number;
    height: number;
    type: 'greenhouse' | 'plot' | 'field';
    initialElements: Element[];
    onSave: (elements: Element[]) => void;
    onCancel: () => void;
    onBedClick?: (element: Element) => void;
    readonly?: boolean;
}

// ==================== MAIN COMPONENT ====================

export const SvgSchemeEditor = ({
                                    width: realWidth,
                                    height: realHeight,
                                    type,
                                    initialElements,
                                    onSave,
                                    onCancel,
                                    onBedClick,
                                    readonly = false
                                }: SvgSchemeEditorProps) => {
    // ===== Состояния =====
    const [elements, setElements] = useState<Element[]>(initialElements);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState({
        x: 0,
        y: 0,
        elementX: 0,
        elementY: 0,
        width: 0,
        height: 0,
        startClientX: 0,
        startClientY: 0
    });
    const [showGrid, setShowGrid] = useState(true);
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editLabelValue, setEditLabelValue] = useState('');
    const [svgSize, setSvgSize] = useState({ width: 800, height: 600 });
    const [error, setError] = useState<string | null>(null);
    const [clickedElement, setClickedElement] = useState<Element | null>(null);

    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ===== Функция округления до 0.1 =====
    const roundToDecimal = (value: number, decimals: number = 1): number => {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    };

    // ===== Округление размеров элемента =====
    const roundElementDimensions = useCallback((element: Element): Element => {
        return {
            ...element,
            x: roundToDecimal(element.x, 1),
            y: roundToDecimal(element.y, 1),
            width: roundToDecimal(element.width, 1),
            length: roundToDecimal(element.length, 1)
        };
    }, []);

    // ===== Расчет масштаба SVG =====
    useEffect(() => {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.clientWidth - 32;
        const containerHeight = window.innerHeight - 250;

        const aspectRatio = realWidth / realHeight;
        let svgWidth = Math.min(containerWidth, 900);
        let svgHeight = svgWidth / aspectRatio;

        if (svgHeight > containerHeight) {
            svgHeight = containerHeight;
            svgWidth = svgHeight * aspectRatio;
        }

        setSvgSize({ width: Math.max(svgWidth, 400), height: Math.max(svgHeight, 300) });
    }, [realWidth, realHeight]);

    // ===== Преобразование координат =====
    const toSvgX = (x: number) => (x / realWidth) * svgSize.width;
    const toSvgY = (y: number) => (y / realHeight) * svgSize.height;
    const toSvgWidth = (w: number) => (w / realWidth) * svgSize.width;
    const toSvgHeight = (h: number) => (h / realHeight) * svgSize.height;

    const toRealX = (x: number) => (x / svgSize.width) * realWidth;
    const toRealY = (y: number) => (y / svgSize.height) * realHeight;

    // ===== Проверка валидности =====
    const isInsideBounds = useCallback((element: Element): boolean => {
        const tolerance = 0.001;
        return element.x >= -tolerance &&
            element.y >= -tolerance &&
            element.x + element.width <= realWidth + tolerance &&
            element.y + element.length <= realHeight + tolerance;
    }, [realWidth, realHeight]);

    const isOverlapping = useCallback((element: Element, excludeId?: string): boolean => {
        const others = elements.filter(e => e.id !== excludeId && e.id !== element.id && e.type === 'BED');
        const gap = 0.01;

        for (const other of others) {
            const overlapX = element.x < other.x + other.width - gap &&
                element.x + element.width > other.x + gap;
            const overlapY = element.y < other.y + other.length - gap &&
                element.y + element.length > other.y + gap;

            if (overlapX && overlapY) {
                return true;
            }
        }
        return false;
    }, [elements]);

    const validateElement = useCallback((element: Element, excludeId?: string): { valid: boolean; error?: string } => {
        if (!isInsideBounds(element)) {
            return { valid: false, error: 'Грядка выходит за пределы объекта' };
        }

        if (element.width < 0.1 || element.length < 0.1) {
            return { valid: false, error: 'Минимальный размер грядки 0.1 м' };
        }

        if (elements.filter(e => e.type === 'BED').length > 1) {
            if (isOverlapping(element, excludeId)) {
                return { valid: false, error: 'Грядки не должны пересекаться' };
            }
        }

        return { valid: true };
    }, [isInsideBounds, isOverlapping, elements]);


    // ===== Добавление грядки =====
    const handleAddBed = useCallback(() => {
        const bedWidth = roundToDecimal(realWidth * 0.25);
        const bedHeight = roundToDecimal(realHeight * 0.2);
        let newX = roundToDecimal(realWidth * 0.05);
        let newY = roundToDecimal(realHeight * 0.05);
        let found = false;
        let attempts = 0;
        const maxAttempts = 50;

        while (!found && attempts < maxAttempts) {
            const testElement: Element = {
                area: bedWidth * bedHeight,
                id: uuidv4(),
                type: 'BED',
                x: newX,
                y: newY,
                width: bedWidth,
                length: bedHeight,
                name: 'temp',
                code: "B-1"
            };

            const isValid = validateElement(testElement);
            if (isValid.valid) {
                found = true;
                break;
            }

            newX = roundToDecimal(realWidth * 0.05 + Math.random() * realWidth * 0.7);
            newY = roundToDecimal(realHeight * 0.05 + Math.random() * realHeight * 0.7);
            attempts++;
        }

        if (!found) {
            newX = roundToDecimal(realWidth * 0.2);
            newY = roundToDecimal(realHeight * 0.2);
        }

        const newBed: Element = {
            id: uuidv4(),
            type: 'BED',
            x: newX,
            y: newY,
            area: bedWidth * bedHeight,
            width: bedWidth,
            length: bedHeight,
            name: `Грядка ${elements.filter(e => e.type === 'BED').length + 1}`,
            code: `B- ${elements.filter(e => e.type === 'BED').length + 1}`,
        };
        setElements(prev => [...prev, newBed]);
        setSelectedId(newBed.id);
        setClickedElement(newBed);
        setError(null);

        // Вызываем обработчик клика для новой грядки
        if (onBedClick) {
            onBedClick(newBed);
        }
    }, [elements, realWidth, realHeight, validateElement, onBedClick]);

    // ===== Удаление =====
    const handleDeleteSelected = useCallback(() => {
        if (selectedId && !readonly) {
            setElements(prev => prev.filter(el => el.id !== selectedId));
            setSelectedId(null);
            setClickedElement(null);
            setError(null);
        }
    }, [selectedId, readonly]);

    // ===== Копирование =====
    const handleDuplicate = useCallback(() => {
        if (!selectedId || readonly) return;
        const element = elements.find(el => el.id === selectedId);
        if (!element) return;

        const offsetX = roundToDecimal(realWidth * 0.02);
        const offsetY = roundToDecimal(realHeight * 0.02);
        let newX = Math.min(element.x + offsetX, realWidth - element.width);
        let newY = Math.min(element.y + offsetY, realHeight - element.length);

        if (newX + element.width > realWidth) {
            newX = Math.max(0, element.x - offsetX);
        }
        if (newY + element.length > realHeight) {
            newY = Math.max(0, element.y - offsetY);
        }

        const newElement: Element = {
            ...element,
            id: `BED-${Date.now()}`,
            x: newX,
            y: newY,
            code: `B- ${elements.filter(e => e.type === 'BED').length + 1}`,
            name: `${element.name} (копия)`
        };

        const roundedElement = roundElementDimensions(newElement);

        setElements(prev => [...prev, roundedElement]);
        setSelectedId(roundedElement.id);
        setClickedElement(roundedElement);

        if (onBedClick) {
            onBedClick(roundedElement);
        }
    }, [selectedId, elements, readonly, realWidth, realHeight, roundElementDimensions, onBedClick]);

    // ===== ОБРАБОТЧИК КЛИКА НА ГРЯДКЕ =====
    const handleBedClick = useCallback((element: Element, e?: React.MouseEvent) => {
        console.log(e)
        // Если компонент в режиме только для чтения - передаем клик родителю
        if (readonly && onBedClick) {
            onBedClick(element);
            return;
        }

        // В режиме редактирования - выбираем грядку и вызываем обработчик
        if (!readonly) {
            setSelectedId(element.id);
            setClickedElement(element);

            // Вызываем обработчик клика, если он передан
            if (onBedClick) {
                onBedClick(element);
            }

            // Отображаем информацию о клике в консоли для отладки
            console.log('Выбрана грядка:', {
                id: element.id,
                name: element.name,
                position: `${element.x.toFixed(1)}×${element.y.toFixed(1)}`,
                size: `${element.width.toFixed(1)}×${element.length.toFixed(1)} м`
            });
        }
    }, [readonly, onBedClick]);

    // ===== Обработчики мыши для перетаскивания =====
    const handleMouseDown = useCallback((e: React.MouseEvent<SVGElement>, elementId: string, handle?: string) => {
        if (readonly) return;
        e.stopPropagation();
        e.preventDefault();

        const element = elements.find(el => el.id === elementId);
        if (!element) return;

        const svgRect = svgRef.current?.getBoundingClientRect();
        if (!svgRect) return;

        // // Сохраняем начальные значения
        // const startX = ((e.clientX - svgRect.left) / svgRect.width) * svgSize.width;
        // const startY = ((e.clientY - svgRect.top) / svgRect.height) * svgSize.height;
        //
        // const realStartX = toRealX(startX);
        // const realStartY = toRealY(startY);

        setDragStart({
            x: e.clientX,
            y: e.clientY,
            elementX: element.x,
            elementY: element.y,
            width: element.width,
            height: element.length,
            startClientX: e.clientX,
            startClientY: e.clientY
        });

        if (handle) {
            setIsResizing(true);
            setResizeHandle(handle);
        } else {
            setIsDragging(true);
            setSelectedId(elementId);
            setClickedElement(element);
        }
    }, [elements, readonly, svgSize, toRealX, toRealY]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!svgRef.current) return;
        if (!isDragging && !isResizing) return;

        const svgRect = svgRef.current.getBoundingClientRect();

        // Текущая позиция мыши в SVG координатах
        const mouseX = ((e.clientX - svgRect.left) / svgRect.width) * svgSize.width;
        const mouseY = ((e.clientY - svgRect.top) / svgRect.height) * svgSize.height;

        const realMouseX = toRealX(mouseX);
        const realMouseY = toRealY(mouseY);

        // Начальная позиция мыши в реальных координатах
        const startRealX = toRealX(((dragStart.startClientX - svgRect.left) / svgRect.width) * svgSize.width);
        const startRealY = toRealY(((dragStart.startClientY - svgRect.top) / svgRect.height) * svgSize.height);

        if (isDragging && selectedId) {
            // Перетаскивание
            const element = elements.find(el => el.id === selectedId);
            if (!element) return;

            // Вычисляем смещение от начальной позиции
            const dx = realMouseX - startRealX;
            const dy = realMouseY - startRealY;

            let newX = dragStart.elementX + dx;
            let newY = dragStart.elementY + dy;

            // Ограничиваем границами
            newX = Math.max(0, Math.min(realWidth - element.width, newX));
            newY = Math.max(0, Math.min(realHeight - element.length, newY));

            setElements(prev => prev.map(el => {
                if (el.id === selectedId) {
                    const updated = { ...el, x: newX, y: newY };
                    return roundElementDimensions(updated);
                }
                return el;
            }));

        } else if (isResizing && selectedId && resizeHandle) {
            // Ресайз
            const element = elements.find(el => el.id === selectedId);
            if (!element) return;

            const dx = realMouseX - startRealX;
            const dy = realMouseY - startRealY;

            let newX = element.x;
            let newY = element.y;
            let newWidth = element.width;
            let newHeight = element.length;
            const minSize = 0.1;

            switch (resizeHandle) {
                case 'se':
                    newWidth = Math.max(minSize, dragStart.width + dx);
                    newHeight = Math.max(minSize, dragStart.height + dy);
                    break;
                case 'sw':
                    newWidth = Math.max(minSize, dragStart.width - dx);
                    newHeight = Math.max(minSize, dragStart.height + dy);
                    newX = dragStart.elementX + (dragStart.width - newWidth);
                    break;
                case 'ne':
                    newWidth = Math.max(minSize, dragStart.width + dx);
                    newHeight = Math.max(minSize, dragStart.height - dy);
                    newY = dragStart.elementY + (dragStart.height - newHeight);
                    break;
                case 'nw':
                    newWidth = Math.max(minSize, dragStart.width - dx);
                    newHeight = Math.max(minSize, dragStart.height - dy);
                    newX = dragStart.elementX + (dragStart.width - newWidth);
                    newY = dragStart.elementY + (dragStart.height - newHeight);
                    break;
                default:
                    break;
            }

            // Ограничиваем
            newX = Math.max(0, Math.min(realWidth - newWidth, newX));
            newY = Math.max(0, Math.min(realHeight - newHeight, newY));
            newWidth = Math.max(minSize, Math.min(realWidth - newX, newWidth));
            newHeight = Math.max(minSize, Math.min(realHeight - newY, newHeight));

            setElements(prev => prev.map(el => {
                if (el.id === selectedId) {
                    const updated = {...el, x: newX, y: newY, width: newWidth, length: newHeight};
                    return roundElementDimensions(updated);
                }
                return el;
            }));
        }
    }, [isDragging, isResizing, selectedId, dragStart, resizeHandle, elements, svgSize, toRealX, toRealY, roundElementDimensions]);

    const handleMouseUp = useCallback(() => {
        if (isDragging || isResizing) {
            if (selectedId) {
                const element = elements.find(el => el.id === selectedId);
                if (element) {
                    const rounded = roundElementDimensions(element);
                    setElements(prev => prev.map(el => {
                        if (el.id === selectedId) {
                            return rounded;
                        }
                        return el;
                    }));

                    const validation = validateElement(rounded);
                    if (!validation.valid) {
                        setError(validation.error || 'Неверное расположение грядки');
                        setTimeout(() => setError(null), 3000);
                    }
                }
            }
        }

        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
    }, [isDragging, isResizing, selectedId, elements, validateElement, roundElementDimensions]);

    // ===== Редактирование названия =====
    const startEditingLabel = useCallback((e: React.MouseEvent, elementId: string) => {
        e.stopPropagation();
        const element = elements.find(el => el.id === elementId);
        if (!element || readonly) return;
        setEditLabelValue(element.name);
        setIsEditingLabel(true);
        setSelectedId(elementId);
        setClickedElement(element);
    }, [elements, readonly]);

    const finishEditingLabel = useCallback(() => {
        if (selectedId && editLabelValue.trim()) {
            setElements(prev => prev.map(el => {
                if (el.id === selectedId) {
                    return { ...el, label: editLabelValue.trim() };
                }
                return el;
            }));
        }
        setIsEditingLabel(false);
        setEditLabelValue('');
    }, [selectedId, editLabelValue]);

    const handleSvgClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !readonly) {
            setSelectedId(null);
            setIsEditingLabel(false);
            setError(null);
        }
    }, [readonly]);

    // ===== Информация о масштабе =====
    const getScaleInfo = () => {
        const metersPerPixel = realWidth / svgSize.width;
        return `${(metersPerPixel * 100).toFixed(2)} см/пикс`;
    };

    // ===== Рендер элементов =====
    const renderElements = useCallback(() => {
        return elements.map((element) => {
            const isSelected = selectedId === element.id;
            const isClicked = clickedElement?.id === element.id && !isSelected;
            const svgX = toSvgX(element.x);
            const svgY = toSvgY(element.y);
            const svgW = toSvgWidth(element.width);
            const svgH = toSvgHeight(element.length);

            const isValid = validateElement(element, element.id).valid;

            switch (element.type) {
                case 'BED':
                    return (
                        <g
                            key={element.id}
                            className={readonly ? 'cursor-pointer' : 'cursor-move'}
                            onClick={(e) => handleBedClick(element, e)}
                            onDoubleClick={() => {
                                if (!readonly) {
                                    const el = elements.find(e => e.id === element.id);
                                    if (el) {
                                        setEditLabelValue(el.name);
                                        setIsEditingLabel(true);
                                        setSelectedId(el.id);
                                    }
                                }
                            }}
                        >
                            {/* ✅ Подсветка при клике (анимация) */}
                            {isClicked && (
                                <rect
                                    x={svgX - 4}
                                    y={svgY - 4}
                                    width={svgW + 8}
                                    height={svgH + 8}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    rx={0}
                                    style={{opacity: 0.3}}
                                >
                                    <animate
                                        attributeName="opacity"
                                        from="0.6"
                                        to="0"
                                        dur="0.8s"
                                        repeatCount="1"
                                    />
                                </rect>
                            )}

                            {/* Основной прямоугольник */}
                            <rect
                                x={svgX}
                                y={svgY}
                                width={svgW}
                                height={svgH}
                                fill={isValid ? `${getColorElement(element.type)}25` : '#ef444425'}
                                stroke={isSelected ? '#3b82f6' : (isValid ? getColorElement(element.type) : '#ef4444')}
                                strokeWidth={isSelected ? 3 : (isValid ? 2 : 2)}
                                strokeDasharray={isValid ? 'none' : '4,4'}
                                rx={0}
                                style={{opacity: 1}}
                                onMouseDown={(e) => !readonly && handleMouseDown(e, element.id)}
                            />

                            {/* Содержимое грядки */}
                            <g>


                                <text
                                    x={svgX + svgW / 2 + 16}
                                    y={svgY + svgH / 2 - 2}
                                    // fontSize={Math.min(Math.max(svgH * 0.2, 8), 12)}
                                    fill="#1f2937"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="select-none pointer-events-none dark:fill-white font-medium"
                                >
                                    {element.name} ({roundToDecimal(element.width, 1)}×{roundToDecimal(element.length, 1)} м) {formatArea(element.area)}
                                </text>

                                {element.code && (
                                    <text
                                        x={svgX + svgW - 6}
                                        y={svgY + 14}
                                        fontSize={12}
                                        fill="#9ca3af"
                                        textAnchor="end"
                                        className="select-none pointer-events-none"
                                    >{element.code}</text>
                                )}
                            </g>

                            {/* Элементы управления при выделении */}
                            {isSelected && !readonly && (
                                <>
                                    {['nw', 'ne', 'sw', 'se'].map((corner) => {
                                        const cx = corner.includes('w') ? svgX : svgX + svgW;
                                        const cy = corner.includes('n') ? svgY : svgY + svgH;
                                        const cursor = corner === 'nw' ? 'nwse-resize' :
                                            corner === 'se' ? 'nwse-resize' :
                                                corner === 'ne' ? 'nesw-resize' : 'nesw-resize';
                                        return (
                                            <circle
                                                key={corner}
                                                cx={cx}
                                                cy={cy}
                                                r={6}
                                                fill="white"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                className={`cursor-${cursor}`}
                                                onMouseDown={(e) => handleMouseDown(e, element.id, corner)}
                                            />
                                        );
                                    })}

                                    <foreignObject
                                        x={svgX + svgW - 8}
                                        y={svgY - 8}
                                        width={20}
                                        height={20}
                                        style={{ overflow: 'visible' }}
                                    >
                                        <button
                                            onClick={(e) => startEditingLabel(e, element.id)}
                                            className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                            style={{ transform: 'translate(50%, -50%)' }}
                                        >
                                            <Edit2 className="w-3 h-3 text-gray-500" />
                                        </button>
                                    </foreignObject>
                                </>
                            )}
                        </g>
                    );

                default:
                    return null;
            }
        });
    }, [elements, selectedId, clickedElement, readonly, handleBedClick, handleMouseDown, startEditingLabel, validateElement, roundToDecimal]);

    // ===== Информация о грядках =====
    const bedsCount = elements.filter(e => e.type === 'BED').length;
    const totalArea = elements.reduce((sum, e) => sum + (e.width * e.length), 0);
    const utilizationPercent = (totalArea / (realWidth * realHeight) * 100);

    return (
        <div className="flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden h-full">
            {/* Toolbar */}
            {!readonly && (
                <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center gap-1 flex-wrap">
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={handleAddBed}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            title="Добавить грядку"
                        >
                            <Plus className="w-4 h-4 text-green-600" />
                        </button>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                        <button
                            onClick={handleDeleteSelected}
                            disabled={!selectedId}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                            title="Удалить"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                        <button
                            onClick={handleDuplicate}
                            disabled={!selectedId}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            title="Копировать"
                        >
                            <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={() => setShowGrid(!showGrid)}
                            className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            title="Сетка"
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                        <button
                            onClick={onCancel}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={() => onSave(elements)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                            Сохранить
                        </button>
                    </div>
                </div>
            )}

            {/* Информация о схеме */}
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2 text-sm">
                <div className="flex items-center gap-3">
          <span className="text-gray-600 dark:text-gray-400">
            Размер: {roundToDecimal(realWidth, 1)} × {roundToDecimal(realHeight, 1)} м
          </span>
                    <span className="text-gray-600 dark:text-gray-400">
            📦 Грядок: {bedsCount}
          </span>
                    <span className="text-gray-600 dark:text-gray-400">
            📐 Занято: {utilizationPercent.toFixed(0)}%
          </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Масштаб: {getScaleInfo()}</span>
                    <span>•</span>
                    <span>Реальные размеры</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2 border-b border-red-200 dark:border-red-800 flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            {/* SVG Canvas */}
            <div
                ref={containerRef}
                className="relative overflow-auto p-4 bg-gray-100 dark:bg-gray-800 flex-1"
                style={{ minHeight: 400 }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <svg
                    ref={svgRef}
                    width={svgSize.width}
                    height={svgSize.height}
                    viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                        display: 'block',
                        margin: '0 auto',
                        cursor: readonly ? 'default' : 'crosshair'
                    }}
                    onClick={handleSvgClick}
                >
                    {showGrid && (
                        <defs>
                            <pattern id={`grid-${type}`} width={toSvgWidth(1)} height={toSvgHeight(1)} patternUnits="userSpaceOnUse">
                                <path d={`M ${toSvgWidth(1)} 0 L 0 0 0 ${toSvgHeight(1)}`} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                    )}

                    <rect
                        x={0}
                        y={0}
                        width={svgSize.width}
                        height={svgSize.height}
                        fill={showGrid ? `url(#grid-${type})` : '#ffffff'}
                        stroke="#d1d5db"
                        strokeWidth={2}
                    />

                    <rect
                        x={0}
                        y={0}
                        width={svgSize.width}
                        height={svgSize.height}
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth={1}
                        strokeDasharray="8,4"
                        rx={0}
                    />

                    {renderElements()}

                    <text
                        x={10}
                        y={svgSize.height - 10}
                        fontSize={10}
                        fill="#9ca3af"
                    >
                        Масштаб: {roundToDecimal(realWidth, 1)}м × {roundToDecimal(realHeight, 1)}м
                    </text>
                </svg>
            </div>

            {readonly && onBedClick && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 p-2 text-center text-sm text-blue-700 dark:text-blue-300">
                    💡 Нажмите на грядку для планирования посадки
                </div>
            )}

            {!readonly && (
                <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 text-center text-xs text-gray-500">
                    💡 Перетаскивайте грядки мышью • Используйте уголки для изменения размера •
                    Двойной клик для редактирования названия • Клик для выбора
                </div>
            )}

            {/* Модалка редактирования названия */}
            {isEditingLabel && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Редактирование названия
                        </h3>
                        <input
                            type="text"
                            value={editLabelValue}
                            onChange={(e) => setEditLabelValue(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') finishEditingLabel();
                                if (e.key === 'Escape') setIsEditingLabel(false);
                            }}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setIsEditingLabel(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={finishEditingLabel}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SvgSchemeEditor;