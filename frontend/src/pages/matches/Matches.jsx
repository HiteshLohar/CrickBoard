import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowRight,
    CalendarDays,
    CircleDot,
    Clock3,
    FileText,
    Plus,
    Shield,
    Trophy,
    Users,
} from 'lucide-react'

import { getMatches } from '../../services/api/matches.api'

import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'

function Matches() {
    const navigate = useNavigate()

    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadMatches = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await getMatches()

            if (!response.success) {
                throw new Error(
                    response.message ||
                    'Failed to fetch matches.',
                )
            }

            setMatches(response.data || [])
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to load matches.',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadMatches()
    }, [])

    const liveMatches = matches.filter(
        (match) => match.status === 'LIVE',
    ).length

    const completedMatches = matches.filter(
        (match) => match.status === 'COMPLETED',
    ).length

    const draftMatches = matches.filter(
        (match) => match.status === 'DRAFT',
    ).length

    if (loading) {
        return (
            <section className="space-y-8">
                <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-5 w-80 max-w-full" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map(
                        (_, index) => (
                            <Card key={index}>
                                <div className="space-y-4">
                                    <Skeleton className="h-10 w-10 rounded-xl" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </Card>
                        ),
                    )}
                </div>

                <Card>
                    <div className="space-y-5">
                        <Skeleton className="h-7 w-40" />

                        {Array.from({ length: 3 }).map(
                            (_, index) => (
                                <Skeleton
                                    key={index}
                                    className="h-40 w-full rounded-2xl"
                                />
                            ),
                        )}
                    </div>
                </Card>
            </section>
        )
    }

    if (error) {
        return (
            <section className="space-y-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        CrickBoard
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        Matches
                    </h1>
                </div>

                <ErrorState
                    title="Unable to load matches"
                    description={error}
                    onRetry={loadMatches}
                />
            </section>
        )
    }

    return (
        <section className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                            <CalendarDays className="h-5 w-5" />
                        </span>

                        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                            Match Center
                        </p>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        Matches
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                        Create, manage and follow your cricket matches.
                    </p>
                </div>

                <Button
                    onClick={() =>
                        navigate('/matches/create')
                    }
                    className="w-full sm:w-auto"
                >
                    <span className="flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Match
                    </span>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MatchStat
                    icon={CalendarDays}
                    label="Total Matches"
                    value={matches.length}
                />

                <MatchStat
                    icon={CircleDot}
                    label="Live Now"
                    value={liveMatches}
                    live={liveMatches > 0}
                />

                <MatchStat
                    icon={Trophy}
                    label="Completed"
                    value={completedMatches}
                />

                <MatchStat
                    icon={Clock3}
                    label="Drafts"
                    value={draftMatches}
                />
            </div>

            {/* Match List */}
            <Card padding="p-0" className="overflow-hidden">
                <div className="flex flex-col gap-2 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            All Matches
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Your complete match history and live games.
                        </p>
                    </div>

                    <span className="w-fit rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {matches.length}{' '}
                        {matches.length === 1
                            ? 'Match'
                            : 'Matches'}
                    </span>
                </div>

                {matches.length === 0 ? (
                    <div className="p-6 sm:p-10">
                        <EmptyState
                            icon={CalendarDays}
                            title="No matches yet"
                            description="Create your first match to start scoring."
                            actionLabel="Create Match"
                            onAction={() =>
                                navigate('/matches/create')
                            }
                        />
                    </div>
                ) : (
                    <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
                        {matches.map((match) => (
                            <MatchCard
                                key={match._id}
                                match={match}
                                onNavigate={navigate}
                            />
                        ))}
                    </div>
                )}
            </Card>
        </section>
    )
}

function MatchStat({
    icon: Icon,
    label,
    value,
    live = false,
}) {
    return (
        <Card className="relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-500/5 blur-2xl" />

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {label}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {value}
                    </p>
                </div>

                <div
                    className={[
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        live
                            ? 'bg-red-50 text-red-500 dark:bg-red-500/10'
                            : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
                    ].join(' ')}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            {live && (
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-red-500">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    Live match in progress
                </div>
            )}
        </Card>
    )
}

