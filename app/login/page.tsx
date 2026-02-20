'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Check, X } from 'lucide-react'
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

  const passwordRules = [
    { key: 'auth.ruleMinLength', met: password.length >= 8 },
    { key: 'auth.ruleUppercase', met: /[A-Z]/.test(password) },
    { key: 'auth.ruleLowercase', met: /[a-z]/.test(password) },
    { key: 'auth.ruleDigit', met: /[0-9]/.test(password) },
    { key: 'auth.ruleSpecialChar', met: /[^A-Za-z0-9]/.test(password) },
  ]
  const allRulesMet = passwordRules.every((r) => r.met)

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
    <div className="max-w-sm mx-auto mt-16 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold mx-auto mb-4 shadow-lg shadow-red-500/20">
          CE
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {isRegister ? t('auth.register') : t('auth.signIn')}
        </h1>
      </div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-muted-foreground">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/[0.04] border-border text-foreground focus-visible:ring-red-500/30 focus-visible:border-red-500/30 h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-muted-foreground">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/[0.04] border-border text-foreground focus-visible:ring-red-500/30 focus-visible:border-red-500/30 h-11"
          />
          {isRegister && (
            <div className="mt-2 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {t('auth.passwordRequirements')}
              </p>
              <ul className="space-y-0.5">
                {passwordRules.map((rule) => (
                  <li
                    key={rule.key}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      rule.met ? 'text-green-400' : 'text-muted-foreground/50'
                    }`}
                  >
                    {rule.met ? (
                      <Check className="size-3" />
                    ) : (
                      <X className="size-3" />
                    )}
                    {t(rule.key)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Button
          type="submit"
          disabled={loading || (isRegister && !allRulesMet)}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-200 h-11"
        >
          {loading
            ? (isRegister ? t('auth.registering') : t('auth.signingIn'))
            : (isRegister ? t('auth.register') : t('auth.signIn'))}
        </Button>
      </form>
      <div className="text-center mt-6">
        <button
          onClick={() => setIsRegister((r) => !r)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isRegister ? t('auth.switchToSignIn') : t('auth.switchToRegister')}
        </button>
      </div>
    </div>
  )
}
