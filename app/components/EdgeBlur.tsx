"use client";

export function TopBlur({ height = 80 }: { height?: number }) {
  const rows = 8;
  return (
    <div
      className="pointer-events-none fixed top-0 left-0 right-0 z-50"
      style={{ height }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: `${((i + 1) / rows) * 100}%`,
            backdropFilter: `blur(${(i + 1) * 0.5}px)`,
            WebkitBackdropFilter: `blur(${(i + 1) * 0.5}px)`,
            maskImage: `linear-gradient(to bottom, black ${(i / rows) * 100}%, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to bottom, black ${(i / rows) * 100}%, transparent 100%)`,
          }}
        />
      ))}
    </div>
  );
}

export function BottomBlur({ height = 80 }: { height?: number }) {
  const rows = 8;
  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-50"
      style={{ height }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${((i + 1) / rows) * 100}%`,
            backdropFilter: `blur(${(i + 1) * 0.5}px)`,
            WebkitBackdropFilter: `blur(${(i + 1) * 0.5}px)`,
            maskImage: `linear-gradient(to top, black ${(i / rows) * 100}%, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to top, black ${(i / rows) * 100}%, transparent 100%)`,
          }}
        />
      ))}
    </div>
  );
}
