import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const pageInfo = {
  "/dashboard": {
    title: "Dashboard",
    description: "Your placement preparation overview",
  },

  "/resume-analyzer": {
    title: "Resume Analyzer",
    description: "Analyze your resume and improve your ATS compatibility",
  },

  "/resume-matcher": {
    title: "Resume Matcher",
    description: "Compare your resume with your target job description",
  },

  "/interview-prep": {
    title: "Interview Prep",
    description: "Practice with AI-generated interview questions",
  },

  "/roadmap": {
    title: "Roadmap",
    description: "Your personalized placement preparation plan",
  },

  "/pdf-assistant": {
    title: "PDF Assistant",
    description: "Ask questions about your uploaded study material",
  },
};

function Navbar() {
  const { user } = useAuth();

  const displayName = user?.name || "Student";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();

  const currentPage = pageInfo[location.pathname] || {
    title: "Placement Copilot",
    description: "Your AI-powered career preparation platform",
  };

  return (
    <header className="mx-4 mt-4 flex h-20 items-center justify-between rounded-2xl border border-slate-200 bg-white px-8 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">

      {/* Page information */}
      <div>

        <h2 className="text-lg font-semibold text-slate-900">
          {currentPage.title}
        </h2>

        <p className="text-sm text-slate-500">
          {currentPage.description}
        </p>

      </div>


      {/* Right side */}
      <div className="flex items-center gap-5">

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
          title="Notifications"
        >
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
        </button>


        {/* Divider */}
        <div className="h-7 w-px bg-slate-200" />


        {/* Profile */}
        <div className="flex items-center gap-3">

          <div className="text-right">

            <p className="text-sm font-semibold text-slate-900">
              {displayName}
            </p>

            <p className="text-xs text-slate-500">
              Student
            </p>

          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {initials}
          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;