import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import ListingCard from "../components/ListingCard";
import { Search, Home as HomeIcon } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Browse() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [listings, setListings] = useState([]);
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
    } catch (err) {
      console.error("Failed to load listings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <HomeIcon size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              NestMatch
            </h1>
          </button>
          <div className="flex items-center gap-3">
            {token ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-slate-700 hover:text-indigo-600 text-sm font-semibold transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Browse Available Rooms
          </h2>
          <p className="text-slate-500">
            Find your next home.{" "}
            <span
              className="text-indigo-600 font-medium cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Sign in
            </span>{" "}
            to see AI compatibility scores!
          </p>
        </div>

        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-wrap gap-3 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
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
                onInterestSent={fetchListings}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
