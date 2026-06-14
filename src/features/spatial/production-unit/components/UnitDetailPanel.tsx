import {getCapabilityIcon, getCapabilityName, getUnitIcon, getUnitTypeName, ProductionUnit} from "@/entities/spatial";
import {Shield, X} from "lucide-react";
import {propsLib} from "@/utils/props.ts";
import {statusConfig} from "@/utils";

export const UnitDetailPanel = ({unit, onClose, actions}: {
    unit: ProductionUnit;
    onClose: () => void;
    actions: Map<string, () => void>
}) => {
    return (
        <div
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden sticky top-6">
            <div
                className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{getUnitIcon(unit.type)}</span>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{unit.properties.metadata?.name}</h2>
                            {unit.code && <p className="text-sm text-gray-500 font-mono">{unit.code}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5"/>
                    </button>
                </div>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Основная информация</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-500">Тип</span>
                            <p className="font-medium">{getUnitTypeName(unit.type)}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Статус</span>
                            <p className="font-medium">{statusConfig[unit.status].label}</p>
                        </div>
                        {unit.geometry?.area && (
                            <div>
                                <span className="text-gray-500">Площадь</span>
                                <p className="font-medium">{unit.geometry.area} {unit.geometry.areaUnit === 'ha' ? 'га' : 'м²'}</p>
                            </div>
                        )}
                        {Object.entries(unit.properties.dimensions || []).map(([key, value]) => (
                            <div key={key}>
                                <span className="text-gray-500">{propsLib.getText(key)}</span>
                                <p className="font-medium">{value}</p>
                            </div>

                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4"/>
                        Возможности
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {unit.properties.capabilities?.map((cap) => (
                            <span key={cap}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
                {getCapabilityIcon(cap)}
                                {getCapabilityName(cap)}
              </span>
                        ))}
                    </div>
                </div>

                {unit.properties.metadata?.description && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Описание</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{unit.properties.metadata.description}</p>
                    </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {actions && Array.from(actions).map(([key, fn]) => (
                        <button
                            key={key}
                            onClick={fn}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                            {key}
                        </button>
                    ))}

                </div>
            </div>
        </div>
    );
};