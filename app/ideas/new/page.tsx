/**
 * Create new idea page.
 */

'use client'

import Link from 'next/link'
import IdeaForm from '@/components/forms/idea-form'

export default function NewIdeaPage() {
  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-text">InnovatEPAM Portal</h1>
            <Link href="/" className="text-primary hover:text-primary-dark">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-background rounded-lg shadow-lg p-8 border border-border">
          <h1 className="text-2xl font-bold text-text mb-6">Submit New Idea</h1>
          <IdeaForm />
        </div>
      </main>
    </div>
  )
}
