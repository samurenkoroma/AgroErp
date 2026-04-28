import {create} from "zustand";

export const useSeasonUIStore = create<{
    selectedSeasonId: string | null;
    setSelectedSeasonId: (id: string | null) => void;
}>((set) => ({
    selectedSeasonId: null,
    setSelectedSeasonId: (id) => set({selectedSeasonId: id}),
}));