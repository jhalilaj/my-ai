import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["via.placeholder.com", "avatars.githubusercontent.com"], // Add allowed domains here
  },
};
module.exports = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Allow Google profile images
      'avatars.githubusercontent.com', // Allow GitHub profile images
    ],
  },
};


export default nextConfig;
