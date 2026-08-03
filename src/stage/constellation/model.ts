export interface ConstellationPoint {
    x: number;
    y: number;
}

export interface Constellation {
    label: string;
    points: ConstellationPoint[];
    runLabel: string;
}
