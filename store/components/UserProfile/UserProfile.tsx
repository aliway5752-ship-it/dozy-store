"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { fetchUser, updateUser } from "@/lib/api";
import { Address } from "@/types";
import { Loader2, User, Phone, MapPin, Package, Save, Edit2, X } from "lucide-react";
import { toast } from "react-hot-toast";

const UserProfile = () => {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    fullName: "",
    governorate: "",
    city: "",
    district: "",
    buildingNumber: "",
    landmark: "",
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (isLoaded && user) {
        try {
          const data = await fetchUser();
          if (data) {
            setProfileData(data);
            const defaultAddr = data.addresses?.[0];
            setFormData({
              firstName: data?.firstName || "",
              lastName: data?.lastName || "",
              phone: defaultAddr?.phoneNumber || data?.phone || "",
              address: defaultAddr?.streetName || "",
              fullName: defaultAddr?.fullName || "",
              governorate: defaultAddr?.governorate || "",
              city: defaultAddr?.city || "",
              district: defaultAddr?.district || "",
              buildingNumber: defaultAddr?.buildingNumber || "",
              landmark: defaultAddr?.landmark || "",
            });
          }
        } catch (error) {
          console.error("Failed to load user data", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [isLoaded, user]);

  const onUpdate = async () => {
    try {
      setUpdating(true);
      await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        addressId: profileData?.addresses?.[0]?.id,
        fullName: formData.fullName,
        governorate: formData.governorate,
        city: formData.city,
        district: formData.district,
        buildingNumber: formData.buildingNumber,
        landmark: formData.landmark,
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
      // Refresh data
      const updated = await fetchUser();
      setProfileData(updated);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-luxury-gold" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-white/60">Unable to load profile data</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black/40 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
        {/* Header Section */}
        <div className="relative h-32 bg-gradient-to-r from-luxury-gold/20 to-transparent">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <div className="h-24 w-24 rounded-2xl bg-black border-2 border-luxury-gold/50 overflow-hidden flex items-center justify-center">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-luxury-gold" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="pt-16 pb-8 px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
                {profileData?.firstName} {profileData?.lastName}
              </h1>
              <p className="text-luxury-gold/60 font-medium tracking-widest text-xs uppercase mt-1">
                Premium Member
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-sm font-bold uppercase tracking-widest"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 text-red-500" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 text-luxury-gold" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Fields */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-gold/50" />
                  <input
                    disabled={!isEditing || updating}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-luxury-gold/50 transition-all disabled:opacity-50"
                    placeholder="Enter first name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-gold/50" />
                  <input
                    disabled={!isEditing || updating}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-luxury-gold/50 transition-all disabled:opacity-50"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-gold/50" />
                  <input
                    disabled={!isEditing || updating}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-luxury-gold/50 transition-all disabled:opacity-50"
                    placeholder="+20 123 456 789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                  Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-gold/50" />
                  <input
                    disabled={!isEditing || updating}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-luxury-gold/50 transition-all disabled:opacity-50"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex justify-end">
              <button
                disabled={updating}
                onClick={onUpdate}
                className="flex items-center gap-x-2 px-8 py-3 rounded-xl bg-luxury-gold text-black font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all disabled:opacity-50"
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
