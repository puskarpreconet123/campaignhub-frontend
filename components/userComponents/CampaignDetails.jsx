import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, Calendar, Users, MessageSquare, Download, 
  FileText, ImageIcon, Clock, CheckCircle2, AlertCircle, RefreshCw, 
  View,
  FileTextIcon,
  Eye
} from "lucide-react";

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/user/campaign/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCampaign(res.data);
      } catch (err) {
        console.error("Error fetching campaign:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const downloadNumbersAsTxt = () => {
    if (!campaign?.phoneNumbers?.length) return;
    const content = campaign.phoneNumbers.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${campaign.campaignName || "campaign"}_numbers.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const handleDownload = async (url, type, index) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    // Creates a clean name like: image_file_1.png
    link.download = `${type}_file_${index + 1}`;
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup memory
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Download failed:", err);
    // Fallback: open in new tab if blob fails
    window.open(url, "_blank");
  }
};

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed': return { label: 'Completed', color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={14}/> };
      case 'processing': return { label: 'Processing', color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50', icon: <RefreshCw size={14} className="animate-spin"/> };
      case 'rejected': return { label: 'Rejected', color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', icon: <AlertCircle size={14}/> };
      default: return { label: 'Pending', color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={14}/> };
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64 animate-pulse font-bold text-slate-400 text-xs uppercase tracking-widest">Loading Report...</div>;
  if (!campaign) return <div className="p-20 text-center font-bold text-slate-500">Campaign not found.</div>;

  const statusInfo = getStatusConfig(campaign.status);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      {/* Back Navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold uppercase text-[10px] tracking-widest mb-6 transition-all group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> Back to Archive
      </button>

      {/* Compact Main Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header - Reduced Height & Padding */}
        <div className="bg-slate-900 px-6 py-8 sm:px-10 sm:py-10 text-white relative">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${statusInfo.color} text-white shadow-sm`}>
              {statusInfo.icon} {statusInfo.label}
            </div>
            <span className="text-slate-500 text-[10px] font-mono bg-white/5 px-2 py-1 rounded">ID: {campaign._id.slice(-8).toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            {campaign.campaignName || campaign.title || "Untitled Broadcast"}
          </h1>
        </div>

        {/* Content Body - Responsive Grid */}
        <div className="p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left/Top Sidebar: Stats (Span 4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Delivery Stats Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Campaign Metrics</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600"><Users size={20}/></div>
                    <div>
                      <p className="text-xl font-black text-slate-800 leading-none">{campaign.phoneNumbers?.length || 0}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Recipients</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-200 p-2.5 rounded-xl text-slate-600"><Calendar size={20}/></div>
                    <div>
                      <p className="text-sm font-black text-slate-800 leading-none">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Created Date</p>
                    </div>
                  </div>
                </div>
              </div>

{/* Assets Section */}
<div className="space-y-3">
  <div className="flex items-center justify-between px-1">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
      Attachments
    </p>
    {campaign.media?.length > 0 && (
      <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
        {campaign.media.length} Files
      </span>
    )}
  </div>

  <div className="space-y-2.5">
    {campaign.media?.length > 0 ? (
      campaign.media.map((file, idx) => (
        <div
          key={idx}
          className="group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300"
        >
          {/* File Icon & Info */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`p-2 rounded-xl shrink-0 ${
              file.type === "image" ? "bg-indigo-50 text-indigo-500" : "bg-amber-50 text-amber-500"
            }`}>
              {file.type === "image" ? <ImageIcon size={18} /> : <FileText size={18} />}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate">
                {file.type} Asset
              </span>
              <span className="text-[9px] text-slate-400 font-medium truncate">
                Click to preview or save
              </span>
            </div>
          </div>

          {/* Action Dock */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
              title="Preview"
            >
              <Eye size={15} />
            </a>
            
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>

            <button
              onClick={() => handleDownload(file.url, file.type, idx)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all cursor-pointer"
              title="Download"
            >
              <Download size={15} />
            </button>
          </div>
        </div>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center py-8 px-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
        <FileText size={20} className="text-slate-300 mb-2" strokeWidth={1.5} />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          No assets attached
        </p>
      </div>
    )}
  </div>
</div>

              <button
                onClick={downloadNumbersAsTxt}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                <Download size={14} /> Download Numbers
              </button>
            </div>

            {/* Right/Bottom Main Area: Content (Span 8) */}
            <div className="lg:col-span-8 space-y-8">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Broadcast Message</p>
                <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100 relative">
                  <MessageSquare className="absolute top-4 right-4 text-slate-200 size-12 opacity-50" />
                  <p className="text-slate-700 leading-relaxed text-base font-medium relative whitespace-pre-wrap">
                    {campaign.message || "No content provided."}
                  </p>
                </div>
              </div>

              {/* Preview Footer / Note */}
              <div className="pt-6 border-t border-slate-100">
                <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-bold ${statusInfo.bg} ${statusInfo.text}`}>
                  <AlertCircle size={14} />
                  This campaign is currently {statusInfo.label.toLowerCase()}.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;