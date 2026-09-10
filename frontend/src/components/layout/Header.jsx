import {
    Menu,
    Moon,
    Sun,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

function Header({ onMenuClick }) {
    const { user } = useAuth()
    const { theme, toggleTheme } = useTheme()

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90">
            <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
                
                {/* Left */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        aria-label="Open navigation"
                        className="rounded-xl p-2.5 text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                            Welcome back
                        </p>

                        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                            {user?.name || 'Cricket Admin'}
                        </h2>
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2 sm:gap-3">
                    
                    {/* Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={
                            theme === 'dark'
                                ? 'Switch to light mode'
                                : 'Switch to dark mode'
                        }
                        className="group rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition-all duration-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-brand-800 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
                        ) : (
                            <Moon className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
                        )}
                    </button>

                    {/* User */}
                    <div className="hidden items-center gap-3 border-l border-slate-200 pl-3 sm:flex dark:border-slate-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-600/20 dark:bg-brand-500">
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                        </div>

                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {user?.name || 'User'}
                            </p>

                            <p className="text-xs text-slate-400">
                                Cricket Admin
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header