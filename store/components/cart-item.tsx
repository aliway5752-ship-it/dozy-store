import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types';
import { toast } from 'react-hot-toast';

interface CartStore {
  items: (Product & { quantity: number })[];
  addItem: (data: Product) => void;
  removeItem: (id: string) => void;
  decrementItem: (id: string) => void; // إضافة تعريف الدالة هنا
  removeAll: () => void;
}

const useCart = create<CartStore>()(
  persist((set, get) => ({
    items: [],
    addItem: (data: Product) => {
      const currentItems = get().items;
      const existingItem = currentItems.find((item) => item.id === data.id);

      if (existingItem) {
        // لو المنتج موجود بنزود الكمية
        const updatedItems = currentItems.map((item) =>
          item.id === data.id ? { ...item, quantity: item.quantity + 1 } : item
        );
        set({ items: updatedItems });
      } else {
        // لو جديد بنضيفه وبنبدأ الكمية بـ 1
        set({ items: [...get().items, { ...data, quantity: 1 }] });
      }
      toast.success('Item added to cart.');
    },
    removeItem: (id: string) => {
      set({ items: [...get().items.filter((item) => item.id !== id)] });
      toast.success('Item removed from cart.');
    },
    // الدالة اللي ناقصة عندك واللي هتحل الإيرور
    decrementItem: (id: string) => {
      const currentItems = get().items;
      const existingItem = currentItems.find((item) => item.id === id);

      if (existingItem && existingItem.quantity > 1) {
        const updatedItems = currentItems.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
        set({ items: updatedItems });
      } else {
        // لو الكمية 1 بنشيل المنتج خالص
        set({ items: [...get().items.filter((item) => item.id !== id)] });
      }
    },
    removeAll: () => set({ items: [] }),
  }), {
    name: 'cart-storage',
    storage: createJSONStorage(() => localStorage)
  })
);

export default useCart;