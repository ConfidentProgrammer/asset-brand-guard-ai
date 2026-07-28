import { useState } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState("copy"); // "copy" or "image"
  const [productLine, setProductLine] = useState("Mobile");
  const [marketingCopy, setMarketingCopy] = useState("");
  
  // Image audit state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Handle file selection and generate local preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleAudit = async (e) => {
    e.preventDefault();
    if (activeTab === "copy" && !marketingCopy.trim()) return;
    if (activeTab === "image" && !selectedFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      const apiBase = "https://asset-brand-guard-ai.onrender.com/api/v1";

      if (activeTab === "copy") {
        response = await fetch(`${apiBase}/audit-copy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_line: productLine,
            copy_text: marketingCopy,
          }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("product_line", productLine);

        response = await fetch(`${apiBase}/audit-image`, {
          method: "POST",
          body: formData, // Notice: No Content-Type header so browser computes multipart boundary
        });
      }

      if (!response.ok) {
        throw new Error("Failed to communicate with FastAPI backend.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        "Could not connect to backend API. Ensure FastAPI is running and endpoints are mapped correctly."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4 selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <div className="max-w-3xl w-full mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-3">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          Enterprise Intelligence Engine
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Asset Brand <span className="text-blue-500">Guard</span>
        </h1>
        <p className="text-slate-400 mt-2 text-base">
          Real-time compliance auditing for global brand assets powered by FastAPI, Pinecone, and Gemini Vision.
        </p>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl p-6 sm:p-10">
        
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/60 rounded-2xl mb-8 border border-slate-800">
          <button
            type="button"
            onClick={() => { setActiveTab("copy"); setResult(null); setError(null); }}
            className={`py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "copy"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Marketing Copy Audit
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab("image"); setResult(null); setError(null); }}
            className={`py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "image"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Visual & Image Audit
          </button>
        </div>

        <form onSubmit={handleAudit} className="space-y-6">
          {/* Product Line Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Product Line
            </label>
            <div className="relative">
              <select
                value={productLine}
                onChange={(e) => setProductLine(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition"
              >
                <option value="Mobile">Mobile</option>
                <option value="Home Appliances">Home Appliances</option>
                <option value="Enterprise Computing">Enterprise Computing</option>
                <option value="Audio & Wearables">Audio & Wearables</option>
                <option value="General Corporate Communications">General Corporate Communications</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Conditional Input: Copy Text vs Image Upload */}
          {activeTab === "copy" ? (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Marketing Copy to Audit
              </label>
              <textarea
                rows="5"
                value={marketingCopy}
                onChange={(e) => setMarketingCopy(e.target.value)}
                placeholder="Type copy here (e.g., Get our new flagship device at the absolute lowest price ever!)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none placeholder:text-slate-600"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Upload Marketing Asset (Banner / Ad / Creative)
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/50 rounded-2xl p-6 text-center transition relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 rounded-lg object-contain mb-3 shadow-md border border-slate-800"
                    />
                    <p className="text-xs text-blue-400 font-medium">Click or drag another image to replace</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition duration-200">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-300">Drop your asset image here, or <span className="text-blue-400 underline">browse</span></p>
                    <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, WEBP up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white font-semibold py-4 px-6 rounded-xl transition duration-200 shadow-xl shadow-blue-600/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing via Gemini Multimodal RAG...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Run Compliance Audit
              </>
            )}
          </button>
        </form>

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Results Card */}
        {result && (
          <div className={`mt-8 border rounded-2xl p-6 transition-all duration-300 ${
            result.is_compliant 
              ? "border-emerald-500/40 bg-emerald-950/10 shadow-emerald-950/20" 
              : "border-rose-500/40 bg-rose-950/10 shadow-rose-950/20"
          } shadow-xl`}>
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 ${
                result.is_compliant 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${result.is_compliant ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                {result.is_compliant ? "Fully Compliant" : "Non-Compliant Asset"}
              </span>
              
              <span className="text-slate-400 text-sm font-medium">
                Confidence Score: <strong className="text-slate-200">{(result.confidence_score * 100).toFixed(0)}%</strong>
              </span>
            </div>

            {result.detected_violations?.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Detected Compliance Violations
                </h3>
                <ul className="space-y-2 text-slate-300 text-sm bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
                  {result.detected_violations.map((v, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.suggested_rewrite && (
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Recommended Action / Compliant Rewrite
                </h3>
                <p className="text-slate-200 italic text-sm font-mono bg-slate-900 p-3 rounded-lg border border-slate-800">
                  "{result.suggested_rewrite}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}