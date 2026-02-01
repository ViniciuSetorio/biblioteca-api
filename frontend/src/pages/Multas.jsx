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

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // CORREÇÃO: Limpar parâmetros vazios ANTES de enviar
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
      
      console.log('🔄 Buscando multas com filtros:', cleanFilters)
      
      // Buscar dados - CORREÇÃO: usar cleanFilters
      const [multasRes, usuariosRes] = await Promise.all([
        ApiService.getMultas(cleanFilters), // ← Usar cleanFilters aqui
        ApiService.getUsuarios()
      ])

      console.log('✅ Multas recebidas:', multasRes.data)

      // Simplificar os dados
      const multasSimples = multasRes.data.map(multa => ({
        ...multa,
        usuario_nome: `Usuário #${multa.usuario_id}`,
        livro_titulo: `Livro #${multa.livro_id}`,
        valor_numero: parseFloat(multa.valor) || 0
      }))

      setMultas(multasSimples)
      setUsuarios(usuariosRes.data)
      
    } catch (error) {
      console.error('❌ Erro ao carregar multas:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      
      // Mensagem de erro amigável
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Erro ao carregar multas'
      toast.error(`Multas: ${errorMsg}`)
      
      // Mostrar dados vazios
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
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

      {/* Filtros - CORRIGIDOS */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Pagamento</label>
            <select
              value={filters.pago}
              onChange={(e) => handleFilterChange('pago', e.target.value)}
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
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </option>
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
          {multas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma multa encontrada</p>
            </div>
          ) : (
            <>
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
                            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm mr-2"
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
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                          title="Copiar ID do empréstimo"
                        >
                          Copiar ID
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Resumo */}
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
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Multas