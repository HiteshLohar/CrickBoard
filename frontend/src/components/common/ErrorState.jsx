import { AlertTriangle, RefreshCw } from 'lucide-react'

function ErrorState({
    title = 'Something went wrong',
    description = 'We could not load this data. Please try again.',
    onRetry,
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-500/20 dark:bg-red-500/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {title}
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                {description}
            </p>

            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 active:scale-[0.98]"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </button>
            )}
        </div>
    )
}

export default ErrorState