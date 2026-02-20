'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Menu, Globe, LogOut, LogIn, BookOpen, Heart, Search } from 'lucide-react'
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
  const pathname = usePathname()
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

  function isActive(path: string) {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 nav-gradient-border"
    >
      <div className="bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow duration-300">
              CE
            </div>
            <span className="font-semibold text-foreground text-sm tracking-tight hidden sm:inline">
              Comics Explorer
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/issues"
              className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                isActive('/issues')
                  ? 'text-foreground bg-white/10 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {t('nav.issues')}
            </Link>
            {user && (
              <>
                <Link
                  href="/collections"
                  className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                    isActive('/collections')
                      ? 'text-foreground bg-white/10 font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {t('collections.title')}
                </Link>
                <Link
                  href="/favorites"
                  className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                    isActive('/favorites')
                      ? 'text-foreground bg-white/10 font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {t('nav.favorites')}
                </Link>
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md transition-all duration-200"
            >
              {t('nav.langToggle')}
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            {user ? (
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md transition-all duration-200"
              >
                {t('nav.signOut')}
              </button>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium text-foreground bg-white/10 hover:bg-white/15 rounded-md transition-all duration-200"
              >
                {t('nav.signIn')}
              </Link>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" aria-label={t('nav.menu')}>
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background border-border">
              <SheetHeader>
                <SheetTitle className="text-left flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-[9px] font-bold">
                    CE
                  </div>
                  Comics Explorer
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 p-4 mt-4">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Search className="size-4" />
                  {t('home.title')}
                </Link>
                <Link
                  href="/issues"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <BookOpen className="size-4" />
                  {t('nav.issues')}
                </Link>
                {user && (
                  <>
                    <Link
                      href="/collections"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <BookOpen className="size-4" />
                      {t('collections.title')}
                    </Link>
                    <Link
                      href="/favorites"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Heart className="size-4" />
                      {t('nav.favorites')}
                    </Link>
                  </>
                )}
                <div className="h-px bg-border my-2" />
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  <Globe className="size-4" />
                  {t('nav.langToggle')}
                </button>
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    <LogOut className="size-4" />
                    {t('nav.signOut')}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LogIn className="size-4" />
                    {t('nav.signIn')}
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
