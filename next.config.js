/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required: three.js / R3F / drei are ESM-only packages
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

module.exports = nextConfig;

