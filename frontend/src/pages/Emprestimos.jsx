import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../config/api'
import EmprestimoForm from '../components/forms/EmprestimoForm'

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

  const apiService = new ApiService()

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [emprestimosRes, usuariosRes, livrosRes] = await Promise.all([
        apiService.getEmprestimos(filters),
        apiService.getUsuarios(),
        apiService.getLivros()
      ])

      // Para cada empréstimo, buscar informações do usuário e livro
      const emprestimosComDetalhes = await Promise.all(
        emprestimosRes.data.map(async (emprestimo) => {
          try {
            const [usuarioRes, livroRes] = await Promise.all([
              apiService.getUsuario(emprestimo.usuario_id),
              apiService.getLivro(emprestimo.livro_id)
            ])
            return {
              ...emprestimo,
              usuario_nome: usuarioRes.data.nome,
              livro_titulo: livroRes.data.titulo
            }
          } catch (error) {
            return {
              ...emprestimo,
              usuario_nome: 'Usuário não encontrado',
              livro_titulo: 'Livro não encontrado'
            }
          }
        })
      )

      setEmprestimos(emprestimosComDetalhes)
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
      await apiService.createEmprestimo(data)
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
      await apiService.devolverEmprestimo(id)
      toast.success('Devolução registrada com sucesso!')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao registrar devolução')
    }
  }

  const calcularMulta = async (emprestimoId) => {
    try {
      const response = await apiService.calcularMulta(emprestimoId)
      toast.success(`Multa calculada: R$ ${response.data.valor}`)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao calcular multa')
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
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'atrasado': return 'bg-red-100 text-red-800'
      case 'devolvido': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Empréstimos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Novo Empréstimo
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
              <option value="ativo">Ativo</option>
              <option value="atrasado">Atrasado</option>
              <option value="devolvido">Devolvido</option>
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
          <EmprestimoForm
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
                  Data Empréstimo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Previsão Devolução
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
              {emprestimos.map((emprestimo) => (
                <tr key={emprestimo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{emprestimo.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {emprestimo.usuario_nome}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {emprestimo.usuario_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {emprestimo.livro_titulo}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {emprestimo.livro_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(emprestimo.data_emprestimo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(emprestimo.data_prevista_devolucao)}
                    {emprestimo.status === 'atrasado' && (
                      <span className="ml-2 text-xs text-red-600">(Atrasado)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(emprestimo.status)}`}>
                      {emprestimo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {emprestimo.status === 'ativo' && (
                      <>
                        <button
                          onClick={() => handleDevolucao(emprestimo.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Devolver
                        </button>
                        <button
                          onClick={() => calcularMulta(emprestimo.id)}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          Calcular Multa
                        </button>
                      </>
                    )}
                    {emprestimo.status === 'atrasado' && (
                      <button
                        onClick={() => calcularMulta(emprestimo.id)}
                        className="text-red-600 hover:text-red-900 mr-3"
                      >
                        Ver Multa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {emprestimos.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum empréstimo encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Emprestimos