export default function calculateMapCenterZoom(coords) {
    // default center and zoom for Croatia
    let center = [45, 16.5];
    let zoom = 7;
    if (!coords || coords.length === 0) {
        return { center, zoom };
    }

    // calculate center as average of all coordinates
    let geo_lat = 0;
    let geo_long = 0;
    for (let [lat, long] of coords) {
        geo_lat += lat;
        geo_long += long;
    }
    geo_lat = geo_lat / coords.length;
    geo_long = geo_long / coords.length;

    // set placeholder zoom level (maybe improve later to calculate based on spread of coordinates)
    let zoom_level = 8;

    return { center: [geo_lat, geo_long], zoom: zoom_level };
}