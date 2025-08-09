"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// import common components
import YearSlider from "@/common-components/YearSlider";
import SearchAndFilter from "@/common-components/SearchAndFilter";
// import constants
import { API_ENDPOINTS, QUERY_STRINGS } from "@/constants/api-constants";
// import services
import { accessPublicEndpoint } from "@/services/rest.service";
// import libs
import generateDistinctColor from "@/lib/randomColorGenerator";

const { SPECIES, COMMON_NAME } = QUERY_STRINGS;

const PageWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #141414;
  border-radius: 4px;
`;

const MapWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;

  .species-circle-popup {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    font-size: 12px;
    color: #000000;
  }
`;

const SliderContainer = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0px;
  // z-index: 888;
  flex-shrink: 0;
  width: 100vw;
  max-width: 100%;
  height: fit-content;
  overflow: scroll;
  padding: 20px 32px 80px;
  background: #00000087;
  backdrop-filter: blur(10px);

  /* Hide scrollbar but allow scroll */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

const MapLegendContainer = styled.div`
  position: absolute;
  top: 24px;
  left: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 12px;
  wdith: fit-content;
  height: fit-content;
  background: white;
  color: black;
  padding: 8px 12px;
  border-radius: 4px;

  .legend {
    display: flex;
    align-items: center;
    gap: 8px;

    .circle {
      width: 12px;
      height: 12px;
      border-radius: 100%;
    }
  }
`;

export default function ObservationPointsTimeline() {
  const nestedDropdown = useSelector((state) => state.nestedDropdown);
  const { focusFacet, isUpdating } = useSelector((state) => state.aboutTaxon);

  const mapElementRef = useRef(null);
  const mapObjRef = useRef(null);
  const lastLayerRef = useRef(null);
  const lastSrcRef = useRef(null);

  const [data, setData] = useState([]);
  const [mapLegend, setMapLegend] = useState({});

  const colorVsFocus = useRef([]);

  const getSightingsData = async (filters = null, focus = null) => {
    const filterBy = filters ? Object.keys(filters) : [];

    // if (filterBy.length === 0 || !focus) return;

    const url = API_ENDPOINTS.SIGHTINGS.MAIN;
    const params = {};

    if (filterBy.length > 0 && focus) {
      params.filter_by = filterBy;
      params.focus = focus;

      filterBy.forEach((filterKey, _) => {
        params[filterKey] = filters[filterKey]
          .map((filterVal, _) => filterVal.split(" | ")[0])
          .join(",");
      });
    }

    accessPublicEndpoint(url, {}, params)
      .then((data) => {
        console.log("data: ", data);
        setData(data);
        const focusedYear = Object.keys(data)[0];

        if (focus) {
          updateMap(data, focus, focusedYear);
        } else {
          updateMap(data, null, 1990);
        }
      })
      .catch((err) => {
        console.error("error fetching data: ", err);
      });
  };

  const initiateMap = (center) => {
    const m = new maplibregl.Map({
      container: mapElementRef.current,
      style: "https://demotiles.maplibre.org/style.json", // Free style
      center,
      zoom: 0,
      renderWorldCopies: false,
    });
    m.on("load", () => {
      mapObjRef.current = m;
      console.log("map initiated");
    });
  };

  useEffect(() => {
    if (mapObjRef.current === null) {
      initiateMap([0, 0]);
    }
    console.log("about to update map. is filtering on: ", isUpdating);

    if (isUpdating) return;

    if (focusFacet) {
      getSightingsData(nestedDropdown, focusFacet);
      colorVsFocus.current = [];
      const focusValues = nestedDropdown[focusFacet];
      const focusValLength = focusValues.length;
      const legend = {};
      let color;

      focusValues.forEach((value, idx) => {
        color = generateDistinctColor(idx, focusValLength);
        colorVsFocus.current.push(value, color);
        legend[value] = color;
      });

      setMapLegend(legend);
    } else {
      getSightingsData();
    }
  }, [nestedDropdown, focusFacet, isUpdating]);

  const updateMap = (data, focusFacet, focusedYear = 1990) => {
    console.log(
      "useEffect for map has - mapObjRef: ",
      mapObjRef.current,
      " | focusedYear: ",
      focusedYear,
      " | data: ",
      data
    );
    try {
      if (mapObjRef.current && data && data[`${focusedYear}`]) {
        const geoJSONCurrentYear = data[`${focusedYear}`]; // show only data from this year on map
        console.log("focused year: ", focusedYear);
        console.log("geoJSONCurrentYear: ", geoJSONCurrentYear);

        const layerSource = focusFacet ?? "Species";
        const layerId = focusFacet
          ? `${focusFacet.toLowerCase()}-circles-layer`
          : "species-circles-layer";
        console.log("layer id: ", layerId, " | layerSource: ", layerSource);

        // Remove existing layer/source if needed
        try {
          if (mapObjRef.current.getSource(layerSource)) {
            mapObjRef.current.removeLayer(layerId);
            mapObjRef.current.removeSource(layerSource);
          }

          if (mapObjRef.current.getSource(lastSrcRef.current)) {
            mapObjRef.current.removeLayer(lastLayerRef.current);
            mapObjRef.current.removeSource(lastSrcRef.current);
          }
        } catch (err) {
          console.log("Failed to remove layer and source from map: ", err);
        }

        mapObjRef.current.addSource(layerSource, {
          type: "geojson",
          data: geoJSONCurrentYear,
        });

        lastSrcRef.current = layerSource;

        mapObjRef.current.addLayer({
          id: layerId,
          type: "circle",
          source: layerSource,
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["to-number", ["get", "population"], 0], // <-- converts population to number, fallback 0
              0,
              2,
              20,
              4,
              100,
              6,
              1000,
              12,
            ],
            "circle-color": focusFacet
              ? [
                  "match",
                  ["get", layerSource],
                  ...colorVsFocus.current,
                  "#757575",
                ]
              : "#757575", // fallback is grey
            "circle-opacity": 0.7,
          },
        });

        lastLayerRef.current = layerId;

        mapObjRef.current.on("click", layerId, (e) => {
          console.log("circle clicked");
          // take first feature because there might be multiple circles where we clicked
          const feature = e.features[0];

          const popupHTML = `
          <div class="species-circle-popup">
            ${
              focusFacet && focusFacet !== "Common_name"
                ? `
              <div>
                ${focusFacet}: ${feature.properties[focusFacet]}
              </div>
              `
                : ""
            }
            <div>
              Common name: ${feature.properties.Common_name}
            </div>
            <div>
              Species: ${feature.properties.Species}
            </div>
            <div>
              Population: ${feature.properties.population}
            </div>
            <div>
              Country: ${feature.properties.country}
            </div>
            <div>
              Lat, Long: ${feature.geometry.coordinates[1].toFixed(
                6
              )}, ${feature.geometry.coordinates[0].toFixed(6)}
            </div>
          </div>
        `;

          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupHTML)
            .addTo(mapObjRef.current);
        });
      }
    } catch (err) {
      console.error("Failed to add map layers: ", err);
    }
  };

  return (
    <PageWrapper className="page-wrapper">
      <MapWrapper ref={mapElementRef} className="map-wrapper" />
      <MapLegendContainer>
        {Object.entries(mapLegend).map(([name, colorVal], _) => {
          return (
            <div key={name} className="legend">
              {" "}
              <div className="circle" style={{ background: colorVal }} />
              <span>{name}</span>
            </div>
          );
        })}
      </MapLegendContainer>
      <SliderContainer className="slider-contaier">
        <YearSlider
          min={1990}
          max={2020}
          step={1}
          showThumbLabel={false}
          onChange={(year) => updateMap(data, focusFacet, year)}
        />
      </SliderContainer>
    </PageWrapper>
  );
}
