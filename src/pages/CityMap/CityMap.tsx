import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import esriConfig from "@arcgis/core/config";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import Basemap from "@arcgis/core/Basemap";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";        // ✅ ArcGIS Polygon
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol"; // ✅ correct alias

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
  rings: number[][][];
}

interface PopupInfo {
  fid: number;
  parcelNum: string;
  address: string;
  district: number | string;
  acres: string;
  lat: number;
  lon: number;
  rings: number[][][] | undefined;
  x: number; // screen px
  y: number;
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "Accept-Language": "en" } },
    );
    const data = await res.json();
    const a = data.address ?? {};
    const street = [a.house_number, a.road].filter(Boolean).join(" ");
    const city = a.city || a.town || a.village || "Montgomery";
    const state = a.state_code || a.state || "AL";
    const base =
      street || data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    return `${base}, ${city}, ${state}`;
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}

export default function CityMap() {
  const mapDivRef    = useRef<HTMLDivElement>(null);
  const viewRef      = useRef<MapView | null>(null);
  const addressByIdRef = useRef<Record<number, string>>({});
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [parcelCount, setParcelCount] = useState(0);
  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();

  function handleCopy(address: string) {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  useEffect(() => {
    if (!mapDivRef.current) return;

    const graphicsLayer = new GraphicsLayer({ title: "Vacant Lots" });

    const cartoLayer = new WebTileLayer({
      urlTemplate:
        "https://{subDomain}.basemaps.cartocdn.com/light_all/{level}/{col}/{row}.png",
      subDomains: ["a", "b", "c", "d"],
      copyright: "© OpenStreetMap contributors © CARTO",
    });

    const map = new Map({
      basemap: new Basemap({ baseLayers: [cartoLayer] }),
      layers: [graphicsLayer],
    });

    const view = new MapView({
      container: mapDivRef.current,
      map,
      center: [-86.2999, 32.3668],
      zoom: 12,
      ui: { components: ["zoom", "compass"] },
      popup: { autoOpenEnabled: false }, // disable built-in popup
    });
    viewRef.current = view;

    const lotSymbol = new SimpleFillSymbol({
  color: [0, 0, 0, 0],
  outline: { color: [201, 162, 39, 220], width: 2 },
});

const lotSymbolHover = new SimpleFillSymbol({
  color: [201, 162, 39, 40],
  outline: { color: [201, 162, 39, 255], width: 2.5 },
});

    view.when(() => {
      fetch(`${serverUrl}map/vacant-parcels`)
        .then((res) => res.json())
        .then((data: unknown) => {
          let parcels: RawParcel[] = [];
          if (Array.isArray(data)) {
            parcels = data as RawParcel[];
          } else if (data && typeof data === "object") {
            const obj = data as Record<string, unknown>;
            const wrapped =
              obj.parcels ?? obj.data ?? obj.features ?? obj.results ?? null;
            if (Array.isArray(wrapped)) parcels = wrapped as RawParcel[];
          }

          const displayFiltered = parcels.filter((p) => {
            const r = p as unknown as Record<string, unknown>;
            return r.DISPLAY !== "NO";
          });

          // FID → rings lookup used by the click handler
          // (can't use JS Map here — the ArcGIS "Map" import shadows it)
          const ringsById: Record<number, number[][][]> = {};
          addressByIdRef.current = {};

          const graphics = displayFiltered.map((p) => {
            if (!p.rings || p.rings.length === 0) return null;

            ringsById[p.FID] = p.rings;
            addressByIdRef.current[p.FID] =
              [p.STREET_NUM, p.STREET_NAM].filter(Boolean).join(" ").trim() ||
              p.LOCATION ||
              p.TAX_MAP ||
              p.PARCEL_NUM ||
              "Vacant Lot";

            // Use backend lat/lon or derive centroid from first ring
            const lat = p.lat ?? p.rings[0].reduce((s, c) => s + c[1], 0) / p.rings[0].length;
            const lon = p.lon ?? p.rings[0].reduce((s, c) => s + c[0], 0) / p.rings[0].length;

            return new Graphic({
              geometry: new Polygon({
                rings: p.rings,
                spatialReference: { wkid: 4326 },
              }),
              symbol: lotSymbol,
              attributes: {
                FID:        p.FID,
                PARCEL_NUM: p.PARCEL_NUM,
                lat,
                lon,
                District:   p.District,
                CALC_ACRE:  p.CALC_ACRE,
              },
            });
          });
          const validGraphics = graphics.filter(
            (g): g is Graphic => g !== null,
          );
          graphicsLayer.addMany(validGraphics);
          setParcelCount(validGraphics.length);
          setStatus("ready");

          if (validGraphics.length > 0) {
            view.goTo(validGraphics, { animate: true }).catch(() => {});
          }

          // Hover — highlight marker
          view.on("pointer-move", async (event) => {
            const hit = await view.hitTest(event, { include: [graphicsLayer] });
            const result = hit.results.find((r) => r.type === "graphic");
            view.container.style.cursor = result ? "pointer" : "default";
            validGraphics.forEach((g) => {
              g.symbol = lotSymbol;
            });
            if (result?.type === "graphic")
              result.graphic.symbol = lotSymbolHover;
          });

          // Click — show React popup card with reverse-geocoded address
          view.on("click", async (event) => {
            const hit = await view.hitTest(event, { include: [graphicsLayer] });
            const result = hit.results.find((r) => r.type === "graphic");
            if (result?.type === "graphic") {
              const attrs = result.graphic.attributes;
              const fid: number = attrs.FID;
              const base: PopupInfo = {
                fid,
                parcelNum: attrs.PARCEL_NUM ?? "",
                address: "Looking up address…",
                district: attrs.District,
                acres:
                  attrs.CALC_ACRE != null
                    ? Number(attrs.CALC_ACRE).toFixed(2)
                    : "—",
                lat: attrs.lat,
                lon: attrs.lon,
                rings: ringsById[fid],
                x: event.x,
                y: event.y,
              };
              setPopup(base);
              setCopied(false);
              // Reverse geocode — update popup display and the ref so
              // "Score this parcel" stores the human-readable geocoded address
              reverseGeocode(attrs.lat, attrs.lon).then((addr) => {
                addressByIdRef.current[fid] = addr;
                setPopup((prev): PopupInfo | null =>
                  prev?.fid === fid ? { ...prev, address: addr } : prev,
                );
              });
            } else {
              setPopup(null);
            }
          });
        })
        .catch(() => setStatus("error"));
    });

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [serverUrl]);

  // Pin popup to map container, shift so it doesn't overflow right/bottom edge
  const popupStyle = popup
    ? (() => {
        const w = window.innerWidth;
        const h = window.innerHeight - 52; // subtract nav bar height
        const cardW = 260;
        const cardH = 130;
        const offset = 12;
        let left = popup.x + offset;
        let top = popup.y + offset;
        if (left + cardW > w) left = popup.x - cardW - offset;
        if (top + cardH > h) top = popup.y - cardH - offset;
        return { left, top };
      })()
    : null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100vh - 52px)",
      }}
    >
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
        {status === "ready" &&
          `${parcelCount} vacant lot${parcelCount !== 1 ? "s" : ""} — click any to inspect`}
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
          Vacant lot
        </div>
      )}

      {/* React popup card */}
      {popup && popupStyle && (
        <div
          style={{
            position: "absolute",
            left: popupStyle.left,
            top: popupStyle.top,
            width: "260px",
            backgroundColor: "#fff",
            border: "1px solid #e0d9c8",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            fontFamily: "'Lora', Georgia, serif",
            zIndex: 20,
            overflow: "hidden",
          }}
        >
          {/* Header bar */}
          <div
            style={{
              backgroundColor: "#0e3a47",
              padding: "0.5rem 0.75rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#c9a227",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Vacant Lot
            </span>
            <button
              onClick={() => setPopup(null)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
                fontSize: "1rem",
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "0.75rem" }}>
            {/* Address row with copy button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.6rem",
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  lineHeight: 1.3,
                }}
              >
                {popup.address}
              </span>
              <button
                onClick={() => handleCopy(popup.address)}
                title="Copy address"
                style={{
                  flexShrink: 0,
                  backgroundColor: copied ? "#c9a227" : "#f4f0e6",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "0.25rem 0.5rem",
                  cursor: "pointer",
                  fontSize: "0.72rem",
                  color: copied ? "#fff" : "#555",
                  fontFamily: "'Lora', Georgia, serif",
                  transition: "background 0.2s, color 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Meta */}
            <div
              style={{
                fontSize: "0.75rem",
                color: "#888",
                marginBottom: "0.75rem",
              }}
            >
              District {popup.district} &nbsp;·&nbsp; {popup.acres} ac
            </div>

            {/* Score button */}
            <button
              onClick={() => {
                const resolvedAddress =
                  addressByIdRef.current[popup.fid] || popup.address;
              
                localStorage.setItem(
                  "selectedParcel",
                  JSON.stringify({
                    fid:       popup.fid,
                    parcelNum: popup.parcelNum,
                    address:   resolvedAddress,
                    lat:       popup.lat,
                    lon:       popup.lon,
                    rings:     popup.rings ?? null,
                  }),
                );
                navigate("/parcel-score");
              }}
              style={{
                width: "100%",
                backgroundColor: "#0e3a47",
                color: "#c9a227",
                border: "none",
                borderRadius: "5px",
                padding: "0.45rem",
                fontFamily: "'Lora', Georgia, serif",
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                cursor: "pointer",
              }}
            >
              Score this parcel →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
