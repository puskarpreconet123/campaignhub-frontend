import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Download, Clock, CheckCircle2, FileText, ImageIcon, 
  RefreshCw, ExternalLink, User, Calendar, AlertCircle, 
  XCircle, Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserCampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Added user state to track credits alongside history
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const navigate = useNavigate();

  useEffect(() => { 
     fetchCampaigns(); 
    // fetchUserSync(); // Sync credits whenever history is viewed
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
      const res = await axios.get("https://campaignhub-backend.onrender.com/api/user/campaign", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(res.data || []);
      setError("");
      // Also sync user when they click the manual refresh button
      await fetchUserSync(); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch campaigns");
    } finally { setLoading(false); }
  };

  const downloadFile = (file) => {
    if (!file?.url) return;
    try {
      let fileName = file.publicId?.split("/").pop() || "download";
      let downloadUrl = file.url;
      if (file.type === "image") {
        downloadUrl = downloadUrl.replace("/upload/", "/upload/fl_attachment/");
        if (!fileName.includes(".")) fileName += ".jpg";
      }
      else if (file.type === "video") {
        downloadUrl = downloadUrl.replace("/upload/", "/upload/fl_attachment/");
        if (!fileName.includes(".")) fileName += ".mp4";
      }
      else if (file.type === "pdf" || file.type === "file") {
        if (downloadUrl.includes("/raw/upload/")) {
          downloadUrl = downloadUrl.replace("/raw/upload/", "/raw/upload/fl_attachment/");
        } else {
          downloadUrl = downloadUrl + "?fl_attachment=true";
        }
        if (!fileName.includes(".")) fileName += ".pdf";
      }
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      alert("File download failed. Try again.");
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed': return { label: 'Completed', styles: 'bg-emerald-50 text-emerald-600 ring-emerald-100', icon: <CheckCircle2 size={12}/> };
      case 'processing': return { label: 'Processing', styles: 'bg-blue-50 text-blue-600 ring-blue-100', icon: <RefreshCw size={12} className="animate-spin"/> };
      case 'rejected': return { label: 'Rejected', styles: 'bg-red-50 text-red-600 ring-red-100', icon: <AlertCircle size={12}/> };
      default: return { label: 'Pending', styles: 'bg-amber-50 text-amber-600 ring-amber-100', icon: <Clock size={12}/> };
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center py-24 space-y-4">
      <RefreshCw className="animate-spin text-indigo-600" size={40} />
      <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest animate-pulse">Syncing Archive...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 animate-in fade-in duration-500">
      
      {/* Dynamic Header with Credit Sync */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Campaign History</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 text-sm font-medium">Manage and track your previous broadcast performance.</p>
            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
            <div className="flex items-center gap-1 text-indigo-600 font-bold text-sm">
              <User size={14}/> {user.credits || 0} Credits Available
            </div>
          </div>
        </div>
        <button onClick={fetchCampaigns} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 transition-all text-xs font-black uppercase tracking-widest shadow-sm active:scale-95">
          <RefreshCw size={16} /> Sync Data
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-8 text-xs font-bold flex items-center gap-2"><XCircle size={18} /> {error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem]">
            <Clock className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-slate-500 font-bold">No campaigns found yet.</h3>
          </div>
        ) : (
          campaigns.map((camp) => {
            const status = getStatusConfig(camp.status);
            return (
              <div key={camp._id} className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500">
                
                <div className="flex justify-between items-start mb-6">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ring-1 ring-inset ${status.styles}`}>
                    {status.icon} {status.label}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    <Calendar size={12} /> {new Date(camp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div className="mb-6 flex-1">
                  <h3 className="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">{camp.campaignName || camp.title || "Standard Broadcast"}</h3>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 w-fit px-2 py-1 rounded-lg">
                    <Users size={12} /> {camp.phoneNumbers?.length || 0} Recipients
                  </div>
                </div>

                {/* Interactive Media Section */}
                <div className="flex flex-wrap gap-2 mb-8 min-h-8">
                  {camp.media?.length > 0 ? (
                    camp.media.map((file, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => downloadFile(file)}
                        className="group/file relative flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest cursor-pointer overflow-hidden transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <span className="flex items-center gap-1.5 transition-all group-hover/file:opacity-0 group-hover/file:-translate-y-4">
                          {file.type === "image" ? <ImageIcon size={12} /> : <FileText size={12} />}
                          {file.type}
                        </span>
                        
                        <div className="absolute inset-0 flex items-center justify-center translate-y-4 opacity-0 group-hover/file:translate-y-0 group-hover/file:opacity-100 transition-all duration-300">
                          <Download size={14} className="mr-1" />
                          <span>{file.type}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300 italic uppercase">No Media</span>
                  )}
                </div>

                <div className="pt-5 mt-auto border-t border-slate-50">
                  <button 
                    onClick={() => navigate(`/user-dashboard/campaign/${camp._id}`)}
                    className="w-full group/btn flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
                  >
                    <span>Full Report</span>
                    <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserCampaignHistory;