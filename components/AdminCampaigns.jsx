import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, 
  BarChart3, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Hash, 
  FileText,
  ExternalLink,
  RefreshCw
} from "lucide-react";

const AdminCampaigns = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // This endpoint should return users with their campaigns populated
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

  const toggleUser = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="animate-spin text-emerald-500 mb-4" size={32} />
        <p className="text-zinc-500 font-medium">Syncing global campaign data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black text-zinc-800 tracking-tight">Global Campaign Logs</h2>
          <p className="text-sm text-zinc-500">Monitoring activity across all registered users.</p>
        </div>
        <button 
          onClick={fetchAllData}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-emerald-600"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="bg-white rounded-4xl p-12 text-center border border-zinc-200">
            <Users className="mx-auto text-zinc-200 mb-4" size={48} />
            <p className="text-zinc-500">No user activity recorded yet.</p>
          </div>
        ) : (
          users.map((user) => (
            <div 
              key={user._id} 
              className="bg-white rounded-4xl border border-zinc-200 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {/* User Header Row */}
              <div 
                onClick={() => toggleUser(user._id)}
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-600 font-bold border border-zinc-200">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-800">{user.name}</h3>
                    <p className="text-xs text-zinc-400 font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Campaigns</p>
                    <p className="text-lg font-black text-emerald-600 leading-none">{user.campaigns?.length || 0}</p>
                  </div>
                  <div className="text-zinc-400">
                    {expandedUser === user._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {/* Collapsible Campaign List */}
              {expandedUser === user._id && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="border-t border-zinc-100 pt-4">
                    {user.campaigns && user.campaigns.length > 0 ? (
                      <div className="grid gap-3">
                        {user.campaigns.map((camp) => (
                          <div key={camp._id} className="bg-zinc-50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-zinc-100">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <BarChart3 size={18} className="text-emerald-500" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-zinc-700">{camp.title || "Untitled"}</p>
                                <div className="flex gap-3 mt-1">
                                  <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold uppercase">
                                    <Calendar size={12} /> {new Date(camp.createdAt).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold uppercase">
                                    <Hash size={12} /> {camp.phoneNumbers?.length || 0} Recipients
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-600 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                              <FileText size={14} />
                              View Content
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No campaign activity for this user</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCampaigns;