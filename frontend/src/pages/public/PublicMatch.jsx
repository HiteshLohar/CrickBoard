import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    AlertTriangle,
    Clock3,
    Eye,
    Trophy,
    Users,
    LoaderCircle,
    X,
} from 'lucide-react'

import { getPublicLiveMatch } from '../../services/api/publicMatch.api'

function PublicMatch() {
    const { publicId } = useParams()

    const [response, setResponse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showTeams, setShowTeams] = useState(false)


    const loadMatch = useCallback(async () => {
        try {
            setError('')

            const data = await getPublicLiveMatch(publicId)
            setResponse(data)
        } catch {
            setResponse(null)
            setError('This public match link is invalid or no longer available.')
        } finally {
            setLoading(false)
        }
    }, [publicId])

    useEffect(() => {
        loadMatch()
    }, [loadMatch])

    useEffect(() => {
        if (response?.success !== true) return
        if (response?.data?.match?.status !== 'LIVE') return

        const interval = window.setInterval(() => {
            loadMatch()
        }, 2000)

        return () => window.clearInterval(interval)
    }, [response, loadMatch])

    if (loading) {
        return <LoadingScreen />
    }

    if (error) {
        return (
            <ErrorScreen
                message={error}
                onRetry={() => loadMatch()}
            />
        )
    }

    const data = response?.data
    const match = data?.match
    const innings = data?.innings
    const scorecard = data?.scorecard || []
    const recentBalls = data?.recentBalls || []

    const lifecycleCode = data?.code

    const isTossPending = lifecycleCode === 'TOSS_REQUIRED'

    const isMatchReady =
        lifecycleCode === 'MATCH_START_REQUIRED'

    const isLive =
        response?.success === true &&
        match?.status === 'LIVE'

    const isCompleted =
        response?.success === true &&
        match?.status === 'COMPLETED'

    const teamA =
        match?.teamA ||
        data?.teams?.teamA

    const teamB =
        match?.teamB ||
        data?.teams?.teamB

    return (
        <main className="h-dvh w-full overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
            <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col overflow-hidden px-2 py-2 sm:px-3 sm:py-3">
                <PublicHeader
                    match={match}
                    isLive={isLive}
                    isCompleted={isCompleted}
                />

                <div className="mt-2 min-h-0 flex-1 overflow-hidden">
                    {isTossPending && (
                        <TossPendingView
                            teamA={teamA}
                            teamB={teamB}
                        />
                    )}

                    {isMatchReady && (
                        <ReadyView
                            teamA={teamA}
                            teamB={teamB}
                        />
                    )}

                    {isLive && (
                        <>
                            <div className="hidden h-full min-h-0 lg:block">
                                <DesktopLiveView
                                    match={match}
                                    innings={innings}
                                    scorecard={scorecard}
                                    recentBalls={recentBalls}
                                    teamA={teamA}
                                    teamB={teamB}
                                />
                            </div>

                            <div className="block h-full min-h-0 lg:hidden">
                                <MobileLiveView
                                    match={match}
                                    innings={innings}
                                    scorecard={scorecard}
                                    recentBalls={recentBalls}
                                    teamA={teamA}
                                    teamB={teamB}
                                    onShowTeams={() => setShowTeams(true)}
                                />
                            </div>
                        </>
                    )}

                    {isCompleted && (
                        <>
                            <div className="hidden h-full min-h-0 lg:block">
                                <DesktopCompletedView
                                    match={match}
                                    scorecard={scorecard}
                                    recentBalls={recentBalls}
                                    teamA={teamA}
                                    teamB={teamB}
                                />
                            </div>

                            <div className="block h-full min-h-0 lg:hidden">
                                <MobileCompletedView
                                    match={match}
                                    scorecard={scorecard}
                                    recentBalls={recentBalls}
                                    teamA={teamA}
                                    teamB={teamB}
                                    onShowTeams={() => setShowTeams(true)}
                                />
                            </div>
                        </>
                    )}
                </div>

            </div>

            {showTeams && (
                <TeamsModal
                    teamA={teamA}
                    teamB={teamB}
                    onClose={() => setShowTeams(false)}
                />
            )}
        </main>
    )
}

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

