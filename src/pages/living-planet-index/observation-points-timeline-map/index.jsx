"use client";
import React, { useEffect, useRef, useState } from "react";
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

export default function ObservationPointsTimeline() {
  const nestedDropdown = useSelector((state) => state.nestedDropdown);
  const { focusFacet } = useSelector((state) => state.aboutTaxon);

  const mapRef = useRef(null);

  const [map, setMap] = useState(null);
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState();
  const [focusedYear, setFocusedYear] = useState(1990);
  const [speciesList, setSpeciesList] = useState([]);
  const [commonNamesList, setCommonNamesList] = useState([]);

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
        initiateMap([0, 0]);
        setFocusedYear(Object.keys(data)[0]); // first year key in data
      })
      .catch((err) => {
        console.error("error fetching data: ", err);
      });
  };

  const initiateMap = (center) => {
    const m = new maplibregl.Map({
      container: mapRef.current,
      style: "https://demotiles.maplibre.org/style.json", // Free style
      center,
      zoom: 0,
      renderWorldCopies: false,
    });
    m.on("load", () => setMap(m));
  };

  useEffect(() => {
    if (focusFacet) {
      getSightingsData(nestedDropdown, focusFacet);
    } else {
      getSightingsData();
    }
  }, [nestedDropdown, focusFacet]);

  useEffect(() => {
    if (map && data && data[`${focusedYear}`]) {
      const geoJSONCurrentYear = data[`${focusedYear}`]; // show only data from this year on map
      console.log("geoJSONCurrentYear: ", geoJSONCurrentYear);

      const layerSource = focusFacet ?? "Species";
      const layerId = focusFacet
        ? `${focusFacet.toLowerCase()}-circles-layer`
        : "species-circles-layer";
      console.log("layer id: ", layerId, " | layerSource: ", layerSource);

      // Remove existing layer/source if needed
      if (map.getSource(layerSource)) {
        map.removeLayer(layerId);
        map.removeSource(layerSource);
      }

      map.addSource(layerSource, {
        type: "geojson",
        data: geoJSONCurrentYear,
      });

      map.addLayer({
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
          "circle-color": "#E53935",
          "circle-opacity": 0.7,
        },
      });

      map.on("click", layerId, (e) => {
        console.log("circle clicked")
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
          .addTo(map);
      });
    }
  }, [map, data, focusedYear, filter, focusFacet]);

  return (
    <PageWrapper className="page-wrapper">
      <MapWrapper ref={mapRef} className="map-wrapper" />
      <SliderContainer className="slider-contaier">
        <YearSlider
          min={1990}
          max={2020}
          step={1}
          showThumbLabel={false}
          onChange={setFocusedYear}
        />
      </SliderContainer>
    </PageWrapper>
  );
}
