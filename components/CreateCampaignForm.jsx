import React, { useState } from "react";
import { Send, Loader2, Users, MessageSquare, Plus, X, FileText, Image as ImageIcon } from "lucide-react";
import axios from "axios";

const CreateCampaignForm = () => {
  const [campaignName, setCampaignName] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);
  const [pdfVideo, setPdfVideo] = useState([]);
  const[loading, setLoading] = useState(false)

  const user = JSON.parse(localStorage.getItem("user"))
   const userCredits = user.credits

  const handleAddNumbers = () => {
    const numbers = phoneInput
      .split(/[\s,]+/)
      .map(num => num.trim())
      .filter(num => /^\d{10}$/.test(num));

    const uniqueNumbers = [...new Set([...phoneNumbers, ...numbers])];

    if (uniqueNumbers.length > userCredits) {
      alert("Total numbers exceed available credits");
      return;
    }

    setPhoneNumbers(uniqueNumbers);
    setPhoneInput("");
  };

  const removeNumber = (index) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
  };

  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;
  const maxWords = 1024;

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

  const handleSubmit = async e => {
  e.preventDefault();

  if (!campaignName) return alert("Campaign name required");
  if (phoneNumbers.length === 0) return alert("Add phone numbers");
  if (!message) return alert("Message required");

  setLoading(true); // Start Loading
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
      "https://campaignhub-backend.onrender.com/api/campaign/create",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    localStorage.setItem("user", JSON.stringify(res.data.userDoc))
    setLoading(false)
    alert("Campaign created successfully");
    
    setCampaignName("");
    setPhoneNumbers([]);
    setMessage("");
    setImages([]);
    setPdfVideo([]);
    
    
  } catch (err) {
  setLoading(false)
  console.log("Campaign error:", err.response?.data || err.message);
  alert(err.response?.data?.message || "Campaign creation failed");
}

};


  return (
    <div className="max-w-4xl mx-auto my-10 min-h-screen p-4 md:p-8">
      {loading && (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-indigo-900/20 backdrop-blur-sm animate-in fade-in duration-300">
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
        
        {/* Header */}
        <div className="bg-indigo-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Create Marketing Campaign
          </h2>
          <p className="text-indigo-100 text-sm mt-1">Fill in the details to blast your message</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {/* Campaign Name Section */}
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

          {/* Phone Numbers Section */}
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
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Credits: <span className={phoneNumbers.length > userCredits ? "text-red-500" : "text-indigo-600"}>
                    {phoneNumbers.length} / {userCredits}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={handleAddNumbers}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add to List
                </button>
              </div>

              {/* Number Chips */}
              {phoneNumbers.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-white rounded-lg border">
                  {phoneNumbers.map((num, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs flex items-center gap-1 border border-slate-200">
                      {num}
                      <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeNumber(idx)} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Content Section */}
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
                <span className={`text-xs font-medium ${wordCount > maxWords ? 'text-red-500' : 'text-slate-500'}`}>
                  {wordCount} / {maxWords} words
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
                {images.length > 0 && <p className="mt-2 text-[10px] text-green-600 text-center">{images.length} images selected</p>}
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors bg-slate-50/50">
                <label className="flex flex-col items-center cursor-pointer">
                  <FileText className="w-8 h-8 text-indigo-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-700">PDF / Video</span>
                  <span className="text-[10px] text-slate-400">Max 5MB per file</span>
                  <input type="file" className="hidden" multiple onChange={handleDocUpload} />
                </label>
                {pdfVideo.length > 0 && <p className="mt-2 text-[10px] text-green-600 text-center">{pdfVideo.length} files selected</p>}
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Finalizing Campaign...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Launch Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignForm;