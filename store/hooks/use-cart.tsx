import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from "react-hot-toast";

import { Product } from "@/types";

interface CartStore {
  items: (Product & { quantity: number })[]; // ربط المنتج بالكمية
  addItem: (data: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  decrementItem: (id: string) => void; // إضافة الدالة اللي كانت ناقصة
  removeAll: () => void;
}

const useCart = create(
  persist<CartStore>((set, get) => ({
    items: [],
    addItem: (data: Product, quantity: number = 1) => {
      const currentItems = get().items;
      const existingItem = currentItems.find((item) => item.id === data.id);

      if (existingItem) {
        // لو المنتج موجود بنزود الكمية بدل ما نطلّع إيرور
        const updatedItems = currentItems.map((item) =>
          item.id === data.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
        set({ items: updatedItems });
        toast.success(`Updated quantity in cart.`);
      } else {
        // إضافة منتج جديد بالكمية المحددة
        set({ items: [...get().items, { ...data, quantity }] });
        toast.success("Item added to cart.");
      }
    },
    removeItem: (id: string) => {
      set({ items: [...get().items.filter((item) => item.id !== id)] });
      toast.success("Item removed from cart.");
    },
    decrementItem: (id: string) => {
      const currentItems = get().items;
      const existingItem = currentItems.find((item) => item.id === id);

      if (existingItem && existingItem.quantity > 1) {
        // تقليل الكمية بواحد
        const updatedItems = currentItems.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
        set({ items: updatedItems });
      } else {
        // لو هي قطعة واحدة بنمسحه خالص
        set({ items: [...get().items.filter((item) => item.id !== id)] });
        toast.success("Item removed from cart.");
      }
    },
    removeAll: () => set({ items: [] }),
  }), {
    name: "cart-storage",
    storage: createJSONStorage(() => localStorage)
  })
);

export default useCart;