import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    CircleDot,
    Clock3,
    Hash,
    Loader2,
    Settings2,
    Shield,
    Sparkles,
    Trophy,
    Users,
    X,
    ChevronDown,
} from 'lucide-react'

import { getTeams } from '../../services/api/teams.api'
import { createMatch } from '../../services/api/matches.api'

import Button from '../../components/common/Button'
import Card from '../../components/common/Card'

function CreateMatch() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        matchCode: '',
        title: '',
        teamA: '',
        teamB: '',
        playersPerTeam: 5,
        totalOvers: 3,
    })

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const [teams, setTeams] = useState([])
    const [loadingTeams, setLoadingTeams] = useState(true)

    useEffect(() => {
        const loadTeams = async () => {
            try {
                const response = await getTeams()

                if (!response.success) {
                    throw new Error(
                        response.message ||
                        'Failed to fetch teams.',
                    )
                }

                setTeams(response.data || [])
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    error.message ||
                    'Unable to load teams.',
                )
            } finally {
                setLoadingTeams(false)
            }
        }

        loadTeams()
    }, [])

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }))

        if (error) {
            setError('')
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        setError('')
        setSuccessMessage('')

        if (formData.teamA === formData.teamB) {
            setError(
                'Team A and Team B cannot be the same.',
            )
            return
        }

        setSubmitting(true)

        try {
            const response = await createMatch({
                matchCode: formData.matchCode,
                title: formData.title,
                teamA: formData.teamA,
                teamB: formData.teamB,
                playersPerTeam: Number(
                    formData.playersPerTeam,
                ),
                totalOvers: Number(formData.totalOvers),
            })

            if (!response.success) {
                throw new Error(
                    response.message ||
                    'Failed to create match.',
                )
            }

            setSuccessMessage(
                'Match created successfully.',
            )

            setTimeout(() => {
                navigate('/matches')
            }, 500)
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to create match.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    const selectedTeamA = teams.find(
        (team) => team._id === formData.teamA,
    )

    const selectedTeamB = teams.find(
        (team) => team._id === formData.teamB,
    )

    const teamAPlayerCount = Array.isArray(selectedTeamA?.players)
        ? selectedTeamA.players.length
        : 0

    const teamBPlayerCount = Array.isArray(selectedTeamB?.players)
        ? selectedTeamB.players.length
        : 0

    const requiredPlayers = Number(formData.playersPerTeam) || 0

    const isTeamAPlayerShort =
        Boolean(selectedTeamA) &&
        teamAPlayerCount < requiredPlayers

    const isTeamBPlayerShort =
        Boolean(selectedTeamB) &&
        teamBPlayerCount < requiredPlayers

    const openTeamManager = (teamId) => {
        if (!teamId) return

        window.open(
            `/teams#team-${teamId}`,
            '_blank',
            'noopener,noreferrer',
        )
    }

    return (
        <section className="relative mx-auto max-w-6xl space-y-8">
            {/* Background glow */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />

            <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-brand-400/5 blur-3xl" />

            {/* Header */}
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/matches')}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Matches
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 shadow-sm dark:bg-brand-500/10 dark:text-brand-400">
                            <Trophy className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
                                Match Center
                            </p>

                            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                                Create Match
                            </h1>
                        </div>
                    </div>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                        Set up your teams, squad size and match format
                        before starting the game.
                    </p>
                </div>
            </div>

            {/* Main */}
            <form
                onSubmit={handleSubmit}
                className="relative grid gap-6 lg:grid-cols-[1fr_340px]"
            >
                {/* Form */}
                <Card padding="p-0" className="overflow-hidden">
                    <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                <Sparkles className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white">
                                    Match Details
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    Configure the basic match information.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 p-5 sm:p-6">
                        {/* Match identity */}
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Match Code"
                                icon={Hash}
                            >
                                <input
                                    type="text"
                                    name="matchCode"
                                    placeholder="e.g. IPL001"
                                    value={formData.matchCode}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Match Title"
                                icon={Trophy}
                            >
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Sunday Cricket Final"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        {/* Teams */}
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-brand-600 dark:text-brand-400" />

                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    Select Teams
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <TeamSelect
                                    label="Team A"
                                    value={formData.teamA}
                                    teams={teams}
                                    loading={loadingTeams}
                                    onChange={handleChange}
                                    name="teamA"
                                />

                                <TeamSelect
                                    label="Team B"
                                    value={formData.teamB}
                                    teams={teams}
                                    loading={loadingTeams}
                                    onChange={handleChange}
                                    name="teamB"
                                    excludeId={formData.teamA}
                                />
                            </div>
                        </div>

                        {/* Match format */}
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <CircleDot className="h-4 w-4 text-brand-600 dark:text-brand-400" />

                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    Match Format
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field
                                    label="Players Per Team"
                                    icon={Users}
                                >
                                    <input
                                        type="number"
                                        name="playersPerTeam"
                                        min="5"
                                        max="14"
                                        step="1"
                                        value={formData.playersPerTeam}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                    />

                                    <p className="mt-2 text-xs text-slate-400">
                                        Choose between 5 and 14 players.
                                    </p>
                                </Field>

                                <Field
                                    label="Total Overs"
                                    icon={Clock3}
                                >
                                    <input
                                        type="number"
                                        name="totalOvers"
                                        min="1"
                                        step="1"
                                        value={formData.totalOvers}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                    />

                                    <p className="mt-2 text-xs text-slate-400">
                                        Minimum 1 over.
                                    </p>
                                </Field>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                role="alert"
                                className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-500/10"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                                        <Shield className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold leading-5 text-red-700 dark:text-red-400">
                                            {error}
                                        </p>

                                        {(isTeamAPlayerShort ||
                                            isTeamBPlayerShort) && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {isTeamAPlayerShort && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openTeamManager(selectedTeamA?._id)
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:shadow-md dark:border-red-900/50 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/30"
                                                        >
                                                            <Settings2 className="h-3.5 w-3.5" />

                                                            Modify Team A
                                                            <span className="text-red-400">
                                                                ({selectedTeamA?.name})
                                                            </span>
                                                        </button>
                                                    )}

                                                    {isTeamBPlayerShort && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openTeamManager(selectedTeamB?._id)
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:shadow-md dark:border-red-900/50 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/30"
                                                        >
                                                            <Settings2 className="h-3.5 w-3.5" />

                                                            Modify Team B
                                                            <span className="text-red-400">
                                                                ({selectedTeamB?.name})
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                        {(isTeamAPlayerShort ||
                                            isTeamBPlayerShort) && (
                                                <p className="mt-3 text-[11px] font-semibold text-red-500/80 dark:text-red-400/80">
                                                    Add more players to the team and then
                                                    return here to create the match.
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Success */}
                        {successMessage && (
                            <div
                                role="status"
                                className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 dark:border-brand-900/50 dark:bg-brand-500/10 dark:text-brand-400"
                            >
                                {successMessage}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    navigate('/matches')
                                }
                                disabled={
                                    submitting ||
                                    loadingTeams
                                }
                                className="w-full sm:w-auto"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <X className="h-4 w-4" />
                                    Cancel
                                </span>
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    submitting ||
                                    loadingTeams
                                }
                                className="w-full sm:w-auto"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Trophy className="h-4 w-4" />
                                            Create Match
                                        </>
                                    )}
                                </span>
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Preview */}
                <div className="space-y-6">
                    <Card className="overflow-hidden p-0">
                        <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white dark:from-brand-700 dark:to-brand-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-100">
                                        Match Preview
                                    </p>

                                    <h2 className="mt-2 text-xl font-bold">
                                        {formData.matchCode ||
                                            'MATCH'}
                                    </h2>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                                    <Trophy className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                <PreviewTeam
                                    team={selectedTeamA}
                                    fallback="Team A"
                                />

                                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[9px] font-black text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                                    VS
                                </div>

                                <PreviewTeam
                                    team={selectedTeamB}
                                    fallback="Team B"
                                    align="right"
                                />
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <PreviewInfo
                                    icon={Users}
                                    label="Players"
                                    value={
                                        formData.playersPerTeam
                                    }
                                />

                                <PreviewInfo
                                    icon={CircleDot}
                                    label="Overs"
                                    value={formData.totalOvers}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                                <Sparkles className="h-4 w-4" />
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Ready to play?
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                    After creating the match, you'll
                                    configure the Playing XI and toss
                                    before starting live scoring.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </section>
    )
}

function Field({
    label,
    icon: Icon,
    children,
}) {
    return (
        <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </span>

            {children}
        </label>
    )
}

function TeamSelect({
    label,
    value,
    teams,
    loading,
    onChange,
    name,
    excludeId,
}) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener(
            'mousedown',
            handleOutsideClick,
        )

        return () => {
            document.removeEventListener(
                'mousedown',
                handleOutsideClick,
            )
        }
    }, [])

    const availableTeams = teams.filter(
        (team) => team._id !== excludeId,
    )

    const selectedTeam = teams.find(
        (team) => team._id === value,
    )

    const getPlayerCount = (team) =>
        Array.isArray(team?.players)
            ? team.players.length
            : 0

    const handleSelect = (team) => {
        onChange({
            target: {
                name,
                value: team._id,
            },
        })

        setIsOpen(false)
    }

    return (
        <div
            ref={dropdownRef}
            className="relative"
        >
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
            </span>

            <button
                type="button"
                onClick={() =>
                    !loading &&
                    setIsOpen((previous) => !previous)
                }
                disabled={loading}
                className={[
                    'flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left',
                    'transition-all duration-200 outline-none',
                    'bg-white dark:bg-slate-950',
                    'border-slate-200 dark:border-slate-700',
                    'hover:border-brand-300 dark:hover:border-brand-700',
                    'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                ].join(' ')}
            >
                <div className="min-w-0 flex-1">
                    {loading ? (
                        <span className="text-sm font-medium text-slate-400">
                            Loading teams...
                        </span>
                    ) : selectedTeam ? (
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-[10px] font-black text-brand-700 dark:bg-brand-950/50 dark:text-brand-400">
                                {(
                                    selectedTeam.shortName ||
                                    selectedTeam.name ||
                                    'TM'
                                )
                                    .slice(0, 3)
                                    .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                                    {selectedTeam.name}
                                </p>

                                <div className="mt-0.5 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                    <span>
                                        {selectedTeam.shortName || '—'}
                                    </span>

                                    <span>•</span>

                                    <span>
                                        {getPlayerCount(selectedTeam)}{' '}
                                        {getPlayerCount(selectedTeam) === 1
                                            ? 'Player'
                                            : 'Players'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <span className="text-sm font-medium text-slate-400">
                            Select {label}
                        </span>
                    )}
                </div>

                <ChevronDown
                    className={[
                        'h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200',
                        isOpen ? 'rotate-180' : '',
                    ].join(' ')}
                />
            </button>

            {isOpen && !loading && (
                <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
                    <div className="max-h-72 overflow-y-auto">
                        {availableTeams.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                    No teams available
                                </p>
                            </div>
                        ) : (
                            availableTeams.map((team) => {
                                const playerCount =
                                    getPlayerCount(team)

                                const isSelected =
                                    team._id === value

                                return (
                                    <button
                                        key={team._id}
                                        type="button"
                                        onClick={() =>
                                            handleSelect(team)
                                        }
                                        className={[
                                            'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left',
                                            'transition-all duration-150',
                                            isSelected
                                                ? 'bg-brand-50 dark:bg-brand-950/40'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800',
                                        ].join(' ')}
                                    >
                                        <div
                                            className={[
                                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-black',
                                                isSelected
                                                    ? 'bg-brand-600 text-white'
                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                                            ].join(' ')}
                                        >
                                            {(
                                                team.shortName ||
                                                team.name ||
                                                'TM'
                                            )
                                                .slice(0, 3)
                                                .toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                                                {team.name}
                                            </p>

                                            <div className="mt-0.5 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                <span>
                                                    {team.shortName || '—'}
                                                </span>

                                                <span>•</span>

                                                <span>
                                                    {playerCount}{' '}
                                                    {playerCount === 1
                                                        ? 'Player'
                                                        : 'Players'}
                                                </span>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <span className="shrink-0 rounded-full bg-brand-600 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white">
                                                Selected
                                            </span>
                                        )}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function PreviewTeam({
    team,
    fallback,
    align = 'left',
}) {
    return (
        <div
            className={
                align === 'right'
                    ? 'min-w-0 text-right'
                    : 'min-w-0'
            }
        >
            <div
                className={[
                    'mb-2 flex h-12 w-12 items-center justify-center rounded-2xl',
                    'bg-brand-100 text-xs font-black text-brand-700',
                    'dark:bg-brand-500/10 dark:text-brand-400',
                    align === 'right'
                        ? 'ml-auto'
                        : '',
                ].join(' ')}
            >
                {(team?.shortName || fallback)
                    .slice(0, 3)
                    .toUpperCase()}
            </div>

            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {team?.name || fallback}
            </p>

            <p className="mt-1 text-[11px] font-semibold text-slate-400">
                {team?.shortName || '—'}
            </p>
        </div>
    )
}

function PreviewInfo({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950/50">
            <Icon className="mx-auto h-4 w-4 text-slate-400" />

            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                {value}
            </p>
        </div>
    )
}

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/10'

export default CreateMatch