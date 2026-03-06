import { useEffect } from "react";
import type { Parcel } from "../types";

interface PropertyHeaderProps {
  parcel?: Parcel | null;
}

export default function PropertyHeader({ parcel }: PropertyHeaderProps) {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lora:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <div className="flex items-start justify-between px-6 py-3 bg-white border-b pb-8">
      {/* Left: Address + meta */}
      <div className="flex flex-col gap-1">
        <h2
          className="font-bold text-gray-900 tracking-tight"
          style={{ fontFamily: "'Lora', serif", fontSize: "20px" }}
        >
          {parcel?.address ?? "No parcel selected"}
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{parcel?.acres?.toFixed(1) ?? "—"} acres</span>
          <span className="text-gray-300">·</span>
          <span>Zoned {parcel?.zone_context ?? "—"}</span>
          <span className="text-gray-300">·</span>
          <span>{parcel?.nearest_anchor ?? "—"}</span>
        </div>
      </div>

      {/* Right: Flag badges */}
      <div className="flex items-center gap-2 mt-1">
        {parcel ? (
          <>
            <span
              className="px-4 py-1 rounded-full text-xs font-medium tracking-wide"
              style={{ backgroundColor: "#a8d8ea", color: "#1a4a5e" }}
            >
              {parcel.story}
            </span>
            <span
              className="px-4 py-1 rounded-full text-xs font-medium tracking-wide"
              style={{ backgroundColor: "#a8d8ea", color: "#1a4a5e" }}
            >
              {parcel.open_grants} grants open
            </span>
            <span
              className="px-4 py-1 rounded-full text-xs font-medium tracking-wide"
              style={{ backgroundColor: "#a8d8ea", color: "#1a4a5e" }}
            >
              {parcel.min_dist_miles} mi to anchor
            </span>
          </>
        ) : (
          <span
            className="px-4 py-1 rounded-full text-xs font-medium tracking-wide"
            style={{ backgroundColor: "#f5f5f5", color: "#999" }}
          >
            —
          </span>
        )}
      </div>
    </div>
  );
}