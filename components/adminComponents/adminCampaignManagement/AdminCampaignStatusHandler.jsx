import { useState } from "react";
import axios from "../../../src/utils/axiosInstance";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Upload, 
  FileCheck, 
  ShieldAlert,
  ArrowRight
} from "lucide-react"; // Make sure to import these

const AdminCampaignStatusHandler = ({ campaign, onStatusUpdated }) => {
  
  const apiURI = import.meta.env.VITE_API_URL;
  
  const [newStatus, setNewStatus] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const isRejected = campaign?.status === "rejected";
  const isCompleted = campaign?.status === "completed";

  const allowedTransitions = {
    pending: ["processing", "rejected"],
    processing: ["completed", "rejected"],
    completed: [],
    rejected: [],
  };

  const handleViewReport = async (fileKey) => {
  try {
    const token = localStorage.getItem("token");

    // 1. Fetch the data using Axios
    const response = await axios.get(
      // We encode the fileKey because it contains slashes like 'reports/abc.pdf'
      `${apiURI}/api/admin/statusFile/${encodeURIComponent(fileKey)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // 👈 This tells Axios not to parse the data as JSON
      }
    );

    // 2. Create a Blob from the response data
    // We use the 'type' from the response headers or default to PDF
    const fileBlob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'application/pdf' 
    });

    // 3. Create a temporary URL that points to this Blob
    const tempUrl = URL.createObjectURL(fileBlob);

    // 4. Open the URL in a new tab
    const newWindow = window.open(tempUrl, '_blank');
    
    // Safety check: if pop-up blockers are active
    if (!newWindow) {
      alert("Please allow pop-ups to view the report");
    }

    // 5. Clean up: Revoke the URL after a short delay to free up browser memory
    // The browser keeps the file in RAM until you do this.
    setTimeout(() => URL.revokeObjectURL(tempUrl), 5000);

  } catch (err) {
    console.error("View Report Error:", err);
    alert("You do not have permission to view this report or the file was not found.");
  }
};

const handleUpdate = async () => {
  if (!newStatus) return;

  if (!allowedTransitions[campaign.status]?.includes(newStatus)) {
    alert(`Invalid transition from ${campaign.status} to ${newStatus}`);
    return;
  }

  try {
    setLoading(true);
    const token = localStorage.getItem("token");

    // 🔥 If completing → ONLY call /report
    if (newStatus === "completed") {
      if (!reportFile) {
        alert("Please upload completion report before marking completed.");
        return;
      }

      const formData = new FormData();
      formData.append("file", reportFile);

      const uploadRes = await axios.post(
        `${apiURI}/api/admin/campaign/${campaign._id}/report`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Backend already sets status = completed
      onStatusUpdated(uploadRes.data.campaign);

      setNewStatus("");
      setReportFile(null);
      return; // 🛑 stop here — do NOT call /status
    }

    // 🔹 For processing / rejected → call /status
    const res = await axios.patch(
      `${apiURI}/api/admin/campaign/${campaign._id}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    onStatusUpdated(res.data);
    setNewStatus("");

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Status update failed.");
  } finally {
    setLoading(false);
  }
};


 // UI for Locked State (Completed/Rejected)
  if (isRejected || isCompleted) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
            <ShieldAlert size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800">Status Locked</h4>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              This campaign is {campaign.status} and cannot be modified further.
            </p>
          </div>
        </div>

        {/* ✅ Show Report if status is completed */}
        {isCompleted && campaign.report && (
          <div className="mt-5 pt-5 border-t border-slate-50">
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <FileCheck size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                    Campaign Report
                  </p>
                  <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">
                    {campaign.report.fileKey.split('/').pop()}
                  </p>
                </div>
              </div>
               
              <button 
                onClick={() => handleViewReport(campaign.report.fileKey)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95 shadow-sm"
              >
                View Report
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="rounded-4xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40 relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Clock size={120} />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={18} className="text-white" />
              </div>
              <div>
                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Campaign Control
                </h4>
                <p className="text-sm font-bold text-slate-800">Update Status</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Current State</span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                {campaign.status}
              </span>
            </div>
          </div>

          {/* Action Buttons with State Machine Logic */}
          <div className="grid grid-cols-2 gap-3">
            {allowedTransitions[campaign.status]?.map((statusOption) => {
              const themes = {
                processing: "border-blue-100 bg-blue-50/50 text-blue-600 hover:bg-blue-100",
                completed: "border-emerald-100 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100",
                rejected: "border-red-100 bg-red-50/50 text-red-600 hover:bg-red-100"
              };

              return (
                <button
                  key={statusOption}
                  onClick={() => setNewStatus(statusOption)}
                  className={`group relative flex items-center justify-between px-4 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    `${themes[statusOption]} border-transparent`
                  }`}
                >
                  <span className="text-[11px] font-black uppercase tracking-widest">{statusOption}</span>
                  <ArrowRight size={14} className={`transition-transform duration-300 ${newStatus === statusOption ? 'translate-x-0' : '-translate-x-2 opacity-0'}`} />
                </button>
              );
            })}
          </div>

          {/* Enhanced Report Upload Section */}
          {newStatus === "completed" && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 border-dashed">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Upload size={14} className="text-emerald-600" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    Completion Report Required
                  </p>
                </div>
                <label className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-emerald-200 border-dashed rounded-xl cursor-pointer bg-white hover:bg-emerald-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {reportFile ? (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <FileCheck size={16} />
                        <span className="text-xs font-bold">{reportFile.name}</span>
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Click to upload PDF / DOCX</p>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setReportFile(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          {newStatus && (
            <div className="mt-6">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="group w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm {newStatus} 
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCampaignStatusHandler;