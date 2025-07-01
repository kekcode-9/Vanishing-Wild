import React, { useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import Fuse from "fuse.js";
// import mui icons
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  width: 100%;
  height: 48px;
  // color: white;
  border-radius: 40px;
  border: 1px solid gray;
  padding: 0px 32px;

  @media (max-width: 640px) {
    height: 40px;
  }

  @media (max-width: 480px) {
    padding: 0px 16px;
  }
`;

const Input = styled.input`
  text-decoration: none;
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
`;

export default function Searchbar({
  data = [],
  keys = [],
  placeholder,
  onSelect = () => {},
}) {
  const [options, setOptions] = useState([]);

  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys,
      threshold: 0.4,
    });
  });

  const handleQueryChange = useCallback(
    (query) => {
      if (!query.trim()) return data;
      setOptions(fuse.search(query).map((result) => result.item));
    },
    [fuse]
  );

  return (
    <SearchWrapper>
      <SearchRoundedIcon />
      <Input
        type="text"
        placeholder={placeholder || "Search"}
        onChange={(e) => handleQueryChange(e.target.value)}
      />
    </SearchWrapper>
  );
}
