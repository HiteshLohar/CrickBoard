import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { login } from '../../services/api/auth.api'
import { useAuth } from '../../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { checkAuthentication } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await login(formData)

      if (!response.success) {
        setError(response.message || 'Login failed')
        return
      }

      await checkAuthentication()

      navigate('/dashboard')
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to login. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 px-3 py-3 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-white sm:px-5 sm:py-4 lg:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-5xl items-center justify-center sm:min-h-[calc(100vh-2rem)]">
        <div className="grid w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 lg:grid-cols-2">
          {/* Left Panel */}
          <section className="relative hidden overflow-hidden bg-brand-700 p-7 text-white lg:flex lg:flex-col lg:justify-between xl:p-9">
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-brand-400/20 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <Trophy size={23} />
              </div>

              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-brand-100">
                Welcome Back
              </p>

              <h1 className="max-w-sm text-3xl font-black leading-tight xl:text-4xl">
                Your cricket dashboard is waiting.
              </h1>

              <p className="mt-4 max-w-sm text-sm leading-6 text-brand-50/85">
                Sign in to manage your teams, players and matches with
                CrickBoard's real-time scoring experience.
              </p>
            </div>

            <div className="relative mt-7 space-y-3">
              {[
                'Manage players and teams',
                'Create and configure matches',
                'Score matches in real time',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <CheckCircle2 size={15} />
                  </div>

                  <span className="text-xs font-semibold text-brand-50">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Login Panel */}
          <section className="flex w-full items-center justify-center p-5 sm:p-7 lg:p-8 xl:p-10">
            <div className="w-full max-w-sm">
              {/* Header */}
              <div className="mb-6 text-center lg:text-left">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 lg:mx-0">
                  <Sparkles size={21} />
                </div>

                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
                  CrickBoard
                </p>

                <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                  Welcome back
                </h2>

                <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Sign in to continue to your cricket dashboard.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold leading-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      placeholder="you@example.com"
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-500"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Security */}
                <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400"
                  />

                  <p className="text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                    Your session is protected with secure authentication.
                    Keep your login credentials private.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-xs font-black text-white shadow-md shadow-brand-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Register */}
              <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-black text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  Create an account
                </Link>
              </p>

              <p className="mt-4 text-center text-[10px] font-medium text-slate-400 dark:text-slate-500">
                CrickBoard · Real-time cricket management
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default Login