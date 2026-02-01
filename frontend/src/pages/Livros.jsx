import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../config/api'
import LivroForm from '../components/forms/LivroForm'

const Livros = () => {
  const [livros, setLivros] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLivro, setEditingLivro] = useState(null)

  const apiService = new ApiService()

  useEffect(() => {
    fetchLivros()
  }, [])

 const fetchLivros = async () => {
  try {
    setLoading(true)
    const [livrosRes, usuariosRes] = await Promise.all([
      apiService.getLivros(),
      apiService.getUsuarios()
    ])
    setLivros(livrosRes.data)
    setUsuarios(usuariosRes.data)
  } catch (error) {
    toast.error('Erro ao carregar livros')
    console.error(error)
  } finally {
    setLoading(false)
  }
}

{showForm && (
  <div className="mb-8">
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

  const handleCreate = async (data) => {
    try {
      await apiService.createLivro(data)
      toast.success('Livro criado com sucesso!')
      setShowForm(false)
      fetchLivros()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar livro')
    }
  }

  const handleUpdate = async (id, data) => {
    try {
      await apiService.updateLivro(id, data)
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
      await apiService.deleteLivro(id)
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Livros</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Novo Livro
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <LivroForm
            livro={editingLivro}
            onSubmit={editingLivro ? (data) => handleUpdate(editingLivro.id, data) : handleCreate}
            onCancel={() => {
              setShowForm(false)
              setEditingLivro(null)
            }}
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
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISBN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cópias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publicado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {livros.map((livro) => (
                <tr key={livro.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{livro.titulo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{livro.autor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{livro.isbn || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      livro.copias_disponiveis > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {livro.copias_disponiveis} disponíveis
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {livro.publicado_em ? new Date(livro.publicado_em).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(livro)}
                      className="text-yellow-600 hover:text-yellow-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(livro.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Livros