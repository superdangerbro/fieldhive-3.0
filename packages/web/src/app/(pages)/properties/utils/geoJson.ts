import { Feature, Polygon, FeatureCollection } from 'geojson';

export const formatGeoJsonCoordinates = (coordinates: any[][]): number[][] => {
  return coordinates.map(coord => [
    Number(coord[0].toString().split('.')[0] + '.' + coord[0].toString().split('.')[1]),
    Number(coord[1].toString().split('.')[0] + '.' + coord[1].toString().split('.')[1])
  ]);
};

export const createPolygonFeature = (coordinates: number[][]): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      },
      properties: {}
    }]
  };
};
