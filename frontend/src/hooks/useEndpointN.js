import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for accessing BookRec's API endpoints. Calls the endpoint N times,
 * with N different inputs for the fetch function. Returns an array of responses.
 * @param logoutResponseCodes a list of response codes that will trigger a logout
 * @param endpointFetch function that will call a `fetch` to the endpoint.
 *     must be a `fetch` since this hook relies on the `fetch` API.
 *     Takes a parameter as input and returns the associated fetch.
 *     Parameter is passed by user via callEndpoint(param).
 * @param callback function that will be called after the fetch is complete with the response.
 */
// eslint-disable-next-line max-len
export default function useEndpointN(logoutResponseCodes, endpointFetch) {
  const navigate = useNavigate();
  const [responseCodes, setResponseCodes] = useState([]);
  const [responses, setResponses] = useState([]);

  const callEndpoint = async (param, callback) => {
    const res = await endpointFetch(param);
    const { status } = res;
    const ct = res.headers.get('content-type');
    const isJson = ct && ct.includes('application/json');
    const response = isJson ? await res.json() : await res.text();
    setResponses((prev) => [...prev, response]);

    // MUST set response code after setting response, otherwise useEffect's that depend
    // on `responseCode` will be called but `response` will not be set yet.
    setResponseCodes((prev) => [...prev, status]);

    if (logoutResponseCodes.includes(status)) {
      navigate('/logout-invalid');
    }

    if (callback) {
      callback(response, status);
    }
  };

  return [
    responseCodes, responses, callEndpoint,
  ];
}
