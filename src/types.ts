
// Inventory types
export type InventoryCategory = 'fertilizer' | 'seeds' | 'pesticides' | 'fuel' | 'equipment';
export type InventoryStatus = 'good' | 'low' | 'critical';
export interface InventoryItem {
    id: number;
    name: string;
    category: InventoryCategory;
    quantity: number;
    unit: string;
    minLevel: number;
    maxCapacity: number;
    location: string;
    supplier: string;
    lastRestocked: string;
    cost: number;
    status: InventoryStatus;
}


// Equipment types
export type EquipmentStatus = 'operational' | 'maintenance' | 'repair' | 'idle';
export interface Equipment {
    id: number;
    name: string;
    type: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    purchaseDate: string;
    location: string;
    status: EquipmentStatus;
    hoursUsed: number;
    nextMaintenance: string;
    assignedTo: string;
    image: string;
    condition: number;
}

// Activity types
export type ActivityType = 'info' | 'success' | 'warning';
export interface Activity {
    id: number;
    title: string;
    description: string;
    time: string;
    type: ActivityType;
}


// Task types
export interface Task {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    status: 'completed' | 'in-progress' | 'planned';
    priority: 'high' | 'medium' | 'low';
    assignedTo: string;
    cropName?: string;
    fieldName?: string;
}

// Planning types
export interface PlantingPlan {
    id: number;
    cropId: number;
    cropName: string;
    fieldId: number;
    fieldName: string;
    area: number;
    plantingDate: string;
    expectedHarvestDate: string;
    seedsPerHectare: number;
    fertilizer: string;
    notes: string;
}


// Task types
export type TaskStatus = 'planned' | 'in-progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';
export interface Task {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: string;
    cropName?: string;
    fieldName?: string;
}

// Planting Plan types
export interface PlantingPlan {
    id: number;
    cropId: number;
    cropName: string;
    fieldId: number;
    fieldName: string;
    area: number;
    plantingDate: string;
    expectedHarvestDate: string;
    seedsPerHectare: number;
    fertilizer: string;
    notes: string;
}