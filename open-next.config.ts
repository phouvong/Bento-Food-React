const config = {
  default: {
    build: {
      buildCommand: "npx @opennextjs/cloudflare@latest build",
    }, // 1. ปิด block ของ 'build' ให้ถูกต้องตรงนี้ก่อนขึ้น 'bundler'
    
    bundler: {
      external: ['@emotion/styled', '@emotion/react', '@emotion/cache'],
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
  }, // 2. ปิด block ของ 'default' ตรงนี้

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
