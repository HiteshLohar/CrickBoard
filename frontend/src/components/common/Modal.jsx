import { X } from 'lucide-react'

function Modal({
    open,
    onClose,
    title,
    children,
    size = 'md',
}) {
    if (!open) return null

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }

    return (
        <div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <button
                type="button"
                aria-label="Close modal"
                onClick={onClose}
                className="absolute inset-0 cursor-default bg-slate-950/60 backdrop-blur-sm"
            />

            <div
                className={[
                    'relative w-full overflow-hidden rounded-2xl border',
                    'border-slate-200 bg-white shadow-2xl',
                    'dark:border-slate-800 dark:bg-slate-900',
                    sizes[size],
                ].join(' ')}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <h2
                        id="modal-title"
                        className="text-lg font-semibold text-slate-900 dark:text-white"
                    >
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-5">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal