// Thin fetch wrappers around the backend API.

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

export const getDashboard = () => getJSON('/api/dashboard');
export const getMarkets = () => getJSON('/api/markets');
export const getBrief = () => getJSON('/api/brief');
