const config = {
  default: {
    build: {
      buildCommand: "npx @opennextjs/cloudflare@latest build",
    },
    
    bundler: {
      // 1. ย้ายค่ายยักษ์ใหญ่ที่มีปัญหาเข้ามาอยู่ในกลุ่มมัดรวม (Inline)
      inline: [
        '@emotion/styled', 
        '@emotion/react', 
        '@emotion/cache',
        '@emotion/server'
      ],
    }, 
    
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
