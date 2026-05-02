import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../api/authApi";
import { setUser } from "../redux/slices/authSlice";
import { User, Mail, Shield, MapPin, Phone, Edit2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      dispatch(setUser(data));
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast.error("Failed to refresh profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading && !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-brand-light">
        <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-brand-light p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">My Profile</h1>
          <p className="text-brand-gray font-medium">Manage your personal information and account settings.</p>
        </div>

        <div className="bg-white rounded-[3rem] border border-brand-light overflow-hidden shadow-sm">
          <div className="relative h-48 bg-gradient-to-r from-brand-red to-brand-darkred">
            <div className="absolute -bottom-16 left-12">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-xl">
                <div className="w-full h-full rounded-[2rem] bg-brand-light flex items-center justify-center text-brand-red text-4xl font-black">
                  {user?.name?.charAt(0)}
                </div>
              </div>
            </div>
            <button className="absolute bottom-4 right-8 px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
              Change Cover
            </button>
          </div>

          <div className="pt-20 p-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="flex-1 space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-brand-dark mb-1">{user?.name}</h2>
                  <p className="text-brand-red font-bold uppercase tracking-widest text-xs">{user?.role}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-brand-gray group-hover:text-brand-red group-hover:bg-brand-red/10 transition-all">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                        <p className="font-bold text-slate-800">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-brand-gray group-hover:text-brand-red group-hover:bg-brand-red/10 transition-all">
                        <Shield size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Role & Permissions</p>
                        <p className="font-bold text-slate-800 capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-brand-gray group-hover:text-brand-red group-hover:bg-brand-red/10 transition-all">
                        <Phone size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                        <p className="font-bold text-slate-800">+91 98765 43210</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-brand-gray group-hover:text-brand-red group-hover:bg-brand-red/10 transition-all">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Store</p>
                        <p className="font-bold text-slate-800">Main Warehouse, Mumbai</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button className="flex items-center gap-2 px-8 py-4 bg-brand-dark text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-red transition-all shadow-xl shadow-brand-light">
                <Edit2 size={16} /> Edit Profile
              </button>
            </div>

            <div className="mt-16 pt-8 border-t border-brand-light">
              <h3 className="font-black text-brand-dark uppercase tracking-tighter mb-6">Security Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-6 rounded-[2rem] bg-brand-light/20 border border-brand-light text-left hover:border-brand-red transition-all group">
                  <p className="font-bold text-brand-dark mb-1 group-hover:text-brand-red">Two-Factor Auth</p>
                  <p className="text-xs text-slate-400">Currently Disabled</p>
                </button>
                <button className="p-6 rounded-[2rem] bg-brand-light/20 border border-brand-light text-left hover:border-brand-red transition-all group">
                  <p className="font-bold text-brand-dark mb-1 group-hover:text-brand-red">Password</p>
                  <p className="text-xs text-slate-400">Last changed 3 months ago</p>
                </button>
                <button className="p-6 rounded-[2rem] bg-brand-light/20 border border-brand-light text-left hover:border-brand-red transition-all group">
                  <p className="font-bold text-brand-dark mb-1 group-hover:text-brand-red">Sessions</p>
                  <p className="text-xs text-slate-400">2 active devices</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
