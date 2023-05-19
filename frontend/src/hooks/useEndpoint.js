import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for accessing BookRec's API endpoints. Includes functionality for
 * logging out if the response code is in the list of logoutResponseCodes, and
 * for parsing the response as JSON if the content type is application/json.
 * @param logoutResponseCodes a list of response codes that will trigger a logout
 * @param endpointFetch function that will call a `fetch` to the endpoint.
 *     must be a `fetch` since this hook relies on the `fetch` API.
 */
// eslint-disable-next-line max-len
export default function useEndpoint(logoutResponseCodes, endpointFetch) {
  const navigate = useNavigate();
  const [responseCode, setResponseCode] = useState(0);
  const [response, setResponse] = useState(null);
  const [contentType, setContentType] = useState({});

  const callEndpoint = async () => {
    const res = await endpointFetch();
    const { status } = res;
    const ct = res.headers.get('content-type');
    setContentType(ct);

    if (ct.includes('application/json')) {
      const json = await res.json();
      setResponse(json);
    } else {
      setResponse(await res.text());
    }

    // MUST set response code after setting response, otherwise useEffect's that depend
    // on `responseCode` will be called but `response` will not be set yet.
    setResponseCode(status);

    if (logoutResponseCodes.includes(status)) {
      navigate('/logout-invalid');
    }
  };

  return [
    responseCode, response, callEndpoint, contentType,
  ];
}
