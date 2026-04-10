import { useEffect, useRef, useState } from "react";
import esriConfig from "@arcgis/core/config";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import Basemap from "@arcgis/core/Basemap";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import PopupTemplate from "@arcgis/core/PopupTemplate";

// Use the ArcGIS CDN for assets so we don't need to copy them locally
esriConfig.assetsPath = "https://js.arcgis.com/4.29/@arcgis/core/assets";

interface RawParcel {
  FID: number;
  TAX_MAP: string;
  PARCEL_NUM: string;
  STREET_NUM: string;
  STREET_NAM: string;
  LOCATION: string;
  NOTES: string;
  STRATEGY: string;
  DISPLAY: string;
  District: number;
  CALC_ACRE: number;
  SQ_FT: number;
  lat: number;
  lon: number;
}

export default function CityMap() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [parcelCount, setParcelCount] = useState(0);
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    if (!mapDivRef.current) return;

    const graphicsLayer = new GraphicsLayer({ title: "Vacant Lots" });

    // CartoDB light tiles — free, no API key, no usage-policy blocks
    const cartoLayer = new WebTileLayer({
      urlTemplate: "https://{subDomain}.basemaps.cartocdn.com/light_all/{level}/{col}/{row}.png",
      subDomains: ["a", "b", "c", "d"],
      copyright: "© OpenStreetMap contributors © CARTO",
    });

    const basemap = new Basemap({ baseLayers: [cartoLayer] });

    const map = new Map({
      basemap,
      layers: [graphicsLayer],
    });

    const view = new MapView({
      container: mapDivRef.current,
      map,
      center: [-86.2999, 32.3668], // Montgomery, AL [lon, lat]
      zoom: 12,
      ui: { components: ["zoom", "compass"] },
    });
    viewRef.current = view;

    const lotSymbol = new SimpleMarkerSymbol({
      style: "square",
      color: [0, 0, 0, 0],          // transparent fill
      size: "14px",
      outline: {
        color: [201, 162, 39, 220], // gold outline matches brand color
        width: 2,
      },
    });

    view.when(() => {
      // Fetch vacant city-owned parcels from the live ArcGIS endpoint
      fetch(`${serverUrl}map/vacant-parcels`)
        .then(res => res.json())
        .then((data: unknown) => {
          // Log the raw response so we can inspect shape + field names in the console
          console.log("[CityMap] raw response:", data);

          // Handle flat array OR common wrapped shapes: { parcels }, { data }, { features }
          let parcels: RawParcel[] = [];
          if (Array.isArray(data)) {
            parcels = data as RawParcel[];
          } else if (data && typeof data === "object") {
            const obj = data as Record<string, unknown>;
            const wrapped = obj.parcels ?? obj.data ?? obj.features ?? obj.results ?? null;
            if (Array.isArray(wrapped)) parcels = wrapped as RawParcel[];
          }

          console.log(`[CityMap] parcels extracted: ${parcels.length}`);
          if (parcels.length > 0) {
            console.log("[CityMap] first parcel keys:", Object.keys(parcels[0]));
            console.log("[CityMap] first parcel sample:", parcels[0]);
          }

          // Resolve coordinate field name (lat/lon, latitude/longitude, or x/y)
          const resolveCoords = (p: RawParcel): { lat: number; lon: number } | null => {
            const r = p as unknown as Record<string, unknown>;
            const lat = (r.lat ?? r.latitude ?? r.y) as number | undefined;
            const lon = (r.lon ?? r.longitude ?? r.x) as number | undefined;
            if (lat == null || lon == null) return null;
            return { lat: Number(lat), lon: Number(lon) };
          };

          const beforeDisplayFilter = parcels.length;
          const displayFiltered = parcels.filter(p => {
            const r = p as unknown as Record<string, unknown>;
            return r.DISPLAY !== "NO";
          });
          console.log(`[CityMap] after DISPLAY filter: ${displayFiltered.length} / ${beforeDisplayFilter}`);

          const graphics = displayFiltered
            .map(p => {
              const coords = resolveCoords(p);
              if (!coords) return null;
              const { lat, lon } = coords;
              const point = new Point({ latitude: lat, longitude: lon });

              const streetAddress =
                [p.STREET_NUM, p.STREET_NAM].filter(Boolean).join(" ").trim() ||
                p.LOCATION ||
                "Vacant Lot";

              const template = new PopupTemplate({
                title: streetAddress,
                content: [
                  {
                    type: "fields",
                    fieldInfos: [
                      { fieldName: "TAX_MAP",   label: "Parcel ID" },
                      { fieldName: "District",  label: "Council District" },
                      { fieldName: "CALC_ACRE", label: "Acres" },
                      { fieldName: "SQ_FT",     label: "Sq Ft" },
                      { fieldName: "LOCATION",  label: "Location Note" },
                      { fieldName: "STRATEGY",  label: "Strategy" },
                      { fieldName: "NOTES",     label: "Notes" },
                    ],
                  },
                ],
              });

              return new Graphic({
                geometry: point,
                symbol: lotSymbol,
                popupTemplate: template,
                attributes: {
                  TAX_MAP:   p.TAX_MAP?.trim()   ?? "—",
                  District:  p.District           ?? "—",
                  CALC_ACRE: p.CALC_ACRE != null  ? p.CALC_ACRE.toFixed(2) : "—",
                  SQ_FT:     p.SQ_FT != null      ? p.SQ_FT.toLocaleString() : "—",
                  LOCATION:  p.LOCATION?.trim()   || "—",
                  STRATEGY:  p.STRATEGY?.trim()   || "—",
                  NOTES:     p.NOTES?.trim()       || "—",
                },
              });
            });

          const validGraphics = graphics.filter((g): g is Graphic => g !== null);
          graphicsLayer.addMany(validGraphics);
          setParcelCount(validGraphics.length);
          setStatus("ready");

          // Zoom to fit all parcels if we have any
          if (validGraphics.length > 0) {
            view.goTo(validGraphics, { animate: true }).catch(() => {});
          }
        })
        .catch(() => {
          // Fall back to showing the map with no parcels
          setStatus("error");
        });
    });

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [serverUrl]);

  return (
    <div style={{ position: "relative", width: "100%", height: "calc(100vh - 220px)" }}>
      {/* Map container */}
      <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />

      {/* Status badge */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          backgroundColor: "#0e3a47ee",
          color: "#FFF8F8",
          fontFamily: "'Lora', Georgia, serif",
          fontSize: "0.78rem",
          padding: "0.4rem 0.85rem",
          borderRadius: "6px",
          pointerEvents: "none",
          letterSpacing: "0.03em",
          zIndex: 10,
        }}
      >
        {status === "loading" && "Loading vacant lots…"}
        {status === "ready" && `${parcelCount} vacant lot${parcelCount !== 1 ? "s" : ""} plotted`}
        {status === "error" && "Could not load parcels — map still available"}
      </div>

      {/* Legend */}
      {status === "ready" && (
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "12px",
            backgroundColor: "#0e3a47ee",
            color: "#FFF8F8",
            fontFamily: "'Lora', Georgia, serif",
            fontSize: "0.75rem",
            padding: "0.5rem 0.85rem",
            borderRadius: "6px",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "14px",
              height: "14px",
              border: "2px solid #c9a227",
              borderRadius: "2px",
              backgroundColor: "transparent",
              flexShrink: 0,
            }}
          />
          Vacant lot — click to inspect
        </div>
      )}
    </div>
  );
}
