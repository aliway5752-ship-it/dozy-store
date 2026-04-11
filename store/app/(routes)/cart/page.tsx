"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast"; 
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Container from "@/components/ui/container";
import useCart from "@/hooks/use-cart";
import CartItem from "./components/cart-item";
import Summary from "./components/summary";

const EGYPT_GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum", 
  "Gharbia", "Ismailia", "Monufia", "Minya", "Qalyubia", "New Valley", "Sharqia", 
  "Suez", "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta", "South Sinai", 
  "Kafr El Sheikh", "Matrouh", "Luxor", "Qena", "North Sinai", "Sohag"
];

const CartPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCart();
  const [loading, setLoading] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(0);
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone1: '',
    phone2: '',
    governorate: '',
    city: '',
    streetName: '',
    addressDetails: '',
    landmark: '',
    notes: '',
  });

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}`);
        setShippingPrice(response.data.shippingPrice || 0);
      } catch (error) {
        console.error("Failed to fetch store settings", error);
      }
    };
    fetchStore();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.primaryEmailAddress?.emailAddress || prev.email,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
      }));
    }
  }, [user]);

  useEffect(() => {
    setIsMounted(true);

    const success = searchParams.get("success");
    const orderNo = searchParams.get("orderId");

    if (success && orderNo) {
        toast.success((t) => (
          <div className="flex flex-col items-center p-2">
            <p className="font-bold text-lg mb-2">تم تلقي طلبك بنجاح!</p>
            <div className="bg-black text-white text-3xl font-mono px-6 py-3 rounded-lg border-2 border-yellow-500 mb-2">
              {orderNo}
            </div>
            <p className="text-sm text-gray-600 text-center">
              دا الرقم التسلسلي لـ الأوردر بتاعك <br /> 
              <b>اتأكد انك تحفظه</b>
            </p>
            <button 
              onClick={() => toast.dismiss(t.id)}
              className="mt-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold"
            >
              إغلاق (X)
            </button>
          </div>
        ), {
          duration: Infinity,
          position: "top-center",
          style: { minWidth: '350px', border: '2px solid black' }
        });
        
        // بنادي removeAll هنا
        cart.removeAll();
        
        const timer = setTimeout(() => {
            router.push("/");
        }, 10000);

        return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]); 
  // ملاحظة: تم إضافة تعليق eslint أعلاه لإخفاء التحذير الخاص بـ 'cart' 
  // لأن إضافته ستسبب Infinite Loop كما شرحنا سابقاً.

  if (!isMounted) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value.replace(/\D/g, ""); 
    setFormData({ ...formData, [field]: value });
  };

  const onCheckout = async () => {
    try {
      if (!formData.email || !formData.phone1 || !formData.governorate || !formData.firstName || !formData.streetName) {
        return toast.error("يرجى ملء البيانات الأساسية");
      }

      setLoading(true);

      const requestData = {
        cartItems: cart.items.flatMap((item) => 
          Array(item.quantity).fill({ id: item.id })
        ),
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone1,
        backupPhone: formData.phone2,
        email: formData.email,
        address: `${formData.governorate}, ${formData.city}, ${formData.streetName}, ${formData.addressDetails}`,
        notes: formData.notes,
        landmark: formData.landmark,
        customerId: user?.id || null,
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, requestData);

      if (response.data.url) {
        window.location = response.data.url;
      }
      
    } catch (error: any) {
      toast.error("حدث خطأ في السيرفر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-black">Shopping Cart</h1>
            <Link
              href="/"
              className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Continue Shopping
            </Link>
          </div>
          <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start gap-x-12">
            <div className="lg:col-span-7">
              {cart.items.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-500 mb-4">Your cart is empty.</p>
                  <Link
                    href="/"
                    className="inline-block bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
              <ul className="space-y-4">
                {cart.items.map((item) => (
                  <CartItem key={item.id} data={item} />
                ))}
              </ul>

              <div id="delivery-info" className="mt-12 bg-gray-50 p-8 rounded-3xl space-y-4">
                <h2 className="text-2xl font-bold mb-6">بيانات التوصيل</h2>
                <div className="grid grid-cols-1 gap-4 text-black">
                  <input placeholder="البريد الإلكتروني" className="p-4 rounded-xl border bg-white" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="الاسم الأول" className="p-4 rounded-xl border bg-white" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                    <input placeholder="الاسم الأخير" className="p-4 rounded-xl border bg-white" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="tel" placeholder="رقم الهاتف" className="p-4 rounded-xl border bg-white" value={formData.phone1} onChange={(e) => handlePhoneChange(e, "phone1")} />
                    <input type="tel" placeholder="رقم هاتف احتياطي" className="p-4 rounded-xl border bg-white" value={formData.phone2} onChange={(e) => handlePhoneChange(e, "phone2")} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select value={formData.governorate} onChange={(e) => setFormData({ ...formData, governorate: e.target.value })} className="p-4 rounded-xl border bg-white">
                      <option value="">اختر المحافظة</option>
                      {EGYPT_GOVERNORATES.map((gov) => (<option key={gov} value={gov}>{gov}</option>))}
                    </select>
                    <input placeholder="المنطقة / المدينة" className="p-4 rounded-xl border bg-white" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <input placeholder="اسم الشارع" className="p-4 rounded-xl border bg-white" value={formData.streetName} onChange={(e) => setFormData({...formData, streetName: e.target.value})} />
                  <input placeholder="رقم المبنى، الدور، الشقة" className="p-4 rounded-xl border bg-white" value={formData.addressDetails} onChange={(e) => setFormData({...formData, addressDetails: e.target.value})} />
                  <input placeholder="علامة مميزة للعنوان (Landmark)" className="p-4 rounded-xl border bg-white" value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})} />
                  <textarea placeholder="ملاحظات إضافية للتوصيل" className="p-4 rounded-xl border bg-white min-h-[100px]" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                  <div className="pt-4">
                    <button disabled={loading || cart.items.length === 0} onClick={onCheckout} className="w-full bg-[#1b4332] text-white py-4 rounded-full font-bold hover:opacity-90 transition disabled:bg-gray-400">
                      {loading ? "جاري المعالجة..." : "إتمام الطلب (دفع عند الاستلام)"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <Summary 
                shippingPrice={shippingPrice}
                onProceed={() => document.getElementById("delivery-info")?.scrollIntoView({ behavior: "smooth" })} 
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CartPage;