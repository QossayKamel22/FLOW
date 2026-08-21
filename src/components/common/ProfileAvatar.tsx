import type { KeyboardEvent, MouseEvent } from "react";

export function ProfileAvatar({
  photoURL,
  name,
  size = 32,
  onClick,
}: {
  photoURL: string | null;
  name: string;
  size?: number;
  onClick?: () => void;
}) {
  const clickableProps = onClick
    ? {
        onClick,
        role: "button" as const,
        tabIndex: 0,
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        },
        style: { cursor: "pointer", transition: "transform var(--transition-fast)" },
        onMouseEnter: (e: MouseEvent<HTMLElement>) => (e.currentTarget.style.transform = "scale(1.05)"),
        onMouseLeave: (e: MouseEvent<HTMLElement>) => (e.currentTarget.style.transform = "scale(1)"),
      }
    : {};

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name || "Profile"}
        {...clickableProps}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          boxShadow: "0 0 0 2px rgba(212,175,106,0.4)",
          ...clickableProps.style,
        }}
      />
    );
  }
  return (
    <div
      {...clickableProps}
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
        ...clickableProps.style,
      }}
    >
      {(name || "U").charAt(0).toUpperCase()}
    </div>
  );
}
