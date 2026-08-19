import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div className="min-h-screen bg-[#e8f1ff]">

      <Sidebar />

      <div className="ml-72">

        <Navbar />

        <main className="px-8 py-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default Layout;