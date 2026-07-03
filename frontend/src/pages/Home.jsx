import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Search,
  ArrowRight,
  Home as HomeIcon,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Home() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <HomeIcon size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              NestMatch
            </h1>
          </div>
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

      <section className="pt-20 pb-24 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mb-6 border border-indigo-100">
          <Sparkles size={14} /> AI-Powered Flatmate & Room Matching
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Find Your Perfect Space <br />
          <span className="text-indigo-600">& Compatible Flatmates</span>
        </h1>
        <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          NestMatch uses advanced AI to analyze your lifestyle, budget, and
          preferences, instantly ranking rooms and flatmates by compatibility.
          Stop searching, start matching.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(token ? "/dashboard" : "/browse")}
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Search size={18} /> Browse Listings
          </button>
          <button
            onClick={() => navigate(token ? "/dashboard" : "/register")}
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {token ? "Go to Dashboard" : "Get Started Free"}{" "}
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">
              Why Choose NestMatch?
            </h2>
            <p className="mt-3 text-slate-500">
              Built for the modern renter and property owner.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles size={24} />,
                title: "AI Compatibility Scoring",
                desc: "Our Groq-powered AI reads your profile and instantly scores every listing based on your unique lifestyle and budget.",
              },
              {
                icon: <MessageSquare size={24} />,
                title: "Real-Time Chat",
                desc: "Accepted an interest? Jump into a secure, real-time WebSocket chat instantly to discuss move-in details.",
              },
              {
                icon: <ShieldCheck size={24} />,
                title: "Secure & Verified",
                desc: "JWT-secured routes, strict Zod data validation, and role-based access control keep your data safe.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-100 transition-all"
              >
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              step: "1",
              title: "Set Your Preferences",
              desc: "Tell us your budget, preferred locations, and move-in date.",
            },
            {
              step: "2",
              title: "Browse AI Matches",
              desc: "View listings ranked by compatibility percentage, not just random order.",
            },
            {
              step: "3",
              title: "Connect & Move In",
              desc: "Send an interest, chat in real-time, and secure your new home.",
            },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                {s.step}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {s.title}
              </h3>
              <p className="text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-linear-to-br from-indigo-600 to-indigo-800 rounded-3xl p-12 text-center text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">
              Ready to find your match?
            </h2>
            <p className="text-indigo-100 mb-8 max-w-lg mx-auto">
              Join thousands of tenants and owners using AI to make better
              living decisions.
            </p>
            <button
              onClick={() => navigate(token ? "/dashboard" : "/register")}
              className="px-8 py-3.5 bg-white text-indigo-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all shadow-lg active:scale-[0.99]"
            >
              {token ? "Go to Dashboard" : "Create Free Account"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
