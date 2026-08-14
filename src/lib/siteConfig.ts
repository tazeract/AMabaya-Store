// Re-exports site.config.js as a TypeScript-safe ES module alias.
// All components should import from "@/lib/siteConfig" instead of the root site.config.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const siteConfig = require("../../site.config.js") as import("@/types").SiteConfig & {
  emailjs: {
    serviceId: string;
    orderTemplateId: string;
    contactTemplateId: string;
    publicKey: string;
  };
};
export default siteConfig;

