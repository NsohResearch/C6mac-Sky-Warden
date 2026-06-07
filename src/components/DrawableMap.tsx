import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import area from "@turf/area";
import length from "@turf/length";

export type DrawableShape =
  | { kind: "polygon"; geojson: GeoJSON.Feature<GeoJSON.Polygon>; area_sq_m: number }
  | { kind: "circle"; center: [number, number]; radius_m: number; geojson: GeoJSON.Feature<GeoJSON.Polygon>; area_sq_m: number }
  | { kind: "polyline"; geojson: GeoJSON.Feature<GeoJSON.LineString>; length_m: number; points: Array<{ lat: number; lng: number }> }
  | { kind: "marker"; lat: number; lng: number };

export interface DrawableMapProps {
  /** Initial map center [lat, lng]. */
  center?: [number, number];
  zoom?: number;
  height?: string;
  /** Which draw tools to expose. Defaults to all. */
  tools?: Array<"polygon" | "rectangle" | "circle" | "polyline" | "marker">;
  /** Existing shapes to render (read-only overlays, won't be exported on change). */
  overlays?: Array<{
    type: "polygon" | "polyline" | "marker" | "circle";
    geojson?: any;
    latlngs?: any;
    latlng?: [number, number];
    radius?: number;
    color?: string;
    fillOpacity?: number;
    label?: string;
  }>;
  /** Called whenever the editable layer set changes. */
  onChange?: (shapes: DrawableShape[]) => void;
  /** Initial editable shapes to seed. */
  initialShapes?: DrawableShape[];
  className?: string;
}

function circleToPolygon(lat: number, lng: number, radiusM: number, steps = 64): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const R = 6378137;
  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 2 * Math.PI;
    const lat1 = (lat * Math.PI) / 180;
    const lon1 = (lng * Math.PI) / 180;
    const d = radiusM / R;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(bearing));
    const lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
    coords.push([(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
  }
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [coords] } };
}

export default function DrawableMap({
  center = [40.7128, -74.006],
  zoom = 12,
  height = "500px",
  tools = ["polygon", "rectangle", "circle", "polyline", "marker"],
  overlays = [],
  onChange,
  initialShapes,
  className = "",
}: DrawableMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const drawLayerRef = useRef<L.FeatureGroup | null>(null);
  const overlayLayerRef = useRef<L.FeatureGroup | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center,
      zoom,
      preferCanvas: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    const drawLayer = new L.FeatureGroup().addTo(map);
    drawLayerRef.current = drawLayer;
    const overlayLayer = new L.FeatureGroup().addTo(map);
    overlayLayerRef.current = overlayLayer;

    // Geoman draw controls with touch support
    (map as any).pm.addControls({
      position: "topright",
      drawPolygon: tools.includes("polygon"),
      drawRectangle: tools.includes("rectangle"),
      drawCircle: tools.includes("circle"),
      drawPolyline: tools.includes("polyline"),
      drawMarker: tools.includes("marker"),
      drawCircleMarker: false,
      drawText: false,
      editMode: true,
      dragMode: true,
      cutPolygon: tools.includes("polygon"),
      removalMode: true,
      rotateMode: true,
    });

    (map as any).pm.setGlobalOptions({
      snappable: true,
      snapDistance: 20,
      allowSelfIntersection: false,
      finishOn: "dblclick",
      continueDrawing: false,
      layerGroup: drawLayer,
    });

    const exportShapes = () => {
      const shapes: DrawableShape[] = [];
      drawLayer.eachLayer((layer: any) => {
        if (layer instanceof L.Circle) {
          const c = layer.getLatLng();
          const r = layer.getRadius();
          const geo = circleToPolygon(c.lat, c.lng, r);
          shapes.push({
            kind: "circle",
            center: [c.lat, c.lng],
            radius_m: r,
            geojson: geo,
            area_sq_m: area(geo as any),
          });
        } else if (layer instanceof L.Polygon) {
          const geo = layer.toGeoJSON() as GeoJSON.Feature<GeoJSON.Polygon>;
          shapes.push({ kind: "polygon", geojson: geo, area_sq_m: area(geo as any) });
        } else if (layer instanceof L.Polyline) {
          const geo = layer.toGeoJSON() as GeoJSON.Feature<GeoJSON.LineString>;
          const pts = (layer.getLatLngs() as L.LatLng[]).map((p) => ({ lat: p.lat, lng: p.lng }));
          shapes.push({ kind: "polyline", geojson: geo, length_m: length(geo as any, { units: "meters" }), points: pts });
        } else if (layer instanceof L.Marker) {
          const p = layer.getLatLng();
          shapes.push({ kind: "marker", lat: p.lat, lng: p.lng });
        }
      });
      onChangeRef.current?.(shapes);
    };

    map.on("pm:create", (e: any) => {
      drawLayer.addLayer(e.layer);
      e.layer.on("pm:edit pm:dragend pm:rotateend pm:cut", exportShapes);
      e.layer.on("pm:remove", () => setTimeout(exportShapes, 0));
      exportShapes();
    });
    map.on("pm:remove", () => setTimeout(exportShapes, 0));
    map.on("pm:cut", exportShapes);

    // Seed initial shapes
    if (initialShapes) {
      for (const s of initialShapes) {
        if (s.kind === "polygon") L.geoJSON(s.geojson).eachLayer((l) => drawLayer.addLayer(l));
        else if (s.kind === "circle") L.circle(s.center, { radius: s.radius_m }).addTo(drawLayer);
        else if (s.kind === "polyline") L.geoJSON(s.geojson).eachLayer((l) => drawLayer.addLayer(l));
        else if (s.kind === "marker") L.marker([s.lat, s.lng]).addTo(drawLayer);
      }
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render overlays when prop changes
  useEffect(() => {
    if (!overlayLayerRef.current || !mapRef.current) return;
    overlayLayerRef.current.clearLayers();
    for (const ov of overlays) {
      try {
        const style = { color: ov.color ?? "#3B82F6", fillOpacity: ov.fillOpacity ?? 0.15, weight: 2 };
        if (ov.type === "polygon" && ov.geojson) {
          const layer = L.geoJSON(ov.geojson, { style: () => style });
          if (ov.label) layer.bindTooltip(ov.label, { sticky: true });
          layer.addTo(overlayLayerRef.current!);
        } else if (ov.type === "polyline" && ov.geojson) {
          L.geoJSON(ov.geojson, { style: () => ({ color: style.color, weight: 3 }) }).addTo(overlayLayerRef.current!);
        } else if (ov.type === "marker" && ov.latlng) {
          const m = L.marker(ov.latlng);
          if (ov.label) m.bindTooltip(ov.label);
          m.addTo(overlayLayerRef.current!);
        } else if (ov.type === "circle" && ov.latlng && ov.radius) {
          L.circle(ov.latlng, { radius: ov.radius, ...style }).addTo(overlayLayerRef.current!);
        }
      } catch (e) {
        console.warn("Overlay render failed", e);
      }
    }
  }, [overlays]);

  return (
    <div
      ref={containerRef}
      className={`rounded-lg border border-border overflow-hidden ${className}`}
      style={{ height, width: "100%", touchAction: "none" }}
    />
  );
}
