import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const ApiService = {
  // Usuários
  getUsuarios: () => apiClient.get('/usuarios'),
  getUsuario: (id) => apiClient.get(`/usuarios/${id}`),
  createUsuario: (data) => apiClient.post('/usuarios', data),
  updateUsuario: (id, data) => apiClient.put(`/usuarios/${id}`, data),
  deleteUsuario: (id) => apiClient.delete(`/usuarios/${id}`),

  // Livros
  getLivros: () => apiClient.get('/livros'),
  getLivro: (id) => apiClient.get(`/livros/${id}`),
  createLivro: (data) => apiClient.post('/livros', data),
  updateLivro: (id, data) => apiClient.put(`/livros/${id}`, data),
  deleteLivro: (id) => apiClient.delete(`/livros/${id}`),

  // Empréstimos
  getEmprestimos: (filters = {}) => apiClient.get('/emprestimos', { params: filters }),
  getEmprestimo: (id) => apiClient.get(`/emprestimos/${id}`),
  createEmprestimo: (data) => apiClient.post('/emprestimos', data),
  devolverEmprestimo: (id) => apiClient.patch(`/emprestimos/${id}/devolucao`),

  // Reservas
  getReservas: (filters = {}) => apiClient.get('/reservas', { params: filters }),
  getReserva: (id) => apiClient.get(`/reservas/${id}`),
  createReserva: (data) => apiClient.post('/reservas', data),
  cancelarReserva: (id) => apiClient.patch(`/reservas/${id}/cancelar`),

  // Multas
  getMultas: (filters = {}) => apiClient.get('/multas', { params: filters }),
  getMulta: (id) => apiClient.get(`/multas/${id}`),
  pagarMulta: (id) => apiClient.patch(`/multas/${id}/pagar`),

  // Método para testar conexão - CORRIGIDO
  testConnection: () => {
    return apiClient.get('/usuarios')
      .then(res => ({
        success: true,
        data: res.data
      }))
      .catch(err => ({
        success: false,
        error: err.message,
        status: err.response?.status
      }))
  }
}

export default ApiService