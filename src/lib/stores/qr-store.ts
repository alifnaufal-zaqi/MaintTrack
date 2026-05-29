import { create } from "zustand";

type QrStore = {
  tag: string;
  setTag: (tag: string) => void;
};

export const useQrStore = create<QrStore>((set) => ({
  tag: "",
  setTag: (tag) => set({ tag }),
}));
