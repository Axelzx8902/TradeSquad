import { create } from 'zustand';
import { fetchUserProfileStats } from '../api';

const useUserStore = create((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async (forceRefetch = false) => {
    const currentProfile = get().profile;
    // Don't refetch if we already have it — unless explicitly forced (e.g. ProfilePage)
    if (currentProfile && !forceRefetch) return;

    set({ isLoading: true, error: null });
    try {
      const data = await fetchUserProfileStats();
      set({ profile: data, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.detail || 'Failed to fetch user stats',
        isLoading: false,
      });
    }
  },

  updateBalance: (newBalance) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, virtual_balance: newBalance } : null
    }));
  },
}));

export default useUserStore;
