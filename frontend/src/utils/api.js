/**
 * Custom fetch wrapper that adds ngrok-skip-browser-warning header
 * This bypasses ngrok's warning page for free accounts
 */
export const apiFetch = async (url, options = {}) => {
  const headers = {
    "ngrok-skip-browser-warning": "69420",
    "User-Agent": "CustomAgent",
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

export default apiFetch;
