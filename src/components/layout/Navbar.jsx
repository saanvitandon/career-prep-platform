import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const pageInfo = {
  "/dashboard": {
    title: "Dashboard",
    description: "Your placement preparation overview",
  },
  "/resume-analyzer": {
    title: "Resume Analyzer",
    description: "Analyze your resume and improve its ATS compatibility",
  },
  "/resume-matcher": {
    title: "Resume Matcher",
    description: "Compare your resume with your target job description",
  },
  "/interview-prep": {
    title: "Interview Prep",
    description: "Practice with interview questions",
  },
  "/roadmap": {
    title: "Personalized Roadmap",
    description: "Your placement preparation plan",
  },
  "/pdf-assistant": {
    title: "PDF Assistant",
    description: "Ask questions about your uploaded study material",
  },
  "/settings": {
    title: "Settings",
    description: "Manage your preferences and account",
  },
};

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const displayName = user?.name || "Student";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const currentPage = pageInfo[location.pathname] || {
    title: "Placement Copilot",
    description: "Your AI-powered career preparation platform",
  };

  return (
    <header className="sticky top-0 z-30 px-4 pb-3 pt-4 sm:px-6 sm:pt-5 lg:px-8">
      <div className="group relative isolate flex min-h-[76px] items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#403B35] bg-[#1B1A19]/90 px-4 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(238,222,201,0.055)] backdrop-blur-2xl transition-all duration-300 hover:border-[#51483D] sm:px-6">
        {/* Restrained ambient lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#B7A18A]/40 to-transparent"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 -z-10 h-48 w-64 rounded-full bg-[radial-gradient(ellipse,rgba(183,161,138,0.075),transparent_70%)] blur-2xl"
        />

        {/* Page information */}
        <div className="relative min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-[-0.025em] text-[#F0ECE5] sm:text-xl">
            {currentPage.title}
          </h2>

          <p className="mt-1 line-clamp-1 text-xs leading-5 text-[#A59D93] sm:text-sm">
            {currentPage.description}
          </p>
        </div>

        {/* Actions */}
        <div className="relative flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className="group/notification relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#403B35] bg-[#242220]/90 text-[#B7ADA0] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition-all duration-200 hover:border-[#78634C] hover:bg-[#302A24] hover:text-[#D5BB96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7A18A]"
          >
            <Bell
              size={18}
              strokeWidth={1.7}
              className="transition-transform duration-200 group-hover/notification:-rotate-6"
            />

            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#C7A77D] shadow-[0_0_8px_rgba(199,167,125,0.5)] ring-2 ring-[#242220]" />
          </button>

          {/* User avatar */}
          <div
            title={displayName}
            aria-label={`Signed in as ${displayName}`}
            className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#655440] bg-gradient-to-br from-[#41372B] to-[#2B2620] text-xs font-semibold tracking-wide text-[#DEC5A3] shadow-[0_4px_12px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;