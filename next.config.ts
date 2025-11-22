/** @type {import('next').NextConfig} */
const nextConfig = {
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
  output: "export",

  // Exclude API routes from static export
  exportPathMap: async (defaultPathMap, { dev, dir, outDir, distDir }) => {
    const paths = { ...defaultPathMap };

    // Remove all API routes
    Object.keys(paths).forEach((path) => {
      if (path.startsWith("/api/")) {
        delete paths[path];
      }
    });

    return paths;
  },
};

export default nextConfig;