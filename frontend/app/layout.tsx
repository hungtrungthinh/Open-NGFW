import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Open-NGFW Dashboard',
  description: 'Next-Generation Firewall Management Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-row min-h-screen">
          <Sidebar />
          <main className="flex-1 pl-72">{children}</main>
        </div>
      </body>
    </html>
  )
} 