import React from "react";

export function LogoBar({ account, color }: { account: string; color: string }) {
  const logo = account === "business" ? "azen" : "tayyib.ai";
  return (
    <div style={{ position: "absolute", bottom: 40, left: 80, display: "flex", alignItems: "center" }}>
      <span style={{ color, fontSize: 26, fontWeight: 700 }}>{logo}</span>
    </div>
  );
}

export function SlideCounter({ current, total, color }: { current: number; total: number; color: string }) {
  return (
    <div style={{ position: "absolute", top: 30, right: 30, color, fontSize: 22, fontWeight: 400 }}>
      {current}/{total}
    </div>
  );
}

export function AccentStripe({
  orientation,
  color,
  thickness,
  length,
  top,
  left,
  right,
  bottom,
}: {
  orientation: "vertical" | "horizontal";
  color: string;
  thickness: number;
  length: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        width: orientation === "vertical" ? thickness : length,
        height: orientation === "horizontal" ? thickness : length,
        background: color,
        borderRadius: thickness / 2,
      }}
    />
  );
}

export function NumberWatermark({ number, color }: { number: number; color: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        right: 60,
        fontSize: 220,
        fontWeight: 700,
        color,
        opacity: 0.08,
        lineHeight: 1,
      }}
    >
      {String(number).padStart(2, "0")}
    </div>
  );
}

export function DecoCircle({
  size,
  color,
  opacity,
  top,
  left,
  right,
  bottom,
}: {
  size: number;
  color: string;
  opacity: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        borderRadius: size / 2,
        background: color,
        opacity,
      }}
    />
  );
}

export function NumberedMarker({ number, color }: { number: number; color: string }) {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
      }}
    >
      <span style={{ color: "#ffffff", fontSize: 22, fontWeight: 700 }}>{number}</span>
    </div>
  );
}
