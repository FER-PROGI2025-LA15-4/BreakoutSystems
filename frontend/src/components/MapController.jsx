import {useMap} from "react-leaflet";
import {useEffect} from "react";

export default function MapController({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (!map) return;
        map.setView(center, zoom);
    }, [center, zoom]);
    return null;
}
