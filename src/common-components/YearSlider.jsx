"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import styled from "styled-components";
// import mui components
import Slider from "@mui/material/Slider";
import MuiInput from "@mui/material/Input";

const RangeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
`;

const Input = styled(MuiInput)`
  width: 112px;
  flex-shrink: 0;
`;

export default function YearSlider({
  step,
  min,
  max,
  height = "fit-content",
  stepGap = 120,
  showThumbLabel = true,
  showMarkers = true,
  onChange = () => {},
}) {
  const rangeWrapperRef = useRef(null);

  const [val, setVal] = useState(min);

  const markerCount = useMemo(() => {
    return (max - min) / step + 1;
  }, [step, min, max]);

  useEffect(() => {
    // Disable browser scroll restoration for this component
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Reset scroll position on mount
    if (rangeWrapperRef.current) {
      rangeWrapperRef.current.scrollLeft = 0;
    }

    // Use a slight delay to ensure it overrides browser restoration
    const timeoutId = setTimeout(() => {
      if (rangeWrapperRef.current) {
        rangeWrapperRef.current.scrollLeft = 0;
      }
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      // Optionally restore default behavior on unmount
      if ("scrollRestoration" in window.history) {
        // window.history.scrollRestoration = "auto";
      }
    };
  }, []);
  // ${((markerCount - 1) * stepGap).toString()}px
  return (
    <RangeWrapper
      ref={rangeWrapperRef}
      className="range-wrapper"
      width={`100%`}
      height={height}
    >
      <Slider
        onChange={(e, newVal) => {
          setVal(newVal);
          onChange(newVal);
        }}
        min={min}
        max={max}
        // step={1}
        value={val}
        sx={{
          width: "100%",
          "& .MuiSlider-mark": {
            backgroundColor: "white", // tick color
            height: 16,
            width: 2,
          },
          "& .MuiSlider-track": {
            backgroundColor: "#097e11",
          },
          "& .MuiSlider-rail": {
            height: 10,
            backgroundColor: "white",
          },
          "& .MuiSlider-markLabel": {
            color: "white", // label color
            fontSize: "16px",
          },
          "& .MuiSlider-thumb": {
            backgroundColor: "#097e11",
          },
        }}
        valueLabelDisplay="on"
        // marks={
        //   showMarkers
        //     ? Array.from({ length: max - min + 1 }, (_, i) => {
        //         const value = min + step * i;
        //         return { value, label: `${value}` };
        //       })
        //     : []
        // }
      />
      <Input
        value={val}
        onChange={(e) => {
          setVal(Number(e.target.value));
          onChange(Number(e.target.value));
        }}
        inputProps={{
          step: 1,
          min,
          max,
          type: "number",
          "aria-labelledby": "input-slider",
        }}
      />
    </RangeWrapper>
  );
}
