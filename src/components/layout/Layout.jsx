import { useState } from "react";
import { PanelLeftOpen } from "lucide-react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((previous) => !previous);
  };

  const toggleCollapsed = () => {
    setSidebarCollapsed((previous) => !previous);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#111112] text-[#F0ECE5]">
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        onCollapseToggle={toggleCollapsed}
      />

      {/* Floating button to bring the sidebar back */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Show sidebar"
          title="Show sidebar"
          className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-[#514638] bg-gradient-to-br from-[#29251F] to-[#1B1A19] text-[#D1B99A] shadow-[0_10px_30px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[#907554] hover:text-[#E4D0B4]"
        >
          <PanelLeftOpen size={19} />
        </button>
      )}

      {/* Main content adjusts to the sidebar state */}
      <div
        className={`min-h-screen min-w-0 transition-[margin] duration-300 ease-in-out ${
          sidebarOpen
            ? sidebarCollapsed
              ? "md:ml-[116px]"
              : "md:ml-[292px]"
            : "ml-0"
        }`}
      >
        <Navbar />

        <main className="min-w-0 px-4 pb-8 pt-4 sm:px-6 sm:pt-5 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;