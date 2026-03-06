import { useEffect } from "react";

interface PropertyHeaderProps {
  address?: string;
  city?: string;
  acres?: number;
  vacantYears?: number;
  zoning?: string;
  flags?: string[];
}

export default function PropertyHeader({
  address = "1100 W Jeff Davis Ave",
  city = "Montgomery AL 36104",
  acres = 2.6,
  vacantYears = 12,
  zoning = "C",
  flags = ["FLAGS", "FLAGS", "FLAGS"],
}: PropertyHeaderProps) {
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
          {address}, {city}
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{acres} acres</span>
          <span className="text-gray-300">·</span>
          <span>Vacant {vacantYears} yrs</span>
          <span className="text-gray-300">·</span>
          <span>Zoned {zoning}</span>
        </div>
      </div>

      {/* Right: Flag badges */}
      <div className="flex items-center gap-2 mt-1">
        {flags.map((flag, i) => (
          <span
            key={i}
            className="px-4 py-1 rounded-full text-xs font-medium tracking-wide"
            style={{ backgroundColor: "#a8d8ea", color: "#1a4a5e" }}
          >
            {flag}
          </span>
        ))}
      </div>
    </div>
  );
}
