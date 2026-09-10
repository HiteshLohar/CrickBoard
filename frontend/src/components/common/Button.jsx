function Button({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    onClick,
}) {
    const variants = {
        primary:
            'bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600',
        secondary:
            'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700',
        outline:
            'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
        danger:
            'bg-red-600 text-white hover:bg-red-700',
        ghost:
            'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
    }

    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-5 py-3 text-base',
    }

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={[
                'inline-flex items-center justify-center gap-2',
                'rounded-xl font-medium',
                'transition-all duration-200',
                'active:scale-[0.98]',
                'focus:outline-none focus:ring-2 focus:ring-brand-500/40',
                'disabled:pointer-events-none disabled:opacity-50',
                variants[variant],
                sizes[size],
                className,
            ].join(' ')}
        >
            {children}
        </button>
    )
}

export default Button