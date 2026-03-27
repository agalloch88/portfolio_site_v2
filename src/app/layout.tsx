import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const description =
  "Data Engineer and Lead Backend Engineer at the Philadelphia Inquirer. Building production pipelines in Python, dbt, Dagster, and PySpark. Focused on data platform architecture, medallion modeling, and AI/ML infrastructure on AWS, GCP, and Azure.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ryankirsch.dev"),
  title: "Ryan Kirsch | Data Engineer | dbt, Python, and Pipeline Architecture",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ryan Kirsch | Data Engineer | dbt, Python, and Pipeline Architecture",
    description,
    type: "website",
    siteName: "Ryan Kirsch",
    images: [
      {
        url: "/ryan-headshot.jpg",
        width: 1280,
        height: 853,
        alt: "Ryan Kirsch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ryan Kirsch | Data Engineer | dbt, Python, and Pipeline Architecture",
    description,
    images: ["/ryan-headshot.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable}`}>
      <body
        className="min-h-screen bg-navy text-lightGray font-sans antialiased"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Ryan Kirsch",
                jobTitle: "Lead Backend Engineer & Data Engineer",
                worksFor: {
                  "@type": "Organization",
                  name: "Philadelphia Inquirer",
                },
                url: "https://ryankirsch.dev",
                sameAs: [
                  "https://github.com/agalloch88",
                  "https://www.linkedin.com/in/ryan-s-kirsch",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Ryan Kirsch",
                url: "https://ryankirsch.dev",
              },
            ]),
          }}
        />
        {children}
      </body>
    </html>
  );
}
