import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import "./styles/main.scss"
import "react-image-gallery/styles/css/image-gallery.css";
import "leaflet/dist/leaflet.css";

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25,41],
    iconAnchor: [12,41]
});
L.Marker.prototype.options.icon = DefaultIcon;


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
