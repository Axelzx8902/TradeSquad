import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', 
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor to inject the Supabase JWT access token on every request
api.interceptors.request.use((config) => {
    // Assuming your application uses Supabase JS client or stores the auth session somewhere.
    // For manual handling, ensure your token is saved appropriately.
    const sessionStr = localStorage.getItem('sb-auth-token'); 
    
    if (sessionStr) {
        try {
            // Adjust this parsing based on exactly how you store the session
            const session = JSON.parse(sessionStr); 
            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }
        } catch (e) {
            // If it's a raw string instead of JSON object
            config.headers.Authorization = `Bearer ${sessionStr}`;
        }
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

export const fetchScoutMarket = async () => {
    const res = await api.get(`/v1/market/scout`);
    return res.data;
};

export const fetchMarketNews = async () => {
    const res = await api.get(`/v1/news`);
    return res.data;
};

export const fetchUserProfileStats = async () => {
    const res = await api.get(`/v1/users/me/stats`);
    return res.data;
};

export const buyAsset = async (assetId, quantity = 1) => {
    const res = await api.post(`/buy`, {
        asset_id: assetId,
        quantity // user_id is stripped; derived by backend from JWT securely
    });
    return res.data;
};

export default api;
