import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

function App() {
    const [userPosition, setUserPosition] = useState([41.2995, 69.2401]); // Dastlabki joylashuv: Toshkent, O'zbekiston
    const [destination, setDestination] = useState(null);
    
    useEffect(() => {
        // Foydalanuvchining joylashuvini olish
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserPosition([latitude, longitude]);
                },
                (error) => {
                    console.error("Geolocation error:", error.message);
                }
            );
        }
    }, []);

    const MapClickHandler = () => {
        const map = useMap();

        const handleMapClick = (event) => {
            const { lat, lng } = event.latlng;

            // Agar allaqachon manzil tanlangan bo'lsa, uni o'chirish
            if (destination) {
                setDestination(null); // Avvalgi manzilni o'chiradi
            }
            
            // Yangi manzilni tanlash
            setDestination([lat, lng]);

            // Har bir marta yangi manzil tanlanganda avvalgi marshrutni tozalash
            map.eachLayer((layer) => {
                if (layer instanceof L.Routing.Control) {
                    map.removeControl(layer);
                }
            });

            // Yangi marshrutni qo'shish
            L.Routing.control({
                waypoints: [
                    L.latLng(userPosition[0], userPosition[1]),
                    L.latLng(lat, lng)
                ],
                routeWhileDragging: true,
            }).addTo(map);
        };
        

        useEffect(() => {
            map.on('click', handleMapClick);
            return () => {
                map.off('click', handleMapClick);
            };
        }, [map]);

        return null;
    };

    return (
        <div>
            <h1 className="text-center text-2xl font-bold">Mini Taksi Ilovasi</h1>
            <MapContainer 
                center={userPosition} 
                zoom={13} 
                style={{ height: "100vh", width: "100%" }} 
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={userPosition} >
                    <Popup>
                        Sizning joylashuvingiz: {userPosition[0].toFixed(4)}, {userPosition[1].toFixed(4)}.
                    </Popup>
                </Marker>
                {destination && (
                    <Marker position={destination}>
                        <Popup>
                            Tanlangan manzil: {destination[0].toFixed(4)}, {destination[1].toFixed(4)}.
                        </Popup>
                    </Marker>
                )}
                <MapClickHandler />
            </MapContainer>
            {destination && (
                <div className="text-center mt-4">
                    <button 
                        onClick={() => alert(`Taksi manzilga yo'l oldi: ${destination[0].toFixed(4)}, ${destination[1].toFixed(4)}`)} 
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Taksi chaqirish
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
