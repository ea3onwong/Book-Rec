// prepends the API_ENDPOINT variable to the url and fetches it
// mostly copied from https://stackoverflow.com/a/61797794
export default function fetchEndpoint(url, ...params) {
  return fetch(`${process.env.REACT_APP_API_ENDPOINT}${url}`, ...params);
}
