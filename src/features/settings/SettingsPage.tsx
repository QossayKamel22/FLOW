import { useEffect, useState } from "react";
import { updatePassword, sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { auth } from "../../lib/firebase";
import { getPreferences, savePreferences, type UserPreferences } from "../../services/userService";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { SectionHeader } from "../../components/common/States";
import { useToast } from "../../context/ToastContext";
import { friendlyAuthError } from "../../lib/errors";

export function SettingsPage() {
  const { user, logOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { show } = useToast();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [newPassword, setNewPassword] = useState("");

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <Card>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Profile</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Name" value={user?.displayName ?? ""} disabled />
            <Input label="Email" value={user?.email ?? ""} disabled />
          </div>
        </Card>

        <Card>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Workspace</h3>
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

        <Card>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Notifications</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, color: "var(--text-secondary)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={prefs?.emailNotifications ?? true} onChange={(e) => save({ emailNotifications: e.target.checked })} />
              Email notifications for follow-ups
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={prefs?.dailyBriefing ?? true} onChange={(e) => save({ dailyBriefing: e.target.checked })} />
              Daily AI briefing
            </label>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Appearance</h3>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant={theme === "light" ? "primary" : "secondary"} size="sm" onClick={() => setTheme("light")}>Light</Button>
            <Button variant={theme === "dark" ? "primary" : "secondary"} size="sm" onClick={() => setTheme("dark")}>Dark</Button>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Security</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Button variant="secondary" size="sm" onClick={handleResetPassword}>Send password reset email</Button>
            <div style={{ display: "flex", gap: 8 }}>
              <Input placeholder="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Button size="sm" onClick={handleSetPassword}>Update</Button>
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Account</h3>
          <Button variant="danger" onClick={() => void logOut()}>Log out</Button>
        </Card>
      </div>
    </div>
  );
}
