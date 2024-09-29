import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

function App() {
    const [userPosition, setUserPosition] = useState([41.2995, 69.2401]); // Toshkent, O'zbekiston
    const [destination, setDestination] = useState(null); // Tanlangan manzil
    const [routingControl, setRoutingControl] = useState(null); // Yo'l nazorat qilish uchun
    const [showChangeButton, setShowChangeButton] = useState(false); // Buttonni ko'rsatish uchun

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

    const updateLocation = () => {
        // Foydalanuvchining joylashuvini qayta olish
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserPosition([latitude, longitude]); // Lokatsiyani yangilash
                    setDestination(null); // Eski tanlangan manzilni tozalash
                    setShowChangeButton(false); // Buttonni yashirish

                    // Avvalgi marshrutni tozalash
                    if (routingControl) {
                        routingControl.getPlan().setWaypoints([]); // Yo'nalishni tozalash
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error.message);
                }
            );
        }
    };

    const MapClickHandler = () => {
        const map = useMap();

        const handleMapClick = (event) => {
            const { lat, lng } = event.latlng;

            // Yangi manzilni tanlash
            setDestination([lat, lng]);

            // Eski marshrutni tozalash
            if (routingControl) {
                routingControl.getPlan().setWaypoints([]); // Eski marshrutni olib tashlash
            }

            // Yangi marshrutni qo'shish
            const control = L.Routing.control({
                waypoints: [
                    L.latLng(userPosition[0], userPosition[1]),
                    L.latLng(lat, lng)
                ],
                routeWhileDragging: true,
                createMarker: () => null // Marker yaratmaslik
            }).addTo(map);

            setRoutingControl(control); // Marshrut nazoratini saqlash
        };

        useEffect(() => {
            map.on('click', handleMapClick);
            return () => {
                map.off('click', handleMapClick);
            };
        }, [map, userPosition]); // userPosition o'zgarganda marshrutni yangilash

        return null;
    };

    return (
        <div className="relative">
            <h1 className="text-center text-3xl font-bold">Mini Taksi Ilovasi</h1>
            <MapContainer 
                center={userPosition} 
                zoom={13} 
                style={{ height: "100vh", width: "100%" }} 
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker 
                    position={userPosition} 
                    icon={L.icon({ iconUrl: '/assets/marker.png', iconSize: [25, 41] })}
                    eventHandlers={{
                        click: () => {
                            // Markerga bosilganda buttonni ko'rsatish
                            setShowChangeButton(true);
                        }
                    }}
                >
                    <Popup>
                        Sizning joylashuvingiz: {userPosition[0].toFixed(4)}, {userPosition[1].toFixed(4)}.
                    </Popup>
                </Marker>
                {destination && (
                    <Marker position={destination} icon={L.icon({ iconUrl: '/assets/marker.png', iconSize: [25, 41] })}>
                        <Popup>
                            Tanlangan manzil: {destination[0].toFixed(4)}, {destination[1].toFixed(4)}.
                        </Popup>
                    </Marker>
                )}
                <MapClickHandler />
            </MapContainer>
            {showChangeButton && (
                <div className="absolute bottom-10 right-10">
                    <button 
                        onClick={updateLocation} // Joylashuvni yangilash
                        className="bg-blue-600 text-white px-6 py-3 rounded shadow-md hover:bg-blue-700 transition duration-300"
                    >
                        Joylashuvni yangilash
                    </button>
                </div>
            )}
            {destination && (
                <div className="absolute bottom-20 right-10">
                    <button 
                        onClick={() => alert(`Taksi manzilga yo'l oldi: ${destination[0].toFixed(4)}, ${destination[1].toFixed(4)}`)} 
                        className="bg-green-600 text-white px-6 py-3 rounded shadow-md hover:bg-green-700 transition duration-300"
                    >
                        Taksi chaqirish
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
