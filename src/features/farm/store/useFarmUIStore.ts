import {create} from "zustand";

export const useFarmUIStore = create<{
    selectedObjectId: string | null;
    mapCenter: [number, number] | null;
    setSelectedObjectId: (id: string | null) => void;
    setMapCenter: (center: [number, number]) => void;
}>((set) => ({
    selectedObjectId: null,
    mapCenter: null,
    setSelectedObjectId: (id) => set({selectedObjectId: id}),
    setMapCenter: (center) => set({mapCenter: center}),
}));