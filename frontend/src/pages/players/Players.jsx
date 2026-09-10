import { useEffect, useMemo, useState } from 'react'
import {
    Edit3,
    Search,
    Shield,
    Trash2,
    UserPlus,
    Users,
    X,
} from 'lucide-react'

import {
    createPlayer,
    deletePlayer,
    getPlayers,
    updatePlayer,
} from '../../services/api/players.api'

import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'

function Players() {
    const [players, setPlayers] = useState([])

    const [formData, setFormData] = useState({
        name: '',
        shortName: '',
        role: 'BATTER',
    })

    const [editFormData, setEditFormData] = useState({
        name: '',
        shortName: '',
        role: 'BATTER',
    })

    const [editingPlayerId, setEditingPlayerId] = useState(null)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [deletingPlayerId, setDeletingPlayerId] = useState(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('ALL')

    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const loadPlayers = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await getPlayers()

            if (!response.success) {
                throw new Error(
                    response.message || 'Failed to fetch players',
                )
            }

            setPlayers(response.data || [])
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    error.message ||
                    'Unable to load players.',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPlayers()
    }, [])

    const filteredPlayers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        return players.filter((player) => {
            const matchesSearch =
                !query ||
                player.name?.toLowerCase().includes(query) ||
                player.shortName?.toLowerCase().includes(query)

            const matchesRole =
                roleFilter === 'ALL' ||
                player.role === roleFilter

            return matchesSearch && matchesRole
        })
    }, [players, searchQuery, roleFilter])

    const handleChange = (event) => {
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

    const handleSubmit = async (event) => {
        event.preventDefault()

        setSubmitting(true)
        setError('')
        setSuccessMessage('')

        try {
            const response = await createPlayer(formData)

            if (!response.success) {
                throw new Error(
                    response.message || 'Failed to create player',
                )
            }

            setPlayers((previous) => [
                response.data,
                ...previous,
            ])

            setFormData({
                name: '',
                shortName: '',
                role: 'BATTER',
            })

            setSuccessMessage('Player created successfully.')
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    error.message ||
                    'Unable to create player.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (player) => {
        setEditingPlayerId(player._id)

        setEditFormData({
            name: player.name || '',
            shortName: player.shortName || '',
            role: player.role || 'BATTER',
        })

        setError('')
        setSuccessMessage('')
    }

    const handleUpdate = async (event) => {
        event.preventDefault()

        setUpdating(true)
        setError('')
        setSuccessMessage('')

        try {
            const response = await updatePlayer(
                editingPlayerId,
                editFormData,
            )

            if (!response.success) {
                throw new Error(
                    response.message || 'Failed to update player',
                )
            }

            setPlayers((previous) =>
                previous.map((player) =>
                    player._id === editingPlayerId
                        ? response.data
                        : player,
                ),
            )

            setEditingPlayerId(null)

            setEditFormData({
                name: '',
                shortName: '',
                role: 'BATTER',
            })

            setSuccessMessage('Player updated successfully.')
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    error.message ||
                    'Unable to update player.',
            )
        } finally {
            setUpdating(false)
        }
    }

    const handleCancelEdit = () => {
        setEditingPlayerId(null)

        setEditFormData({
            name: '',
            shortName: '',
            role: 'BATTER',
        })
    }

    const handleDelete = async (playerId) => {
        const shouldDelete = window.confirm(
            'Are you sure you want to delete this player?',
        )

        if (!shouldDelete) {
            return
        }

        setDeletingPlayerId(playerId)
        setError('')
        setSuccessMessage('')

        try {
            const response = await deletePlayer(playerId)

            if (!response.success) {
                throw new Error(
                    response.message || 'Failed to delete player',
                )
            }

            setPlayers((previous) =>
                previous.filter(
                    (player) => player._id !== playerId,
                ),
            )

            if (editingPlayerId === playerId) {
                handleCancelEdit()
            }

            setSuccessMessage('Player deleted successfully.')
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    error.message ||
                    'Unable to delete player.',
            )
        } finally {
            setDeletingPlayerId(null)
        }
    }

    if (loading) {
        return (
            <section className="space-y-8">
                <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-56" />
                    <Skeleton className="h-5 w-80 max-w-full" />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index}>
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                        </Card>
                    ))}
                </div>

                <Card>
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full rounded-xl" />

                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-16 w-full rounded-xl"
                            />
                        ))}
                    </div>
                </Card>
            </section>
        )
    }

    if (error && players.length === 0) {
        return (
            <section className="space-y-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        CrickBoard
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Players
                    </h1>
                </div>

                <ErrorState
                    title="Unable to load players"
                    description={error}
                    onRetry={loadPlayers}
                />
            </section>
        )
    }

    return (
        <section className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                            <Users className="h-5 w-5" />
                        </span>

                        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                            Squad Management
                        </p>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        Players
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                        Create and manage your cricket players.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                        <Users className="h-4 w-4 text-brand-500" />
                        {players.length}{' '}
                        {players.length === 1 ? 'Player' : 'Players'}
                    </div>
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

            {error && players.length > 0 && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400"
                >
                    {error}
                </div>
            )}

            {/* Create Player */}
            <Card className="overflow-hidden">
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                        <UserPlus className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="font-bold text-slate-900 dark:text-white">
                            Create Player
                        </h2>

                        <p className="text-xs text-slate-400">
                            Add a new player to your squad
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_0.7fr_1fr_auto]"
                >
                    <FormField
                        label="Player Name"
                        htmlFor="player-name"
                    >
                        <input
                            id="player-name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Virat Kohli"
                            required
                            className={inputClass}
                        />
                    </FormField>

                    <FormField
                        label="Short Name"
                        htmlFor="player-short-name"
                    >
                        <input
                            id="player-short-name"
                            name="shortName"
                            type="text"
                            value={formData.shortName}
                            onChange={handleChange}
                            placeholder="e.g. VK"
                            required
                            className={inputClass}
                        />
                    </FormField>

                    <FormField label="Role" htmlFor="player-role">
                        <RoleSelect
                            id="player-role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        />
                    </FormField>

                    <div className="flex items-end">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full xl:w-auto"
                        >
                            {submitting ? (
                                'Creating...'
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Create Player
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Edit Player */}
            {editingPlayerId && (
                <Card className="border-brand-200 shadow-md dark:border-brand-900/50">
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                                <Edit3 className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white">
                                    Edit Player
                                </h2>

                                <p className="text-xs text-slate-400">
                                    Update player information
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
                        onSubmit={handleUpdate}
                        className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_0.7fr_1fr_auto]"
                    >
                        <FormField
                            label="Player Name"
                            htmlFor="edit-player-name"
                        >
                            <input
                                id="edit-player-name"
                                name="name"
                                type="text"
                                value={editFormData.name}
                                onChange={handleEditChange}
                                required
                                className={inputClass}
                            />
                        </FormField>

                        <FormField
                            label="Short Name"
                            htmlFor="edit-player-short-name"
                        >
                            <input
                                id="edit-player-short-name"
                                name="shortName"
                                type="text"
                                value={editFormData.shortName}
                                onChange={handleEditChange}
                                required
                                className={inputClass}
                            />
                        </FormField>

                        <FormField
                            label="Role"
                            htmlFor="edit-player-role"
                        >
                            <RoleSelect
                                id="edit-player-role"
                                name="role"
                                value={editFormData.role}
                                onChange={handleEditChange}
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

            {/* Players List */}
            <Card padding="p-0" className="overflow-hidden">
                <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                All Players
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {filteredPlayers.length} of{' '}
                                {players.length} players shown
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) =>
                                        setSearchQuery(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Search players..."
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 sm:w-64"
                                />
                            </div>

                            <select
                                value={roleFilter}
                                onChange={(event) =>
                                    setRoleFilter(event.target.value)
                                }
                                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="BATTER">Batters</option>
                                <option value="BOWLER">Bowlers</option>
                                <option value="ALL_ROUNDER">
                                    All Rounders
                                </option>
                                <option value="WICKET_KEEPER">
                                    Wicket Keepers
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredPlayers.length === 0 ? (
                    <div className="p-6">
                        <EmptyState
                            icon={Users}
                            title={
                                players.length === 0
                                    ? 'No players yet'
                                    : 'No players found'
                            }
                            description={
                                players.length === 0
                                    ? 'Create your first player to build your squad.'
                                    : 'Try changing your search or role filter.'
                            }
                            actionLabel={
                                players.length === 0
                                    ? 'Create your first player'
                                    : undefined
                            }
                            onAction={
                                players.length === 0
                                    ? () =>
                                          document
                                              .getElementById(
                                                  'player-name',
                                              )
                                              ?.focus()
                                    : undefined
                            }
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden md:block">
                            <div className="grid grid-cols-[1.5fr_0.6fr_1fr_0.7fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/70">
                                <span>Player</span>
                                <span>Short Name</span>
                                <span>Role</span>
                                <span className="text-right">
                                    Actions
                                </span>
                            </div>

                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredPlayers.map((player) => (
                                    <PlayerRow
                                        key={player._id}
                                        player={player}
                                        deleting={
                                            deletingPlayerId ===
                                            player._id
                                        }
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="space-y-3 p-4 md:hidden">
                            {filteredPlayers.map((player) => (
                                <PlayerMobileCard
                                    key={player._id}
                                    player={player}
                                    deleting={
                                        deletingPlayerId ===
                                        player._id
                                    }
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </>
                )}
            </Card>
        </section>
    )
}

const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500'

function FormField({ label, htmlFor, children }) {
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

function RoleSelect({ id, name, value, onChange }) {
    return (
        <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            className={inputClass}
        >
            <option value="BATTER">Batter</option>
            <option value="BOWLER">Bowler</option>
            <option value="ALL_ROUNDER">All Rounder</option>
            <option value="WICKET_KEEPER">
                Wicket Keeper
            </option>
        </select>
    )
}

function getRoleVariant(role) {
    switch (role) {
        case 'BATTER':
            return 'info'
        case 'BOWLER':
            return 'danger'
        case 'ALL_ROUNDER':
            return 'purple'
        case 'WICKET_KEEPER':
            return 'success'
        default:
            return 'default'
    }
}

function formatRole(role) {
    return role
        ?.toLowerCase()
        .split('_')
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1),
        )
        .join(' ')
}

function PlayerAvatar({ player }) {
    return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
            {(player.name || 'P').charAt(0).toUpperCase()}
        </div>
    )
}

function PlayerRow({
    player,
    deleting,
    onEdit,
    onDelete,
}) {
    return (
        <div className="group grid grid-cols-[1.5fr_0.6fr_1fr_0.7fr] items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <div className="flex min-w-0 items-center gap-3">
                <PlayerAvatar player={player} />

                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {player.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                        Cricket Player
                    </p>
                </div>
            </div>

            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {player.shortName}
            </span>

            <div>
                <Badge variant={getRoleVariant(player.role)}>
                    {formatRole(player.role)}
                </Badge>
            </div>

            <div className="flex justify-end gap-2">
                <ActionButton
                    label="Edit player"
                    onClick={() => onEdit(player)}
                >
                    <Edit3 className="h-4 w-4" />
                </ActionButton>

                <ActionButton
                    label="Delete player"
                    danger
                    disabled={deleting}
                    onClick={() => onDelete(player._id)}
                >
                    <Trash2 className="h-4 w-4" />
                </ActionButton>
            </div>
        </div>
    )
}

function PlayerMobileCard({
    player,
    deleting,
    onEdit,
    onDelete,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
                <PlayerAvatar player={player} />

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {player.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                        {player.shortName}
                    </p>
                </div>

                <Badge variant={getRoleVariant(player.role)}>
                    {formatRole(player.role)}
                </Badge>
            </div>

            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(player)}
                    className="flex-1"
                >
                    <span className="flex items-center justify-center gap-1.5">
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                    </span>
                </Button>

                <Button
                    variant="danger"
                    size="sm"
                    disabled={deleting}
                    onClick={() => onDelete(player._id)}
                    className="flex-1"
                >
                    <span className="flex items-center justify-center gap-1.5">
                        <Trash2 className="h-3.5 w-3.5" />
                        {deleting ? 'Deleting...' : 'Delete'}
                    </span>
                </Button>
            </div>
        </div>
    )
}

function ActionButton({
    children,
    label,
    onClick,
    danger = false,
    disabled = false,
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClick}
            className={[
                'flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200',
                danger
                    ? 'border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-900/50 dark:hover:bg-red-500/10'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                disabled
                    ? 'cursor-not-allowed opacity-50'
                    : '',
            ].join(' ')}
        >
            {children}
        </button>
    )
}

export default Players