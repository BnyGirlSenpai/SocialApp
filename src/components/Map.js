import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const Map = () => {

  //const MAPTILER_KEY = 'get_your_own_OpIi9ZULNHzrESv6T2vL';

  const mapContainer = useRef(null);
  const map = useRef(null)

  useEffect(() => {
    if(map.curernt) return;

    map.current = new maplibregl.Map({
        style: `https://maps.hstin.de/styles/hstin-dark-3d-v0`,
        center: [12.550343, 55.665957],
        zoom: 15.5,
        pitch: 45,
        bearing: -17.6,
        container: mapContainer.current,
        antialias: true,   
        attributionControl: false 
    });
    
    let geoControls = new maplibregl.GeolocateControl({
          positionOptions: {
              enableHighAccuracy: true
          },
          trackUserLocation: true
      })

    map.current.addControl(geoControls)

    map.current.on('load', () => {
      geoControls.trigger()
    })
  },[]);

  return (
    <div style={{ height: '100vh' }}>
      <div ref={mapContainer} style={{ height: '100%' }}></div>
    </div>
  );
};

export default Map;


