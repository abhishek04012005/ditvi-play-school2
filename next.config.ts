/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force a server-enabled build (standalone) so app routes (/api/*) run.
  // CI environments may set GITHUB_PAGES=true which can trigger an export build.
  // Setting `output: 'standalone'` explicitly prevents Next from using `output: 'export'`.
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
