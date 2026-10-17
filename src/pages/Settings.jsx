
import { useState } from "react";
import {
  User,
  Lock,
  ChevronRight,
  Sparkles,
  Check,
  ShieldCheck,
  Settings2,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function Settings() {
  const { user } = useAuth();

  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const displayName = user?.name || "Student";
  const email = user?.email || "No email available";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const togglePasswordVisibility = (field) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const openPasswordForm = () => {
    setPasswordFormOpen((previous) => !previous);
    setPasswordError("");
    setPasswordMessage("");
  };

  const closePasswordForm = () => {
    setPasswordFormOpen(false);
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setPasswordMessage("");
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswords((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordMessage("");
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all three password fields.");
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 72) {
      setPasswordError(
        "Your new password must be between 6 and 72 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "Your new password must be different from your current password."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setPasswordError("Your session is missing. Please sign in again.");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to change your password. Please try again."
        );
      }

      setPasswordMessage(
        data.message || "Your password has been changed successfully."
      );

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
    } catch (error) {
      setPasswordError(
        error.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-[1200px] space-y-7 pb-8 text-[#F0ECE5]">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-36 top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(173,135,91,0.055),transparent_70%)] blur-3xl" />
        <div className="absolute -left-40 top-[55%] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(135,145,119,0.035),transparent_70%)] blur-3xl" />
      </div>

      {/* Page header */}
      <section className="relative overflow-hidden rounded-[28px] border border-[#403B35] bg-gradient-to-br from-[#26231F] via-[#1E1C19] to-[#191817] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-[#C5A984]/10" />
        <div className="pointer-events-none absolute -right-4 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.07),transparent_70%)]" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#65513C]/70 bg-[#332A21]/70 px-3.5 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#D4B994]">
            <Settings2 size={14} />
            YOUR PREFERENCES
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.045em] text-[#F1ECE4] sm:text-5xl">
            Make it yours.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#AAA197] sm:text-base">
            Manage your profile and account security in one place.
          </p>
        </div>
      </section>

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

            <p className="mt-1 break-all text-sm text-[#AAA093]">
              {email}
            </p>

            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#465B45] bg-[#293328] px-3 py-1 text-xs font-medium text-[#B5C4AA]">
              <ShieldCheck size={13} />
              Signed-in account
            </span>
          </div>
        </div>
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
          onClick={openPasswordForm}
          aria-expanded={passwordFormOpen}
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
                Update your password securely.
              </p>
            </div>
          </div>

          <ChevronRight
            size={19}
            className={`shrink-0 text-[#81796F] transition group-hover:text-[#D8BD98] ${
              passwordFormOpen ? "rotate-90" : ""
            }`}
          />
        </button>

        {passwordFormOpen && (
          <form
            onSubmit={handlePasswordSubmit}
            className="mt-4 space-y-5 rounded-2xl border border-[#403B35] bg-[#191817] p-4 sm:p-6"
          >
            <div>
              <h3 className="text-base font-semibold text-[#F0ECE5]">
                Update your password
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#928A80]">
                Enter your current password, then choose a new one.
              </p>
            </div>

            {passwordError && (
              <div
                role="alert"
                className="rounded-xl border border-red-900/70 bg-red-950/40 px-4 py-3 text-sm leading-6 text-red-300"
              >
                {passwordError}
              </div>
            )}

            {passwordMessage && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-xl border border-[#465B45] bg-[#293328] px-4 py-3 text-sm leading-6 text-[#B5C4AA]"
              >
                <Check size={17} className="mt-0.5 shrink-0" />
                <span>{passwordMessage}</span>
              </div>
            )}

            <PasswordField
              label="Current password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              visible={showPasswords.current}
              onToggle={() => togglePasswordVisibility("current")}
              autoComplete="current-password"
            />

            <PasswordField
              label="New password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              visible={showPasswords.new}
              onToggle={() => togglePasswordVisibility("new")}
              autoComplete="new-password"
              minLength={6}
              maxLength={72}
            />

            <PasswordField
              label="Confirm new password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              visible={showPasswords.confirm}
              onToggle={() => togglePasswordVisibility("confirm")}
              autoComplete="new-password"
              minLength={6}
              maxLength={72}
            />

            <p className="text-xs leading-5 text-[#81796F]">
              Use 6–72 characters. Your current password is required to
              confirm this change.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closePasswordForm}
                disabled={passwordLoading}
                className="rounded-xl border border-[#403B35] px-5 py-3 text-sm font-medium text-[#C2B9AD] transition hover:bg-[#292621] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#B69A73] bg-[#D4B994] px-5 py-3 text-sm font-semibold text-[#241E17] transition hover:bg-[#E0CBAA] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#241E17]/30 border-t-[#241E17]" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Update password
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </SettingsSection>

    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
  minLength,
  maxLength,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[#D8D0C5]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          required
          className="w-full rounded-xl border border-[#403B35] bg-[#201F1C] px-4 py-3 pr-12 text-sm text-[#F0ECE5] outline-none transition placeholder:text-[#81796F] focus:border-[#9D805B] focus:ring-2 focus:ring-[#9D805B]/20"
          placeholder={`Enter ${label.toLowerCase()}`}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-[#928A80] transition hover:text-[#D4B994]"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
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

export default Settings;
