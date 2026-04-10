"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/container";

const OnboardingPage = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    alternativePhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Egypt",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('https://dozy-admin.vercel.app/api/05f25ff6-71b1-4de2-90a8-369b098b1f12/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData,
        }),
      });

      if (res.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col luxury-emerald min-h-screen">
      <Container>
        <div className="flex items-center justify-center min-h-screen py-12">
          <div className="w-full max-w-2xl bg-luxury-emerald/30 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-luxury-gold/10">
            <h1 className="text-4xl font-bold text-white mb-2 text-center uppercase tracking-wider">
              Complete Your Profile
            </h1>
            <p className="text-luxury-gold text-center mb-8">
              Please provide your contact details and address to continue
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-bold mb-2 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                    placeholder="+20 XXX XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-bold mb-2 uppercase tracking-wider">
                    Alternative Phone
                  </label>
                  <input
                    type="tel"
                    name="alternativePhone"
                    value={formData.alternativePhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                    placeholder="+20 XXX XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-bold mb-2 uppercase tracking-wider">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                  placeholder="Street address, building number"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-bold mb-2 uppercase tracking-wider">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                  placeholder="Apartment, floor, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-bold mb-2 uppercase tracking-wider">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                    placeholder="Cairo"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-bold mb-2 uppercase tracking-wider">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                    placeholder="Cairo Governorate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-bold mb-2 uppercase tracking-wider">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                    placeholder="12345"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-bold mb-2 uppercase tracking-wider">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-luxury-gold to-yellow-600 text-black font-black uppercase tracking-wider text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Complete Profile"}
              </button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default OnboardingPage;
