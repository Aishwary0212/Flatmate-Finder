import { useState, useEffect } from "react";
import api from "../lib/api";
import {
  MapPin,
  IndianRupee,
  CalendarDays,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function TenantProfileForm({ onSaved }) {
  const [profile, setProfile] = useState({
    preferredLocation: "",
    minBudget: "",
    maxBudget: "",
    moveInDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/profile");
        setProfile({
          preferredLocation: data.preferredLocation || "",
          minBudget: data.minBudget?.toString() || "",
          maxBudget: data.maxBudget?.toString() || "",
          moveInDate: data.moveInDate ? data.moveInDate.split("T")[0] : "",
        });
      } catch (err) {
        // 404 means no profile yet - that's fine
        if (err.response?.status !== 404) setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.put("/profile", {
        ...profile,
        minBudget: Number(profile.minBudget),
        maxBudget: Number(profile.maxBudget),
        moveInDate: new Date(profile.moveInDate).toISOString(),
      });
      setSuccess("Profile saved successfully!");
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 text-slate-500 py-4">
        <Loader2 size={18} className="animate-spin text-indigo-600" />
        <span className="text-sm font-medium">Loading preferences...</span>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          {success}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Preferred Location
        </label>
        <div className="relative">
          <MapPin
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            required
            value={profile.preferredLocation}
            onChange={(e) =>
              setProfile({ ...profile, preferredLocation: e.target.value })
            }
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400"
            placeholder="e.g., Koramangala, Bangalore"
          />
        </div>
      </div>

      {/* Budget Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Min Budget (₹)
          </label>
          <div className="relative">
            <IndianRupee
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="number"
              required
              min="0"
              value={profile.minBudget}
              onChange={(e) =>
                setProfile({ ...profile, minBudget: e.target.value })
              }
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Max Budget (₹)
          </label>
          <div className="relative">
            <IndianRupee
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="number"
              required
              min="0"
              value={profile.maxBudget}
              onChange={(e) =>
                setProfile({ ...profile, maxBudget: e.target.value })
              }
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Move-in Date */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Move-in Date
        </label>
        <div className="relative">
          <CalendarDays
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="date"
            required
            value={profile.moveInDate}
            onChange={(e) =>
              setProfile({ ...profile, moveInDate: e.target.value })
            }
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99] shadow-sm font-semibold text-sm"
      >
        {saving ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save size={16} />
            Save Preferences
          </>
        )}
      </button>
    </form>
  );
}
