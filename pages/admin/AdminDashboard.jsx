import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  User,
  Coins,
  WalletCards,
  BarChart3,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wallet,
  Menu,
  X,
} from "lucide-react";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Logic remains untouched: deriving state from URL
  const path = location.pathname.split("/")[2] || "users";
  const campaignFilter = location.pathname.split("/")[3] || "";

  useEffect(() => {
  setUser(JSON.parse(localStorage.getItem("user")));
}, []);

useEffect(() => {
  const handleUserUpdate = () => {
    const updatedUser = JSON.parse(localStorage.getItem("user"));
    setUser(updatedUser);
  };

  window.addEventListener("userUpdated", handleUserUpdate);

  return () => {
    window.removeEventListener("userUpdated", handleUserUpdate);
  };
}, []);


  // Sync the campaign dropdown if user refreshes on a sub-route
  useEffect(() => {
    if (path === "campaigns") {
      setIsCampaignOpen(true);
    }
  }, [path]);

  const menuItems = [
    { id: "users", label: "User Management", icon: <Users size={20} /> },
    { id: "credits", label: "Credit Control", icon: <Coins size={20} /> },
    { id: "transactions", label: "Credit History", icon: <WalletCards size={20} /> },
    {
      id: "campaigns",
      label: "Global Campaigns",
      icon: <BarChart3 size={20} />,
      children: [
        { id: "", label: "All Campaigns" },
        { id: "pending", label: "Pending" },
        { id: "processing", label: "Processing" },
        { id: "completed", label: "Completed" },
        { id: "rejected", label: "Rejected" },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const NavContent = () => (
    <>
      <div className="p-6">
        {/* LOGO - Restored exactly from your previous UI */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
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
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* MENU - Restored with hover effects and spacing */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.children) {
                    setIsCampaignOpen((prev) => !prev);
                    navigate("/admin-dashboard/campaigns");
                  } else {
                    navigate(`/admin-dashboard/${item.id}`);
                    setIsCampaignOpen(false);
                  }
                  if (!item.children) setIsSidebarOpen(false);
                } }
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  path === item.id
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "hover:bg-zinc-800/50 hover:text-zinc-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="font-medium text-sm">{item.label}</span>
                </div>

                {item.children ? (
                  isCampaignOpen ? <ChevronUp size={14} className="text-emerald-400" /> : <ChevronDown size={14} className="text-zinc-500 group-hover:text-white" />
                ) : (
                  path === item.id && <ChevronRight size={14} className="text-emerald-400 animate-in slide-in-from-left-2" />
                )}
              </button>

              {/* CAMPAIGN SUB MENU */}
              {item.children && isCampaignOpen && (
                <div className="ml-10 mt-1 space-y-1 border-l border-zinc-800">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => {
                        navigate(
                          child.id
                            ? `/admin-dashboard/campaigns/${child.id}`
                            : "/admin-dashboard/campaigns"
                        );
                        setIsSidebarOpen(false);
                      }}
                      className={`block w-full text-left text-sm px-4 py-2 rounded transition-colors ${
                        campaignFilter === child.id
                          ? "text-emerald-400 font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* SYSTEM HEALTH & LOGOUT */}
      <div className="mt-auto p-6 space-y-4">
        <div className="bg-zinc-800/40 rounded-2xl p-4 border border-zinc-700/30">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">System Health</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <span className="text-xs font-semibold text-zinc-300">Cloud Operational</span>
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
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-zinc-900 text-zinc-300 flex flex-col shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full lg:ml-72">
        {/* HEADER - Modern white/blur style */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
            >
              <Menu size={24} />
            </button>

            <div>
              <h1 className="text-sm md:text-lg font-bold text-slate-800 capitalize leading-none">
                {path.replace("-", " ")}
              </h1>
              <nav className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dashboard</span>
                <ChevronRight size={10} className="text-slate-300" />
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                  {campaignFilter || path}
                </span>
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2 md:gap-3 bg-slate-50 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl border border-slate-100 shadow-sm">
              <div className="bg-emerald-100 p-1.5 rounded-lg">
                <Wallet size={16} className="text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Credits</span>
                <span className="text-xs md:text-sm font-black text-slate-700">
                  {user?.credits?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            <div className="hidden md:block h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{user?.role}</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 border border-indigo-200 shadow-sm">
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT - With scroll and max-width constraint */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="p-4 md:p-8 max-w-6xl mx-auto">
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Outlet />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;