import React from 'react';
import { Popup } from 'react-leaflet';
import L from 'leaflet'; // Importação necessária para redefinir o ícone padrão
import markerIcon from 'leaflet/dist/images/marker-icon.png'; // Ícone padrão
import markerShadow from 'leaflet/dist/images/marker-shadow.png'; // Sombra do ícone
export const Pin = () => {


const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconAnchor: [12, 41], // Ajuste do ponto de ancoragem para posicionar corretamente no mapa
  });
  L.Marker.prototype.options.icon = DefaultIcon;



    return (
        <Popup style={{ background: "#fff" }}>
            <h3>Caçamba: 123</h3>
            <span>Areia - Vazio</span>
        </Popup>
    );
};
