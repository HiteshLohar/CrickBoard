import api from '../api'

export const getPublicLiveMatch = async (publicId) => {
  const response = await api.get(`/public/matches/${publicId}/live`)
  return response.data
}