import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../config/api'

const Multas = () => {
  const [multas, setMultas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    pago: '',
    usuarioId: ''
  })

  const apiService = new ApiService()

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [multasRes, usuariosRes] = await Promise.all([
        apiService.getMultas(filters),
        apiService.getUsuarios()
      ])

      // Para cada multa, buscar informações do usuário e livro
      const multasComDetalhes = await Promise.all(
        multasRes.data.map(async (multa) => {
          try {
            const [usuarioRes, livroRes, emprestimoRes] = await Promise.all([
              apiService.getUsuario(multa.usuario_id),
              apiService.getLivro(multa.livro_id),
              apiService.getEmprestimo(multa.emprestimos_id)
            ])
            return {
              ...multa,
              usuario_nome: usuarioRes.data.nome,
              livro_titulo: livroRes.data.titulo,
              data_devolucao: emprestimoRes.data.data_devolucao,
              valor_numero: parseFloat(multa.valor)
            }
          } catch (error) {
            return {
              ...multa,
              usuario_nome: 'Usuário não encontrado',
              livro_titulo: 'Livro não encontrado',
              data_devolucao: null,
              valor_numero: parseFloat(multa.valor)
            }
          }
        })
      )

      setMultas(multasComDetalhes)
      setUsuarios(usuariosRes.data)
    } catch (error) {
      toast.error('Erro ao carregar multas')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePagar = async (id) => {
    if (!window.confirm('Confirmar pagamento desta multa?')) return

    try {
      await apiService.pagarMulta(id)
      toast.success('Multa paga com sucesso!')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao pagar multa')
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
      pago: '',
      usuarioId: ''
    })
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

  const calcularTotal = () => {
    return multas
      .filter(m => !m.pago)
      .reduce((total, multa) => total + multa.valor_numero, 0)
  }

  const getPagoColor = (pago) => {
    return pago 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const getPagoText = (pago) => {
    return pago ? 'Paga' : 'Em aberto'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Multas</h1>
          <p className="text-gray-600 mt-1">
            Total em aberto: <span className="font-bold text-red-600">{formatCurrency(calcularTotal())}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {multas.length} multa(s) encontrada(s)
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Pagamento</label>
            <select
              value={filters.pago}
              onChange={(e) => handleFilterChange('pago', e.target.value === '' ? '' : e.target.value === 'true')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="false">Em aberto</option>
              <option value="true">Pagas</option>
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
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Criação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {multas.map((multa) => (
                <tr key={multa.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{multa.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {multa.usuario_nome}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {multa.usuario_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {multa.livro_titulo}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {multa.livro_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(multa.valor_numero)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPagoColor(multa.pago)}`}>
                      {getPagoText(multa.pago)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {multa.data_pagamento ? formatDate(multa.data_pagamento) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(multa.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!multa.pago && (
                      <button
                        onClick={() => handlePagar(multa.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Marcar como Paga
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const emprestimoId = multa.emprestimos_id
                        navigator.clipboard.writeText(emprestimoId)
                        toast.success('ID do empréstimo copiado!')
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Copiar ID do empréstimo"
                    >
                      Copiar ID Empréstimo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {multas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma multa encontrada</p>
            </div>
          )}

          {/* Resumo */}
          {multas.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">
                    Total de multas: <strong>{multas.length}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    <span className="text-gray-600">Em aberto: </span>
                    <span className="font-bold text-red-600">{formatCurrency(calcularTotal())}</span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-gray-600">Pagas: </span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(
                        multas
                          .filter(m => m.pago)
                          .reduce((total, multa) => total + multa.valor_numero, 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Multas