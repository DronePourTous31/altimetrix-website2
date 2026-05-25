/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  serverExternalPackages: ["@aws-sdk/client-s3"],
};

export default nextConfig;