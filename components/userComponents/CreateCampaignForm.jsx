import React, { useState, useEffect } from "react";
import { Send, Loader2, Users, MessageSquare, Plus, X, FileText, Image as ImageIcon } from "lucide-react";
import axios from "axios";

const CreateCampaignForm = () => {
  const [campaignName, setCampaignName] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);
  const [pdfVideo, setPdfVideo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invalidCount, setInvalidCount] = useState(0);

  // 1. Initialize user from state for reactivity
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : { credits: 0 };
  });
  
  const userCredits = user?.credits || 0;

  // 2. Sync Credits with Backend on Load (Handles Admin Refunds)
  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sync local storage and state
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
        window.dispatchEvent(new Event("userUpdated"));

      } catch (err) {
        console.error("Failed to sync credits:", err);
      }
    };

    fetchLatestUser();

    return () => {
      images.forEach(img => img.preview && URL.revokeObjectURL(img.preview));
      pdfVideo.forEach(file => file.preview && URL.revokeObjectURL(file.preview));
    };
  }, []);


const handleAddNumbers = () => {
  if (!phoneInput.trim()) return;

  const rawNumbers = phoneInput.split(/[\s,]+/).map(n => n.trim());

  const cleaned = rawNumbers.map(num => {
    const digits = num.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
      return digits.slice(2);
    }
    return digits;
  });

  const valid = cleaned.filter(num => /^\d{10}$/.test(num));
  const invalid = cleaned.filter(num => !/^\d{10}$/.test(num));

  const uniqueNumbers = [...new Set([...phoneNumbers, ...valid])];

  if (uniqueNumbers.length > userCredits) {
    alert("Total numbers exceed available credits");
    return;
  }

  setPhoneNumbers(uniqueNumbers);
  setInvalidCount(prev => prev + invalid.length);
  setPhoneInput("");
};


  const inputCount =  message ? message.length : 0;
  const maxInputs = 1024;

  const handleImageUpload = e => {
    const files = Array.from(e.target.files);
    const valid = files.filter(
      file => file.type === "image/jpeg" && file.size <= 2 * 1024 * 1024
    );
    setImages(prev => [...prev, ...valid]);
  };

  const handleDocUpload = e => {
    const files = Array.from(e.target.files);
    const valid = files.filter(file => file.size <= 5 * 1024 * 1024);
    setPdfVideo(prev => [...prev, ...valid]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeFile = (index) => {
    setPdfVideo(pdfVideo.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!campaignName) return alert("Campaign name required");
    if (phoneNumbers.length === 0) return alert("Add phone numbers");
    if (!message) return alert("Message required");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("campaignName", campaignName);
      formData.append("message", message);

      phoneNumbers.forEach(num => {
        formData.append("phoneNumbers", num);
      });

      images.forEach(img => {
        formData.append("images", img);
      });

      pdfVideo.forEach(file => {
        formData.append("pdfVideo", file);
      });

      const res = await axios.post(
        "http://localhost:5000/api/campaign/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      // Update local storage and UI state with new credit balance
      localStorage.setItem("user", JSON.stringify(res.data.userDoc));
      setUser(res.data.userDoc);
      window.dispatchEvent(new Event("userUpdated"));
      setLoading(false);
      alert("Campaign created successfully");
      
      setCampaignName("");
      setPhoneNumbers([]);
      setMessage("");
      setImages([]);
      setPdfVideo([]);
      
    } catch (err) {
      setLoading(false);
      console.log("Campaign error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Campaign creation failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-10 min-h-screen p-4 md:p-8">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-indigo-900/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-indigo-100">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <div className="absolute inset-0 blur-lg bg-indigo-400/20 animate-pulse"></div>
            </div>
            <h3 className="mt-4 text-lg font-black text-indigo-900 tracking-tight">Processing Campaign</h3>
            <p className="text-zinc-500 text-xs font-medium mt-1">Uploading media and syncing data...</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-indigo-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Create Marketing Campaign
          </h2>
          <p className="text-indigo-100 text-sm mt-1">Fill in the details to blast your message</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Section 01: Basic Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold border-b pb-2">
              <span className="bg-indigo-100 p-1.5 rounded-lg">01</span>
              <h3>Basic Information</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name</label>
              <input
                type="text"
                placeholder="Summer Sale 2024"
                className="w-full outline-none border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all p-2.5 border"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
              />
            </div>
          </section>

          {/* Section 02: Recipients */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold border-b pb-2">
              <span className="bg-indigo-100 p-1.5 rounded-lg">02</span>
              <h3>Recipients</h3>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
              <label className="text-sm font-medium text-slate-700 mb-2 flex justify-between">
                Enter Phone Numbers 
              </label>
              <textarea
                placeholder="10 digits, separated by comma/space"
                className="w-full outline-none border-slate-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-indigo-500 border"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                onBlur={handleAddNumbers}
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Credits: <span className={phoneNumbers.length > userCredits ? "text-red-500" : "text-indigo-600 font-bold"}>
                    {phoneNumbers.length} / {userCredits}
                  </span>
                </p>
              </div>

              {phoneNumbers.length > 0 && (
  <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
    {/* Header Section */}
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
        Validation Summary
      </h4>
      <button
        type="button"
        onClick={() => {
          const content = phoneNumbers.join("\n");
          const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "campaign_numbers.txt";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }}
        className="flex items-center gap-2 text-xs bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg font-medium transition-all shadow-sm active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="避4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download .txt
      </button>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white p-3 rounded-lg border border-slate-100 text-center">
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total</p>
        <p className="text-lg font-bold text-slate-700">{phoneNumbers.length + invalidCount}</p>
      </div>
      
      <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
        <p className="text-[10px] uppercase font-bold text-green-500 mb-1">Valid</p>
        <p className="text-lg font-bold text-green-700">{phoneNumbers.length}</p>
      </div>

      <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center">
        <p className="text-[10px] uppercase font-bold text-red-400 mb-1">Invalid</p>
        <p className="text-lg font-bold text-red-600">{invalidCount}</p>
      </div>
    </div>
  </div>
)}
            </div>
          </section>

          {/* Section 03: Message Content */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold border-b pb-2">
              <span className="bg-indigo-100 p-1.5 rounded-lg">03</span>
              <h3>Message Content</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Message</label>
              <textarea
                rows={5}
                className="w-full outline-none border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 border"
                placeholder="Write your campaign message here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <div className="flex justify-between mt-1">
                <span className={`text-xs font-medium ${inputCount > maxInputs ? 'text-red-500' : 'text-slate-500'}`}>
                  {inputCount} / {maxInputs} Characters
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image Upload */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors bg-slate-50/50">
                <label className="flex flex-col items-center cursor-pointer">
                  <ImageIcon className="w-8 h-8 text-indigo-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-700">Images</span>
                  <span className="text-[10px] text-slate-400">JPG only, Max 2MB</span>
                  <input type="file" className="hidden" multiple accept=".jpg" onChange={handleImageUpload} />
                </label>
                {images.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] text-green-600 text-center mb-2">{images.length} selected</p>
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-20 object-cover rounded-lg border" />
                          <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-90"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors bg-slate-50/50">
                <label className="flex flex-col items-center cursor-pointer">
                  <FileText className="w-8 h-8 text-indigo-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-700">PDF / Video</span>
                  <span className="text-[10px] text-slate-400">Max 5MB per file</span>
                  <input type="file" className="hidden" multiple onChange={handleDocUpload} />
                </label>
                {pdfVideo.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] text-green-600 text-center mb-2">{pdfVideo.length} files selected</p>
                    <div className="grid grid-cols-2 gap-2">
                      {pdfVideo.map((file, index) => (
                        <div key={index} className="relative group border rounded-lg p-2 bg-white flex items-center gap-2">
                          {file.type.startsWith("video/") ? (
                            <video src={URL.createObjectURL(file)} className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <FileText className="w-10 h-10 text-indigo-500" />
                          )}
                          <p className="text-[10px] font-semibold truncate flex-1">{file.name}</p>
                          <button type="button" onClick={() => removeFile(index)} className="bg-red-500 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                <><Send className="w-5 h-5" /> Launch Campaign</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignForm;