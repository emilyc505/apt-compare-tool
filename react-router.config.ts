// react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  basename: process.env.GITHUB_ACTIONS ? "/apt-compare-tool/" : "/",
} satisfies Config;