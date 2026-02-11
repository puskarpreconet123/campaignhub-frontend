import React, { useState, useEffect } from "react";
import {
  Users,
  User,
  Coins,
  BarChart3,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Wallet,
} from "lucide-react";
import AdminCreateUser from "../../components/AdminCreateUser";
import AdminCredits from "../../components/AdminCredits";
import { useNavigate } from "react-router-dom";
import AdminCampaigns from "../../components/AdminCampaigns";

const AdminDashboard = () => {
  const [active, setActive] = useState("users");
  const navigate = useNavigate();
  // Inside AdminDashboard.jsx
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    const handleStorageUpdate = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };

    // Listen for the custom event we dispatched
    window.addEventListener("storage", handleStorageUpdate);
    return () => window.removeEventListener("storage", handleStorageUpdate);
  }, []);

  const menuItems = [
    { id: "users", label: "User Management", icon: <Users size={20} /> },
    { id: "credits", label: "Credit Control", icon: <Coins size={20} /> },
    {
      id: "campaigns",
      label: "Global Campaigns",
      icon: <BarChart3 size={20} />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-72 bg-zinc-900 text-zinc-300 flex flex-col shadow-2xl z-20 transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={24} className="text-zinc-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-none">
                CampaignHub
              </h2>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">
                admin portal
              </p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  active === item.id
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-900/20"
                    : "hover:bg-zinc-800/50 hover:text-zinc-100 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`${active === item.id ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"}`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {active === item.id && (
                  <ChevronRight
                    size={14}
                    className="text-emerald-500 animate-in slide-in-from-left-2"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto p-6 space-y-4">
          <div className="bg-zinc-800/40 rounded-2xl p-4 border border-zinc-700/30">
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">
              System Health
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
              <span className="text-xs font-semibold text-zinc-300 tracking-wide">
                Cloud Operational
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all rounded-xl w-full text-sm font-medium"
          >
            <LogOut size={18} className="rotate-180" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Modern Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-800 capitalize leading-none">
              {active.replace("-", " ")}
            </h1>
            <nav className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Dashboard
              </span>
              <ChevronRight size={10} className="text-slate-300" />
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                {active}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            {/* Credit Display Badge */}
            <div className="hidden md:flex items-center gap-3 bg-zinc-50 px-4 py-2 rounded-2xl border border-zinc-100 shadow-sm">
              <div className="bg-emerald-100 p-1.5 rounded-lg">
                <Wallet size={16} className="text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 leading-none uppercase tracking-tighter">
                  System Credits
                </span>
                <span className="text-sm font-black text-slate-700">
                  {user.credits.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200"></div>

            {/* Profile Section */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-none">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {user.role}
                </p>
              </div>
              <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 border-2 border-white">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="p-8 max-w-6xl mx-auto">
            {/* Animated Content Rendering */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {active === "users" && (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-zinc-200 p-8">
                  <AdminCreateUser />
                </div>
              )}

              {active === "credits" && (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-zinc-200 p-8">
                  <AdminCredits />
                </div>
              )}


{active === "campaigns" && (
  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
    <AdminCampaigns />
  </div>
)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
