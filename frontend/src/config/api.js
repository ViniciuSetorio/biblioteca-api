import axios from 'axios'

let apiInstance = null

class ApiService {
  constructor() {
    if (apiInstance) {
      return apiInstance
    }

    this.client = axios.create({
      baseURL: 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Interceptor para adicionar token de autenticação
    this.client.interceptors.request.use(
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
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )

    apiInstance = this
  }

  // Usuários
  getUsuarios() {
    return this.client.get('/usuarios')
  }

  getUsuario(id) {
    return this.client.get(`/usuarios/${id}`)
  }

  createUsuario(data) {
    return this.client.post('/usuarios', data)
  }

  updateUsuario(id, data) {
    return this.client.put(`/usuarios/${id}`, data)
  }

  deleteUsuario(id) {
    return this.client.delete(`/usuarios/${id}`)
  }

  // Livros
  getLivros() {
    return this.client.get('/livros')
  }

  getLivro(id) {
    return this.client.get(`/livros/${id}`)
  }

  createLivro(data) {
    return this.client.post('/livros', data)
  }

  updateLivro(id, data) {
    return this.client.put(`/livros/${id}`, data)
  }

  deleteLivro(id) {
    return this.client.delete(`/livros/${id}`)
  }

  // Empréstimos
  getEmprestimos(filters = {}) {
    return this.client.get('/emprestimos', { params: filters })
  }

  getEmprestimo(id) {
    return this.client.get(`/emprestimos/${id}`)
  }

  createEmprestimo(data) {
    return this.client.post('/emprestimos', data)
  }

  devolverEmprestimo(id) {
    return this.client.patch(`/emprestimos/${id}/devolucao`)
  }

  // Reservas
  getReservas(filters = {}) {
    return this.client.get('/reservas', { params: filters })
  }

  getReserva(id) {
    return this.client.get(`/reservas/${id}`)
  }

  createReserva(data) {
    return this.client.post('/reservas', data)
  }

  cancelarReserva(id) {
    return this.client.patch(`/reservas/${id}/cancelar`)
  }

  // Multas
  getMultas(filters = {}) {
    return this.client.get('/multas', { params: filters })
  }

  getMulta(id) {
    return this.client.get(`/multas/${id}`)
  }

  pagarMulta(id) {
    return this.client.patch(`/multas/${id}/pagar`)
  }
}

export default ApiService