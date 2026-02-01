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

  const apiService = new ApiService()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Buscar dados em paralelo
      const [usuariosRes, livrosRes, emprestimosRes, multasRes] = await Promise.all([
        apiService.getUsuarios(),
        apiService.getLivros(),
        apiService.getEmprestimos(),
        apiService.getMultas()
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
      toast.error('Erro ao carregar dados do dashboard')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
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
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livro
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
                    {new Date(emprestimo.data_emprestimo).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard