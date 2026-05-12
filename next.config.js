/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Allow class decorators to work correctly in the server runtime.
    serverComponentsExternalPackages: ["typeorm", "mongodb", "bcryptjs", "jsonwebtoken"],
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
