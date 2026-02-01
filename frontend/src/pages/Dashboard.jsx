import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../config/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    livros: 0,
    emprestimos: 0,
    multas: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentEmprestimos, setRecentEmprestimos] = useState([])
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Primeiro, testar se o backend está respondendo
      const connectionTest = await ApiService.testConnection()
      
      if (!connectionTest.success) {
        setBackendStatus('error')
        toast.error('Backend não está respondendo')
        setLoading(false)
        return
      }
      
      setBackendStatus('ok')
      
      // Buscar dados em paralelo
      const [usuariosRes, livrosRes, emprestimosRes, multasRes] = await Promise.all([
        ApiService.getUsuarios(),
        ApiService.getLivros(),
        ApiService.getEmprestimos(),
        ApiService.getMultas()
      ])

      setStats({
        usuarios: usuariosRes.data.length,
        livros: livrosRes.data.length,
        emprestimos: emprestimosRes.data.length,
        multas: multasRes.data.filter(m => !m.pago).length
      })

      // Últimos empréstimos
      const recent = emprestimosRes.data.slice(0, 5)
      setRecentEmprestimos(recent)
      
    } catch (error) {
      console.error('Erro no dashboard:', error)
      toast.error('Erro ao carregar dados do dashboard')
      setBackendStatus('error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">
          {backendStatus === 'checking' ? 'Conectando com backend...' : 'Carregando dados...'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm ${
            backendStatus === 'ok' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {backendStatus === 'ok' ? '✅ Backend Online' : '❌ Backend Offline'}
          </span>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            Atualizar
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600">{stats.usuarios}</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Usuários</dt>
                <dd className="text-lg font-medium text-gray-900">Total cadastrados</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-green-600">{stats.livros}</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Livros</dt>
                <dd className="text-lg font-medium text-gray-900">No catálogo</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-yellow-600">{stats.emprestimos}</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Empréstimos</dt>
                <dd className="text-lg font-medium text-gray-900">Ativos</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-red-600">{stats.multas}</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Multas</dt>
                <dd className="text-lg font-medium text-gray-900">Em aberto</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Emprestimos */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Últimos Empréstimos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livro ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Empréstimo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentEmprestimos.map((emprestimo) => (
                <tr key={emprestimo.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{emprestimo.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Usuário #{emprestimo.usuario_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Livro #{emprestimo.livro_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      emprestimo.status === 'ativo' ? 'bg-green-100 text-green-800' :
                      emprestimo.status === 'atrasado' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {emprestimo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(emprestimo.data_emprestimo).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {recentEmprestimos.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Nenhum empréstimo encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Informações de debug */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Informações de Conexão:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Backend URL: {import.meta.env.VITE_API_URL || 'http://localhost:3000'}</p>
          <p>• Status: {backendStatus === 'ok' ? '✅ Conectado' : '❌ Não conectado'}</p>
          <p>• Total de usuários: {stats.usuarios}</p>
          <p>• Total de livros: {stats.livros}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard