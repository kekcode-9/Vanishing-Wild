import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
// import mui icons
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const SearchbarHolder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: fit-content;
  padding: 0px 16px;
  box-sizing: border-box;
`;

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

/**
 * when hasFacets is false we expect searchMatches to be of the following shape:
 * searchMatches = {
 *  matchedObjs: [
 *    {
 *      ... // an object with any no. of key: value pairs
 *    }
 *  ],
 *  matchKey: String // the key from individual matchedObjs item whose value to show
 * }
 *
 * When a particular key is selected, onSelect will be passed the entire object that the key
 * belongs to
 */
export default function Searchbar({
  onQueryChange = () => {},
  placeholder,
  searchMatches = {},
  hasFacets = true,
  onSelect = () => {},
}) {
  const timeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  const [showMatches, setShowMatches] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const handleQueryChange = useCallback(
    (query) => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
      setShowLoader(true);

      timeoutRef.current = setTimeout(() => {
        query.length >= 3 && onQueryChange(query); // has at least 3 characters
      }, 300);
    },
    [onQueryChange]
  );

  useEffect(() => {
    setShowLoader((prev) =>
      Object.keys(searchMatches).length === 0 ? prev : false
    );
  }, [searchMatches]);

  return (
    <SearchbarHolder className="searchbar-holder">
      <SearchWrapper className="searchbar-wrapper">
        <SearchRoundedIcon />
        <Input
          className="search-input"
          type="text"
          ref={searchInputRef}
          placeholder={placeholder || "Search"}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setShowMatches(true)}
        />
        {Object.keys(searchMatches).length && showMatches ? (
          <>
            {hasFacets ? (
              <SearchMatchesListWrapper className="search-mathces-wrapper">
                {Object.keys(searchMatches).map((facetName, _) => {
                  return (
                    <FacetBox key={facetName}>
                      <div className="facet-header">{facetName}</div>
                      <>
                        {searchMatches[facetName].length > 0 &&
                          searchMatches[facetName].map((match, index) => {
                            return (
                              <div
                                className="matched-item"
                                key={match[0] + index}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  onSelect(facetName, match);
                                  searchInputRef.current.value =
                                    match[0].replaceAll("_", " ");
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
            ) : (
              <SearchMatchesListWrapper className="search-mathces-wrapper">
                {searchMatches?.matchedObjs?.map((matchedItem, i) => {
                  return (
                    <div
                      className="matched-item"
                      key={matchedItem[searchMatches.matchKey] + i}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        onSelect(matchedItem);
                        searchInputRef.current.value =
                          matchedItem[searchMatches.matchKey];
                        setShowMatches(false);
                      }}
                    >
                      {matchedItem[searchMatches.matchKey]}
                    </div>
                  );
                })}
              </SearchMatchesListWrapper>
            )}
          </>
        ) : showLoader ? (
          <SearchMatchesListWrapper className="search-mathces-wrapper">
            <div>Loading...</div>
          </SearchMatchesListWrapper>
        ) : (
          <></>
        )}
      </SearchWrapper>
    </SearchbarHolder>
  );
}
