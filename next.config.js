/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Allow class decorators to work correctly in the server runtime.
    serverComponentsExternalPackages: ["typeorm", "mongodb", "bcryptjs", "jsonwebtoken"],
    // TypeORM looks up entity metadata by class name (e.g. "User"). The
    // production server minifier renames classes (User -> "e"), which breaks
    // string-based repository lookups and triggers EntityMetadataNotFoundError.
    // Disabling server minification preserves class/function names at runtime.
    serverMinification: false,
  },
  webpack: (config) => {
    config.externals = [
      ...(config.externals || []),
      { "mongodb-client-encryption": "commonjs mongodb-client-encryption" },
      { kerberos: "commonjs kerberos" },
      { "@mongodb-js/zstd": "commonjs @mongodb-js/zstd" },
      { snappy: "commonjs snappy" },
      { "gcp-metadata": "commonjs gcp-metadata" },
      { aws4: "commonjs aws4" },
    ];
    return config;
  },
};

module.exports = nextConfig;
