import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DepartmentProvider } from "@/providers/department-provider"
import { QueryProvider } from "@/providers/query-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Department of Applied Science - Tribhuvan University",
  description:
    "Department of Applied Science at Tribhuvan University, Thapathali Campus. Excellence in teaching, research, and innovation.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        <QueryProvider>
          <DepartmentProvider>
            <Navigation />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </DepartmentProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
