"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// import mui components
import { Snackbar } from "@mui/material";
// import mui icons
import LegendToggleOutlinedIcon from "@mui/icons-material/LegendToggleOutlined";
import CloseFullscreenOutlinedIcon from "@mui/icons-material/CloseFullscreenOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
// import common components
import YearSlider from "@/common-components/YearSlider";
// import common styles
import { IconHolderRound } from "@/common-styles/iconStyles";
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
  overflow: visible;
  padding: 20px 32px 40px;
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

  const [data, setData] = useState();
  const [mapLegend, setMapLegend] = useState({});
  const [focusedYear, setFocusedYear] = useState(1990);
  const [minYear, setMinYear] = useState(1990);
  const [showLegend, toggleShowLegend] = useState(false);
  const [invisibleFocusVals, updateInvisibleFocusVals] = useState([]);
  const [noDataForYear, setNoDataForYear] = useState(false);

  const colorVsFocus = useRef([]);
  const sliderContainer = useRef(null);

  useLayoutEffect(() => {
    if (sliderContainer.current) {
      sliderContainer.current.scrollLeft = 0;
    }
  }, []);

  const getSightingsData = async (filters = null, focus = null) => {
    console.log(
      "exec1 | Entered getSightingsData with filters: ",
      filters,
      " | focus: ",
      focus
    );
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
        console.log("observation-point-timeline-map data: ", data);
        setData(data);
        const focusedYear = Object.keys(data)[0];
        setFocusedYear(focusedYear);
        setMinYear(Number(focusedYear));

        if (focus) {
          toggleShowLegend(true);
          updateMap(data, focus, focusedYear);
        } else {
          toggleShowLegend(false);
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
    console.log("exec1 | about to update map. is filtering on: ", isUpdating);

    if (isUpdating) return;

    updateInvisibleFocusVals([]);

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

  const updateMap = (
    data,
    focusFacet,
    focusedYear = 1990,
    invisibleFocus = []
  ) => {
    console.log(
      "exec1 | updateMap for map has - mapObjRef: ",
      mapObjRef.current,
      " | focusedYear: ",
      focusedYear,
      " | data: ",
      data[`${focusedYear}`]
    );
    try {
      if (mapObjRef.current && data && data[`${focusedYear}`]) {
        setNoDataForYear(false);

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

        const circleOpacityArr = [];
        invisibleFocus.forEach((val, _) => {
          circleOpacityArr.push(val, 0);
        });
        // console.log("circleOpacityArr: ", circleOpacityArr)

        mapObjRef.current.addLayer({
          id: layerId,
          type: "circle",
          source: layerSource,
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              300, // ["to-number", ["get", "population"], 0] <-- converts population to number, fallback 0
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
            "circle-opacity":
              invisibleFocus.length > 0
                ? ["match", ["get", layerSource], ...circleOpacityArr, 0.7]
                : 0.7,
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
      } else if (!data[`${focusedYear}`]) {
        console.log("data is undefined");
        const layerSource = focusFacet ?? "Species";
        const layerId = focusFacet
          ? `${focusFacet.toLowerCase()}-circles-layer`
          : "species-circles-layer";

        if (mapObjRef.current.getSource(layerSource)) {
          console.log("removing layer and source: ", layerId, layerSource);
          mapObjRef.current.removeLayer(layerId);
          mapObjRef.current.removeSource(layerSource);
        } else {
          console.log("current layer not found");
        }

        if (mapObjRef.current.getSource(lastSrcRef.current)) {
          mapObjRef.current.removeLayer(lastLayerRef.current);
          mapObjRef.current.removeSource(lastSrcRef.current);
        }

        setNoDataForYear(true);
      }
    } catch (err) {
      console.error("Failed to add map layers: ", err);
    }
  };

  return (
    <PageWrapper className="page-wrapper observation-points-timeline-map-wrapper">
      <MapWrapper ref={mapElementRef} className="map-wrapper" />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={noDataForYear}
        message={"No observation data available for the selected year."}
      />
      {!showLegend && Object.keys(mapLegend) && (
        <IconHolderRound
          style={{ position: "absolute", top: "17px", left: "24px" }}
          onClick={() => toggleShowLegend(true)}
        >
          <LegendToggleOutlinedIcon />
        </IconHolderRound>
      )}
      {showLegend && (
        <MapLegendContainer>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <CloseFullscreenOutlinedIcon
              sx={{ cursor: "pointer" }}
              onClick={() => toggleShowLegend(false)}
            />
          </div>
          {Object.entries(mapLegend).map(([name, colorVal], _) => {
            return (
              <div key={name} className="legend">
                <div className="circle" style={{ background: colorVal }} />
                <span>{name}</span>
                <div
                  onClick={() => {
                    const idx = invisibleFocusVals.indexOf(name);
                    let updatedInvisibleFocusArr;

                    if (idx === -1) {
                      updatedInvisibleFocusArr = [...invisibleFocusVals, name];
                    } else {
                      updatedInvisibleFocusArr = [...invisibleFocusVals];
                      updatedInvisibleFocusArr.splice(idx, 1);
                      console.log(
                        "removed ",
                        name,
                        " from invisibility arr: ",
                        idx,
                        updatedInvisibleFocusArr
                      );
                    }

                    updateInvisibleFocusVals(updatedInvisibleFocusArr);
                    updateMap(
                      data,
                      focusFacet,
                      focusedYear,
                      updatedInvisibleFocusArr
                    );
                  }}
                >
                  {invisibleFocusVals.includes(name) ? (
                    <VisibilityOffOutlinedIcon sx={{ cursor: "pointer" }} />
                  ) : (
                    <VisibilityOutlinedIcon sx={{ cursor: "pointer" }} />
                  )}
                </div>
              </div>
            );
          })}
        </MapLegendContainer>
      )}
      {data && (
        <SliderContainer className="slider-contaier" ref={sliderContainer}>
          <YearSlider
            min={minYear}
            max={2020}
            step={1}
            showThumbLabel={false}
            onChange={(year) => {
              setFocusedYear(year);
              updateMap(data, focusFacet, year, invisibleFocusVals);
            }}
          />
        </SliderContainer>
      )}
    </PageWrapper>
  );
}
