import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../config/api'
import EmprestimoForm from '../components/forms/EmprestimoForm'
import { 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  Download,
  AlertCircle  // Adicionei esta importação
} from 'lucide-react'

const Emprestimos = () => {
  const [emprestimos, setEmprestimos] = useState([])
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
      if (filters.status && filters.status !== '') {
        cleanFilters.status = filters.status
      }
      if (filters.usuarioId && filters.usuarioId !== '') {
        cleanFilters.usuarioId = parseInt(filters.usuarioId)
      }
      if (filters.livroId && filters.livroId !== '') {
        cleanFilters.livroId = parseInt(filters.livroId)
      }
      
      const [emprestimosRes, usuariosRes, livrosRes] = await Promise.all([
        ApiService.getEmprestimos(cleanFilters),
        ApiService.getUsuarios(),
        ApiService.getLivros()
      ])

      const emprestimosComDetalhes = await Promise.all(
        emprestimosRes.data.map(async (emprestimo) => {
          try {
            const [usuarioRes, livroRes] = await Promise.all([
              ApiService.getUsuario(emprestimo.usuario_id),
              ApiService.getLivro(emprestimo.livro_id)
            ])
            return {
              ...emprestimo,
              usuario_nome: usuarioRes.data.nome,
              livro_titulo: livroRes.data.titulo,
              usuario_email: usuarioRes.data.email
            }
          } catch (error) {
            return {
              ...emprestimo,
              usuario_nome: `Usuário #${emprestimo.usuario_id}`,
              livro_titulo: `Livro #${emprestimo.livro_id}`,
              usuario_email: ''
            }
          }
        })
      )

      setEmprestimos(emprestimosComDetalhes)
      setUsuarios(usuariosRes.data)
      setLivros(livrosRes.data)
    } catch (error) {
      toast.error(`Erro ao carregar dados: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data) => {
    try {
      await ApiService.createEmprestimo(data)
      toast.success('Empréstimo criado com sucesso!')
      setShowForm(false)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar empréstimo')
    }
  }

  const handleDevolucao = async (id) => {
    if (!window.confirm('Confirmar devolução deste empréstimo?')) return

    try {
      await ApiService.devolverEmprestimo(id)
      toast.success('Devolução registrada com sucesso!')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao registrar devolução')
    }
  }

  const calcularMulta = async (emprestimoId) => {
    try {
      const response = await ApiService.calcularMulta(emprestimoId)
      toast.success(`Multa calculada: R$ ${response.data.valor}`)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao calcular multa')
    }
  }

  const filteredEmprestimos = emprestimos.filter(emprestimo => {
    if (!searchTerm) return true
    
    return (
      emprestimo.usuario_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emprestimo.livro_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emprestimo.id.toString().includes(searchTerm)
    )
  })

  const stats = {
    total: emprestimos.length,
    ativos: emprestimos.filter(e => e.status === 'ativo').length,
    atrasados: emprestimos.filter(e => e.status === 'atrasado').length,
    devolvidos: emprestimos.filter(e => e.status === 'devolvido').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Empréstimos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie os empréstimos de livros da biblioteca
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-vue-green to-vue-blue text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
        >
          <Calendar size={18} />
          <span>Novo Empréstimo</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ativos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.ativos}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <Clock className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Atrasados</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.atrasados}</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Devolvidos</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.devolvidos}</p>
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <CheckCircle className="text-gray-600 dark:text-gray-400" size={20} />
            </div>
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
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-vue-green focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="">Todos Status</option>
              <option value="ativo">Ativo</option>
              <option value="atrasado">Atrasado</option>
              <option value="devolvido">Devolvido</option>
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
              onClick={() => setFilters({ status: '', usuarioId: '', livroId: '' })}
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
          <EmprestimoForm
            usuarios={usuarios}
            livros={livros}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Lista de Empréstimos */}
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
                    Empréstimo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Livro
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
                {filteredEmprestimos.map((emprestimo) => (
                  <tr 
                    key={emprestimo.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-200">
                          #{emprestimo.id}
                        </span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(emprestimo.data_emprestimo).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-200">
                          {emprestimo.usuario_nome}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {emprestimo.usuario_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-200">
                        {emprestimo.livro_titulo}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        emprestimo.status === 'ativo'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : emprestimo.status === 'atrasado'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                      }`}>
                        {emprestimo.status === 'ativo' && <Clock className="mr-1" size={12} />}
                        {emprestimo.status === 'atrasado' && <AlertCircle className="mr-1" size={12} />}
                        {emprestimo.status === 'devolvido' && <CheckCircle className="mr-1" size={12} />}
                        {emprestimo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-200">
                        Empréstimo: {new Date(emprestimo.data_emprestimo).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Devolução: {emprestimo.data_prevista_devolucao 
                          ? new Date(emprestimo.data_prevista_devolucao).toLocaleDateString('pt-BR')
                          : '—'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {emprestimo.status === 'ativo' && (
                          <>
                            <button
                              onClick={() => handleDevolucao(emprestimo.id)}
                              className="px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center space-x-1"
                            >
                              <CheckCircle size={14} />
                              <span>Devolver</span>
                            </button>
                            <button
                              onClick={() => calcularMulta(emprestimo.id)}
                              className="px-3 py-1.5 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                            >
                              Calcular Multa
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredEmprestimos.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Search className="text-gray-400 dark:text-gray-500" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                  Nenhum empréstimo encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Tente ajustar seus filtros de busca' : 'Comece criando um novo empréstimo'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Emprestimos