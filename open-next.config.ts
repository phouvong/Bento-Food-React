import cache from "@opennextjs/cloudflare/kv-cache";

const config = {
  default: {
    runtime: "edge",
  },
  middleware: {
    runtime: "edge",
  },
  build: {
    minify: true,
  },
};

export default config;
