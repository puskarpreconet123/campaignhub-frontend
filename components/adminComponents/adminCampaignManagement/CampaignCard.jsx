import React, { useState } from "react";
import { Users, ChevronDown, Clock, PlayCircle, CheckCircle2, AlertCircle } from "lucide-react";

const CampaignCard = ({ camp, onStatusUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isRejected = camp.status === "rejected";

  const statusOptions = [
    { id: 'pending', label: 'Pending', color: 'bg-amber-400' },
    { id: 'processing', label: 'Process', color: 'bg-blue-400' },
    { id: 'completed', label: 'Done', color: 'bg-emerald-400' },
    { id: 'rejected', label: 'Reject', color: 'bg-red-400' },
  ];

  return (
    /* Dynamic Z-index is key here to float above the scroll container */
    <div className={`group bg-white rounded-xl p-3 border border-white flex flex-col gap-3 shadow-sm relative transition-all ${showMenu ? 'z-30 ring-2 ring-black/5 shadow-lg' : 'z-0 hover:border-zinc-200'}`}>
      
      {/* Top Section: Title and Stats */}
      <div className="min-w-0">
        <p className="text-[11px] font-black text-zinc-800 leading-tight mb-1 line-clamp-2">
          {camp.title || "Untitled Campaign"}
        </p>
        <div className="flex items-center gap-2">
           <span className="bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-md flex items-center gap-1 text-[9px] font-bold uppercase tracking-tighter">
             <Users size={10}/> {camp.phoneNumbers?.length || 0}
           </span>
        </div>
      </div>

      {/* Bottom Section: Action Button */}
      <div className="relative">
        <button 
          disabled={isRejected}
          onClick={() => {
            if (!isRejected) setShowMenu(!showMenu);
          }}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all
            ${
              isRejected
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border-zinc-100"
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-500 border-zinc-100"
            }`}
        >
          <span className="text-[9px] font-black uppercase tracking-widest">Update Status</span>
          <ChevronDown size={10} className={`transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`} />
        </button>

        {showMenu && (
          <>
            {/* The fixed overlay ensures clicking anywhere else closes the menu */}
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
            
            {/* Dropdown Menu - Positioned to drop DOWN from the button */}
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-zinc-100 p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
              {statusOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (camp.status === "rejected") return;
                    onStatusUpdate(camp._id, opt.id);
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors hover:bg-zinc-50 ${
                    camp.status === opt.id ? 'text-zinc-900 bg-zinc-50' : 'text-zinc-400'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${opt.color}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignCard;