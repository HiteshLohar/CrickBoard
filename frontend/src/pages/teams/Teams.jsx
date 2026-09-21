import { useEffect, useMemo, useRef, useState } from 'react'
import {
    Check,
    Edit3,
    Plus,
    Search,
    Shield,
    UserPlus,
    Users,
    X,
} from 'lucide-react'

import {
    getTeams,
    createTeam,
    updateTeam,
    addPlayerToTeam,
    removePlayerFromTeam,
} from '../../services/api/teams.api'

import { getPlayers } from '../../services/api/players.api'

import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'

const MIN_PLAYERS = 5
const MAX_PLAYERS = 14

const initialTeamForm = {
    name: '',
    shortName: '',
    logo: '',
}

function Teams() {
    const searchParams = new URLSearchParams(
        window.location.search,
    )

    const excludeTeamId =
        searchParams.get('excludeTeam') || null

    const excludePlayerIds = (
        searchParams.get('excludePlayers') || ''
    )
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)

    const [teams, setTeams] = useState([])
    const [players, setPlayers] = useState([])

    const [formData, setFormData] =
        useState(initialTeamForm)

    const [selectedPlayers, setSelectedPlayers] =
        useState([])

    const [editingTeamId, setEditingTeamId] =
        useState(null)

    const [editFormData, setEditFormData] =
        useState(initialTeamForm)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [highlightedTeamId, setHighlightedTeamId] =
        useState(null)

    const [updating, setUpdating] = useState(false)
    const [addingPlayer, setAddingPlayer] =
        useState(false)

    const [removingPlayer, setRemovingPlayer] =
        useState(false)

    const [createPlayerSearch, setCreatePlayerSearch] =
        useState('')

    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] =
        useState('')

    const loadTeamsAndPlayers = async () => {
        setLoading(true)
        setError('')

        try {
            const [
                teamsResponse,
                playersResponse,
            ] = await Promise.all([
                getTeams(),
                getPlayers(),
            ])

            if (!teamsResponse.success) {
                throw new Error(
                    teamsResponse.message ||
                    'Failed to fetch teams',
                )
            }

            if (!playersResponse.success) {
                throw new Error(
                    playersResponse.message ||
                    'Failed to fetch players',
                )
            }

            setTeams(teamsResponse.data || [])
            setPlayers(playersResponse.data || [])
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to load teams.',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTeamsAndPlayers()
    }, [])

    /*
     * When Teams is opened from another page with:
     *
     * /teams#team-TEAM_ID
     *
     * scroll to that team and highlight it.
     */
    useEffect(() => {
        if (loading || teams.length === 0) return

        const hash = window.location.hash

        if (!hash.startsWith('#team-')) return

        const teamId = hash.replace('#team-', '')

        const target = document.getElementById(
            `team-${teamId}`,
        )

        if (!target) return

        setHighlightedTeamId(teamId)

        const scrollTimer = window.setTimeout(() => {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 100)

        const highlightTimer = window.setTimeout(() => {
            setHighlightedTeamId(null)
        }, 3000)

        return () => {
            window.clearTimeout(scrollTimer)
            window.clearTimeout(highlightTimer)
        }
    }, [loading, teams])

    const filteredCreatePlayers = useMemo(() => {
        const query =
            createPlayerSearch.trim().toLowerCase()

        if (!query) {
            return players
        }

        return players.filter(
            (player) =>
                player.name
                    ?.toLowerCase()
                    .includes(query) ||
                player.shortName
                    ?.toLowerCase()
                    .includes(query),
        )
    }, [players, createPlayerSearch])

    const handleCreateChange = (event) => {
        const { name, value } = event.target

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }))
    }

    const handleEditChange = (event) => {
        const { name, value } = event.target

        setEditFormData((previous) => ({
            ...previous,
            [name]: value,
        }))
    }

    const togglePlayer = (playerId) => {
        setError('')
        setSuccessMessage('')

        setSelectedPlayers((previous) => {
            if (previous.includes(playerId)) {
                return previous.filter(
                    (id) => id !== playerId,
                )
            }

            if (previous.length >= MAX_PLAYERS) {
                setError(
                    `A team can have maximum ${MAX_PLAYERS} players.`,
                )

                return previous
            }

            return [...previous, playerId]
        })
    }

    const handleCreateSubmit = async (event) => {
        event.preventDefault()

        setError('')
        setSuccessMessage('')

        if (selectedPlayers.length < MIN_PLAYERS) {
            setError(
                `Please select at least ${MIN_PLAYERS} players.`,
            )

            return
        }

        setSubmitting(true)

        try {
            const response = await createTeam({
                name: formData.name.trim(),
                shortName: formData.shortName.trim(),
                logo: formData.logo.trim(),
                players: selectedPlayers,
            })

            if (!response.success) {
                throw new Error(
                    response.message ||
                    'Failed to create team',
                )
            }

            /*
             * Notify other tabs, such as MatchSetup.
             */
            window.localStorage.setItem(
                'crickboard-teams-updated',
                Date.now().toString(),
            )

            setTeams((previous) => [
                response.data,
                ...previous,
            ])

            setFormData(initialTeamForm)
            setSelectedPlayers([])
            setCreatePlayerSearch('')

            setSuccessMessage(
                'Team created successfully.',
            )
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to create team.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (team) => {
        setEditingTeamId(team._id)

        setEditFormData({
            name: team.name || '',
            shortName: team.shortName || '',
            logo: team.logo || '',
        })

        setError('')
        setSuccessMessage('')
    }

    const handleUpdateSubmit = async (event) => {
        event.preventDefault()

        setError('')
        setSuccessMessage('')
        setUpdating(true)

        try {
            const response = await updateTeam(
                editingTeamId,
                {
                    name: editFormData.name.trim(),
                    shortName:
                        editFormData.shortName.trim(),
                },
            )

            if (!response.success) {
                throw new Error(
                    response.message ||
                    'Failed to update team',
                )
            }

            setTeams((previous) =>
                previous.map((team) =>
                    team._id === editingTeamId
                        ? response.data
                        : team,
                ),
            )

            /*
             * Notify other tabs about the team update.
             */
            window.localStorage.setItem(
                'crickboard-teams-updated',
                Date.now().toString(),
            )

            setEditingTeamId(null)
            setEditFormData(initialTeamForm)

            setSuccessMessage(
                'Team updated successfully.',
            )
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to update team.',
            )
        } finally {
            setUpdating(false)
        }
    }

    const handleAddPlayer = async (
        teamId,
        playerId,
    ) => {
        setError('')
        setSuccessMessage('')
        setAddingPlayer(true)

        try {
            const response = await addPlayerToTeam(
                teamId,
                playerId,
            )

            if (!response.success) {
                throw new Error(
                    response.message ||
                    'Failed to add player to team',
                )
            }

            setTeams((currentTeams) =>
                currentTeams.map((team) =>
                    team._id === teamId
                        ? response.data
                        : team,
                ),
            )

            /*
             * This event is received by MatchSetup
             * when it is open in another browser tab.
             */
            window.localStorage.setItem(
                'crickboard-teams-updated',
                Date.now().toString(),
            )

            setSuccessMessage(
                response.message ||
                'Player added to team successfully.',
            )
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Unable to add player to team.',
            )
        } finally {
            setAddingPlayer(false)
        }
    }

    const handleRemovePlayer = async (
        teamId,
        playerId,
    ) => {
        setError('')
        setSuccessMessage('')
        setRemovingPlayer(true)

        try {
            const response =
                await removePlayerFromTeam(
                    teamId,
                    playerId,
                )

            if (!response.success) {
                throw new Error(
                    response.message ||
                    'Failed to remove player from team',
                )
            }

            setTeams((currentTeams) =>
                currentTeams.map((team) =>
                    team._id === teamId
                        ? response.data
                        : team,
                ),
            )

            /*
             * Notify other tabs about the squad change.
             */
            window.localStorage.setItem(
                'crickboard-teams-updated',
                Date.now().toString(),
            )

            setSuccessMessage(
                response.message ||
                'Player removed from team successfully.',
            )
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Unable to remove player from team.',
            )
        } finally {
            setRemovingPlayer(false)
        }
    }

    const handleCancelEdit = () => {
        setEditingTeamId(null)
        setEditFormData(initialTeamForm)
        setError('')
    }

    if (loading) {
        return (
            <section className="space-y-8">
                <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-5 w-80 max-w-full" />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map(
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
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-48 w-full rounded-2xl" />
                    </div>
                </Card>
            </section>
        )
    }

    if (error && teams.length === 0) {
        return (
            <section className="space-y-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        CrickBoard
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Teams
                    </h1>
                </div>

                <ErrorState
                    title="Unable to load teams"
                    description={error}
                    onRetry={loadTeamsAndPlayers}
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
                            <Shield className="h-5 w-5" />
                        </span>

                        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                            Team Management
                        </p>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        Teams
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                        Build squads and manage their players.
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <Shield className="h-4 w-4 text-brand-500" />

                    {teams.length}{' '}
                    {teams.length === 1
                        ? 'Team'
                        : 'Teams'}
                </div>
            </div>

            {/* Feedback */}
            {successMessage && (
                <div
                    role="status"
                    className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700 dark:border-brand-900/50 dark:bg-brand-500/10 dark:text-brand-400"
                >
                    {successMessage}
                </div>
            )}

            {error && teams.length > 0 && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400"
                >
                    {error}
                </div>
            )}

            {/* Create Team */}
            <Card className="overflow-hidden">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                            <Plus className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white">
                                Create Team
                            </h2>

                            <p className="text-xs text-slate-400">
                                Select {MIN_PLAYERS}–
                                {MAX_PLAYERS} players
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-950">
                        <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                            {selectedPlayers.length}
                        </span>

                        <span className="text-xs font-medium text-slate-400">
                            / {MAX_PLAYERS} players
                        </span>
                    </div>
                </div>

                <form onSubmit={handleCreateSubmit}>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <FormField
                            label="Team Name"
                            htmlFor="team-name"
                        >
                            <input
                                id="team-name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleCreateChange}
                                placeholder="e.g. Mumbai Indians"
                                minLength={2}
                                maxLength={100}
                                required
                                className={inputClass}
                            />
                        </FormField>

                        <FormField
                            label="Short Name"
                            htmlFor="team-short-name"
                        >
                            <input
                                id="team-short-name"
                                name="shortName"
                                type="text"
                                value={formData.shortName}
                                onChange={handleCreateChange}
                                placeholder="e.g. MI"
                                minLength={1}
                                maxLength={10}
                                required
                                className={inputClass}
                            />
                        </FormField>

                        <FormField
                            label="Logo URL"
                            htmlFor="team-logo"
                        >
                            <input
                                id="team-logo"
                                name="logo"
                                type="url"
                                value={formData.logo}
                                onChange={handleCreateChange}
                                placeholder="https://..."
                                className={inputClass}
                            />
                        </FormField>
                    </div>

                    <div className="mt-6">
                        <PlayerSelector
                            players={filteredCreatePlayers}
                            totalPlayers={players.length}
                            selectedPlayers={selectedPlayers}
                            search={createPlayerSearch}
                            onSearchChange={
                                setCreatePlayerSearch
                            }
                            onToggle={togglePlayer}
                        />
                    </div>

                    <div className="mt-6 flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
                        <Button
                            type="submit"
                            disabled={
                                submitting ||
                                selectedPlayers.length <
                                MIN_PLAYERS
                            }
                            className="w-full sm:w-auto"
                        >
                            {submitting ? (
                                'Creating...'
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Create Team
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Edit Team */}
            {editingTeamId && (
                <Card className="border-brand-200 shadow-md dark:border-brand-900/50">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                                <Edit3 className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white">
                                    Edit Team
                                </h2>

                                <p className="text-xs text-slate-400">
                                    Update team details
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                            aria-label="Cancel editing"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form
                        onSubmit={handleUpdateSubmit}
                        className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_0.7fr_auto]"
                    >
                        <FormField
                            label="Team Name"
                            htmlFor="edit-team-name"
                        >
                            <input
                                id="edit-team-name"
                                name="name"
                                type="text"
                                value={editFormData.name}
                                onChange={handleEditChange}
                                minLength={2}
                                maxLength={100}
                                required
                                className={inputClass}
                            />
                        </FormField>

                        <FormField
                            label="Short Name"
                            htmlFor="edit-team-short-name"
                        >
                            <input
                                id="edit-team-short-name"
                                name="shortName"
                                type="text"
                                value={
                                    editFormData.shortName
                                }
                                onChange={handleEditChange}
                                minLength={1}
                                maxLength={10}
                                required
                                className={inputClass}
                            />
                        </FormField>

                        <div className="flex items-end gap-2">
                            <Button
                                type="submit"
                                disabled={updating}
                                className="flex-1 xl:flex-none"
                            >
                                {updating
                                    ? 'Updating...'
                                    : 'Update'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={updating}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Teams */}
            <Card
                padding="p-0"
                className="overflow-visible"
            >
                <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            All Teams
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Manage squads and their players.
                        </p>
                    </div>
                </div>

                {teams.length === 0 ? (
                    <div className="p-6">
                        <EmptyState
                            icon={Shield}
                            title="No teams yet"
                            description="Create your first team and select its players."
                        />
                    </div>
                ) : (
                    <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
                        {teams.map((team) => (
                            <TeamCard
                                key={team._id}
                                team={team}
                                players={players}
                                addingPlayer={addingPlayer}
                                removingPlayer={removingPlayer}
                                highlighted={
                                    highlightedTeamId ===
                                    team._id
                                }
                                excludedTeamId={
                                    excludeTeamId
                                }
                                excludedPlayerIds={
                                    excludePlayerIds
                                }
                                onEdit={handleEdit}
                                onAddPlayer={
                                    handleAddPlayer
                                }
                                onRemovePlayer={
                                    handleRemovePlayer
                                }
                            />
                        ))}
                    </div>
                )}
            </Card>
        </section>
    )
}

const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500'

function FormField({
    label,
    htmlFor,
    children,
}) {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
                {label}
            </label>

            {children}
        </div>
    )
}

