'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function toggleLanguage() {
    const next = i18n.language.startsWith('es') ? 'en-US' : 'es-ES'
    i18n.changeLanguage(next)
  }

  return (
    <nav className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
      <Link href="/" className="font-bold text-red-500 text-lg hover:text-red-400">
        Comics Explorer
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user && (
          <Link href="/favorites" className="hover:text-red-400">
            {t('nav.favorites')}
          </Link>
        )}
        {user ? (
          <button onClick={handleSignOut} className="hover:text-red-400">
            {t('nav.signOut')}
          </button>
        ) : (
          <Link href="/login" className="hover:text-red-400">
            {t('nav.signIn')}
          </Link>
        )}
        <button onClick={toggleLanguage} className="hover:text-red-400 font-mono">
          {t('nav.langToggle')}
        </button>
      </div>
    </nav>
  )
}
