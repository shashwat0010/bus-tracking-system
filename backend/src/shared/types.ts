export interface BusLocation {
    busId: string;
    routeId: string;
    latitude: number;
    longitude: number;
    speed: number;
    passengers: number;
    timestamp: number;
}

export interface RouteConfig {
    id: string;
    name: string;
    path: [number, number][]; // Array of [lat, lng]
    stops: { id: string; name: string; location: [number, number] }[];
}
