import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft,
    Award,
    CircleDot,
    Shield,
    Trophy,
    Users,
} from 'lucide-react'

import { getMatchScorecard } from '../../services/api/scoring.api'

function MatchScorecard() {
    const { matchId } = useParams()
    const navigate = useNavigate()

    const [scorecard, setScorecard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchScorecard = async () => {
            try {
                setLoading(true)
                setError('')

                const response = await getMatchScorecard(matchId)

                if (!response.success) {
                    throw new Error(
                        response.message ||
                            'Unable to load scorecard.',
                    )
                }

                setScorecard(response.data)
            } catch (err) {
                setError(
                    err?.response?.data?.message ||
                        err?.message ||
                        'Unable to load scorecard.',
                )
            } finally {
                setLoading(false)
            }
        }

        fetchScorecard()
    }, [matchId])

    if (loading) {
        return (
            <main className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mx-auto flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                        <CircleDot
                            size={22}
                            className="text-slate-400"
                        />
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                        Loading scorecard...
                    </p>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5 lg:px-8">
                <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm dark:border-rose-900/50 dark:bg-slate-900">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                        <Award size={22} />
                    </div>

                    <p className="mt-4 text-sm font-bold text-rose-600 dark:text-rose-400">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate('/matches')}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-700 dark:hover:text-brand-400"
                    >
                        <ArrowLeft size={16} />
                        Back to Matches
                    </button>
                </div>
            </main>
        )
    }

    if (!scorecard) {
        return (
            <main className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                        <Award size={22} />
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                        Scorecard not found.
                    </p>
                </div>
            </main>
        )
    }

    const { match, innings, result } = scorecard

    return (
        <main className="mx-auto w-full min-w-0 max-w-7xl space-y-6 overflow-x-hidden px-3 pb-8 sm:space-y-8 sm:px-5 lg:px-8">
            {/* Back Button */}
            <button
                type="button"
                onClick={() => navigate('/matches')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:text-brand-400"
            >
                <ArrowLeft size={16} />
                Back to Matches
            </button>

            {/* Match Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-brand-500/5 blur-3xl" />

                <div className="relative p-5 sm:p-8 lg:p-10">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                                    <CircleDot size={12} />
                                    Match Scorecard
                                </span>

                                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {match.status}
                                </span>
                            </div>

                            <h1 className="break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl dark:text-white">
                                {match.title}
                            </h1>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Complete match summary, batting and bowling
                                performance.
                            </p>
                        </div>

                        {result?.winner && (
                            <div className="w-full shrink-0 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 dark:border-brand-900/60 dark:bg-brand-950/20 sm:w-auto">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                                        <Trophy size={21} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
                                            Winner
                                        </p>

                                        <p className="mt-0.5 break-words text-base font-black text-slate-950 dark:text-white">
                                            {result.winner.name}
                                        </p>

                                        {result.margin && (
                                            <p className="mt-0.5 break-words text-xs font-bold text-slate-500 dark:text-slate-400">
                                                Won by {result.margin}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Innings */}
            {innings.map((inning) => (
                <section
                    key={inning.inningsNumber}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                    {/* Innings Header */}
                    <div className="relative overflow-hidden border-b border-slate-200 p-5 sm:p-7 dark:border-slate-800">
                        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />

                        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                                    <Shield size={23} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
                                        Innings {inning.inningsNumber}
                                    </p>

                                    <h2 className="mt-1 break-words text-xl font-black text-slate-950 sm:text-2xl dark:text-white">
                                        {inning.team.name}
                                    </h2>
                                </div>
                            </div>

                            <div className="flex items-end gap-5">
                                <div>
                                    <p className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                                        {inning.score.runs}/
                                        {inning.score.wickets}
                                    </p>

                                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Score
                                    </p>
                                </div>

                                <div className="border-l border-slate-200 pl-5 dark:border-slate-700">
                                    <p className="text-xl font-black text-slate-800 dark:text-slate-200">
                                        {inning.score.overs}
                                    </p>

                                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Overs
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Batting Header */}
                    <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                        <div className="flex items-center gap-2">
                            <Users
                                size={15}
                                className="text-slate-500 dark:text-slate-400"
                            />

                            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
                                Batting
                            </span>
                        </div>
                    </div>

                    {/* ==================== DESKTOP BATTING ==================== */}
                    <div className="hidden overflow-hidden sm:block">
                        <table className="w-full table-fixed">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="w-[30%] px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                        Batter
                                    </th>

                                    <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                        R
                                    </th>

                                    <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                        B
                                    </th>

                                    <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                        4s
                                    </th>

                                    <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                        6s
                                    </th>

                                    <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                        SR
                                    </th>

                                    <th className="w-[25%] px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                        Dismissal
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {inning.batting.map((batter) => (
                                    <tr
                                        key={batter.player._id}
                                        className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800/70 dark:hover:bg-slate-800/40"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                    <Users size={15} />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="break-words text-sm font-black text-slate-900 dark:text-white">
                                                        {batter.player.name}
                                                    </p>

                                                    {batter.player.shortName && (
                                                        <p className="mt-0.5 break-words text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            {
                                                                batter.player
                                                                    .shortName
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-3 py-4 text-right">
                                            <span className="text-sm font-black text-slate-950 dark:text-white">
                                                {batter.runs}
                                            </span>
                                        </td>

                                        <td className="px-3 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                                            {batter.balls}
                                        </td>

                                        <td className="px-3 py-4 text-right text-sm font-bold text-blue-600 dark:text-blue-400">
                                            {batter.fours}
                                        </td>

                                        <td className="px-3 py-4 text-right text-sm font-bold text-violet-600 dark:text-violet-400">
                                            {batter.sixes}
                                        </td>

                                        <td className="px-3 py-4 text-right">
                                            <span className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-black text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                                                {batter.strikeRate}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={
                                                    batter.dismissal ===
                                                    'Not Out'
                                                        ? 'break-words text-xs font-bold text-brand-600 dark:text-brand-400'
                                                        : 'break-words text-xs font-semibold text-slate-500 dark:text-slate-400'
                                                }
                                            >
                                                {batter.dismissal}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ==================== MOBILE BATTING ==================== */}
                    <div className="space-y-3 p-3 sm:hidden">
                        {inning.batting.map((batter) => (
                            <div
                                key={batter.player._id}
                                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"
                            >
                                {/* Batter Identity */}
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                                        <Users size={16} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="break-words text-sm font-black leading-5 text-slate-900 dark:text-white">
                                            {batter.player.name}
                                        </p>

                                        {batter.player.shortName && (
                                            <p className="mt-0.5 break-words text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                {batter.player.shortName}
                                            </p>
                                        )}
                                    </div>

                                    <span
                                        className={
                                            batter.dismissal === 'Not Out'
                                                ? 'shrink-0 rounded-lg bg-brand-100 px-2 py-1 text-[10px] font-black text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                                                : 'shrink-0 rounded-lg bg-slate-200 px-2 py-1 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                        }
                                    >
                                        {batter.dismissal === 'Not Out'
                                            ? 'NOT OUT'
                                            : 'OUT'}
                                    </span>
                                </div>

                                {/* Main Stats */}
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                            Runs
                                        </p>

                                        <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                                            {batter.runs}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                            Balls
                                        </p>

                                        <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                                            {batter.balls}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-950/30">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
                                            Strike Rate
                                        </p>

                                        <p className="mt-1 text-lg font-black text-brand-700 dark:text-brand-300">
                                            {batter.strikeRate}
                                        </p>
                                    </div>
                                </div>

                                {/* Boundary Stats */}
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 dark:bg-slate-900">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Fours
                                        </span>

                                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                                            {batter.fours}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 dark:bg-slate-900">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Sixes
                                        </span>

                                        <span className="text-sm font-black text-violet-600 dark:text-violet-400">
                                            {batter.sixes}
                                        </span>
                                    </div>
                                </div>

                                {/* Dismissal */}
                                <div className="mt-2 rounded-xl bg-white px-3 py-3 dark:bg-slate-900">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                        Dismissal
                                    </p>

                                    <p
                                        className={
                                            batter.dismissal === 'Not Out'
                                                ? 'mt-1 break-words text-xs font-bold text-brand-600 dark:text-brand-400'
                                                : 'mt-1 break-words text-xs font-semibold text-slate-600 dark:text-slate-300'
                                        }
                                    >
                                        {batter.dismissal}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Extras */}
                    <div className="border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-7">
                            <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                    Extras
                                </p>

                                <p className="mt-1 hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
                                    Additional runs conceded during the
                                    innings
                                </p>
                            </div>

                            <div className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                    {inning.extras.total}
                                </span>

                                <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Total
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 border-t border-slate-100 sm:grid-cols-5 dark:border-slate-800/70">
                            {[
                                ['Wd', inning.extras.wides],
                                ['Nb', inning.extras.noBalls],
                                ['B', inning.extras.byes],
                                ['LB', inning.extras.legByes],
                                ['P', inning.extras.penalty],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="border-b border-slate-100 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 dark:border-slate-800/70"
                                >
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                        {label}
                                    </p>

                                    <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                                        {value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bowling Header */}
                    <div className="border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 px-5 py-4 sm:px-7">
                            <CircleDot
                                size={15}
                                className="text-brand-600 dark:text-brand-400"
                            />

                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
                                Bowling
                            </p>
                        </div>

                        {/* ==================== DESKTOP BOWLING ==================== */}
                        <div className="hidden overflow-hidden sm:block">
                            <table className="w-full table-fixed">
                                <thead>
                                    <tr className="border-y border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40">
                                        <th className="w-[40%] px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                            Bowler
                                        </th>

                                        <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                            O
                                        </th>

                                        <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                            M
                                        </th>

                                        <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                            R
                                        </th>

                                        <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                            W
                                        </th>

                                        <th className="w-[18%] px-5 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                            Econ
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {inning.bowling.map((bowler) => (
                                        <tr
                                            key={bowler.player._id}
                                            className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800/70 dark:hover:bg-slate-800/40"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                                                        <CircleDot size={15} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="break-words text-sm font-black text-slate-900 dark:text-white">
                                                            {
                                                                bowler.player
                                                                    .name
                                                            }
                                                        </p>

                                                        {bowler.player
                                                            .shortName && (
                                                            <p className="mt-0.5 break-words text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                {
                                                                    bowler
                                                                        .player
                                                                        .shortName
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-3 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {bowler.overs}
                                            </td>

                                            <td className="px-3 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                {bowler.maidens}
                                            </td>

                                            <td className="px-3 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {bowler.runs}
                                            </td>

                                            <td className="px-3 py-4 text-right">
                                                <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-red-50 px-2 py-1 text-xs font-black text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                                    {bowler.wickets}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <span className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-black text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                                                    {bowler.economy}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ==================== MOBILE BOWLING ==================== */}
                        <div className="space-y-3 p-3 sm:hidden">
                            {inning.bowling.map((bowler) => (
                                <div
                                    key={bowler.player._id}
                                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"
                                >
                                    {/* Bowler Identity */}
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                                            <CircleDot size={16} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="break-words text-sm font-black leading-5 text-slate-900 dark:text-white">
                                                {bowler.player.name}
                                            </p>

                                            {bowler.player.shortName && (
                                                <p className="mt-0.5 break-words text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    {
                                                        bowler.player
                                                            .shortName
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="shrink-0 rounded-lg bg-brand-50 px-2.5 py-1.5 dark:bg-brand-950/40">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 dark:text-brand-300">
                                                {bowler.economy} Econ
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bowling Stats */}
                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                Overs
                                            </p>

                                            <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                                                {bowler.overs}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                Maidens
                                            </p>

                                            <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                                                {bowler.maidens}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                Runs
                                            </p>

                                            <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                                                {bowler.runs}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        <div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
                                            <p className="text-[9px] font-black uppercase tracking-wider text-red-500 dark:text-red-400">
                                                Wickets
                                            </p>

                                            <p className="mt-1 text-lg font-black text-red-600 dark:text-red-400">
                                                {bowler.wickets}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-950/30">
                                            <p className="text-[9px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
                                                Economy
                                            </p>

                                            <p className="mt-1 text-lg font-black text-brand-700 dark:text-brand-300">
                                                {bowler.economy}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fall of Wickets */}
                    <div className="border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 px-5 py-4 sm:px-7">
                            <Award
                                size={16}
                                className="text-rose-500 dark:text-rose-400"
                            />

                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
                                Fall of Wickets
                            </p>
                        </div>

                        {inning.fallOfWickets.length > 0 ? (
                            <>
                                {/* ==================== DESKTOP FOW ==================== */}
                                <div className="hidden overflow-hidden sm:block">
                                    <table className="w-full table-fixed">
                                        <thead>
                                            <tr className="border-y border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40">
                                                <th className="w-[15%] px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                                    Wkt
                                                </th>

                                                <th className="w-[45%] px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                                    Player
                                                </th>

                                                <th className="w-[20%] px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                                    Score
                                                </th>

                                                <th className="w-[20%] px-5 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                                    Over
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {inning.fallOfWickets.map(
                                                (wicket) => (
                                                    <tr
                                                        key={
                                                            wicket.wicketNumber
                                                        }
                                                        className="border-b border-slate-100 last:border-0 dark:border-slate-800/70"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-rose-50 px-2 text-xs font-black text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                                                                {
                                                                    wicket.wicketNumber
                                                                }
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                                    <Award
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </div>

                                                                <span className="break-words text-sm font-bold text-slate-800 dark:text-slate-200">
                                                                    {
                                                                        wicket
                                                                            .player
                                                                            .name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-4 text-right">
                                                            <span className="text-sm font-black text-slate-900 dark:text-white">
                                                                {
                                                                    wicket.score
                                                                }
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-4 text-right">
                                                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                                {wicket.over}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ==================== MOBILE FOW ==================== */}
                                <div className="space-y-3 p-3 sm:hidden">
                                    {inning.fallOfWickets.map((wicket) => (
                                        <div
                                            key={wicket.wicketNumber}
                                            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                                                    <span className="text-sm font-black">
                                                        {
                                                            wicket.wicketNumber
                                                        }
                                                    </span>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                        Wicket
                                                    </p>

                                                    <p className="mt-1 break-words text-sm font-black leading-5 text-slate-900 dark:text-white">
                                                        {wicket.player.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                                                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                        Score
                                                    </p>

                                                    <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                                                        {wicket.score}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                                                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                        Over
                                                    </p>

                                                    <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                                                        {wicket.over}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center px-5 py-8 text-center sm:py-10">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                    <Award size={18} />
                                </div>

                                <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                                    No wickets
                                </p>

                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                    No wickets were recorded in this innings.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            ))}
        </main>
    )
}

export default MatchScorecard