import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw 
} from "lucide-react";

const Login = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("https://campaignhub-backend.onrender.com/api/auth/login", {
        loginId,
        password,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC] p-4 md:p-6">
      <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo/Brand Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-zinc-900 p-3.5 rounded-2xl shadow-xl shadow-zinc-200 mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-zinc-800 tracking-tight">CampaignHub</h1>
          <p className="text-sm text-zinc-500 font-medium">Secure Portal Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl shadow-zinc-200/60 border border-zinc-100 p-6 md:p-10">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-zinc-800">Welcome Back</h2>
            <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-bold">Please enter your details</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-[11px] md:text-xs font-bold text-red-600 leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Identity Input */}
            <div className="space-y-2">
              <label className="text-[10px] md:text-[11px] font-black text-zinc-400 uppercase tracking-wider ml-1">Identity</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-800 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Email or User ID"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-zinc-500/5 focus:border-zinc-500 transition-all placeholder:text-zinc-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] md:text-[11px] font-black text-zinc-400 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-800 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 md:py-4 pl-12 pr-12 text-sm font-medium outline-none focus:ring-4 focus:ring-zinc-500/5 focus:border-zinc-500 transition-all placeholder:text-zinc-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl shadow-zinc-200 mt-4 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-zinc-400" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={18} className="text-zinc-400" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="px-4">
          <p className="text-center mt-8 text-zinc-400 text-[11px] md:text-xs font-medium leading-relaxed">
            Protected by industry standard encryption. <br className="hidden xs:block" />
            Contact support if you've lost your credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;