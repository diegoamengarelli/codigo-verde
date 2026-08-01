"use client";

import dynamic from "next/dynamic";

const RealMap = dynamic(
  () => import("@/components/real-map").then((m) => m.RealMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-card rounded-lg border border-border animate-pulse" />
    ),
  }
);

export function MapWrapper() {
  return <RealMap />;
}
