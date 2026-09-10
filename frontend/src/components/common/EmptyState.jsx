import { Inbox } from 'lucide-react'

function EmptyState({
    title = 'Nothing here yet',
    description = 'There is no data to display.',
    action = null,
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Inbox className="h-6 w-6 text-slate-500 dark:text-slate-400" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {title}
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                {description}
            </p>

            {action && <div className="mt-5">{action}</div>}
        </div>
    )
}

export default EmptyState