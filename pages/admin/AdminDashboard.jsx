import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
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
import AdminCreateUser from "../../components/adminComponents/AdminCreateUser";
import AdminCredits from "../../components/adminComponents/AdminCredits";
import { useNavigate } from "react-router-dom";
import AdminCampaigns from "../../components/adminComponents/AdminCampaigns";
import AdminCreditHistory from "../../components/adminComponents/AdminCreditHistory";

const AdminDashboard = () => {
  const [active, setActive] = useState("users");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [campaignFilter, setCampaignFilter] = useState("");
const [isCampaignOpen, setIsCampaignOpen] = useState(false);

const location= useLocation()
const isCampaignDetail = location.pathname.includes("/campaign/")

useEffect(() => {
  const path = location.pathname;

  if (path.includes("/campaign/")) {
    // If we are in a detail view, ensure the "Global Campaigns" 
    // sidebar group is expanded and highlighted
    setActive("campaigns");
    setIsCampaignOpen(true);
  } else if (path.includes("transactions")) {
    setActive("transactions");
    setIsCampaignOpen(false)
  } else if (path.includes("credits")) {
    setIsCampaignOpen(false)
    setActive("credits");
  } else {
    // Default to users if at the root admin path
    setIsCampaignOpen(false)
    setActive("users");
  }
}, [location.pathname]);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };
    window.addEventListener("storage", handleStorageUpdate);
    return () => window.removeEventListener("storage", handleStorageUpdate);
  }, []);

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
      { id: "rejected", label: "Rejected" },
      { id: "processing", label: "Processing" },
      { id: "completed", label: "Completed" },
    ],
  },
];


  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const NavContent = () => (
    <>
      <div className="p-6">
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
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => (
  <div key={item.id}>
    <button
      onClick={() => {
        if (item.children) {
          setIsCampaignOpen(!isCampaignOpen);
          setActive("campaigns");
          
          if (isCampaignDetail) {
    navigate("/admin-dashboard");
  }
        } else {
          if (isCampaignDetail) {
    navigate("/admin-dashboard");
  }
          setIsCampaignOpen(false);
          setActive(item.id);
          setIsSidebarOpen(false);
        }
      }}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
        active === item.id
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "hover:bg-zinc-800/50 hover:text-zinc-100"
      }`}
    >
      <div className="flex items-center gap-3">
  {item.icon}
  <span className="font-medium text-sm">{item.label}</span>
  
  
</div>
{/* Logic for the dynamic Chevrons */}
  {item.children ? (
    // If it's the dropdown, show Up when open, Down when closed
    isCampaignOpen ? <ChevronUp size={14} className="text-emerald-400 ml-auto" /> : <ChevronDown size={14} className="text-zinc-500 ml-auto group-hover:text-white" />
  ) : (
    // If it's a standard button, keep your original active indicator
    active === item.id && <ChevronRight size={14} className="text-emerald-400 animate-in slide-in-from-left-2" />
  )}
    </button>

    {item.children && isCampaignOpen && (
      <div className="ml-10 mt-1 space-y-1">
        {item.children.map((child) => (
          <button
            key={child.id}
            onClick={() => {
              setActive("campaigns");
              setCampaignFilter(child.id);
              setIsSidebarOpen(false);
            }}
            className={`block w-full text-left text-sm px-3 py-2 rounded ${
              campaignFilter === child.id
                ? "text-emerald-400"
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

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-zinc-900 text-zinc-300 flex flex-col shadow-2xl 
        transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <NavContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        {/* Modern Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            
            <div>
              <h1 className="text-sm md:text-lg font-bold text-slate-800 capitalize leading-none">
                {active === "users" ? "User Management" : active === "credits" ? "Credit Control" : active === "transactions" ? "Credit History" :"Global Campaigns"}
              </h1>
              <nav className="flex items-center gap-2 mt-1">
                <span className=" xs:inline text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Dashboard
                </span>
                <ChevronRight size={10} className=" xs:inline text-slate-300" />
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                  {active}
                </span>
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Credit Display Badge - Hidden on small mobile */}
            <div className="flex items-center gap-2 md:gap-3 bg-slate-50 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl border border-slate-100 shadow-sm">
              <div className="bg-emerald-100 p-1.5 rounded-lg">
                <Wallet size={16} className="text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 leading-none uppercase tracking-tighter">
                  Credits
                </span>
                <span className="text-xs md:text-sm font-black text-slate-700">
                  {user?.credits?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            <div className="hidden md:block h-8 w-px bg-slate-200"></div>

            {/* Profile Section */}
            <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-none">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {user?.role}
                </p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white">
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isCampaignDetail ? (
                  <Outlet />
                ) : active === "users" ? (
                <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-xl shadow-slate-200/50  border-zinc-200 p-4 md:p-8">
                  <AdminCreateUser />
                </div>
              ):active === "credits" ? (
                <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-xl shadow-slate-200/50  border-zinc-200 p-4 md:p-8">
                  <AdminCredits />
                </div>
              ):active === "campaigns" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <AdminCampaigns filter={campaignFilter} />
                </div>
              ): active === "transactions" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <AdminCreditHistory />
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