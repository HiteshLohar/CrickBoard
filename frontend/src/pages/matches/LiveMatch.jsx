import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft,
    Ban,
    CircleDot,
    Clock3,
    Flame,
    Gauge,
    Loader2,
    MessageSquare,
    Minus,
    Plus,
    RefreshCw,
    ShieldAlert,
    Sparkles,
    Trophy,
    UserPlus,
    UserRound,
    Users,
    Zap,
} from 'lucide-react'

import { getTeams } from '../../services/api/teams.api'
import { getMatchById } from '../../services/api/matches.api'

import {
    getCurrentInnings,
    getBallEvents,
    getMatchScorecard,
    recordBall,
    setOpeningPlayers,
    setNewBatter,
    setNewBowler,
} from '../../services/api/scoring.api'

const wicketTypes = [
    'BOWLED',
    'CAUGHT',
    'LBW',
    'RUN_OUT',
    'STUMPED',
    'HIT_WICKET',
    'RETIRED_HURT',
]

const runOptions = [0, 1, 2, 3, 4, 6]

function formatWicketType(type) {
    return type.replaceAll('_', ' ')
}

function TeamLogo({ team, size = 'md' }) {
    const sizeClasses = {
        sm: 'h-9 w-9 text-xs',
        md: 'h-12 w-12 text-sm',
        lg: 'h-16 w-16 text-lg',
    }

    return (
        <div
            className={[
                'flex shrink-0 items-center justify-center overflow-hidden rounded-2xl',
                'border border-slate-200 bg-white shadow-sm',
                'dark:border-slate-700 dark:bg-slate-800',
                sizeClasses[size],
            ].join(' ')}
        >
            {team?.logo ? (
                <img
                    src={team.logo}
                    alt={team.name || 'Team'}
                    className="h-full w-full object-cover"
                />
            ) : (
                <span className="font-black text-brand-600 dark:text-brand-400">
                    {team?.shortName?.slice(0, 3) || 'CB'}
                </span>
            )}
        </div>
    )
}

function SectionTitle({
    icon: Icon,
    title,
    description,
    action,
}) {
    return (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                    <Icon size={19} />
                </div>

                <div>
                    <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white sm:text-lg">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {action}
        </div>
    )
}

function PlayerCard({
    label,
    player,
    accent = 'brand',
    badge,
}) {
    const accentClasses = {
        brand: 'border-brand-200 bg-brand-50/70 dark:border-brand-900/60 dark:bg-brand-950/30',
        purple: 'border-purple-200 bg-purple-50/70 dark:border-purple-900/60 dark:bg-purple-950/30',
        orange: 'border-orange-200 bg-orange-50/70 dark:border-orange-900/60 dark:bg-orange-950/30',
    }

    const iconClasses = {
        brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/70 dark:text-brand-300',
        purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/70 dark:text-purple-300',
        orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/70 dark:text-orange-300',
    }

    return (
        <div
            className={[
                'group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300',
                'hover:-translate-y-0.5 hover:shadow-lg',
                accentClasses[accent],
            ].join(' ')}
        >
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/40 blur-2xl dark:bg-white/5" />

            <div className="relative flex items-center gap-3">
                <div
                    className={[
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                        iconClasses[accent],
                    ].join(' ')}
                >
                    <UserRound size={19} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        {label}
                    </p>

                    <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                        {player?.name || '—'}
                    </p>

                    {player?.shortName && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {player.shortName}
                        </p>
                    )}
                </div>

                {badge && (
                    <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-black text-brand-700 shadow-sm dark:bg-slate-900/70 dark:text-brand-300">
                        {badge}
                    </span>
                )}
            </div>
        </div>
    )
}

function SelectField({
    label,
    value,
    onChange,
    children,
    disabled,
    required = false,
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {label}
            </span>

            <select
                value={value || ''}
                onChange={onChange}
                disabled={Boolean(disabled)}
                required={required}
                className={[
                    'w-full cursor-pointer appearance-none rounded-xl border px-3 py-3',
                    'text-sm font-semibold outline-none transition-all',
                    'border-slate-200 bg-white text-slate-900',
                    'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                    'dark:border-slate-700 dark:bg-slate-950 dark:text-white',
                    'dark:focus:border-brand-500',
                ].join(' ')}
            >
                {children}
            </select>
        </label>
    )
}

function StatCard({ icon: Icon, label, value, highlight = false }) {
    return (
        <div
            className={[
                'rounded-2xl border p-3 sm:p-4',
                highlight
                    ? 'border-brand-200 bg-brand-50 dark:border-brand-900/60 dark:bg-brand-950/30'
                    : 'border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80',
            ].join(' ')}
        >
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Icon size={14} />

                <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">
                    {label}
                </span>
            </div>

            <p className="mt-1 text-sm font-black text-slate-900 dark:text-white sm:text-base">
                {value}
            </p>
        </div>
    )
}

