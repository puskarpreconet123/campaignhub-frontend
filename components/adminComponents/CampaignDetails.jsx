import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../src/utils/axiosInstance";
import { 
  ArrowLeft, Calendar, Users, MessageSquare, Download, 
  FileText, ImageIcon, Clock, CheckCircle2, AlertCircle, RefreshCw, 
  Eye
} from "lucide-react";
import AdminCampaignStatusHandler from "./adminCampaignManagement/AdminCampaignStatusHandler";

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiURI = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${apiURI}/api/admin/campaign/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

  // const handleDownload = async (url, type, index) => {
  //   try {
  //     const response = await fetch(url);
  //     const blob = await response.blob();
  //     const blobUrl = window.URL.createObjectURL(blob);

  //     const link = document.createElement("a");
  //     link.href = blobUrl;
  //     link.download = `${type}_file_${index + 1}`;

  //     document.body.appendChild(link);
  //     link.click();

  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(blobUrl);
  //   } catch (err) {
  //     console.error("Download failed:", err);
  //     window.open(url, "_blank");
  //   }
  // };

  const handleDownload = async (mediaId, type, index) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${apiURI}/api/admin/campaign/${id}/media/${mediaId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const response = await fetch(res.data.url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${type}_file_${index + 1}`;
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
  } catch (err) {
    console.error("Download failed:", err);
    alert("Failed to download file");
  }
};

const handleFilePreview = async (file) => {
  try {
    let fileUrl = file.url;

    if (file.provider === "wasabi") {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${apiURI}/api/user/campaign/${campaign._id}/media/${file._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fileUrl = res.data.url;
    }

    // For PDF or other documents open in new tab
    if (file.type !== "image" && file.type !== "video") {
      window.open(fileUrl, "_blank");
      return;
    }

    setPreviewFile({ ...file, url: fileUrl });
    setIsModalOpen(true);

  } catch (err) {
    console.error("Preview failed:", err);
    alert("Failed to load preview");
  }
};

const handlePreviewClick = async (e, file) => {
  e.preventDefault(); // stop default <a> navigation

  try {
    let fileUrl = file.url;

    // If file stored in Wasabi → get signed URL
    if (file.provider === "wasabi") {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${apiURI}/api/user/campaign/${campaign._id}/media/${file._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fileUrl = res.data.url;
    }

    // Open preview in new tab safely
    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      alert("Popup blocked. Please allow popups.");
      return;
    }

    // If image → simple display
    if (file.type === "image") {
      previewWindow.document.write(`
        <html>
          <head><title>Image Preview</title></head>
          <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#111;">
            <img src="${fileUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
          </body>
        </html>
      `);
    }

    // If video
    else if (file.type === "video") {
      previewWindow.document.write(`
        <html>
          <head><title>Video Preview</title></head>
          <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;">
            <video src="${fileUrl}" controls autoplay style="max-width:100%;max-height:100vh;"></video>
          </body>
        </html>
      `);
    }

    // For PDF / other docs → direct open
    else {
      previewWindow.location.href = fileUrl;
    }

  } catch (err) {
    console.error("Preview failed:", err);
    alert("Failed to load preview");
  }
};

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
        return {
          label: "Completed",
          color: "bg-emerald-500",
          text: "text-emerald-600",
          bg: "bg-emerald-50",
          icon: <CheckCircle2 size={14} />,
        };
      case "processing":
        return {
          label: "Processing",
          color: "bg-blue-500",
          text: "text-blue-600",
          bg: "bg-blue-50",
          icon: <RefreshCw size={14} className="animate-spin" />,
        };
      case "rejected":
        return {
          label: "Rejected",
          color: "bg-red-500",
          text: "text-red-600",
          bg: "bg-red-50",
          icon: <AlertCircle size={14} />,
        };
      default:
        return {
          label: "Pending",
          color: "bg-amber-500",
          text: "text-amber-600",
          bg: "bg-amber-50",
          icon: <Clock size={14} />,
        };
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 animate-pulse font-bold text-slate-400 text-xs uppercase tracking-widest">
        Loading Report...
      </div>
    );

  if (!campaign)
    return (
      <div className="p-20 text-center font-bold text-slate-500">
        Campaign not found.
      </div>
    );

  const statusInfo = getStatusConfig(campaign.status);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold uppercase text-[10px] tracking-widest mb-6 transition-all group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Archive
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-8 sm:px-10 sm:py-10 text-white">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${statusInfo.color} text-white shadow-sm`}>
              {statusInfo.icon} {statusInfo.label}
            </div>
            <span className="text-slate-500 text-[10px] font-mono bg-white/5 px-2 py-1 rounded">
              ID: {campaign._id.slice(-8).toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            {campaign.campaignName || campaign.title || "Untitled Broadcast"}
          </h1>
        </div>

        <div className="p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">

              {/* Metrics */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Campaign Metrics
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-800 leading-none">
                        {campaign.phoneNumbers?.length || 0}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        Recipients
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-slate-200 p-2.5 rounded-xl text-slate-600">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 leading-none">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        Created Date
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Attachments
                  </p>
                  {campaign.media?.length > 0 && (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {campaign.media.length} Files
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {campaign.media?.length > 0 ? (
                    campaign.media.map((file, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`p-2 rounded-xl shrink-0 ${
                            file.type === "image"
                              ? "bg-emerald-50 text-emerald-500"
                              : "bg-amber-50 text-amber-500"
                          }`}>
                            {file.type === "image" ? (
                              <ImageIcon size={18} />
                            ) : (
                              <FileText size={18} />
                            )}
                          </div>

                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[11px] font-black text-slate-700 uppercase truncate">
                              {file.type} Asset
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium truncate">
                              Click to preview or save
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <a
                            href={file.url}
                            onClick={(e)=>handlePreviewClick(e, file)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                          >
                            <Eye size={15} />
                          </a>

                          <div className="w-px h-4 bg-slate-200 mx-0.5"></div>

                          <button
                            onClick={() => handleDownload(file._id, file.type, idx)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg cursor-pointer transition-all"
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                      <FileText size={20} className="text-slate-300 mb-2" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        No assets attached
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={downloadNumbersAsTxt}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                <Download size={14} /> Download Numbers
              </button>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">

              {JSON.parse(localStorage.getItem("user"))?.role === "admin" && (
                <AdminCampaignStatusHandler
                  campaign={campaign}
                  onStatusUpdated={(updatedCampaign) => {
                    setCampaign(updatedCampaign);
                  }}
                />
              )}

              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Broadcast Message
                </p>
                <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100 relative">
                  <MessageSquare className="absolute top-4 right-4 text-slate-200 size-12 opacity-50" />
                  <p className="text-slate-700 leading-relaxed text-base font-medium whitespace-pre-wrap">
                    {campaign.message || "No content provided."}
                  </p>
                </div>
              </div>

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
