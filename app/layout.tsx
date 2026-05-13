import type { Metadata } from 'next'
import { getSession } from '@/lib/auth/guards'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'InnovatEPAM Portal',
  description: 'Submit and manage innovation ideas',
  viewport: 'width=device-width, initial-scale=1, minimum-scale=1',
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
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}
