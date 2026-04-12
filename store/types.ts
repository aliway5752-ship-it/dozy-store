export interface Billboard {
  id: string;
  label: string;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
  billboard: Billboard;
}

export interface Product {
  id: string;
  category: Category;
  name: string;
  price: string;
  isFeatured: boolean;
  size: Size;
  color: Color;
  images: Image[];
  stock: number; // السطر ده هو اللي هيحل إيرور الـ Info
}

export interface Image {
  id: string;
  url: string;
}

export interface Size {
  id: string;
  name: string;
  value: string;
}

export interface Color {
  id: string;
  name: string;
  value: string;
}

export interface Store {
    id: string;
    name: string;
    shippingPrice: number;
    billboardId: string | null;
}

export interface Address {
  id: string;
  fullName: string;
  phoneNumber: string;
  governorate: string;
  city: string;
  district: string;
  streetName: string;
  buildingNumber: string;
  floor: string;
  apartment: string;
  landmark: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
  addresses: Address[];
}
