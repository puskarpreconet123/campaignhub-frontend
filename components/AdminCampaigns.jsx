import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, BarChart3, ChevronDown, ChevronUp, Calendar, 
  Hash, FileText, RefreshCw, Clock, CheckCircle2, 
  AlertCircle, PlayCircle, ExternalLink, MoreVertical 
} from "lucide-react";
import StatusBox from "./adminCampaignManagement/StatusBox"
const AdminCampaigns = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://campaignhub-backend.onrender.com/api/admin/all-campaigns", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching global logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to update status in Backend and Frontend
  const handleStatusUpdate = async (campaignId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`https://campaignhub-backend.onrender.com/api/admin/campaign/${campaignId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state so UI reflects change instantly
      setUsers(prevUsers => prevUsers.map(user => ({
        ...user,
        campaigns: user.campaigns.map(c => 
          c._id === campaignId ? { ...c, status: newStatus } : c
        )
      })));
    } catch (err) {
      alert("Failed to update status. Please check your permissions.");
    }
  };

  const getGroupedCampaigns = (campaigns = []) => {
    return {
      pending: campaigns.filter(c => c.status === "pending"),
      processing: campaigns.filter(c => c.status === "processing"),
      completed: campaigns.filter(c => c.status === "completed"),
      rejected: campaigns.filter(c => c.status === "rejected"),
    };
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <RefreshCw className="animate-spin text-emerald-500 mb-4" size={32} />
      <p className="text-zinc-500 font-medium">Categorizing campaign logs...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header section code... */}
      
      <div className="space-y-4">
        {users.map((user) => {
          const grouped = getGroupedCampaigns(user.campaigns);
          return (
            <div key={user._id} className="bg-white rounded-4xl border border-zinc-200 overflow-hidden shadow-sm">
              <div 
                onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-zinc-50/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-600 font-bold border border-zinc-200">
                    {user.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-800">{user.name}</h3>
                    <p className="text-xs text-zinc-400 font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-zinc-400">
                  <span className="text-xs font-bold bg-zinc-100 px-3 py-1 rounded-full">{user.campaigns?.length || 0} Total</span>
                  {expandedUser === user._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedUser === user._id && (
  <div className="px-6 pb-8 animate-in slide-in-from-top-2">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatusBox title="Pending" icon={<Clock size={14}/>} color="amber" data={grouped.pending} onStatusUpdate={handleStatusUpdate} />
      <StatusBox title="Processing" icon={<PlayCircle size={14}/>} color="blue" data={grouped.processing} onStatusUpdate={handleStatusUpdate} />
      <StatusBox title="Completed" icon={<CheckCircle2 size={14}/>} color="emerald" data={grouped.completed} onStatusUpdate={handleStatusUpdate} />
      <StatusBox title="Rejected" icon={<AlertCircle size={14}/>} color="red" data={grouped.rejected} onStatusUpdate={handleStatusUpdate} />
    </div>
  </div>
)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCampaigns;