import React from "react";
import styled from "styled-components";

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background: black;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  padding: 0px 32px;

  @media (max-width: 480px) {
    padding: 0px 16px;
  }
`;

const Input = styled.input`
  text-decoration: none;
  width: 100%;
  height: 100%;
  border: none;
`;

export default function Searchbar({
  placeholder,
  onChange = () => {},
  width = "100%",
  height = "48px",
}) {
  return (
    <SearchWrapper width={width} height={height}>
      <label>&#128269;</label>
      <Input
        type="text"
        placeholder={placeholder || "Search"}
        onChange={(e) => onChange(e.target.value)}
      />
    </SearchWrapper>
  );
}
