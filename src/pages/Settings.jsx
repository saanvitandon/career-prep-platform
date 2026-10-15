
import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Lock,
  Palette,
  Moon,
  ChevronRight,
  Sparkles,
  Check,
  Info,
  ShieldCheck,
  Settings2,
  Sun,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const DEFAULT_NOTIFICATIONS = {
  reminders: true,
  applications: true,
  weeklyProgress: false,
};

function Settings() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("placement-notifications");
      return saved
        ? { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(saved) }
        : DEFAULT_NOTIFICATIONS;
    } catch {
      return { ...DEFAULT_NOTIFICATIONS };
    }
  });

  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "placement-notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  const updateNotification = (key) => {
    setNotifications((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
    setNotice("Notification preferences saved on this device.");
  };

  const displayName = user?.name || "Student";
  const email = user?.email || "No email available";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handlePasswordClick = () => {
    setNotice(
      "Password changes are not available in Settings yet. Your current account and login remain unchanged."
    );
  };

  return (
    <div className="relative mx-auto max-w-[1200px] space-y-7 pb-8 text-[#F0ECE5]">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-36 top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(173,135,91,0.055),transparent_70%)] blur-3xl" />
        <div className="absolute -left-40 top-[55%] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(135,145,119,0.035),transparent_70%)] blur-3xl" />
      </div>

      {/* Introduction */}
      <section className="relative overflow-hidden rounded-[28px] border border-[#403B35] bg-gradient-to-br from-[#26231F] via-[#1E1C19] to-[#191817] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-[#C5A984]/10" />
        <div className="pointer-events-none absolute -right-4 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.07),transparent_70%)]" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#65513C]/70 bg-[#332A21]/70 px-3.5 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#D4B994]">
            <Settings2 size={14} />
            YOUR PREFERENCES
          </div>

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-[-0.045em] text-[#F1ECE4] sm:text-5xl">
                Make it yours.
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#AAA197] sm:text-base">
                Manage your account details and workspace preferences in one
                place.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-2xl border border-[#403B35] bg-[#191817]/80 px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#65513C]/60 bg-[#332A21] text-[#D4B994]">
                <ShieldCheck size={19} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#E9E2D8]">
                  Account settings
                </p>
                <p className="mt-1 text-xs text-[#928A80]">
                  Personal workspace
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-[#65513C]/80 bg-[#332A21] p-4 text-sm text-[#D8BD98]"
        >
          <Info size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1 leading-6">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            className="rounded-lg p-1 text-[#AAA093] transition hover:bg-[#413526] hover:text-[#F0ECE5]"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
      )}

      {/* Profile */}
      <SettingsSection
        icon={<User size={20} />}
        iconStyle="border-[#65513C]/70 bg-[#332A21] text-[#D4B994]"
        title="Profile"
        description="Your account information"
        eyebrow="ACCOUNT"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#80694C] bg-gradient-to-br from-[#D8C1A0] to-[#8F7556] text-lg font-semibold text-[#241E17] shadow-[0_5px_20px_rgba(160,126,86,0.12)]">
            {initials || "S"}
          </div>

          <div className="min-w-0">
            <h3 className="break-words text-lg font-semibold text-[#F0ECE5]">
              {displayName}
            </h3>
            <p className="mt-1 break-all text-sm text-[#AAA093]">{email}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#465B45] bg-[#293328] px-3 py-1 text-xs font-medium text-[#B5C4AA]">
              <ShieldCheck size={13} />
              Signed-in account
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#35312B] bg-[#191817] p-4">
          <p className="text-sm font-medium text-[#E9E2D8]">
            Account details
          </p>
          <p className="mt-1 text-sm leading-6 text-[#928A80]">
            Your name and email are displayed from your current login session.
            Editing and saving profile details requires a connected backend
            feature, so these details aren't editable here yet.
          </p>
        </div>
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection
        icon={<Palette size={20} />}
        iconStyle="border-[#65513C]/70 bg-[#332A21] text-[#D4B994]"
        title="Appearance"
        description="Your workspace look and feel"
        eyebrow="PERSONALIZATION"
      >
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#65513C]/70 bg-[#332A21] text-[#D4B994]">
              <Moon size={21} />
            </div>

            <div>
              <p className="font-semibold text-[#F0ECE5]">Dark workspace</p>
              <p className="mt-1 text-sm text-[#928A80]">
                A consistent charcoal interface with warm, muted accents.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#465B45] bg-[#293328] px-3 py-2 text-xs font-semibold text-[#B5C4AA]">
            <Check size={14} />
            Active theme
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ThemeSwatch
            title="Charcoal"
            description="Core surfaces"
            className="bg-gradient-to-br from-[#302D28] to-[#191817]"
            borderClass="border-[#51483D]"
          />
          <ThemeSwatch
            title="Champagne"
            description="Highlights"
            className="bg-gradient-to-br from-[#D8C1A0] to-[#8F7556]"
            borderClass="border-[#D8C1A0]/40"
          />
          <ThemeSwatch
            title="Sage"
            description="Positive states"
            className="bg-gradient-to-br from-[#A4B49A] to-[#465B45]"
            borderClass="border-[#667A61]"
          />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#35312B] bg-[#191817] p-4">
          <Info size={17} className="mt-0.5 shrink-0 text-[#C5A984]" />
          <p className="text-xs leading-5 text-[#928A80]">
            Placement Copilot now uses a dark-only design. The appearance
            settings here are informational; no theme toggle is needed.
          </p>
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection
        icon={<Bell size={20} />}
        iconStyle="border-[#65513C]/70 bg-[#332A21] text-[#D4B994]"
        title="Notifications"
        description="Choose which reminders you'd like enabled"
        eyebrow="PREFERENCES"
      >
        <div className="divide-y divide-[#35312B]">
          <NotificationRow
            title="Placement reminders"
            description="Reminders about your preparation goals."
            enabled={notifications.reminders}
            onChange={() => updateNotification("reminders")}
          />

          <NotificationRow
            title="Application updates"
            description="Updates about your tracked applications."
            enabled={notifications.applications}
            onChange={() => updateNotification("applications")}
          />

          <NotificationRow
            title="Weekly progress"
            description="A weekly summary of your preparation progress."
            enabled={notifications.weeklyProgress}
            onChange={() => updateNotification("weeklyProgress")}
          />
        </div>

        <p className="mt-5 text-xs leading-5 text-[#81796F]">
          These preferences are saved locally on this device. Actual email,
          push, and scheduled notifications aren't connected yet.
        </p>
      </SettingsSection>

      {/* Security */}
      <SettingsSection
        icon={<Lock size={20} />}
        iconStyle="border-[#465B45] bg-[#293328] text-[#B5C4AA]"
        title="Security"
        description="Keep your account access secure"
        eyebrow="ACCOUNT SECURITY"
      >
        <button
          type="button"
          onClick={handlePasswordClick}
          className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-[#403B35] bg-[#201F1C] p-4 text-left transition duration-200 hover:border-[#65513C] hover:bg-[#292621] sm:p-5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#403B35] bg-[#292621] text-[#C5A984]">
              <Lock size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#E9E2D8]">
                Change password
              </p>
              <p className="mt-1 text-xs leading-5 text-[#928A80]">
                Password changes aren't connected yet.
              </p>
            </div>
          </div>

          <ChevronRight
            size={19}
            className="shrink-0 text-[#81796F] transition group-hover:translate-x-0.5 group-hover:text-[#D8BD98]"
          />
        </button>
      </SettingsSection>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 pb-2 text-xs text-[#81796F]">
        <Sparkles size={13} className="text-[#C5A984]" />
        Placement Copilot · Your career, one step at a time.
      </div>
    </div>
  );
}

function SettingsSection({
  icon,
  iconStyle,
  title,
  description,
  eyebrow,
  children,
}) {
  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-5 shadow-[0_14px_38px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-7">
      <div className="flex items-center gap-3 border-b border-[#35312B] pb-5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${iconStyle}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-semibold tracking-[0.17em] text-[#928A80]">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-semibold text-[#F0ECE5]">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-[#928A80]">
            {description}
          </p>
        </div>
      </div>

      <div className="pt-5">{children}</div>
    </section>
  );
}

function NotificationRow({ title, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#E9E2D8]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#928A80]">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={title}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
          enabled
            ? "border-[#667A61] bg-[#52684C]"
            : "border-[#51483D] bg-[#302D28]"
        }`}
      >
        <span
          className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F0ECE5] shadow-sm transition-transform ${
            enabled ? "translate-x-[21px]" : "translate-x-0.5"
          }`}
        >
          {enabled && <Check size={11} className="text-[#293328]" />}
        </span>
      </button>
    </div>
  );
}

function ThemeSwatch({ title, description, className, borderClass }) {
  return (
    <div className="rounded-2xl border border-[#35312B] bg-[#191817] p-3">
      <div
        className={`h-12 rounded-xl border ${borderClass} ${className}`}
      />
      <p className="mt-3 text-sm font-medium text-[#E9E2D8]">{title}</p>
      <p className="mt-1 text-xs text-[#81796F]">{description}</p>
    </div>
  );
}

export default Settings;
