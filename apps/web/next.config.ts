import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: { ignoreDuringBuilds: true },   // <- ignore lint errors on CI
};

export default nextConfig;
