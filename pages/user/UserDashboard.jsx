import React, { useState } from "react";
import { 
  PlusCircle, 
  History, 
  LayoutDashboard, 
  LogOut, 
  User, 
  Wallet, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import CreateCampaignForm from "../../components/CreateCampaignForm";
import UserCampaignHistory from "../../components/UserCampaignHistory";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [active, setActive] = useState("history");
  const navigate = useNavigate();
  
  // Safely parse user data
  const user = JSON.parse(localStorage.getItem("user")) || { name: "User", role: "user", credits: 0 };

  const menuItems = [
    { id: "history", label: "My Campaigns", icon: <History size={20} /> },
    { id: "create", label: "Create Campaign", icon: <PlusCircle size={20} /> },
  ];
    
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      
      {/* Sidebar - Indigo Theme */}
      <aside className="w-72 bg-indigo-950 text-indigo-200 flex flex-col shadow-2xl z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-none">CampaignHub</h2>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">User Portal</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  active === item.id
                    ? "bg-indigo-500/10 text-white border border-indigo-500/20 shadow-lg"
                    : "hover:bg-indigo-900/50 hover:text-indigo-100 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${active === item.id ? "text-indigo-400" : "text-indigo-500 group-hover:text-indigo-300"}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {active === item.id && <ChevronRight size={14} className="text-indigo-400 animate-in slide-in-from-left-2" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto p-6 space-y-4">
          <div className="bg-indigo-900/40 rounded-2xl p-4 border border-indigo-800/30">
            <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest mb-2">Account Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
              <span className="text-xs font-semibold text-indigo-100 tracking-wide">Active Professional</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 text-indigo-400 hover:text-white hover:bg-red-500/10 transition-all rounded-xl w-full text-sm font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header - Matching Admin Structure */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-800 capitalize leading-none">
              {active === "create" ? "Launch Campaign" : "Campaign History"}
            </h1>
            <nav className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Workspace</span>
              <ChevronRight size={10} className="text-slate-300" />
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{active}</span>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            {/* Credit Display */}
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <div className="bg-indigo-100 p-1.5 rounded-lg">
                <Wallet size={16} className="text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 leading-none uppercase tracking-tighter">Credits</span>
                <span className="text-sm font-black text-slate-700">{user.credits}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200"></div>

            {/* Profile Section */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-200 shadow-sm">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-6xl mx-auto">
            
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {active === "create" ? "Create New Campaign" : "Campaign Performance"}
              </h1>
              <p className="text-slate-500 mt-1 leading-relaxed">
                {active === "create" 
                  ? "Target your audience with personalized messaging." 
                  : "Review and manage your past communication history."}
              </p>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {active === "create" ? (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 p-8">
                   <CreateCampaignForm userCredits={user.credits} />
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 p-8">
                   <UserCampaignHistory />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;