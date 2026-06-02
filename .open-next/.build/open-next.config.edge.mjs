// open-next.config.ts
var config = {
  default: {
    build: {
      // บังคับให้ใช้ Yarn ในการ Build เพื่อให้ resolutions ใน package.json ทำงานได้ 100%
      buildCommand: "yarn run opennextjs-cloudflare build"
    },
    // หลังจากที่เราล็อกเวอร์ชันผ่าน resolutions เป็น 11.13.x ใน package.json แล้ว
    // ตัวไฟล์ .edge-light.cjs.mjs จะมีอยู่จริงบนระบบ ดังนั้นไม่จำเป็นต้องทำ alias หรือ external อีกต่อไป
    bundler: {
      alias: {},
      external: []
    },
    override: {
      wrapper: "cloudflare-node",
      // ถูกต้องแล้วครับ รองรับ Node compatibility ได้ดีที่สุดสำหรับ MUI
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy"
    }
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
      queue: "dummy"
    }
  }
};
var open_next_config_default = config;
export {
  open_next_config_default as default
};
