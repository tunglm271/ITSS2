import axios from "axios";

const API_URL = "https://itss-2-be-sigma.vercel.app";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});


export const shopsAPI = {
    getAll: () => api.get("/shops"),
    getById: (id) => api.get(`/shops/${id}`),
    search: (query) => api.get(`/shops?q=${query}`),
    filter: (params) => api.get("/shops", { params }),
};

export const ordersAPI = {
    create: (orderData) => api.post("/orders", orderData),
    getAll: () => api.get("/orders"),
    getById: (id) => api.get(`/orders/${id}?_expand=shop`),
    updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),
};

export default api;
