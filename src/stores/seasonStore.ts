import {create} from "zustand";
import {persist} from "zustand/middleware";

interface SeasonStore {
    currentSeasonId: string | null;
    setCurrentSeasonId: (id: string | null) => void;
}

export const useSeasonStore = create<SeasonStore>()(
    persist(
        (set) => ({
            currentSeasonId: null,
            setCurrentSeasonId: (id) => set({currentSeasonId: id}),
        }),
        {name: 'season-storage'}
    ));