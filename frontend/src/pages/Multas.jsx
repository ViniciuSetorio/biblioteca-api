import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../config/api'
import { 
  Search, 
  Filter, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Download,
  Copy,
  AlertCircle,
  CreditCard,
  Calendar
} from 'lucide-react'

const Multas = () => {
  const [multas, setMultas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    pago: '',
    usuarioId: ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const cleanFilters = {}
      
      if (filters.pago !== undefined && filters.pago !== '') {
        cleanFilters.pago = filters.pago === 'true'
      }
      
      if (filters.usuarioId && filters.usuarioId !== '') {
        const usuarioId = parseInt(filters.usuarioId)
        if (!isNaN(usuarioId)) {
          cleanFilters.usuarioId = usuarioId
        }
      }
      
      const [multasRes, usuariosRes] = await Promise.all([
        ApiService.getMultas(cleanFilters),
        ApiService.getUsuarios()
      ])

      const multasSimples = multasRes.data.map(multa => ({
        ...multa,
        usuario_nome: `Usuário #${multa.usuario_id}`,
        livro_titulo: `Livro #${multa.livro_id}`,
        valor_numero: parseFloat(multa.valor) || 0
      }))

      setMultas(multasSimples)
      setUsuarios(usuariosRes.data)
      
    } catch (error) {
      console.error('❌ Erro ao carregar multas:', error)
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Erro ao carregar multas'
      toast.error(`Multas: ${errorMsg}`)
      
      setMultas([])
      
    } finally {
      setLoading(false)
    }
  }

  const handlePagar = async (id) => {
    if (!window.confirm('Confirmar pagamento desta multa?')) return

    try {
      await ApiService.pagarMulta(id)
      toast.success('Multa paga com sucesso!')
      fetchData()
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erro ao pagar multa'
      toast.error(errorMsg)
    }
  }

  const filteredMultas = multas.filter(multa => {
    if (!searchTerm) return true
    
    return (
      multa.usuario_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      multa.livro_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      multa.id.toString().includes(searchTerm)
    )
  })

  const calcularTotal = () => {
    return multas
      .filter(m => !m.pago)
      .reduce((total, multa) => total + multa.valor_numero, 0)
  }

  const calcularPagas = () => {
    return multas
      .filter(m => m.pago)
      .reduce((total, multa) => total + multa.valor_numero, 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const stats = {
    total: multas.length,
    emAberto: multas.filter(m => !m.pago).length,
    pagas: multas.filter(m => m.pago).length,
    valorTotal: calcularTotal() + calcularPagas()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Multas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie multas por atrasos na devolução
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2">
            <Download size={18} />
            <span>Relatório</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Multas</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <DollarSign className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Em Aberto</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.emAberto}</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pagas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.pagas}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(stats.valorTotal)}
              </p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <TrendingUp className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-gradient-to-r from-vue-green to-vue-blue rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold mb-2">Resumo Financeiro</h4>
            <p className="opacity-90 text-sm">
              Total pendente: <span className="font-bold text-xl">{formatCurrency(calcularTotal())}</span>
            </p>
            <p className="opacity-90 text-sm mt-1">
              Total recebido: <span className="font-bold text-xl">{formatCurrency(calcularPagas())}</span>
            </p>
          </div>
          <div className="text-center md:text-right">
            <div className="text-3xl font-bold mb-1">{formatCurrency(calcularTotal())}</div>
            <div className="text-sm opacity-90">A receber</div>
          </div>
        </div>
      </div>

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
              value={filters.pago}
              onChange={(e) => setFilters({...filters, pago: e.target.value})}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-vue-green focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="">Todos Status</option>
              <option value="false">Em Aberto</option>
              <option value="true">Pagas</option>
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

            <button
              onClick={() => {
                setFilters({ pago: '', usuarioId: '' })
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

      {/* Lista de Multas */}
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
                    Multa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Livro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMultas.map((multa) => (
                  <tr 
                    key={multa.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-200">
                          #{multa.id}
                        </span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Empréstimo: #{multa.emprestimos_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-gray-200">
                        {multa.usuario_nome}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-gray-200">
                        {multa.livro_titulo}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-gray-200">
                        {formatCurrency(multa.valor_numero)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        multa.pago
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {multa.pago ? (
                          <>
                            <CheckCircle className="mr-1" size={12} />
                            Paga
                          </>
                        ) : (
                          <>
                            <AlertCircle className="mr-1" size={12} />
                            Em Aberto
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="text-gray-900 dark:text-gray-200">
                          Criada: {formatDate(multa.created_at)}
                        </div>
                        {multa.data_pagamento && (
                          <div className="text-gray-500 dark:text-gray-400">
                            Paga: {formatDate(multa.data_pagamento)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {!multa.pago && (
                          <button
                            onClick={() => handlePagar(multa.id)}
                            className="px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center space-x-1"
                          >
                            <CreditCard size={14} />
                            <span>Pagar</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(multa.emprestimos_id)
                            toast.success('ID do empréstimo copiado!')
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Copiar ID do empréstimo"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredMultas.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="text-gray-400 dark:text-gray-500" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                  Nenhuma multa encontrada
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Tente ajustar seus filtros de busca' : 'Parabéns! Não há multas pendentes.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Multas