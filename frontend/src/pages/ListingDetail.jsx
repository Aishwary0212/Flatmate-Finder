import {
  ArrowLeft,
  BedDouble,
  Heart,
  Home,
  Image as ImageIcon,
  IndianRupee,
  Loader2,
  MapPin,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [listing, setListing] = useState(null);
  const [sentInterests, setSentInterests] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchListing = useCallback(async () => {
    try {
      const { data } = await api.get(`/listings/${id}`);
      setListing(data);
    } catch {
      toast.error("Failed to load listing details");
      navigate("/");
    }
  }, [id, navigate]);

  const fetchSentInterests = useCallback(async () => {
    if (!token || user?.role !== "TENANT") return;
    try {
      const { data } = await api.get("/interests/sent");
      setSentInterests(data);
    } catch (error) {
      console.error("Failed to load sent interests", error);
    }
  }, [token, user?.role]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!isMounted) return;
      setLoading(true);
      await Promise.all([fetchListing(), fetchSentInterests()]);
      if (isMounted) setLoading(false);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fetchListing, fetchSentInterests]);

  const alreadySent = sentInterests.some(
    (interest) => interest.listingId?._id === id || interest.listingId === id,
  );
  const isTenant = user?.role === "TENANT";
  const canSendInterest =
    isTenant && !!token && !listing?.isFilled && !alreadySent;

  const handleSendInterest = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!canSendInterest) return;

    setIsSending(true);
    try {
      await api.post("/interests", { listingId: id });
      await fetchSentInterests();
      toast.success("Interest sent successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send interest");
    } finally {
      setIsSending(false);
    }
  };

  const handleRemoveInterest = async () => {
    const interestToRemove = sentInterests.find(
      (interest) => interest.listingId?._id === id || interest.listingId === id,
    );

    if (!interestToRemove) return;

    setIsSending(true);
    try {
      await api.delete(`/interests/${interestToRemove._id}`);
      await fetchSentInterests();
      toast.success("Interest removed successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove interest");
    } finally {
      setIsSending(false);
    }
  };

  const statusLabel = listing?.isFilled ? "Filled" : "Available";
  const statusColor = listing?.isFilled
    ? "bg-red-100 text-red-700"
    : "bg-emerald-100 text-emerald-700";

  const formattedDate = listing?.availableFrom
    ? new Date(listing.availableFrom).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  if (loading || !listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="space-y-4 w-full max-w-4xl">
          <div className="h-12 w-40 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-72 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
            <div className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
            <div className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 rounded-full px-4 py-2 bg-white border border-slate-200 shadow-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 rounded-full px-4 py-2 bg-white border border-indigo-100 shadow-sm"
          >
            <Home size={18} /> Browse again
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-200">
              <div className="relative h-105 bg-slate-100">
                {listing.photos?.[0] ? (
                  <img
                    src={listing.photos[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon size={40} />
                  </div>
                )}
              </div>

              {listing.photos?.length > 1 && (
                <div className="grid grid-cols-3 gap-2 p-4">
                  {listing.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="h-28 overflow-hidden rounded-2xl bg-slate-100"
                    >
                      <img
                        src={photo}
                        alt={`${listing.title} image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {listing.title}
                  </h1>
                  <p className="text-slate-500 mt-2">{listing.location}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${statusColor}`}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-semibold">
                    Rent
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    ₹{listing.rent.toLocaleString()}
                    <span className="text-base font-medium text-slate-500">
                      /month
                    </span>
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-semibold">
                    Available from
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 bg-white">
                  <p className="text-slate-500 text-xs uppercase tracking-[0.24em] font-semibold">
                    Room type
                  </p>
                  <p className="mt-2 font-semibold">{listing.roomType}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 bg-white">
                  <p className="text-slate-500 text-xs uppercase tracking-[0.24em] font-semibold">
                    Furnishing
                  </p>
                  <p className="mt-2 font-semibold">
                    {listing.furnishingStatus}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 bg-white">
                  <p className="text-slate-500 text-xs uppercase tracking-[0.24em] font-semibold">
                    Photos
                  </p>
                  <p className="mt-2 font-semibold">
                    {listing.photos?.length || 0}
                  </p>
                </div>
              </div>

              {listing.compatibilityScore != null && (
                <div className="mt-6 rounded-3xl border border-indigo-100 bg-indigo-50 p-5 text-slate-900">
                  <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                    <Sparkles size={16} /> Compatibility Score
                  </div>
                  <p className="mt-3 text-xl font-bold">
                    {listing.compatibilityScore}%
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {listing.compatibilityExplanation}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">Property owner</p>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    <User size={16} /> Owner details hidden for privacy
                  </div>
                </div>
                <button
                  onClick={
                    alreadySent ? handleRemoveInterest : handleSendInterest
                  }
                  disabled={!isTenant || isSending}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all w-full sm:w-auto ${
                    !isTenant
                      ? "bg-slate-100 text-slate-500 cursor-default border border-slate-200"
                      : alreadySent
                        ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        : listing?.isFilled
                          ? "bg-slate-100 text-slate-500 cursor-default border border-slate-200"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {listing?.isFilled ? (
                    "Unavailable"
                  ) : alreadySent ? (
                    isSending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} /> Remove Interest
                      </>
                    )
                  ) : isSending ? (
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

              {!token && (
                <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                  Please{" "}
                  <Link
                    className="font-semibold text-amber-900 underline"
                    to="/login"
                  >
                    log in
                  </Link>{" "}
                  as a tenant to send interest.
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3">
                Flat details
              </h2>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <BedDouble size={16} className="text-slate-400" />
                  {listing.roomType}
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  {listing.location}
                </li>
                <li className="flex items-center gap-2">
                  <IndianRupee size={16} className="text-slate-400" />₹
                  {listing.rent.toLocaleString()}/month
                </li>
                <li className="flex items-center gap-2">
                  <Heart size={16} className="text-slate-400" />
                  {sentInterests.some(
                    (interest) =>
                      interest.listingId?._id === id ||
                      interest.listingId === id,
                  )
                    ? "Interest already sent"
                    : "No interest sent yet"}
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3">
                More images
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {listing.photos?.slice(1, 5).map((photo, index) => (
                  <div
                    key={index}
                    className="h-28 overflow-hidden rounded-2xl bg-slate-100"
                  >
                    <img
                      src={photo}
                      alt={`${listing.title} alt ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
