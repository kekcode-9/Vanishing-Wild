import React from "react";
import styled from "styled-components";

const StyledCheckboxDiv = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export default function Checkbox({
  name,
  value,
  label,
  isChecked=false,
  onCheckChange = () => {},
}) {
  return (
    <StyledCheckboxDiv className="styled-checkbox-div">
      <input type="checkbox" name={name} value={value} onClick={() => onCheckChange(value)}/>
      <label>{label}</label>
    </StyledCheckboxDiv>
  );
}
