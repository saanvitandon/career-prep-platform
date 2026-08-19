import {
  User,
  Bell,
  Lock,
  Palette,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="space-y-6">

      {/* Page intro */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your account and application preferences.
        </p>
      </div>


      {/* =========================
          PROFILE
      ========================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <User size={19} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Profile
            </h2>

            <p className="text-xs text-slate-500">
              Your personal information
            </p>
          </div>

        </div>


        <div className="mt-5 grid gap-5 sm:grid-cols-2">

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Full name
            </label>

            <input
              type="text"
              defaultValue="Saanvi"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>


          {/* Email */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Email address
            </label>

            <input
              type="email"
              defaultValue="saanvi@example.com"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

        </div>


        <button className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
          Save changes
        </button>

      </section>


      {/* =========================
          APPEARANCE
      ========================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Palette size={19} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Appearance
            </h2>

            <p className="text-xs text-slate-500">
              Customize how Placement Copilot looks
            </p>
          </div>

        </div>


        <div className="mt-5 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              {darkMode ? (
                <Moon size={17} />
              ) : (
                <Sun size={17} />
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900">
                Dark mode
              </p>

              <p className="text-xs text-slate-500">
                {darkMode
                  ? "Dark theme is currently enabled"
                  : "Use the light theme"}
              </p>
            </div>

          </div>


          {/* Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              darkMode
                ? "bg-blue-600"
                : "bg-slate-300"
            }`}
            aria-label="Toggle dark mode"
          >

            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                darkMode
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />

          </button>

        </div>

      </section>


      {/* =========================
          NOTIFICATIONS
      ========================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Bell size={19} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Notifications
            </h2>

            <p className="text-xs text-slate-500">
              Manage your notification preferences
            </p>
          </div>

        </div>


        <div className="divide-y divide-slate-100">

          <SettingRow
            title="Placement reminders"
            description="Get reminders about your preparation goals."
          />

          <SettingRow
            title="Application updates"
            description="Receive updates about your tracked applications."
          />

          <SettingRow
            title="Weekly progress"
            description="Receive a summary of your preparation progress."
          />

        </div>

      </section>


      {/* =========================
          SECURITY
      ========================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Lock size={19} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Security
            </h2>

            <p className="text-xs text-slate-500">
              Manage your account security
            </p>
          </div>

        </div>


        <button className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50">

          <div>
            <p className="text-sm font-medium text-slate-900">
              Change password
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Update your account password
            </p>
          </div>

          <ChevronRight
            size={18}
            className="text-slate-400"
          />

        </button>

      </section>

    </div>
  );
}


/* Notification row */
function SettingRow({ title, description }) {
  return (
    <div className="flex items-center justify-between py-4">

      <div>
        <p className="text-sm font-medium text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>


      <div className="relative h-6 w-11 rounded-full bg-blue-600">

        <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />

      </div>

    </div>
  );
}

export default Settings;