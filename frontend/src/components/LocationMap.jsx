import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { reverseGeocode } from "../api/geocoding";

// Vite ne résout pas les icônes par défaut de Leaflet (chemins relatifs cassés
// par le bundler) : on les redéclare explicitement à partir des assets importés.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const PARIS_CENTER = [48.8566, 2.3522];

function RecenterOnChange({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lon], map.getZoom());
    }
  }, [position, map]);

  return null;
}

function ClickHandler({ onLocationChange }) {
  useMapEvents({
    async click(event) {
      const { lat, lng } = event.latlng;
      try {
        const result = await reverseGeocode(lat, lng);
        onLocationChange({
          lat,
          lon: lng,
          postcode: result?.postcode ?? null,
          label: result?.label ?? null,
        });
      } catch {
        // Reverse geocoding failed (ex. hors de France) : on garde quand même
        // les coordonnées cliquées, l'utilisateur devra saisir le code postal.
        onLocationChange({ lat, lon: lng, postcode: null, label: null });
      }
    },
  });

  return null;
}

export default function LocationMap({ position, onLocationChange }) {
  return (
    <div className="location-map">
      <MapContainer center={PARIS_CENTER} zoom={12} style={{ height: "320px", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onLocationChange={onLocationChange} />
        <RecenterOnChange position={position} />
        {position && <Marker position={[position.lat, position.lon]} />}
      </MapContainer>
      <p className="map-hint">Cliquez sur la carte pour choisir précisément l'emplacement.</p>
    </div>
  );
}
