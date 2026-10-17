
import { useState, useEffect, useRef } from "react";
import { Settings, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
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
    description: "Manage your account and security",
  },
};

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const displayName = user?.name || "Student";
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const currentPage = pageInfo[location.pathname] || {
    title: "Placement Copilot",
    description: "Your AI-powered career preparation platform",
  };

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 px-4 pb-2 pt-2 sm:px-6 lg:px-8">
      <div className="flex min-h-[54px] items-center justify-between gap-3 rounded-xl border border-[#403B35] bg-[#1B1A19]/95 px-4 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.14)] backdrop-blur-xl sm:px-5">
        {/* Current page */}
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold tracking-[-0.025em] text-[#F0ECE5] sm:text-lg">
            {currentPage.title}
          </h2>

          <p className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-[#A59D93] sm:text-xs">
            {currentPage.description}
          </p>
        </div>

        {/* Square profile button */}
        <div className="relative shrink-0" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((previous) => !previous)}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            title={displayName}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold tracking-wide transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7A18A] ${
              profileOpen
                ? "border-[#A58A67] bg-[#41372B] text-[#F0D7B2]"
                : "border-[#655440] bg-gradient-to-br from-[#41372B] to-[#2B2620] text-[#DEC5A3] hover:border-[#A58A67] hover:bg-[#41372B]"
            }`}
          >
            {initials || "S"}
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-[#403B35] bg-[#201F1C] p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.4)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/settings");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#D8D0C5] transition hover:bg-[#302A24] hover:text-[#E2C8A3] focus-visible:outline-2 focus-visible:outline-[#B7A18A]"
              >
                <Settings size={16} />
                Settings
              </button>

              <div className="my-1 border-t border-[#35312B]" />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#D8A6A0] transition hover:bg-[#392522] hover:text-[#F0C1BA] focus-visible:outline-2 focus-visible:outline-[#B7A18A]"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
