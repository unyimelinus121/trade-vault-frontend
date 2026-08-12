import axios from "axios";

export const apiOrigin = (
  process.env.NEXT_PUBLIC_API_URL || "/api/backend"
).replace(/\/$/, "");

const api = axios.create({
  baseURL: apiOrigin,
});

export default api;
