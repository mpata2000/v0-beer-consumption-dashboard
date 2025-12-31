import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Birras - Wet Bandits",
  description: "Campeonato de Birras by Wet Bandits",
  icons: {
    icon: "/logo2.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense
            fallback={
              <div className="min-h-screen grid place-items-center">
                <Skeleton className="h-10 w-32" />
              </div>
            }
          >
            {children}
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
