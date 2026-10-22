import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,

  i18n: {
    locales: ["en", "es", "hi", "pt", "zh", "fr"],
    defaultLocale: "en",
  },
};

export default withNextIntl(nextConfig);