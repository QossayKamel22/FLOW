import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import { updatePassword, sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { auth } from "../../lib/firebase";
import { getPreferences, savePreferences, type UserPreferences } from "../../services/userService";
import { useProfilePhoto, fileToSquareDataUrl } from "../../hooks/useProfilePhoto";
import { ProfileAvatar } from "../../components/common/ProfileAvatar";
import { PhotoLightbox } from "../../components/common/PhotoLightbox";
import { Switch } from "../../components/common/Switch";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { SectionHeader } from "../../components/common/States";
import { useToast } from "../../context/ToastContext";
import { friendlyAuthError } from "../../lib/errors";
import { IconUsers, IconBriefcase, IconBell, IconSettings } from "../../components/common/Icons";
import type { ComponentType } from "react";

function CardHeading({ icon: Icon, color, children }: { icon: ComponentType<{ size?: number }>; color: string; children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color, background: `${color}1f` }}>
        <Icon size={14} />
      </span>
      <h3 style={{ fontWeight: 700, fontSize: 15 }}>{children}</h3>
    </div>
  );
}

function hoverLift(e: MouseEvent<HTMLDivElement>, enter: boolean) {
  e.currentTarget.style.transform = enter ? "translateY(-2px)" : "none";
  e.currentTarget.style.boxShadow = enter ? "0 1px 2px rgba(0,0,0,0.4), 0 16px 32px -8px rgba(99,102,241,0.2)" : "var(--shadow-card)";
}

