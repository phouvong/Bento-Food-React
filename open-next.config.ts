const config = {
  default: {
    build: {
      external: ['@emotion/styled', '@emotion/react', '@emotion/cache'],
    runtime: "edge",
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  // เพิ่มบรรทัดนี้เข้ามาเพื่อแก้ปัญหาล็อกของระบบตรวจจับสเปกครับ 👇
  edgeExternals: ["node:crypto"], 
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;
