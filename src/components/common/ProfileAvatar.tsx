export function ProfileAvatar({ photoURL, name, size = 32 }: { photoURL: string | null; name: string; size?: number }) {
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name || "Profile"}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          boxShadow: "0 0 0 2px rgba(212,175,106,0.4)",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--accent), #06b6d4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {(name || "U").charAt(0).toUpperCase()}
    </div>
  );
}
