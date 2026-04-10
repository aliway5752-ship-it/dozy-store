import { Footer, Navbar } from '@/components'
import './globals.css'
import type { Metadata } from 'next'
import { Urbanist } from 'next/font/google'
import ModalProvider from '@/providers/modal-provider'
import ToastProvider from '@/providers/toast-provider'
import { ClerkProvider } from '@clerk/nextjs'

const urban = Urbanist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dozy Store',
  description: 'Your premium fashion destination',
}

export const revalidate = 0;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
        <html lang="en">
          <body className={urban.className} suppressHydrationWarning={true}>
              <ModalProvider />
              <ToastProvider />
              <Navbar />
              <main>
                {children}
              </main>
              <Footer />
          </body>
        </html>
    </ClerkProvider>
  )
}