import { create } from 'zustand';
import { fetchPortfolio } from '../api';

const usePortfolioStore = create((set) => ({
    portfolio: [],
    isLoading: false,
    error: null,
    fetchData: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await fetchPortfolio();
            // data.portfolio is expected to be an array of playing_xi objects joined with market_assets
            const rawPortfolio = data.portfolio || [];
            
            // Map the nested Supabase layout to the flat standard required by Dashboard.jsx
            const formattedPortfolio = rawPortfolio.map((item) => {
                const purchasePrice = Number(item.purchase_price);
                const currentPrice = Number(item.market_assets?.current_price || 0);
                
                // Calculate percentage PnL
                const changePercent = purchasePrice > 0 
                    ? ((currentPrice - purchasePrice) / purchasePrice) *  100 
                    : 0;
                
                return {
                    id: item.id,
                    name: item.market_assets?.asset_name || 'UNKNOWN',
                    ticker: item.market_assets?.ticker_symbol || 'UNK',
                    price: currentPrice,
                    change: parseFloat(changePercent.toFixed(2)),
                    // Mocking standard Brutalist role assignment
                    role: 'AGGRESSIVE OPENER'
                };
            });
            
            set({ portfolio: formattedPortfolio, isLoading: false });
        } catch (err) {
            console.error("Failed to fetch portfolio:", err);
            set({ 
                error: err.response?.data?.detail || err.message || 'Failed to sync with the trading node.',
                isLoading: false 
            });
        }
    }
}));

export default usePortfolioStore;
