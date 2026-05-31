import {FieldsMap} from "@/features/spatial/production-unit/components/FieldsMap.tsx";
import {UnitDetailPanel} from "@/features/spatial/production-unit/components/UnitDetailPanel.tsx";
import {MapPin} from "lucide-react";
import {ProductionUnit} from "@/entities/spatial";
import {useState} from "react";

interface FieldsTabProps {
    units: ProductionUnit[]
    onAddChild: (unit: ProductionUnit) => void
}

export const FieldsTab = ({units = [], onAddChild}: FieldsTabProps) => {
    const [selectedUnit, setSelectedUnit] = useState<ProductionUnit | null>(null);
    const handleSelectUnit = (unit: ProductionUnit) => {
        setSelectedUnit(unit);
    };
    return (
        <div className="flex gap-6">
            <div className="flex-1">
                <div
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900 dark:text-white">Карта полей</h2>
                            <span className="text-xs text-gray-500">{units.length} полей</span>
                        </div>
                    </div>
                    <FieldsMap fields={units} onSelectField={handleSelectUnit}/>
                </div>
            </div>

            <div className="w-96 shrink-0">
                {selectedUnit ? (
                    <UnitDetailPanel
                        unit={selectedUnit}
                        onClose={() => setSelectedUnit(null)}
                        onAddChild={() => onAddChild(selectedUnit)}
                    />
                ) : (
                    <div
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center sticky top-6">
                        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            Выберите поле
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Нажмите на поле на карте
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}