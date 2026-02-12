import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, Calendar, Users, MessageSquare, Download, 
  FileText, ImageIcon, Clock, CheckCircle2, AlertCircle, RefreshCw
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

  // Generate TXT file from numbers
const downloadNumbersAsTxt = () => {
  if (!campaign?.phoneNumbers?.length) return;

  const content = campaign.phoneNumbers.join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${campaign.title || "campaign"}_numbers.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

  // Helper for status styling
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed': 
        return { label: 'Completed', color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 size={18}/> };
      case 'processing': 
        return { label: 'Processing', color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', icon: <RefreshCw size={18} className="animate-spin"/> };
      case 'rejected': 
        return { label: 'Rejected', color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', icon: <AlertCircle size={18}/> };
      default: 
        return { label: 'Pending', color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock size={18}/> };
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest text-xs">Generating Report...</div>;
  if (!campaign) return <div className="p-20 text-center font-bold text-slate-500">Campaign not found.</div>;

  const statusInfo = getStatusConfig(campaign.status);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black uppercase text-[10px] tracking-widest mb-8 transition-all group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back to Archive
      </button>

      {/* Main Content Card */}
      <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-900 p-10 md:p-14 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="flex flex-wrap items-center gap-4 mb-6 relative z-10">
            {/* Status Pill in Header */}
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${statusInfo.color} text-white`}>
              {statusInfo.icon}
              {statusInfo.label}
            </div>
            <span className="text-slate-500 text-xs font-mono bg-slate-800/50 px-3 py-1 rounded-lg">ID: {campaign._id}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight relative z-10 leading-[1.1]">
            {campaign.title || "Untitled Broadcast"}
          </h1>
        </div>

        <div className="p-8 md:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Left Column: Stats & Meta */}
            <div className="space-y-10">
              
              {/* Detailed Status Box */}
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Status</h3>
                <div className={`${statusInfo.bg} ${statusInfo.text} p-6 rounded-4xl border border-current/10 flex items-center gap-4`}>
                  <div className="p-3 bg-white/50 rounded-2xl shadow-sm">
                    {statusInfo.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight leading-none">{statusInfo.label}</p>
                    <p className="text-[10px] opacity-70 font-bold mt-1">Status updated by Admin</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Delivery Overview</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-50 p-6 rounded-4xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Users size={24}/></div>
                      <div>
                        <p className="text-3xl font-black text-slate-800">{campaign.phoneNumbers?.length || 0}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Recipients</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-4xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-200 p-3 rounded-2xl text-slate-600"><Calendar size={24}/></div>
                      <div>
                        <p className="text-lg font-black text-slate-800">
                          {new Date(campaign.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Launch Date</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Campaign Assets</h3>
                <div className="space-y-3">
                  {campaign.media?.length > 0 ? (
                    campaign.media.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-xl">
                            {file.type === "image" ? <ImageIcon className="text-indigo-400" size={18}/> : <FileText className="text-amber-400" size={18}/>}
                          </div>
                          <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{file.type} Asset</span>
                        </div>
                        <a href={file.url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <Download size={18} />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs font-bold text-slate-400 italic bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                      No media assets attached.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Message Content */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Message Body</h3>
                <div className="bg-indigo-50/30 p-10 md:p-14 rounded-[3rem] border border-indigo-100 relative overflow-hidden">
                  <MessageSquare className="absolute -top-4 -right-4 text-indigo-500/5 size-48 rotate-12" />
                  <p className="text-slate-700 leading-relaxed text-xl font-medium relative whitespace-pre-wrap">
                    {campaign.message || "No message content found."}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
    Recipient Database
  </h3>

  <button
    onClick={downloadNumbersAsTxt}
    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
  >
    <Download size={14} />
    Download TXT
  </button>
</div>

                <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-4 custom-scrollbar">
                      {campaign.phoneNumbers?.map((num, i) => (
                        <div key={i} className="px-3 py-2 bg-white border border-slate-100 rounded-xl text-[11px] font-mono font-bold text-slate-500 flex items-center justify-center shadow-sm">
                          {num}
                        </div>
                      ))}
                   </div>
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