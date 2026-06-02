const config = {
  default: {
    build: {
      buildCommand: "npx @opennextjs/cloudflare@latest build",
    },
    
    // เปลี่ยนจาก inline มาเป็นการทำมาร์กหรือตัดปัญหาโครงสร้างไฟล์
    bundler: {
      // แนะนำชี้เป้าแก้บั๊กของ emotion 11.14 โดยบังคับให้ esbuild เรียกไฟล์หลักแทนไฟล์ edge ที่หายไป
      alias: {
        '@emotion/styled': '@emotion/styled/dist/emotion-styled.cjs.js',
        '@emotion/react': '@emotion/react/dist/emotion-react.cjs.js',
      },
      // หรือหากใช้ alias แล้วยังมีปัญหา ให้เปลี่ยนบรรทัด alias ด้านบนเป็นภายนอก (external) แทน ดังนี้:
      // external: ['@emotion/styled', '@emotion/react', '@emotion/cache', '@emotion/server']
    }, 
    
    // นำ runtime: "edge" ออก เพื่อให้ฝั่ง Node-compat ของ cloudflare-node ทำงานได้เต็มที่
    override: {
      wrapper: "cloudflare-node", // รองรับ Node compatibility ได้ดีกว่าสำหรับแอปที่มี MUI/Emotion
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
