import { create } from 'zustand';
import { fetchUserProfileStats } from '../api';

const useUserStore = create((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    const currentProfile = get().profile;
    // Don't refetch if we already have it! (Per User Request: "hold this globally so I don't have to fetch it every time")
    if (currentProfile) return;

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
}));

export default useUserStore;
