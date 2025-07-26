import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
// import mui icons
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const SearchWrapper = styled.div`
  position: relative;
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

const SearchMatchesListWrapper = styled.div`
  position: absolute;
  top: 52px;
  left: 0px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  width: 100%;
  height: 600px;
  overflow: auto;
  padding: 16px;
  border: 1px solid #ffffff45;
  border-radius: 8px;
  background: #222222;
  color: white;
`;

const FacetBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  height: 200px;
  overflow: auto;
  border: 1px solid #ffffff45;
  border-radius: 8px;

  .facet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: fit-content;
    padding: 6px;
    background: black;
  }

  .matched-item {
    padding-left: 6px;
  }
`;

export default function Searchbar({
  onQueryChange = () => {},
  placeholder,
  searchMatches = {},
  hasFacets = false,
  onSelect = () => {},
}) {
  const timeoutRef = useRef(null);
  const [showMatches, setShowMatches] = useState(false);

  const handleQueryChange = useCallback((query) => {
    timeoutRef.current && clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      onQueryChange(query);
    }, 300);
  }, []);

  useEffect(() => {
    console.log("searchMatches received: ", searchMatches);
  }, [searchMatches]);

  return (
    <SearchWrapper>
      <SearchRoundedIcon />
      <Input
        type="text"
        placeholder={placeholder || "Search"}
        onChange={(e) => handleQueryChange(e.target.value)}
        onFocus={() => setShowMatches(true)}
      />
      {(Object.keys(searchMatches).length && showMatches) ? (
        <SearchMatchesListWrapper className="search-mathces-wrapper">
          {Object.keys(searchMatches).map((facetName, _) => {
            return (
              <FacetBox key={facetName}>
                <div className="facet-header">{facetName}</div>
                <>
                  {searchMatches[facetName].length > 0 &&
                    searchMatches[facetName].map((match, _) => {
                      return (
                        <div 
                          className="matched-item" 
                          key={match[0]}
                          style={{cursor: "pointer"}}
                          onClick={() => {
                            onSelect(facetName, match);
                            setShowMatches(false);
                          }}
                        >
                          {match[0].replaceAll("_", " ")}
                        </div>
                      );
                    })}
                </>
              </FacetBox>
            );
          })}
        </SearchMatchesListWrapper>
      ) : <></>}
    </SearchWrapper>
  );
}
