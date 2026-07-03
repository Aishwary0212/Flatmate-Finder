import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";
import {
  User,
  Mail,
  FileText,
  Shield,
  Calendar,
  Camera,
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Home,
  ArrowLeft,
} from "lucide-react";

const ViewRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
    <div className="p-2.5 bg-white text-indigo-600 rounded-lg shadow-sm border border-slate-100">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-slate-900 font-medium mt-0.5 truncate">{value}</p>
    </div>
  </div>
);

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    profilePicture: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        setProfile(data);
        setFormData({
          name: data.name,
          bio: data.bio || "",
          profilePicture: null,
        });
        if (data.profilePicture) setPreviewUrl(data.profilePicture);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePicture: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (file) => {
    if (!file) return profile?.profilePicture || null;
    const formDataUpload = new FormData();
    formDataUpload.append("images", file);

    try {
      const { data } = await api.post("/listings/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.urls?.[0] || null;
    } catch (err) {
      console.error("Profile picture upload failed:", err);
      throw err;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let profilePictureUrl = profile?.profilePicture;
      if (formData.profilePicture) {
        profilePictureUrl = await uploadProfilePicture(formData.profilePicture);
      }

      const { data } = await api.patch("/auth/profile", {
        name: formData.name,
        bio: formData.bio,
        profilePicture: profilePictureUrl,
      });

      setProfile(data);
      setFormData({
        ...formData,
        profilePicture: null,
      });
      setEditMode(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to update profile. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-linear-to-br from-indigo-600 via-indigo-700 to-indigo-800 px-6 py-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {previewUrl || profile?.profilePicture ? (
                    <img
                      src={previewUrl || profile?.profilePicture}
                      alt={profile?.name}
                      className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-indigo-400/30"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-indigo-400/30">
                      <User size={48} className="text-slate-400" />
                    </div>
                  )}
                  {editMode && (
                    <label
                      htmlFor="profilePictureEdit"
                      className="absolute bottom-0 right-0 bg-indigo-500 p-2 rounded-full text-white shadow-lg cursor-pointer hover:bg-indigo-400 transition-colors border-2 border-white"
                    >
                      <Camera size={16} />
                    </label>
                  )}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {profile?.name}
              </h1>
              <p className="text-indigo-100 mt-2 font-medium">
                {profile?.email}
              </p>
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-white/20">
                {profile?.role === "TENANT" ? (
                  <Home size={14} />
                ) : (
                  <Briefcase size={14} />
                )}
                {profile?.role === "TENANT" ? "Tenant" : "Owner"}
              </div>
            </div>
          </div>

          <div className="px-6 py-8">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg mb-6 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg mb-6 flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                {success}
              </div>
            )}

            {!editMode ? (
              <div className="space-y-4">
                <ViewRow
                  icon={<User size={18} />}
                  label="Full Name"
                  value={profile?.name}
                />
                <ViewRow
                  icon={<Mail size={18} />}
                  label="Email Address"
                  value={profile?.email}
                />
                <ViewRow
                  icon={<FileText size={18} />}
                  label="Bio"
                  value={profile?.bio || "No bio added yet"}
                />
                <ViewRow
                  icon={<Shield size={18} />}
                  label="Account Type"
                  value={profile?.role === "TENANT" ? "Tenant" : "Owner"}
                />
                <ViewRow
                  icon={<Calendar size={18} />}
                  label="Member Since"
                  value={new Date(profile?.createdAt).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                />

                <button
                  onClick={() => setEditMode(true)}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.99] transition-all"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Name
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Bio
                  </label>
                  <div className="relative">
                    <FileText
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={4}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="profilePictureEdit"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Profile Picture
                  </label>
                  <input
                    id="profilePictureEdit"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100 file:cursor-pointer file:transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-200 active:scale-[0.99] transition-all"
                  >
                    {saving ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        name: profile?.name,
                        bio: profile?.bio || "",
                        profilePicture: null,
                      });
                      setPreviewUrl(profile?.profilePicture || "");
                    }}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 disabled:opacity-50 active:scale-[0.99] transition-all"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
