"use client";
import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Range, getTrackBackground } from "react-range";

const RangeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
`;

export default function YearSlider({
  step,
  min,
  max,
  height = "fit-content",
  stepGap = 120,
  showThumbLabel = true,
  showMarkers = true,
  onChange=() => {}
}) {
  const [values, setValues] = useState([min]);

  const markerCount = useMemo(() => {
    return (max - min) / step + 1;
  }, [step, min, max]);

  const handleSlide = (values) => {
    onChange(values[0]);
    setValues(values);
  }

  return (
    <RangeWrapper
      className="range-wrapper"
      width={`${((markerCount - 1) * stepGap).toString()}px`}
      height={height}
    >
      <Range
        values={values}
        step={step}
        min={min}
        max={max}
        rtl={false}
        onChange={(values) => setValues(values)}
        onFinalChange={(values) => handleSlide(values)}
        renderMark={({ props, index }) =>
          showMarkers && (
            <div
              className="marker"
              {...props}
              key={props.key}
              style={{
                ...props.style,
                height: "16px",
                width: "2px",
                borderRadius: "100px",
                backgroundColor: " #ffffff",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "32px",
                }}
              >
                {min + index}
              </div>
            </div>
          )
        }
        renderTrack={({ props, children }) => (
          <div
            className="render-track"
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={{
              ...props.style,
              height: "36px",
              display: "flex",
              width: "100%",
            }}
          >
            <div
              ref={props.ref}
              style={{
                height: "5px",
                width: "100%",
                borderRadius: "4px",
                background: "white",
                alignSelf: "center",
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            {...props}
            key={props.key}
            style={{
              ...props.style,
              height: "42px",
              width: "10px",
              borderRadius: "100px",
              backgroundColor: " #30b2f8",
            }}
          >
            {showThumbLabel && (
              <div
                style={{
                  position: "absolute",
                  top: "-28px",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "14px",
                  padding: "4px",
                  borderRadius: "4px",
                  backgroundColor: "#548BF4",
                }}
              >
                {values[0]}
              </div>
            )}
          </div>
        )}
      />
    </RangeWrapper>
  );
}
