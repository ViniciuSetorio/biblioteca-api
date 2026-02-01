import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

const LivroForm = ({ livro, usuarios, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: livro || {
      titulo: '',
      autor: '',
      isbn: '',
      publicado_em: '',
      criado_por: '',
      copias_disponiveis: 1
    }
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!usuarios) {
      fetchUsuarios()
    }
  }, [])

  const fetchUsuarios = async () => {
    try {
      // Em um caso real, você buscaria os usuários aqui
      // Por enquanto, vamos assumir que os usuários são passados como prop
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }

  const handleFormSubmit = async (data) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">
        {livro ? 'Editar Livro' : 'Novo Livro'}
      </h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titulo">
            Título *
          </label>
          <input
            id="titulo"
            type="text"
            {...register('titulo', { required: 'Título é obrigatório' })}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.titulo ? 'border-red-500' : ''
            }`}
            placeholder="Digite o título do livro"
          />
          {errors.titulo && (
            <p className="text-red-500 text-xs italic mt-1">{errors.titulo.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="autor">
            Autor *
          </label>
          <input
            id="autor"
            type="text"
            {...register('autor', { required: 'Autor é obrigatório' })}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.autor ? 'border-red-500' : ''
            }`}
            placeholder="Digite o nome do autor"
          />
          {errors.autor && (
            <p className="text-red-500 text-xs italic mt-1">{errors.autor.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isbn">
            ISBN
          </label>
          <input
            id="isbn"
            type="text"
            {...register('isbn')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Ex: 978-85-333-0227-3"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="publicado_em">
            Data de Publicação
          </label>
          <input
            id="publicado_em"
            type="date"
            {...register('publicado_em')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="criado_por">
            Criado por (Bibliotecário)
          </label>
          <select
            id="criado_por"
            {...register('criado_por', { valueAsNumber: true })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Selecione um bibliotecário...</option>
            {usuarios && usuarios
              .filter(u => u.cargo === 'bibliotecario')
              .map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome} ({usuario.email})
                </option>
              ))
            }
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="copias_disponiveis">
            Cópias Disponíveis *
          </label>
          <input
            id="copias_disponiveis"
            type="number"
            min="0"
            {...register('copias_disponiveis', { 
              required: 'Número de cópias é obrigatório',
              min: { value: 0, message: 'Não pode ser negativo' },
              valueAsNumber: true
            })}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.copias_disponiveis ? 'border-red-500' : ''
            }`}
            placeholder="0"
          />
          {errors.copias_disponiveis && (
            <p className="text-red-500 text-xs italic mt-1">{errors.copias_disponiveis.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Salvando...' : livro ? 'Atualizar' : 'Criar'}
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

export default LivroForm