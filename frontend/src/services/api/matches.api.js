import api from '../api'

export const getMatches = async () => {
    const response = await api.get('/matches')

    return response.data
}

export const createMatch = async ({
    matchCode,
    title,
    teamA,
    teamB,
    playersPerTeam,
    totalOvers,
}) => {
    const response = await api.post('/matches', {
        matchCode,
        title,
        teamA,
        teamB,
        playersPerTeam,
        totalOvers,
    })

    return response.data
}

export const getMatchById = async (matchId) => {
    const response = await api.get(`/matches/${matchId}`)

    return response.data
}

export const getCurrentInnings = async (matchId) => {
    const response = await api.get(`/matches/${matchId}/innings`)

    return response.data
}

export const getBallEvents = async (matchId, params = {}) => {
    const response = await api.get(`/matches/${matchId}/balls`, {
        params,
    })

    return response.data
}

export const setPlayingXI = async (
    matchId,
    { teamAPlayers, teamBPlayers },
) => {
    const response = await api.put(
        `/matches/${matchId}/playing-xi`,
        {
            teamAPlayers,
            teamBPlayers,
        },
    )

    return response.data
}

export const setToss = async (
    matchId,
    { wonBy, decision },
) => {
    const response = await api.patch(
        `/matches/${matchId}/toss`,
        {
            wonBy,
            decision,
        },
    )

    return response.data
}

export const startMatch = async (matchId) => {
    const response = await api.post(
        `/matches/${matchId}/start`,
    )

    return response.data
}

