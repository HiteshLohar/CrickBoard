import api from '../api'

export const getTeams = async () => {
    const response = await api.get('/teams')

    return response.data
}

export const createTeam = async ({
    name,
    shortName,
    logo,
    players,
}) => {
    const response = await api.post('/teams', {
        name,
        shortName,
        logo,
        players,
    })

    return response.data
}

export const updateTeam = async (
    teamId,
    { name, shortName },
) => {
    const response = await api.patch(`/teams/${teamId}`, {
        name,
        shortName,
    })

    return response.data
}

export const addPlayerToTeam = async (teamId, playerId) => {
    const response = await api.post(
        `/teams/${teamId}/players`,
        {
            playerId,
        },
    )

    return response.data
}

export const removePlayerFromTeam = async (teamId, playerId) => {
    const response = await api.delete(
        `/teams/${teamId}/players/${playerId}`,
    )

    return response.data
}