function PublicHeader({ match, isLive, isCompleted }) {
    return (
        <header className="shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                        <Trophy size={16} />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                            CrickBoard
                        </p>

                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-slate-400">
                            <Eye size={10} />
                            Public Match
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                    {match?.matchCode && (
                        <span className="hidden rounded-lg bg-slate-100 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300 sm:inline-flex">
                            {match.matchCode}
                        </span>
                    )}

                    {isLive && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-red-600 dark:bg-red-950/40 dark:text-red-400">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                            LIVE
                        </span>
                    )}

                    {isCompleted && (
                        <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-brand-700 dark:bg-brand-950/40 dark:text-brand-400">
                            COMPLETED
                        </span>
                    )}
                </div>
            </div>
        </header>
    )
}

/* -------------------------------------------------------------------------- */
/* Loading / Error                                                            */
/* -------------------------------------------------------------------------- */

function LoadingScreen() {
    return (
        <main className="flex h-dvh w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950">
            <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                    <LoaderCircle size={22} className="animate-spin" />
                </div>

                <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                    Loading match...
                </p>
            </div>
        </main>
    )
}

function ErrorScreen({ message, onRetry }) {
    return (
        <main className="flex h-dvh w-full items-center justify-center overflow-hidden bg-slate-50 px-4 dark:bg-slate-950">
            <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    <AlertTriangle size={22} />
                </div>

                <h1 className="mt-4 text-lg font-black text-slate-950 dark:text-white">
                    Match Not Found
                </h1>

                <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
                    {message}
                </p>

                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-brand-700"
                >
                    <RefreshCw size={14} />
                    Try Again
                </button>
            </div>
        </main>
    )
}

/* -------------------------------------------------------------------------- */
/* Toss Pending                                                               */
/* -------------------------------------------------------------------------- */

