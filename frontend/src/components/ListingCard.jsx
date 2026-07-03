import {
  AlertCircle,
  AlertTriangle,
  BedDouble,
  CheckCircle2,
  Image as ImageIcon,
  IndianRupee,
  Loader2,
  MapPin,
  Send,
  Sofa,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

export default function ListingCard({
  listing,
  onInterestSent,
  onCardClick,
  isSent,
}) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const token = useAuthStore((state) => state.token);

  const alreadySent = Boolean(isSent);

  const handleSendInterest = async (event) => {
    event?.stopPropagation();
    if (alreadySent || !token) return;

    setSending(true);
    setError("");

    const storedAuth = localStorage.getItem("auth-storage");
    let storedToken = null;
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        storedToken = parsed?.token || parsed?.state?.token || null;
      } catch (error) {
        console.warn(
          "⚠️ Failed to parse persisted auth token in ListingCard:",
          error.message,
        );
      }
    }

    const authHeader =
      token || storedToken
        ? { Authorization: `Bearer ${token || storedToken}` }
        : {};

    try {
      await api.post(
        "/interests",
        { listingId: listing._id },
        { headers: authHeader },
      );
      onInterestSent?.();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send interest");
    } finally {
      setSending(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div
      onClick={onCardClick}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
    >
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        {listing.photos?.[0] ? (
          <img
            src={listing.photos[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <ImageIcon size={32} />
            <span className="text-xs font-medium">No Photo Available</span>
          </div>
        )}

        {listing.compatibilityScore != null && (
          <div
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border backdrop-blur-sm shadow-sm ${scoreColor(listing.compatibilityScore)}`}
          >
            <Sparkles size={14} />
            {listing.compatibilityScore}% Match
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col gap-3">
        <h3 className="font-bold text-lg text-slate-900 line-clamp-1">
          {listing.title}
        </h3>

        <div className="flex items-center text-slate-500 text-sm">
          <MapPin size={14} className="mr-1.5 shrink-0 text-slate-400" />
          <span className="line-clamp-1">{listing.location}</span>
        </div>

        <div className="flex items-baseline gap-1">
          <IndianRupee size={18} className="text-slate-700" />
          <span className="text-2xl font-extrabold text-slate-900">
            {listing.rent.toLocaleString()}
          </span>
          <span className="text-slate-500 text-sm font-medium">/month</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <BedDouble size={12} className="mr-1.5 text-slate-500" />{" "}
            {listing.roomType}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Sofa size={12} className="mr-1.5 text-slate-500" />{" "}
            {listing.furnishingStatus}
          </span>
        </div>

        {listing.compatibilityExplanation && (
          <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg text-xs text-indigo-800 leading-relaxed flex gap-2">
            <Sparkles size={14} className="shrink-0 mt-0.5 text-indigo-500" />
            <span>{listing.compatibilityExplanation}</span>
          </div>
        )}

        <div className="flex-1" />

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {!token && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
            <AlertTriangle size={14} className="shrink-0" />
            <span>Please log in as a tenant to send interest.</span>
          </div>
        )}

        <button
          onClick={handleSendInterest}
          disabled={sending || alreadySent || !token}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
            alreadySent
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
              : "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          }`}
        >
          {alreadySent ? (
            <>
              <CheckCircle2 size={16} /> Interest Sent
            </>
          ) : sending ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Send size={16} /> Send Interest
            </>
          )}
        </button>
      </div>
    </div>
  );
}
