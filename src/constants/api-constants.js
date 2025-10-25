export const API_ENDPOINTS = {
    FILTER_OPTIONS: "/lpi-filter-options",
    SIGHTINGS: {
        MAIN: "/lpi-observations",
        FILTER_OPTIONS: "/lpi-observations/filter-options",
    },
    POPULATION_TREND_CHART: {
        MAIN: "/population-trend-chart",
    },
    GBIF_TILES: "gbif-tiles",
    GBIF_SPECIES: {
        SUGGEST: "/gbif-species/search", // proxy for api.gbif.org/v1/species/suggest
        REDLIST_CATEGORY: "/gbif-species/redlist" // proxy for api.gbif.org/v1/species/${usageKey}/iucnRedListCategory
    }
}
export const QUERY_STRINGS = {
    FILTER_BY: "filter_by",
    SPECIES: "Species",
    COMMON_NAME: "Common_name",
    COUNTRY: "Country",
    BINOMIAL: "Binomial",
}
export const RESPONSE_KEYS = {
    SPECIES: "Species",
    COMMON_NAME: "Common_name",
    COUNTRY: "Country",
    BINOMIAL: "Binomial"
}