import { useState } from 'react'
import { useForm } from 'react-hook-form'

const EmprestimoForm = ({ usuarios, livros, onSubmit, onCancel }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)

  const livroId = watch('livroId')
  const livroSelecionado = livros.find(l => l.id === parseInt(livroId))

  const handleFormSubmit = async (data) => {
    setLoading(true)
    try {
      await onSubmit({
        usuarioId: parseInt(data.usuarioId),
        livroId: parseInt(data.livroId)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Novo Empréstimo</h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="usuarioId">
            Usuário *
          </label>
          <select
            id="usuarioId"
            {...register('usuarioId', { required: 'Selecione um usuário' })}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.usuarioId ? 'border-red-500' : ''
            }`}
          >
            <option value="">Selecione um usuário...</option>
            {usuarios
              .filter(u => u.cargo === 'membro')
              .map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome} ({usuario.email})
                </option>
              ))
            }
          </select>
          {errors.usuarioId && (
            <p className="text-red-500 text-xs italic mt-1">{errors.usuarioId.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="livroId">
            Livro *
          </label>
          <select
            id="livroId"
            {...register('livroId', { required: 'Selecione um livro' })}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.livroId ? 'border-red-500' : ''
            }`}
          >
            <option value="">Selecione um livro...</option>
            {livros
              .filter(l => l.copias_disponiveis > 0)
              .map(livro => (
                <option key={livro.id} value={livro.id}>
                  {livro.titulo} - {livro.autor} ({livro.copias_disponiveis} cópias)
                </option>
              ))
            }
          </select>
          {errors.livroId && (
            <p className="text-red-500 text-xs italic mt-1">{errors.livroId.message}</p>
          )}
        </div>

        {livroSelecionado && (
          <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Informações do Livro:</h3>
            <div className="text-sm text-blue-700">
              <p><strong>Título:</strong> {livroSelecionado.titulo}</p>
              <p><strong>Autor:</strong> {livroSelecionado.autor}</p>
              <p><strong>ISBN:</strong> {livroSelecionado.isbn || 'N/A'}</p>
              <p><strong>Cópias disponíveis:</strong> {livroSelecionado.copias_disponiveis}</p>
              {livroSelecionado.publicado_em && (
                <p><strong>Publicado em:</strong> {new Date(livroSelecionado.publicado_em).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Empréstimo'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default EmprestimoForm