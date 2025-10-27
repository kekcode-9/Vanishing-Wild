import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function accessPublicEndpoint(
  endpoint,
  data = {},
  params = {},
  method = "GET",
  contentType = "application/json"
) {
  const query = Object.entries(params).map(
    ([key, value], _) => `${key}=${value}`
  );
  const url =
    baseURL + endpoint + (query.length > 0 ? `/?${query.join("&")}` : "");

  if (method === "GET") {
    return axios({
      method,
      url,
    })
      .then((res) => res.data)
      .catch((err) => err);
  } else {
    return axios({
      method,
      url,
      data,
      headers: {
        "Content-Type": contentType,
      },
    })
      .then((res) => res)
      .catch((err) => err);
  }
}

export function accessPrivateEndpoint(
  endpoint,
  accessToken,
  data,
  params = {},
  method = "GET",
  contentType = "application/json"
) {
  const query = Object.entries(params).map(
    ([key, value], _) => `${key}=${value}`
  );
  const url =
    baseURL + endpoint + (query.length > 0 ? `?${query.join("&")}` : "");

  if (method === "GET") {
    return axios({
      method,
      url,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.data)
      .catch((err) => err);
  } else {
    return axios({
      method,
      url,
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": contentType,
      },
    })
      .then((res) => res)
      .catch((err) => err);
  }
}

export function getThirdPartyData(endpoint, params = {}) {
  const query = Object.entries(params).map(
    ([key, value], _) => `${key}=${value}`
  );
  const url = endpoint + (query.length > 0 ? `/?${query.join("&")}` : "");

  return axios({
    method: "GET",
    url,
  })
    .then((res) => res.data)
    .catch((err) => err);
}
