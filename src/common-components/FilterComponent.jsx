import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import Fuse from "fuse.js";
// import components
import Searchbar from "./Searchbar";

const FilterOption = styled.div`
  position: absolute;
  z-index: 999;
  top: 24px;
  left: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: black;
  padding: 8px 12px;
  cursor: pointer;
`;

const FuzzyContainer = styled.div`
  position: absolute;
  z-index: 999;
  top: 0px;
  left: 0px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 500px;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  border-right: 1px solid gray;

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
`;

export default function FilterComponent({ topics, onFilterUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState([]);
  const [options, setOptions] = useState([]);
  const [keys, setKeys] = useState([]);
  const [currTopicId, setCurrTopicId] = useState();
  const [filter, setFilter] = useState({});

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
      <FilterOption onClick={() => setIsExpanded(true)}>
        Set filters
      </FilterOption>
    );
  }

  return (
    <FuzzyContainer className="fuzzy-container">
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
