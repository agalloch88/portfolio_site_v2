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
  "Lead Backend Engineer & Cloud Architect at Philadelphia Inquirer. I design scalable cloud infrastructure, data platforms, and AI/ML pipelines. Python, AWS/GCP/Azure, Kubernetes expert.";

export const metadata: Metadata = {
  title: "Ryan Kirsch — Lead Backend Engineer & Cloud Architect",
  description,
  openGraph: {
    title: "Ryan Kirsch — Lead Backend Engineer & Cloud Architect",
    description,
    type: "website",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ryan Kirsch — Lead Backend Engineer & Cloud Architect",
    description,
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
        {children}
      </body>
    </html>
  );
}
