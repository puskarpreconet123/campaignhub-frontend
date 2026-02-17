import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowDownLeft, ArrowUpRight, History, RefreshCw } from "lucide-react";

const UserCreditHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [userName, setUserName] = useState("")
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/user/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data.history);
        setUserName(res.data.userName.email)
      } catch (err) {
        console.error("Error fetching transactions", err);
      } finally {
        await fetchUserSync()
        setLoading(false);
      }
    };
    fetchHistory();
}, []);

const fetchUserSync = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 1. Update local storage so the data persists
    localStorage.setItem("user", JSON.stringify(res.data));
    
    // 3. BROADCAST: This tells the Navbar to update!
    window.dispatchEvent(new Event("userUpdated"));
    
  } catch (err) {
    console.error("Credit sync failed");
  }
};

  if (loading) {
    return (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
      <RefreshCw className="animate-spin text-indigo-600" size={40} />
      <p className="text-slate-500 text-xs tracking-widest animate-pulse">Fetching Transactions History...</p>
    </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
          <History size={16} /> Transaction Log
        </h3>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-20 text-center text-slate-400 text-sm italic">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Row ID */}
                  <td className="px-6 py-4 text-xs font-medium text-slate-400">
                    {item._id.slice(-6).toUpperCase()}
                  </td>
                  
                  {/* Username (Assumes you populated the user name from backend) */}
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">
                    {userName || "System"}
                  </td>

                  {/* Balance - Math.abs removes signs, text-slate-800 removes colors */}
                  <td className="px-6 py-4 text-sm font-black text-slate-800">
                    {Math.abs(item.amount)}
                  </td>

                  {/* Type - Standard text */}
                 <td className="px-6 py-4">
  <div className={`
    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
    ${item.type === 'credit' 
      ? ' text-emerald-700' 
      : ' text-red-700 '
    }
  `}>
    {item.type === 'credit' ? (
      <ArrowUpRight size={12} strokeWidth={3} />
    ) : (
      <ArrowDownLeft size={12} strokeWidth={3} />
    )}
    {item.type}
  </div>
</td>

                  {/* Date */}
                  <td className="px-6 py-4 text-[10px] font-medium text-slate-500 uppercase">
                    {new Date(item.createdAt).toLocaleDateString()} <br />
                    <span className="text-slate-300">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 text-center">
                    {item.description}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserCreditHistory;