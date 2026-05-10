export interface Season {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: 'planning' | 'current' | 'completed' ;
    description?: string;
}
