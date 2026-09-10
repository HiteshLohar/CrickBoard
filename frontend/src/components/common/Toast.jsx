import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'

function Toast({
    message,
    type = 'success',
    onClose,
}) {
    if (!message) return null

    const styles = {
        success: {
            container:
                'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10',
            icon: 'text-emerald-600 dark:text-emerald-400',
            Icon: CheckCircle2,
        },
        error: {
            container:
                'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10',
            icon: 'text-red-600 dark:text-red-400',
            Icon: TriangleAlert,
        },
        info: {
            container:
                'border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10',
            icon: 'text-blue-600 dark:text-blue-400',
            Icon: Info,
        },
    }

    const current = styles[type] || styles.success
    const Icon = current.Icon

    return (
        <div
            role="status"
            className={[
                'fixed right-4 top-4 z-[100]',
                'flex max-w-sm items-start gap-3 rounded-2xl border',
                'px-4 py-3 shadow-lg backdrop-blur-md',
                'animate-in fade-in slide-in-from-top-2',
                current.container,
            ].join(' ')}
        >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${current.icon}`} />

            <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                {message}
            </p>

            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close notification"
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-black/5 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}

export default Toast