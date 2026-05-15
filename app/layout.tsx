import type { Metadata, Viewport } from 'next'
import { getSession } from '@/lib/auth/guards'
import { ToastProvider } from '@/components/ui/toast-provider'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'InnovatEPAM Portal',
  description: 'Submit and manage innovation ideas',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
