import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { cookies, headers } from "next/headers";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { ScrollAnimate } from "@/components/providers/ScrollAnimate";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Selasar Bahasa",
    template: "%s | Selasar Bahasa",
  },
  description: "Platform belajar bahasa online — materi terstruktur, quiz interaktif, dan progres belajar yang bisa kamu pantau sendiri.",
  keywords: [
    "Selasar Bahasa",
    "kursus bahasa Indonesia",
    "BIPA",
    "Bahasa Indonesia untuk penutur asing",
    "les bahasa online",
    "kursus bahasa Inggris",
    "kursus bahasa Jerman",
    "belajar bahasa online",
  ],
  metadataBase: new URL("https://selasarbahasa.com"),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Selasar Bahasa",
    title: "Selasar Bahasa — Belajar Bahasa Lebih Mudah",
    description: "Platform belajar bahasa online — materi terstruktur, quiz interaktif, dan progres belajar yang bisa kamu pantau sendiri.",
    url: "https://selasarbahasa.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Selasar Bahasa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Selasar Bahasa — Belajar Bahasa Lebih Mudah",
    description: "Platform belajar bahasa online — materi terstruktur, quiz interaktif, dan progres belajar yang bisa kamu pantau sendiri.",
    images: ["/og-image.png"],
  },
};

async function getLocaleAndDictionary() {
  const cookieStore = await cookies();
  let locale = cookieStore.get("locale")?.value;

  const SUPPORTED_LOCALES = ["id", "en", "de"];
  const DEFAULT_LOCALE = "id";

  if (!locale) {
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language");
    if (acceptLanguage) {
      const locales = acceptLanguage
        .split(",")
        .map((lang) => lang.split(";")[0].trim().toLowerCase().slice(0, 2));
      locale = locales.find((lang) => SUPPORTED_LOCALES.includes(lang)) || DEFAULT_LOCALE;
    } else {
      locale = DEFAULT_LOCALE;
    }
  }

  let dictionary = {};
  try {
    // Dynamic import for server environment
    dictionary = (await import(`../messages/${locale}.json`)).default;
  } catch (e) {
    try {
      dictionary = (await import("../messages/id.json")).default;
    } catch (err) {}
  }

  return { locale, dictionary };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, dictionary } = await getLocaleAndDictionary();

  return (
    <html lang={locale}>
      <body className={`${poppins.className} ${poppins.variable} antialiased`}>
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <Providers>{children}</Providers>
          <ScrollAnimate />
          <Analytics />

          {/* SEO — JSON-LD schema.org: Organization + WebSite  (Google GSC / Knowledge Graph) */}
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: JSON.stringify([
                {
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  name: "Selasar Bahasa",
                  url: "https://selasarbahasa.com",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://selasarbahasa.com/og-image.png",
                  },
                  email: "admin@selasarbahasa.com",
                  telephone: "+62 812-8782-7389",
                  sameAs: [],
                  contactPoint: [
                    {
                      "@type": "ContactPoint",
                      telephone: "+62 812-8782-7389",
                      contactType: "customer service",
                      email: "admin@selasarbahasa.com",
                      areaServed: "ID",
                      availableLanguage: ["Indonesian", "English", "German"],
                    },
                  ],
                },
                {
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  name: "Selasar Bahasa",
                  url: "https://selasarbahasa.com",
                  inLanguage: ["id-ID", "en-US", "de-DE"],
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://selasarbahasa.com/artikel?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
              ]),
            }}
          />
        </LocaleProvider>
      </body>
    </html>
  );
}
