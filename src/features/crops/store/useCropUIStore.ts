import {create} from "zustand"

interface CropUIState  {

    selectedCropTypeId: string | null
    setSelectedCropTypeId: (id: string) => void,
}


export const useCropUIStore = create<CropUIState>((set) => ({
    selectedCropTypeId: null,
    setSelectedCropTypeId: (id: string) => set({selectedCropTypeId: id}),
}));