import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, Clock, CheckCircle, FileText, ImageIcon, RefreshCw, MoreHorizontal, ExternalLink } from "lucide-react";

const UserCampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://campaignhub-backend.onrender.com/api/user/campaign", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(res.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

const downloadFile = (file) => {
  if (!file?.url) return;

  try {
    let fileName = file.publicId?.split("/").pop() || "download";

    let downloadUrl = file.url;

    // IMAGE
    if (file.type === "image") {
      downloadUrl = downloadUrl.replace("/upload/", "/upload/fl_attachment/");
      if (!fileName.includes(".")) fileName += ".jpg";
    }

    // VIDEO
    else if (file.type === "video") {
      downloadUrl = downloadUrl.replace("/upload/", "/upload/fl_attachment/");
      if (!fileName.includes(".")) fileName += ".mp4";
    }

    // PDF / RAW FILE
    else if (file.type === "pdf" || file.type === "file") {
      // raw files may not contain /upload/ the same way
      if (downloadUrl.includes("/raw/upload/")) {
        downloadUrl = downloadUrl.replace(
          "/raw/upload/",
          "/raw/upload/fl_attachment/"
        );
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


  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 space-y-4">
        <RefreshCw className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">Retrieving your campaigns...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Campaign Archive</h2>
          <p className="text-slate-500 text-sm">Monitor and manage your broadcasted history.</p>
        </div>
        <button
          onClick={fetchCampaigns}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all text-sm font-bold shadow-sm"
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-medium flex items-center gap-2">
          <XCircle size={18} />
          {error}
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-4xl py-20 text-center">
          <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="text-slate-300" size={32} />
          </div>
          <h3 className="text-slate-800 font-bold text-lg">No history found</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
            Once you launch your first campaign, it will appear here for tracking.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-4xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">Campaign Details</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">Reach</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">Attachments</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400">Date</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {campaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                          {campaign.title?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-none mb-1">{campaign.title || "Untitled Campaign"}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">ID: {campaign._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                          {campaign.phoneNumbers?.length || 0} Recipients
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {campaign.media?.length > 0 ? (
                          campaign.media.map((file, idx) => (
                            <button
                              key={idx}
                              onClick={() => downloadFile(file)}
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm group/btn"
                            >
                              {file.type === "image" ? <ImageIcon size={12} /> : <FileText size={12} />}
                              {file.type.toUpperCase()}
                              <Download size={10} className="ml-1 opacity-0 group-hover/btn:opacity-100" />
                            </button>
                          ))
                        ) : (
                          <span className="text-slate-300 text-xs italic">No media</span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-sm text-slate-500 font-medium">
                      {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "-"}
                    </td>
                    <td className="p-5 text-right">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all inline-flex items-center gap-1 text-xs font-bold">
                        <ExternalLink size={16} />
                        <span className="hidden lg:inline">Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCampaignHistory;