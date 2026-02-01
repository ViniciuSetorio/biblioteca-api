import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../config/api'
import UsuarioForm from '../components/forms/UsuarioForm'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState(null)

  const apiService = new ApiService()

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const response = await apiService.getUsuarios()
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
      await apiService.createUsuario(data)
      toast.success('Usuário criado com sucesso!')
      setShowForm(false)
      fetchUsuarios()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar usuário')
    }
  }

  const handleUpdate = async (id, data) => {
    try {
      await apiService.updateUsuario(id, data)
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
      await apiService.deleteUsuario(id)
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Novo Usuário
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <li key={usuario.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.nome}
                      </div>
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.cargo === 'bibliotecario' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {usuario.cargo}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{usuario.email}</div>
                    <div className="text-xs text-gray-400">
                      Cadastrado em: {new Date(usuario.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(usuario)}
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(usuario.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Usuarios