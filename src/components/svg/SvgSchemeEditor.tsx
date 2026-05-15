import {useCallback, useEffect, useRef, useState} from 'react';
import {
    Edit2,
    Grid,
    Info,
    Magnet,
    Maximize2,
    Minimize2,
    RotateCcw,
    Ruler,
    Save,
    Square,
    Trash2,
    X,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import * as turf from '@turf/turf';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import {v4 as uuidv4} from 'uuid';
import {FarmObjectTypes} from "@/entities/object";

export interface Element {
    id: string;
    type: 'bed' | 'path' | 'irrigation' | 'equipment' | 'plant';
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    label?: string;
    icon?: string;
}

interface SvgSchemeEditorProps {
    width: number;
    height: number;
    type: FarmObjectTypes;
    geometry?: any;
    initialElements?: Element[];
    onSave?: (elements: Element[]) => void;
    onCancel?: () => void;
    onBedClick?: (element: Element) => void;
    readonly?: boolean;
}

const elementTypes = [
    {id: 'bed', name: 'Грядка', icon: '🌱', color: '#22c55e', shape: 'rect', minSize: 0.5},
    {id: 'path', name: 'Дорожка', icon: '🟫', color: '#d4a373', shape: 'rect', minSize: 0.3},
    {id: 'irrigation', name: 'Полив', icon: '💧', color: '#3b82f6', shape: 'line', minSize: 0.2},
    {id: 'equipment', name: 'Оборудование', icon: '🔧', color: '#6b7280', shape: 'circle', minSize: 0.5},
    {id: 'plant', name: 'Растение', icon: '🌿', color: '#84cc16', shape: 'circle', minSize: 0.3},
];

const BASE_PIXELS_PER_METER = 100;
const SNAP_THRESHOLD = 5;

const getAdaptiveScale = (width: number, height: number, type: string): number => {
    if (type === 'greenhouse') return BASE_PIXELS_PER_METER * 0.8;
    const maxDimension = Math.max(width, height);
    if (maxDimension > 500) return BASE_PIXELS_PER_METER * 0.2;
    if (maxDimension > 300) return BASE_PIXELS_PER_METER * 0.35;
    if (maxDimension > 200) return BASE_PIXELS_PER_METER * 0.5;
    if (maxDimension > 10) return BASE_PIXELS_PER_METER * 0.4;
    return BASE_PIXELS_PER_METER;
};

// Функция для получения толщины линии в зависимости от масштаба
const getStrokeWidth = (pixelsPerMeter: number, baseWidth: number = 1): number => {
    const scaleFactor = Math.min(1, 15 / pixelsPerMeter);
    return Math.max(0.6, baseWidth * scaleFactor);
};

// Функция для получения размера маркера
const getMarkerSize = (pixelsPerMeter: number): number => {
    return Math.max(3, Math.min(5, pixelsPerMeter * 0.25));
};


export function SvgSchemeEditor({
                                    width,
                                    height,
                                    type,
                                    geometry,
                                    initialElements = [],
                                    onSave,
                                    onCancel,
                                    onBedClick,
                                    readonly = false
                                }: SvgSchemeEditorProps) {
    // ========== STATE ==========
    const [elements, setElements] = useState<Element[]>(initialElements);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState({x: 0, y: 0});
    const [currentDrawType, setCurrentDrawType] = useState<string>('bed');
    const [zoom, setZoom] = useState(1);
    const [showGrid, setShowGrid] = useState(true);
    const [showDimensions, setShowDimensions] = useState(true);
    const [showBoundaries, setShowBoundaries] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showElementInfo, setShowElementInfo] = useState(true);
    const [enableSnapping, setEnableSnapping] = useState(true);
    const [gridSizeMeters] = useState(1);

    // ========== REFS ==========
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const snapGuideRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);
    const dragStartPosRef = useRef({x: 0, y: 0});
    const elementStartPosRef = useRef({x: 0, y: 0});
    const resizeStartRef = useRef({width: 0, height: 0, x: 0, y: 0});

    // ========== COMPUTED VALUES ==========
    const pixelsPerMeter = getAdaptiveScale(width, height, type);
    const svgWidth = width * pixelsPerMeter;
    const svgHeight = height * pixelsPerMeter;

    const metersToPx = (meters: number) => meters * pixelsPerMeter;
    const pxToMeters = (px: number) => px / pixelsPerMeter;

    const selectedElement = elements.find(el => el.id === selectedElementId);


    // ========== HELPER FUNCTIONS ==========
    const addNotification = (notification: { type: string; message: string }) => {
        console.log(notification);
    };

    const isPointInsidePlot = useCallback((x: number, y: number): boolean => {
        if (type !== 'plot' || !geometry || !geometry.coordinates) return true;
        const bounds = getPlotBounds();
        if (!bounds) return true;
        const {minX, minY, maxX, maxY} = bounds;
        const lng = minX + (x / width) * (maxX - minX);
        const lat = minY + (y / height) * (maxY - minY);
        const point = turf.point([lng, lat]);
        const polygon = turf.polygon(geometry.coordinates);
        return booleanPointInPolygon(point, polygon);
    }, [geometry, type, width, height]);

    const isElementInsidePlot = useCallback((element: Element): boolean => {
        if (type !== 'plot' || !geometry || !geometry.coordinates) return true;
        if (element.type !== 'bed') return true;
        const corners = [
            {x: element.x, y: element.y},
            {x: element.x + element.width, y: element.y},
            {x: element.x, y: element.y + element.height},
            {x: element.x + element.width, y: element.y + element.height}
        ];
        return corners.every(corner => isPointInsidePlot(corner.x, corner.y));
    }, [geometry, type, isPointInsidePlot]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            editorRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const getPlotBounds = useCallback(() => {
        if (type === 'plot' && geometry && geometry.coordinates) {
            const coords = geometry.coordinates[0];
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            coords.forEach((coord: [number, number]) => {
                minX = Math.min(minX, coord[0]);
                minY = Math.min(minY, coord[1]);
                maxX = Math.max(maxX, coord[0]);
                maxY = Math.max(maxY, coord[1]);
            });
            return {minX, minY, maxX, maxY};
        }
        return null;
    }, [geometry, type]);

    const getScaledPolygonPoints = useCallback(() => {
        if (type !== 'plot' || !geometry || !geometry.coordinates) return null;
        const bounds = getPlotBounds();
        if (!bounds) return null;
        const {minX, minY, maxX, maxY} = bounds;
        const plotWidth = maxX - minX;
        const plotHeight = maxY - minY;
        const scaleX = svgWidth / plotWidth;
        const scaleY = svgHeight / plotHeight;
        const points = geometry.coordinates[0].map((coord: [number, number]) => {
            const x = (coord[0] - minX) * scaleX;
            const y = (coord[1] - minY) * scaleY;
            return `${x},${y}`;
        }).join(' ');
        return points;
    }, [geometry, type, svgWidth, svgHeight, getPlotBounds]);

    const calculateSnap = (x: number, y: number, elWidth: number, elHeight: number, excludeId?: string): {
        x: number;
        y: number;
        snappedX: boolean;
        snappedY: boolean
    } => {
        if (!enableSnapping) return {x, y, snappedX: false, snappedY: false};
        let newX = x;
        let newY = y;
        let snappedX = false;
        let snappedY = false;
        const threshold = SNAP_THRESHOLD / pixelsPerMeter;
        if (Math.abs(x) < threshold) {
            newX = 0;
            snappedX = true;
        }
        if (Math.abs(x + elWidth - width) < threshold) {
            newX = width - elWidth;
            snappedX = true;
        }
        if (Math.abs(y) < threshold) {
            newY = 0;
            snappedY = true;
        }
        if (Math.abs(y + elHeight - height) < threshold) {
            newY = height - elHeight;
            snappedY = true;
        }
        elements.forEach(el => {
            if (el.id === excludeId) return;
            if (Math.abs(x - (el.x + el.width)) < threshold) {
                newX = el.x + el.width;
                snappedX = true;
            }
            if (Math.abs(x + elWidth - el.x) < threshold) {
                newX = el.x - elWidth;
                snappedX = true;
            }
            if (Math.abs(y - (el.y + el.height)) < threshold) {
                newY = el.y + el.height;
                snappedY = true;
            }
            if (Math.abs(y + elHeight - el.y) < threshold) {
                newY = el.y - elHeight;
                snappedY = true;
            }
            const thisCenterX = x + elWidth / 2;
            const otherCenterX = el.x + el.width / 2;
            if (Math.abs(thisCenterX - otherCenterX) < threshold) {
                newX = otherCenterX - elWidth / 2;
                snappedX = true;
            }
            const thisCenterY = y + elHeight / 2;
            const otherCenterY = el.y + el.height / 2;
            if (Math.abs(thisCenterY - otherCenterY) < threshold) {
                newY = otherCenterY - elHeight / 2;
                snappedY = true;
            }
        });
        return {x: newX, y: newY, snappedX, snappedY};
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.3));
    const handleResetView = () => setZoom(1);

    const handleAddElement = (type: string) => {
        const elementConfig = elementTypes.find(t => t.id === type);
        const defaultSize = type === 'irrigation' ? 5 : 2;
        let x = (width / 2) - (defaultSize / 2);
        let y = (height / 2) - (defaultSize / 2);
        if (type === 'bed' && !isPointInsidePlot(x, y)) {
            x = Math.max(1, Math.min(width - defaultSize - 1, x));
            y = Math.max(1, Math.min(height - defaultSize - 1, y));
        }

        const newBedCount = elements.filter(el => el.type === 'bed').length + 1;
        const newElement: Element = {
            id: uuidv4(),
            type: type as any,
            x: x,
            y: y,
            width: type === 'irrigation' ? defaultSize : defaultSize,
            height: type === 'irrigation' ? 0.2 : defaultSize,
            color: elementConfig?.color || '#cccccc',
            label: type === 'bed' ? `Грядка ${newBedCount}` : elementConfig?.name,
            icon: elementConfig?.icon,
        };
        setElements([...elements, newElement]);
        setSelectedElementId(newElement.id);
    };

    const handleDeleteElement = () => {
        if (selectedElementId) {
            setElements(elements.filter(el => el.id !== selectedElementId));
            setSelectedElementId(null);
        }
    };

    const handleUpdateElement = (id: string, updates: Partial<Element>) => {
        setElements(elements.map(el => el.id === id ? {...el, ...updates} : el));
    };

    const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!isEditing) return;
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const scale = zoom;
        const offsetX = (rect.width - svgWidth * scale) / 2;
        const offsetY = (rect.height - svgHeight * scale) / 2;
        const pxX = (e.clientX - rect.left - offsetX) / scale;
        const pxY = (e.clientY - rect.top - offsetY) / scale;
        const metersX = pxToMeters(pxX);
        const metersY = pxToMeters(pxY);
        setDrawStart({x: metersX, y: metersY});
        setIsDrawing(true);
    };

    const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!isEditing || !isDrawing) return;
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const scale = zoom;
        const offsetX = (rect.width - svgWidth * scale) / 2;
        const offsetY = (rect.height - svgHeight * scale) / 2;
        const pxX = (e.clientX - rect.left - offsetX) / scale;
        const pxY = (e.clientY - rect.top - offsetY) / scale;
        const metersX = pxToMeters(pxX);
        const metersY = pxToMeters(pxY);
        let widthMeters = Math.abs(metersX - drawStart.x);
        let heightMeters = Math.abs(metersY - drawStart.y);
        let x = Math.min(drawStart.x, metersX);
        let y = Math.min(drawStart.y, metersY);
        if (enableSnapping) {
            const snapResult = calculateSnap(x, y, widthMeters, heightMeters);
            x = snapResult.x;
            y = snapResult.y;
        }
        if (currentDrawType === 'bed') {
            const testElement = {x, y, width: widthMeters, height: heightMeters, type: 'bed'} as Element;
            if (!isElementInsidePlot(testElement)) {
                addNotification({type: 'warning', message: 'Грядка должна быть полностью внутри участка'});
                setIsDrawing(false);
                return;
            }
        }
        const minSize = elementTypes.find(t => t.id === currentDrawType)?.minSize || 0.5;
        if (widthMeters >= minSize && heightMeters >= minSize) {
            const elementConfig = elementTypes.find(t => t.id === currentDrawType);
            const newBedCount = elements.filter(el => el.type === 'bed').length + 1;
            const newElement: Element = {
                id: uuidv4(),
                type: currentDrawType as any,
                x: x,
                y: y,
                width: widthMeters,
                height: currentDrawType === 'irrigation' ? 0.2 : heightMeters,
                color: elementConfig?.color || '#cccccc',
                label: currentDrawType === 'bed' ? `Грядка ${newBedCount}` : elementConfig?.name,
                icon: elementConfig?.icon,
            };
            setElements([...elements, newElement]);
            setSelectedElementId(newElement.id);
        }
        setIsDrawing(false);
    };

    const handleDragStart = (e: React.MouseEvent, id: string) => {
        if (!isEditing) return;
        e.stopPropagation();
        const element = elements.find(el => el.id === id);
        if (!element) return;
        draggingRef.current = true;
        elementStartPosRef.current = {x: element.x, y: element.y};
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const scale = zoom;
        const offsetX = (rect.width - svgWidth * scale) / 2;
        const offsetY = (rect.height - svgHeight * scale) / 2;
        const pxX = (e.clientX - rect.left - offsetX) / scale;
        const pxY = (e.clientY - rect.top - offsetY) / scale;
        dragStartPosRef.current = {x: pxToMeters(pxX), y: pxToMeters(pxY)};

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!draggingRef.current) return;
            const rect = svgRef.current?.getBoundingClientRect();
            if (!rect) return;
            const scale = zoom;
            const offsetX = (rect.width - svgWidth * scale) / 2;
            const offsetY = (rect.height - svgHeight * scale) / 2;
            const pxX = (moveEvent.clientX - rect.left - offsetX) / scale;
            const pxY = (moveEvent.clientY - rect.top - offsetY) / scale;
            const currentMetersX = pxToMeters(pxX);
            const currentMetersY = pxToMeters(pxY);
            const dx = currentMetersX - dragStartPosRef.current.x;
            const dy = currentMetersY - dragStartPosRef.current.y;
            let newX = elementStartPosRef.current.x + dx;
            let newY = elementStartPosRef.current.y + dy;
            const snapResult = calculateSnap(newX, newY, element.width, element.height, id);
            newX = snapResult.x;
            newY = snapResult.y;
            if (element.type === 'bed') {
                const testElement = {...element, x: newX, y: newY};
                if (!isElementInsidePlot(testElement)) return;
            }
            newX = Math.max(0, Math.min(newX, width - element.width));
            newY = Math.max(0, Math.min(newY, height - element.height));
            handleUpdateElement(id, {x: newX, y: newY});
            if (snapResult.snappedX || snapResult.snappedY) {
                if (snapGuideRef.current) {
                    snapGuideRef.current.style.opacity = '1';
                    setTimeout(() => {
                        if (snapGuideRef.current) snapGuideRef.current.style.opacity = '0';
                    }, 200);
                }
            }
        };

        const handleMouseUpDrag = () => {
            draggingRef.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUpDrag);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUpDrag);
    };

    const handleResize = (e: React.MouseEvent, id: string, corner: string) => {
        if (!isEditing) return;
        e.stopPropagation();
        const element = elements.find(el => el.id === id);
        if (!element) return;

        resizeStartRef.current = {
            width: element.width,
            height: element.height,
            x: element.x,
            y: element.y
        };

        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const scale = zoom;
        const offsetX = (rect.width - svgWidth * scale) / 2;
        const offsetY = (rect.height - svgHeight * scale) / 2;
        const startPxX = (e.clientX - rect.left - offsetX) / scale;
        const startPxY = (e.clientY - rect.top - offsetY) / scale;
        const startMetersX = pxToMeters(startPxX);
        const startMetersY = pxToMeters(startPxY);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const rect = svgRef.current?.getBoundingClientRect();
            if (!rect) return;
            const scale = zoom;
            const offsetX = (rect.width - svgWidth * scale) / 2;
            const offsetY = (rect.height - svgHeight * scale) / 2;
            const pxX = (moveEvent.clientX - rect.left - offsetX) / scale;
            const pxY = (moveEvent.clientY - rect.top - offsetY) / scale;
            const metersX = pxToMeters(pxX);
            const metersY = pxToMeters(pxY);
            const dx = metersX - startMetersX;
            const dy = metersY - startMetersY;

            let newWidth = resizeStartRef.current.width;
            let newHeight = resizeStartRef.current.height;
            let newX = resizeStartRef.current.x;
            let newY = resizeStartRef.current.y;
            const minSize = elementTypes.find(t => t.id === element.type)?.minSize || 0.5;

            switch (corner) {
                case 'se':
                    newWidth = Math.max(minSize, resizeStartRef.current.width + dx);
                    newHeight = Math.max(minSize, resizeStartRef.current.height + dy);
                    break;
                case 'sw':
                    newWidth = Math.max(minSize, resizeStartRef.current.width - dx);
                    newHeight = Math.max(minSize, resizeStartRef.current.height + dy);
                    newX = resizeStartRef.current.x + dx;
                    break;
                case 'ne':
                    newWidth = Math.max(minSize, resizeStartRef.current.width + dx);
                    newHeight = Math.max(minSize, resizeStartRef.current.height - dy);
                    newY = resizeStartRef.current.y + dy;
                    break;
                case 'nw':
                    newWidth = Math.max(minSize, resizeStartRef.current.width - dx);
                    newHeight = Math.max(minSize, resizeStartRef.current.height - dy);
                    newX = resizeStartRef.current.x + dx;
                    newY = resizeStartRef.current.y + dy;
                    break;
            }

// Ограничиваем размеры границами объекта (0 и width/height)
            newWidth = Math.max(minSize, Math.min(newWidth, width - newX));
            newHeight = Math.max(minSize, Math.min(newHeight, height - newY));
            newX = Math.max(0, Math.min(newX, width - newWidth));
            newY = Math.max(0, Math.min(newY, height - newHeight));

// Для грядок дополнительно проверяем, что они не выходят за пределы участка
            if (element.type === 'bed') {
                const testElement = {...element, x: newX, y: newY, width: newWidth, height: newHeight};
                if (!isElementInsidePlot(testElement)) return;
            }

            handleUpdateElement(id, {x: newX, y: newY, width: newWidth, height: newHeight});
        };

        const handleMouseUpResize = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUpResize);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUpResize);
    };


    const handleSelectElement = (id: string) => {
        setSelectedElementId(id);
    };

    // ========== RENDER FUNCTIONS ==========

    const renderBoundaries = () => {
        if (!showBoundaries) return null;
        const borderColor = type === 'greenhouse' ? '#3b82f6' : '#f59e0b';
        const borderStyle = type === 'greenhouse' ? 'solid' : 'dashed';
        const borderWidth = getStrokeWidth(pixelsPerMeter, 2);
        if (type === 'plot' && geometry && geometry.coordinates) {
            const polygonPoints = getScaledPolygonPoints();
            if (!polygonPoints) return null;
            return (
                <g>
                    <polygon points={polygonPoints} fill="none" stroke={borderColor} strokeWidth={borderWidth}
                             strokeDasharray={borderStyle === 'dashed' ? '8,4' : ''}
                             className="transition-all duration-200"/>
                    <polygon points={polygonPoints} fill={borderColor} fillOpacity="0.05" stroke="none"/>
                    <text x={svgWidth / 2} y={20} textAnchor="middle"
                          fontSize={Math.max(10, Math.min(14, pixelsPerMeter * 1.2))} fontWeight="bold"
                          fill={borderColor} className="pointer-events-none">УЧАСТОК
                    </text>
                </g>
            );
        }
        return (
            <g>
                <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="none" stroke={borderColor}
                      strokeWidth={borderWidth} strokeDasharray={borderStyle === 'dashed' ? '8,4' : ''} rx={0} ry={0}/>
                <text x={svgWidth / 2} y={20} textAnchor="middle"
                      fontSize={Math.max(10, Math.min(14, pixelsPerMeter * 1.2))} fontWeight="bold" fill={borderColor}
                      className="pointer-events-none">ТЕПЛИЦА
                </text>
                <rect x={borderWidth} y={borderWidth} width={svgWidth - borderWidth * 2}
                      height={svgHeight - borderWidth * 2} fill="none" stroke={borderColor}
                      strokeWidth={getStrokeWidth(pixelsPerMeter, 0.5)} strokeOpacity={0.3} strokeDasharray="4,4" rx={0}
                      ry={0}/>
            </g>
        );
    };

    const renderGrid = () => {
        if (!showGrid) return null;
        const lines = [];
        const gridStroke = getStrokeWidth(pixelsPerMeter, 0.3);
        for (let x = 0; x <= width; x += gridSizeMeters) {
            const xPx = metersToPx(x);
            lines.push(<line key={`v-${x}`} x1={xPx} y1={0} x2={xPx} y2={svgHeight} stroke="#e5e7eb"
                             strokeWidth={gridStroke} className="dark:stroke-gray-700"/>);
        }
        for (let y = 0; y <= height; y += gridSizeMeters) {
            const yPx = metersToPx(y);
            lines.push(<line key={`h-${y}`} x1={0} y1={yPx} x2={svgWidth} y2={yPx} stroke="#e5e7eb"
                             strokeWidth={gridStroke} className="dark:stroke-gray-700"/>);
        }
        return lines;
    };

    const renderDimensions = () => {
        if (!showDimensions) return null;
        const fontSize = Math.max(8, Math.min(11, pixelsPerMeter * 0.7));
        const offset = Math.max(5, pixelsPerMeter * 0.5);
        if (type === 'plot' && geometry) {
            const bounds = getPlotBounds();
            if (bounds) {
                const plotWidth = (bounds.maxX - bounds.minX) * 100000;
                const plotHeight = (bounds.maxY - bounds.minY) * 100000;
                return (
                    <>
                        <line x1={0} y1={svgHeight + offset} x2={svgWidth} y2={svgHeight + offset} stroke="#6b7280"
                              strokeWidth={getStrokeWidth(pixelsPerMeter, 0.8)} strokeDasharray="4 4"/>
                        <text x={svgWidth / 2} y={svgHeight + offset + fontSize} textAnchor="middle" fontSize={fontSize}
                              fill="#6b7280" className="dark:fill-gray-400">~{plotWidth.toFixed(0)} м
                        </text>
                        <line x1={svgWidth + offset} y1={0} x2={svgWidth + offset} y2={svgHeight} stroke="#6b7280"
                              strokeWidth={getStrokeWidth(pixelsPerMeter, 0.8)} strokeDasharray="4 4"/>
                        <text x={svgWidth + offset + fontSize} y={svgHeight / 2} textAnchor="start"
                              dominantBaseline="middle" fontSize={fontSize} fill="#6b7280"
                              className="dark:fill-gray-400">~{plotHeight.toFixed(0)} м
                        </text>
                    </>
                );
            }
        }
        return (
            <>
                <line x1={0} y1={svgHeight + offset} x2={svgWidth} y2={svgHeight + offset} stroke="#6b7280"
                      strokeWidth={getStrokeWidth(pixelsPerMeter, 0.8)} strokeDasharray="4 4"/>
                <text x={svgWidth / 2} y={svgHeight + offset + fontSize} textAnchor="middle" fontSize={fontSize}
                      fill="#6b7280" className="dark:fill-gray-400">{width} м
                </text>
                <line x1={svgWidth + offset} y1={0} x2={svgWidth + offset} y2={svgHeight} stroke="#6b7280"
                      strokeWidth={getStrokeWidth(pixelsPerMeter, 0.8)} strokeDasharray="4 4"/>
                <text x={svgWidth + offset + fontSize} y={svgHeight / 2} textAnchor="start" dominantBaseline="middle"
                      fontSize={fontSize} fill="#6b7280" className="dark:fill-gray-400">{height} м
                </text>
            </>
        );
    };

    const renderElementDimensions = () => {
        if (!selectedElement || !showElementInfo) return null;
        const xPx = metersToPx(selectedElement.x);
        const yPx = metersToPx(selectedElement.y);
        const widthPx = metersToPx(selectedElement.width);
        const heightPx = metersToPx(selectedElement.height);
        const labelX = xPx + widthPx / 2;
        const fontSize = Math.max(7, Math.min(10, pixelsPerMeter * 0.6));
        return (
            <g className="pointer-events-none">
                <line x1={xPx} y1={yPx - Math.max(5, pixelsPerMeter * 0.3)} x2={xPx + widthPx}
                      y2={yPx - Math.max(5, pixelsPerMeter * 0.3)} stroke="#2563eb"
                      strokeWidth={getStrokeWidth(pixelsPerMeter, 1)} strokeDasharray="4 2"/>
                <line x1={xPx} y1={yPx - Math.max(2, pixelsPerMeter * 0.2)} x2={xPx}
                      y2={yPx - Math.max(8, pixelsPerMeter * 0.5)} stroke="#2563eb"
                      strokeWidth={getStrokeWidth(pixelsPerMeter, 1)}/>
                <line x1={xPx + widthPx} y1={yPx - Math.max(2, pixelsPerMeter * 0.2)} x2={xPx + widthPx}
                      y2={yPx - Math.max(8, pixelsPerMeter * 0.5)} stroke="#2563eb"
                      strokeWidth={getStrokeWidth(pixelsPerMeter, 1)}/>
                <text x={labelX} y={yPx - Math.max(10, pixelsPerMeter * 0.8)} textAnchor="middle" fontSize={fontSize}
                      fill="#2563eb" className="font-medium">{selectedElement.width.toFixed(1)} м
                </text>
                <line x1={xPx + widthPx + Math.max(5, pixelsPerMeter * 0.3)} y1={yPx}
                      x2={xPx + widthPx + Math.max(5, pixelsPerMeter * 0.3)} y2={yPx + heightPx} stroke="#2563eb"
                      strokeWidth={getStrokeWidth(pixelsPerMeter, 1)} strokeDasharray="4 2"/>
                <line x1={xPx + widthPx + Math.max(2, pixelsPerMeter * 0.2)} y1={yPx}
                      x2={xPx + widthPx + Math.max(8, pixelsPerMeter * 0.5)} y2={yPx} stroke="#2563eb"
                      strokeWidth={getStrokeWidth(pixelsPerMeter, 1)}/>
                <line x1={xPx + widthPx + Math.max(2, pixelsPerMeter * 0.2)} y1={yPx + heightPx}
                      x2={xPx + widthPx + Math.max(8, pixelsPerMeter * 0.5)} y2={yPx + heightPx} stroke="#2563eb"
                      strokeWidth={getStrokeWidth(pixelsPerMeter, 1)}/>
                <text x={xPx + widthPx + Math.max(12, pixelsPerMeter * 0.8)} y={yPx + heightPx / 2} textAnchor="start"
                      dominantBaseline="middle" fontSize={fontSize} fill="#2563eb"
                      className="font-medium">{selectedElement.height.toFixed(1)} м
                </text>
            </g>
        );
    };

    const renderElement = (element: Element) => {
        const isSelected = selectedElementId === element.id;
        const strokeColor = isSelected ? '#2563eb' : element.color;
        const strokeWidth = isSelected ? getStrokeWidth(pixelsPerMeter, 2) : getStrokeWidth(pixelsPerMeter, 1);
        const xPx = metersToPx(element.x);
        const yPx = metersToPx(element.y);
        const widthPx = metersToPx(element.width);
        const heightPx = metersToPx(element.height);
        const isBed = element.type === 'bed';
        const markerSize = getMarkerSize(pixelsPerMeter);

        // Режим только для просмотра (readonly)
        if (readonly) {
            if (isBed) {
                return (
                    <g
                        key={element.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onBedClick) onBedClick(element);
                        }}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <rect
                            x={xPx}
                            y={yPx}
                            width={widthPx}
                            height={heightPx}
                            fill={element.color}
                            fillOpacity="0.5"
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            rx={2}
                            ry={2}
                        />
                        {element.label && (
                            <text
                                x={xPx + widthPx / 2}
                                y={yPx + heightPx / 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={Math.max(9, Math.min(12, widthPx / 6))}
                                fill="#1f2937"
                                className="dark:fill-white pointer-events-none"
                            >
                                {element.label}
                            </text>
                        )}
                    </g>
                );
            }

            if (element.type === 'irrigation') {
                return (
                    <g key={element.id}>
                        <line
                            x1={xPx}
                            y1={yPx + heightPx / 2}
                            x2={xPx + widthPx}
                            y2={yPx + heightPx / 2}
                            stroke={element.color}
                            strokeWidth={Math.max(2, heightPx)}
                            strokeLinecap="round"
                        />
                    </g>
                );
            }

            if (element.type === 'equipment' || element.type === 'plant') {
                const radius = Math.min(widthPx, heightPx) / 2;
                const cx = xPx + widthPx / 2;
                const cy = yPx + heightPx / 2;
                const fontSize = Math.max(12, radius * 0.7);
                return (
                    <g key={element.id}>
                        <circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            fill={element.color}
                            fillOpacity="0.5"
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                        />
                        <text
                            x={cx}
                            y={cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={fontSize}
                            fill="white"
                            className="pointer-events-none"
                        >
                            {element.icon}
                        </text>
                    </g>
                );
            }

            return (
                <rect
                    key={element.id}
                    x={xPx}
                    y={yPx}
                    width={widthPx}
                    height={heightPx}
                    fill={element.color}
                    fillOpacity="0.5"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    rx={2}
                    ry={2}
                />
            );
        }

        // Режим редактирования
        if (element.type === 'irrigation') {
            return (
                <g key={element.id} onClick={(e) => {
                    e.stopPropagation();
                    handleSelectElement(element.id);
                }}>
                    <line
                        x1={xPx}
                        y1={yPx + heightPx / 2}
                        x2={xPx + widthPx}
                        y2={yPx + heightPx / 2}
                        stroke={element.color}
                        strokeWidth={Math.max(2, heightPx)}
                        strokeLinecap="round"
                        className="cursor-move"
                        onMouseDown={(e) => handleDragStart(e, element.id)}
                    />
                    {isSelected && (
                        <>
                            <circle cx={xPx} cy={yPx + heightPx / 2} r={markerSize} fill="white" stroke="#2563eb"
                                    strokeWidth={2} className="cursor-se-resize"
                                    onMouseDown={(e) => handleResize(e, element.id, 'nw')}/>
                            <circle cx={xPx + widthPx} cy={yPx + heightPx / 2} r={markerSize} fill="white"
                                    stroke="#2563eb" strokeWidth={2} className="cursor-se-resize"
                                    onMouseDown={(e) => handleResize(e, element.id, 'se')}/>
                        </>
                    )}
                </g>
            );
        }

        if (element.type === 'equipment' || element.type === 'plant') {
            const radius = Math.min(widthPx, heightPx) / 2;
            const cx = xPx + widthPx / 2;
            const cy = yPx + heightPx / 2;
            const fontSize = Math.max(12, radius * 0.7);
            return (
                <g key={element.id} onClick={(e) => {
                    e.stopPropagation();
                    handleSelectElement(element.id);
                }}>
                    <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill={element.color}
                        fillOpacity="0.5"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        className="cursor-move"
                        onMouseDown={(e) => handleDragStart(e, element.id)}
                    />
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fill="white"
                          className="pointer-events-none">{element.icon}</text>
                    {
                        isSelected && (
                            <>
                                <circle
                                    cx={xPx}
                                    cy={yPx}
                                    r={markerSize}
                                    fill="white"
                                    stroke="#2563eb"
                                    strokeWidth={1.5}
                                    className="cursor-nw-resize"
                                    onMouseDown={(e) => handleResize(e, element.id, 'nw')}
                                />
                                <circle
                                    cx={xPx + widthPx}
                                    cy={yPx}
                                    r={markerSize}
                                    fill="white"
                                    stroke="#2563eb"
                                    strokeWidth={1.5}
                                    className="cursor-ne-resize"
                                    onMouseDown={(e) => handleResize(e, element.id, 'ne')}
                                />
                                <circle
                                    cx={xPx}
                                    cy={yPx + heightPx}
                                    r={markerSize}
                                    fill="white"
                                    stroke="#2563eb"
                                    strokeWidth={1.5}
                                    className="cursor-sw-resize"
                                    onMouseDown={(e) => handleResize(e, element.id, 'sw')}
                                />
                                <circle
                                    cx={xPx + widthPx}
                                    cy={yPx + heightPx}
                                    r={markerSize}
                                    fill="white"
                                    stroke="#2563eb"
                                    strokeWidth={1.5}
                                    className="cursor-se-resize"
                                    onMouseDown={(e) => handleResize(e, element.id, 'se')}
                                />
                            </>
                        )
                    }
                </g>
            );
        }

        // Грядка в режиме редактирования
        return (
            <g
                key={element.id}
                onClick={(e) => {
                    e.stopPropagation();
                    handleSelectElement(element.id);
                }}
                className="cursor-move"
            >
                <rect
                    x={xPx}
                    y={yPx}
                    width={widthPx}
                    height={heightPx}
                    fill={element.color}
                    fillOpacity="0.5"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    rx={2}
                    ry={2}
                    onMouseDown={(e) => handleDragStart(e, element.id)}
                />
                {element.label && (
                    <text
                        x={xPx + widthPx / 2}
                        y={yPx + heightPx / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={Math.max(9, Math.min(12, widthPx / 6))}
                        fill="#1f2937"
                        className="dark:fill-white pointer-events-none"
                    >
                        {element.label}
                    </text>
                )}
                {isSelected && (
                    <>
                        <circle cx={xPx} cy={yPx} r={markerSize} fill="white" stroke="#2563eb" strokeWidth={2}
                                className="cursor-nw-resize" onMouseDown={(e) => handleResize(e, element.id, 'nw')}/>
                        <circle cx={xPx + widthPx} cy={yPx} r={markerSize} fill="white" stroke="#2563eb" strokeWidth={2}
                                className="cursor-ne-resize" onMouseDown={(e) => handleResize(e, element.id, 'ne')}/>
                        <circle cx={xPx} cy={yPx + heightPx} r={markerSize} fill="white" stroke="#2563eb"
                                strokeWidth={2} className="cursor-sw-resize"
                                onMouseDown={(e) => handleResize(e, element.id, 'sw')}/>
                        <circle cx={xPx + widthPx} cy={yPx + heightPx} r={markerSize} fill="white" stroke="#2563eb"
                                strokeWidth={2} className="cursor-se-resize"
                                onMouseDown={(e) => handleResize(e, element.id, 'se')}/>
                    </>
                )}
            </g>
        );
    };

    const handleSave = () => {
        onSave?.(elements);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setElements(initialElements);
        setIsEditing(false);
        onCancel?.();
    };

    const SnapGuide = () => (
        <div ref={snapGuideRef} className="fixed pointer-events-none z-50 transition-opacity duration-150 opacity-0"
             style={{
                 left: '50%',
                 top: '50%',
                 transform: 'translate(-50%, -50%)',
                 width: '40px',
                 height: '40px',
                 borderRadius: '50%',
                 backgroundColor: '#22c55e',
                 boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.3)'
             }}/>
    );

    const scaleInfo = `${pixelsPerMeter} px/м`;

    return (
        <div ref={editorRef}
             className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
             style={isFullscreen ? {borderRadius: 0} : {}}>
            <SnapGuide/>

            {/* Панель инструментов - показываем только в режиме редактирования */}
            {!readonly && (
                <div
                    className="p-3 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <div className="flex flex-wrap gap-2">
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium">
                                <Edit2 className="w-4 h-4"/> Редактировать схему
                            </button>
                        ) : (
                            <>
                                <button onClick={handleSave}
                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium">
                                    <Save className="w-4 h-4"/> Сохранить
                                </button>
                                <button onClick={handleCancel}
                                        className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium">
                                    <X className="w-4 h-4"/> Отмена
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                        {isEditing && (
                            <div className="flex gap-1">
                                {elementTypes.map(type => (
                                    <button key={type.id} onClick={() => {
                                        setCurrentDrawType(type.id);
                                        handleAddElement(type.id);
                                    }}
                                            className={`p-1.5 rounded-lg border transition-all text-sm ${currentDrawType === type.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-300 dark:border-gray-700 hover:border-green-300'}`}
                                            title={`Добавить ${type.name}`}>
                                        <span className="text-lg">{type.icon}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-1 ml-2 border-l border-gray-300 dark:border-gray-700 pl-2">
                            <button onClick={handleZoomIn} className="p-1.5 hover:bg-gray-100 rounded-lg"><ZoomIn
                                className="w-4 h-4"/></button>
                            <button onClick={handleZoomOut} className="p-1.5 hover:bg-gray-100 rounded-lg"><ZoomOut
                                className="w-4 h-4"/></button>
                            <button onClick={handleResetView} className="p-1.5 hover:bg-gray-100 rounded-lg"><RotateCcw
                                className="w-4 h-4"/></button>
                            <button onClick={toggleFullscreen}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg">{isFullscreen ?
                                <Minimize2 className="w-4 h-4"/> : <Maximize2 className="w-4 h-4"/>}</button>
                            <button onClick={() => setEnableSnapping(!enableSnapping)}
                                    className={`p-1.5 rounded-lg ${enableSnapping ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
                                <Magnet className="w-4 h-4"/></button>
                            {selectedElementId && <button onClick={handleDeleteElement}
                                                          className="p-1.5 hover:bg-red-100 rounded-lg text-red-500">
                                <Trash2 className="w-4 h-4"/></button>}
                            <div className="w-px h-5 bg-gray-300 mx-1"/>
                            <button onClick={() => setShowGrid(!showGrid)}
                                    className={`p-1.5 rounded-lg ${showGrid ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
                                <Grid className="w-4 h-4"/></button>
                            <button onClick={() => setShowDimensions(!showDimensions)}
                                    className={`p-1.5 rounded-lg ${showDimensions ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
                                <Ruler className="w-4 h-4"/></button>
                            <button onClick={() => setShowBoundaries(!showBoundaries)}
                                    className={`p-1.5 rounded-lg ${showBoundaries ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
                                <Square className="w-4 h-4"/></button>
                            <button onClick={() => setShowElementInfo(!showElementInfo)}
                                    className={`p-1.5 rounded-lg ${showElementInfo ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
                                <Info className="w-4 h-4"/></button>
                        </div>
                    </div>
                </div>
            )}

            {/*/!* Подсказка для режима просмотра *!/*/}
            {/*{readonly && (*/}
            {/*    <div*/}
            {/*        className="p-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">*/}
            {/*        💡 Нажмите на любую грядку для планирования посадки. Для редактирования схемы перейдите в карточку*/}
            {/*        объекта на вкладку "Схема".*/}
            {/*    </div>*/}
            {/*)}*/}

            {/* Контейнер со схемой */}
            <div ref={containerRef} className="flex-1 bg-gray-50 dark:bg-gray-800/30 overflow-auto p-4"
                 style={{minHeight: 0}}>
                <div style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    display: 'inline-block',
                    minWidth: '100%',
                    minHeight: '100%'
                }}>
                    <svg
                        ref={svgRef}
                        width={svgWidth}
                        height={svgHeight}
                        viewBox={`-20 -20 ${svgWidth +100} ${svgHeight + 100}`}
                        className={`bg-white dark:bg-gray-900 shadow-inner ${isEditing ? 'cursor-crosshair' : ''}`}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={() => setIsDrawing(false)}
                        style={{display: 'block'}}
                    >
                        <rect width={svgWidth} height={svgHeight} fill="#f9fafb" className="dark:fill-gray-800"/>
                        {renderBoundaries()}
                        {renderGrid()}
                        {renderDimensions()}
                        {elements.map(renderElement)}
                        {renderElementDimensions()}
                        {isDrawing && isEditing && (
                            <rect
                                x={Math.min(metersToPx(drawStart.x), metersToPx(drawStart.x))}
                                y={Math.min(metersToPx(drawStart.y), metersToPx(drawStart.y))}
                                width={Math.abs(metersToPx(drawStart.x) - metersToPx(drawStart.x))}
                                height={Math.abs(metersToPx(drawStart.y) - metersToPx(drawStart.y))}
                                fill="#22c55e"
                                fillOpacity="0.3"
                                stroke="#16a34a"
                                strokeWidth={getStrokeWidth(pixelsPerMeter, 1.5)}
                                strokeDasharray="5,5"
                            />
                        )}
                    </svg>
                </div>
            </div>

            {/* Информационная панель */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                <div className="flex flex-wrap justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-600 dark:text-gray-400">📏 {width} × {height} м</span>
                        <span className="text-gray-600 dark:text-gray-400">🎨 {scaleInfo}</span>
                        <span
                            className="text-gray-600 dark:text-gray-400">🟦 {type === 'greenhouse' ? 'Теплица' : 'Участок'}</span>
                        {selectedElement && (
                            <span
                                className="text-gray-600 dark:text-gray-400">📐 {selectedElement.width.toFixed(1)} × {selectedElement.height.toFixed(1)} м</span>
                        )}
                        <span className="text-gray-600 dark:text-gray-400">🧲 {enableSnapping ? 'Вкл' : 'Выкл'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {elementTypes.map(type => (
                            <div key={type.id} className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded" style={{backgroundColor: type.color}}/>
                                <span className="text-gray-500">{type.icon}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}