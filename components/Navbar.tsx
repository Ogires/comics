'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
  }

  function toggleLanguage() {
    const next = i18n.language.startsWith('es') ? 'en-US' : 'es-ES'
    i18n.changeLanguage(next)
  }

  const navLinks = (
    <>
      {user && (
        <Button variant="ghost" asChild onClick={() => setOpen(false)}>
          <Link href="/favorites">{t('nav.favorites')}</Link>
        </Button>
      )}
      {user ? (
        <Button variant="ghost" onClick={handleSignOut}>
          {t('nav.signOut')}
        </Button>
      ) : (
        <Button variant="ghost" asChild onClick={() => setOpen(false)}>
          <Link href="/login">{t('nav.signIn')}</Link>
        </Button>
      )}
      <Button variant="ghost" onClick={toggleLanguage} className="font-mono">
        {t('nav.langToggle')}
      </Button>
    </>
  )

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between"
    >
      <Link href="/" className="font-bold text-red-500 text-lg hover:text-red-400">
        Comics Explorer
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks}
      </div>

      {/* Mobile nav */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label={t('nav.menu')}>
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64">
          <SheetHeader>
            <SheetTitle>Comics Explorer</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 p-4">
            {navLinks}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
