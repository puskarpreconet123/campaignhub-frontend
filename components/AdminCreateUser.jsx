import React, { useState } from "react";
import axios from "axios";
import { UserPlus, Mail, Lock, User, Eye, EyeOff, ShieldAlert, BadgeCheck } from "lucide-react";

const AdminCreateUser = () => {
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://campaignhub-backend.onrender.com/api/admin/create-user",
        {
          name,
          email: loginId,
          password
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("User created successfully");
      setName("");
      setLoginId("");
      setPassword("");
    } catch (err) {
      console.error("error while creating user :",err);
      alert("Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
          <UserPlus size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Provision New User</h2>
          <p className="text-sm text-zinc-500">Register a new client account to the system.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <form className="lg:col-span-2 space-y-6" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <User size={16} className="text-zinc-400" />
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            {/* Login ID / Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <Mail size={16} className="text-zinc-400" />
                Login Email/UserId
              </label>
              <input
                type="text"
                placeholder="john@example.com/ john12"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <Lock size={16} className="text-zinc-400" />
              Secure Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              loading
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 active:scale-[0.98]"
            }`}
          >
            {loading ? "Creating Account..." : "Create User Account"}
            {!loading && <BadgeCheck size={18} />}
          </button>
        </form>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert size={14} />
              Security Policy
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-5 w-5 bg-emerald-100 rounded flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-emerald-700">1</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Default role is set to <b>User</b> with 0 initial credits.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-5 w-5 bg-emerald-100 rounded flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-emerald-700">2</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Login ID must be a unique or valid email address.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-5 w-5 bg-emerald-100 rounded flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-emerald-700">3</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Password should be at least 8 characters long for security.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 text-center px-4">
            Upon creation, the user can immediately log in using the credentials provided above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateUser;