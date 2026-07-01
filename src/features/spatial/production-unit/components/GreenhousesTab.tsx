import {UnitDetailPanel} from "@/features/spatial/production-unit/components/UnitDetailPanel.tsx";
import {Box, MapPin} from "lucide-react";
import {ProductionUnit} from "@/entities/spatial";
import {useMemo, useState} from "react";
import {CreateProductionUnitRequest} from "@/entities/spatial/production-unit/dto.ts";
import {useCreateProductionUnit} from "@/features/spatial/production-unit/mutations.ts";
import {CreateGreenHouseModal} from "@/features/spatial/production-unit/forms/CreateGreenHouseModal.tsx";
import {useNavigate} from "react-router-dom";
import {UnitListNode} from "@/features/spatial/production-unit/components/UnitListNode.tsx";
import {usePageActions} from "@/hooks/usePageActions.ts";

interface GreenhousesTabProps {
    units: ProductionUnit[]
    onAddChild: (unit: ProductionUnit) => void
}

export const GreenhousesTab = ({units = [], onAddChild}: GreenhousesTabProps) => {
    const [selectedUnit, setSelectedUnit] = useState<ProductionUnit | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const navigate = useNavigate();
    const {mutate: createUnit} = useCreateProductionUnit();

    usePageActions({
        actions:  [
            {
                id: 'add-crop',
                label: 'Добавить теплицу ',
                icon: <MapPin className="w-5 h-5"/>,
                onClick: () => {
                    setSelectedUnit(null);
                    setIsCreateModalOpen(true)
                },
                color: 'bg-green-500'
            },

        ],
    });
    const handleCreateUnit = async (newUnit: CreateProductionUnitRequest) => {
        setIsCreateModalOpen(false);
        createUnit(newUnit);
    };

    const handleSelectUnit = (unit: ProductionUnit) => {
        navigate("")
        setSelectedUnit(unit);
    };

    const actions = useMemo(
            () => {
                const act = new Map([
                    ["Редактирование", () => {
                        navigate(`/greenhouse/${selectedUnit!.id}`)
                    }],
                ])

                if ( selectedUnit?.status == 'empty') {
                    act.set("Добавить дочерний", () => setIsCreateModalOpen(true))
                }
                return act
            },
            [selectedUnit]
        )
    ;


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="space-y-4">
                    <div
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                        <div className="space-y-1">
                            {units.length > 0 ? (
                                units.map((unit) => (
                                    <UnitListNode
                                        key={unit.id}
                                        unit={unit}
                                        onSelectUnit={handleSelectUnit}
                                        selectedId={selectedUnit?.id}
                                        onAddChild={onAddChild}
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
                        onClose={() => setSelectedUnit(null)} actions={actions}/>
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

            {isCreateModalOpen && (<CreateGreenHouseModal
                units={units}
                isOpen={isCreateModalOpen}
                parent={selectedUnit}
                onClose={() => {
                    setIsCreateModalOpen(false);
                }}
                onSuccess={handleCreateUnit}
            />)}
        </div>
    )
}