import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../config/api'
import UsuarioForm from '../components/forms/UsuarioForm'
import { 
  Search, 
  Filter, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  Eye,
  Shield,
  Mail,
  Calendar,
  MoreVertical,
  Download
} from 'lucide-react'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCargo, setSelectedCargo] = useState('')

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getUsuarios()
      setUsuarios(response.data)
    } catch (error) {
      toast.error('Erro ao carregar usuários')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data) => {
    try {
      await ApiService.createUsuario(data)
      toast.success('Usuário criado com sucesso!')
      setShowForm(false)
      fetchUsuarios()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar usuário')
    }
  }

  const handleUpdate = async (id, data) => {
    try {
      await ApiService.updateUsuario(id, data)
      toast.success('Usuário atualizado com sucesso!')
      setEditingUsuario(null)
      fetchUsuarios()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar usuário')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      await ApiService.deleteUsuario(id)
      toast.success('Usuário excluído com sucesso!')
      fetchUsuarios()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir usuário')
    }
  }

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario)
    setShowForm(true)
  }

  const filteredUsuarios = usuarios.filter(usuario => {
    if (searchTerm && !usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !usuario.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (selectedCargo && usuario.cargo !== selectedCargo) {
      return false
    }
    return true
  })

  const stats = {
    total: usuarios.length,
    bibliotecarios: usuarios.filter(u => u.cargo === 'bibliotecario').length,
    membros: usuarios.filter(u => u.cargo === 'membro').length,
    novos: usuarios.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usuários</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie os usuários do sistema bibliotecário
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-vue-green to-vue-blue text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Novo Usuário</span>
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
              <Users className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bibliotecários</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.bibliotecarios}</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <Shield className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Membros</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.membros}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <Users className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Novos (30d)</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.novos}</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
              <TrendingUp className="text-yellow-600 dark:text-yellow-400" size={20} />
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
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-vue-green focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Filtros e Controles */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCargo}
              onChange={(e) => setSelectedCargo(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-vue-green focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="">Todos Cargos</option>
              <option value="membro">Membro</option>
              <option value="bibliotecario">Bibliotecário</option>
            </select>

            <button className="px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2">
              <Download size={16} />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Formulário (se aberto) */}
      {showForm && (
        <div className="animate-slideDown">
          <UsuarioForm
            usuario={editingUsuario}
            onSubmit={editingUsuario ? (data) => handleUpdate(editingUsuario.id, data) : handleCreate}
            onCancel={() => {
              setShowForm(false)
              setEditingUsuario(null)
            }}
          />
        </div>
      )}

      {/* Lista de Usuários */}
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
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cadastro
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
                {filteredUsuarios.map((usuario) => (
                  <tr 
                    key={usuario.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-vue-green to-vue-blue rounded-full flex items-center justify-center text-white font-bold">
                            {usuario.nome.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-200">
                            {usuario.nome}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: #{usuario.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Mail size={14} className="text-gray-400" />
                        <div className="text-gray-900 dark:text-gray-200">
                          {usuario.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        usuario.cargo === 'bibliotecario'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {usuario.cargo === 'bibliotecario' ? (
                          <>
                            <Shield className="mr-1" size={12} />
                            Bibliotecário
                          </>
                        ) : (
                          <>
                            <Users className="mr-1" size={12} />
                            Membro
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} className="text-gray-400" />
                          <span className="text-gray-900 dark:text-gray-200">
                            {new Date(usuario.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {new Date(usuario.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                        Ativo
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsuarios.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Users className="text-gray-400 dark:text-gray-500" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Tente ajustar seus filtros de busca' : 'Comece adicionando um novo usuário'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Usuarios