import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Clock,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Calendar,
  AlertCircle,
  XCircle,
  Users,
  ChevronRight,
  ChevronLeft,
  History
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserCampaignHistory = () => {
  const navigate = useNavigate();

  /* ================================
     STATE
  ================================= */

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limitInput, setLimitInput] = useState();
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  // Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* ================================
     DEBOUNCE SEARCH
  ================================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 600);

    return () => clearTimeout(timer);
  }, [search]);

  /* ================================
     DEBOUNCE LIMIT
  ================================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (limitInput > 0) {
        setLimit(Number(limitInput));
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [limitInput]);

  /* ================================
     RESET PAGE ON FILTER CHANGE
  ================================= */
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  /* ================================
     FETCH CAMPAIGNS
  ================================= */
  useEffect(() => {
    const controller = new AbortController();

    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:5000/api/user/campaign`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              page,
              limit,
              search: debouncedSearch
            },
            signal: controller.signal
          }
        );

        if (page > res.data.totalPages) {
          setPage(res.data.totalPages || 1);
        }

        setCampaigns(res.data.campaigns || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCampaigns(res.data.totalCampaigns || 0);
        setError("");

      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err.response?.data?.message || "Failed to fetch campaigns");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
    return () => controller.abort();
  }, [page, limit, debouncedSearch]);

  /* ================================
     STATUS CONFIG
  ================================= */
  const getStatusConfig = (status) => {
    const config = {
      completed: {
        label: "Completed",
        styles: "bg-emerald-50 text-emerald-600",
        icon: <CheckCircle2 size={14} />
      },
      processing: {
        label: "Processing",
        styles: "bg-blue-50 text-blue-600",
        icon: <RefreshCw size={14} className="animate-spin" />
      },
      rejected: {
        label: "Rejected",
        styles: "bg-red-50 text-red-600",
        icon: <AlertCircle size={14} />
      },
      pending: {
        label: "Pending",
        styles: "bg-amber-50 text-amber-600",
        icon: <Clock size={14} />
      }
    };

    return config[status] || config.pending;
  };

  /* ================================
     LOADING STATE
  ================================= */
  if (loading && campaigns.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-24 space-y-4">
        <RefreshCw className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 text-xs tracking-widest animate-pulse">
          Loading Campaign History...
        </p>
      </div>
    );
  }

  /* ================================
     RENDER
  ================================= */
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
      
        <h3 className="font-black flex items-center gap-2 text-slate-600 uppercase text-xs tracking-widest">
         <History size={16}/>Campaign History
        </h3>

        <p className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {totalCampaigns === 0 ? 0 : (page - 1) * limit + 1}
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

      {/* Search + Limit */}
      <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search campaigns..."
          className="w-full sm:w-72 px-4 py-2.5 text-sm rounded-xl border border-slate-200
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="number"
          value={limitInput}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || parseInt(val) >= 1) {
              setLimitInput(val);
            }
          }}
          onKeyDown={(e) => {
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

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm flex items-center gap-2">
          <XCircle size={18} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] text-slate-500 uppercase tracking-widest">
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Campaign</th>
              <th className="px-6 py-4">Recipients</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-center">Details</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-20 text-center text-slate-400 italic">
                  No campaigns found.
                </td>
              </tr>
            ) : (
              campaigns.map((camp) => {
                const status = getStatusConfig(camp.status);

                return (
                  <tr key={camp._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.styles}`}>
                        {status.icon} {status.label}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                      {camp.campaignName || camp.title || "Standard Broadcast"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        {camp.phoneNumbers?.length || 0}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-[11px] text-slate-500">
                      {camp.createdAt
                        ? new Date(camp.createdAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/user-dashboard/campaigns/${camp._id}`)}
                        className="underline text-xs text-slate-600 hover:text-black flex items-center gap-1 justify-center"
                      >
                        View Details <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
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

export default UserCampaignHistory;
