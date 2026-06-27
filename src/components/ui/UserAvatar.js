// Usage:
//   <UserAvatar user={user} size="md" />
//   <UserAvatar name="Saad Khan" profilePicture="https://..." size="lg" />

export default function UserAvatar({
  user,
  name,
  profilePicture,
  size = "md",
  className = "",
}) {
  const displayName = name || user?.name || "?";
  const picture = profilePicture || user?.profilePicture || null;

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-24 h-24 text-3xl",
  };

  const sizeClass = sizes[size] || sizes.md;

  const initial = displayName.charAt(0).toUpperCase();

  if (picture) {
    return (
      <img
        src={picture}
        alt={`${displayName}'s profile picture`}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white shadow-sm ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-[#027675] to-[#015f5d] flex items-center justify-center text-white font-bold ring-2 ring-white shadow-sm ${className}`}
    >
      {initial}
    </div>
  );
}
