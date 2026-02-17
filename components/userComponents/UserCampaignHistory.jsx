import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Download, Clock, CheckCircle2,
  RefreshCw, ExternalLink, User, Calendar,
  AlertCircle, XCircle, Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserCampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const navigate = useNavigate();

  useEffect(() => { 
     fetchCampaigns(); 
  }, []);

  const fetchUserSync = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      window.dispatchEvent(new Event("userUpdated"));
    } catch (err) {
      console.error("Credit sync failed");
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/user/campaign", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(res.data || []);
      setError("");
      await fetchUserSync(); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch campaigns");
    } finally { setLoading(false); }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed': return { label: 'Completed', styles: 'bg-emerald-50 text-emerald-600', icon: <CheckCircle2 size={14}/> };
      case 'processing': return { label: 'Processing', styles: 'bg-blue-50 text-blue-600', icon: <RefreshCw size={14} className="animate-spin"/> };
      case 'rejected': return { label: 'Rejected', styles: 'bg-red-50 text-red-600', icon: <AlertCircle size={14}/> };
      default: return { label: 'Pending', styles: 'bg-amber-50 text-amber-600', icon: <Clock size={14}/> };
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center py-24 space-y-4">
      <RefreshCw className="animate-spin text-indigo-600" size={40} />
      <p className="text-slate-500 text-xs tracking-widest animate-pulse">Syncing Archive...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Campaign History</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <p>Manage and track your previous broadcast performance.</p>
            
          </div>
        </div>

        <button
          onClick={fetchCampaigns}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 text-xs font-medium"
        >
          <RefreshCw size={16}/> Sync Data
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
          <XCircle size={18}/> {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Campaign</th>
              <th className="px-4 py-3 text-left font-medium">Recipients</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-center font-medium">Details</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-16 text-slate-400">
                  No campaigns found yet.
                </td>
              </tr>
            ) : (
              campaigns.map((camp) => {
                const status = getStatusConfig(camp.status);
                return (
                  <tr key={camp._id} className="hover:bg-slate-50">

  <td className="px-4 py-4">
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.styles}`}>
      {status.icon} {status.label}
    </span>
  </td>

  <td className="px-4 py-4 text-slate-700 font-medium">
    {camp.campaignName || camp.title || "Standard Broadcast"}
  </td>

  {/* FIXED RECIPIENT COLUMN */}
  <td className="px-4 py-4 text-slate-600">
    <div className="flex items-center gap-1">
      <Users size={14}/>
      <span>{camp.phoneNumbers?.length || 0}</span>
    </div>
  </td>

  {/* FIXED DATE COLUMN */}
  <td className="px-4 py-4 text-slate-500">
    <div className="flex items-center gap-1">
      <Calendar size={14}/>
      <span>
        {new Date(camp.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric'
        })}
      </span>
    </div>
  </td>

  <td className="px-4 py-4 text-center">
    <span
      onClick={() => navigate(`/user-dashboard/campaign/${camp._id}`)}
      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
    >
      View details <ExternalLink size={14}/>
    </span>
  </td>

</tr>

                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserCampaignHistory;
