/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ship three.js / R3F as ESM through Next's compiler.
  transpilePackages: ["three"],
};

module.exports = nextConfig;
