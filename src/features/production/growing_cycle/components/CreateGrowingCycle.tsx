// import {useFieldArray, useForm} from "react-hook-form"
// import {zodResolver} from "@hookform/resolvers/zod"
// import {ProductionUnit} from "@/entities/spatial";
// import {Modal} from "@/components/common/Modal.tsx";
// import {useCrops} from "@/features/agronomy/crop";
// import {useVarieties} from "@/features/agronomy/variety/queries.ts";
// import {StartCycleRequest, startCycleSchema} from "@/entities/production/growing-cycle";
//
//
// export function CreateGrowingCycle({isOpen, onClose, unit, onSave}: {
//     isOpen: boolean;
//     onClose: () => void;
//     unit: ProductionUnit;
//     onSave: (data: StartCycleRequest) => void;
// }) {
//     const {data: crops = [],} = useCrops({})
//     const selectedCrop = crops.find(c => c.id === data.cropID);
//     const {data: varieties = [],} = useVarieties(selectedCrop?.id!)
//     const availableVarieties = varieties.filter(v => v.cropId === data.cropID);
//     const {
//         register,
//         control,
//         handleSubmit,
//         formState: {errors}
//     } = useForm<StartCycleRequest>({
//         resolver: zodResolver(startCycleSchema),
//
//         defaultValues: {
//             name: "",
//             code: "",
//
//             cropID: "",
//
//             status: "draft",
//             stage: "planning",
//             method: "seedling",
//
//             allocations: [],
//             plantings: []
//         }
//     })
//
//     const allocations = useFieldArray({
//         control,
//         name: "allocations"
//     })
//
//     const plantings = useFieldArray({
//         control,
//         name: "plantings"
//     })
//
//     return (
//         <Modal isOpen={isOpen} onClose={onClose}
//                title={`Новый цикл выращивания ${unit.code}`}
//                size="lg">
//             <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                             Название *
//                         </label>
//                         <input
//                             {...register("name")}
//                             className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
//                         />
//                     </div>
//                 </div>
//
//                 <div className="grid grid-cols-2 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                             Культура *
//                         </label>
//                         <select
//                             value={data.cropID}
//                             onChange={(e) => setField("cropID", e.target.value)}
//                             className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
//                         >
//                             <option value="">Выберите культуру</option>
//                             {crops.map(crop => (
//                                 <option key={crop.id} value={crop.id}>{crop.name}</option>
//                             ))}
//                         </select>
//                     </div>
//
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                             Сорт (опционально)
//                         </label>
//                         <select
//                             value={data.varietyID}
//                             onChange={(e) => setField("varietyID", e.target.value)}
//                             className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
//                             disabled={!data.cropID}
//                         >
//                             <option value="">Не выбран</option>
//                             {availableVarieties.map(variety => (
//                                 <option key={variety.id} value={variety.id}>
//                                     {variety.name} ({variety.daysToMaturity} дн.)
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>
//             </div>
//
//             <div>
//                 <label>Crop</label>
//
//                 <select
//                     {...register("cropID")}
//                 >
//                     <option value="">Select crop</option>
//                     <option value="crop-1">Tomato</option>
//                     <option value="crop-2">Cucumber</option>
//                 </select>
//
//                 {errors.cropID &&
//                     <p>{errors.cropID.message}</p>
//                 }
//             </div>
//
//             <hr/>
//
//             <h2>Allocations</h2>
//
//             {allocations.fields.map((field, index) => (
//                 <div
//                     key={field.id}
//                     style={{
//                         border: "1px solid #ccc",
//                         padding: 10,
//                         marginBottom: 10
//                     }}
//                 >
//
//                     <input
//                         placeholder="Production Unit ID"
//                         {...register(
//                             `allocations.${index}.productionUnitID`
//                         )}
//                     />
//
//                     <input
//                         type="number"
//                         step="0.01"
//                         {...register(
//                             `allocations.${index}.area`,
//                             {
//                                 valueAsNumber: true
//                             }
//                         )}
//                     />
//
//                     <input
//                         type="date"
//                         {...register(
//                             `allocations.${index}.startedAt`,
//                             {
//                                 valueAsDate: true
//                             }
//                         )}
//                     />
//
//                     <button
//                         type="button"
//                         onClick={() => allocations.remove(index)}
//                     >
//                         Remove
//                     </button>
//
//                 </div>
//             ))}
//
//             <button
//                 type="button"
//                 onClick={() =>
//                     allocations.append({
//                         productionUnitID: "",
//                         area: 0,
//                         startedAt: new Date()
//                     })
//                 }
//             >
//                 Add Allocation
//             </button>
//
//             <hr/>
//
//             <h2>Plantings</h2>
//
//             {plantings.fields.map((field, index) => (
//                 <div
//                     key={field.id}
//                     style={{
//                         border: "1px solid #ccc",
//                         padding: 10,
//                         marginBottom: 10
//                     }}
//                 >
//
//                     <input
//                         type="date"
//                         {...register(
//                             `plantings.${index}.plantedAt`,
//                             {
//                                 valueAsDate: true
//                             }
//                         )}
//                     />
//
//                     <input
//                         type="number"
//                         step="0.01"
//                         {...register(
//                             `plantings.${index}.quantity`,
//                             {
//                                 valueAsNumber: true
//                             }
//                         )}
//                     />
//
//                     <button
//                         type="button"
//                         onClick={() => plantings.remove(index)}
//                     >
//                         Remove
//                     </button>
//
//                 </div>
//             ))}
//
//             <button
//                 type="button"
//                 onClick={() =>
//                     plantings.append({
//                         plantedAt: new Date(),
//                         quantity: 0
//                     })
//                 }
//             >
//                 Add Planting
//             </button>
//
//             <hr/>
//
//             <button type="submit">
//                 Start Growing Cycle
//             </button>
//
//         </Modal>
//     )
// }