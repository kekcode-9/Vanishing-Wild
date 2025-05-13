"use client";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// import components
import YearSlider from "@/common-components/YearSlider";
import FilterComponent from "@/common-components/FilterComponent";
// import constants
import { QUERY_STRINGS } from "@/constants/api-constants";

const {SPECIES, COMMON_NAME} = QUERY_STRINGS;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
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
  z-index: 888;
  flex-shrink: 0;
  width: 100vw;
  max-width: 100%;
  height: fit-content;
  overflow: scroll;
  padding: 20px 32px 80px;
  background: #00000087;
  backdrop-filter: blur(10px);
`;

export default function Sightings() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState();
  const [focusedYear, setFocusedYear] = useState(1990);
  const [speciesList, setSpeciesList] = useState([]);
  const [commonNamesList, setCommonNamesList] = useState([]);

  const getSightingsData = async (filter = null) => {
    const url =
      "http://localhost:3000/api/sightings" +
      (filter
        ? `?${Object.entries(filter)
            .map(([key, value], _) => `${key}=${value}`)
            .join("&")}`
        : "");

    fetch(url) // ?common-name=Seychelles magpie-robin
      .then((res) => res.json())
      .then((data) => {
        console.log("data: ", data);
        setData(data);
        initiateMap([0, 0]);
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
    // if search params are in page url then build filter from them and pass
    getSightingsData();

    fetch("http://localhost:3000/api/sightings/filter-options")
      .then((res) => res.json())
      .then((data) => {
        setSpeciesList(data.speciesList);
        setCommonNamesList(data.namesList);
      })
      .catch((err) => {
        console.error("error fetching filter lists: ", err);
      });
  }, []);

  useEffect(() => {
    if (map && data) {
      const geoJSON1990 = data[`${focusedYear}`]; // show only data from this year on map

      // Remove existing layer/source if needed
      if (map.getSource("species")) {
        map.removeLayer("species-circles-layer");
        map.removeSource("species");
      }

      map.addSource("species", {
        type: "geojson",
        data: geoJSON1990,
      });

      map.addLayer({
        id: "species-circles-layer",
        type: "circle",
        source: "species",
        // filter: ["==", "commonName", "Cape vulture"],
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

      map.on("click", "species-circles-layer", (e) => {
        // take first feature because there might be multiple circles where we clicked
        const feature = e.features[0];

        const popupHTML = `
          <div class="species-circle-popup">
            <div>
              Common name: ${feature.properties.commonName}
            </div>
            <div>
              Species: ${feature.properties.species}
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
  }, [map, data, focusedYear, filter]);

  return (
    <PageWrapper className="page-wrapper">
      <FilterComponent
        topics={[
          {
            title: "Species",
            list: speciesList,
            keys: [SPECIES],
            name: SPECIES,
          },
          {
            title: "Common names",
            list: commonNamesList,
            keys: [COMMON_NAME],
            name: COMMON_NAME,
          },
        ]}
        onFilterUpdate={(filter) => {
          setFilter(filter);
          getSightingsData(filter)
        }}
      />
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
