import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../config/api'
import ReservaForm from '../components/forms/ReservaForm'

const Reservas = () => {
  const [reservas, setReservas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [livros, setLivros] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    usuarioId: '',
    livroId: ''
  })

  const apiService = new ApiService()

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [reservasRes, usuariosRes, livrosRes] = await Promise.all([
        apiService.getReservas(filters),
        apiService.getUsuarios(),
        apiService.getLivros()
      ])

      // Para cada reserva, buscar informações do usuário e livro
      const reservasComDetalhes = await Promise.all(
        reservasRes.data.map(async (reserva) => {
          try {
            const [usuarioRes, livroRes] = await Promise.all([
              apiService.getUsuario(reserva.usuario_id),
              apiService.getLivro(reserva.livro_id)
            ])
            return {
              ...reserva,
              usuario_nome: usuarioRes.data.nome,
              livro_titulo: livroRes.data.titulo
            }
          } catch (error) {
            return {
              ...reserva,
              usuario_nome: 'Usuário não encontrado',
              livro_titulo: 'Livro não encontrado'
            }
          }
        })
      )

      setReservas(reservasComDetalhes)
      setUsuarios(usuariosRes.data)
      setLivros(livrosRes.data)
    } catch (error) {
      toast.error('Erro ao carregar dados')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data) => {
    try {
      await apiService.createReserva(data)
      toast.success('Reserva criada com sucesso!')
      setShowForm(false)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar reserva')
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Confirmar cancelamento desta reserva?')) return

    try {
      await apiService.cancelarReserva(id)
      toast.success('Reserva cancelada com sucesso!')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao cancelar reserva')
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || ''
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      usuarioId: '',
      livroId: ''
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-800'
      case 'cancelada': return 'bg-red-100 text-red-800'
      case 'expirada': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'ativa': return 'Ativa'
      case 'cancelada': return 'Cancelada'
      case 'expirada': return 'Expirada'
      default: return status
    }
  }

  const isReservaAtiva = (reserva) => {
    return reserva.status === 'ativa' && new Date(reserva.data_expiracao) > new Date()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nova Reserva
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="ativa">Ativa</option>
              <option value="cancelada">Cancelada</option>
              <option value="expirada">Expirada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <select
              value={filters.usuarioId}
              onChange={(e) => handleFilterChange('usuarioId', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Todos os usuários</option>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id}>{usuario.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Livro</label>
            <select
              value={filters.livroId}
              onChange={(e) => handleFilterChange('livroId', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Todos os livros</option>
              {livros.map(livro => (
                <option key={livro.id} value={livro.id}>{livro.titulo}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 w-full"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <ReservaForm
            usuarios={usuarios}
            livros={livros}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Reserva
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservas.map((reserva) => (
                <tr key={reserva.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{reserva.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reserva.usuario_nome}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {reserva.usuario_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reserva.livro_titulo}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {reserva.livro_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(reserva.data_reserva)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(reserva.data_expiracao)}
                    {!isReservaAtiva(reserva) && reserva.status === 'ativa' && (
                      <span className="ml-2 text-xs text-red-600">(Expirada)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reserva.status)}`}>
                      {getStatusText(reserva.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {isReservaAtiva(reserva) && (
                      <button
                        onClick={() => handleCancel(reserva.id)}
                        className="text-red-600 hover:text-red-900 mr-3"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {reservas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma reserva encontrada</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Reservas