import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api`, 
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor to inject the Supabase JWT access token on every request
api.interceptors.request.use(async (config) => {
    try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) {
            config.headers.Authorization = `Bearer ${data.session.access_token}`;
        }
    } catch (err) {
        console.error("Auth token injection failed:", err);
    }
    return config;
}, (error) => Promise.reject(error));

export const fetchUserProfile = async () => {
    const res = await api.get('/users/me');
    return res.data;
};

export const fetchPortfolio = async () => {
    const res = await api.get(`/portfolio`);
    return res.data;
};

export const fetchLessonsStatus = async () => {
    const res = await api.get(`/lessons/status`);
    return res.data;
};

export const fetchAssetByTicker = async (ticker) => {
    const res = await api.get(`/v1/market/asset/${ticker}`);
    return res.data;
};

export const fetchScoutMarket = async () => {
    const res = await api.get(`/v1/market/scout`);
    return res.data;
};

export const fetchMarketNews = async () => {
    const res = await api.get(`/v1/news`);
    return res.data;
};

export const fetchLedger = async (page = 1, pageSize = 10) => {
    const res = await api.get(`/v1/ledger`, { params: { page, page_size: pageSize } });
    return res.data;
};

export const fetchUserProfileStats = async () => {
    const res = await api.get(`/v1/users/me/stats`);
    return res.data;
};

export const fetchMarketLive = async () => {
    const res = await api.get(`/v1/market/live`);
    return res.data;
};

export const fetchMarketStatus = async () => {
    const res = await api.get(`/v1/market/status`);
    return res.data;
};

export const buyAsset = async (assetId, quantity = 1) => {
    const res = await api.post(`/buy`, {
        asset_id: assetId,
        quantity // user_id is stripped; derived by backend from JWT securely
    });
    return res.data;
};

export const sellAsset = async (assetId, quantity = 1) => {
    const res = await api.post(`/sell`, {
        asset_id: assetId,
        quantity
    });
    return res.data;
};

export default api;
