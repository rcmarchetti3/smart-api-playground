import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: { ignoreDuringBuilds: true }, // <- ignore lint errors on CI
     experimental: {
    externalDir: true, // allow ../../packages/shared/*
  }   
};

export default nextConfig;
