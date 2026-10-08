/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required: three.js is an ESM-only package
  transpilePackages: ['three'],
};

module.exports = nextConfig;

