import {UnitDetailPanel} from "@/features/spatial/production-unit/components/UnitDetailPanel.tsx";
import {Box, MapPin} from "lucide-react";
import {ProductionUnit} from "@/entities/spatial";
import {useState} from "react";
import {UnitTreeNode} from "@/features/spatial/production-unit/components/UnitTreeNode.tsx";
import {useNavigate} from "react-router-dom";
import {CreateContainerModal} from "@/features/spatial/production-unit/components/CreateContainerModal.tsx";
import {CreateProductionUnitRequest} from "@/entities/spatial/production-unit/dto.ts";
import {useCreateProductionUnit} from "@/features/spatial/production-unit/mutations.ts";

interface ContainersTabProps {
    units: ProductionUnit[]
}

export const ContainersTab = ({units = []}: ContainersTabProps) => {
    const [selectedUnit, setSelectedUnit] = useState<ProductionUnit | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate();
    const handleSelectUnit = (unit: ProductionUnit) => {
        setSelectedUnit(unit);
    };
    const {mutate: createUnit} = useCreateProductionUnit();
    const actions = new Map<string, () => void>([
        ["Редактирование", () => { navigate(`/plot/${selectedUnit!.id}`)}],
        ["Добавить дочерний", () => setIsCreateModalOpen(true)],
    ]);
    const handleCreateUnit = (newUnit: CreateProductionUnitRequest) => {
        setIsCreateModalOpen(false);
        createUnit(newUnit);
    };

    const handleCreateIfEmpty = () => {
        setSelectedUnit(null);
        setIsCreateModalOpen(true)
    }
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                        <Box className="w-12 h-12 mx-auto mb-3 opacity-50"/>
                        <button onClick={handleCreateIfEmpty}>Добавить</button>
                    </div>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                        <div className="space-y-1">
                            {units.length > 0 ? (
                                units.map((unit) => (
                                    <UnitTreeNode
                                        key={unit.id}
                                        unit={unit}
                                        onSelectUnit={handleSelectUnit}
                                        selectedId={selectedUnit?.id}
                                        onAddChild={() => {
                                        }}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Box className="w-12 h-12 mx-auto mb-3 opacity-50"/>
                                    <p>Ничего не найдено</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                {selectedUnit ? (
                    <UnitDetailPanel
                        unit={selectedUnit}
                        onClose={() => setSelectedUnit(null)}
                        actions={actions}
                    />
                ) : (
                    <div
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

            {isCreateModalOpen && (<CreateContainerModal
                units={units}
                isOpen={isCreateModalOpen}
                parent ={selectedUnit}
                onClose={() => {
                    setIsCreateModalOpen(false);
                }}
                onSuccess={handleCreateUnit}
            />)}
        </div>
    )
}