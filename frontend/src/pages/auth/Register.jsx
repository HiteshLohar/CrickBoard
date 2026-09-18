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
  UserPlus,
  UserRound,
} from 'lucide-react'
import { register } from '../../services/api/auth.api'

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    setSuccess('')
    setLoading(true)

    try {
      const response = await register(formData)

      if (!response.success) {
        setError(response.message || 'Registration failed')
        return
      }

      setSuccess(response.message || 'User registered successfully')

      setTimeout(() => {
        navigate('/login')
      }, 1000)
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Unable to register. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="h-dvh w-full overflow-hidden bg-slate-50 px-3 py-3 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-white sm:px-4 sm:py-4">
      <div className="mx-auto flex h-full w-full max-w-4xl items-center justify-center">
        <div className="grid max-h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 lg:grid-cols-2">
          {/* Left Panel */}
          <section className="relative hidden overflow-hidden bg-brand-700 p-6 text-white lg:flex lg:flex-col lg:justify-between xl:p-7">
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-brand-400/20 blur-3xl" />

            <div className="relative">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <UserPlus size={21} />
              </div>

              <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-brand-100">
                Join CrickBoard
              </p>

              <h1 className="max-w-sm text-2xl font-black leading-tight xl:text-3xl">
                Start managing your cricket matches.
              </h1>

              <p className="mt-3 max-w-sm text-xs leading-5 text-brand-50/85">
                Create your account and bring your teams, players and
                real-time cricket scoring together in one place.
              </p>
            </div>

            <div className="relative mt-6 space-y-2.5">
              {[
                'Manage players and teams',
                'Create and configure matches',
                'Score matches in real time',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <CheckCircle2 size={14} />
                  </div>

                  <span className="text-xs font-semibold text-brand-50">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Register Panel */}
          <section className="flex w-full items-center justify-center overflow-hidden p-4 sm:p-5 lg:p-6">
            <div className="w-full max-w-sm">
              {/* Header */}
              <div className="mb-4 text-center lg:text-left">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 lg:mx-0">
                  <Sparkles size={19} />
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
                  Get Started
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
                  Create your account
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Join CrickBoard and start managing your cricket matches.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold leading-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                >
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div
                  role="status"
                  className="mb-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold leading-5 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      minLength={2}
                      maxLength={100}
                      autoComplete="name"
                      placeholder="Enter your full name"
                      required
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-500"
                    />
                  </div>
                </div>

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
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-500"
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
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      required
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  </div>

                  {/* Password Strength */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={[
                          'h-full rounded-full transition-all duration-300',
                          formData.password.length === 0
                            ? 'w-0'
                            : formData.password.length < 8
                              ? 'w-1/3 bg-amber-500'
                              : formData.password.length < 12
                                ? 'w-2/3 bg-brand-500'
                                : 'w-full bg-emerald-500',
                        ].join(' ')}
                      />
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      {formData.password.length === 0
                        ? 'Required'
                        : formData.password.length < 8
                          ? 'Too short'
                          : formData.password.length < 12
                            ? 'Good'
                            : 'Strong'}
                    </span>
                  </div>
                </div>

                {/* Security */}
                <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                  <ShieldCheck
                    size={15}
                    className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400"
                  />

                  <p className="text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                    Your account is protected with secure authentication.
                    Keep your password private.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-xs font-black text-white shadow-md shadow-brand-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Login */}
              <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-black text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  Sign in
                </Link>
              </p>

              <p className="mt-3 text-center text-[10px] font-medium text-slate-400 dark:text-slate-500">
                CrickBoard · Real-time cricket management
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default Register