import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/lib/AuthContext";
import Head from "next/head";
import { NextIntlClientProvider } from "next-intl";
import { useRouter } from "next/router";

import en from "../../messages/en.json";
import es from "../../messages/es.json";
import hi from "../../messages/hi.json";
import pt from "../../messages/pt.json";
import zh from "../../messages/zh.json";
import fr from "../../messages/fr.json";

const messages = {
  en,
  es,
  hi,
  pt,
  zh,
  fr,
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const locale = (router.locale || "en") as keyof typeof messages;

  return (
    <>
      <Head>
        <title>Code-Quest</title>
      </Head>

      <NextIntlClientProvider
        locale={locale}
        messages={messages[locale]}
      >
        <AuthProvider>
          <ToastContainer />
          <Component {...pageProps} />
        </AuthProvider>
      </NextIntlClientProvider>
    </>
  );
}