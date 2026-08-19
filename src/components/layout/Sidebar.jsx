import {
  LayoutDashboard,
  BriefcaseBusiness,
  Mic2,
  Map,
  BookOpen,
  Settings,
  LogOut,
  Sparkles,
  FileText,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Temporary frontend-only logout.
    // Later this will clear authentication/session data.
    navigate("/login");
  };

  return (
    <aside className="fixed left-4 top-4 flex h-[calc(100vh-2rem)] w-64 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Logo */}
      <div className="flex h-20 items-center px-6">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Sparkles size={18} />
          </div>

          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              Placement
            </h1>

            <p className="text-xs font-medium text-slate-500">
              Copilot
            </p>
          </div>

        </div>

      </div>


      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>


        <div className="space-y-1">

          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            to="/dashboard"
          />

          <SidebarItem
            icon={<FileText size={18} />}
            label="Resume Analyzer"
            to="/resume-analyzer"
          />

          <SidebarItem
            icon={<BriefcaseBusiness size={18} />}
            label="Resume Matcher"
            to="/resume-matcher"
          />

          <SidebarItem
            icon={<Mic2 size={18} />}
            label="Interview Prep"
            to="/interview-prep"
          />

          <SidebarItem
            icon={<Map size={18} />}
            label="Roadmap"
            to="/roadmap"
          />

          <SidebarItem
            icon={<BookOpen size={18} />}
            label="PDF Assistant"
            to="/pdf-assistant"
          />

        </div>

      </nav>


      {/* Bottom */}
      <div className="border-t border-slate-200 p-3">

        {/* Settings */}
        <SidebarItem
          icon={<Settings size={18} />}
          label="Settings"
          to="/settings"
        />


        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}


function SidebarItem({ icon, label, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export default Sidebar;