function PlayerSelector({
    players,
    totalPlayers,
    selectedPlayers,
    search,
    onSearchChange,
    onToggle,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        Select Players
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                        Choose between {MIN_PLAYERS} and{' '}
                        {MAX_PLAYERS} players for this squad.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                onSearchChange(
                                    event.target.value,
                                )
                            }
                            placeholder="Search players..."
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:w-56"
                        />
                    </div>

                    <div className="shrink-0 rounded-xl bg-brand-100 px-3 py-2 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                        {selectedPlayers.length}/
                        {MAX_PLAYERS}
                    </div>
                </div>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto pr-1">
                {totalPlayers === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
                        <Users className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600" />

                        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                            No players available
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Create players first.
                        </p>
                    </div>
                ) : players.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
                        <Search className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600" />

                        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                            No matching players
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {players.map((player) => {
                            const isSelected =
                                selectedPlayers.includes(
                                    player._id,
                                )

                            const disabled =
                                !isSelected &&
                                selectedPlayers.length >=
                                MAX_PLAYERS

                            return (
                                <button
                                    key={player._id}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() =>
                                        onToggle(
                                            player._id,
                                        )
                                    }
                                    className={[
                                        'flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200',
                                        isSelected
                                            ? 'border-brand-400 bg-brand-50 shadow-sm dark:border-brand-700 dark:bg-brand-500/10'
                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
                                        disabled
                                            ? 'cursor-not-allowed opacity-40'
                                            : '',
                                    ].join(' ')}
                                >
                                    <div
                                        className={[
                                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                                            isSelected
                                                ? 'bg-brand-500 text-white'
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                                        ].join(' ')}
                                    >
                                        {isSelected ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            (
                                                player.name ||
                                                'P'
                                            )
                                                .charAt(0)
                                                .toUpperCase()
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                            {player.name}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {player.shortName}
                                        </p>
                                    </div>

                                    <span className="hidden text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:block">
                                        {player.role?.replace(
                                            /_/g,
                                            ' ',
                                        )}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

function TeamCard({
    team,
    players,
    addingPlayer,
    removingPlayer,
    highlighted,
    onEdit,
    onAddPlayer,
    onRemovePlayer,
    excludedPlayerIds = [],
    excludedTeamId = null,
}) {
    /*
     * Normalize IDs to strings.
     */
    const normalizedTeamId = String(
        team?._id || '',
    )

    const normalizedExcludedTeamId =
        excludedTeamId
            ? String(excludedTeamId)
            : null

    const normalizedExcludedPlayerIds =
        new Set(
            excludedPlayerIds.map((id) =>
                String(id),
            ),
        )

    /*
     * Players already present in this team's squad.
     */
    const teamPlayerIds =
        team?.players?.map((player) =>
            String(
                typeof player === 'string'
                    ? player
                    : player?._id || '',
            ),
        ) || []

    /*
     * Players available for this team's
     * Add Player dropdown.
     */
    const availablePlayers = players.filter(
        (player) => {
            const playerId = String(
                player?._id || '',
            )

            const alreadyInTeam =
                teamPlayerIds.includes(playerId)

            const excludedFromPlayingXI =
                normalizedTeamId ===
                normalizedExcludedTeamId &&
                normalizedExcludedPlayerIds.has(
                    playerId,
                )

            return (
                !alreadyInTeam &&
                !excludedFromPlayingXI
            )
        },
    )

    const getPlayerName = (player) => {
        if (typeof player === 'string') {
            return (
                players.find(
                    (item) =>
                        String(item._id) ===
                        String(player),
                )?.name || player
            )
        }

        return player?.name || 'Unknown Player'
    }

    return (
        <article
            id={`team-${team._id}`}
            className={[
                'group relative scroll-mt-6 overflow-visible rounded-2xl border bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg dark:bg-slate-900',
                highlighted
                    ? 'border-brand-500 ring-4 ring-brand-500/20 shadow-xl shadow-brand-500/20 dark:border-brand-400 dark:ring-brand-400/20'
                    : 'border-slate-200 dark:border-slate-800',
            ].join(' ')}
        >
            {/* Team Header */}
            <div className="relative overflow-hidden border-b border-slate-100 p-5 dark:border-slate-800">
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/5 blur-2xl" />

                <div className="relative flex items-center gap-4">
                    {team.logo ? (
                        <img
                            src={team.logo}
                            alt={`${team.name} logo`}
                            className="h-14 w-14 rounded-2xl border border-slate-200 bg-white object-contain p-1.5 dark:border-slate-700"
                        />
                    ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                            {(
                                team.shortName ||
                                team.name ||
                                'T'
                            )
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">
                                {team.name}
                            </h3>

                            <Badge variant="brand">
                                {team.shortName}
                            </Badge>
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                            <Users className="h-3.5 w-3.5" />

                            {team.players?.length || 0}{' '}
                            players
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => onEdit(team)}
                        aria-label={`Edit ${team.name}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                        <Edit3 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Players */}
            <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Squad
                    </p>

                    <span className="text-xs font-medium text-slate-400">
                        {team.players?.length || 0}/
                        {MAX_PLAYERS}
                    </span>
                </div>

                {team.players?.length ? (
                    <div className="flex flex-wrap gap-2">
                        {team.players.map((player) => {
                            const playerId =
                                typeof player === 'string'
                                    ? player
                                    : player._id

                            return (
                                <div
                                    key={playerId}
                                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-950"
                                >
                                    <span className="max-w-32 truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                                        {getPlayerName(
                                            player,
                                        )}
                                    </span>

                                    {team.players.length >
                                        MIN_PLAYERS && (
                                            <button
                                                type="button"
                                                disabled={
                                                    removingPlayer
                                                }
                                                onClick={() =>
                                                    onRemovePlayer(
                                                        team._id,
                                                        playerId,
                                                    )
                                                }
                                                aria-label={`Remove ${getPlayerName(
                                                    player,
                                                )}`}
                                                className="text-slate-400 transition hover:text-red-500 disabled:opacity-50"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400 dark:bg-slate-950">
                        No players in this team.
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="grid gap-2 border-t border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                {team.players?.length < MAX_PLAYERS && (
                    <PlayerDropdown
                        players={availablePlayers}
                        disabled={addingPlayer}
                        loading={addingPlayer}
                        onSelect={(playerId) =>
                            onAddPlayer(
                                team._id,
                                playerId,
                            )
                        }
                    />
                )}

                <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                        Minimum {MIN_PLAYERS} players
                    </span>

                    <button
                        type="button"
                        onClick={() => onEdit(team)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit Team
                    </button>
                </div>
            </div>
        </article>
    )
}

function PlayerDropdown({
    players,
    disabled,
    loading,
    onSelect,
}) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    const dropdownRef = useRef(null)
    const searchInputRef = useRef(null)

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target,
                )
            ) {
                setOpen(false)
                setSearch('')
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

    useEffect(() => {
        if (open && !disabled) {
            const timer = window.setTimeout(() => {
                searchInputRef.current?.focus()
            }, 50)

            return () => {
                window.clearTimeout(timer)
            }
        }
    }, [open, disabled])

    const filteredPlayers = useMemo(() => {
        const query = search.trim().toLowerCase()

        if (!query) {
            return players
        }

        return players.filter((player) => {
            const name =
                player.name?.toLowerCase() || ''

            const shortName =
                player.shortName?.toLowerCase() || ''

            const role =
                player.role
                    ?.replace(/_/g, ' ')
                    .toLowerCase() || ''

            return (
                name.includes(query) ||
                shortName.includes(query) ||
                role.includes(query)
            )
        })
    }, [players, search])

    const getInitials = (player) => {
        const name = player.name || 'Player'

        const parts = name
            .trim()
            .split(/\s+/)
            .filter(Boolean)

        if (parts.length >= 2) {
            return (
                parts[0].charAt(0) +
                parts[parts.length - 1].charAt(0)
            ).toUpperCase()
        }

        return name.charAt(0).toUpperCase()
    }

    const handleSelect = (playerId) => {
        if (disabled || loading) return

        setOpen(false)
        setSearch('')

        onSelect(playerId)
    }

    return (
        <div
            ref={dropdownRef}
            className="relative z-40"
        >
            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (disabled) return

                    setOpen((previous) => !previous)
                }}
                className={[
                    'flex h-11 w-full items-center gap-3 rounded-xl border bg-white px-3 text-left transition-all duration-200 dark:bg-slate-900',
                    open
                        ? 'border-brand-500 ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
                    disabled
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer',
                ].join(' ')}
            >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <UserPlus className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {loading
                            ? 'Adding player...'
                            : 'Add player to squad'}
                    </p>

                    {!loading && (
                        <p className="truncate text-[11px] text-slate-400">
                            {players.length > 0
                                ? `${players.length} player${players.length ===
                                    1
                                    ? ''
                                    : 's'
                                } available`
                                : 'No players available'}
                        </p>
                    )}
                </div>

                <svg
                    className={[
                        'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200',
                        open
                            ? 'rotate-180'
                            : '',
                    ].join(' ')}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {/* Dropdown */}
            {open && !disabled && (
                <div className="absolute inset-x-0 top-[calc(100%+8px)] z-[100] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
                    {/* Search */}
                    <div className="border-b border-slate-100 p-3 dark:border-slate-800">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                ref={searchInputRef}
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Search player..."
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                            />
                        </div>

                        <div className="mt-2 flex items-center justify-between px-1">
                            <span className="text-[11px] font-medium text-slate-400">
                                Available players
                            </span>

                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                {filteredPlayers.length}
                            </span>
                        </div>
                    </div>

                    {/* Player List */}
                    <div className="max-h-64 overflow-y-auto p-2">
                        {filteredPlayers.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                                    <Search className="h-5 w-5" />
                                </div>

                                <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    No players found
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Try another name or
                                    short name.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredPlayers.map(
                                    (player) => {
                                        const role =
                                            player.role
                                                ?.replace(
                                                    /_/g,
                                                    ' ',
                                                )
                                                .toLowerCase()

                                        return (
                                            <button
                                                key={
                                                    player._id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handleSelect(
                                                        player._id,
                                                    )
                                                }
                                                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/10"
                                            >
                                                {/* Avatar */}
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 transition-colors group-hover:bg-brand-100 group-hover:text-brand-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-brand-500/20 dark:group-hover:text-brand-300">
                                                    {getInitials(
                                                        player,
                                                    )}
                                                </div>

                                                {/* Player Info */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                            {
                                                                player.name
                                                            }
                                                        </p>

                                                        {player.shortName && (
                                                            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                                {
                                                                    player.shortName
                                                                }
                                                            </span>
                                                        )}
                                                    </div>

                                                    {role && (
                                                        <p className="mt-0.5 truncate text-[11px] capitalize text-slate-400">
                                                            {
                                                                role
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Add */}
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors group-hover:bg-brand-500 group-hover:text-white dark:text-slate-600">
                                                    <Plus className="h-4 w-4" />
                                                </div>
                                            </button>
                                        )
                                    },
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Teams