export function SettingsPage() {
  const { user, logOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { show } = useToast();
  const { photoURL, hasCustomPhoto, setPhoto, removePhoto } = useProfilePhoto();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    getPreferences(user.uid).then(setPrefs).catch(() => undefined);
  }, [user]);

  async function save(partial: Partial<UserPreferences>) {
    if (!user) return;
    const next = { ...(prefs ?? {}), ...partial } as UserPreferences;
    setPrefs(next);
    await savePreferences(user.uid, partial);
    show("Saved.", "success");
  }

  async function handlePhotoSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      show("Please choose an image file.", "error");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await fileToSquareDataUrl(file);
      await setPhoto(dataUrl);
      show("Profile photo updated.", "success");
    } catch (err) {
      show((err as Error).message || "Couldn't update your photo.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    try {
      await removePhoto();
      show("Profile photo removed.", "success");
    } catch {
      show("Couldn't remove your photo.", "error");
    }
  }

  async function handleResetPassword() {
    if (!auth || !user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      show("Password reset email sent.", "success");
    } catch (err) {
      show(friendlyAuthError(err), "error");
    }
  }

  async function handleSetPassword() {
    if (!auth?.currentUser || newPassword.length < 6) {
      show("Password must be at least 6 characters.", "error");
      return;
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      setNewPassword("");
      show("Password updated.", "success");
    } catch (err) {
      show(friendlyAuthError(err), "error");
    }
  }

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Manage your profile, workspace, and preferences." />

      <div className="stagger-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <Card style={{ transition: "transform var(--transition-base), box-shadow var(--transition-base)" }} onMouseEnter={(e) => hoverLift(e, true)} onMouseLeave={(e) => hoverLift(e, false)}>
          <CardHeading icon={IconUsers} color="#6366f1">Profile</CardHeading>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <ProfileAvatar photoURL={photoURL} name={user?.displayName || user?.email || "U"} size={64} onClick={() => setLightboxOpen(true)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <Button size="sm" variant="secondary" loading={uploading} onClick={() => fileInputRef.current?.click()}>
                  {hasCustomPhoto ? "Change photo" : "Upload photo"}
                </Button>
                {hasCustomPhoto && (
                  <Button size="sm" variant="ghost" onClick={handleRemovePhoto}>Remove</Button>
                )}
              </div>
              <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>
                {!hasCustomPhoto && user?.photoURL ? "Using your Google account photo." : "JPG or PNG, square works best."}
              </span>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: "none" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Name" value={user?.displayName ?? ""} disabled />
            <Input label="Email" value={user?.email ?? ""} disabled />
          </div>
        </Card>

        <Card style={{ transition: "transform var(--transition-base), box-shadow var(--transition-base)" }} onMouseEnter={(e) => hoverLift(e, true)} onMouseLeave={(e) => hoverLift(e, false)}>
          <CardHeading icon={IconBriefcase} color="#a855f7">Workspace</CardHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input
              label="Business name"
              value={prefs?.businessName ?? ""}
              onChange={(e) => setPrefs((p) => (p ? { ...p, businessName: e.target.value } : p))}
              onBlur={(e) => save({ businessName: e.target.value })}
            />
            <Input
              label="Industry"
              value={prefs?.industry ?? ""}
              onChange={(e) => setPrefs((p) => (p ? { ...p, industry: e.target.value } : p))}
              onBlur={(e) => save({ industry: e.target.value })}
            />
          </div>
        </Card>

        <Card style={{ transition: "transform var(--transition-base), box-shadow var(--transition-base)" }} onMouseEnter={(e) => hoverLift(e, true)} onMouseLeave={(e) => hoverLift(e, false)}>
          <CardHeading icon={IconBell} color="#f59e0b">Notifications</CardHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13.5, color: "var(--text-secondary)" }}>
            <Switch label="Email notifications for follow-ups" checked={prefs?.emailNotifications ?? true} onChange={(v) => save({ emailNotifications: v })} />
            <Switch label="Daily AI briefing" checked={prefs?.dailyBriefing ?? true} onChange={(v) => save({ dailyBriefing: v })} />
          </div>
        </Card>

        <Card style={{ transition: "transform var(--transition-base), box-shadow var(--transition-base)" }} onMouseEnter={(e) => hoverLift(e, true)} onMouseLeave={(e) => hoverLift(e, false)}>
          <CardHeading icon={IconSettings} color="#22d3ee">Appearance</CardHeading>
          <div
            style={{
              position: "relative",
              display: "flex",
              width: 200,
              padding: 3,
              borderRadius: 999,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 3,
                bottom: 3,
                left: theme === "light" ? 3 : "50%",
                width: "calc(50% - 3px)",
                borderRadius: 999,
                background: "var(--gradient-brand-diag)",
                boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
                transition: "left var(--transition-base)",
              }}
            />
            <button
              type="button"
              onClick={() => setTheme("light")}
              style={{
                position: "relative",
                flex: 1,
                padding: "7px 0",
                border: "none",
                background: "transparent",
                color: theme === "light" ? "#fff" : "var(--text-secondary)",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
                transition: "color var(--transition-base)",
              }}
            >
              ☀️ Light
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              style={{
                position: "relative",
                flex: 1,
                padding: "7px 0",
                border: "none",
                background: "transparent",
                color: theme === "dark" ? "#fff" : "var(--text-secondary)",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
                transition: "color var(--transition-base)",
              }}
            >
              🌙 Dark
            </button>
          </div>
        </Card>

        <Card style={{ transition: "transform var(--transition-base), box-shadow var(--transition-base)" }} onMouseEnter={(e) => hoverLift(e, true)} onMouseLeave={(e) => hoverLift(e, false)}>
          <CardHeading icon={IconSettings} color="#38bdf8">Security</CardHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Button variant="secondary" size="sm" onClick={handleResetPassword}>Send password reset email</Button>
            <div style={{ display: "flex", gap: 8 }}>
              <Input placeholder="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Button size="sm" onClick={handleSetPassword}>Update</Button>
            </div>
          </div>
        </Card>

        <Card
          style={{ transition: "transform var(--transition-base), box-shadow var(--transition-base)", borderColor: "rgba(239,68,68,0.25)" }}
          onMouseEnter={(e) => hoverLift(e, true)}
          onMouseLeave={(e) => hoverLift(e, false)}
        >
          <CardHeading icon={IconSettings} color="#ef4444">Account</CardHeading>
          <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", marginBottom: 12 }}>Sign out of FLOW on this device.</p>
          <Button variant="danger" onClick={() => void logOut()}>Log out</Button>
        </Card>
      </div>

      {lightboxOpen && (
        <PhotoLightbox
          photoURL={photoURL}
          name={user?.displayName || user?.email || "U"}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
