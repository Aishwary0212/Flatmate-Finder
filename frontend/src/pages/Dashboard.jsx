import {
  BedDouble,
  Building2,
  CheckCircle2,
  Edit3,
  Heart,
  Home,
  Image as ImageIcon,
  IndianRupee,
  LogOut,
  MapPin,
  MessageSquare,
  PlusCircle,
  Search,
  Sparkles,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import ChatWindow from "../components/ChatWindow";
import ListingCard from "../components/ListingCard";
import TenantProfileForm from "../components/TenantProfileForm";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";


function TenantDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("browse");
  const [listings, setListings] = useState([]);
  const [sentInterests, setSentInterests] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [filters, setFilters] = useState({
    location: "",
    minRent: "",
    maxRent: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.location) params.set("location", filters.location);
      if (filters.minRent) params.set("minRent", filters.minRent);
      if (filters.maxRent) params.set("maxRent", filters.maxRent);
      const { data } = await api.get(`/listings/browse?${params}`);
      setListings(data.listings);
    } catch (error) {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const fetchSentInterests = async () => {
    try {
      const { data } = await api.get("/interests/sent");
      setSentInterests(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchSentInterests();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleRemoveInterest = async (interestId) => {
    try {
      await api.delete(`/interests/${interestId}`);
      setSentInterests((prev) => prev.filter((i) => i._id !== interestId));
      toast.success("Interest removed successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to remove interest");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="inline-flex bg-slate-100 p-1 rounded-xl mb-8 shadow-inner">
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "browse"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Search size={16} /> Browse Listings
        </button>
        <button
          onClick={() => setActiveTab("interests")}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "interests"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Heart size={16} /> My Interests
        </button>
      </div>

      {activeTab === "browse" ? (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" /> AI Preferences
            </h3>
            <div className="max-w-md">
              <TenantProfileForm
                onSaved={() => {
                  fetchListings();
                  toast.success("AI scores updated!");
                }}
              />
            </div>
          </div>

          <div>
            <form
              onSubmit={handleFilterSubmit}
              className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
            >
              <div className="flex-1 min-w-50 relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Location..."
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <input
                type="number"
                placeholder="Min ₹"
                value={filters.minRent}
                onChange={(e) =>
                  setFilters({ ...filters, minRent: e.target.value })
                }
                className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={filters.maxRent}
                onChange={(e) =>
                  setFilters({ ...filters, maxRent: e.target.value })
                }
                className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Search
              </button>
            </form>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 bg-slate-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">
                  No listings match your criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    isSent={sentInterests.some(
                      (interest) =>
                        interest.listingId?._id === listing._id ||
                        interest.listingId === listing._id,
                    )}
                    onInterestSent={() => {
                      fetchListings();
                      fetchSentInterests();
                    }}
                    onCardClick={() => navigate(`/listings/${listing._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            My Interests
          </h2>
          {sentInterests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Heart size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">
                You haven't sent any interests yet.
              </p>
            </div>
          ) : (
            sentInterests.map((interest) => {
              const isAccepted = interest.status === "ACCEPTED";
              const isDeclined = interest.status === "DECLINED";
              return (
                <div
                  key={interest._id}
                  className={`bg-white rounded-xl border-l-4 ${
                    isAccepted
                      ? "border-l-emerald-500"
                      : isDeclined
                        ? "border-l-red-500"
                        : "border-l-amber-500"
                  } border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg">
                        {interest.listingId?.title || "Unknown Listing"}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {interest.listingId?.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee size={14} />{" "}
                          {interest.listingId?.rent?.toLocaleString()}/mo
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Sent on{" "}
                        {new Date(interest.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          isAccepted
                            ? "bg-emerald-50 text-emerald-700"
                            : isDeclined
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {interest.status}
                      </span>
                      {isAccepted && (
                        <button
                          onClick={() => setSelectedChat(interest._id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                        >
                          <MessageSquare size={16} /> Chat
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveInterest(interest._id)}
                        className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 flex items-center gap-2 transition-colors"
                        title="Remove this interest"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {selectedChat && (
        <ChatWindow
          interestId={selectedChat}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
}


function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState("interests");
  const [interests, setInterests] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newListing, setNewListing] = useState({
    title: "",
    location: "",
    rent: "",
    availableFrom: "",
    roomType: "Private Room",
    furnishingStatus: "Furnished",
    images: [],
    photoUrls: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [interestsRes, listingsRes] = await Promise.all([
        api.get("/interests/received"),
        api.get("/listings/my-listings"),
      ]);
      setInterests(interestsRes.data);
      setMyListings(listingsRes.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRespond = async (interestId, status) => {
    try {
      await api.patch(`/interests/${interestId}/respond`, { status });
      setInterests((prev) =>
        prev.map((i) => (i._id === interestId ? { ...i, status } : i)),
      );
      toast.success(`Interest ${status.toLowerCase()}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to respond");
    }
  };

  const uploadListingImages = async (files) => {
    if (!files || files.length === 0) return [];
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    try {
      const { data } = await api.post("/listings/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.urls || [];
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error("Image upload failed. Using URLs instead.");
      return [];
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating listing & uploading images...");
    try {
      const uploadedUrls = await uploadListingImages(newListing.images);
      const manualUrls = newListing.photoUrls
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const finalPhotos = [...uploadedUrls, ...manualUrls];
      if (finalPhotos.length === 0) {
        finalPhotos.push(
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        );
      }

      const payload = {
        title: newListing.title.trim(),
        location: newListing.location.trim(),
        rent: Number(newListing.rent),
        availableFrom: new Date(newListing.availableFrom).toISOString(),
        roomType: newListing.roomType,
        furnishingStatus: newListing.furnishingStatus,
        photos: finalPhotos,
      };

      await api.post("/listings", payload);
      toast.success("Listing published!", { id: toastId });
      setNewListing({
        title: "",
        location: "",
        rent: "",
        availableFrom: "",
        roomType: "Private Room",
        furnishingStatus: "Furnished",
        images: [],
        photoUrls: "",
      });
      fetchData();
      setActiveTab("listings");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create listing", {
        id: toastId,
      });
    }
  };

  const handleMarkFilled = async (listingId) => {
    try {
      await api.patch(`/listings/${listingId}/fill`);
      setMyListings((prev) =>
        prev.map((l) => (l._id === listingId ? { ...l, isFilled: true } : l)),
      );
      toast.success("Listing marked as filled");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleMarkUnfilled = async (listingId) => {
    try {
      await api.patch(`/listings/${listingId}/unfill`);
      setMyListings((prev) =>
        prev.map((l) => (l._id === listingId ? { ...l, isFilled: false } : l)),
      );
      toast.success("Listing marked as unfilled");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Delete this listing permanently?")) return;
    try {
      await api.delete(`/listings/${listingId}`);
      setMyListings((prev) => prev.filter((l) => l._id !== listingId));
      toast.success("Listing deleted");
    } catch (error) {
      toast.error("Failed to delete listing");
    }
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-12 w-64 bg-slate-100 rounded-xl animate-pulse mb-8" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );

  const pendingCount = interests.filter((i) => i.status === "PENDING").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="inline-flex bg-slate-100 p-1 rounded-xl mb-8 shadow-inner flex-wrap">
        <button
          onClick={() => setActiveTab("interests")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "interests"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <MessageSquare size={16} /> Received
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("listings")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "listings"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Building2 size={16} /> My Listings
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "create"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <PlusCircle size={16} /> Create New
        </button>
      </div>

      {activeTab === "interests" && (
        <div className="space-y-4">
          {interests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <MessageSquare
                size={48}
                className="mx-auto text-slate-300 mb-4"
              />
              <p className="text-slate-500 font-medium">
                No interests received yet.
              </p>
            </div>
          ) : (
            interests.map((interest) => (
              <div
                key={interest._id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-slate-900">
                    {interest.listingId?.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    From{" "}
                    <span className="font-semibold text-slate-700">
                      {interest.tenantId?.userId?.name}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {interest.status === "PENDING" ? (
                    <>
                      <button
                        onClick={() => handleRespond(interest._id, "ACCEPTED")}
                        className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-semibold hover:bg-emerald-100 flex items-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Accept
                      </button>
                      <button
                        onClick={() => handleRespond(interest._id, "DECLINED")}
                        className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 flex items-center gap-2"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          interest.status === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {interest.status}
                      </span>
                      {interest.status === "ACCEPTED" && (
                        <button
                          onClick={() => setSelectedChat(interest._id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2"
                        >
                          <MessageSquare size={16} /> Chat
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "listings" && (
        <div className="grid gap-4">
          {myListings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium mb-4">
                You haven't created any listings.
              </p>
              <button
                onClick={() => setActiveTab("create")}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Create your first listing
              </button>
            </div>
          ) : (
            myListings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-5 hover:shadow-md transition-shadow"
              >
                <div className="w-24 h-24 bg-slate-100 rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                  {listing.photos?.[0] ? (
                    <img
                      src={listing.photos[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BedDouble size={32} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 truncate">
                      {listing.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        listing.isFilled
                          ? "bg-slate-200 text-slate-600"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {listing.isFilled ? "Filled" : "Active"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {listing.location}
                    </span>
                    <span className="font-semibold text-slate-700">
                      ₹{listing.rent.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {listing.isFilled ? (
                    <button
                      onClick={() => handleMarkUnfilled(listing._id)}
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Mark as Unfilled"
                    >
                      <XCircle size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkFilled(listing._id)}
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Mark as Filled"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  )}
                  <button
                    onClick={() =>
                      toast("Edit feature coming soon!", { icon: "🛠️" })
                    }
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteListing(listing._id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "create" && (
        <div className="max-w-3xl bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PlusCircle className="text-indigo-600" /> Create New Listing
          </h2>
          <form onSubmit={handleCreateListing} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Property Title
              </label>
              <input
                required
                value={newListing.title}
                onChange={(e) =>
                  setNewListing({ ...newListing, title: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="e.g. Sunny Private Room in Indiranagar"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Location
                </label>
                <input
                  required
                  value={newListing.location}
                  onChange={(e) =>
                    setNewListing({ ...newListing, location: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Monthly Rent (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newListing.rent}
                  onChange={(e) =>
                    setNewListing({ ...newListing, rent: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Room Type
                </label>
                <select
                  value={newListing.roomType}
                  onChange={(e) =>
                    setNewListing({ ...newListing, roomType: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-all"
                >
                  <option>Private Room</option>
                  <option>Shared Room</option>
                  <option>Entire Apartment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Furnishing
                </label>
                <select
                  value={newListing.furnishingStatus}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      furnishingStatus: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-all"
                >
                  <option>Furnished</option>
                  <option>Semi-Furnished</option>
                  <option>Unfurnished</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Available From
                </label>
                <input
                  type="date"
                  required
                  value={newListing.availableFrom}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      availableFrom: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Property Photos
              </label>
              <div className="mt-1 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-8 hover:border-indigo-400 transition-colors bg-slate-50/50">
                <div className="text-center">
                  <ImageIcon
                    className="mx-auto h-10 w-10 text-slate-400"
                    aria-hidden="true"
                  />
                  <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 px-1"
                    >
                      <span>Upload images</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          setNewListing({
                            ...newListing,
                            images: Array.from(e.target.files || []),
                          })
                        }
                      />
                    </label>
                    <p className="pl-1">from your device</p>
                  </div>
                  <p className="text-xs leading-5 text-slate-400 mt-1">
                    PNG, JPG, GIF up to 10MB{" "}
                    {newListing.images.length > 0 && (
                      <span className="font-bold text-indigo-600">
                        ({newListing.images.length} selected)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Or paste Image URLs (comma-separated)
              </label>
              <input
                value={newListing.photoUrls}
                onChange={(e) =>
                  setNewListing({ ...newListing, photoUrls: e.target.value })
                }
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              <Home size={18} /> Publish Listing
            </button>
          </form>
        </div>
      )}

      {selectedChat && (
        <ChatWindow
          interestId={selectedChat}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <Home size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              NestMatch
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              title="View Profile"
            >
              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {user?.name}
              </span>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {user?.role}
              </span>
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="sm:hidden p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="View Profile"
            >
              <User size={20} />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {user?.role === "TENANT" ? <TenantDashboard /> : <OwnerDashboard />}
    </div>
  );
}
