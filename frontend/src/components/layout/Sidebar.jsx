import {
    BarChart3,
    CalendarDays,
    Shield,
    Users,
    X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

function Sidebar({ isMobileOpen = false, onClose }) {
    const navItems = [
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: BarChart3,
        },
        {
            label: 'Matches',
            path: '/matches',
            icon: CalendarDays,
        },
        {
            label: 'Teams',
            path: '/teams',
            icon: Shield,
        },
        {
            label: 'Players',
            path: '/players',
            icon: Users,
        },
    ]

    return (
        <>
            {isMobileOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={[
                    'fixed inset-y-0 left-0 z-50 flex w-72 flex-col',
                    'border-r border-slate-200 bg-white',
                    'transition-transform duration-300',
                    'dark:border-slate-800 dark:bg-slate-950',
                    isMobileOpen
                        ? 'translate-x-0'
                        : '-translate-x-full lg:translate-x-0',
                ].join(' ')}
            >
                {/* Brand */}
                <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-lg shadow-brand-600/20 dark:bg-brand-500">
                            C
                        </div>

                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                CrickBoard
                            </h1>

                            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                Cricket Management
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close navigation"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav
                    className="flex-1 space-y-2 overflow-y-auto px-4 py-6"
                    aria-label="Main navigation"
                >
                    <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Main Menu
                    </p>

                    {navItems.map((item) => {
                        const Icon = item.icon

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    [
                                        'group flex items-center gap-3 rounded-xl px-3 py-3',
                                        'text-sm font-medium',
                                        'transition-all duration-200',
                                        isActive
                                            ? 'bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-500/10 dark:text-brand-400'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white',
                                    ].join(' ')
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon
                                            className={[
                                                'h-5 w-5 shrink-0 transition-transform duration-200',
                                                'group-hover:scale-105',
                                                isActive
                                                    ? 'text-brand-600 dark:text-brand-400'
                                                    : 'text-slate-400',
                                            ].join(' ')}
                                        />

                                        <span>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        )
                    })}
                </nav>

                {/* Bottom */}
                <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            CrickBoard
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Live cricket scoring
                        </p>
                    </div>
                </div>
            </aside>
        </>
    )
}

export default Sidebar