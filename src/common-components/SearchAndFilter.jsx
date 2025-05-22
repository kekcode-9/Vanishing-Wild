import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Fuse from "fuse.js";
// import components
import Searchbar from "./Searchbar";

const FilterOption = styled.div`
  flex-shrink: 0;
  position: ${(props) => props.position};
  z-index: 999;
  ${(props) => {
    switch (props.location) {
      case "topLeft":
        return `top: 24px;
          left: 0px;`;
      default:
        return;
    }
  }}
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.bg};
  padding: 8px 12px;
  cursor: pointer;
`;

const FuzzyContainer = styled.div`
  position: ${(props) => props.position};
  z-index: 999;
  ${(props) => {
    switch (props.location) {
      case "topLeft":
        return `top: 0px;
          left: 0px;`;
      case "topRight":
        return `top: 0px;
          right: 0px;`;
      default:
        return;
    }
  }}
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 500px;
  height: ${(props) => props.height};
  box-sizing: border-box;
  overflow: hidden;
  ${(props) => {
    switch (props.border) {
      case "right":
        return `border-right: 1px solid gray;`;
      default:
        return;
    }
  }}

  @media (max-width: 1240px) {
    width: 300px;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const CloseButton = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 16px;
  background: black;
  color: white;
  cursor: pointer;
`;

const FuzzySearchWrapper = styled.div`
  flex-shrink: 0;
  width: 100%;
  height: fit-content;
`;

const OptionsListWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  width: 100%;
  height: ${(props) => props.height};
  padding: 24px;
  background: #000000dd;
  backdrop-filter: blur(10px);
`;

const TopicWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  width: 100%;
  max-height: 50%;
  height: fit-content;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding-left: 12px;
  // max-height: 70%;
  overflow: scroll;

  /* Hide scrollbar but allow scroll */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

export default function SearchAndFilter({
  topics,
  onFilterUpdate,
  label = "Set filter",
  filterToggleBG = "black",
  filterToggleLocation = "topLeft",
  filterTogglePosition = "absolute",
  fuzzyContainerLocation = "topLeft",
  fuzzyContainerPosition = "absolute",
  height = "100dvh",
  theme = {
    border: "right",
  },
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState([]);
  const [options, setOptions] = useState([]);
  const [keys, setKeys] = useState([]);
  const [currTopicId, setCurrTopicId] = useState();
  const [filter, setFilter] = useState({});

  useEffect(() => {
    if (topics.length === 1) {
      const { list, keys } = topics[0];
      setData(list);
      setKeys(keys);
      setCurrTopicId(0);
      setOptions(list);
    }
  }, [topics]);

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

  const handleTopicChange = useCallback(
    (list, keys, id) => {
      if (id === currTopicId) {
        setData([]);
        setKeys([]);
        setCurrTopicId(-1);
        setOptions([]);
        return;
      }
      setData(list);
      setKeys(keys);
      setCurrTopicId(id);
      setOptions(list);
    },
    [currTopicId]
  );

  const handleFilterUpdate = useCallback(
    (name, value) => {
      const updatedFilter = {
        ...filter,
        [name]: value,
      };
      setFilter(updatedFilter);
      onFilterUpdate(updatedFilter);
    },
    [filter]
  );

  if (!isExpanded) {
    return (
      <FilterOption
        onClick={() => setIsExpanded(true)}
        location={filterToggleLocation}
        bg={filterToggleBG}
        position={filterTogglePosition}
      >
        {label}
      </FilterOption>
    );
  }

  return (
    <FuzzyContainer
      className="fuzzy-container"
      location={fuzzyContainerLocation}
      position={fuzzyContainerPosition}
      border={theme.border}
      height={height}
    >
      <FuzzySearchWrapper with="500px" className="fuzzy-search-wrapper">
        <Searchbar onChange={handleQueryChange} />
      </FuzzySearchWrapper>
      <CloseButton onClick={() => setIsExpanded(false)}>X</CloseButton>
      <OptionsListWrapper height={"100%"} className="options-list-wrapper">
        {topics.map((topic, id) => {
          const { title, list, keys, name } = topic;
          return (
            <TopicWrapper key={title}>
              <div
                onClick={() => handleTopicChange(list, keys, id)}
                style={{ cursor: "pointer" }}
                key={id}
              >
                {title}
              </div>
              {id === currTopicId && (
                <OptionsList>
                  {options?.map((item, i) => {
                    return (
                      <div
                        style={{ cursor: "pointer" }}
                        key={i}
                        onClick={() => handleFilterUpdate(name, item[name])}
                      >
                        {item[name]}
                      </div>
                    );
                  })}
                </OptionsList>
              )}
            </TopicWrapper>
          );
        })}
      </OptionsListWrapper>
    </FuzzyContainer>
  );
}
