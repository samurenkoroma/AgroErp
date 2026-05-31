import {useState} from 'react';
import {ChevronDown, ChevronRight} from 'lucide-react';
import {getUnitIcon, getUnitTypeName, ProductionUnit} from "@/entities/spatial";
import {statusLib} from "@/utils/status.ts";

export const UnitTreeNode = ({unit, level = 0, onSelectUnit, selectedId, onAddChild}: {
    unit: ProductionUnit;
    level?: number;
    onSelectUnit: (unit: ProductionUnit) => void;
    selectedId?: string;
    onAddChild: (unit: ProductionUnit) => void;
}) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = unit.children && unit.children.length > 0;
    const isSelected = selectedId === unit.id;

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    const handleSelect = () => {
        onSelectUnit(unit);
    };

    return (
        <div className="space-y-1">
            <div
                className={`
          group rounded-lg border transition-all cursor-pointer
          ${isSelected ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500' : 'border-gray-200 dark:border-gray-700 hover:border-green-300'}
          ${level > 0 ? 'ml-6' : ''}
        `}
                onClick={handleSelect}
            >
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        {!hasChildren && <div className="w-5"/>}

                        <div className="text-2xl">{getUnitIcon(unit.type)}</div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{unit.name}</h3>
                                {unit.code && <span className="text-xs text-gray-400 font-mono">{unit.code}</span>}
                                <span
                                    className={`text-xs px-1.5 py-0.5 rounded-full ${statusLib.getBadge(unit.status)}`}>
                  {unit.status === 'active' ? 'Активен' : unit.status === 'maintenance' ? 'Обслуживание' : 'Планируется'}
                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                <span>{getUnitTypeName(unit.type)}</span>
                                {unit.geometry?.area && (
                                    <span>• {unit.geometry.area} {unit.geometry.areaUnit === 'ha' ? 'га' : 'м²'}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddChild(unit);
                            }}
                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
                            title="Добавить дочерний объект"
                        >
                        </button>
                    </div>
                    {hasChildren && (
                        <button
                            onClick={handleToggleExpand}
                            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded focus:outline-none"
                        >
                            {expanded ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                        </button>
                    )}
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="space-y-1">
                    {unit.children!.map((child: any) => (
                        <UnitTreeNode
                            key={child.id}
                            unit={child}
                            level={level + 1}
                            onSelectUnit={onSelectUnit}
                            selectedId={selectedId}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};