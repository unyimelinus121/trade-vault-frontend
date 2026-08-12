import api, { apiOrigin } from "@/app/api/api";

const ratesDataSource = {
  async getAll() {
    const response = await api.get("/getRates");
    return Array.isArray(response.data?.rate) ? response.data.rate : [];
  },

  async create(rate) {
    const formData = new FormData();
    formData.append("cardName", rate.cardName);
    formData.append("cardRate", rate.cardRate);
    formData.append("category", rate.category);
    formData.append("country", rate.country);
    formData.append("card_picture", rate.image);

    const response = await api.post("/addCard", formData);
    return response.data?.rate;
  },

  getImageUrl(path) {
    const imagePath = Array.isArray(path) ? path[0] : path;
    if (!imagePath) return "";
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    return `${apiOrigin}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  },
};

export default ratesDataSource;
