import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../config/api'
import LivroForm from '../components/forms/LivroForm'
import { 
  Search, 
  Filter, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  Eye,
  AlertCircle,
  CheckCircle,
  Download,
  MoreVertical
} from 'lucide-react'

const Livros = () => {
  const [livros, setLivros] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLivro, setEditingLivro] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('')
  const [viewMode, setViewMode] = useState('grid') // grid or list

  useEffect(() => {
    fetchLivros()
  }, [])

  const fetchLivros = async () => {
    try {
      setLoading(true)
      const [livrosRes, usuariosRes] = await Promise.all([
        ApiService.getLivros(),
        ApiService.getUsuarios()
      ])
      setLivros(livrosRes.data)
      setUsuarios(usuariosRes.data)
    } catch (error) {
      toast.error('Erro ao carregar livros')
      console.error('Erro ao carregar livros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data) => {
    try {
      await ApiService.createLivro(data)
      toast.success('Livro criado com sucesso!')
      setShowForm(false)
      fetchLivros()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar livro')
    }
  }

  const handleUpdate = async (id, data) => {
    try {
      await ApiService.updateLivro(id, data)
      toast.success('Livro atualizado com sucesso!')
      setEditingLivro(null)
      fetchLivros()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar livro')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este livro?')) return

    try {
      await ApiService.deleteLivro(id)
      toast.success('Livro excluído com sucesso!')
      fetchLivros()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir livro')
    }
  }

  const handleEdit = (livro) => {
    setEditingLivro(livro)
    setShowForm(true)
  }

  const filteredLivros = livros.filter(livro => {
    if (searchTerm && !livro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !livro.autor.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (selectedCategoria && livro.categoria !== selectedCategoria) {
      return false
    }
    return true
  })

  const stats = {
    total: livros.length,
    disponiveis: livros.filter(l => l.copias_disponiveis > 0).length,
    emprestados: livros.filter(l => l.copias_disponiveis === 0).length,
    novos: livros.filter(l => new Date(l.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
  }

  const categorias = [...new Set(livros.map(l => l.categoria).filter(Boolean))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Livros</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie o catálogo de livros da biblioteca
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-vue-green to-vue-blue text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Novo Livro</span>
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
              <BookOpen className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Disponíveis</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.disponiveis}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Emprestados</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.emprestados}</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Novos (30d)</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.novos}</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <TrendingUp className="text-purple-600 dark:text-purple-400" size={20} />
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
                placeholder="Buscar por título, autor ou ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-vue-green focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Filtros e Controles */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-vue-green focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="">Todas Categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <div className="flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

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
          <LivroForm
            livro={editingLivro}
            usuarios={usuarios}
            onSubmit={editingLivro ? (data) => handleUpdate(editingLivro.id, data) : handleCreate}
            onCancel={() => {
              setShowForm(false)
              setEditingLivro(null)
            }}
          />
        </div>
      )}

      {/* Lista de Livros */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-vue-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLivros.map((livro) => (
            <div 
              key={livro.id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover-card group"
            >
              {/* Cabeçalho do Card */}
              <div className="bg-gradient-to-r from-vue-green/10 to-vue-blue/10 dark:from-vue-green/20 dark:to-vue-blue/20 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                      {livro.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {livro.autor}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    livro.copias_disponiveis > 0 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {livro.copias_disponiveis} cópias
                  </div>
                </div>
              </div>

              {/* Corpo do Card */}
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">ISBN:</span>
                    <span className="text-gray-900 dark:text-gray-200 font-mono">
                      {livro.isbn || 'N/A'}
                    </span>
                  </div>
                  {livro.publicado_em && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Publicado:</span>
                      <span className="text-gray-900 dark:text-gray-200">
                        {new Date(livro.publicado_em).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {livro.categoria && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Categoria:</span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 text-xs">
                        {livro.categoria}
                      </span>
                    </div>
                  )}
                </div>

                {/* Ações do Card */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(livro)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(livro.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Livro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cópias
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Publicado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLivros.map((livro) => (
                  <tr key={livro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-200">
                          {livro.titulo}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {livro.isbn || 'Sem ISBN'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-gray-200">
                        {livro.autor}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-200">
                        {livro.copias_disponiveis}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        livro.copias_disponiveis > 0 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {livro.copias_disponiveis > 0 ? 'Disponível' : 'Indisponível'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {livro.publicado_em ? new Date(livro.publicado_em).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(livro)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(livro.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredLivros.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="text-gray-400 dark:text-gray-500" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                Nenhum livro encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Tente ajustar seus filtros de busca' : 'Comece adicionando um novo livro'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Livros