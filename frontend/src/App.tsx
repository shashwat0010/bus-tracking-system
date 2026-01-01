import { useEffect, useState, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore
import HeatmapOverlay from 'leaflet.heat';
import { io, Socket } from 'socket.io-client';

interface BusLocation {
    busId: string;
    routeId: string;
    latitude: number;
    longitude: number;
    speed: number;
    passengers: number;
    timestamp: number;
}

interface Route {
    id: string;
    name: string;
    path: {
        type: string;
        coordinates: [number, number][];
    };
    color: string;
}

function App() {
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<Map<string, L.Marker>>(new Map());
    const stopMarkersRef = useRef<L.Marker[]>([]);
    const routeLinesRef = useRef<Map<string, L.Polyline>>(new Map());

    const [socket, setSocket] = useState<Socket | null>(null);
    const [buses, setBuses] = useState<Map<string, BusLocation>>(new Map());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
    const [showRoutes, setShowRoutes] = useState(true);
    const [loading, setLoading] = useState(true);

    // Filtered buses based on search
    const filteredBuses = useMemo(() => {
        const busList = Array.from(buses.values());
        if (!searchQuery) return busList;
        return busList.filter(bus =>
            bus.busId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bus.routeId.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [buses, searchQuery]);

    // Update marker or create new one
    const updateBusMarker = (data: BusLocation) => {
        if (!mapRef.current) return;

        let marker = markersRef.current.get(data.busId);

        if (!marker) {
            const icon = L.divIcon({
                className: 'bus-marker-container',
                html: `
          <div class="bus-pulse"></div>
          <div class="bus-marker-icon">🚌</div>
          <div class="bus-marker-label">${data.busId}</div>
        `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            marker = L.marker([data.latitude, data.longitude], { icon })
                .bindPopup(`
          <div class="bus-details">
            <h4>Bus ${data.busId}</h4>
            <p><strong>Route:</strong> ${data.routeId}</p>
            <p><strong>Speed:</strong> ${data.speed.toFixed(1)} km/h</p>
            <p><strong>Position:</strong> ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}</p>
          </div>
        `)
                .addTo(mapRef.current);

            markersRef.current.set(data.busId, marker);
        } else {
            marker.setLatLng([data.latitude, data.longitude]);
            marker.setPopupContent(`
        <div class="bus-details">
          <h4>Bus ${data.busId}</h4>
          <p><strong>Route:</strong> ${data.routeId}</p>
          <p><strong>Speed:</strong> ${data.speed.toFixed(1)} km/h</p>
          <p><strong>Position:</strong> ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}</p>
        </div>
      `);
        }
    };

    const updateBusMarkerRef = useRef(updateBusMarker);
    updateBusMarkerRef.current = updateBusMarker;

    useEffect(() => {
        let isMounted = true;

        // Initialize map
        const map = L.map('map', {
            zoomControl: false, // We'll use our own or just keep it clean
            attributionControl: false
        }).setView([12.9716, 77.5946], 13); // Bengaluru

        // Using a dark themed tile layer for premium look
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        L.control.attribution({ position: 'bottomright' }).addTo(map);
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapRef.current = map;

        // Fetch routes
        fetch('/api/routes')
            .then(res => res.json())
            .then((routes: Route[]) => {
                if (!isMounted) return;

                routes.forEach(route => {
                    if (route.path && route.path.coordinates) {
                        const latLngs = route.path.coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
                        const polyline = L.polyline(latLngs, {
                            color: route.color,
                            weight: 3,
                            opacity: 0.6,
                            lineJoin: 'round'
                        });

                        if (showRoutes) {
                            polyline.addTo(map);
                        }

                        routeLinesRef.current.set(route.id, polyline);
                    }
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch routes:', err);
                if (isMounted) setLoading(false);
            });

        // Connect to Socket.IO
        const newSocket = io('http://localhost:3000');

        newSocket.on('connect', () => {
            console.log('Connected to server');
            setSocket(newSocket);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setSocket(null);
        });

        newSocket.on('busUpdate', (data: BusLocation) => {
            updateBusMarkerRef.current(data);

            // Update state for sidebar
            setBuses(prev => {
                const next = new Map(prev);
                next.set(data.busId, data);
                return next;
            });
        });

        // Fetch stops
        fetch('/api/stops')
            .then(res => res.json())
            .then((stops: any[]) => {
                if (!isMounted) return;
                stops.forEach(stop => {
                    const icon = L.divIcon({
                        className: 'stop-marker',
                        html: `<div class="stop-dot"></div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6]
                    });
                    const marker = L.marker([stop.location.coordinates[1], stop.location.coordinates[0]], { icon })
                        .bindPopup(`<strong>Stop:</strong> ${stop.name}`)
                        .addTo(map);
                    stopMarkersRef.current.push(marker);
                });
            });

        return () => {
            isMounted = false;
            newSocket.close();
            map.remove();
            mapRef.current = null;
            markersRef.current.clear();
            routeLinesRef.current.clear();
        };
    }, []);

    // Effect for routes toggle
    useEffect(() => {
        if (!mapRef.current) return;

        routeLinesRef.current.forEach(line => {
            if (showRoutes) {
                if (mapRef.current && !mapRef.current.hasLayer(line)) {
                    line.addTo(mapRef.current);
                }
            } else {
                if (mapRef.current && mapRef.current.hasLayer(line)) {
                    mapRef.current.removeLayer(line);
                }
            }
        });
    }, [showRoutes]);

    const handleBusClick = (bus: BusLocation) => {
        setSelectedBusId(bus.busId);
        if (mapRef.current) {
            mapRef.current.flyTo([bus.latitude, bus.longitude], 15, {
                duration: 1.5
            });
            const marker = markersRef.current.get(bus.busId);
            if (marker) {
                marker.openPopup();
            }
        }
    };

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1><span>🚌</span> BusTracker Pro</h1>
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search bus or route..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bus-list">
                    {filteredBuses.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                            No active buses found
                        </div>
                    )}
                    {filteredBuses.map(bus => (
                        <div
                            key={bus.busId}
                            className={`bus-card ${selectedBusId === bus.busId ? 'active' : ''}`}
                            onClick={() => handleBusClick(bus)}
                        >
                            <div className="bus-card-header">
                                <span className="bus-id">{bus.busId}</span>
                                <span className="bus-route">{bus.routeId}</span>
                            </div>
                            <div className="bus-stats">
                                <div className="stat-item">
                                    <span>⚡</span>
                                    <span>{bus.speed.toFixed(0)} km/h</span>
                                </div>
                                <div className="stat-item">
                                    <span>👥</span>
                                    <span>{bus.passengers} pax</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            <main className="main-content">
                <div id="map" className="leaflet-container"></div>

                <div className="overlay-controls">
                    <div className="glass-panel">
                        <h3 className="panel-title">Map Layers</h3>
                        <div className="control-group">
                            <label className="toggle-item">
                                <span className="toggle-label">Routes</span>
                                <div className="switch">
                                    <input
                                        type="checkbox"
                                        checked={showRoutes}
                                        onChange={(e) => setShowRoutes(e.target.checked)}
                                    />
                                    <span className="slider"></span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="status-badge">
                    <div className={`indicator ${socket?.connected ? 'online' : ''}`}></div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {socket?.connected ? 'Live System Active' : 'System Offline'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                        • {buses.size} Buses
                    </span>
                </div>

                {loading && (
                    <div className="loading">
                        <div className="spinner"></div>
                        Initializing Map...
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;

