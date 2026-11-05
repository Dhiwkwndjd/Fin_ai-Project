import { create } from "zustand";
import { getAccounts, getCategories } from "../api/financeApi";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useReferenceStore = create((set) => ({
  accounts: [],
  categories: [],
  isLoading: true,
  error: "",

  loadReferenceData: async () => {
    try {
      const [accounts, categories] = await Promise.all([getAccounts(), getCategories()]);
      set({ accounts, categories, isLoading: false, error: "" });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  clearReferenceData: () => set({ accounts: [], categories: [], isLoading: true, error: "" }),
}));
