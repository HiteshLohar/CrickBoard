import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CircleDot,
  Shield,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getPlayers } from '../../services/api/players.api'
import { getTeams } from '../../services/api/teams.api'
import { getMatches } from '../../services/api/matches.api'

import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Skeleton from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'

function Dashboard() {
  const navigate = useNavigate()

  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboardData = async () => {
    setLoading(true)
    setError('')

    try {
      const [playersResponse, teamsResponse, matchesResponse] =
        await Promise.all([
          getPlayers(),
          getTeams(),
          getMatches(),
        ])

      if (!playersResponse.success) {
        throw new Error(
          playersResponse.message || 'Failed to fetch players',
        )
      }

      if (!teamsResponse.success) {
        throw new Error(
          teamsResponse.message || 'Failed to fetch teams',
        )
      }

      if (!matchesResponse.success) {
        throw new Error(
          matchesResponse.message || 'Failed to fetch matches',
        )
      }

      setPlayers(playersResponse.data || [])
      setTeams(teamsResponse.data || [])
      setMatches(matchesResponse.data || [])
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          'Unable to load dashboard data.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const liveMatches = matches.filter(
    (match) => match.status === 'LIVE',
  )

  const completedMatches = matches.filter(
    (match) => match.status === 'COMPLETED',
  )

  const recentMatches = [...matches].slice(0, 6)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'LIVE':
        return <Badge variant="live">LIVE</Badge>

      case 'COMPLETED':
        return <Badge variant="success">COMPLETED</Badge>

      case 'DRAFT':
        return <Badge variant="warning">DRAFT</Badge>

      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <section className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <div className="space-y-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-16" />
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <div className="space-y-5">
            <Skeleton className="h-7 w-48" />

            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-28 w-full rounded-xl"
              />
            ))}
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

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
        </div>

        <ErrorState
          title="Unable to load dashboard"
          description={error}
          onRetry={loadDashboardData}
        />
      </section>
    )
  }

  return (
    <section className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Activity className="h-4 w-4" />
              </span>

              <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Cricket Command Center
              </p>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Welcome to CrickBoard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Manage your players, teams and matches from one powerful
              cricket workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/matches/create')}
              className="shadow-lg shadow-brand-600/20"
            >
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Create Match
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/matches')}
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                View Matches
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Players"
          value={players.length}
          description="Registered players"
          iconClass="text-blue-600 bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400"
        />

        <StatCard
          icon={Shield}
          label="Teams"
          value={teams.length}
          description="Active teams"
          iconClass="text-violet-600 bg-violet-100 dark:bg-violet-500/10 dark:text-violet-400"
        />

        <StatCard
          icon={CalendarDays}
          label="Matches"
          value={matches.length}
          description="Total matches"
          iconClass="text-brand-600 bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
        />

        <StatCard
          icon={Trophy}
          label="Completed"
          value={completedMatches.length}
          description="Finished matches"
          iconClass="text-amber-600 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400"
        />
      </div>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Live Now
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Matches currently in progress
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {liveMatches.map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                statusBadge={getStatusBadge(match.status)}
                onOpen={() =>
                  navigate(`/matches/${match._id}/live`)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Matches */}
      <Card padding="p-0">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Recent Matches
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Latest activity across your cricket matches
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/matches')}
          >
            <span className="flex items-center gap-1.5">
              View all
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </div>

        {recentMatches.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={CircleDot}
              title="No matches yet"
              description="Create your first match to start scoring."
              actionLabel="Create Match"
              onAction={() => navigate('/matches/create')}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {recentMatches.map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                statusBadge={getStatusBadge(match.status)}
                onOpen={() => {
                  if (match.status === 'LIVE') {
                    navigate(`/matches/${match._id}/live`)
                  } else if (match.status === 'COMPLETED') {
                    navigate(
                      `/matches/${match._id}/scorecard`,
                    )
                  } else {
                    navigate(`/matches/${match._id}/setup`)
                  }
                }}
                compact
              />
            ))}
          </div>
        )}
      </Card>
    </section>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <Card className="group hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <ArrowRight className="h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-1 dark:text-slate-700" />
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </Card>
  )
}

function MatchCard({
  match,
  statusBadge,
  onOpen,
  compact = false,
}) {
  return (
    <article
      className={[
        'group cursor-pointer transition-all duration-200',
        compact
          ? 'px-5 py-5 hover:bg-slate-50 dark:hover:bg-slate-900/70'
          : 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900',
      ].join(' ')}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {match.matchCode && (
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {match.matchCode}
              </span>
            )}

            {statusBadge}
          </div>

          <h3 className="mt-2 truncate text-base font-bold text-slate-900 dark:text-white">
            {match.title || 'Untitled Match'}
          </h3>
        </div>

        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-1 dark:text-slate-700" />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <TeamBlock
          name={match.teamA?.name}
          shortName={match.teamA?.shortName}
        />

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-800">
          VS
        </div>

        <TeamBlock
          name={match.teamB?.name}
          shortName={match.teamB?.shortName}
          align="right"
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/70">
        <MatchInfo
          label="Overs"
          value={match.totalOvers ?? '—'}
        />

        <MatchInfo
          label="Players"
          value={match.playersPerTeam ?? '—'}
        />

        <MatchInfo
          label="Toss"
          value={match.toss?.decision || '—'}
        />
      </div>

      {match.result && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />

          <span className="font-medium text-slate-500 dark:text-slate-400">
            Result
          </span>

          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {match.result}
          </span>
        </div>
      )}
    </article>
  )
}

function TeamBlock({ name, shortName, align = 'left' }) {
  return (
    <div
      className={[
        'min-w-0 flex-1',
        align === 'right' ? 'text-right' : 'text-left',
      ].join(' ')}
    >
      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
        {name || 'Unknown Team'}
      </p>

      <p className="mt-0.5 text-xs font-medium text-slate-400">
        {shortName || '—'}
      </p>
    </div>
  )
}

function MatchInfo({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  )
}

export default Dashboard