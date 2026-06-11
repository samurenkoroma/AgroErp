import {UnitDetailPanel} from "@/features/spatial/production-unit/components/UnitDetailPanel.tsx";
import {Box, MapPin} from "lucide-react";
import {ProductionUnit} from "@/entities/spatial";
import {useState} from "react";
import {UnitTreeNode} from "@/features/spatial/production-unit/components/UnitTreeNode.tsx";
import {useNavigate} from "react-router-dom";
import {useCreateCycle} from "@/features/production/growing_cycle/mutations.ts";
import {CreateCycleRequest} from "@/entities/production/growing-cycle/dto.ts";

interface PlotsTabProps {
    units: ProductionUnit[]
    handleAddChild: (unit: ProductionUnit) => void
    handleCreateUnit: () => void
}

export const PlotsTab = ({units = [], handleAddChild, handleCreateUnit}: PlotsTabProps) => {
    const [selectedUnit, setSelectedUnit] = useState<ProductionUnit | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {mutate: createCycle} = useCreateCycle()
    const handleSelectUnit = (unit: ProductionUnit) => {
        setSelectedUnit(unit);
    };
    const navigate = useNavigate();
    if (units.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Box className="w-12 h-12 mx-auto mb-3 opacity-50"/>
                <button onClick={handleCreateUnit}>Добавить</button>
            </div>
        )
    }
    const actions = new Map<string, () => void>([
        ["Редактирование", () => {
            navigate(`/plot/${selectedUnit!.id}`)
        }],
        ["Добавить дочерний", () => handleAddChild(selectedUnit!)],
        ["Добавить посев", () => setIsModalOpen(true)],
    ]);
    const handleCreateCycle = (data: CreateCycleRequest) => {
        createCycle(data)
        setIsModalOpen(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="space-y-4">
                    <div
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                        <div className="space-y-1">
                            {units.map((unit) => (
                                <UnitTreeNode
                                    key={unit.id}
                                    unit={unit}
                                    onSelectUnit={handleSelectUnit}
                                    selectedId={selectedUnit?.id}
                                    onAddChild={handleAddChild}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                {selectedUnit ? (<UnitDetailPanel
                    unit={selectedUnit}
                    actions={actions}
                    onClose={() => setSelectedUnit(undefined)}
                />) : (<div
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center sticky top-6">
                        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            Выберите объект
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Нажмите на объект в списке
                        </p>
                    </div>
                )}
            </div>


        </div>
    )
}