function MatchCard({ match, onNavigate }) {
    const statusConfig = {
        DRAFT: {
            variant: 'warning',
            label: 'Draft',
            icon: Clock3,
            action: 'Setup Match',
            path: `/matches/${match._id}/setup`,
        },

        LIVE: {
            variant: 'live',
            label: 'Live',
            icon: CircleDot,
            action: 'Live Match',
            path: `/matches/${match._id}/live`,
        },

        COMPLETED: {
            variant: 'success',
            label: 'Completed',
            icon: Trophy,
            action: 'Scorecard',
            path: `/matches/${match._id}/scorecard`,
        },
    }

    function getResultLabel(match) {
        if (!match.result) return null

        if (match.winner === match.teamA?._id) {
            return `${match.teamA.name} won`
        }

        if (match.winner === match.teamB?._id) {
            return `${match.teamB.name} won`
        }

        if (match.result === 'DRAW') {
            return 'Match Drawn'
        }

        if (match.result === 'TIE') {
            return 'Match Tied'
        }

        if (match.result === 'NO_RESULT') {
            return 'No Result'
        }

        return 'Match completed'
    }

    const config =
        statusConfig[match.status] ||
        statusConfig.DRAFT

    const StatusIcon = config.icon

    return (
        <article
            className={[
                'group relative overflow-hidden rounded-2xl border',
                'border-slate-200 bg-white',
                'shadow-sm transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-xl',
                'dark:border-slate-800 dark:bg-slate-900',
                match.status === 'LIVE'
                    ? 'ring-1 ring-red-500/20'
                    : '',
            ].join(' ')}
        >
            {/* Top accent */}
            <div
                className={[
                    'h-1 w-full',
                    match.status === 'LIVE'
                        ? 'bg-red-500'
                        : match.status === 'COMPLETED'
                            ? 'bg-brand-500'
                            : 'bg-amber-400',
                ].join(' ')}
            />

            <div className="p-5 sm:p-6">
                {/* Match heading */}
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                {match.matchCode || 'MATCH'}
                            </span>

                            {match.status === 'LIVE' && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                                    Live
                                </span>
                            )}
                        </div>

                        <h3 className="mt-3 truncate text-lg font-bold text-slate-900 dark:text-white">
                            {match.title || 'Untitled Match'}
                        </h3>
                    </div>

                    <Badge variant={config.variant}>
                        <span className="flex items-center gap-1.5">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                        </span>
                    </Badge>
                </div>

                {/* Teams */}
                <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <TeamBlock
                        name={match.teamA?.name || 'Team A'}
                        shortName={
                            match.teamA?.shortName || '-'
                        }
                    />

                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-950">
                        VS
                    </div>

                    <TeamBlock
                        name={match.teamB?.name || 'Team B'}
                        shortName={
                            match.teamB?.shortName || '-'
                        }
                        align="right"
                    />
                </div>

                {/* Match info */}
                <div className="mt-6 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-100 bg-slate-50/70 py-3 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950/50">
                    <InfoItem
                        icon={Users}
                        label="Players"
                        value={
                            match.playersPerTeam ?? '-'
                        }
                    />

                    <InfoItem
                        icon={CircleDot}
                        label="Overs"
                        value={match.totalOvers ?? '-'}
                    />

                    <InfoItem
                        icon={Shield}
                        label="Toss"
                        value={
                            match.toss?.decision || '—'
                        }
                    />
                </div>

                {/* Result */}
                {match.result && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm dark:border-brand-900/50 dark:bg-brand-500/10">
                        <Trophy className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />

                        <span className="text-xs font-medium text-brand-700 dark:text-brand-400">
                            Result
                        </span>

                        <span className="truncate font-semibold text-slate-700 dark:text-slate-200">
                            {getResultLabel(match)}
                        </span>
                    </div>
                )}

                {/* Action */}
                <button
                    type="button"
                    onClick={() =>
                        onNavigate(config.path)
                    }
                    className={[
                        'mt-5 flex w-full items-center justify-center gap-2 rounded-xl',
                        'border border-slate-200 bg-white px-4 py-3',
                        'text-sm font-bold text-slate-700',
                        'transition-all duration-200',
                        'hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700',
                        'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
                        'dark:hover:border-brand-800 dark:hover:bg-brand-500/10 dark:hover:text-brand-400',
                    ].join(' ')}
                >
                    {config.action}

                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
            </div>
        </article>
    )
}

function TeamBlock({
    name,
    shortName,
    align = 'left',
}) {
    return (
        <div
            className={[
                'min-w-0',
                align === 'right'
                    ? 'text-right'
                    : 'text-left',
            ].join(' ')}
        >
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 sm:mx-0">
                {shortName
                    .slice(0, 3)
                    .toUpperCase()}
            </div>

            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {name}
            </p>

            <p className="mt-0.5 text-xs font-medium text-slate-400">
                {shortName}
            </p>
        </div>
    )
}

function InfoItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="flex min-w-0 flex-col items-center gap-1 px-2 text-center">
            <div className="flex items-center gap-1 text-slate-400">
                <Icon className="h-3.5 w-3.5" />

                <span className="text-[10px] font-semibold uppercase tracking-wide">
                    {label}
                </span>
            </div>

            <span className="max-w-full truncate text-xs font-bold text-slate-700 dark:text-slate-300">
                {value}
            </span>
        </div>
    )
}

export default Matches  