function TossPendingView({ teamA, teamB }) {
    return (
        <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-2">
            <MatchTeamsStrip
                teamA={teamA}
                teamB={teamB}
            />

            <StatusPanel
                icon={<Clock3 size={22} />}
                title="Toss Pending"
                description="Waiting for toss"
                detail="The match creator has not completed the toss yet."
            />
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* Ready                                                                      */
/* -------------------------------------------------------------------------- */

function ReadyView({ teamA, teamB }) {
    return (
        <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-2">
            <MatchTeamsStrip
                teamA={teamA}
                teamB={teamB}
            />

            <div className="rounded-2xl border border-brand-200 bg-brand-50 px-3 py-2 dark:border-brand-900/50 dark:bg-brand-950/20">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-400">
                        <Clock3 size={15} />
                    </div>

                    <div>
                        <p className="text-xs font-black text-brand-700 dark:text-brand-400">
                            Match Ready to Start
                        </p>

                        <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                            Waiting for match to start
                        </p>
                    </div>
                </div>
            </div>

            <div className="min-h-0 overflow-hidden">
                <PlayingXIGrid
                    teamA={teamA}
                    teamB={teamB}
                />
            </div>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* Desktop Live                                                               */
/* -------------------------------------------------------------------------- */

function DesktopLiveView({
    match,
    innings,
    scorecard,
    recentBalls,
    teamA,
    teamB,
}) {
    return (
        <div className="grid h-full min-h-0 grid-cols-12 gap-2">
            <div className="col-span-5 min-h-0">
                <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-2">
                    <MatchTeamsStrip
                        teamA={teamA}
                        teamB={teamB}
                    />

                    <LiveScoreCard
                        match={match}
                        innings={innings}
                    />

                    <CurrentPlayers innings={innings} />
                </div>
            </div>

            <div className="col-span-4 min-h-0">
                <RecentBalls
                    recentBalls={recentBalls}
                />
            </div>

            <div className="col-span-3 min-h-0">
                <CompactScorecard
                    scorecard={scorecard}
                />
            </div>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* Mobile Live                                                                */
/* -------------------------------------------------------------------------- */

function MobileLiveView({
    match,
    innings,
    scorecard,
    recentBalls,
    teamA,
    teamB,
    onShowTeams,
}) {
    return (
        <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto_auto] gap-1.5">
            <MatchTeamsStrip
                teamA={teamA}
                teamB={teamB}
            />

            <LiveScoreCard
                match={match}
                innings={innings}
                mobile
            />

            <CurrentPlayers
                innings={innings}
                mobile
            />

            <div className="grid min-h-0 grid-cols-2 gap-1.5">
                <MobileRecentBalls
                    recentBalls={recentBalls}
                />

                <MobileScorecard
                    scorecard={scorecard}
                />
            </div>

            <button
                type="button"
                onClick={onShowTeams}
                className="absolute bottom-2 right-2 hidden"
            >
                Teams
            </button>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* Desktop Completed                                                          */
/* -------------------------------------------------------------------------- */

function DesktopCompletedView({
    match,
    scorecard,
    recentBalls,
    teamA,
    teamB,
}) {
    return (
        <div className="grid h-full min-h-0 grid-cols-12 gap-2">
            <div className="col-span-5 min-h-0">
                <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-2">
                    <MatchTeamsStrip
                        teamA={teamA}
                        teamB={teamB}
                    />

                    <CompletedSummary
                        match={match}
                        scorecard={scorecard}
                    />

                    <PlayingXIGrid
                        teamA={teamA}
                        teamB={teamB}
                    />
                </div>
            </div>

            <div className="col-span-4 min-h-0">
                <RecentBalls
                    recentBalls={recentBalls}
                />
            </div>

            <div className="col-span-3 min-h-0">
                <CompactScorecard
                    scorecard={scorecard}
                />
            </div>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* Mobile Completed                                                           */
/* -------------------------------------------------------------------------- */

function MobileCompletedView({
    match,
    scorecard,
    recentBalls,
    teamA,
    teamB,
    onShowTeams,
}) {
    return (
        <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr_auto] gap-1.5">
            <MatchTeamsStrip
                teamA={teamA}
                teamB={teamB}
            />

            <CompletedSummary
                match={match}
                scorecard={scorecard}
                mobile
            />

            <div className="grid min-h-0 grid-cols-2 gap-1.5">
                <MobileRecentBalls
                    recentBalls={recentBalls}
                />

                <MobileScorecard
                    scorecard={scorecard}
                />
            </div>

            <button
                type="button"
                onClick={onShowTeams}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
                <Users
                    size={13}
                    className="mr-1 inline"
                />
                View Playing XI
            </button>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* Teams                                                                      */
/* -------------------------------------------------------------------------- */

function MatchTeamsStrip({ teamA, teamB }) {
    return (
        <section className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CompactTeam
                team={teamA}
                align="left"
            />

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[8px] font-black text-slate-400 dark:bg-slate-800">
                VS
            </div>

            <CompactTeam
                team={teamB}
                align="right"
            />
        </section>
    )
}

function CompactTeam({ team, align }) {
    if (!team) {
        return (
            <div className={align === 'right' ? 'text-right' : 'text-left'}>
                <p className="text-xs font-black text-slate-400">
                    —
                </p>
            </div>
        )
    }

    return (
        <div
            className={
                align === 'right'
                    ? 'min-w-0 text-right'
                    : 'min-w-0 text-left'
            }
        >
            <p className="truncate text-xs font-black text-slate-950 dark:text-white sm:text-sm">
                {team.name || 'Unknown Team'}
            </p>

            {team.shortName && (
                <p className="mt-0.5 text-[8px] font-black uppercase tracking-wider text-slate-400">
                    {team.shortName}
                </p>
            )}
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* Live Score                                                                 */
/* -------------------------------------------------------------------------- */

function LiveScoreCard({ match, innings, mobile = false }) {
    if (!innings) {
        return (
            <section className="flex min-h-0 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-bold text-slate-400">
                    Score unavailable
                </p>
            </section>
        )
    }

    return (
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-sm dark:border-brand-900/50 dark:bg-slate-900">
            <div className="flex shrink-0 items-center justify-between bg-brand-600 px-3 py-2 text-white sm:px-4">
                <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-brand-100">
                        Innings {innings.inningsNumber}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] font-black">
                        {innings.battingTeam?.name || 'Batting'}
                    </p>
                </div>

                {innings.target != null && (
                    <div className="text-right">
                        <p className="text-[7px] font-black uppercase tracking-wider text-brand-100">
                            Target
                        </p>

                        <p className="text-sm font-black">
                            {innings.target}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-center px-3 py-2 sm:p-5">
                <div className="text-center">
                    <p
                        className={
                            mobile
                                ? 'text-5xl font-black tracking-tight text-slate-950 dark:text-white'
                                : 'text-5xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl'
                        }
                    >
                        {innings.totalRuns}/{innings.totalWickets}
                    </p>

                    <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                        {innings.overs} overs
                    </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5 sm:mt-5 sm:gap-2">
                    <InfoBox
                        label="Batting"
                        value={
                            innings.battingTeam?.shortName ||
                            innings.battingTeam?.name ||
                            '—'
                        }
                    />

                    <InfoBox
                        label="Bowling"
                        value={
                            innings.bowlingTeam?.shortName ||
                            innings.bowlingTeam?.name ||
                            '—'
                        }
                    />
                </div>

                {match?.totalOvers && (
                    <p className="mt-2 text-center text-[8px] font-bold text-slate-400">
                        {match.totalOvers} overs match
                    </p>
                )}
            </div>
        </section>
    )
}

/* -------------------------------------------------------------------------- */
/* Current Players                                                            */
/* -------------------------------------------------------------------------- */

function CurrentPlayers({ innings, mobile = false }) {
    if (!innings) return null

    const hasPlayers =
        innings.striker ||
        innings.nonStriker ||
        innings.currentBowler

    if (!hasPlayers) return null

    return (
        <section className="shrink-0 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-3">
            <div className="grid grid-cols-3 gap-1.5">
                <CurrentPlayer
                    label="Striker"
                    player={innings.striker}
                    mobile={mobile}
                />

                <CurrentPlayer
                    label="Non-Striker"
                    player={innings.nonStriker}
                    mobile={mobile}
                />

                <CurrentPlayer
                    label="Bowler"
                    player={innings.currentBowler}
                    mobile={mobile}
                />
            </div>
        </section>
    )
}

function CurrentPlayer({ label, player, mobile }) {
    return (
        <div className="min-w-0 rounded-xl bg-slate-50 px-1.5 py-1.5 text-center dark:bg-slate-800/70 sm:px-2 sm:py-2">
            <p className="truncate text-[7px] font-black uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-1 truncate text-[9px] font-black text-slate-800 dark:text-slate-200 sm:text-[10px]">
                {player?.name || player?.shortName || '—'}
            </p>

            {!mobile && player?.role && (
                <p className="mt-0.5 truncate text-[7px] font-bold text-slate-400">
                    {player.role}
                </p>
            )}
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* Recent Balls                                                               */
/* -------------------------------------------------------------------------- */

function RecentBalls({ recentBalls }) {
    const visibleBalls = useMemo(
        () => (Array.isArray(recentBalls) ? recentBalls.slice(0, 12) : []),
        [recentBalls],
    )

    return (
        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
            <SectionTitle
                icon={<Eye size={15} />}
                title="Recent Balls"
            />

            {visibleBalls.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-xs font-bold text-slate-400">
                        No balls recorded yet
                    </p>
                </div>
            ) : (
                <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-hidden">
                    {visibleBalls.map((ball) => (
                        <BallEvent
                            key={ball._id}
                            ball={ball}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

function MobileRecentBalls({ recentBalls }) {
    const visibleBalls = Array.isArray(recentBalls)
        ? recentBalls.slice(0, 3)
        : []

    return (
        <section className="min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <SectionTitle
                icon={<Eye size={13} />}
                title="Recent"
            />

            <div className="mt-2 space-y-1">
                {visibleBalls.length === 0 ? (
                    <p className="py-3 text-center text-[8px] font-bold text-slate-400">
                        No balls
                    </p>
                ) : (
                    visibleBalls.map((ball) => (
                        <div
                            key={ball._id}
                            className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-1.5 py-1.5 dark:bg-slate-800/70"
                        >
                            <span className="w-6 shrink-0 text-center text-[7px] font-black text-slate-400">
                                {ball.overNumber}.{ball.ballNumber}
                            </span>

                            <span className="min-w-0 flex-1 truncate text-[8px] font-bold text-slate-700 dark:text-slate-300">
                                {ball.striker?.shortName ||
                                    ball.striker?.name ||
                                    '—'}
                            </span>

                            <span
                                className={[
                                    'flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md px-1',
                                    'text-[8px] font-black',
                                    getBallResultClass(ball),
                                ].join(' ')}
                            >
                                {getBallResult(ball)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}

function BallEvent({ ball }) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center gap-2">
                <div className="w-9 shrink-0 text-center">
                    <p className="text-[7px] font-black uppercase text-slate-400">
                        Ball
                    </p>

                    <p className="text-[10px] font-black text-slate-700 dark:text-slate-200">
                        {ball.overNumber}.{ball.ballNumber}
                    </p>
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-black text-slate-800 dark:text-slate-200">
                        {ball.striker?.name || 'Unknown striker'}
                    </p>

                    <p className="truncate text-[8px] font-semibold text-slate-400">
                        {ball.bowler?.name || 'Unknown bowler'}
                    </p>
                </div>

                <div
                    className={[
                        'flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg px-1.5',
                        'text-[9px] font-black',
                        getBallResultClass(ball),
                    ].join(' ')}
                >
                    {getBallResult(ball)}
                </div>
            </div>

            <div className="mt-1.5 flex flex-wrap gap-1">
                <MiniTag>
                    Bat {ball.runs?.batter ?? 0}
                </MiniTag>

                <MiniTag>
                    Extra {ball.runs?.extras ?? 0}
                </MiniTag>

                <MiniTag>
                    Total {ball.runs?.total ?? 0}
                </MiniTag>

                {ball.wicket?.isWicket && (
                    <MiniTag variant="danger">
                        {ball.wicket.kind || 'WICKET'}
                    </MiniTag>
                )}
            </div>

            {ball.commentary && (
                <p className="mt-1.5 truncate text-[8px] font-semibold text-slate-400">
                    {ball.commentary}
                </p>
            )}
        </div>
    )
}

function getBallResult(ball) {
    if (ball.wicket?.isWicket) {
        return 'W'
    }

    if (
        ball.extras?.type &&
        ball.extras.type !== 'NONE'
    ) {
        const extraRuns = ball.extras.runs || 0

        if (ball.extras.type === 'WIDE') {
            return extraRuns > 1
                ? `WD+${extraRuns - 1}`
                : 'WD'
        }

        if (ball.extras.type === 'NO_BALL') {
            return extraRuns > 1
                ? `NB+${extraRuns - 1}`
                : 'NB'
        }

        if (ball.extras.type === 'BYE') {
            return `B${extraRuns}`
        }

        if (ball.extras.type === 'LEG_BYE') {
            return `LB${extraRuns}`
        }

        return `${ball.extras.type} ${extraRuns}`
    }

    return String(ball.runs?.total ?? 0)
}

function getBallResultClass(ball) {
    if (ball.wicket?.isWicket) {
        return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
    }

    if (ball.runs?.total === 6) {
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400'
    }

    if (ball.runs?.total === 4) {
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
    }

    if (
        ball.extras?.type &&
        ball.extras.type !== 'NONE'
    ) {
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
    }

    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

function MiniTag({ children, variant = 'default' }) {
    const classes = {
        default:
            'bg-white text-slate-400 dark:bg-slate-900',
        danger:
            'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
        warning:
            'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    }

    return (
        <span
            className={[
                'rounded-md px-1.5 py-0.5 text-[7px] font-black',
                classes[variant],
            ].join(' ')}
        >
            {children}
        </span>
    )
}

/* -------------------------------------------------------------------------- */
/* Scorecard                                                                  */
/* -------------------------------------------------------------------------- */

function CompactScorecard({ scorecard }) {
    return (
        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
            <SectionTitle
                icon={<Trophy size={15} />}
                title="Scorecard"
            />

            {scorecard.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-xs font-bold text-slate-400">
                        Scorecard unavailable
                    </p>
                </div>
            ) : (
                <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-hidden">
                    {scorecard.map((inning) => (
                        <CompactInning
                            key={inning.id}
                            inning={inning}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

function MobileScorecard({ scorecard }) {
    return (
        <section className="min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <SectionTitle
                icon={<Trophy size={13} />}
                title="Scorecard"
            />

            <div className="mt-2 space-y-1.5">
                {scorecard.length === 0 ? (
                    <p className="py-3 text-center text-[8px] font-bold text-slate-400">
                        No scorecard
                    </p>
                ) : (
                    scorecard.map((inning) => (
                        <CompactInning
                            key={inning.id}
                            inning={inning}
                            mobile
                        />
                    ))
                )}
            </div>
        </section>
    )
}

function CompactInning({ inning, mobile = false }) {
    const score = inning.score

    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[7px] font-black uppercase tracking-wider text-slate-400">
                        Innings {inning.inningsNumber}
                    </p>

                    <p className="mt-0.5 truncate text-[9px] font-black text-slate-800 dark:text-slate-200">
                        {inning.battingTeam?.shortName ||
                            inning.battingTeam?.name ||
                            'Batting'}
                    </p>
                </div>

                {score && (
                    <div className="shrink-0 text-right">
                        <p
                            className={
                                mobile
                                    ? 'text-xs font-black text-slate-950 dark:text-white'
                                    : 'text-sm font-black text-slate-950 dark:text-white'
                            }
                        >
                            {score.runs}/{score.wickets}
                        </p>

                        <p className="text-[7px] font-bold text-slate-400">
                            {score.overs}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-1.5 grid grid-cols-2 gap-1">
                <ScoreStat
                    label="Bat"
                    value={inning.batting?.length ?? 0}
                />

                <ScoreStat
                    label="Bowl"
                    value={inning.bowling?.length ?? 0}
                />

                <ScoreStat
                    label="Extras"
                    value={inning.extras?.total ?? 0}
                />

                <ScoreStat
                    label="FOW"
                    value={inning.fallOfWickets?.length ?? 0}
                />
            </div>
        </div>
    )
}

function ScoreStat({ label, value }) {
    return (
        <div className="rounded-lg bg-white px-1.5 py-1 text-center dark:bg-slate-900">
            <p className="text-[6px] font-black uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-0.5 text-[8px] font-black text-slate-700 dark:text-slate-300">
                {value}
            </p>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* Completed                                                                  */
/* -------------------------------------------------------------------------- */

function CompletedSummary({ match, scorecard, mobile = false }) {
    return (
        <section
            className={
                mobile
                    ? 'shrink-0 overflow-hidden rounded-2xl border border-brand-200 bg-brand-50 p-2.5 dark:border-brand-900/50 dark:bg-brand-950/20'
                    : 'shrink-0 overflow-hidden rounded-2xl border border-brand-200 bg-brand-50 p-3 dark:border-brand-900/50 dark:bg-brand-950/20'
            }
        >
            <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-400">
                    <Trophy size={17} />
                </div>

                <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.16em] text-brand-700 dark:text-brand-400">
                        Match Completed
                    </p>

                    <p className="mt-0.5 truncate text-sm font-black text-slate-950 dark:text-white">
                        {match?.winner?.name ||
                            match?.winner?.shortName ||
                            'Match Completed'}
                    </p>
                </div>
            </div>

            {match?.result && (
                <div className="mt-2 rounded-xl bg-white px-3 py-2 dark:bg-slate-900">
                    <p className="truncate text-[9px] font-black text-brand-700 dark:text-brand-400">
                        {match.result}
                    </p>
                </div>
            )}

            {scorecard.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {scorecard.map((inning) => (
                        <div
                            key={inning.id}
                            className="rounded-xl bg-white px-2 py-1.5 text-center dark:bg-slate-900"
                        >
                            <p className="truncate text-[7px] font-black uppercase text-slate-400">
                                {inning.battingTeam?.shortName ||
                                    inning.battingTeam?.name ||
                                    `Innings ${inning.inningsNumber}`}
                            </p>

                            {inning.score && (
                                <p className="mt-0.5 text-xs font-black text-slate-900 dark:text-white">
                                    {inning.score.runs}/{inning.score.wickets}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

/* -------------------------------------------------------------------------- */
/* Playing XI                                                                  */
/* -------------------------------------------------------------------------- */

function PlayingXIGrid({ teamA, teamB }) {
    return (
        <section className="grid h-full min-h-0 grid-cols-2 gap-2 overflow-hidden">
            <TeamSquad team={teamA} />
            <TeamSquad team={teamB} />
        </section>
    )
}

function TeamSquad({ team }) {
    if (!team) return null

    const playingXI = team.playingXI || []
    const notPlaying = team.notPlaying || []

    return (
        <div className="min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-950 dark:text-white">
                        {team.name || 'Team'}
                    </p>

                    {team.shortName && (
                        <p className="text-[8px] font-black uppercase text-slate-400">
                            {team.shortName}
                        </p>
                    )}
                </div>

                <span className="shrink-0 rounded-lg bg-brand-50 px-2 py-1 text-[8px] font-black text-brand-700 dark:bg-brand-950/40 dark:text-brand-400">
                    {playingXI.length} Playing
                </span>
            </div>

            <div className="mt-2 min-h-0 overflow-hidden">
                <div className="grid gap-1">
                    {playingXI.map((player) => (
                        <div
                            key={player.id}
                            className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/70"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-[9px] font-bold text-slate-700 dark:text-slate-300">
                                    {player.name}
                                </p>

                                <p className="truncate text-[7px] font-bold uppercase text-slate-400">
                                    {player.role}
                                </p>
                            </div>

                            <div className="flex shrink-0 gap-1">
                                {player.isCaptain && (
                                    <span className="rounded bg-amber-100 px-1 py-0.5 text-[7px] font-black text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                                        C
                                    </span>
                                )}

                                {player.isWicketKeeper && (
                                    <span className="rounded bg-blue-100 px-1 py-0.5 text-[7px] font-black text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                                        WK
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {notPlaying.length > 0 && (
                    <div className="mt-2">
                        <p className="text-[7px] font-black uppercase text-slate-400">
                            Not Playing
                        </p>

                        <div className="mt-1 grid grid-cols-2 gap-1">
                            {notPlaying.map((player) => (
                                <div
                                    key={player.id}
                                    className="truncate rounded-lg bg-slate-50 px-2 py-1.5 text-[8px] font-bold text-slate-400 dark:bg-slate-800/70"
                                >
                                    {player.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* Teams Modal - Mobile                                                       */
/* -------------------------------------------------------------------------- */

function TeamsModal({ teamA, teamB, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm">
            <div className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                    <div>
                        <p className="text-xs font-black text-slate-950 dark:text-white">
                            Playing XI
                        </p>

                        <p className="text-[9px] font-bold text-slate-400">
                            Team squads
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="min-h-0 overflow-y-auto p-3">
                    <div className="grid gap-3">
                        <MobileTeamList team={teamA} />
                        <MobileTeamList team={teamB} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function MobileTeamList({ team }) {
    if (!team) return null

    const playingXI = team.playingXI || []
    const notPlaying = team.notPlaying || []

    return (
        <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                        {team.name}
                    </p>

                    {team.shortName && (
                        <p className="text-[8px] font-black uppercase text-slate-400">
                            {team.shortName}
                        </p>
                    )}
                </div>

                <span className="shrink-0 rounded-lg bg-brand-50 px-2 py-1 text-[8px] font-black text-brand-700 dark:bg-brand-950/40 dark:text-brand-400">
                    {playingXI.length} Playing
                </span>
            </div>

            <div className="mt-2 grid gap-1">
                {playingXI.map((player) => (
                    <div
                        key={player.id}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-slate-800/70"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                {player.name}
                            </p>

                            <p className="text-[7px] font-bold uppercase text-slate-400">
                                {player.role}
                            </p>
                        </div>

                        <div className="flex shrink-0 gap-1">
                            {player.isCaptain && (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[7px] font-black text-amber-700">
                                    C
                                </span>
                            )}

                            {player.isWicketKeeper && (
                                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[7px] font-black text-blue-700">
                                    WK
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {notPlaying.length > 0 && (
                <div className="mt-3">
                    <p className="text-[8px] font-black uppercase text-slate-400">
                        Not Playing
                    </p>

                    <div className="mt-1 grid grid-cols-2 gap-1">
                        {notPlaying.map((player) => (
                            <div
                                key={player.id}
                                className="truncate rounded-lg bg-slate-50 px-2 py-1.5 text-[8px] font-bold text-slate-400 dark:bg-slate-800/70"
                            >
                                {player.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

function StatusPanel({
    icon,
    title,
    description,
    detail,
}) {
    return (
        <div className="flex min-h-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
            <div className="px-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                    {icon}
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
                    {title}
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                    {description}
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {detail}
                </p>
            </div>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* Small helpers                                                              */
/* -------------------------------------------------------------------------- */

function InfoBox({ label, value }) {
    return (
        <div className="rounded-xl bg-slate-50 px-2 py-2 text-center dark:bg-slate-800/70">
            <p className="text-[7px] font-black uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-0.5 truncate text-[9px] font-black text-slate-700 dark:text-slate-200">
                {value}
            </p>
        </div>
    )
}

function SectionTitle({ icon, title }) {
    return (
        <div className="flex shrink-0 items-center gap-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                {icon}
            </div>

            <h2 className="text-[10px] font-black text-slate-900 dark:text-white">
                {title}
            </h2>
        </div>
    )
}

export default PublicMatch