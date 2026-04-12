"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import Container from "@/components/ui/container";

const OnboardingPage = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    alternativePhone: "",
    fullName: "",
    streetName: "",
    buildingNumber: "",
    city: "",
    district: "",
    governorate: "",
    landmark: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/profile`, {
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
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                  placeholder="Recipient full name"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-bold mb-2 uppercase tracking-wider">
                  Street Name
                </label>
                <input
                  type="text"
                  name="streetName"
                  value={formData.streetName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                  placeholder="Street name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-bold mb-2 uppercase tracking-wider">
                    Building Number
                  </label>
                  <input
                    type="text"
                    name="buildingNumber"
                    value={formData.buildingNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                    placeholder="Building number"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-bold mb-2 uppercase tracking-wider">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                    placeholder="Nasr City"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-bold mb-2 uppercase tracking-wider">
                    Governorate
                  </label>
                  <select
                    name="governorate"
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                  >
                    <option value="">Select Governorate</option>
                    <option value="Cairo">Cairo</option>
                    <option value="Giza">Giza</option>
                    <option value="Alexandria">Alexandria</option>
                    <option value="Qalyubia">Qalyubia</option>
                    <option value="Sharqia">Sharqia</option>
                    <option value="Dakahlia">Dakahlia</option>
                    <option value="Beheira">Beheira</option>
                    <option value="Kafr El Sheikh">Kafr El Sheikh</option>
                    <option value="Gharbia">Gharbia</option>
                    <option value="Monufia">Monufia</option>
                    <option value="Damietta">Damietta</option>
                    <option value="Port Said">Port Said</option>
                    <option value="Ismailia">Ismailia</option>
                    <option value="Suez">Suez</option>
                    <option value="North Sinai">North Sinai</option>
                    <option value="South Sinai">South Sinai</option>
                    <option value="Faiyum">Faiyum</option>
                    <option value="Beni Suef">Beni Suef</option>
                    <option value="Minya">Minya</option>
                    <option value="Assiut">Assiut</option>
                    <option value="Sohag">Sohag</option>
                    <option value="Qena">Qena</option>
                    <option value="Luxor">Luxor</option>
                    <option value="Aswan">Aswan</option>
                    <option value="Red Sea">Red Sea</option>
                    <option value="New Valley">New Valley</option>
                    <option value="Matrouh">Matrouh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-bold mb-2 uppercase tracking-wider">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-luxury-black/50 border border-luxury-gold/20 text-white focus:outline-none focus:border-luxury-gold transition-colors"
                  placeholder="Near mosque, behind mall, etc."
                />
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
