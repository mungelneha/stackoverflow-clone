import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "hi", "pt", "zh", "fr"],
  defaultLocale: "en",
});