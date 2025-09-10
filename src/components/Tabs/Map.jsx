import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const mockNodeLocations = [
  { id: 'KD1MU-ROOF', name: 'Roof Node', lat: 42.3319, lng: -71.1212 },
  { id: 'KD1MU-BASE', name: 'Base Node', lat: 42.3325, lng: -71.1200 },
];

function MapView() {
  return (
    <MapContainer center={[42.3319, -71.1212]} zoom={15} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mockNodeLocations.map(node => (
        <Marker key={node.id} position={[node.lat, node.lng]}>
          <Popup>
            <strong>{node.name}</strong><br />
            ID: {node.id}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;
