import type { Metadata } from "next";
import { DM_Sans, Almarai } from "next/font/google";
import "../globals.css";
import { Locale } from "../../i18n-config";
import { Navbar } from "./components/Navbar";
import { getDictionary } from "@/dictionaries";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
});

export const metadata: Metadata = {
  title: "IMS Dashboard",
  description: "International Messaging Services Dashboard",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isRTL = lang === "ar";
  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang} dir={isRTL ? "rtl" : "ltr"}>
      <body
        className={`${dmSans.variable} ${almarai.variable} antialiased ${
          isRTL ? "font-almarai" : "font-dm-sans"
        }`}
      >
        <Navbar dict={dict} params={{ lang: lang as Locale }} />
        {children}
      </body>
    </html>
  );
}
