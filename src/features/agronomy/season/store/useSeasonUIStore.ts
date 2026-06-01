import {create} from "zustand";
import {Season} from "@/entities/agronomy/season";

export const useSeasonUIStore = create<{
    seasons: Season[];
    setSeasons: (seasons: Season[]) => void;
    selectedSeasonId: string | null;
    setSelectedSeasonId: (id: string | null) => void;
}>((set) => ({
    seasons: [],
    setSeasons: (seasons: Season[]) => {
        set({seasons});
    },
    selectedSeasonId: null,
    setSelectedSeasonId: (id) => set({selectedSeasonId: id}),
}));