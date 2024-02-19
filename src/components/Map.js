import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';

const Map = () => {
  useEffect(() => {

    const map = new maplibregl.Map({
      style: `https://cdn.better-weather.com/themes/light_complete_3d.json`,
      center: [-74.0066, 40.7135],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: 'map',
      antialias: true
    });

    map.addControl(
      new maplibregl.GeolocateControl({
          positionOptions: {
              enableHighAccuracy: true
          },
          trackUserLocation: true
      })
    );

    map.on('load', () => {
    })

    /*map.on('load', () => {
      const layers = map.getStyle().layers;

      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      map.addSource('openmaptiles', {
        url: `https://cdn.better-weather.com/themes/dark_complete_3d.json`,
        type: 'vector'
      });

      map.addLayer(
        {
          id: '3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['get', 'render_height'], 0, 'lightgray', 200, 'royalblue', 400, 'lightblue'
            ],
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              16,
              ['get', 'render_height']
            ],
            'fill-extrusion-base': [
              'case',
              ['>=', ['get', 'zoom'], 16],
              ['get', 'render_min_height'],
              0
            ]
          }
        },
        labelLayerId
      );
    });*/
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <div id="map" style={{ height: '100%' }}></div>
    </div>
  );
};

export default Map;
