import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../config/api'
import ReservaForm from '../components/forms/ReservaForm'
import { 
  Search, 
  Filter, 
  Clock, 
  Plus, 
  XCircle,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  User,
  BookOpen,
  Download
} from 'lucide-react'

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
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const cleanFilters = {}
      
      if (filters.status && filters.status.trim() !== '') {
        cleanFilters.status = filters.status
      }
      
      if (filters.usuarioId && filters.usuarioId !== '') {
        const usuarioId = parseInt(filters.usuarioId)
        if (!isNaN(usuarioId)) {
          cleanFilters.usuarioId = usuarioId
        }
      }
      
      if (filters.livroId && filters.livroId !== '') {
        const livroId = parseInt(filters.livroId)
        if (!isNaN(livroId)) {
          cleanFilters.livroId = livroId
        }
      }
      
      const [reservasRes, usuariosRes, livrosRes] = await Promise.all([
        ApiService.getReservas(cleanFilters),
        ApiService.getUsuarios(),
        ApiService.getLivros()
      ])

      const reservasSimples = reservasRes.data.map(reserva => ({
        ...reserva,
        usuario_nome: `Usuário #${reserva.usuario_id}`,
        livro_titulo: `Livro #${reserva.livro_id}`,
        usuario_email: ''
      }))

      setReservas(reservasSimples)
      setUsuarios(usuariosRes.data)
      setLivros(livrosRes.data)
      
    } catch (error) {
      console.error('❌ Erro:', error)
      toast.error('Erro ao carregar reservas')
      setReservas([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data) => {
    try {
      await ApiService.createReserva(data)
      toast.success('Reserva criada com sucesso!')
      setShowForm(false)
      fetchData()
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erro ao criar reserva'
      toast.error(errorMsg)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Confirmar cancelamento desta reserva?')) return

    try {
      await ApiService.cancelarReserva(id)
      toast.success('Reserva cancelada com sucesso!')
      fetchData()
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erro ao cancelar reserva'
      toast.error(errorMsg)
    }
  }

  const filteredReservas = reservas.filter(reserva => {
    if (!searchTerm) return true
    
    return (
      reserva.usuario_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.livro_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.id.toString().includes(searchTerm)
    )
  })

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status, expiracao) => {
    const isExpirada = new Date(expiracao) < new Date()
    
    if (status === 'ativa' && isExpirada) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    }
    
    switch (status) {
      case 'ativa': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'cancelada': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'expirada': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
    }
  }

  const getStatusText = (status, expiracao) => {
    const isExpirada = new Date(expiracao) < new Date()
    
    if (status === 'ativa' && isExpirada) {
      return 'Expirada'
    }
    
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

  const stats = {
    total: reservas.length,
    ativas: reservas.filter(r => r.status === 'ativa' && new Date(r.data_expiracao) > new Date()).length,
    expiradas: reservas.filter(r => r.status === 'ativa' && new Date(r.data_expiracao) < new Date()).length,
    canceladas: reservas.filter(r => r.status === 'cancelada').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reservas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie as reservas de livros da biblioteca
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-vue-green to-vue-blue text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Nova Reserva</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Clock className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ativas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.ativas}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expiradas</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.expiradas}</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Canceladas</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.canceladas}</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <XCircle className="text-red-600 dark:text-red-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Próximas Expirações */}
      {stats.ativas > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-semibold mb-2">Próximas Expirações</h4>
              <p className="opacity-90 text-sm">
                {reservas
                  .filter(r => r.status === 'ativa' && new Date(r.data_expiracao) > new Date())
                  .sort((a, b) => new Date(a.data_expiracao) - new Date(b.data_expiracao))
                  .slice(0, 3)
                  .map(r => (
                    <div key={r.id} className="flex items-center space-x-2 mt-1">
                      <Calendar size={12} />
                      <span>{formatDate(r.data_expiracao)} - {r.livro_titulo}</span>
                    </div>
                  ))
                }
              </p>
            </div>
            <div className="text-center md:text-right">
              <div className="text-3xl font-bold mb-1">{stats.ativas}</div>
              <div className="text-sm opacity-90">Reservas ativas</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por usuário, livro ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-vue-green focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-vue-green focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="">Todos Status</option>
              <option value="ativa">Ativa</option>
              <option value="cancelada">Cancelada</option>
              <option value="expirada">Expirada</option>
            </select>

            <select
              value={filters.usuarioId}
              onChange={(e) => setFilters({...filters, usuarioId: e.target.value})}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-vue-green focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="">Todos Usuários</option>
              {usuarios.map(user => (
                <option key={user.id} value={user.id}>{user.nome}</option>
              ))}
            </select>

            <select
              value={filters.livroId}
              onChange={(e) => setFilters({...filters, livroId: e.target.value})}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-vue-green focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="">Todos Livros</option>
              {livros.map(livro => (
                <option key={livro.id} value={livro.id}>{livro.titulo}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setFilters({ status: '', usuarioId: '', livroId: '' })
                setSearchTerm('')
              }}
              className="px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <XCircle size={16} />
              <span>Limpar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Formulário (se aberto) */}
      {showForm && (
        <div className="animate-slideDown">
          <ReservaForm
            usuarios={usuarios}
            livros={livros}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Lista de Reservas */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-vue-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reserva
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Livro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Datas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReservas.map((reserva) => (
                  <tr 
                    key={reserva.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-200">
                          #{reserva.id}
                        </span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Criada: {formatDate(reserva.data_reserva)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                          <User size={14} className="text-gray-500" />
                        </div>
                        <div>
                          <div className="text-gray-900 dark:text-gray-200">
                            {reserva.usuario_nome}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {reserva.usuario_email || 'Sem e-mail'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                          <BookOpen size={14} className="text-gray-500" />
                        </div>
                        <div className="text-gray-900 dark:text-gray-200">
                          {reserva.livro_titulo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} className="text-gray-400" />
                          <span className="text-gray-900 dark:text-gray-200">
                            Expira: {formatDate(reserva.data_expiracao)}
                          </span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Válida por 3 dias
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        getStatusColor(reserva.status, reserva.data_expiracao)
                      }`}>
                        {reserva.status === 'ativa' && new Date(reserva.data_expiracao) > new Date() && (
                          <CheckCircle className="mr-1" size={12} />
                        )}
                        {reserva.status === 'ativa' && new Date(reserva.data_expiracao) < new Date() && (
                          <AlertCircle className="mr-1" size={12} />
                        )}
                        {reserva.status === 'cancelada' && (
                          <XCircle className="mr-1" size={12} />
                        )}
                        {getStatusText(reserva.status, reserva.data_expiracao)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {isReservaAtiva(reserva) && (
                          <button
                            onClick={() => handleCancel(reserva.id)}
                            className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center space-x-1"
                          >
                            <XCircle size={14} />
                            <span>Cancelar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredReservas.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Clock className="text-gray-400 dark:text-gray-500" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                  Nenhuma reserva encontrada
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Tente ajustar seus filtros de busca' : 'Comece criando uma nova reserva'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Reservas