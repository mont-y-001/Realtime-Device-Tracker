const socket = io();
let myId = null;
const markers = {};

socket.on("your-id", (id) => {
    myId = id;
});

// Initialize map
const map = L.map("map").setView([20.5937, 78.9629], 5); // Default: India center

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Watch geolocation
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
} else {
    alert("Geolocation is not supported by your browser.");
}

// Receive location updates
socket.on("receive-location", ({ id, latitude, longitude }) => {
    if (id === myId) {
        map.setView([latitude, longitude], 16);
    }

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(id === myId ? "You" : `User: ${id.substring(0, 5)}`)
            .openPopup();
    }
});

// Handle user disconnect
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
