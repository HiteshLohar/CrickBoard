import api from '../api'

export const getPlayers = async () => {
    const response = await api.get('/players')
    return response.data
}

export const createPlayer = async ({ name, shortName, role }) => {
    const response = await api.post('/players', {
        name,
        shortName,
        role,
    })

    return response.data
}

export const updatePlayer = async (playerId, { name, shortName, role }) => {
    const response = await api.patch(`/players/${playerId}`, {
        name,
        shortName,
        role,
    })

    return response.data
}

export const deletePlayer = async (playerId) => {
    const response = await api.delete(`/players/${playerId}`)

    return response.data
}