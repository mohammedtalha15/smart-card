import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: 'Artha — Student Discount Network',
  description: 'Unlock real-world value through verified student discounts at local vendors. Artha connects students with exclusive deals.',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport = {
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            richColors
          />
        </AuthProvider>
      </body>
    </html>
  )
}
