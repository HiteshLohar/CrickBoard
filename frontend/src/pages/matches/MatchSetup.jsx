import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
    ArrowLeft,
    Check,
    ChevronRight,
    CircleDot,
    Coins,
    Loader2,
    Shield,
    Sparkles,
    Trophy,
    Users,
} from 'lucide-react'

import {
    getMatches,
    setPlayingXI,
    setToss,
    startMatch,
} from '../../services/api/matches.api'

import { getTeams } from '../../services/api/teams.api'

function MatchSetup() {
    const { matchId } = useParams()
    const navigate = useNavigate()

    const [match, setMatch] = useState(null)
    const [teams, setTeams] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const [teamAPlayers, setTeamAPlayers] = useState([])
    const [teamBPlayers, setTeamBPlayers] = useState([])

    const [playingXISubmitting, setPlayingXISubmitting] =
        useState(false)

    const [playingXICompleted, setPlayingXICompleted] =
        useState(false)

    const [tossWinner, setTossWinner] = useState('')
    const [tossDecision, setTossDecision] = useState('BAT')

    const [tossSubmitting, setTossSubmitting] =
        useState(false)

    const [startingMatch, setStartingMatch] =
        useState(false)

    useEffect(() => {
        const loadMatch = async () => {
            setLoading(true)
            setError('')

            try {
                const [matchesResponse, teamsResponse] =
                    await Promise.all([
                        getMatches(),
                        getTeams(),
                    ])

                if (!matchesResponse.success) {
                    throw new Error(
                        matchesResponse.message ||
                        'Failed to fetch matches.',
                    )
                }

                if (!teamsResponse.success) {
                    throw new Error(
                        teamsResponse.message ||
                        'Failed to fetch teams.',
                    )
                }

                const currentMatch =
                    matchesResponse.data?.find(
                        (item) => item._id === matchId,
                    )

                if (!currentMatch) {
                    throw new Error('Match not found.')
                }

                setMatch(currentMatch)
                setTeams(teamsResponse.data || [])
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    error.message ||
                    'Unable to load match.',
                )
            } finally {
                setLoading(false)
            }
        }

        loadMatch()
    }, [matchId])

    useEffect(() => {
        const handleTeamsUpdated = async (event) => {
            if (event.key !== 'crickboard-teams-updated') {
                return
            }

            try {
                const response = await getTeams()

                if (response.success) {
                    setTeams(response.data || [])
                    setError('')
                    setSuccessMessage('Team data refreshed.')
                }
            } catch {
                // Keep existing team data if refresh fails.
            }
        }

        window.addEventListener(
            'storage',
            handleTeamsUpdated,
        )

        return () => {
            window.removeEventListener(
                'storage',
                handleTeamsUpdated,
            )
        }
    }, [])


    const handlePlayingXIChange = (playerId, team) => {
        setError('')

        if (team === 'A') {
            if (teamAPlayers.includes(playerId)) {
                setTeamAPlayers((previous) =>
                    previous.filter((id) => id !== playerId),
                )
                return
            }

            if (teamBPlayers.includes(playerId)) {
                const player = teamB?.players?.find(
                    (item) => (item._id || item) === playerId,
                )

                setError(
                    `${player?.name || 'This player'} is already selected in ${teamB?.name || 'Team B'
                    }. Please select another player for ${teamA?.name || 'Team A'
                    }.`,
                )

                return
            }

            setTeamAPlayers((previous) => [
                ...previous,
                playerId,
            ])
        }

        if (team === 'B') {
            if (teamBPlayers.includes(playerId)) {
                setTeamBPlayers((previous) =>
                    previous.filter((id) => id !== playerId),
                )
                return
            }

            if (teamAPlayers.includes(playerId)) {
                const player = teamA?.players?.find(
                    (item) => (item._id || item) === playerId,
                )

                setError(
                    `${player?.name || 'This player'} is already selected in ${teamA?.name || 'Team A'
                    }. Please select another player for ${teamB?.name || 'Team B'
                    }.`,
                )

                return
            }

            setTeamBPlayers((previous) => [
                ...previous,
                playerId,
            ])
        }
    }

    const handlePlayingXISubmit = async () => {
        if (!match) {
            return
        }

        setError('')
        setSuccessMessage('')

        if (
            teamAPlayers.length !==
            match.playersPerTeam
        ) {
            setError(
                `${match.teamA?.name} must have exactly ${match.playersPerTeam} players in Playing XI.`,
            )
            return
        }

        if (
            teamBPlayers.length !==
            match.playersPerTeam
        ) {
            setError(
                `${match.teamB?.name} must have exactly ${match.playersPerTeam} players in Playing XI.`,
            )
            return
        }

        setPlayingXISubmitting(true)

        try {
            const response = await setPlayingXI(
                match._id,
                {
                    teamAPlayers,
                    teamBPlayers,
                },
            )

            if (!response.success) {
                throw new Error(
                    response.message ||
                    'Failed to set Playing XI.',
                )
            }

            setPlayingXICompleted(true)
            setTeamAPlayers([])
            setTeamBPlayers([])
            setTossWinner('')
            setTossDecision('BAT')

            setSuccessMessage(
                'Playing XI set successfully.',
            )
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to set Playing XI.',
            )
        } finally {
            setPlayingXISubmitting(false)
        }
    }

    const handleTossSubmit = async () => {
        if (!match) {
            return
        }

        setError('')
        setSuccessMessage('')

        if (!tossWinner) {
            setError('Please select the toss winner.')
            return
        }

        setTossSubmitting(true)

        try {
            const response = await setToss(
                match._id,
                {
                    wonBy: tossWinner,
                    decision: tossDecision,
                },
            )

            if (!response.success) {
                throw new Error(
                    response.message ||
                    'Failed to complete toss.',
                )
            }

            setMatch((previous) => ({
                ...previous,
                toss: response.data?.toss,
            }))

            setSuccessMessage(
                'Toss completed successfully.',
            )
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to complete toss.',
            )
        } finally {
            setTossSubmitting(false)
        }
    }

    const handleMatchStart = async () => {
        if (!match) {
            return
        }

        setError('')
        setSuccessMessage('')
        setStartingMatch(true)

        try {
            const response = await startMatch(
                match._id,
            )

            if (!response.success) {
                throw new Error(
                    response.message ||
                    'Failed to start match.',
                )
            }

            setMatch(response.data.match)

            setSuccessMessage(
                'Match started successfully.',
            )

            navigate(
                `/matches/${match._id}/live`,
            )
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to start match.',
            )
        } finally {
            setStartingMatch(false)
        }
    }

    if (loading) {
        return (
            <section className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex min-h-[60vh] items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/50">
                                <Loader2 className="h-7 w-7 animate-spin text-emerald-600 dark:text-emerald-400" />
                            </div>

                            <div className="text-center">
                                <p className="font-semibold text-slate-900 dark:text-white">
                                    Loading match setup
                                </p>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Preparing your match...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (error && !match) {
        return (
            <section className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl">
                    <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/50">
                            <CircleDot className="h-7 w-7 text-red-600 dark:text-red-400" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                            Unable to load match
                        </h2>

                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                window.location.href = '/matches'
                            }}
                            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Matches
                        </button>
                    </div>
                </div>
            </section>
        )
    }

    const teamAId =
        typeof match?.teamA === 'string'
            ? match.teamA
            : match?.teamA?._id

    const teamBId =
        typeof match?.teamB === 'string'
            ? match.teamB
            : match?.teamB?._id

    const teamA =
        teams.find((team) => team._id === teamAId) ||
        match?.teamA

    const teamB =
        teams.find((team) => team._id === teamBId) ||
        match?.teamB

    const teamASelected =
        teamAPlayers.length === match.playersPerTeam

    const teamBSelected =
        teamBPlayers.length === match.playersPerTeam

    return (
        <section className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                            <Sparkles className="h-4 w-4" />
                            Pre Match Center
                        </div>

                        <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                            Match Setup
                        </h1>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {match.matchCode} — {match.title}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/matches')
                        }
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Matches
                    </button>
                </div>

                {/* Match Hero */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative p-5 sm:p-7">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60">
                                    <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Match
                                    </p>

                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {match.matchCode}
                                    </p>
                                </div>
                            </div>

                            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
                                SETUP
                            </span>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
                            <TeamHero
                                team={teamA}
                                align="right"
                            />

                            <div className="flex flex-col items-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-inner dark:border-slate-700 dark:bg-slate-800">
                                    <span className="text-sm font-black text-slate-400">
                                        VS
                                    </span>
                                </div>
                            </div>

                            <TeamHero team={teamB} />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                {error && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/20"
                    >
                        <CircleDot className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                        <p className="text-sm font-medium text-red-700 dark:text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                {successMessage && (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    >
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />

                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            {successMessage}
                        </p>
                    </div>
                )}

                {/* Playing XI */}
                {!playingXICompleted && (
                    <div className="space-y-5">
                        <SectionHeading
                            icon={Users}
                            eyebrow="Step 01"
                            title="Select Playing XI"
                            description={`Choose exactly ${match.playersPerTeam} players from each team.`}
                        />

                        <div className="grid gap-5 lg:grid-cols-2">
                            <PlayerSelectionCard
                                team={teamA}
                                selectedPlayers={teamAPlayers}
                                teamCode="A"
                                requiredPlayers={match.playersPerTeam}
                                onPlayerChange={
                                    handlePlayingXIChange
                                }
                                otherTeam={teamB}
                                otherTeamSelectedPlayers={teamBPlayers}
                            />

                            <PlayerSelectionCard
                                team={teamB}
                                selectedPlayers={teamBPlayers}
                                teamCode="B"
                                requiredPlayers={match.playersPerTeam}
                                onPlayerChange={
                                    handlePlayingXIChange
                                }
                                otherTeam={teamA}
                                otherTeamSelectedPlayers={teamAPlayers}
                            />
                        </div>

                        <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
                                    <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        XI Selection
                                    </p>

                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {teamAPlayers.length}/{match.playersPerTeam} +{' '}
                                        {teamBPlayers.length}/{match.playersPerTeam} selected
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handlePlayingXISubmit
                                }
                                disabled={
                                    playingXISubmitting ||
                                    !teamASelected ||
                                    !teamBSelected
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                            >
                                {playingXISubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Setting XI...
                                    </>
                                ) : (
                                    <>
                                        Confirm Playing XI
                                        <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Toss */}
                {playingXICompleted && (
                    <div className="space-y-5">
                        <SectionHeading
                            icon={Coins}
                            eyebrow="Step 02"
                            title="Toss & Match Decision"
                            description="Complete the toss before sending the match live."
                        />

                        {!match.toss ? (
                            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                                    <label className="mb-3 block text-sm font-bold text-slate-900 dark:text-white">
                                        Toss Winner
                                    </label>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <TossTeamButton
                                            team={teamA}
                                            selected={
                                                tossWinner ===
                                                teamA?._id
                                            }
                                            onClick={() =>
                                                setTossWinner(
                                                    teamA?._id,
                                                )
                                            }
                                        />

                                        <TossTeamButton
                                            team={teamB}
                                            selected={
                                                tossWinner ===
                                                teamB?._id
                                            }
                                            onClick={() =>
                                                setTossWinner(
                                                    teamB?._id,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                                    <label className="mb-3 block text-sm font-bold text-slate-900 dark:text-white">
                                        Decision
                                    </label>

                                    <div className="grid grid-cols-2 gap-3">
                                        <DecisionButton
                                            value="BAT"
                                            active={
                                                tossDecision ===
                                                'BAT'
                                            }
                                            onClick={() =>
                                                setTossDecision(
                                                    'BAT',
                                                )
                                            }
                                        />

                                        <DecisionButton
                                            value="BOWL"
                                            active={
                                                tossDecision ===
                                                'BOWL'
                                            }
                                            onClick={() =>
                                                setTossDecision(
                                                    'BOWL',
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        handleTossSubmit
                                    }
                                    disabled={
                                        tossSubmitting ||
                                        !tossWinner
                                    }
                                    className="lg:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                                >
                                    {tossSubmitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Completing Toss...
                                        </>
                                    ) : (
                                        <>
                                            <Coins className="h-5 w-5" />
                                            Complete Toss
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm dark:border-emerald-900/50 dark:bg-slate-900">
                                <div className="border-b border-emerald-100 bg-emerald-50/70 p-5 dark:border-emerald-900/30 dark:bg-emerald-950/20 sm:p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/50">
                                            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                                Toss Completed
                                            </p>

                                            <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                                                {
                                                    match.toss
                                                        ?.wonBy
                                                        ?.name
                                                }
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Toss Winner
                                        </p>

                                        <p className="mt-2 font-bold text-slate-900 dark:text-white">
                                            {
                                                match.toss
                                                    ?.wonBy
                                                    ?.name
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Decision
                                        </p>

                                        <p className="mt-2 font-bold text-emerald-600 dark:text-emerald-400">
                                            {
                                                match.toss
                                                    ?.decision
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 p-5 dark:border-slate-800 sm:p-6">
                                    <button
                                        type="button"
                                        onClick={
                                            handleMatchStart
                                        }
                                        disabled={
                                            startingMatch
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                                    >
                                        {startingMatch ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Starting Match...
                                            </>
                                        ) : (
                                            <>
                                                Start Match
                                                <ChevronRight className="h-5 w-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Setup Progress */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Match Preparation
                        </p>

                        <div className="flex items-center gap-2 text-xs font-semibold">
                            <ProgressStep
                                number="01"
                                label="Playing XI"
                                completed={
                                    playingXICompleted
                                }
                            />

                            <div className="h-px w-5 bg-slate-200 dark:bg-slate-700" />

                            <ProgressStep
                                number="02"
                                label="Toss"
                                completed={Boolean(match.toss)}
                            />

                            <div className="h-px w-5 bg-slate-200 dark:bg-slate-700" />

                            <ProgressStep
                                number="03"
                                label="Live"
                                completed={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function TeamHero({ team, align = 'left' }) {
    return (
        <div
            className={[
                'min-w-0',
                align === 'right'
                    ? 'text-right'
                    : 'text-left',
            ].join(' ')}
        >
            <div
                className={[
                    'flex items-center gap-3',
                    align === 'right'
                        ? 'justify-end'
                        : 'justify-start',
                ].join(' ')}
            >
                {align !== 'right' && (
                    <TeamLogo team={team} />
                )}

                <div className="min-w-0">
                    <p className="truncate text-base font-black text-slate-950 dark:text-white sm:text-xl">
                        {team?.name}
                    </p>

                    <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                        {team?.shortName}
                    </p>
                </div>

                {align === 'right' && (
                    <TeamLogo team={team} />
                )}
            </div>
        </div>
    )
}

function TeamLogo({ team }) {
    if (team?.logo) {
        return (
            <img
                src={team.logo}
                alt={team.name}
                className="h-12 w-12 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
        )
    }

    return (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-black text-white shadow-lg shadow-emerald-600/20">
            {team?.shortName?.slice(0, 3) || '?'}
        </div>
    )
}

function SectionHeading({
    icon: Icon,
    eyebrow,
    title,
    description,
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/50">
                <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                    {eyebrow}
                </p>

                <h2 className="mt-0.5 text-xl font-black tracking-tight text-slate-950 dark:text-white">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {description}
                </p>
            </div>
        </div>
    )
}

function PlayerSelectionCard({
    team,
    selectedPlayers,
    teamCode,
    requiredPlayers,
    onPlayerChange,
    otherTeam,
    otherTeamSelectedPlayers,
}) {
    const players = team?.players || []

    const completed =
        selectedPlayers.length === requiredPlayers

    const availablePlayersToSelect = players.filter((player) => {
        const playerId = player._id || player

        return (
            !selectedPlayers.includes(playerId) &&
            !otherTeamSelectedPlayers.includes(playerId)
        )
    }).length

    const maximumPossibleSelection =
        selectedPlayers.length + availablePlayersToSelect

    const additionalPlayersNeeded = Math.max(
        0,
        requiredPlayers - maximumPossibleSelection,
    )

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <TeamLogo team={team} />

                        <div className="min-w-0">
                            <h3 className="truncate font-black text-slate-950 dark:text-white">
                                {team?.name}
                            </h3>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {players.length} squad players
                            </p>
                            {additionalPlayersNeeded > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        window.open(
                                            `/teams?excludeTeam=${team?._id}&excludePlayers=${otherTeamSelectedPlayers.join(',')}#team-${team?._id}`,
                                            '_blank',
                                        )
                                    }}
                                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1.5 text-[11px] font-black text-amber-700 transition hover:bg-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-950/60"
                                >
                                    <Users className="h-3.5 w-3.5" />

                                    Add {additionalPlayersNeeded} player
                                    {additionalPlayersNeeded > 1 ? 's' : ''}
                                </button>
                            )}
                        </div>
                    </div>

                    <div
                        className={[
                            'shrink-0 rounded-full px-3 py-1.5 text-xs font-black',
                            completed
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                        ].join(' ')}
                    >
                        {selectedPlayers.length}/{requiredPlayers}
                    </div>
                </div>
            </div>

            <div className="max-h-[430px] space-y-2 overflow-y-auto p-4">
                {players.map((player, index) => {
                    const playerId =
                        player._id || player

                    const selected =
                        selectedPlayers.includes(playerId)

                    const selectedInOtherTeam =
                        otherTeamSelectedPlayers.includes(
                            playerId,
                        )

                    return (
                        <button
                            key={playerId}
                            type="button"
                            onClick={() =>
                                onPlayerChange(
                                    playerId,
                                    teamCode,
                                )
                            }
                            className={[
                                'group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200',
                                selected
                                    ? 'border-emerald-300 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/30'
                                    : selectedInOtherTeam
                                        ? 'border-amber-300 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/20'
                                        : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
                            ].join(' ')}
                        >
                            <div
                                className={[
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black transition',
                                    selected
                                        ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950'
                                        : selectedInOtherTeam
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                                ].join(' ')}
                            >
                                {selected ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    String(index + 1).padStart(
                                        2,
                                        '0',
                                    )
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                    {player.name || player}
                                </p>

                                {player.role && (
                                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                        {player.role}
                                    </p>
                                )}

                                {selectedInOtherTeam &&
                                    !selected && (
                                        <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                            <span>⚠</span>
                                            Already selected in{' '}
                                            {otherTeam?.name ||
                                                'other team'}
                                        </p>
                                    )}
                            </div>

                            <div
                                className={[
                                    'h-5 w-5 rounded-full border-2 transition',
                                    selected
                                        ? 'border-emerald-500 bg-emerald-500'
                                        : selectedInOtherTeam
                                            ? 'border-amber-400 dark:border-amber-500'
                                            : 'border-slate-300 dark:border-slate-600',
                                ].join(' ')}
                            />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

function TossTeamButton({
    team,
    selected,
    onClick,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200',
                selected
                    ? 'border-emerald-400 bg-emerald-50 shadow-md dark:border-emerald-700 dark:bg-emerald-950/30'
                    : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
            ].join(' ')}
        >
            <TeamLogo team={team} />

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                    {team?.name}
                </p>

                <p className="text-xs font-semibold text-slate-400">
                    {team?.shortName}
                </p>
            </div>

            {selected && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-4 w-4" />
                </div>
            )}
        </button>
    )
}

function DecisionButton({
    value,
    active,
    onClick,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'rounded-2xl border px-4 py-4 text-sm font-black transition-all duration-200',
                active
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700',
            ].join(' ')}
        >
            {value}
        </button>
    )
}

function ProgressStep({
    number,
    label,
    completed,
}) {
    return (
        <div className="flex items-center gap-1.5">
            <span
                className={[
                    'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black',
                    completed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800',
                ].join(' ')}
            >
                {completed ? (
                    <Check className="h-3.5 w-3.5" />
                ) : (
                    number
                )}
            </span>

            <span
                className={
                    completed
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400'
                }
            >
                {label}
            </span>
        </div>
    )
}

export default MatchSetup