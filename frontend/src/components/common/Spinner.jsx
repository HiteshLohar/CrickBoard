function Spinner({
    size = 'md',
    className = '',
}) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-10 w-10',
    }

    return (
        <span
            role="status"
            aria-label="Loading"
            className={[
                'inline-block animate-spin rounded-full',
                'border-2 border-slate-300 border-t-brand-500',
                'dark:border-slate-700 dark:border-t-brand-400',
                sizes[size],
                className,
            ].join(' ')}
        />
    )
}

export default Spinner