export interface SlotPosition {
    x: number;
    y: number;
    z?: number;
}

export interface Slot {
    id: string;
    productionUnitId: string;
    position: SlotPosition;
    capacity: number;
}