import { Circle } from 'lucide-react'

function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = '',
}) {
    const variants = {
        default:
            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',

        success:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',

        warning:
            'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',

        danger:
            'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',

        live:
            'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',

        info:
            'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',

        purple:
            'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',

        brand:
            'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400',
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    }

    return (
        <span
            className={[
                'inline-flex items-center gap-1.5',
                'rounded-full font-medium',
                'whitespace-nowrap',
                variants[variant],
                sizes[size],
                className,
            ].join(' ')}
        >
            {children}
        </span>
    )
}

export default Badge