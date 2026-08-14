import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  output: "standalone",
  experimental: {
    // Next 16.3 defaults this to true, which type-checks by spawning the `tsc` binary of
    // the `typescript` package. Ours is the @typescript/typescript6 API shim (see the note
    // in package.yaml), whose binary is named `tsc6`, so Next decides `typescript` is not
    // installed and fails the build. Type-checking through the TypeScript compiler API,
    // which the shim does provide, works fine. Revisit once typescript-eslint supports
    // TS 7 and `typescript` can point at the real thing again.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
