const remotePatterns = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const host = new URL(supabaseUrl).hostname;
    remotePatterns.push({
      protocol: "https",
      hostname: host,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    /* ignore invalid URL */
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
