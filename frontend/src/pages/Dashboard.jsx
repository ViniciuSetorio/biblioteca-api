import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../config/api'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  RefreshCw
} from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    livros: 0,
    emprestimosAtivos: 0,
    emprestimosTotal: 0,
    multasAbertas: 0,
    multasTotal: 0,
    reservasAtivas: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentEmprestimos, setRecentEmprestimos] = useState([])
  const [backendStatus, setBackendStatus] = useState('checking')
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Testar conexão com backend
      const connectionTest = await ApiService.testConnection()
      
      if (!connectionTest.success) {
        setBackendStatus('error')
        toast.error('Backend não está respondendo')
        setLoading(false)
        return
      }
      
      setBackendStatus('ok')
      
      // Buscar dados reais em paralelo
      const [usuariosRes, livrosRes, emprestimosRes, multasRes, reservasRes] = await Promise.all([
        ApiService.getUsuarios(),
        ApiService.getLivros(),
        ApiService.getEmprestimos(),
        ApiService.getMultas(),
        ApiService.getReservas()
      ])

      // Calcular estatísticas reais
      const usuarios = usuariosRes.data || []
      const livros = livrosRes.data || []
      const emprestimos = emprestimosRes.data || []
      const multas = multasRes.data || []
      const reservas = reservasRes.data || []

      // Estatísticas calculadas a partir dos dados reais
      const emprestimosAtivos = emprestimos.filter(e => e.status === 'ativo').length
      const multasAbertas = multas.filter(m => !m.pago).length
      const reservasAtivas = reservas.filter(r => r.status === 'ativa').length
      
      // Livros mais populares (com mais empréstimos)
      const livrosComEmprestimos = {}
      emprestimos.forEach(emp => {
        const livroId = emp.livro_id
        livrosComEmprestimos[livroId] = (livrosComEmprestimos[livroId] || 0) + 1
      })
      
      // Ordenar por quantidade de empréstimos
      const livrosPopulares = Object.entries(livrosComEmprestimos)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([livroId, count]) => {
          const livro = livros.find(l => l.id == livroId)
          return {
            titulo: livro?.titulo || `Livro #${livroId}`,
            emprestimos: count
          }
        })

      setStats({
        usuarios: usuarios.length,
        livros: livros.length,
        emprestimosAtivos,
        emprestimosTotal: emprestimos.length,
        multasAbertas,
        multasTotal: multas.length,
        reservasAtivas,
        livrosPopulares
      })

      // Últimos empréstimos (reais)
      const recent = emprestimos
        .sort((a, b) => new Date(b.data_emprestimo || b.created_at) - new Date(a.data_emprestimo || a.created_at))
        .slice(0, 5)
        .map(emp => ({
          ...emp,
          data_formatada: emp.data_emprestimo ? new Date(emp.data_emprestimo).toLocaleDateString('pt-BR') : 'N/A'
        }))

      setRecentEmprestimos(recent)
      setLastUpdate(new Date())
      
    } catch (error) {
      console.error('Erro no dashboard:', error)
      toast.error('Erro ao carregar dados do dashboard')
      setBackendStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp size={14} className={`${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-xs ml-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend > 0 ? '+' : ''}{trend}% este mês
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-vue-green border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
          {backendStatus === 'checking' ? 'Conectando ao backend...' : 'Carregando dados...'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral do sistema bibliotecário
            {lastUpdate && (
              <span className="ml-2 text-xs">
                (Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
            backendStatus === 'ok' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {backendStatus === 'ok' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            <span className="text-sm font-medium">
              {backendStatus === 'ok' ? 'Backend Online' : 'Backend Offline'}
            </span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-gradient-to-r from-vue-green to-vue-blue text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Usuários"
          value={stats.usuarios}
          icon={<Users className="text-blue-500" size={24} />}
          color="bg-blue-500"
          subtitle={`Total cadastrados`}
        />
        <StatCard
          title="Livros"
          value={stats.livros}
          icon={<BookOpen className="text-vue-green" size={24} />}
          color="bg-vue-green"
          subtitle={`No catálogo`}
        />
        <StatCard
          title="Empréstimos"
          value={stats.emprestimosAtivos}
          icon={<Calendar className="text-yellow-500" size={24} />}
          color="bg-yellow-500"
          subtitle={`${stats.emprestimosTotal} no total`}
        />
        <StatCard
          title="Multas"
          value={stats.multasAbertas}
          icon={<AlertCircle className="text-red-500" size={24} />}
          color="bg-red-500"
          subtitle={`${stats.multasTotal} no total`}
        />
      </div>

      {/* Segunda Linha de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Reservas Ativas
            </h3>
            <Clock className="text-vue-green" size={20} />
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {stats.reservasAtivas}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Livros reservados no momento
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Taxa de Ocupação
            </h3>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {stats.livros > 0 ? Math.round((stats.emprestimosAtivos / stats.livros) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Livros emprestados no momento
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Livros Disponíveis
            </h3>
            <BookOpen className="text-green-500" size={20} />
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {stats.livros - stats.emprestimosAtivos}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Para empréstimo imediato
            </p>
          </div>
        </div>
      </div>

      {/* Últimos Empréstimos e Livros Populares */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos Empréstimos */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Empréstimos Recentes
              </h3>
              <Calendar className="text-gray-400" size={20} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentEmprestimos.map((emprestimo) => (
                  <tr 
                    key={emprestimo.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-200">
                          #{emprestimo.id}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Usuário: #{emprestimo.usuario_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        emprestimo.status === 'ativo' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                          : emprestimo.status === 'atrasado' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                      }`}>
                        {emprestimo.status || 'desconhecido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200">
                        {emprestimo.data_formatada}
                      </div>
                      {emprestimo.data_prevista_devolucao && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Devolução: {new Date(emprestimo.data_prevista_devolucao).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {recentEmprestimos.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center">
                      <div className="text-gray-400 dark:text-gray-500">
                        Nenhum empréstimo registrado
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status do Sistema e Informações */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-vue-green to-vue-blue rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold mb-2">Status do Sistema</h4>
                <p className="text-sm opacity-90">
                  {backendStatus === 'ok' 
                    ? `Sistema operando normalmente com ${stats.livros} livros cadastrados`
                    : 'Problemas de conexão com o backend'
                  }
                </p>
                {lastUpdate && (
                  <p className="text-xs opacity-75 mt-2">
                    Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold mb-1">{stats.usuarios + stats.livros}</div>
                <div className="text-sm opacity-90">Recursos totais</div>
              </div>
            </div>
          </div>

          {/* Performance do Sistema */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Performance
              </h3>
              <Activity className="text-vue-green" size={20} />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Empréstimos ativos</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    {stats.emprestimosAtivos} de {stats.emprestimosTotal}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-vue-green h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stats.emprestimosTotal > 0 ? (stats.emprestimosAtivos / stats.emprestimosTotal) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Multas em aberto</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    {stats.multasAbertas} de {stats.multasTotal}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stats.multasTotal > 0 ? (stats.multasAbertas / stats.multasTotal) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Taxa de ocupação</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    {stats.livros > 0 ? Math.round((stats.emprestimosAtivos / stats.livros) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(stats.livros > 0 ? (stats.emprestimosAtivos / stats.livros) * 100 : 0, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Backend */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Informações de Conexão
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${backendStatus === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>
                  Status: {backendStatus === 'ok' ? '✅ Conectado' : '❌ Não conectado'}
                </span>
              </div>
              <p>• Backend URL: {import.meta.env.VITE_API_URL || 'http://localhost:3000'}</p>
              <p>• Total de usuários: {stats.usuarios}</p>
              <p>• Total de livros: {stats.livros}</p>
              <p>• Empréstimos ativos: {stats.emprestimosAtivos}</p>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-vue-green to-vue-blue rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 self-start md:self-center"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Atualizando...' : 'Atualizar Dados'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard