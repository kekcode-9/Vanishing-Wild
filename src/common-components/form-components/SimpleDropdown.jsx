import React, { useState, useEffect } from "react";
import styled from "styled-components";

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  height: 32px;
  box-sizing: border-box;
`;

const Label = styled.label`
  font-size: 14px;
  flex-shrink: 0;
`;

const Input = styled.select`
  width: ${({ boxwidth }) => {
    switch (boxwidth) {
      case "sm":
        return "64px";
      case "md":
        return "128px";
      case "full":
        return "100%";
      default:
        return "128px";
    }
  }};
  height: 30px;
  padding: 2px 4px;
  border-radius: ${({ borderradius }) => {
    switch (borderradius) {
      case "sm":
        return "4px";
      case "md":
        return "16px";
      case "lg":
        return "50px";
      default:
        return "16px";
    }
  }};
  border: 1px solid #ffffff77;
  font-size: 14px;

  option {
    padding: 4px 8px;
    box-sizing: border-box;
  }
`;

export default function SimpleDropdown({
  label,
  options = [],
  inputboxwidth = "sm",
  onChange = () => {},
  defaultValue = "",
  borderRadius = "sm",
}) {
  const [oldDefaultValue, setOldDefaultValue] = useState(defaultValue);
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  useEffect(() => {
    if (oldDefaultValue !== defaultValue) {
      setSelectedValue(defaultValue);
      setOldDefaultValue(defaultValue);
    }
  }, [defaultValue]);

  return (
    <InputContainer>
      <Label>{label}</Label>
      <Input
        boxwidth={inputboxwidth}
        onChange={(e) => {
          setSelectedValue(e.target.value);
          onChange(e.target.value);
        }}
        borderradius={borderRadius}
        defaultValue={defaultValue}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Input>
    </InputContainer>
  );
}
