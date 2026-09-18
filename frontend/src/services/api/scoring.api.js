import api from '../api'

export const getCurrentInnings = async (matchId) => {
    const response = await api.get(
        `/matches/${matchId}/innings`,
    )

    return response.data
}

export const setOpeningPlayers = async (
    matchId,
    { striker, nonStriker, bowler },
) => {
    const response = await api.patch(
        `/matches/${matchId}/innings/players`,
        {
            striker,
            nonStriker,
            bowler,
        },
    )

    return response.data
}

export const recordBall = async (
    matchId,
    {
        overNumber,
        ballNumber,
        striker,
        nonStriker,
        bowler,
        runs,
        extras,
        wicket,
        isLegalDelivery,
        commentary,
    },
) => {
    const response = await api.post(
        `/matches/${matchId}/balls`,
        {
            overNumber,
            ballNumber,
            striker,
            nonStriker,
            bowler,
            runs,
            extras,
            wicket,
            isLegalDelivery,
            commentary,
        },
    )

    return response.data
}

export const setNewBatter = async (
    matchId,
    playerId,
) => {
    const response = await api.patch(
        `/matches/${matchId}/innings/batter`,
        {
            playerId,
        },
    )

    return response.data
}


export const setNewBowler = async (
    matchId,
    playerId,
) => {
    const response = await api.patch(
        `/matches/${matchId}/innings/bowler`,
        {
            playerId,
        },
    )

    return response.data
}

export const getBallEvents = async (
    matchId,
    { limit = 100, cursor } = {},
) => {
    const params = {
        limit,
    }

    if (cursor) {
        params.cursor = cursor
    }

    const response = await api.get(
        `/matches/${matchId}/balls`,
        { params },
    )

    return response.data
}

export const undoLastBall = async (matchId) => {
    const response = await api.post(
        `/matches/${matchId}/balls/undo`,
    )

    return response.data
}

export const getMatchScorecard = async (matchId) => {
    const response = await api.get(
        `/matches/${matchId}/scorecard`,
    )

    return response.data
}