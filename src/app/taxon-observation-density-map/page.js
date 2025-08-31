"use client";
import React, { useEffect, useRef } from "react";
import { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function page() {
  const mapElementRef = useRef(null);
  const mapObjRef = useRef(null);

  const initiateMap = (center) => {
    console.log("initiating map");
    const m = new Map({
      container: mapElementRef.current,
      style: "https://demotiles.maplibre.org/style.json", // Free style
      center,
      zoom: 0,
      renderWorldCopies: false,
    });
    m.on("load", () => {
      console.log("map loaded at MOL");
      mapObjRef.current = m;
      console.log("map initiated");

      const sourceId = "gbif-density";
      const layerId = "gbif-density-layer";
      const tileUrl = `/api/gbif-tiles/{z}/{x}/{y}@Hx.png?taxonKey=5219404`;

      // Remove existing layer & source if present
      if (mapObjRef.current.getLayer(layerId)) {
        mapObjRef.current.removeLayer(layerId);
      }
      if (mapObjRef.current.getSource(sourceId)) {
        mapObjRef.current.removeSource(sourceId);
      }

      // Add raster tile source
      mapObjRef.current.addSource(sourceId, {
        type: "raster",
        tiles: [tileUrl],
        tileSize: 256,
      });

      // Add raster layer
      mapObjRef.current.addLayer({
        id: layerId,
        type: "raster",
        source: sourceId,
        paint: { "raster-opacity": 0.7 },
      });
    });
  };

  useEffect(() => {
    console.log("MOL useEffect");
    if (mapObjRef.current === null) {
      initiateMap([0, 0]);
    }
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      MOL
      <div
        style={{ width: "100vw", height: "100vh", display: "flex" }}
        ref={mapElementRef}
        className="map-wrapper"
      />
    </div>
  );
}
