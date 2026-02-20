'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/'
  const supabase = createClient()

  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isRegister) {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
      }
      router.push(redirectTo)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('Invalid') || message.includes('credentials')) {
        setError(t('auth.errorInvalid'))
      } else {
        setError(t('auth.errorGeneric'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">
        {isRegister ? t('auth.register') : t('auth.signIn')}
      </h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-slate-800 border-slate-600 text-slate-100 focus-visible:ring-red-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-slate-800 border-slate-600 text-slate-100 focus-visible:ring-red-500"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          {loading
            ? (isRegister ? t('auth.registering') : t('auth.signingIn'))
            : (isRegister ? t('auth.register') : t('auth.signIn'))}
        </Button>
      </form>
      <Button
        variant="ghost"
        onClick={() => setIsRegister((r) => !r)}
        className="mt-4 text-sm text-slate-300 hover:text-slate-100"
      >
        {isRegister ? t('auth.switchToSignIn') : t('auth.switchToRegister')}
      </Button>
    </div>
  )
}
