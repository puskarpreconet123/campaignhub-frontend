import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  History,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { Await } from "react-router-dom";

const UserCreditHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [limitInput, setLimitInput] = useState("");
  const [limit, setLimit] = useState(5);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [search, setSearch] = useState("");

  const [type, setType] = useState("");

  const [totalPages, setTotalPages] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);

  /* ---------------- Reset page when filters change ---------------- */
  useEffect(() => {
    setPage(1);
  }, [limit, search, type]);

  /* ---------------- Debounce limit ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      const parsed = Number(limitInput);
      if (!limitInput) return;
      if (parsed > 0) setLimit(parsed);
    }, 600);

    return () => clearTimeout(timer);
  }, [limitInput]);

  /* ---------------- Debounce search ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(debouncedSearch);
    }, 600);

    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  /* ---------------- Fetch Data ---------------- */
  useEffect(() => {
    const controller = new AbortController();

    const fetchUserHistory = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/user/transactions",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, search, limit, type },
            signal: controller.signal
          }
        );
        await fetchUserSync ()
        setTransactions(res.data.history);
        setTotalPages(res.data.totalPages);
        setTotalTransactions(res.data.totalTransactions);

      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Admin Fetch Error", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserHistory();

    return () => controller.abort();
  }, [page, limit, search, type]);

    const fetchUserSync = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem("user", JSON.stringify(res.data));
      window.dispatchEvent(new Event("userUpdated"));
    } catch (err) {
      console.error("Credit sync failed");
    }
  };

  /* ---------------- Loading State ---------------- */
  if (loading && transactions.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-24 space-y-4">
        <RefreshCw className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 text-xs tracking-widest animate-pulse">
          Fetching Transactions History...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-black text-slate-600 uppercase text-xs tracking-widest flex items-center gap-2">
          <History size={16} /> Transaction Log
        </h3>

        <p className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {totalTransactions === 0
              ? 0
              : (page - 1) * limit + 1}
          </span>{" "}
          –{" "}
          <span className="font-semibold text-slate-800">
            {Math.min(page * limit, totalTransactions)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">
            {totalTransactions}
          </span>
        </p>
      </div>

      {/* Search + Limit */}
      <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

        <input
          type="text"
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
          placeholder="Search email or description..."
          className="w-full sm:w-72 px-4 py-2.5 text-sm rounded-xl border border-slate-200
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

<input
  type="number"
  value={limitInput}
  onChange={(e) => {
    const val = e.target.value;
    // SOLUTION: Only update state if the value is empty (allowing backspace) 
    // or if the number is 1 or greater.
    if (val === "" || parseInt(val) >= 1) {
      setLimitInput(val);
    }
  }}
  onKeyDown={(e) => {
    // PREVENT: Typing '-', 'e' (scientific notation), or '+' 
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  }}
  min="1"
  placeholder="Rows per page"
  className="w-full sm:w-40 px-4 py-2.5 text-sm rounded-xl border border-slate-200
             focus:outline-none focus:ring-2 focus:ring-indigo-500"
/>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-4">Ref ID</th>
              <th className="px-6 py-4">By The User</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-mono text-xs text-slate-400">
                  {item._id.slice(-6).toUpperCase()}
                </td>

                <td className="px-6 py-4 font-bold text-slate-700">
                  {item?.user?.email || "System/Deleted"}
                </td>

                <td className="px-6 py-4 font-black text-slate-900">
                  {Math.abs(item.amount)}
                </td>

                <td className="px-6 py-4">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${item.type === "credit"
                        ? "text-emerald-700"
                        : "text-red-700"}`}
                  >
                    {item.type === "credit" ? (
                      <ArrowDownLeft size={12} strokeWidth={3} />
                    ) : (
                      <ArrowUpRight size={12} strokeWidth={3} />
                    )}
                    {item.type}
                  </div>
                </td>

                <td className="px-6 py-4 text-[10px] text-slate-500">
                  {new Date(item.createdAt).toLocaleString()}
                </td>

                  {/* Description */}
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {item.description}
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

{/* Mobile-Friendly Pagination */}
<div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100">
  
  {/* Previous Button */}
  <button
    disabled={page <= 1}
    onClick={() => setPage((p) => p - 1)}
    className="flex items-center justify-center px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 bg-white shadow-sm 
               hover:bg-slate-100 active:scale-95 transition-all 
               disabled:opacity-30 disabled:pointer-events-none text-slate-700"
  >
    <ChevronLeft size={18} className="sm:mr-1" />
    <span className="hidden sm:inline">Previous</span>
  </button>

  {/* Page Indicator */}
  <div className="flex flex-col items-center">
          <p className="text-sm font-medium text-slate-600">
            Page <span className="font-semibold text-slate-800">{page}</span> 
            {" "}of{" "}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </p>
  </div>

  {/* Next Button */}
  <button
    disabled={page >= totalPages}
    onClick={() => setPage((p) => p + 1)}
    className="flex items-center justify-center px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 bg-white shadow-sm 
               hover:bg-slate-100 active:scale-95 transition-all 
               disabled:opacity-30 disabled:pointer-events-none text-slate-700"
  >
    <span className="hidden sm:inline">Next</span>
    <ChevronRight size={18} className="sm:ml-1" />
  </button>
</div>
    </div>
  );
};

export default UserCreditHistory;