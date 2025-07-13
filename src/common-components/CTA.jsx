import React from "react";
import styled from "styled-components";

const CTAWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${(props) => (props.width === "stretched" ? "100%" : "fit-content")};
  padding: 8px 16px;
  background: ${(props) =>
    props.is_disabled === "true"
      ? " #222222"
      : props.add_caution === "true"
      ? " #AA0000"
      : " #097e11"};
  border-radius: 4px;
  color: white;
  cursor: pointer;
`;

export default function CTA({
  isStretched = false,
  isDisabled = false,
  addCaution = false,
  onClick = () => {},
  children,
}) {
  return (
    <CTAWrapper
      width={isStretched ? "stretched" : ""}
      is_disabled={`${isDisabled}`}
      add_caution={`${addCaution}`}
      onClick={() => !isDisabled && onClick()}
    >
      {children}
    </CTAWrapper>
  );
}
