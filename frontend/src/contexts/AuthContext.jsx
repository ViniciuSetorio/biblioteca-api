import { createContext, useState, useContext, useEffect } from 'react'
import ApiService from '../config/api'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Simulação - em uma aplicação real, validaria o token com o backend
      setUser({ nome: 'Administrador', cargo: 'bibliotecario' })
    }
    setLoading(false)
  }, [])

  const login = async (email, senha) => {
    try {
      // Simulação de login
      // Em uma aplicação real, faria a requisição para o backend
      if (email === 'admin@biblioteca.com' && senha === 'admin123') {
        const userData = { nome: 'Administrador', cargo: 'bibliotecario' }
        localStorage.setItem('token', 'fake-jwt-token')
        setUser(userData)
        return { success: true }
      }
      return { success: false, error: 'Credenciais inválidas' }
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}