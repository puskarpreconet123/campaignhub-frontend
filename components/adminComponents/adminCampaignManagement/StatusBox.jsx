import React, { useState } from "react";
import CampaignCard from "./CampaignCard";

const StatusBox = ({ title, icon, color, data, onStatusUpdate }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const themes = {
    amber: "bg-amber-50/50 text-amber-700 border-amber-100",
    blue: "bg-blue-50/50 text-blue-700 border-blue-100",
    emerald: "bg-emerald-50/50 text-emerald-700 border-emerald-100",
    red: "bg-red-50/50 text-red-700 border-red-100"
  };

  const filteredData = data.filter(camp => 
    camp.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`rounded-3xl border p-4 flex flex-col h-[400px] transition-all shadow-sm ${themes[color]}`}>
      {/* Header - Scaled Down */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-white rounded-lg shadow-sm border border-inherit">{icon}</span>
          <h4 className="font-black text-[10px] uppercase tracking-tighter">{title}</h4>
        </div>
        <span className="text-[10px] font-black bg-white/60 px-2 py-0.5 rounded-full ring-1 ring-inset ring-black/5">
          {data.length}
        </span>
      </div>

      {/* Search Input - Slimmer */}
      <div className="mb-3">
        <input 
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/80 border-none rounded-xl px-3 py-1.5 text-[11px] font-bold placeholder:text-zinc-400 focus:ring-1 focus:ring-current outline-none transition-all"
        />
      </div>

      {/* Scrollable List - Added pb-20 to ensure dropdown visibility */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar pb-20 scroll-smooth">
        {filteredData.length > 0 ? (
          filteredData.map((camp) => (
            <CampaignCard 
              key={camp._id} 
              camp={camp} 
              onStatusUpdate={onStatusUpdate} 
            />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-[9px] font-bold uppercase tracking-widest text-center px-4">
            No {title} data
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBox;