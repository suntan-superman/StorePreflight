/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@storepreflight/shared",
    "@storepreflight/scanner",
    "@storepreflight/rules",
    "@storepreflight/assets",
    "@storepreflight/report",
  ],
  serverExternalPackages: ["sharp", "ts-morph", "archiver"],
};

export default nextConfig;
