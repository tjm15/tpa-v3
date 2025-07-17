import * as turf from '@turf/turf';
import type { Feature, Polygon, Point } from 'geojson';

export interface SpatialIntersection {
  layerName: string;
  feature: GeoJSON.Feature;
  intersectionType: 'contains' | 'intersects' | 'within';
  area?: number; // in hectares
  percentage?: number; // percentage of site area
}

export interface ProximityResult {
  layerName: string;
  feature: GeoJSON.Feature;
  distance: number; // in meters
  bearing?: number; // degrees from north
}

export class SpatialAnalyzer {
  /**
   * Find all features that intersect with a given polygon
   */
  findIntersections(
    sitePolygon: GeoJSON.Polygon,
    layers: {
      name: string;
      features: GeoJSON.Feature[];
    }[]
  ): SpatialIntersection[] {
    const site = turf.polygon(sitePolygon.coordinates);
    const siteArea = turf.area(site) / 10000; // Convert to hectares
    const intersections: SpatialIntersection[] = [];

    for (const layer of layers) {
      for (const feature of layer.features) {
        try {
          const intersection = this.analyzeIntersection(site, feature, layer.name, siteArea);
          if (intersection) {
            intersections.push(intersection);
          }
        } catch (error) {
          console.warn(`Failed to analyze intersection for layer ${layer.name}:`, error);
        }
      }
    }

    return intersections;
  }

  private analyzeIntersection(
    site: Feature<Polygon>,
    feature: GeoJSON.Feature,
    layerName: string,
    siteArea: number
  ): SpatialIntersection | null {
    if (!feature.geometry) return null;

    const featureGeom = feature.geometry;
    let intersectionType: 'contains' | 'intersects' | 'within' | null = null;
    let intersectionArea: number | undefined;
    let percentage: number | undefined;

    // Check different types of spatial relationships
    if (featureGeom.type === 'Polygon' || featureGeom.type === 'MultiPolygon') {
      const featurePoly = turf.feature(featureGeom);
      
      if (turf.booleanContains(site, featurePoly)) {
        intersectionType = 'contains';
        intersectionArea = turf.area(featurePoly) / 10000; // hectares
      } else if (turf.booleanWithin(site, featurePoly)) {
        intersectionType = 'within';
        intersectionArea = siteArea;
      } else if (turf.booleanIntersects(site, featurePoly)) {
        intersectionType = 'intersects';
        try {
          const intersection = turf.intersect(site as any, featurePoly as any);
          if (intersection) {
            intersectionArea = turf.area(intersection) / 10000; // hectares
          }
        } catch (error) {
          console.warn('Failed to calculate intersection area:', error);
        }
      }
    } else if (featureGeom.type === 'Point') {
      const point = turf.point(featureGeom.coordinates);
      if (turf.booleanPointInPolygon(point, site)) {
        intersectionType = 'contains';
      }
    } else if (featureGeom.type === 'LineString' || featureGeom.type === 'MultiLineString') {
      const line = turf.feature(featureGeom);
      if (turf.booleanIntersects(site, line)) {
        intersectionType = 'intersects';
      }
    }

    if (intersectionType) {
      percentage = intersectionArea ? (intersectionArea / siteArea) * 100 : undefined;
      
      return {
        layerName,
        feature,
        intersectionType,
        area: intersectionArea,
        percentage
      };
    }

    return null;
  }

  /**
   * Find nearest features to a site within a given distance
   */
  findProximity(
    sitePolygon: GeoJSON.Polygon,
    layers: {
      name: string;
      features: GeoJSON.Feature[];
    }[],
    maxDistance: number = 1000 // meters
  ): ProximityResult[] {
    const site = turf.polygon(sitePolygon.coordinates);
    const siteCentroid = turf.centroid(site);
    const proximityResults: ProximityResult[] = [];

    for (const layer of layers) {
      for (const feature of layer.features) {
        try {
          const result = this.analyzeProximity(siteCentroid, feature, layer.name, maxDistance);
          if (result) {
            proximityResults.push(result);
          }
        } catch (error) {
          console.warn(`Failed to analyze proximity for layer ${layer.name}:`, error);
        }
      }
    }

    // Sort by distance (closest first)
    return proximityResults.sort((a, b) => a.distance - b.distance);
  }

  private analyzeProximity(
    siteCentroid: Feature<Point>,
    feature: GeoJSON.Feature,
    layerName: string,
    maxDistance: number
  ): ProximityResult | null {
    if (!feature.geometry) return null;

    let nearestPoint: Feature<Point>;
    
    // Get nearest point on feature
    if (feature.geometry.type === 'Point') {
      nearestPoint = turf.point(feature.geometry.coordinates);
    } else {
      // For non-point features, get the nearest point
      const pointsCollection = turf.explode(feature);
      nearestPoint = turf.nearestPoint(siteCentroid, pointsCollection);
    }

    const distance = turf.distance(siteCentroid, nearestPoint, { units: 'meters' });
    
    if (distance <= maxDistance) {
      const bearing = turf.bearing(siteCentroid, nearestPoint);
      
      return {
        layerName,
        feature,
        distance,
        bearing
      };
    }

    return null;
  }

  /**
   * Calculate area of a polygon in hectares
   */
  calculateArea(polygon: GeoJSON.Polygon): number {
    const poly = turf.polygon(polygon.coordinates);
    return turf.area(poly) / 10000; // Convert to hectares
  }

  /**
   * Calculate perimeter of a polygon in meters
   */
  calculatePerimeter(polygon: GeoJSON.Polygon): number {
    const poly = turf.polygon(polygon.coordinates);
    return turf.length(turf.polygonToLine(poly), { units: 'meters' });
  }

  /**
   * Get centroid of a polygon
   */
  getCentroid(polygon: GeoJSON.Polygon): [number, number] {
    const poly = turf.polygon(polygon.coordinates);
    const centroid = turf.centroid(poly);
    return centroid.geometry.coordinates as [number, number];
  }

  /**
   * Check if a point is within a polygon
   */
  isPointInPolygon(point: [number, number], polygon: GeoJSON.Polygon): boolean {
    const pt = turf.point(point);
    const poly = turf.polygon(polygon.coordinates);
    return turf.booleanPointInPolygon(pt, poly);
  }

  /**
   * Create a buffer around a polygon
   */
  createBuffer(polygon: GeoJSON.Polygon, distance: number): GeoJSON.Polygon {
    const poly = turf.polygon(polygon.coordinates);
    const buffered = turf.buffer(poly, distance, { units: 'meters' });
    if (!buffered || !buffered.geometry) {
      throw new Error('Failed to create buffer');
    }
    return buffered.geometry as GeoJSON.Polygon;
  }
}

export const spatialAnalyzer = new SpatialAnalyzer();
