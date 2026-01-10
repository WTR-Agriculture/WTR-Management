import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Environment variables accessible on client
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  },

  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
