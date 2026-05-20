import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import { dark } from "@clerk/ui/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI — Collaborative System Design Workspace",
  description:
    "Design, collaborate, and generate technical specs from system architecture diagrams in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      ui={ui}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/editor"
      afterSignOutUrl="/sign-in"
      appearance={{
        theme: dark,
        variables: {
          colorBackground: "#111114",
          colorForeground: "#f0f0f4",
          colorPrimary: "#00c8d4",
          colorBorder: "#2a2a30",
          colorDanger: "#ff4d4f",
          colorSuccess: "#34d399",
          colorWarning: "#fbbf24",
          colorInput: "#1e1e23",
          colorInputForeground: "#f0f0f4",
        },
        elements: {
          userButtonPopoverCard:
            "bg-elevated border border-border-default shadow-lg",
          userButtonPopoverActionButton:
            "text-copy-primary data-[hover]:bg-subtle data-[hover]:text-copy-primary",
          userButtonPopoverFooter: "border-t border-border-default",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}
