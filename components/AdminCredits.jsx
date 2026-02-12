import React, { useState } from "react";
import axios from "axios";
import { Coins, UserCircle, ArrowRight, ShieldCheck, Info } from "lucide-react";

const AdminCredits = () => {
  const [userId, setUserId] = useState("");
  const [credits, setCredits] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://campaignhub-backend.onrender.com/api/admin/add-credits",
        { userId, credits: Number(credits) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const storageUser = JSON.parse(localStorage.getItem("user"));
      storageUser.credits = res.data.newAdminBalance; 
      localStorage.setItem("user", JSON.stringify(storageUser));

      window.dispatchEvent(new Event("storage"));

      alert(`Success! Your new balance is: ${res.data.newAdminBalance}`);
      setUserId("");
      setCredits("");
    } catch (err) {
      alert(err.response?.data?.message || "Error assigning credits");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 md:mb-10">
        <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 shadow-sm shadow-emerald-100">
          <Coins size={28} className="md:w-8 md:h-8" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-zinc-800">Assign Credits</h2>
          <p className="text-sm text-zinc-500">Increase a user's balance for campaign blasts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        {/* Form Section */}
        <form className="lg:col-span-2 space-y-5 md:space-y-6" onSubmit={handleAssign}>
          {/* User ID Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <UserCircle size={16} className="text-zinc-400" />
              Target User ID
            </label>
            <input
              type="text"
              placeholder="Enter userId"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 md:p-4 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>

          {/* Credits Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <Coins size={16} className="text-zinc-400" />
              Amount to Assign
            </label>
            <input
              type="number"
              placeholder="Enter credit amount"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 md:p-4 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-mono"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              required
            />
          </div>

          {/* Action Button */}
          <button
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg md:text-base ${
              loading
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-200 active:scale-[0.98]"
            }`}
          >
            {loading ? "Processing..." : "Confirm Transaction"}
            {!loading && <ArrowRight size={18} className="text-emerald-400" />}
          </button>
        </form>

        {/* Info/Notice Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={14} />
              Guidelines
            </h4>
            <ul className="space-y-4">
              <li className="text-[13px] md:text-xs text-zinc-600 leading-relaxed flex gap-3">
                <span className="text-emerald-500 mt-1 shrink-0">●</span>
                Ensure User ID is exact to avoid misallocation.
              </li>
              <li className="text-[13px] md:text-xs text-zinc-600 leading-relaxed flex gap-3">
                <span className="text-emerald-500 mt-1 shrink-0">●</span>
                Credits are added to the existing balance.
              </li>
              <li className="text-[13px] md:text-xs text-zinc-600 leading-relaxed flex gap-3">
                <span className="text-emerald-500 mt-1 shrink-0">●</span>
                Transactions are logged for security audits.
              </li>
            </ul>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
            <p className="text-[11px] md:text-[12px] text-emerald-700 font-medium leading-tight">
              Secure administrative action. This will reflect in the user's dashboard immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCredits;