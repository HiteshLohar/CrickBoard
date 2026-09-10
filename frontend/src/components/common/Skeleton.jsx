function Skeleton({
    className = '',
}) {
    return (
        <div
            aria-hidden="true"
            className={[
                'animate-pulse rounded-lg',
                'bg-slate-200 dark:bg-slate-800',
                className,
            ].join(' ')}
        />
    )
}

export default Skeleton