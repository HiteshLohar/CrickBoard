import api from '../api'

export const register = async ({ name, email, password }) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
  })

  return response.data
}

export const login = async ({ email, password }) => {
  const response = await api.post(
    '/auth/login',
    {
      email,
      password,
    },
    {
      withCredentials: true,
    },
  )

  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me', {
    withCredentials: true,
  })

  return response.data
}