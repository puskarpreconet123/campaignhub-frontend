import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { RefreshCw, ExternalLink, CheckCircle2, AlertCircle, Clock, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminCampaigns = ({ filter = "" }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);


  // for pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [limitInput, setLimitInput] = useState();
  const [totalPages, setTotalPages] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0)

  // search query
  const[search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
// to handle search
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 700);

  return () => clearTimeout(timer);
}, [search]);

//to handle limit
  useEffect(() => {
  const timer = setTimeout(() => {
    if (limitInput > 0) {
      setLimit(Number(limitInput));
      setPage(1); // reset pagination when limit changes
    }
  }, 500);

  return () => clearTimeout(timer);
}, [limitInput]);

// for go back to starting page when any of the query initiated
  useEffect(() => {
  setPage(1);
}, [filter,debouncedSearch, limit]);

// fetch all data according to filters
  useEffect(() => {
    const controller = new AbortController()
      const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/admin/all-campaigns?page=${page}&limit=${limit}&status=${filter}&search=${debouncedSearch}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      });
      
      if (page > res.data.totalPages) {
        setPage(res.data.totalPages || 1);
      }

      // Updated mapping to handle the new .populate() structure
      const formattedCampaigns = res.data.campaigns || []
      setCampaigns(formattedCampaigns);

      setTotalPages(res.data.totalPages)
      setTotalCampaigns(res.data.totalCampaigns)
      
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  }
    fetchAllData();
      return () => {
    controller.abort();
  };
  }, [limit, page, filter, debouncedSearch]);

  const handleStatusUpdate = async (campaignId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/admin/campaign/${campaignId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setCampaigns((prev) =>
        prev.map((c) => (c._id === campaignId ? { ...c, status: newStatus } : c))
      );

      // --- THE FIX ---
      // This tells the Dashboard Header to refresh the Admin's credits 
      // immediately (important for refunds/deductions)
      window.dispatchEvent(new Event("userUpdated"));

    } catch {
      alert("Failed to update status.");
    }
  };

  const statusOptions = [
    { id: "pending", label: "Pending", color: "bg-amber-400" },
    { id: "processing", label: "Processing", color: "bg-blue-400" },
    { id: "completed", label: "Completed", color: "bg-emerald-400" },
    { id: "rejected", label: "Rejected", color: "bg-red-400" }
  ];

  const getStatusConfig = (status) => {
    // Cleaner object-based lookup instead of switch
    const config = {
      completed: { label: 'Completed', styles: 'bg-emerald-50 text-emerald-600', icon: <CheckCircle2 size={14}/> },
      processing: { label: 'Processing', styles: 'bg-blue-50 text-blue-600', icon: <RefreshCw size={14} className="animate-spin"/> },
      rejected: { label: 'Rejected', styles: 'bg-red-50 text-red-600', icon: <AlertCircle size={14}/> },
      pending: { label: 'Pending', styles: 'bg-amber-50 text-amber-600', icon: <Clock size={14}/> }
    };
    return config[status] || config.pending;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 space-y-4">
        <RefreshCw className="animate-spin text-emerald-600" size={40} />
        <p className="text-slate-500 text-xs tracking-widest animate-pulse">Loading Campaign Ledger...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
<div className="p-6 border-b border-slate-100 bg-slate-50/50 
                flex items-center justify-between">
  
  <h3 className="font-black text-slate-600 uppercase text-xs tracking-widest flex items-center gap-2">
   <History size={16} /> Campaign Log
  </h3>

  <p className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {totalCampaigns === 0
              ? 0
              : (page - 1) * limit + 1}
          </span>{" "}
          –{" "}
          <span className="font-semibold text-slate-800">
            {Math.min(page * limit, totalCampaigns)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">
            {totalCampaigns}
          </span>
        </p>

</div>

   <div className="p-4 border-b border-slate-100 bg-white">
  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
    
    {/* Search */}
    <div className="relative w-full sm:w-72">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value) }
        placeholder="Search campaigns ..."
        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200
                   focus:outline-none focus:ring-2 focus:ring-emerald-500
                   focus:border-emerald-500 transition shadow-sm
                   placeholder:text-slate-400"
      />
      {search && (
        <button
          onClick={() => setSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      )}
    </div>

    {/* Limit selector */}
    <div className="w-full sm:w-48">
      <input
        type="number"
        value={limitInput}
        onChange={(e) => setLimitInput(e.target.value)}
        min="1"
        placeholder="Rows per page"
        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200
                   focus:outline-none focus:ring-2 focus:ring-emerald-500
                   focus:border-emerald-500 transition shadow-sm
                   placeholder:text-slate-400"
      />
    </div>

  </div>
</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] text-slate-500 uppercase tracking-widest">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Campaign</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Credits</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Details</th>
              <th className="px-6 py-4">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-20 text-center text-slate-400 italic">No campaigns found.</td>
              </tr>
            ) : (
              campaigns.map((c) => {
                const status = getStatusConfig(c.status);
                return (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 text-xs text-slate-400">{c._id?.slice(-6)?.toUpperCase() || "—"
}</td>
                    <td className="px-6 py-4 text-sm text-slate-800">{c.title}</td>
                    <td className="px-6 py-4 text-sm">
                      <p className="font-medium text-slate-700">{c.userId.email}</p>
                      <p className="text-xs text-slate-400">{c.userEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{c.phoneNumbers?.length || 0}</td>
                    <td className="px-6 py-4 text-[11px] text-slate-500">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}<br />
                      <span className="text-slate-300">{ c.createdAt? new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }): "_"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.styles}`}>
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => navigate(`/admin-dashboard/campaign/${c._id}`)} className="underline text-xs text-slate-600 hover:text-black flex items-center gap-1 justify-center">
                        View Details <ExternalLink size={12} />
                      </button>
                    </td>
                    <td className="px-6 py-4 relative">
                      <button onClick={() => setOpenMenuId(openMenuId === c._id ? null : c._id)} className="px-3 py-1 text-[10px] font-bold uppercase bg-zinc-100 rounded-lg hover:bg-zinc-200">Update</button>
                      {openMenuId === c._id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 mt-2 w-36 bg-white border border-zinc-200 rounded-xl shadow-xl z-40 p-1">
                            {statusOptions.map((opt) => (
                              <button key={opt.id} onClick={() => { handleStatusUpdate(c._id, opt.id); setOpenMenuId(null); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold uppercase hover:bg-zinc-50 ${c.status === opt.id ? "text-zinc-900 bg-zinc-50" : "text-zinc-400"}`}>
                                <div className={`w-2 h-2 rounded-full ${opt.color}`} /> {opt.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* implemented page navigation buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 p-4 bg-slate-50">

          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-white shadow-sm 
                      hover:bg-slate-100 active:scale-95 transition 
                      disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <p className="text-sm font-medium text-slate-600">
            Page <span className="font-semibold text-slate-800">{page}</span> 
            {" "}of{" "}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </p>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-white shadow-sm 
                      hover:bg-slate-100 active:scale-95 transition 
                      disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
    </div>
  );
};

export default AdminCampaigns;