function LiveMatch() {
    const { matchId } = useParams()
    const navigate = useNavigate()

    const [match, setMatch] = useState(null)
    const [teams, setTeams] = useState([])
    const [innings, setInnings] = useState(null)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const [openingPlayersSet, setOpeningPlayersSet] = useState(false)

    const [openingForm, setOpeningForm] = useState({
        striker: '',
        nonStriker: '',
        bowler: '',
    })

    const [ballForm, setBallForm] = useState({
        runs: 0,
        commentary: '',
    })

    const [extraType, setExtraType] = useState('NONE')
    const [extraRuns, setExtraRuns] = useState(1)

    const [newBatter, setNewBatterPlayer] = useState('')
    const [newBowler, setNewBowlerPlayer] = useState('')

    const [wicketKind, setWicketKind] = useState('BOWLED')
    const [playerOut, setPlayerOut] = useState('')
    const [dismissedBatterIds, setDismissedBatterIds] = useState([])

    const [matchScorecard, setMatchScorecard] = useState(null)

    useEffect(() => {
        const loadLiveMatch = async () => {
            setLoading(true)
            setError('')

            try {
                const [
                    matchResponse,
                    teamsResponse,
                    inningsResponse,
                    ballsResponse,
                ] = await Promise.all([
                    getMatchById(matchId),
                    getTeams(),
                    getCurrentInnings(matchId),
                    getBallEvents(matchId, { limit: 100 }),
                ])

                if (!matchResponse.success) {
                    throw new Error(
                        matchResponse.message ||
                        'Failed to fetch match.',
                    )
                }

                if (!teamsResponse.success) {
                    throw new Error(
                        teamsResponse.message ||
                        'Failed to fetch teams.',
                    )
                }

                if (!inningsResponse.success) {
                    throw new Error(
                        inningsResponse.message ||
                        'Failed to fetch innings.',
                    )
                }

                const matchData = matchResponse.data
                const teamsData = teamsResponse.data || []
                const inningsData = inningsResponse.data
                const ballEvents =
                    ballsResponse?.data?.balls ||
                    ballsResponse?.data?.events ||
                    ballsResponse?.data?.items ||
                    ballsResponse?.data?.docs ||
                    (Array.isArray(ballsResponse?.data)
                        ? ballsResponse.data
                        : [])

                const dismissedIds = ballEvents
                    .filter((ball) => Boolean(ball?.wicket?.isWicket))
                    .map((ball) =>
                        String(
                            ball?.wicket?.playerOut?._id ||
                            ball?.wicket?.playerOut
                        ),
                    )
                    .filter((id) => id && id !== 'undefined' && id !== 'null')

                setDismissedBatterIds([...new Set(dismissedIds)])
                setMatch(matchData)
                setTeams(teamsData)
                setInnings(inningsData)

                if (inningsData?.status === 'COMPLETED') {
                    const scorecardResponse = await getMatchScorecard(matchId)

                    if (scorecardResponse?.success) {
                        setMatchScorecard(scorecardResponse.data)
                    }
                }

                setOpeningPlayersSet(
                    !inningsData?.requiresOpeningPlayers,
                )
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    error.message ||
                    'Unable to load live match.',
                )
            } finally {
                setLoading(false)
            }
        }

        loadLiveMatch()
    }, [matchId])

    const battingTeam = useMemo(() => {
        if (!innings?.battingTeam?._id) {
            return null
        }

        return teams.find(
            (team) =>
                team._id === innings.battingTeam._id,
        )
    }, [innings, teams])

    const bowlingTeam = useMemo(() => {
        if (!innings?.bowlingTeam?._id) {
            return null
        }

        return teams.find(
            (team) =>
                team._id === innings.bowlingTeam._id,
        )
    }, [innings, teams])

    const requiresOpeningPlayers =
        Boolean(innings?.requiresOpeningPlayers)

    const battingPlayers = battingTeam?.players || []
    const bowlingPlayers = bowlingTeam?.players || []

    const currentStrikerId =
        innings?.striker?._id || null

    const currentNonStrikerId =
        innings?.nonStriker?._id || null

    const currentBowlerId =
        innings?.currentBowler?._id || null

    const availableBatters = useMemo(
        () =>
            battingPlayers.filter((player) => {
                const playerId = String(player._id)

                return (
                    playerId !== String(currentStrikerId) &&
                    playerId !== String(currentNonStrikerId) &&
                    !dismissedBatterIds.includes(playerId)
                )
            }),
        [
            battingPlayers,
            currentStrikerId,
            currentNonStrikerId,
            dismissedBatterIds,
        ],
    )

    const legalBalls = Number(innings?.legalBalls || 0)

    const currentOver = Math.floor(legalBalls / 6)

    const currentBall = legalBalls % 6

    const oversDisplay = `${currentOver}.${currentBall}`

    const isLive = innings?.status === 'LIVE'

    const requiresNewBatter =
        isLive &&
        !requiresOpeningPlayers &&
        (Boolean(innings?.requiresNewBatter) ||
            (!currentStrikerId && legalBalls > 0))

    const requiresNewBowler =
        isLive &&
        !requiresOpeningPlayers &&
        (Boolean(innings?.requiresNewBowler) ||
            (!currentBowlerId && legalBalls > 0 && legalBalls % 6 === 0))

    const isCompleted =
        innings?.status === 'COMPLETED' ||
        match?.status === 'COMPLETED'

    const canScore =
        openingPlayersSet &&
        !requiresOpeningPlayers &&
        isLive &&
        Boolean(currentStrikerId) &&
        Boolean(currentNonStrikerId) &&
        Boolean(currentBowlerId)

    const handleOpeningChange = (event) => {
        const { name, value } = event.target

        setOpeningForm((previous) => ({
            ...previous,
            [name]: String(value),
        }))
    }

    const handleBallChange = (event) => {
        const { name, value } = event.target

        setBallForm((previous) => ({
            ...previous,
            [name]: value,
        }))
    }

    const handleSetOpeningPlayers = async (event) => {
        event.preventDefault()

        setError('')
        setSuccessMessage('')

        if (
            !openingForm.striker ||
            !openingForm.nonStriker ||
            !openingForm.bowler
        ) {
            setError(
                'Please select striker, non-striker and bowler.',
            )
            return
        }

        if (
            openingForm.striker ===
            openingForm.nonStriker
        ) {
            setError(
                'Striker and non-striker cannot be the same player.',
            )
            return
        }

        setSubmitting(true)

        try {
            const response = await setOpeningPlayers(
                matchId,
                {
                    striker: openingForm.striker,
                    nonStriker: openingForm.nonStriker,
                    bowler: openingForm.bowler,
                },
            )

            if (!response.success) {
                throw new Error(
                    response.message ||
                    'Failed to set opening players.',
                )
            }

            setInnings(response.data)
            setOpeningPlayersSet(true)

            setOpeningForm({
                striker: '',
                nonStriker: '',
                bowler: '',
            })

            setSuccessMessage(
                'Opening players set successfully.',
            )
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to set opening players.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleSetNewBatter = async (event) => {
        event.preventDefault()

        setError('')
        setSuccessMessage('')

        if (!newBatter) {
            setError('Please select a new batter.')
            return
        }

        setSubmitting(true)

        try {
            const response = await setNewBatter(
                matchId,
                newBatter,
            )

            if (!response.success) {
                throw new Error(
                    response.message ||
                    'Failed to set new batter.',
                )
            }

            setInnings(response.data)
            setNewBatterPlayer('')

            setSuccessMessage(
                'New batter selected successfully.',
            )
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to set new batter.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleSetNewBowler = async () => {
        if (!newBowler) {
            return
        }

        setError('')
        setSuccessMessage('')
        setSubmitting(true)

        try {
            const response = await setNewBowler(
                matchId,
                newBowler,
            )

            if (!response.success) {
                throw new Error(
                    response.message ||
                    'Failed to select new bowler.',
                )
            }

            setInnings(response.data)
            setNewBowlerPlayer('')

            setSuccessMessage(
                'New bowler selected successfully.',
            )
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to select new bowler.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleRecordBall = async (event) => {
        event.preventDefault()

        setError('')
        setSuccessMessage('')

        if (
            !innings?.striker ||
            !innings?.nonStriker ||
            !innings?.currentBowler
        ) {
            return
        }

        const isWicket = Boolean(playerOut)

        if (isWicket && !wicketKind) {
            setError('Please select wicket type.')
            return
        }

        setSubmitting(true)

        try {
            const response = await recordBall(
                matchId,
                {
                    overNumber:
                        Math.floor(
                            (Number(innings.legalBalls) || 0) / 6,
                        ) + 1,

                    ballNumber:
                        (Number(innings.legalBalls) || 0) % 6 + 1,

                    striker: innings.striker._id,

                    nonStriker:
                        innings.nonStriker._id,

                    bowler:
                        innings.currentBowler._id,

                    runs: {
                        batter:
                            isWicket ||
                                extraType === 'WIDE' ||
                                extraType === 'NO_BALL' ||
                                extraType === 'BYE' ||
                                extraType === 'LEG_BYE'
                                ? 0
                                : Number(ballForm.runs) || 0,

                        extras:
                            extraType === 'WIDE' ||
                                extraType === 'NO_BALL' ||
                                extraType === 'BYE' ||
                                extraType === 'LEG_BYE'
                                ? Number(extraRuns) || 1
                                : 0,

                        total:
                            isWicket
                                ? 0
                                : extraType === 'WIDE' ||
                                    extraType === 'NO_BALL' ||
                                    extraType === 'BYE' ||
                                    extraType === 'LEG_BYE'
                                    ? Number(extraRuns) || 1
                                    : Number(ballForm.runs) || 0,
                    },

                    extras: {
                        type: extraType,

                        runs:
                            extraType === 'WIDE' ||
                                extraType === 'NO_BALL' ||
                                extraType === 'BYE' ||
                                extraType === 'LEG_BYE'
                                ? Number(extraRuns) || 1
                                : 0,
                    },

                    wicket: isWicket
                        ? {
                            isWicket: true,
                            playerOut,
                            kind: wicketKind,
                        }
                        : {
                            isWicket: false,
                            kind: 'NONE',
                        },

                    isLegalDelivery:
                        extraType !== 'WIDE' &&
                        extraType !== 'NO_BALL',

                    commentary: isWicket
                        ? `${innings.striker.name} dismissed by ${wicketKind
                            .replaceAll('_', ' ')
                            .toLowerCase()}`
                        : ballForm.commentary,
                },
            )

            if (!response.success) {
                throw new Error(
                    response.message ||
                    'Failed to record ball.',
                )
            }

            const inningsResponse = await getCurrentInnings(matchId)

            if (!inningsResponse.success) {
                throw new Error(
                    inningsResponse.message ||
                    'Failed to refresh innings.',
                )
            }

            const updatedInnings = inningsResponse.data

            if (updatedInnings?.status === 'COMPLETED') {
                const scorecardResponse = await getMatchScorecard(matchId)

                if (scorecardResponse?.success) {
                    setMatchScorecard(scorecardResponse.data)
                }
            }

            setInnings(updatedInnings)
            setOpeningPlayersSet(
                !updatedInnings?.requiresOpeningPlayers,
            )

            if (isWicket && playerOut) {
                setDismissedBatterIds((previous) =>
                    previous.includes(String(playerOut))
                        ? previous
                        : [...previous, String(playerOut)],
                )
            }

            setInnings(updatedInnings)

            setOpeningPlayersSet(
                !updatedInnings?.requiresOpeningPlayers,
            )

            setBallForm({
                runs: 0,
                commentary: '',
            })

            setPlayerOut('')
            setWicketKind('BOWLED')

            setSuccessMessage(
                isWicket
                    ? 'Wicket recorded successfully.'
                    : 'Ball recorded successfully.',
            )
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to record ball.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[70vh] px-4 py-8">
                <div className="mx-auto max-w-6xl">
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex min-h-[360px] flex-col items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 animate-ping rounded-full bg-brand-500/20" />

                                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                                    <Loader2
                                        size={28}
                                        className="animate-spin"
                                    />
                                </div>
                            </div>

                            <h2 className="mt-6 text-lg font-black text-slate-900 dark:text-white">
                                Loading live match
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Preparing the scoring room...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error && !match) {
        return (
            <div className="min-h-[70vh] px-4 py-8">
                <div className="mx-auto max-w-xl">
                    <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                            <ShieldAlert size={25} />
                        </div>

                        <h2 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
                            Unable to load match
                        </h2>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate('/matches')}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                            <ArrowLeft size={16} />
                            Back to Matches
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <section className="min-h-full px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-5">
                {/* Header */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                                {isLive ? 'Live Match' : 'Match Centre'}
                            </span>

                            {isCompleted && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    Completed
                                </span>
                            )}
                        </div>

                        <h1 className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                            {match?.title || 'Live Match'}
                        </h1>

                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                            {match?.matchCode || '-'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/matches')}
                        disabled={submitting}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 sm:w-auto"
                    >
                        <ArrowLeft size={15} />
                        Back to Matches
                    </button>
                </header>

                {/* Notifications */}
                {(error || successMessage) && (
                    <div
                        className={[
                            'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold',
                            error
                                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300'
                                : 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900/60 dark:bg-brand-950/30 dark:text-brand-300',
                        ].join(' ')}
                        role={error ? 'alert' : 'status'}
                    >
                        {error ? (
                            <ShieldAlert
                                size={18}
                                className="mt-0.5 shrink-0"
                            />
                        ) : (
                            <Sparkles
                                size={18}
                                className="mt-0.5 shrink-0"
                            />
                        )}

                        <span>{error || successMessage}</span>
                    </div>
                )}

                {/* Score Hero */}
                {innings && (
                    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.10),transparent_35%)]" />

                        <div className="relative p-5 sm:p-7 lg:p-8">
                            <div className="flex flex-col gap-7">
                                <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
                                    <div className="flex items-center gap-3">
                                        <TeamLogo
                                            team={battingTeam}
                                            size="lg"
                                        />

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
                                                Batting
                                            </p>

                                            <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white sm:text-2xl">
                                                {innings.battingTeam?.name ||
                                                    'Batting Team'}
                                            </h2>

                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                                {innings.battingTeam?.shortName ||
                                                    ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isLive ? (
                                            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                                                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                                LIVE
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {innings.status || 'MATCH'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="text-5xl font-black tracking-tighter text-slate-950 dark:text-white sm:text-7xl">
                                        {innings.totalRuns || 0}
                                        <span className="mx-1 text-slate-300 dark:text-slate-700">
                                            /
                                        </span>
                                        {innings.totalWickets || 0}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                            Overs {oversDisplay}
                                        </span>

                                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                            {match?.totalOvers || 0} overs
                                        </span>

                                        <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-black text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                                            Innings {innings.inningsNumber || 1}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <StatCard
                                        icon={Gauge}
                                        label="Run Rate"
                                        value={
                                            legalBalls > 0
                                                ? (
                                                    (Number(
                                                        innings.totalRuns || 0,
                                                    ) /
                                                        (legalBalls / 6))
                                                ).toFixed(2)
                                                : '0.00'
                                        }
                                        highlight
                                    />

                                    <StatCard
                                        icon={Clock3}
                                        label="Ball"
                                        value={`${currentBall}/6`}
                                    />

                                    <StatCard
                                        icon={Trophy}
                                        label="Innings"
                                        value={
                                            innings.inningsNumber ||
                                            1
                                        }
                                    />

                                    <StatCard
                                        icon={Zap}
                                        label="Target"
                                        value={
                                            innings.target
                                                ? innings.target
                                                : '—'
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Completed state */}
                {isCompleted && (
                    <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-900/50 dark:bg-brand-950/20 sm:p-7">
                        <div className="flex flex-col items-center justify-center text-center">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                                <Trophy size={25} />
                            </div>

                            <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
                                Match Completed
                            </p>

                            {matchScorecard?.result?.winner ? (
                                <>
                                    <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                                        {matchScorecard.result.winner.name}
                                    </h2>

                                    <p className="mt-1 text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {matchScorecard.result.winner.shortName} won
                                    </p>

                                    {matchScorecard.result.margin && (
                                        <div className="mt-4 rounded-2xl border border-brand-200 bg-white px-5 py-3 shadow-sm dark:border-brand-800 dark:bg-slate-900">
                                            <p className="text-sm font-black text-brand-700 dark:text-brand-300">
                                                {matchScorecard.result.winner.name} won by{' '}
                                                {matchScorecard.result.margin}
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
                                    Match Completed
                                </h2>
                            )}

                            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                                Live scoring has ended for this match.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(`/matches/${matchId}/scorecard`)
                                }
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 hover:bg-brand-700"
                            >
                                <Trophy size={16} />
                                View Scorecard
                            </button>
                        </div>
                    </div>
                )}

                {/* Innings Break */}
                {/* Innings Break */}
                {requiresOpeningPlayers && (
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40 sm:p-6">
                            <SectionTitle
                                icon={RefreshCw}
                                title="Innings Break"
                                description="Set the opening players before scoring can begin."
                            />
                        </div>

                        <form
                            onSubmit={handleSetOpeningPlayers}
                            className="p-5 sm:p-6"
                        >
                            <div className="grid gap-4 md:grid-cols-3">

                                {/* Striker */}
                                <label className="block">
                                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Striker
                                    </span>

                                    <select
                                        name="striker"
                                        value={openingForm.striker}
                                        onChange={handleOpeningChange}
                                        disabled={submitting}
                                        required
                                        className="relative z-10 w-full cursor-pointer appearance-auto rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        <option value="">
                                            Select Striker
                                        </option>

                                        {battingPlayers.map((player) => (
                                            <option
                                                key={String(player._id)}
                                                value={String(player._id)}
                                            >
                                                {player.name}
                                                {player.shortName
                                                    ? ` (${player.shortName})`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {/* Non-Striker */}
                                <label className="block">
                                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Non-Striker
                                    </span>

                                    <select
                                        name="nonStriker"
                                        value={openingForm.nonStriker}
                                        onChange={handleOpeningChange}
                                        disabled={submitting}
                                        required
                                        className="relative z-10 w-full cursor-pointer appearance-auto rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        <option value="">
                                            Select Non-Striker
                                        </option>

                                        {battingPlayers.map((player) => (
                                            <option
                                                key={String(player._id)}
                                                value={String(player._id)}
                                            >
                                                {player.name}
                                                {player.shortName
                                                    ? ` (${player.shortName})`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {/* Opening Bowler */}
                                <label className="block">
                                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Opening Bowler
                                    </span>

                                    <select
                                        name="bowler"
                                        value={openingForm.bowler}
                                        onChange={handleOpeningChange}
                                        disabled={submitting}
                                        required
                                        className="relative z-10 w-full cursor-pointer appearance-auto rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        <option value="">
                                            Select Bowler
                                        </option>

                                        {bowlingPlayers.map((player) => (
                                            <option
                                                key={String(player._id)}
                                                value={String(player._id)}
                                            >
                                                {player.name}
                                                {player.shortName
                                                    ? ` (${player.shortName})`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                {submitting ? (
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Zap size={17} />
                                )}

                                {submitting
                                    ? 'Setting Players...'
                                    : innings?.inningsNumber === 2
                                        ? 'Start Second Innings'
                                        : 'Set Opening Players'}
                            </button>
                        </form>
                    </div>
                )}

                {/* New Batter */}
                {innings?.status === 'LIVE' &&
                    requiresNewBatter && (
                        <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md">

                            <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-2xl dark:border-blue-900/50 dark:bg-slate-900">

                                {/* Header */}
                                <div className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white dark:border-blue-900/40 sm:p-8">

                                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                                    <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-blue-300/10 blur-3xl" />

                                    <div className="relative flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                                            <UserPlus size={28} />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                                                Wicket
                                            </div>

                                            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                                                New Batter Required
                                            </h2>

                                            <p className="mt-1 text-sm text-white/75">
                                                Select the batter who will replace the dismissed player.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-5 sm:p-7">

                                    {error && (
                                        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                                            <ShieldAlert
                                                size={18}
                                                className="mt-0.5 shrink-0"
                                            />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                Available Batters
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                Choose a player who has not been dismissed.
                                            </p>
                                        </div>

                                        <div className="hidden rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 sm:block">
                                            {availableBatters.length}{' '}
                                            available
                                        </div>
                                    </div>

                                    {/* Players */}
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {availableBatters.map((player) => {
                                            const playerId = String(player._id)
                                            const isSelected =
                                                String(newBatter) === playerId

                                            return (
                                                <button
                                                    key={playerId}
                                                    type="button"
                                                    disabled={submitting}
                                                    onClick={() => {
                                                        setNewBatterPlayer(playerId)
                                                        setError('')
                                                    }}
                                                    className={[
                                                        'group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200',
                                                        'focus:outline-none focus:ring-4 focus:ring-blue-500/20',
                                                        isSelected
                                                            ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10 dark:border-blue-400 dark:bg-blue-950/40'
                                                            : 'border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-blue-700 dark:hover:bg-slate-800',
                                                        'disabled:cursor-not-allowed disabled:opacity-60',
                                                    ].join(' ')}
                                                >
                                                    <div className="flex items-center gap-3">

                                                        {/* Avatar */}
                                                        <div
                                                            className={[
                                                                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-black transition-all',
                                                                isSelected
                                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                                                    : 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700',
                                                            ].join(' ')}
                                                        >
                                                            {player.shortName
                                                                ? player.shortName
                                                                    .slice(0, 2)
                                                                    .toUpperCase()
                                                                : player.name
                                                                    ?.slice(0, 2)
                                                                    .toUpperCase()}
                                                        </div>

                                                        {/* Player Info */}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                                                                {player.name}
                                                            </p>

                                                            <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                                {player.shortName || 'Batter'}
                                                            </p>
                                                        </div>

                                                        {/* Selected indicator */}
                                                        <div
                                                            className={[
                                                                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                                                                isSelected
                                                                    ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400'
                                                                    : 'border-slate-300 dark:border-slate-600',
                                                            ].join(' ')}
                                                        >
                                                            {isSelected && (
                                                                <span className="h-2 w-2 rounded-full bg-white dark:bg-slate-900" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* No batter */}
                                    {availableBatters.length === 0 && (
                                        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                                            <Users
                                                size={28}
                                                className="mx-auto mb-3 text-slate-400"
                                            />

                                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                                No other batter is available.
                                            </p>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">

                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            <CircleDot size={14} />
                                            <span>
                                                Select a batter to continue the innings.
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleSetNewBatter}
                                            disabled={submitting || !newBatter}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                        >
                                            {submitting ? (
                                                <Loader2
                                                    size={17}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Zap size={17} />
                                            )}

                                            {submitting
                                                ? 'Setting Batter...'
                                                : 'Continue Innings'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                {/* New Bowler */}
                {innings?.status === 'LIVE' &&
                    requiresNewBowler && (
                        <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md">

                            <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-2xl dark:border-purple-900/50 dark:bg-slate-900">

                                {/* Header */}
                                <div className="relative overflow-hidden border-b border-purple-100 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-6 text-white dark:border-purple-900/40 sm:p-8">

                                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                                    <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-purple-300/10 blur-3xl" />

                                    <div className="relative flex items-start gap-4">

                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                                            <RefreshCw size={28} />
                                        </div>

                                        <div className="min-w-0">

                                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                                                Over Complete
                                            </div>

                                            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                                                New Bowler Required
                                            </h2>

                                            <p className="mt-1 text-sm text-white/75">
                                                Select the bowler for the next over.
                                            </p>

                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-5 sm:p-7">

                                    {error && (
                                        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">

                                            <ShieldAlert
                                                size={18}
                                                className="mt-0.5 shrink-0"
                                            />

                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div className="mb-5 flex items-center justify-between gap-4">

                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                Available Bowlers
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                Choose a bowler who has not bowled the previous over.
                                            </p>
                                        </div>

                                        <div className="hidden rounded-xl bg-purple-50 px-3 py-2 text-xs font-black text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 sm:block">
                                            {bowlingPlayers.filter(
                                                (player) =>
                                                    String(player._id) !==
                                                    String(currentBowlerId),
                                            ).length}{' '}
                                            available
                                        </div>

                                    </div>

                                    {/* Bowler Cards */}
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                                        {bowlingPlayers
                                            .filter(
                                                (player) =>
                                                    String(player._id) !==
                                                    String(currentBowlerId),
                                            )
                                            .map((player) => {

                                                const playerId =
                                                    String(player._id)

                                                const isSelected =
                                                    String(newBowler) ===
                                                    playerId

                                                return (
                                                    <button
                                                        key={playerId}
                                                        type="button"
                                                        disabled={submitting}
                                                        onClick={() => {
                                                            setNewBowlerPlayer(
                                                                playerId,
                                                            )
                                                            setError('')
                                                        }}
                                                        className={[
                                                            'group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200',
                                                            'focus:outline-none focus:ring-4 focus:ring-purple-500/20',

                                                            isSelected
                                                                ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-500/10 dark:border-purple-400 dark:bg-purple-950/40'
                                                                : 'border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-50/50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-purple-700 dark:hover:bg-slate-800',

                                                            'disabled:cursor-not-allowed disabled:opacity-60',
                                                        ].join(' ')}
                                                    >

                                                        <div className="flex items-center gap-3">

                                                            {/* Avatar */}
                                                            <div
                                                                className={[
                                                                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-black transition-all',

                                                                    isSelected
                                                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                                                                        : 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700',
                                                                ].join(' ')}
                                                            >
                                                                {player.shortName
                                                                    ? player.shortName
                                                                        .slice(0, 2)
                                                                        .toUpperCase()
                                                                    : player.name
                                                                        ?.slice(0, 2)
                                                                        .toUpperCase()}
                                                            </div>

                                                            {/* Player Info */}
                                                            <div className="min-w-0 flex-1">

                                                                <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                                                                    {player.name}
                                                                </p>

                                                                <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                                    {player.shortName ||
                                                                        'Bowler'}
                                                                </p>

                                                            </div>

                                                            {/* Selected Indicator */}
                                                            <div
                                                                className={[
                                                                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all',

                                                                    isSelected
                                                                        ? 'border-purple-600 bg-purple-600 text-white dark:border-purple-400 dark:bg-purple-400'
                                                                        : 'border-slate-300 dark:border-slate-600',
                                                                ].join(' ')}
                                                            >
                                                                {isSelected && (
                                                                    <span className="h-2 w-2 rounded-full bg-white dark:bg-slate-900" />
                                                                )}
                                                            </div>

                                                        </div>

                                                    </button>
                                                )
                                            })}

                                    </div>

                                    {/* No Bowler */}
                                    {bowlingPlayers.filter(
                                        (player) =>
                                            String(player._id) !==
                                            String(currentBowlerId),
                                    ).length === 0 && (
                                            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">

                                                <Users
                                                    size={28}
                                                    className="mx-auto mb-3 text-slate-400"
                                                />

                                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                                    No other bowler is available.
                                                </p>

                                            </div>
                                        )}

                                    {/* Footer */}
                                    <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">

                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">

                                            <CircleDot size={14} />

                                            <span>
                                                Select a bowler to start the next over.
                                            </span>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleSetNewBowler}
                                            disabled={
                                                submitting ||
                                                !newBowler
                                            }
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-purple-600/20 transition-all hover:-translate-y-0.5 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                        >

                                            {submitting ? (
                                                <Loader2
                                                    size={17}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Zap size={17} />
                                            )}

                                            {submitting
                                                ? 'Setting Bowler...'
                                                : 'Start Next Over'}

                                        </button>

                                    </div>

                                </div>
                            </div>
                        </div>
                    )}

                {/* Current Players */}
                {openingPlayersSet &&
                    !requiresOpeningPlayers &&
                    innings?.status === 'LIVE' && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                            <SectionTitle
                                icon={Users}
                                title="Current Players"
                                description="Players currently involved in this delivery."
                            />

                            <div className="grid gap-3 md:grid-cols-3">
                                <PlayerCard
                                    label="Striker"
                                    player={
                                        innings?.striker
                                    }
                                    badge="ON STRIKE"
                                    accent="brand"
                                />

                                <PlayerCard
                                    label="Non-Striker"
                                    player={
                                        innings?.nonStriker
                                    }
                                    accent="purple"
                                />

                                <PlayerCard
                                    label="Bowler"
                                    player={
                                        innings?.currentBowler
                                    }
                                    accent="orange"
                                />
                            </div>
                        </div>
                    )}

                {/* Scoring Panel */}
                {openingPlayersSet &&
                    !requiresOpeningPlayers &&
                    innings?.status === 'LIVE' && (
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/10">
                            <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
                                <SectionTitle
                                    icon={CircleDot}
                                    title="Live Scoring"
                                    description="Record the next delivery."
                                    action={
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                                            <Flame
                                                size={12}
                                            />
                                            Ball {currentBall + 1}
                                        </span>
                                    }
                                />
                            </div>

                            <form
                                onSubmit={
                                    handleRecordBall
                                }
                                className="p-5 sm:p-6"
                            >
                                {/* Runs */}
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                            Runs
                                        </span>

                                        <span className="text-xs font-bold text-slate-400">
                                            Selected:{' '}
                                            {
                                                ballForm.runs
                                            }
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                                        {runOptions.map(
                                            (runs) => {
                                                const selected =
                                                    Number(
                                                        ballForm.runs,
                                                    ) ===
                                                    runs

                                                return (
                                                    <button
                                                        key={
                                                            runs
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            setBallForm(
                                                                (
                                                                    previous,
                                                                ) => ({
                                                                    ...previous,
                                                                    runs,
                                                                }),
                                                            )
                                                        }
                                                        disabled={
                                                            submitting ||
                                                            !currentStrikerId
                                                        }
                                                        className={[
                                                            'relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border text-xl font-black transition-all duration-200 sm:text-2xl',
                                                            selected
                                                                ? 'scale-[1.03] border-brand-500 bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                                                                : 'border-slate-200 bg-slate-50 text-slate-800 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-brand-700 dark:hover:bg-brand-950/40',
                                                            'disabled:cursor-not-allowed disabled:opacity-50',
                                                        ].join(
                                                            ' ',
                                                        )}
                                                    >
                                                        {runs}
                                                    </button>
                                                )
                                            },
                                        )}
                                    </div>
                                </div>

                                {/* Extras + Wicket */}
                                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Plus
                                                size={16}
                                                className="text-brand-600 dark:text-brand-400"
                                            />

                                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                                Extras
                                            </h3>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <SelectField
                                                label="Extra Type"
                                                value={
                                                    extraType
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setExtraType(
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                disabled={
                                                    submitting ||
                                                    !currentStrikerId
                                                }
                                            >
                                                <option value="NONE">
                                                    No Extra
                                                </option>
                                                <option value="WIDE">
                                                    Wide
                                                </option>
                                                <option value="NO_BALL">
                                                    No Ball
                                                </option>
                                                <option value="BYE">
                                                    Bye
                                                </option>
                                                <option value="LEG_BYE">
                                                    Leg Bye
                                                </option>
                                            </SelectField>

                                            {[
                                                'WIDE',
                                                'NO_BALL',
                                                'BYE',
                                                'LEG_BYE',
                                            ].includes(
                                                extraType,
                                            ) && (
                                                    <label className="block">
                                                        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                            Extra Runs
                                                        </span>

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={
                                                                extraRuns
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                setExtraRuns(
                                                                    Number(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    ) ||
                                                                    1,
                                                                )
                                                            }
                                                            disabled={
                                                                submitting
                                                            }
                                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                                        />
                                                    </label>
                                                )}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Ban
                                                size={16}
                                                className="text-red-600 dark:text-red-400"
                                            />

                                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                                Wicket
                                            </h3>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <SelectField
                                                label="Player Out"
                                                value={
                                                    playerOut
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setPlayerOut(
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                disabled={
                                                    submitting ||
                                                    !currentStrikerId
                                                }
                                            >
                                                <option value="">
                                                    No Wicket
                                                </option>

                                                {[
                                                    innings?.striker,
                                                    innings?.nonStriker,
                                                ]
                                                    .filter(
                                                        Boolean,
                                                    )
                                                    .map(
                                                        (
                                                            player,
                                                        ) => (
                                                            <option
                                                                key={
                                                                    player._id
                                                                }
                                                                value={
                                                                    player._id
                                                                }
                                                            >
                                                                {
                                                                    player.name
                                                                }
                                                            </option>
                                                        ),
                                                    )}
                                            </SelectField>

                                            {playerOut && (
                                                <SelectField
                                                    label="Wicket Type"
                                                    value={
                                                        wicketKind
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        setWicketKind(
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    disabled={
                                                        submitting
                                                    }
                                                >
                                                    {wicketTypes.map(
                                                        (
                                                            type,
                                                        ) => (
                                                            <option
                                                                key={
                                                                    type
                                                                }
                                                                value={
                                                                    type
                                                                }
                                                            >
                                                                {formatWicketType(
                                                                    type,
                                                                )}
                                                            </option>
                                                        ),
                                                    )}
                                                </SelectField>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Manual runs + commentary */}
                                <div className="mt-6 grid gap-4 lg:grid-cols-[160px_1fr]">
                                    <label>
                                        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Runs
                                        </span>

                                        <input
                                            type="number"
                                            name="runs"
                                            min="0"
                                            max="6"
                                            step="1"
                                            value={
                                                ballForm.runs
                                            }
                                            onChange={
                                                handleBallChange
                                            }
                                            disabled={
                                                submitting ||
                                                !currentStrikerId
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        />
                                    </label>

                                    <label>
                                        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            <MessageSquare
                                                size={13}
                                            />
                                            Commentary
                                        </span>

                                        <input
                                            type="text"
                                            name="commentary"
                                            placeholder="Describe the delivery..."
                                            value={
                                                ballForm.commentary
                                            }
                                            onChange={
                                                handleBallChange
                                            }
                                            disabled={
                                                submitting ||
                                                !currentStrikerId
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        />
                                    </label>
                                </div>

                                {!currentStrikerId && (
                                    <div className="mt-5 flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-bold text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-300">
                                        <ShieldAlert
                                            size={16}
                                        />
                                        New batter required before
                                        the next delivery.
                                    </div>
                                )}

                                {/* Record */}
                                <button
                                    type="submit"
                                    disabled={
                                        submitting ||
                                        !currentStrikerId ||
                                        !currentNonStrikerId ||
                                        !currentBowlerId
                                    }
                                    className={[
                                        'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-wide text-white transition-all duration-200',
                                        playerOut
                                            ? 'bg-red-600 shadow-lg shadow-red-600/20 hover:bg-red-700'
                                            : 'bg-brand-600 shadow-lg shadow-brand-600/20 hover:bg-brand-700',
                                        'hover:-translate-y-0.5 active:translate-y-0',
                                        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
                                    ].join(' ')}
                                >
                                    {submitting ? (
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                    ) : playerOut ? (
                                        <Ban size={18} />
                                    ) : (
                                        <CircleDot size={18} />
                                    )}

                                    {submitting
                                        ? 'Recording...'
                                        : playerOut
                                            ? 'Record Wicket'
                                            : 'Record Ball'}
                                </button>
                            </form>
                        </div>
                    )}

                {/* Bottom team context */}
                {innings && !isCompleted && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <TeamLogo
                                team={battingTeam}
                                size="md"
                            />

                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
                                    Batting
                                </p>

                                <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                                    {battingTeam?.name ||
                                        innings.battingTeam
                                            ?.name ||
                                        '—'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <TeamLogo
                                team={bowlingTeam}
                                size="md"
                            />

                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                                    Bowling
                                </p>

                                <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                                    {bowlingTeam?.name ||
                                        innings.bowlingTeam
                                            ?.name ||
                                        '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default LiveMatch