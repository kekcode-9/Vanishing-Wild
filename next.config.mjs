/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];

      config.externals.push({
        duckdb: "commonjs duckdb",
        "@mapbox/node-pre-gyp": "commonjs @mapbox/node-pre-gyp",
        "aws-sdk": "commonjs aws-sdk",
        "mock-aws-s3": "commonjs mock-aws-s3",
        nock: "commonjs nock",
      });
    }

    return config;
  },
};

export default nextConfig;
