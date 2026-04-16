"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import useCart from "@/hooks/use-cart";
import Currency from "@/components/ui/currency";
import Image from "next/image";

// قائمة كاملة بـ 27 محافظة مصرية مع أسعار شحن تقديرية
const shippingRates: Record<string, number> = {
    "القاهرة": 50, "الجيزة": 50, "الإسكندرية": 65, "القليوبية": 55, "المنوفية": 70, 
    "الغربية": 70, "الدقهلية": 70, "البحيرة": 75, "دمياط": 75, "الشرقية": 70, 
    "بورسعيد": 70, "السويس": 70, "الإسماعيلية": 70, "كفر الشيخ": 75, "الفيوم": 80, 
    "بني سويف": 80, "المنيا": 85, "أسيوط": 85, "سوهاج": 95, "قنا": 100, 
    "الأقصر": 110, "أسوان": 120, "البحر الأحمر": 120, "الوادى الجديد": 130, 
    "مطروح": 120, "شمال سيناء": 130, "جنوب سيناء": 130
};

const CheckoutPage = () => {
    const cart = useCart();
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "", name: "", phone: "", address: "", governorate: ""
    });

    useEffect(() => { setIsMounted(true); }, []);

    if (!isMounted) return null;

    const itemsPrice = cart.items.reduce((total, item) => total + Number(item.price), 0);
    const shippingPrice = shippingRates[formData.governorate] || 0;
    const totalPrice = itemsPrice + shippingPrice;

    const onPlaceOrder = async () => {
        console.log("🚨 EMERGENCY LOG: STORE CHECKOUT PAGE - onPlaceOrder called");
        try {
            setLoading(true);
            if (!formData.email || !formData.name || !formData.phone || !formData.governorate || !formData.address) {
                return toast.error("يا بطل، كمل كل البيانات عشان نقدر نشحنلك الأوردر.");
            }

            // إرسال البيانات للـ API وتخزينها في جدول الطلبات (Orders)
            console.log("🚨 EMERGENCY LOG: Calling admin API at:", `${process.env.NEXT_PUBLIC_API_URL}/checkout`);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, {
                cartItems: cart.items.map((item) => ({ id: item.id, quantity: item.quantity })),
                email: formData.email,
                name: formData.name,
                phone: formData.phone,
                backupPhone: "",
                address: `${formData.governorate} - ${formData.address}`,
                totalPrice: totalPrice
            });

            window.location = response.data.url;
        } catch (error) {
            // معالجة خطأ الـ JSON اللي ظهرلك قبل كدة
            toast.error("حدث خطأ في الاتصال بالسيرفر، تأكد من تشغيل الـ Admin Dashboard.");
        } finally { setLoading(false); }
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
                
                {/* الجزء الأيسر: بيانات الشحن والدفع */}
                <div className="px-6 py-12 lg:px-16 border-r border-gray-100">
                    <h1 className="text-2xl font-bold mb-10 tracking-widest uppercase text-zinc-800">DOZY STORE</h1>
                    
                    <div className="space-y-10">
                        {/* بيانات الاتصال */}
                        <section>
                            <h2 className="text-lg font-medium mb-4 text-zinc-900">Contact Information</h2>
                            <input 
                                type="email"
                                placeholder="Email address" 
                                className="w-full p-4 border border-zinc-200 rounded-lg focus:ring-1 focus:ring-black outline-none transition bg-zinc-50/30"
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </section>

                        {/* بيانات التوصيل */}
                        <section>
                            <h2 className="text-lg font-medium mb-4 text-zinc-900">Shipping Details</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <input placeholder="Receiver's Full Name" className="p-4 border border-zinc-200 rounded-lg outline-none bg-zinc-50/30 focus:border-zinc-400" 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <select 
                                        className="p-4 border border-zinc-200 rounded-lg outline-none bg-zinc-50/30 cursor-pointer"
                                        onChange={(e) => setFormData({...formData, governorate: e.target.value})}
                                    >
                                        <option value="">Select Governorate</option>
                                        {Object.keys(shippingRates).map(gov => (
                                            <option key={gov} value={gov}>{gov}</option>
                                        ))}
                                    </select>
                                    <input placeholder="Phone Number" className="p-4 border border-zinc-200 rounded-lg outline-none bg-zinc-50/30 focus:border-zinc-400" 
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                </div>

                                <textarea 
                                    placeholder="Detailed Address (Street, Building, Apartment)" 
                                    className="p-4 border border-zinc-200 rounded-lg outline-none bg-zinc-50/30 h-24 focus:border-zinc-400"
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                        </section>

                        {/* طريقة الدفع (خيار واحد فقط) */}
                        <section>
                            <h2 className="text-lg font-medium mb-4 text-zinc-900">Payment Method</h2>
                            <div className="p-4 border-2 border-black rounded-lg flex items-center justify-between bg-zinc-50">
                                <span className="font-semibold text-sm">Cash on Delivery (COD)</span>
                                <div className="w-4 h-4 rounded-full bg-black border-4 border-zinc-300"></div>
                            </div>
                        </section>

                        <button 
                            disabled={loading || cart.items.length === 0}
                            onClick={onPlaceOrder}
                            className="w-full bg-black text-white py-6 rounded-lg font-bold hover:bg-zinc-800 transition-all duration-300 disabled:bg-zinc-300 uppercase tracking-widest shadow-xl"
                        >
                            {loading ? "Processing..." : "Complete Purchase"}
                        </button>
                    </div>
                </div>

                {/* الجزء الأيمن: ملخص الطلب مع اللون والمقاس */}
                <div className="bg-zinc-50/50 px-6 py-12 lg:px-16">
                    <div className="sticky top-12 space-y-8">
                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-100 last:border-0">
                                    <div className="flex items-center gap-5">
                                        <div className="relative w-20 h-20 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                                            <Image src={item.images[0].url} alt={item.name} fill className="object-cover" />
                                            <span className="absolute -top-1 -right-1 bg-zinc-800 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white font-bold">1</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-zinc-800">{item.name}</span>
                                            {/* إظهار اللون والمقاس بوضوح */}
                                            <span className="text-xs text-zinc-500 mt-1 uppercase tracking-tighter">
                                                Color: {item.color?.name || "N/A"} | Size: {item.size?.name || "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-zinc-900"><Currency value={item.price} /></span>
                                </div>
                            ))}
                        </div>

                        {/* ملخص الحساب النهائي */}
                        <div className="border-t border-zinc-200 pt-8 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Subtotal</span>
                                <span className="font-bold text-zinc-800"><Currency value={itemsPrice} /></span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Shipping (Egypt)</span>
                                <span className="font-bold text-zinc-800 italic">
                                    {formData.governorate ? <Currency value={shippingPrice} /> : "Waiting for address..."}
                                </span>
                            </div>
                            <div className="flex justify-between text-2xl font-black pt-6 border-t border-zinc-200 text-zinc-900">
                                <span>Total</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xs font-normal text-zinc-400 uppercase">EGP</span>
                                    <Currency value={totalPrice} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;