import {
  LayoutDashboard,
  FileText,
  BriefcaseBusiness,
  Mic2,
  Map,
  BookOpen,
  Settings,
  LogOut,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Resume Analyzer", to: "/resume-analyzer", icon: FileText },
  { label: "Resume Matcher", to: "/resume-matcher", icon: BriefcaseBusiness },
  { label: "Interview Prep", to: "/interview-prep", icon: Mic2 },
  { label: "Roadmap", to: "/roadmap", icon: Map },
  { label: "PDF Assistant", to: "/pdf-assistant", icon: BookOpen },
];

function Sidebar({
  open,
  collapsed,
  onToggle,
  onCollapseToggle,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name || "Student";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navLinkClasses = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "border-[#5A4B3D] bg-gradient-to-r from-[#393127] to-[#302923] text-[#E2C9A8] shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]"
        : "border-transparent text-[#A7A098] hover:border-[#393530] hover:bg-[#272522] hover:text-[#F0ECE5]"
    }`;

  return (
    <>
      {/*
        Mobile backdrop.
        Clicking outside the sidebar closes it.
      */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={`fixed z-50 flex flex-col overflow-hidden rounded-[24px] border border-[#403B35] bg-gradient-to-b from-[#201F1E] via-[#1B1A19] to-[#191817] text-[#F0ECE5] shadow-[0_24px_70px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(237,220,196,0.07)] transition-[width,transform,left,top,bottom] duration-300 ease-in-out ${
          collapsed ? "w-[84px]" : "w-[260px]"
        } ${
          open
            ? "left-3 top-3 bottom-3 translate-x-0 md:left-4 md:top-4 md:bottom-4"
            : "left-3 top-3 bottom-3 -translate-x-[120%] md:left-4 md:top-4 md:bottom-4"
        }`}
      >
        {/* Subtle illuminated edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#B7A18A]/45 to-transparent"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(183,161,138,0.08),transparent_70%)]"
        />

        {/* Brand */}
        <div
          className={`relative flex h-[82px] shrink-0 items-center border-b border-[#393530]/80 ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              title="Ascend"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#D1B99A]/45 bg-gradient-to-br from-[#D1B99A] to-[#AA8E70] text-[#252019] shadow-[0_5px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.5)]"
            >
              <Sparkles size={21} strokeWidth={1.8} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="whitespace-nowrap text-sm font-semibold tracking-tight text-[#F0ECE5]">
                  Ascend
                </h1>
                <p className="mt-1 whitespace-nowrap text-[11px] text-[#968E84]">
                  Your career workspace
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              onClick={onCollapseToggle}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8F877D] transition hover:bg-[#302D29] hover:text-[#D7C3A8] md:flex"
            >
              <PanelLeftClose size={17} />
            </button>
          )}
        </div>

        {/* Collapsed-mode expand control */}
        {collapsed && (
          <button
            type="button"
            onClick={onCollapseToggle}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="mx-auto mt-3 flex h-9 w-9 items-center justify-center rounded-xl border border-[#403B35] bg-[#262421] text-[#B7A18A] transition hover:border-[#78634C] hover:bg-[#302A24]"
          >
            <PanelLeftOpen size={17} />
          </button>
        )}

        {/* Navigation */}
        <nav
          className={`relative flex-1 overflow-y-auto overflow-x-hidden ${
            collapsed ? "px-2 py-5" : "px-3 py-5"
          }`}
        >
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#746D63]">
              Workspace
            </p>
          )}

          <div className="space-y-1.5">
            {navigation.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                onClick={() => {
                  if (window.innerWidth < 768) onToggle();
                }}
                className={({ isActive }) =>
                  `${navLinkClasses({ isActive })} ${
                    collapsed ? "justify-center px-0" : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !collapsed && (
                      <span className="absolute bottom-2.5 left-0 top-2.5 w-[2px] rounded-full bg-[#C5A984] shadow-[0_0_8px_rgba(197,169,132,0.35)]" />
                    )}

                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2 : 1.7}
                      className={`shrink-0 ${
                        isActive ? "text-[#D6BC98]" : ""
                      }`}
                    />

                    {!collapsed && (
                      <>
                        <span className="truncate">{label}</span>

                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#C5A984] shadow-[0_0_8px_rgba(197,169,132,0.4)]" />
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Settings and account */}
        <div
          className={`relative shrink-0 border-t border-[#393530]/80 py-3 ${
            collapsed ? "px-2" : "px-3"
          }`}
        >
          <NavLink
            to="/settings"
            title={collapsed ? "Settings" : undefined}
            onClick={() => {
              if (window.innerWidth < 768) onToggle();
            }}
            className={({ isActive }) =>
              `${navLinkClasses({ isActive })} ${
                collapsed ? "justify-center px-0" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Settings
                  size={19}
                  strokeWidth={isActive ? 2 : 1.7}
                  className={isActive ? "text-[#D6BC98]" : ""}
                />
                {!collapsed && <span>Settings</span>}
              </>
            )}
          </NavLink>

          <div
            className={`mt-3 flex items-center border-t border-[#393530]/80 pt-4 ${
              collapsed
                ? "justify-center"
                : "gap-3 px-1"
            }`}
          >
            <div
              title={displayName}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#62513F] bg-gradient-to-br from-[#40362B] to-[#29241F] text-xs font-semibold text-[#DEC5A3] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              {initials}
            </div>

            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#EDE7DE]">
                    {displayName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#8F877D]">
                    Student
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  title="Log out"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#8F877D] transition hover:bg-[#352927] hover:text-[#CBA09A]"
                >
                  <LogOut size={17} />
                </button>
              </>
            )}
          </div>

          {collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="mx-auto mt-3 flex h-9 w-9 items-center justify-center rounded-xl text-[#8F877D] transition hover:bg-[#352927] hover:text-[#CBA09A]"
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;