/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['firebase-admin', '@google-cloud/storage', '@google-cloud/firestore'],
  /* config options here */
};

export default nextConfig;
