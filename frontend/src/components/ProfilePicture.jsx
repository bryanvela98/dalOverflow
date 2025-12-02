import React from "react";

const ProfilePicture = ({ user, size = 40, style = {} }) => {
  const src =
    user?.profile_picture_url ||
    "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(user?.display_name || user?.username || "User");
  return (
    <img
      src={src}
      alt="Profile"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        ...style,
      }}
    />
  );
};

export default ProfilePicture;
