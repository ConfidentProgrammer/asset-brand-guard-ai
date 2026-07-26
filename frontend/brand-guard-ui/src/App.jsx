import { useState } from "react";

export default function App() {
  const [productLine, setProductLine] = useState("Mobile");
  const [marketingCopy, setMarketingCopy] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!marketingCopy.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        "https://shiny-couscous-jrqqw5xwrgr2prrr-8000.app.github.dev/api/v1/audit-copy",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_line: productLine,
            copy_text: marketingCopy,
          }),
        },
      );

      if (!response.ok)
        throw new Error("Failed to communicate with FastAPI backend.");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        "Could not connect to backend API. Ensure FastAPI is running on port 8000.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4">
      <div className="max-w-2xl w-full mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-400">
          Asset Brand Guard
        </h1>
        <p className="text-slate-400 mt-2">
          Enterprise-grade compliance auditing powered by React, FastAPI, and
          Gemini.
        </p>
      </div>

      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8">
        <form onSubmit={handleAudit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Product Line
            </label>
            <select
              value={productLine}
              onChange={(e) => setProductLine(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Mobile">Mobile</option>
              <option value="Home Appliances">Home Appliances</option>
              <option value="Enterprise Computing">Enterprise Computing</option>
              <option value="Audio & Wearables">Audio & Wearables</option>
              <option value="General Corporate Communications">
                General Corporate Communications
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Marketing Copy to Audit
            </label>
            <textarea
              rows="4"
              value={marketingCopy}
              onChange={(e) => setMarketingCopy(e.target.value)}
              placeholder="Type copy here (e.g., Get our galaxy s24 at the absolute lowest price ever!)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3.5 px-6 rounded-xl transition duration-200 shadow-lg flex items-center justify-center cursor-pointer"
          >
            {loading
              ? "Evaluating Compliance via AI..."
              : "Run Compliance Audit"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div
            className={`mt-8 border rounded-xl p-6 shadow-xl ${result.is_compliant ? "border-emerald-500/50 bg-emerald-950/10" : "border-rose-500/50 bg-rose-950/10"}`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <span
                className={`px-3.5 py-1 rounded-full text-xs font-bold ${result.is_compliant ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}`}
              >
                {result.is_compliant ? "COMPLIANT" : "NON-COMPLIANT"}
              </span>
              <span className="text-slate-400 text-sm">
                Confidence: {(result.confidence_score * 100).toFixed(0)}%
              </span>
            </div>

            {result.detected_violations?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
                  Detected Violations
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                  {result.detected_violations.map((v, idx) => (
                    <li key={idx}>{v}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.suggested_rewrite && (
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                  Suggested Compliant Rewrite
                </h3>
                <p className="text-slate-200 italic text-sm">
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
